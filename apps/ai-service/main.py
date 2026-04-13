"""
Haveloc Pro — AI Service
FastAPI application providing AI-powered features:
- Placement candidate-job matching (RAG + LLM)
- Task generation from documents
- Predictive delay forecasting
"""

import os
import json
import logging
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agents.placement_matcher import PlacementMatcher
from agents.task_generator import TaskGenerator
from agents.predictive import PredictiveEngine

# ── Logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("haveloc-ai")

# ── Lifespan ──
matcher: Optional[PlacementMatcher] = None
task_gen: Optional[TaskGenerator] = None
predictor: Optional[PredictiveEngine] = None
#x=1

@asynccontextmanager
async def lifespan(app: FastAPI):
    global matcher, task_gen, predictor
    logger.info("🚀 Initializing AI agents...")
    api_key = os.getenv("OPENAI_API_KEY", "")
    model = os.getenv("OPENAI_MODEL", "gpt-4o")
    matcher = PlacementMatcher(api_key=api_key, model=model)
    task_gen = TaskGenerator(api_key=api_key, model=model)
    predictor = PredictiveEngine()
    logger.info("✅ AI agents initialized")
    yield
    logger.info("🔌 Shutting down AI agents")


# ── App ──
app = FastAPI(
    title="Haveloc Pro AI Service",
    description="AI-powered placement matching, task generation, and predictive analytics",
    version="0.1.0",
    lifespan=lifespan,
)
#function
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("WEB_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


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
    drive_id: str
    candidates: list[CandidateInput]
    jobs: list[JobInput]
    threshold: float = Field(default=0.6, ge=0.0, le=1.0)


class MatchResult(BaseModel):
    job_id: str
    candidate_id: str
    score: float
    confidence: float
    reasoning: str
    bias_flags: list[str] = []


class MatchResponse(BaseModel):
    drive_id: str
    matches: list[MatchResult]
    total_candidates: int
    total_jobs: int
    processing_time_ms: float


class TaskGenRequest(BaseModel):
    text: str = Field(..., description="Meeting transcript, email, or document text")
    project_id: str
    context: str = Field(default="", description="Additional project context")


class GeneratedTask(BaseModel):
    title: str
    description: str
    priority: str
    estimated_hours: float | None = None
    assignee_hint: str | None = None
    due_date_hint: str | None = None


class TaskGenResponse(BaseModel):
    project_id: str
    tasks: list[GeneratedTask]
    source_summary: str


class PredictiveRequest(BaseModel):
    project_id: str
    total_tasks: int
    completed_tasks: int
    velocity_history: list[float] = Field(
        ..., description="Tasks completed per sprint (last 5+)"
    )
    target_date: str
    blockers: int = 0


class PredictiveResponse(BaseModel):
    project_id: str
    predicted_completion: str
    confidence_interval: dict
    on_track: bool
    risk_score: float
    risk_factors: list[str]
    recommendations: list[str]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "haveloc-pro-ai",
        "version": "0.1.0",
        "agents": {
            "matcher": matcher is not None,
            "task_generator": task_gen is not None,
            "predictor": predictor is not None,
        },
    }


@app.post("/match", response_model=MatchResponse)
async def match_candidates(request: MatchRequest):
    """
    AI-powered candidate-job matching.
    Uses NLP skills extraction + embedding similarity + LLM reasoning.
    """
    if not matcher:
        raise HTTPException(status_code=503, detail="Matcher agent not initialized")

    logger.info(
        f"Matching {len(request.candidates)} candidates to {len(request.jobs)} jobs "
        f"(drive: {request.drive_id}, threshold: {request.threshold})"
    )

    try:
        result = await matcher.match(
            candidates=[c.model_dump() for c in request.candidates],
            jobs=[j.model_dump() for j in request.jobs],
            threshold=request.threshold,
        )
        return MatchResponse(
            drive_id=request.drive_id,
            matches=[MatchResult(**m) for m in result["matches"]],
            total_candidates=len(request.candidates),
            total_jobs=len(request.jobs),
            processing_time_ms=result.get("processing_time_ms", 0),
        )
    except Exception as e:
        logger.error(f"Matching failed: {e}")
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")


@app.post("/generate-tasks", response_model=TaskGenResponse)
async def generate_tasks(request: TaskGenRequest):
    """
    AI-powered task generation from meeting transcripts, emails, or documents.
    Extracts action items with priorities, assignees, and due date hints.
    """
    if not task_gen:
        raise HTTPException(
            status_code=503, detail="Task generator not initialized"
        )

    logger.info(f"Generating tasks for project {request.project_id}")

    try:
        result = await task_gen.generate(
            text=request.text,
            project_id=request.project_id,
            context=request.context,
        )
        return TaskGenResponse(
            project_id=request.project_id,
            tasks=[GeneratedTask(**t) for t in result["tasks"]],
            source_summary=result.get("summary", ""),
        )
    except Exception as e:
        logger.error(f"Task generation failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Task generation failed: {str(e)}"
        )


@app.post("/predict", response_model=PredictiveResponse)
async def predict_delays(request: PredictiveRequest):
    """
    ML-powered project delay prediction.
    Uses velocity history to forecast completion and identify risks.
    """
    if not predictor:
        raise HTTPException(
            status_code=503, detail="Predictive engine not initialized"
        )

    logger.info(f"Predicting delays for project {request.project_id}")

    try:
        result = predictor.predict(
            total_tasks=request.total_tasks,
            completed_tasks=request.completed_tasks,
            velocity_history=request.velocity_history,
            target_date=request.target_date,
            blockers=request.blockers,
        )
        return PredictiveResponse(project_id=request.project_id, **result)
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Prediction failed: {str(e)}"
        )


@app.post("/parse-resume")
async def parse_resume(resume_text: str):
    """
    NLP-based resume parsing — extracts skills, education, experience.
    """
    if not matcher:
        raise HTTPException(status_code=503, detail="Matcher not initialized")

    try:
        parsed = await matcher.parse_resume(resume_text)
        return parsed
    except Exception as e:
        logger.error(f"Resume parsing failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Resume parsing failed: {str(e)}"
        )
