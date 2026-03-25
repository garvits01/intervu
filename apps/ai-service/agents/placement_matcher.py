"""
Placement Matcher Agent
Matches candidates to jobs using:
1. Skills overlap scoring
2. Embedding cosine similarity (when available)
3. LLM reasoning for nuanced matching
4. Bias detection
"""

import time
import json
import logging
import math
from typing import Any

logger = logging.getLogger("haveloc-ai.matcher")


class PlacementMatcher:
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.api_key = api_key
        self.model = model
        self._client = None

        if api_key:
            try:
                from openai import AsyncOpenAI
                self._client = AsyncOpenAI(api_key=api_key)
                logger.info(f"OpenAI client initialized (model: {model})")
            except ImportError:
                logger.warning("openai package not installed, using fallback matching")

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        """Compute cosine similarity between two vectors."""
        if not a or not b or len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        mag_a = math.sqrt(sum(x * x for x in a))
        mag_b = math.sqrt(sum(x * x for x in b))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    def _skills_overlap_score(
        self, candidate_skills: list[str], job_skills: list[str]
    ) -> float:
        """Calculate normalized Jaccard-like skills overlap."""
        if not job_skills:
            return 0.5  # No requirements = neutral score

        c_set = {s.lower().strip() for s in candidate_skills}
        j_set = {s.lower().strip() for s in job_skills}
        if not j_set:
            return 0.5
        intersection = c_set & j_set
        return len(intersection) / len(j_set)

    def _detect_bias(
        self, candidate: dict, job: dict, score: float
    ) -> list[str]:
        """Simple bias detection flags."""
        flags = []
        # Flag if score suspiciously correlates with non-skill attributes
        if score < 0.3 and len(candidate.get("skills", [])) > 5:
            flags.append("LOW_SCORE_HIGH_SKILLS: Score may not reflect skill depth")
        return flags

    async def _llm_match_reasoning(
        self, candidate: dict, job: dict
    ) -> dict[str, Any]:
        """Use LLM for nuanced matching reasoning."""
        if not self._client:
            return {"reasoning": "LLM unavailable — matched on skills overlap only", "adjustment": 0.0}

        prompt = f"""Analyze the match between this candidate and job. Return JSON only.

Candidate Skills: {', '.join(candidate.get('skills', []))}
Candidate Education: {json.dumps(candidate.get('education', []))}
Candidate Experience: {json.dumps(candidate.get('experience', []))}

Job Title: {job.get('title', '')}
Job Requirements: {', '.join(job.get('requirements', []))}
Job Skills: {', '.join(job.get('skills', []))}

Return: {{"reasoning": "1-2 sentence explanation", "score_adjustment": float between -0.2 and 0.2, "concerns": []}}"""

        try:
            response = await self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert recruiter matching AI. Return valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                max_tokens=200,
                temperature=0.3,
            )
            result = json.loads(response.choices[0].message.content or "{}")
            return {
                "reasoning": result.get("reasoning", ""),
                "adjustment": max(-0.2, min(0.2, result.get("score_adjustment", 0.0))),
            }
        except Exception as e:
            logger.warning(f"LLM reasoning failed: {e}")
            return {"reasoning": "LLM reasoning unavailable", "adjustment": 0.0}

    async def match(
        self,
        candidates: list[dict],
        jobs: list[dict],
        threshold: float = 0.6,
    ) -> dict:
        """
        Match candidates to jobs using multi-signal scoring.
        """
        start = time.monotonic()
        matches = []

        for job in jobs:
            for candidate in candidates:
                # Signal 1: Skills overlap (weight: 0.5)
                skills_score = self._skills_overlap_score(
                    candidate.get("skills", []), job.get("skills", [])
                )

                # Signal 2: Embedding similarity (weight: 0.3)
                embedding_score = self._cosine_similarity(
                    candidate.get("embedding", []),
                    job.get("embedding", []),
                )

                # Base composite score
                if embedding_score > 0:
                    base_score = skills_score * 0.5 + embedding_score * 0.3 + 0.2
                else:
                    base_score = skills_score * 0.8 + 0.2

                # Signal 3: LLM reasoning (for top candidates only)
                reasoning = "Matched on skills overlap"
                adjustment = 0.0
                if base_score >= threshold * 0.8:
                    llm_result = await self._llm_match_reasoning(candidate, job)
                    reasoning = llm_result["reasoning"]
                    adjustment = llm_result["adjustment"]

                final_score = max(0.0, min(1.0, base_score + adjustment))

                if final_score >= threshold:
                    bias_flags = self._detect_bias(candidate, job, final_score)
                    matches.append({
                        "job_id": job["id"],
                        "candidate_id": candidate["id"],
                        "score": round(final_score, 4),
                        "confidence": round(
                            0.9 if embedding_score > 0 else 0.7, 2
                        ),
                        "reasoning": reasoning,
                        "bias_flags": bias_flags,
                    })

        # Sort by score descending
        matches.sort(key=lambda m: m["score"], reverse=True)

        elapsed = (time.monotonic() - start) * 1000
        logger.info(f"Matching complete: {len(matches)} matches in {elapsed:.1f}ms")

        return {"matches": matches, "processing_time_ms": round(elapsed, 1)}

    async def parse_resume(self, resume_text: str) -> dict:
        """Extract structured data from resume text using LLM."""
        if not self._client:
            # Fallback: basic keyword extraction
            words = resume_text.lower().split()
            tech_keywords = {
                "python", "java", "javascript", "typescript", "react", "node",
                "sql", "aws", "docker", "kubernetes", "machine learning", "ai",
                "c++", "go", "rust", "tensorflow", "pytorch",
            }
            found_skills = [w for w in words if w in tech_keywords]
            return {
                "skills": list(set(found_skills)),
                "education": [],
                "experience": [],
                "raw_text_length": len(resume_text),
            }

        prompt = f"""Parse this resume and extract structured data. Return valid JSON only.

Resume:
{resume_text[:3000]}

Return: {{
  "skills": ["skill1", "skill2", ...],
  "education": [{{"degree": "...", "institution": "...", "year": "..."}}],
  "experience": [{{"title": "...", "company": "...", "duration": "...", "highlights": ["..."]}}],
  "summary": "1-line candidate summary"
}}"""

        try:
            response = await self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert resume parser. Return valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                max_tokens=500,
                temperature=0.1,
            )
            return json.loads(response.choices[0].message.content or "{}")
        except Exception as e:
            logger.error(f"Resume parsing error: {e}")
            return {"skills": [], "education": [], "experience": [], "error": str(e)}
