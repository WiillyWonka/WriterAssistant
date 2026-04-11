from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.schemas import ChatRequest
from app.services.agent import stream_claude_reply

router = APIRouter()


async def text_stream(body: ChatRequest) -> AsyncIterator[bytes]:
    """Plain text stream для TextStreamChatTransport (AI SDK)."""
    try:
        async for chunk in stream_claude_reply(
            messages=body.messages,
            document_content=body.document_content,
        ):
            yield chunk.encode("utf-8")
    except Exception as e:  # noqa: BLE001 — отдаём текст ошибки в поток
        yield f"\n\n[Ошибка: {e}]".encode("utf-8")


@router.post("/chat")
async def chat(body: ChatRequest) -> StreamingResponse:
    return StreamingResponse(
        text_stream(body),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
