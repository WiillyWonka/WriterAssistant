from __future__ import annotations

from collections.abc import AsyncIterator

from anthropic import AsyncAnthropic
from openai import AsyncOpenAI

from app.config import settings
from app.models.schemas import message_text


WRITER_SYSTEM_TEMPLATE = """Ты — AI-ассистент для писателей. Ниже приведён текущий текст документа, над которым работает автор.

<document>
{document_content}
</document>

Помогай с: развитием сюжета, стилистикой, персонажами, редактурой, генерацией идей. Отвечай на языке пользователя, если он пишет на русском — отвечай по-русски."""


def build_system_prompt(document_content: str) -> str:
    return WRITER_SYSTEM_TEMPLATE.format(
        document_content=document_content if document_content.strip() else "(документ пуст)"
    )


def anthropic_messages_from_request(messages: list[dict]) -> list[dict]:
    """Преобразует сообщения из JSON в формат Anthropic API (role + content[])."""
    out: list[dict] = []
    for m in messages:
        role = m.get("role")
        if role not in ("user", "assistant"):
            continue
        text = message_text(m)
        if not text.strip():
            continue
        out.append({"role": role, "content": text})
    return out


def openai_messages_from_request(messages: list[dict]) -> list[dict]:
    """Сообщения user/assistant для Chat Completions (без system — он отдельно)."""
    out: list[dict] = []
    for m in messages:
        role = m.get("role")
        if role not in ("user", "assistant"):
            continue
        text = message_text(m)
        if not text.strip():
            continue
        out.append({"role": role, "content": text})
    return out


def normalize_provider(provider: str | None) -> str:
    raw = (provider or settings.llm_provider or "openai").strip().lower()
    if raw in ("claude", "anthropic"):
        return "anthropic"
    if raw in ("openai", "chatgpt", "gpt"):
        return "openai"
    return raw


async def stream_claude_reply(
    *,
    messages: list[dict],
    document_content: str,
    model: str | None = None,
) -> AsyncIterator[str]:
    """Стримит текстовые чанки ответа ассистента (plain text для Text Stream Protocol)."""
    if not settings.anthropic_api_key:
        yield "Ошибка: не задан ANTHROPIC_API_KEY в переменных окружения бэкенда."
        return

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    system = build_system_prompt(document_content)
    api_messages = anthropic_messages_from_request(messages)

    if not api_messages:
        yield "Нет сообщений для обработки."
        return

    async with client.messages.stream(
        model=model or settings.anthropic_model,
        max_tokens=8192,
        system=system,
        messages=api_messages,
    ) as stream:
        async for text in stream.text_stream:
            if text:
                yield text


async def stream_openai_reply(
    *,
    messages: list[dict],
    document_content: str,
    model: str | None = None,
) -> AsyncIterator[str]:
    if not settings.openai_api_key:
        yield "Ошибка: не задан OPENAI_API_KEY в переменных окружения бэкенда."
        return

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    system = build_system_prompt(document_content)
    api_messages = openai_messages_from_request(messages)
    if not api_messages:
        yield "Нет сообщений для обработки."
        return

    chat_messages: list[dict] = [
        {"role": "system", "content": system},
        *api_messages,
    ]

    stream = await client.chat.completions.create(
        model=model or settings.openai_model,
        messages=chat_messages,
        stream=True,
    )
    async for chunk in stream:
        choice = chunk.choices[0] if chunk.choices else None
        if not choice:
            continue
        delta = choice.delta.content
        if delta:
            yield delta


async def stream_writer_reply(
    *,
    messages: list[dict],
    document_content: str,
    provider: str | None = None,
    model: str | None = None,
) -> AsyncIterator[str]:
    prov = normalize_provider(provider)
    if prov == "openai":
        async for text in stream_openai_reply(
            messages=messages,
            document_content=document_content,
            model=model,
        ):
            yield text
    elif prov == "anthropic":
        async for text in stream_claude_reply(
            messages=messages,
            document_content=document_content,
            model=model,
        ):
            yield text
    else:
        yield (
            f"Ошибка: неизвестный провайдер «{prov}». "
            "Используйте anthropic (Claude) или openai (ChatGPT)."
        )
