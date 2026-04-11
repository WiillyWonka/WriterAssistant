from collections.abc import AsyncIterator

from anthropic import AsyncAnthropic

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


async def stream_claude_reply(
    *,
    messages: list[dict],
    document_content: str,
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
        model=settings.anthropic_model,
        max_tokens=8192,
        system=system,
        messages=api_messages,
    ) as stream:
        async for text in stream.text_stream:
            if text:
                yield text
