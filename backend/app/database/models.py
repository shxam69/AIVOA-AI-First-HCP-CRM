from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database.database import Base


class HCPInteraction(Base):
    __tablename__ = "hcp_interactions"

    id = Column(Integer, primary_key=True, index=True)

    hcp_name = Column(String(255), nullable=False)

    interaction_type = Column(
        String(100),
        nullable=False,
        default="Meeting",
    )

    interaction_date = Column(Date, nullable=True)

    interaction_time = Column(String(20), nullable=True)

    attendees = Column(Text, nullable=True)

    topics_discussed = Column(Text, nullable=True)

    materials_shared = Column(Text, nullable=True)

    samples_distributed = Column(Text, nullable=True)

    sentiment = Column(String(50), nullable=True)

    outcomes = Column(Text, nullable=True)

    follow_up_actions = Column(Text, nullable=True)

    is_saved = Column(Boolean, default=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )