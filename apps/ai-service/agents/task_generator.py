"""
Task Generator Agent
Generates actionable tasks from meeting transcripts, emails, or documents using LLM.
"""

import json
import logging
from typing import Any

logger = logging.getLogger("haveloc-ai.task-gen")


class TaskGenerator:
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.api_key = api_key
        self.model = model
        self._client = None

        if api_key:
            try:
                from openai import AsyncOpenAI
                self._client = AsyncOpenAI(api_key=api_key)
                logger.info("TaskGenerator initialized with OpenAI")
            except ImportError:
                logger.warning("openai not installed, using fallback")

    async def generate(
        self, text: str, project_id: str, context: str = ""
    ) -> dict[str, Any]:
        """
        Extract actionable tasks from text.
        """
        if not self._client:
            return self._fallback_extract(text, project_id)

        prompt = f"""Analyze this text and extract actionable tasks. Return valid JSON only.

Text:
{text[:4000]}

{f"Project Context: {context}" if context else ""}

Return: {{
  "summary": "Brief summary of the source text (1-2 sentences)",
  "tasks": [
    {{
      "title": "Clear, actionable task title",
      "description": "Task details and context",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "estimated_hours": float or null,
      "assignee_hint": "Name mentioned or null",
      "due_date_hint": "Date mentioned or null"
    }}
  ]
}}

Rules:
- Extract ONLY actionable items (things someone needs to DO)
- Each task title should start with a verb
- Set priority based on urgency signals in text
- Include estimated hours if scope is clear
- Link assignee_hint to names mentioned in context
- Keep titles concise (<80 chars)"""

        try:
            response = await self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a project management AI. Extract clear, actionable tasks from text. Return valid JSON only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                max_tokens=1000,
                temperature=0.2,
            )
            result = json.loads(response.choices[0].message.content or "{}")
            tasks = result.get("tasks", [])
            logger.info(f"Generated {len(tasks)} tasks for project {project_id}")
            return result
        except Exception as e:
            logger.error(f"Task generation error: {e}")
            return self._fallback_extract(text, project_id)

    def _fallback_extract(self, text: str, project_id: str) -> dict[str, Any]:
        """
        Simple rule-based task extraction when LLM is unavailable.
        Looks for action verb patterns at the start of sentences.
        """
        action_verbs = {
            "review", "update", "create", "fix", "implement", "schedule",
            "send", "prepare", "complete", "follow up", "check", "setup",
            "configure", "deploy", "test", "write", "design", "analyze",
            "investigate", "resolve", "assign", "coordinate", "finalize",
        }

        lines = text.replace("\r\n", "\n").split("\n")
        tasks = []

        for line in lines:
            line = line.strip().strip("-•*").strip()
            if not line or len(line) < 10:
                continue

            first_word = line.split()[0].lower().rstrip(":")
            if first_word in action_verbs:
                tasks.append({
                    "title": line[:80],
                    "description": line,
                    "priority": "MEDIUM",
                    "estimated_hours": None,
                    "assignee_hint": None,
                    "due_date_hint": None,
                })

        return {
            "summary": f"Extracted {len(tasks)} tasks from text ({len(text)} chars)",
            "tasks": tasks[:20],  # Cap at 20 tasks
        }
