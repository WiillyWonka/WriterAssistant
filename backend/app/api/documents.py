from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.db import get_session
from app.models.orm import ChatMessage, Document, User

router = APIRouter()


class DocumentCreate(BaseModel):
    title: str = Field(default="Без названия", max_length=512)
    content: str = ""


class DocumentPatch(BaseModel):
    title: str | None = Field(default=None, max_length=512)
    content: str | None = None


async def _get_owned_document(
    session: AsyncSession, user: User, document_id: uuid.UUID
) -> Document:
    result = await session.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == user.id,
        )
    )
    doc = result.scalar_one_or_none()
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc


@router.get("/documents")
async def list_documents(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, list[dict[str, Any]]]:
    result = await session.execute(
        select(Document)
        .where(Document.user_id == user.id)
        .order_by(Document.updated_at.desc())
    )
    docs = result.scalars().all()
    return {
        "documents": [
            {
                "id": str(d.id),
                "title": d.title,
                "updated_at": d.updated_at.isoformat() if d.updated_at else None,
            }
            for d in docs
        ]
    }


@router.post("/documents", status_code=status.HTTP_201_CREATED)
async def create_document(
    body: DocumentCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    doc = Document(user_id=user.id, title=body.title, content=body.content)
    session.add(doc)
    await session.commit()
    await session.refresh(doc)
    return {
        "id": str(doc.id),
        "title": doc.title,
        "content": doc.content,
        "updated_at": doc.updated_at.isoformat() if doc.updated_at else None,
    }


@router.patch("/documents/{document_id}")
async def patch_document(
    document_id: uuid.UUID,
    body: DocumentPatch,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    doc = await _get_owned_document(session, user, document_id)
    if body.title is not None:
        doc.title = body.title
    if body.content is not None:
        doc.content = body.content
    await session.commit()
    await session.refresh(doc)
    return {
        "id": str(doc.id),
        "title": doc.title,
        "content": doc.content,
        "updated_at": doc.updated_at.isoformat() if doc.updated_at else None,
    }


@router.get("/documents/{document_id}/messages")
async def list_document_messages(
    document_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, list[dict[str, Any]]]:
    await _get_owned_document(session, user, document_id)
    mq = await session.execute(
        select(ChatMessage)
        .where(ChatMessage.document_id == document_id)
        .order_by(ChatMessage.created_at.asc())
    )
    rows = mq.scalars().all()
    return {
        "messages": [
            {
                "id": str(m.id),
                "role": m.role,
                "parts": [{"type": "text", "text": m.content}],
            }
            for m in rows
        ]
    }
