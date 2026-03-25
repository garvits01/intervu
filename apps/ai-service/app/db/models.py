"""
Database models — SQLAlchemy ORM with pgvector support.
Maps to the same Postgres DB used by the NestJS API.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Float, Integer, Text, Boolean, DateTime,
    JSON, ForeignKey, Index, Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from app.db.session import Base


def _utcnow():
    return datetime.now(timezone.utc)


def _uuid():
    return str(uuid.uuid4())


class MatchResult(Base):
    __tablename__ = "ai_match_results"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    drive_id = Column(String, nullable=False, index=True)
    job_id = Column(String, nullable=False, index=True)
    candidate_id = Column(String, nullable=False, index=True)
    score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False, default=0.0)
    reasoning = Column(Text, default="")
    bias_flags = Column(JSON, default=list)
    status = Column(String, default="PENDING")  # PENDING | APPROVED | REJECTED
    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    __table_args__ = (
        Index("ix_match_drive_job_candidate", "drive_id", "job_id", "candidate_id", unique=True),
    )


class GeneratedTask(Base):
    __tablename__ = "ai_generated_tasks"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    project_id = Column(String, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    priority = Column(String(10), default="MEDIUM")
    estimated_hours = Column(Float, nullable=True)
    assignee_hint = Column(String(100), nullable=True)
    due_date_hint = Column(String(50), nullable=True)
    dependencies = Column(JSON, default=list)
    source_text_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)


class PredictionLog(Base):
    __tablename__ = "ai_prediction_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    project_id = Column(String, nullable=False, index=True)
    predicted_completion = Column(String(20))
    risk_score = Column(Float)
    on_track = Column(Boolean)
    risk_factors = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    input_snapshot = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=_utcnow)


class AuditLog(Base):
    __tablename__ = "ai_audit_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    action = Column(String(50), nullable=False, index=True)
    user_id = Column(String, nullable=True)
    resource_type = Column(String(50))
    resource_id = Column(String)
    request_data = Column(JSON, default=dict)
    response_summary = Column(JSON, default=dict)
    latency_ms = Column(Float)
    status_code = Column(Integer)
    ip_address = Column(String(45))
    correlation_id = Column(String(36), index=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)

    __table_args__ = (
        Index("ix_audit_action_created", "action", "created_at"),
    )


class WebhookEvent(Base):
    __tablename__ = "ai_webhook_events"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    source = Column(String(50), nullable=False)
    event_type = Column(String(100), nullable=False)
    payload = Column(JSON, default=dict)
    processed = Column(Boolean, default=False)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)
    processed_at = Column(DateTime(timezone=True), nullable=True)
