"""
Haveloc Pro — AI Agents (LangChain + Multi-LLM)
Production-grade agent implementations with fallback chains.
"""

import json
import math
import time
import hashlib
import logging
import statistics
from datetime import datetime, timedelta
from typing import Any

import structlog

from app.core.config import get_settings

logger = structlog.get_logger("haveloc.ai.agents")


# ──────────────────────────────────────────────
# LLM Client Factory
# ──────────────────────────────────────────────

class LLMClient:
    """Multi-provider LLM client with automatic fallback."""

    def __init__(self):
        self.settings = get_settings()
        self._openai = None
        self._groq = None
        self._init_clients()

    def _init_clients(self):
        if self.settings.OPENAI_API_KEY:
            try:
                from openai import AsyncOpenAI
                self._openai = AsyncOpenAI(api_key=self.settings.OPENAI_API_KEY)
                logger.info("llm_client_init", provider="openai", model=self.settings.OPENAI_MODEL)
            except ImportError:
                logger.warning("openai_not_installed")

        if self.settings.GROQ_API_KEY:
            try:
                from openai import AsyncOpenAI
                self._groq = AsyncOpenAI(
                    api_key=self.settings.GROQ_API_KEY,
                    base_url="https://api.groq.com/openai/v1",
                )
                logger.info("llm_client_init", provider="groq", model=self.settings.GROQ_MODEL)
            except ImportError:
                pass

    async def chat(
        self,
        messages: list[dict],
        json_mode: bool = True,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ) -> str:
        """Send chat completion with automatic provider fallback."""
        s = self.settings
        kwargs: dict[str, Any] = {
            "messages": messages,
            "max_tokens": max_tokens or s.LLM_MAX_TOKENS,
            "temperature": temperature or s.LLM_TEMPERATURE,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        # Try primary provider
        providers = self._get_provider_order()
        last_error = None

        for client, model in providers:
            if not client:
                continue
            try:
                response = await client.chat.completions.create(model=model, **kwargs)
                return response.choices[0].message.content or "{}"
            except Exception as e:
                last_error = e
                logger.warning("llm_fallback", provider=model, error=str(e))
                continue

        if last_error:
            logger.error("all_llm_providers_failed", error=str(last_error))
        return "{}"

    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings using OpenAI."""
        if not self._openai:
            return [[] for _ in texts]
        try:
            response = await self._openai.embeddings.create(
                model=self.settings.OPENAI_EMBEDDING_MODEL,
                input=texts,
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            logger.error("embedding_failed", error=str(e))
            return [[] for _ in texts]

    def _get_provider_order(self) -> list[tuple[Any, str]]:
        s = self.settings
        if s.LLM_PROVIDER == "openai":
            return [(self._openai, s.OPENAI_MODEL), (self._groq, s.GROQ_MODEL)]
        elif s.LLM_PROVIDER == "groq":
            return [(self._groq, s.GROQ_MODEL), (self._openai, s.OPENAI_MODEL)]
        else:  # auto — prefer OpenAI, fallback to Groq
            return [(self._openai, s.OPENAI_MODEL), (self._groq, s.GROQ_MODEL)]

    @property
    def available(self) -> bool:
        return self._openai is not None or self._groq is not None


# ──────────────────────────────────────────────
# Placement Matcher Agent
# ──────────────────────────────────────────────

MATCH_SYSTEM_PROMPT = """You are an expert AI recruiter for enterprise placement. Analyze candidate-job fit with precision.

SCORING CRITERIA:
1. Technical Skills Match (40%): Programming languages, frameworks, certifications (Python, CCNA, HFT infra, etc.)
2. Experience Relevance (25%): Years, domain expertise, leadership
3. Education Alignment (20%): Degree level, field relevance
4. Cultural Fit Signals (15%): Work style, team size preferences

BIAS PREVENTION:
- Score ONLY on skills, experience, and qualifications
- Flag if protected attributes may influence scoring
- Ensure consistent evaluation across demographics

Return valid JSON only."""

MATCH_USER_PROMPT = """Score this candidate-job match.

CANDIDATE:
- Skills: {skills}
- Education: {education}
- Experience: {experience}

JOB:
- Title: {title}
- Required Skills: {required_skills}
- Requirements: {requirements}

Return: {{"reasoning": "2-3 sentence analysis", "score_adjustment": float (-0.2 to 0.2), "concerns": [], "skill_gaps": []}}"""


class PlacementMatcherAgent:
    """Multi-signal placement matching with LLM reasoning and bias detection."""

    def __init__(self, llm: LLMClient):
        self.llm = llm

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        if not a or not b or len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        mag_a = math.sqrt(sum(x * x for x in a))
        mag_b = math.sqrt(sum(x * x for x in b))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    def _skills_overlap(self, candidate_skills: list[str], job_skills: list[str]) -> float:
        if not job_skills:
            return 0.5
        c = {s.lower().strip() for s in candidate_skills}
        j = {s.lower().strip() for s in job_skills}
        if not j:
            return 0.5
        return len(c & j) / len(j)

    def _detect_bias(self, candidate: dict, score: float) -> list[str]:
        flags = []
        skills_count = len(candidate.get("skills", []))
        if score < 0.3 and skills_count > 5:
            flags.append("LOW_SCORE_HIGH_SKILLS: Score may not reflect skill depth")
        if score > 0.9 and skills_count < 2:
            flags.append("HIGH_SCORE_LOW_SKILLS: Suspiciously high score for minimal skills")
        return flags

    async def match(
        self,
        candidates: list[dict],
        jobs: list[dict],
        threshold: float = 0.6,
    ) -> dict:
        start = time.monotonic()
        matches = []

        for job in jobs:
            for candidate in candidates:
                # Signal 1: Skills overlap (weight: 0.45)
                skills_score = self._skills_overlap(
                    candidate.get("skills", []), job.get("skills", [])
                )

                # Signal 2: Embedding cosine similarity (weight: 0.35)
                emb_score = self._cosine_similarity(
                    candidate.get("embedding", []), job.get("embedding", [])
                )

                # Composite base score
                if emb_score > 0:
                    base = skills_score * 0.45 + emb_score * 0.35 + 0.20
                else:
                    base = skills_score * 0.75 + 0.25

                # Signal 3: LLM reasoning for borderline+ candidates
                reasoning = "Matched on skills overlap"
                adjustment = 0.0
                if base >= threshold * 0.75 and self.llm.available:
                    try:
                        prompt = MATCH_USER_PROMPT.format(
                            skills=", ".join(candidate.get("skills", [])),
                            education=json.dumps(candidate.get("education", [])),
                            experience=json.dumps(candidate.get("experience", [])),
                            title=job.get("title", ""),
                            required_skills=", ".join(job.get("skills", [])),
                            requirements=", ".join(job.get("requirements", [])),
                        )
                        raw = await self.llm.chat(
                            [
                                {"role": "system", "content": MATCH_SYSTEM_PROMPT},
                                {"role": "user", "content": prompt},
                            ],
                            max_tokens=300,
                        )
                        result = json.loads(raw)
                        reasoning = result.get("reasoning", reasoning)
                        adjustment = max(-0.2, min(0.2, result.get("score_adjustment", 0.0)))
                    except Exception as e:
                        logger.warning("llm_matching_fallback", error=str(e))

                final = max(0.0, min(1.0, base + adjustment))

                if final >= threshold:
                    matches.append({
                        "job_id": job["id"],
                        "candidate_id": candidate["id"],
                        "score": round(final, 4),
                        "confidence": round(0.92 if emb_score > 0 else 0.72, 2),
                        "reasoning": reasoning,
                        "bias_flags": self._detect_bias(candidate, final),
                    })

        matches.sort(key=lambda m: m["score"], reverse=True)
        elapsed = (time.monotonic() - start) * 1000

        logger.info("matching_complete", match_count=len(matches), elapsed_ms=round(elapsed, 1))
        return {"matches": matches, "processing_time_ms": round(elapsed, 1)}

    async def parse_resume(self, text: str) -> dict:
        if not self.llm.available:
            return self._fallback_parse(text)

        prompt = f"""Parse this resume. Extract structured data. Return valid JSON only.

Resume (first 3000 chars):
{text[:3000]}

Return: {{
  "skills": ["skill1", "skill2"],
  "education": [{{"degree": "...", "institution": "...", "year": "..."}}],
  "experience": [{{"title": "...", "company": "...", "duration": "...", "highlights": ["..."]}}],
  "certifications": ["CCNA", "AWS SAA", ...],
  "summary": "1-line summary"
}}"""
        try:
            raw = await self.llm.chat([
                {"role": "system", "content": "Expert resume parser. Return valid JSON only."},
                {"role": "user", "content": prompt},
            ], max_tokens=600)
            result = json.loads(raw)
            # If LLM returned empty result (e.g. quota error), use fallback
            if not result.get("skills"):
                return self._fallback_parse(text)
            return result
        except Exception as e:
            logger.error("resume_parse_error", error=str(e))
            return self._fallback_parse(text)

    def _fallback_parse(self, text: str) -> dict:
        tech = {
            "python", "java", "javascript", "typescript", "react", "node", "go", "rust",
            "sql", "aws", "docker", "kubernetes", "tensorflow", "pytorch", "c++",
            "machine learning", "ai", "ccna", "hft", "networking", "linux",
            "flask", "django", "fastapi", "redis", "mongodb", "graphql",
            "software", "engineer", "backend", "frontend", "fullstack",
        }
        certs = {"ccna", "ccnp", "aws saa", "aws sap", "cka", "ckad", "cissp", "pmp"}
        lower = text.lower()
        found_skills = {t for t in tech if t in lower}
        found_certs = {c.upper() for c in certs if c in lower}
        return {
            "skills": sorted(found_skills),
            "education": [],
            "experience": [],
            "certifications": sorted(found_certs),
            "summary": f"Resume processed ({len(text)} chars)",
        }


# ──────────────────────────────────────────────
# Task Generator Agent
# ──────────────────────────────────────────────

TASK_GEN_PROMPT = """Analyze this text and generate actionable project tasks with dependencies.

Text:
{text}

Team Size: {team_size}
{context}

Return valid JSON:
{{
  "summary": "Brief summary of the source",
  "tasks": [
    {{
      "id": "T-001",
      "title": "Verb-first task title (<80 chars)",
      "description": "Task details",
      "priority": "HIGH|MEDIUM|LOW",
      "estimated_hours": float,
      "assignee": "Team Member N (1-{team_size})",
      "deps": ["T-000"] // IDs this task depends on
    }}
  ]
}}

Rules:
- Extract ONLY actionable items
- Each title starts with a verb
- Tasks are ordered by dependency DAG
- Distribute assignments evenly across team
- Include estimated hours
- Flag blockers in descriptions"""


class TaskGeneratorAgent:
    """AI-powered task extraction with dependency graphs."""

    def __init__(self, llm: LLMClient):
        self.llm = llm

    async def generate(
        self, text: str, project_id: str, team_size: int = 3, context: str = ""
    ) -> dict:
        if not self.llm.available:
            return self._fallback(text, team_size)

        prompt = TASK_GEN_PROMPT.format(
            text=text[:4000],
            team_size=team_size,
            context=f"Context: {context}" if context else "",
        )
        try:
            raw = await self.llm.chat([
                {"role": "system", "content": "You are a project management AI. Generate clear, actionable tasks. Return valid JSON only."},
                {"role": "user", "content": prompt},
            ], max_tokens=1500)
            result = json.loads(raw)
            logger.info("tasks_generated", count=len(result.get("tasks", [])), project=project_id)
            return result
        except Exception as e:
            logger.error("task_generation_error", error=str(e))
            return self._fallback(text, team_size)

    def _fallback(self, text: str, team_size: int) -> dict:
        verbs = {
            "review", "update", "create", "fix", "implement", "schedule", "send",
            "prepare", "complete", "check", "setup", "configure", "deploy", "test",
            "write", "design", "analyze", "investigate", "resolve", "assign",
        }
        tasks = []
        for i, line in enumerate(text.split("\n")):
            line = line.strip().strip("-•*").strip()
            if len(line) < 10:
                continue
            first = line.split()[0].lower().rstrip(":")
            if first in verbs:
                tid = f"T-{len(tasks)+1:03d}"
                tasks.append({
                    "id": tid,
                    "title": line[:80],
                    "description": line,
                    "priority": "MEDIUM",
                    "estimated_hours": 4.0,
                    "assignee": f"Team Member {(len(tasks) % team_size) + 1}",
                    "deps": [f"T-{len(tasks):03d}"] if tasks else [],
                })
        return {"summary": f"Extracted {len(tasks)} tasks", "tasks": tasks[:20]}


# ──────────────────────────────────────────────
# Predictive Engine
# ──────────────────────────────────────────────

class PredictiveEngine:
    """Velocity-based project risk prediction with statistical forecasting."""

    def predict(
        self,
        total_tasks: int,
        completed_tasks: int,
        velocity_history: list[float],
        target_date: str,
        blockers: int = 0,
        task_details: list[dict] | None = None,
    ) -> dict:
        remaining = total_tasks - completed_tasks
        target = datetime.strptime(target_date, "%Y-%m-%d")
        today = datetime.now()

        if len(velocity_history) < 2:
            return {
                "predicted_completion": target_date,
                "confidence_interval": {"low": target_date, "high": target_date},
                "on_track": True,
                "risk_score": 0.5,
                "risk_factors": ["Insufficient velocity data (need 2+ sprints)"],
                "recommendations": ["Track velocity for 3+ sprints for prediction accuracy"],
            }

        avg_v = statistics.mean(velocity_history)
        std_v = statistics.stdev(velocity_history) if len(velocity_history) > 1 else 0
        trend = self._trend(velocity_history)
        proj_v = max(0.1, avg_v + trend)

        sprints = remaining / proj_v
        days = sprints * 14
        pred_date = today + timedelta(days=days)

        opt_sprints = remaining / max(0.1, avg_v + std_v) if std_v > 0 else sprints * 0.8
        pess_sprints = remaining / max(0.1, avg_v - std_v) if std_v > 0 else sprints * 1.3
        low = today + timedelta(days=opt_sprints * 14)
        high = today + timedelta(days=pess_sprints * 14)

        days_to_target = (target - today).days
        on_track = pred_date <= target
        risk = self._risk(days, days_to_target, trend, std_v, avg_v, blockers)
        factors = self._factors(velocity_history, trend, days, days_to_target, blockers, completed_tasks / max(total_tasks, 1))
        recs = self._recs(factors, remaining, avg_v, days_to_target, blockers)

        return {
            "predicted_completion": pred_date.strftime("%Y-%m-%d"),
            "confidence_interval": {"low": low.strftime("%Y-%m-%d"), "high": high.strftime("%Y-%m-%d")},
            "on_track": on_track,
            "risk_score": round(risk, 2),
            "risk_factors": factors,
            "recommendations": recs,
        }

    def _trend(self, h: list[float]) -> float:
        n = len(h)
        if n < 2: return 0.0
        xm = (n - 1) / 2
        ym = statistics.mean(h)
        num = sum((i - xm) * (y - ym) for i, y in enumerate(h))
        den = sum((i - xm) ** 2 for i in range(n))
        return num / den if den else 0.0

    def _risk(self, days_rem, days_target, trend, std, avg, blockers) -> float:
        r = 0.0
        if days_target > 0:
            r += min(0.35, max(0, (days_rem / days_target - 1) * 0.5))
        else:
            r += 0.35
        if trend < 0:
            r += min(0.25, abs(trend) / max(avg, 1) * 0.3)
        if avg > 0:
            r += min(0.2, (std / avg) * 0.2)
        r += min(0.2, blockers * 0.05)
        return min(1.0, r)

    def _factors(self, hist, trend, days_rem, days_target, blockers, ratio) -> list[str]:
        f = []
        if trend < -0.5:
            f.append(f"Velocity declining ({trend:.1f} tasks/sprint trend)")
        if days_rem > days_target:
            f.append(f"Projected {days_rem - days_target:.0f} days past deadline")
        if blockers > 0:
            f.append(f"{blockers} active blocker(s)")
        recent = hist[-3:]
        if len(recent) >= 3 and all(recent[i] < recent[i-1] for i in range(1, len(recent))):
            f.append("Velocity dropping 3 consecutive sprints")
        if ratio < 0.3 and days_target < 30:
            f.append("< 30% complete with < 30 days left")
        return f or ["No significant risks identified"]

    def _recs(self, factors, remaining, avg_v, days_target, blockers) -> list[str]:
        r = []
        if blockers > 0:
            r.append(f"Resolve {blockers} blocker(s) — each reduces velocity ~5%")
        if days_target > 0:
            needed = remaining / (days_target / 14)
            if needed > avg_v * 1.2:
                r.append(f"Need {needed:.1f} tasks/sprint (avg: {avg_v:.1f}). Add resources or cut scope.")
        if "declining" in str(factors).lower():
            r.append("Run retrospective to address velocity decline")
        return r or ["On track — maintain current velocity"]
