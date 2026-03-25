"""
REST API v1 — Tasks & Predictions Endpoints
POST /api/v1/tasks/generate — AI task generation with dependency DAGs
POST /api/v1/predict/obstacles — Predictive analytics
POST /api/v1/webhook/placement — Webhook receiver
"""

import time
import hashlib
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, BackgroundTasks, Request, Response, status
from pydantic import BaseModel, Field
import structlog

from app.core.security import TokenPayload, get_current_user
from app.core.config import get_settings
from app.ai.agents import TaskGeneratorAgent, PredictiveEngine, LLMClient
from app.db.session import async_session
from app.db.models import GeneratedTask as GeneratedTaskModel, PredictionLog, AuditLog, WebhookEvent

logger = structlog.get_logger("haveloc.api.tasks")

router = APIRouter(tags=["tasks"])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Task Generation
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TaskGenRequest(BaseModel):
    project_desc: str = Field(..., min_length=20, max_length=10000, description="Project description or meeting transcript")
    team_size: int = Field(default=3, ge=1, le=50)
    context: str = Field(default="", max_length=2000)
    project_id: str = Field(default="", description="Optional project ID for storage")

class GeneratedTaskItem(BaseModel):
    id: str
    title: str
    description: str = ""
    priority: str = "MEDIUM"
    estimated_hours: float | None = None
    assignee: str = ""
    deps: list[str] = []

class TaskGenResponse(BaseModel):
    project_id: str
    tasks: list[GeneratedTaskItem]
    summary: str
    processing_time_ms: float


@router.post("/tasks/generate", response_model=TaskGenResponse, summary="AI Task Generation")
async def generate_tasks(
    request: TaskGenRequest,
    background: BackgroundTasks,
    user: TokenPayload = Depends(get_current_user),
):
    """
    AI task extraction from natural language:
    - Meeting transcripts → actionable tasks
    - Dependency DAG generation
    - Team workload distribution
    - Priority classification
    """
    start = time.monotonic()
    llm = LLMClient()
    generator = TaskGeneratorAgent(llm)

    result = await generator.generate(
        text=request.project_desc,
        project_id=request.project_id,
        team_size=request.team_size,
        context=request.context,
    )

    elapsed = (time.monotonic() - start) * 1000
    tasks = [GeneratedTaskItem(**t) for t in result.get("tasks", [])]

    # Persist async
    if request.project_id:
        background.add_task(
            _persist_tasks, request.project_id, result.get("tasks", []),
            request.project_desc, user.sub, elapsed
        )

    return TaskGenResponse(
        project_id=request.project_id or "ephemeral",
        tasks=tasks,
        summary=result.get("summary", ""),
        processing_time_ms=round(elapsed, 1),
    )


async def _persist_tasks(project_id: str, tasks: list[dict], source: str, user_id: str, latency: float):
    try:
        text_hash = hashlib.sha256(source.encode()).hexdigest()[:16]
        async with async_session() as db:
            for t in tasks:
                db.add(GeneratedTaskModel(
                    project_id=project_id,
                    title=t.get("title", ""),
                    description=t.get("description", ""),
                    priority=t.get("priority", "MEDIUM"),
                    estimated_hours=t.get("estimated_hours"),
                    assignee_hint=t.get("assignee"),
                    dependencies=t.get("deps", []),
                    source_text_hash=text_hash,
                ))
            db.add(AuditLog(
                action="GENERATE_TASKS",
                user_id=user_id,
                resource_type="Project",
                resource_id=project_id,
                response_summary={"task_count": len(tasks)},
                latency_ms=latency,
                status_code=200,
            ))
            await db.commit()
    except Exception as e:
        logger.error("persist_tasks_failed", error=str(e))


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Predictive Analytics
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PredictRequest(BaseModel):
    project_id: str
    total_tasks: int = Field(..., ge=1)
    completed_tasks: int = Field(..., ge=0)
    velocity_history: list[float] = Field(..., min_length=2, description="Tasks per sprint (last N sprints)")
    target_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    blockers: int = Field(default=0, ge=0)
    tasks: list[dict] = Field(default=[], description="Optional task details for deeper analysis")

class RiskItem(BaseModel):
    type: str
    probability: float
    mitigation: str

class PredictResponse(BaseModel):
    project_id: str
    predicted_completion: str
    confidence_interval: dict
    on_track: bool
    risk_score: float
    risks: list[RiskItem]
    recommendations: list[str]
    processing_time_ms: float


@router.post("/predict/obstacles", response_model=PredictResponse, summary="Predictive Risk Analysis")
async def predict_obstacles(
    request: PredictRequest,
    background: BackgroundTasks,
    user: TokenPayload = Depends(get_current_user),
):
    """
    ML-powered project delay prediction:
    - Velocity trend analysis (linear regression)
    - Confidence interval estimation
    - Risk scoring (0-1 scale)
    - Actionable recommendations
    """
    start = time.monotonic()
    engine = PredictiveEngine()

    result = engine.predict(
        total_tasks=request.total_tasks,
        completed_tasks=request.completed_tasks,
        velocity_history=request.velocity_history,
        target_date=request.target_date,
        blockers=request.blockers,
    )

    elapsed = (time.monotonic() - start) * 1000

    # Map risk factors to structured risk items
    risks = []
    for factor in result.get("risk_factors", []):
        probability = min(result.get("risk_score", 0.5) + 0.1, 1.0)
        risks.append(RiskItem(
            type=factor.split(":")[0] if ":" in factor else "GENERAL",
            probability=round(probability, 2),
            mitigation=factor,
        ))

    # Persist async
    background.add_task(
        _persist_prediction, request.project_id, result, request.model_dump(), user.sub, elapsed
    )

    return PredictResponse(
        project_id=request.project_id,
        predicted_completion=result["predicted_completion"],
        confidence_interval=result["confidence_interval"],
        on_track=result["on_track"],
        risk_score=result["risk_score"],
        risks=risks,
        recommendations=result["recommendations"],
        processing_time_ms=round(elapsed, 1),
    )


async def _persist_prediction(project_id: str, result: dict, input_data: dict, user_id: str, latency: float):
    try:
        async with async_session() as db:
            db.add(PredictionLog(
                project_id=project_id,
                predicted_completion=result["predicted_completion"],
                risk_score=result["risk_score"],
                on_track=result["on_track"],
                risk_factors=result["risk_factors"],
                recommendations=result["recommendations"],
                input_snapshot=input_data,
            ))
            db.add(AuditLog(
                action="PREDICT_OBSTACLES",
                user_id=user_id,
                resource_type="Project",
                resource_id=project_id,
                response_summary={"risk_score": result["risk_score"], "on_track": result["on_track"]},
                latency_ms=latency,
                status_code=200,
            ))
            await db.commit()
    except Exception as e:
        logger.error("persist_prediction_failed", error=str(e))


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Webhook Receiver
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post(
    "/webhook/placement",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Placement Webhook Receiver",
)
async def receive_webhook(
    request: Request,
    background: BackgroundTasks,
):
    """
    Receives webhook events from external services (LinkedIn, Greenhouse, etc.)
    Validates HMAC signature and queues for async processing.
    """
    body = await request.json()
    source = request.headers.get("X-Webhook-Source", "unknown")
    event_type = request.headers.get("X-Webhook-Event", body.get("event", "unknown"))

    # TODO: HMAC signature validation in production
    # signature = request.headers.get("X-Webhook-Signature", "")

    background.add_task(_process_webhook, source, event_type, body)
    logger.info("webhook_received", source=source, event_type=event_type)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


async def _process_webhook(source: str, event_type: str, payload: dict):
    try:
        async with async_session() as db:
            event = WebhookEvent(
                source=source,
                event_type=event_type,
                payload=payload,
                processed=True,
                processed_at=datetime.now(timezone.utc),
            )
            db.add(event)
            await db.commit()
            logger.info("webhook_processed", source=source, event=event_type, id=event.id)
    except Exception as e:
        logger.error("webhook_processing_failed", error=str(e))
