from typing import Any, Dict

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents.graph import run_agent


router = APIRouter(prefix="/api", tags=["AI Interaction"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    interaction: Dict[str, Any] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    reply: str
    interaction: Dict[str, Any]
    active_tool: str
    saved_interaction_id: int | None = None


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    return run_agent(
        message=request.message,
        interaction=request.interaction,
    )