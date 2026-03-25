"""
REST API v1 — Match Endpoint
POST /api/v1/match — AI-powered candidate-job matching
"""

import time
from typing import Annotated

from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.core.security import TokenPayload, get_current_user
from app.core.exceptions import AIServiceError
from app.ai.agents import PlacementMatcherAgent, LLMClient
from app.db.session import get_db
from app.db.models import MatchResult, AuditLog

logger = structlog.get_logger("haveloc.api.match")

router = APIRouter(prefix="/match", tags=["matching"])

# ── Models ──

class CandidateInput(BaseModel):
    id: str
    skills: list[str] = []
    education: dict | list = []
    experience: dict | list = []
    embedding: list[float] = []

class JobInput(BaseModel):
    id: str
    title: str
    requirements: list[str] = []
    skills: list[str] = []
    embedding: list[float] = []

class MatchRequest(BaseModel):
    drive_id: str = Field(..., description="Placement drive ID")
    candidates: list[CandidateInput] = Field(..., min_length=1)
    jobs: list[JobInput] = Field(..., min_length=1)
    threshold: float = Field(default=0.6, ge=0.0, le=1.0)

class MatchResultItem(BaseModel):
    job_id: str
    candidate_id: str
    score: float
    confidence: float
    reasoning: str
    bias_flags: list[str] = []

class MatchResponse(BaseModel):
    drive_id: str
    matches: list[MatchResultItem]
    total_candidates: int
    total_jobs: int
    processing_time_ms: float

class ResumeParseRequest(BaseModel):
    resume_text: str = Field(..., min_length=50, max_length=50000)

class ResumeParseResponse(BaseModel):
    skills: list[str] = []
    education: list[dict] = []
    experience: list[dict] = []
    certifications: list[str] = []
    summary: str = ""


# ── Background Tasks ──

async def _persist_matches(
    drive_id: str, matches: list[dict], user_id: str, latency: float
):
    """Store match results in DB asynchronously."""
    try:
        from app.db.session import async_session
        async with async_session() as db:
            for m in matches:
                db.add(MatchResult(
                    drive_id=drive_id,
                    job_id=m["job_id"],
                    candidate_id=m["candidate_id"],
                    score=m["score"],
                    confidence=m["confidence"],
                    reasoning=m["reasoning"],
                    bias_flags=m.get("bias_flags", []),
                ))
            db.add(AuditLog(
                action="MATCH_CANDIDATES",
                user_id=user_id,
                resource_type="PlacementDrive",
                resource_id=drive_id,
                response_summary={"match_count": len(matches)},
                latency_ms=latency,
                status_code=200,
            ))
            await db.commit()
            logger.info("matches_persisted", drive_id=drive_id, count=len(matches))
    except Exception as e:
        logger.error("persist_matches_failed", error=str(e))


# ── Endpoints ──

@router.post("", response_model=MatchResponse, summary="AI Candidate-Job Matching")
async def match_candidates(
    request: MatchRequest,
    background: BackgroundTasks,
    user: TokenPayload = Depends(get_current_user),
):
    """
    Multi-signal AI matching engine:
    1. Skills overlap scoring (Jaccard)
    2. Embedding cosine similarity (when vectors provided)
    3. LLM reasoning for nuanced analysis
    4. Bias detection & flagging
    """
    start = time.monotonic()
    llm = LLMClient()
    matcher = PlacementMatcherAgent(llm)

    result = await matcher.match(
        candidates=[c.model_dump() for c in request.candidates],
        jobs=[j.model_dump() for j in request.jobs],
        threshold=request.threshold,
    )

    elapsed = (time.monotonic() - start) * 1000

    # Persist asynchronously
    background.add_task(
        _persist_matches, request.drive_id, result["matches"], user.sub, elapsed
    )

    return MatchResponse(
        drive_id=request.drive_id,
        matches=[MatchResultItem(**m) for m in result["matches"]],
        total_candidates=len(request.candidates),
        total_jobs=len(request.jobs),
        processing_time_ms=round(elapsed, 1),
    )


@router.post("/parse-resume", response_model=ResumeParseResponse, summary="AI Resume Parser")
async def parse_resume(
    request: ResumeParseRequest,
    user: TokenPayload = Depends(get_current_user),
):
    """NLP-powered resume parsing — extracts skills, education, experience, certifications."""
    llm = LLMClient()
    matcher = PlacementMatcherAgent(llm)
    parsed = await matcher.parse_resume(request.resume_text)
    return ResumeParseResponse(**parsed)
