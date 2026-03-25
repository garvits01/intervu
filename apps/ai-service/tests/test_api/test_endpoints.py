"""
API Endpoint Tests — health, match, tasks, predictions.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestHealth:
    async def test_health_returns_200(self, client: AsyncClient):
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

    async def test_health_has_version(self, client: AsyncClient):
        response = await client.get("/health")
        assert response.json()["version"] == "1.0.0"

    async def test_openapi_schema(self, client: AsyncClient):
        response = await client.get("/openapi.json")
        assert response.status_code == 200
        assert "Haveloc Pro" in response.json()["info"]["title"]

    async def test_docs_page(self, client: AsyncClient):
        response = await client.get("/docs")
        assert response.status_code == 200

    async def test_correlation_id_header(self, client: AsyncClient):
        response = await client.get("/health")
        assert "x-correlation-id" in response.headers
        assert "x-response-time" in response.headers


@pytest.mark.asyncio
class TestMatch:
    async def test_match_returns_200(self, client: AsyncClient):
        payload = {
            "drive_id": "test-drive-001",
            "candidates": [
                {
                    "id": "c1",
                    "skills": ["python", "machine learning", "docker"],
                    "education": [{"degree": "MSc", "institution": "MIT"}],
                    "experience": [{"title": "ML Engineer", "company": "Google", "duration": "3 years"}],
                }
            ],
            "jobs": [
                {
                    "id": "j1",
                    "title": "Senior ML Engineer",
                    "skills": ["python", "tensorflow", "docker", "kubernetes"],
                    "requirements": ["5+ years ML", "Python expert"],
                }
            ],
            "threshold": 0.3,
        }
        response = await client.post("/api/v1/match", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["drive_id"] == "test-drive-001"
        assert isinstance(data["matches"], list)
        assert data["total_candidates"] == 1
        assert data["total_jobs"] == 1

    async def test_match_with_no_matching_skills(self, client: AsyncClient):
        payload = {
            "drive_id": "test-drive-002",
            "candidates": [{"id": "c1", "skills": ["cooking"]}],
            "jobs": [{"id": "j1", "title": "Backend Dev", "skills": ["python", "go"]}],
            "threshold": 0.9,
        }
        response = await client.post("/api/v1/match", json=payload)
        assert response.status_code == 200
        assert len(response.json()["matches"]) == 0

    async def test_match_validation_error(self, client: AsyncClient):
        response = await client.post("/api/v1/match", json={})
        assert response.status_code == 422

    async def test_resume_parse(self, client: AsyncClient):
        payload = {
            "resume_text": "John Doe, Software Engineer with 5 years of experience in Python, Java, Docker, Kubernetes. BSc Computer Science from Stanford. CCNA certified networking professional."
        }
        response = await client.post("/api/v1/match/parse-resume", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["skills"], list)
        assert len(data["skills"]) > 0


@pytest.mark.asyncio
class TestTaskGeneration:
    async def test_generate_tasks(self, client: AsyncClient):
        payload = {
            "project_desc": "Review the Q4 roadmap. Implement user authentication module. Create API documentation. Fix the login bug on mobile. Deploy to staging environment. Setup monitoring dashboard.",
            "team_size": 3,
        }
        response = await client.post("/api/v1/tasks/generate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["tasks"], list)

    async def test_generate_tasks_validation(self, client: AsyncClient):
        response = await client.post("/api/v1/tasks/generate", json={"project_desc": "too short"})
        assert response.status_code == 422


@pytest.mark.asyncio
class TestPredictions:
    async def test_predict_on_track(self, client: AsyncClient):
        payload = {
            "project_id": "proj-001",
            "total_tasks": 50,
            "completed_tasks": 35,
            "velocity_history": [8.0, 7.0, 9.0, 8.5],
            "target_date": "2027-06-30",
        }
        response = await client.post("/api/v1/predict/obstacles", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["project_id"] == "proj-001"
        assert isinstance(data["on_track"], bool)
        assert 0 <= data["risk_score"] <= 1

    async def test_predict_at_risk(self, client: AsyncClient):
        payload = {
            "project_id": "proj-002",
            "total_tasks": 100,
            "completed_tasks": 10,
            "velocity_history": [5.0, 4.0, 3.0, 2.0],
            "target_date": "2026-03-01",
            "blockers": 3,
        }
        response = await client.post("/api/v1/predict/obstacles", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["risk_score"] > 0.3
        assert len(data["risks"]) > 0

    async def test_predict_validation(self, client: AsyncClient):
        response = await client.post("/api/v1/predict/obstacles", json={})
        assert response.status_code == 422


@pytest.mark.asyncio
class TestWebhook:
    async def test_webhook_returns_204(self, client: AsyncClient):
        payload = {
            "event": "candidate.applied",
            "data": {"candidate_id": "c123", "job_id": "j456"},
        }
        response = await client.post(
            "/api/v1/webhook/placement",
            json=payload,
            headers={
                "X-Webhook-Source": "linkedin",
                "X-Webhook-Event": "candidate.applied",
            },
        )
        assert response.status_code == 204


@pytest.mark.asyncio
class TestGraphQL:
    async def test_graphql_health_query(self, client: AsyncClient):
        query = {"query": "{ health { status version environment } }"}
        response = await client.post("/graphql", json=query)
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["health"]["status"] == "healthy"
