from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class ChatMessagePart(BaseModel):
    type: str
    text: Optional[str] = None


class ChatMessage(BaseModel):
    """Сообщение в формате AI SDK UI (role + parts) или упрощённом (role + content)."""

    role: str
    parts: Optional[list[ChatMessagePart]] = None
    content: Optional[str] = None


class ChatRequest(BaseModel):
    """Тело POST /api/chat от фронтенда (useChat + document_content)."""

    model_config = ConfigDict(extra="ignore")

    messages: list[dict[str, Any]] = Field(default_factory=list)
    document_content: str = ""
    id: Optional[str] = None


def message_text(msg: dict[str, Any]) -> str:
    """Извлекает текст из UIMessage (parts) или из {role, content}."""
    if "content" in msg and msg["content"] is not None:
        c = msg["content"]
        if isinstance(c, str):
            return c
    parts = msg.get("parts")
    if isinstance(parts, list):
        chunks: list[str] = []
        for p in parts:
            if not isinstance(p, dict):
                continue
            if p.get("type") == "text" and p.get("text"):
                chunks.append(str(p["text"]))
        return "".join(chunks)
    return ""
