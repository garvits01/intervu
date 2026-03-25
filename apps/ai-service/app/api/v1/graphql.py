"""
Strawberry GraphQL schema — parallel API surface for the React frontend.
"""

import strawberry
from typing import Optional


@strawberry.type
class MatchResultType:
    job_id: str
    candidate_id: str
    score: float
    confidence: float
    reasoning: str
    bias_flags: list[str]


@strawberry.type
class MatchResponseType:
    drive_id: str
    matches: list[MatchResultType]
    total_candidates: int
    total_jobs: int
    processing_time_ms: float


@strawberry.type
class GeneratedTaskType:
    id: str
    title: str
    description: str
    priority: str
    estimated_hours: Optional[float]
    assignee: str
    deps: list[str]


@strawberry.type
class TaskGenResponseType:
    project_id: str
    tasks: list[GeneratedTaskType]
    summary: str


@strawberry.type
class RiskType:
    type: str
    probability: float
    mitigation: str


@strawberry.type
class PredictionType:
    project_id: str
    predicted_completion: str
    on_track: bool
    risk_score: float
    risks: list[RiskType]
    recommendations: list[str]


@strawberry.input
class CandidateInputGQL:
    id: str
    skills: list[str]


@strawberry.input
class JobInputGQL:
    id: str
    title: str
    skills: list[str]


@strawberry.type
class HealthType:
    status: str
    version: str
    environment: str


@strawberry.type
class Query:
    @strawberry.field
    def health(self) -> HealthType:
        from app.core.config import get_settings
        s = get_settings()
        return HealthType(
            status="healthy",
            version=s.APP_VERSION,
            environment=s.ENVIRONMENT,
        )


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def match_candidates(
        self,
        drive_id: str,
        candidates: list[CandidateInputGQL],
        jobs: list[JobInputGQL],
        threshold: float = 0.6,
    ) -> MatchResponseType:
        from app.ai.agents import LLMClient, PlacementMatcherAgent
        import time

        start = time.monotonic()
        llm = LLMClient()
        matcher = PlacementMatcherAgent(llm)
        result = await matcher.match(
            candidates=[{"id": c.id, "skills": c.skills} for c in candidates],
            jobs=[{"id": j.id, "title": j.title, "skills": j.skills} for j in jobs],
            threshold=threshold,
        )
        elapsed = (time.monotonic() - start) * 1000

        return MatchResponseType(
            drive_id=drive_id,
            matches=[MatchResultType(**m) for m in result["matches"]],
            total_candidates=len(candidates),
            total_jobs=len(jobs),
            processing_time_ms=round(elapsed, 1),
        )

    @strawberry.mutation
    async def generate_tasks(
        self,
        project_desc: str,
        team_size: int = 3,
    ) -> TaskGenResponseType:
        from app.ai.agents import LLMClient, TaskGeneratorAgent
        llm = LLMClient()
        gen = TaskGeneratorAgent(llm)
        result = await gen.generate(text=project_desc, project_id="graphql", team_size=team_size)
        tasks = [GeneratedTaskType(
            id=t.get("id", ""),
            title=t.get("title", ""),
            description=t.get("description", ""),
            priority=t.get("priority", "MEDIUM"),
            estimated_hours=t.get("estimated_hours"),
            assignee=t.get("assignee", ""),
            deps=t.get("deps", []),
        ) for t in result.get("tasks", [])]
        return TaskGenResponseType(
            project_id="graphql",
            tasks=tasks,
            summary=result.get("summary", ""),
        )


schema = strawberry.Schema(query=Query, mutation=Mutation)
