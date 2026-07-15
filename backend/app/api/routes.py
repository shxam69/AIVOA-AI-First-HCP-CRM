from typing import Any, Dict

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents.graph import run_agent
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import HCPInteraction


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

@router.get("/interactions")
def get_interactions(db: Session = Depends(get_db)):
    records = db.query(HCPInteraction).order_by(HCPInteraction.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "hcp_name": r.hcp_name,
            "interaction_type": r.interaction_type,
            "interaction_date": r.interaction_date,
            "interaction_time": r.interaction_time,
            "attendees": r.attendees,
            "topics_discussed": r.topics_discussed,
            "materials_shared": r.materials_shared,
            "samples_distributed": r.samples_distributed,
            "sentiment": r.sentiment,
            "outcomes": r.outcomes,
            "follow_up_actions": r.follow_up_actions,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }
        for r in records
    ]