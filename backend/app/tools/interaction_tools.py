import json
from datetime import date, timedelta
from typing import Optional


from langchain_core.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import HCPInteraction



WEEKDAYS = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}

def resolve_relative_weekday(text: str) -> str:
    if not text:
        return text

    today = date.today()
    resolved_text = text.lower()
    changed = False

    if "tomorrow" in resolved_text:
        tomorrow = today + timedelta(days=1)
        resolved_text = resolved_text.replace("tomorrow", tomorrow.isoformat())
        changed = True

    if "today" in resolved_text:
        resolved_text = resolved_text.replace("today", today.isoformat())
        changed = True

    for weekday_name, target_weekday in WEEKDAYS.items():
        # "last <weekday>"
        phrase_last = f"last {weekday_name}"
        if phrase_last in resolved_text:
            days_behind = (today.weekday() - target_weekday) % 7
            if days_behind == 0:
                days_behind = 7
            resolved_date = today - timedelta(days=days_behind)
            resolved_text = resolved_text.replace(phrase_last, resolved_date.isoformat())
            changed = True

        # "this <weekday>"
        phrase_this = f"this {weekday_name}"
        if phrase_this in resolved_text:
            current_monday = today - timedelta(days=today.weekday())
            resolved_date = current_monday + timedelta(days=target_weekday)
            resolved_text = resolved_text.replace(phrase_this, resolved_date.isoformat())
            changed = True

        # "next <weekday>"
        phrase_next = f"next {weekday_name}"
        if phrase_next in resolved_text:
            days_ahead = (target_weekday - today.weekday()) % 7
            if days_ahead == 0:
                days_ahead = 7
            resolved_date = today + timedelta(days=days_ahead)
            resolved_text = resolved_text.replace(phrase_next, resolved_date.isoformat())
            changed = True

        # "upcoming <weekday>"
        phrase_upcoming = f"upcoming {weekday_name}"
        if phrase_upcoming in resolved_text:
            days_ahead = (target_weekday - today.weekday()) % 7
            if days_ahead == 0:
                days_ahead = 7
            resolved_date = today + timedelta(days=days_ahead)
            resolved_text = resolved_text.replace(phrase_upcoming, resolved_date.isoformat())
            changed = True

    return resolved_text if changed else text

class LogInteractionInput(BaseModel):
    hcp_name: Optional[str] = Field(
        default=None,
        description="Name of the healthcare professional",
    )
    interaction_type: Optional[str] = Field(
        default="Meeting",
        description="Type of interaction such as Meeting, Call, or Email",
    )
    interaction_date: Optional[str] = Field(
        default=None,
        description="Interaction date in YYYY-MM-DD format",
    )
    interaction_time: Optional[str] = Field(
        default=None,
        description="Interaction time",
    )
    attendees: Optional[str] = None
    topics_discussed: Optional[str] = None
    materials_shared: Optional[str] = None
    samples_distributed: Optional[str] = None
    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = None


class EditInteractionInput(BaseModel):
    hcp_name: Optional[str] = None
    interaction_type: Optional[str] = None
    interaction_date: Optional[str] = None
    interaction_time: Optional[str] = None
    attendees: Optional[str] = None
    topics_discussed: Optional[str] = None
    materials_shared: Optional[str] = None
    samples_distributed: Optional[str] = None
    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = None


class AddMaterialInput(BaseModel):
    materials: str = Field(
        description="Materials shared with the healthcare professional"
    )


class ScheduleFollowUpInput(BaseModel):
    follow_up_actions: str = Field(
        description="Follow-up action, task, meeting, or next step"
    )

class SaveInteractionInput(BaseModel):
    hcp_name: str
    interaction_type: Optional[str] = "Meeting"
    interaction_date: Optional[str] = None
    interaction_time: Optional[str] = None
    attendees: Optional[str] = None
    topics_discussed: Optional[str] = None
    materials_shared: Optional[str] = None
    samples_distributed: Optional[str] = None
    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = None


@tool(args_schema=LogInteractionInput)
def log_interaction(
    hcp_name: Optional[str] = None,
    interaction_type: Optional[str] = "Meeting",
    interaction_date: Optional[str] = None,
    interaction_time: Optional[str] = None,
    attendees: Optional[str] = None,
    topics_discussed: Optional[str] = None,
    materials_shared: Optional[str] = None,
    samples_distributed: Optional[str] = None,
    sentiment: Optional[str] = None,
    outcomes: Optional[str] = None,
    follow_up_actions: Optional[str] = None,
) -> str:
    """Extract and structure a new HCP interaction from natural language."""

    interaction = {
        "hcp_name": hcp_name,
        "interaction_type": interaction_type,
        "interaction_date": interaction_date,
        "interaction_time": interaction_time,
        "attendees": attendees,
        "topics_discussed": topics_discussed,
        "materials_shared": materials_shared,
        "samples_distributed": samples_distributed,
        "sentiment": sentiment,
        "outcomes": outcomes,
        "follow_up_actions": follow_up_actions,
    }

    return json.dumps(
        {
            "tool": "log_interaction",
            "updates": interaction,
        }
    )


@tool(args_schema=EditInteractionInput)
def edit_interaction(
    hcp_name: Optional[str] = None,
    interaction_type: Optional[str] = None,
    interaction_date: Optional[str] = None,
    interaction_time: Optional[str] = None,
    attendees: Optional[str] = None,
    topics_discussed: Optional[str] = None,
    materials_shared: Optional[str] = None,
    samples_distributed: Optional[str] = None,
    sentiment: Optional[str] = None,
    outcomes: Optional[str] = None,
    follow_up_actions: Optional[str] = None,
) -> str:
    """Modify only the HCP interaction fields explicitly requested by the user."""

    updates = {
        key: value
        for key, value in {
            "hcp_name": hcp_name,
            "interaction_type": interaction_type,
            "interaction_date": interaction_date,
            "interaction_time": interaction_time,
            "attendees": attendees,
            "topics_discussed": topics_discussed,
            "materials_shared": materials_shared,
            "samples_distributed": samples_distributed,
            "sentiment": sentiment,
            "outcomes": outcomes,
            "follow_up_actions": follow_up_actions,
        }.items()
        if value is not None
    }

    return json.dumps(
        {
            "tool": "edit_interaction",
            "updates": updates,
        }
    )


@tool(args_schema=AddMaterialInput)
def add_material(materials: str) -> str:
    """Add materials or samples shared during the HCP interaction."""

    return json.dumps(
        {
            "tool": "add_material",
            "updates": {
                "materials_shared": materials,
            },
        }
    )
@tool(args_schema=ScheduleFollowUpInput)
def schedule_follow_up(follow_up_actions: str) -> str:
    """Create or update follow-up actions for an HCP interaction."""
    resolved_follow_up = resolve_relative_weekday(follow_up_actions)
    return json.dumps(
        {
            "tool": "schedule_follow_up",
            "updates": {
                "follow_up_actions": resolved_follow_up,
            },
        }
    )


@tool(args_schema=SaveInteractionInput)
def save_interaction(
    hcp_name: str,
    interaction_type: Optional[str] = "Meeting",
    interaction_date: Optional[str] = None,
    interaction_time: Optional[str] = None,
    attendees: Optional[str] = None,
    topics_discussed: Optional[str] = None,
    materials_shared: Optional[str] = None,
    samples_distributed: Optional[str] = None,
    sentiment: Optional[str] = None,
    outcomes: Optional[str] = None,
    follow_up_actions: Optional[str] = None,
) -> str:
    """Save the completed HCP interaction to the SQL database."""

    db: Session = SessionLocal()

    try:
        parsed_date = None

        if interaction_date:
            parsed_date = date.fromisoformat(interaction_date)

        interaction = HCPInteraction(
            hcp_name=hcp_name,
            interaction_type=interaction_type,
            interaction_date=parsed_date,
            interaction_time=interaction_time,
            attendees=attendees,
            topics_discussed=topics_discussed,
            materials_shared=materials_shared,
            samples_distributed=samples_distributed,
            sentiment=sentiment,
            outcomes=outcomes,
            follow_up_actions=follow_up_actions,
            is_saved=True,
        )

        db.add(interaction)
        db.commit()
        db.refresh(interaction)

        return json.dumps(
            {
                "tool": "save_interaction",
                "saved": True,
                "interaction_id": interaction.id,
            }
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


TOOLS = [
    log_interaction,
    edit_interaction,
    add_material,
    schedule_follow_up,
    save_interaction,
]