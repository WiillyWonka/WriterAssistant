from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.db import get_session
from app.models.orm import ChatMessage, Document, User

router = APIRouter()

DEFAULT_TITLE = "Без названия"
DEFAULT_CONTENT = (
    "# Черновик\n\n"
    "Начните писать здесь. Текст из редактора передаётся ассистенту в контексте.\n"
)


def _message_to_ui(m: ChatMessage) -> dict:
    return {
        "id": str(m.id),
        "role": m.role,
        "parts": [{"type": "text", "text": m.content}],
    }


@router.get("/session")
async def get_session_state(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    result = await session.execute(
        select(Document)
        .where(Document.user_id == user.id)
        .order_by(Document.updated_at.desc())
        .limit(1)
    )
    doc = result.scalar_one_or_none()
    if doc is None:
        doc = Document(user_id=user.id, title=DEFAULT_TITLE, content=DEFAULT_CONTENT)
        session.add(doc)
        await session.commit()
        await session.refresh(doc)
        messages: list[dict] = []
    else:
        mq = await session.execute(
            select(ChatMessage)
            .where(ChatMessage.document_id == doc.id)
            .order_by(ChatMessage.created_at.asc())
        )
        messages = [_message_to_ui(m) for m in mq.scalars().all()]

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
        },
        "document": {
            "id": str(doc.id),
            "title": doc.title,
            "content": doc.content,
            "updated_at": doc.updated_at.isoformat() if doc.updated_at else None,
        },
        "messages": messages,
    }
