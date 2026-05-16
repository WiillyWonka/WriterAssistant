from __future__ import annotations

import uuid
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.db import SessionLocal, get_session
from app.models.orm import ChatMessage, Document, User
from app.models.schemas import ChatRequest, message_text
from app.services.agent import stream_writer_reply

router = APIRouter()


def _last_user_text(messages: list[dict]) -> str:
    for msg in reversed(messages):
        if isinstance(msg, dict) and msg.get("role") == "user":
            return message_text(msg)
    return ""


async def text_stream(
    body: ChatRequest,
    user: User,
    document: Document,
    session: AsyncSession,
) -> AsyncIterator[bytes]:
    user_text = _last_user_text(body.messages)
    if user_text.strip():
        session.add(
            ChatMessage(
                document_id=document.id,
                role="user",
                content=user_text,
                provider=body.provider,
            )
        )
        await session.commit()

    collected: list[str] = []
    doc_uuid = document.id
    provider = body.provider
    try:
        async for chunk in stream_writer_reply(
            messages=body.messages,
            document_content=body.document_content,
            provider=body.provider,
            model=body.model,
        ):
            collected.append(chunk)
            yield chunk.encode("utf-8")
    except Exception as e:  # noqa: BLE001
        err = f"\n\n[Ошибка: {e}]"
        collected.append(err)
        yield err.encode("utf-8")
    finally:
        assistant_text = "".join(collected).strip()
        if assistant_text:
            async with SessionLocal() as s:
                s.add(
                    ChatMessage(
                        document_id=doc_uuid,
                        role="assistant",
                        content=assistant_text,
                        provider=provider,
                    )
                )
                await s.commit()


@router.post("/chat")
async def chat(
    body: ChatRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> StreamingResponse:
    try:
        doc_uuid = uuid.UUID(body.document_id)
    except ValueError as e:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid document_id"
        ) from e

    result = await session.execute(
        select(Document).where(Document.id == doc_uuid, Document.user_id == user.id)
    )
    document = result.scalar_one_or_none()
    if document is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, detail="Document not found for user"
        )

    return StreamingResponse(
        text_stream(body, user, document, session),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
