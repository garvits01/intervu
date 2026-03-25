# Haveloc Pro AI Service

Production-grade AI service powering placement matching, task generation, and predictive analytics for the Haveloc Pro enterprise platform.

## Quick Start

```bash
# 1. Create venv & install deps
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt

# 2. Copy env template
copy .env.example .env
# Edit .env with your values

# 3. Run locally
uvicorn app.main:app --reload --port 8001
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Liveness probe |
| `/ready` | GET | Readiness probe (checks DB + LLM) |
| `/metrics` | GET | Prometheus scrape endpoint |
| `/docs` | GET | Swagger UI |
| `/redoc` | GET | ReDoc documentation |
| `/graphql` | POST | Strawberry GraphQL |
| `/api/v1/match` | POST | AI candidate-job matching |
| `/api/v1/match/parse-resume` | POST | NLP resume parsing |
| `/api/v1/tasks/generate` | POST | AI task generation with deps |
| `/api/v1/predict/obstacles` | POST | Predictive risk analytics |
| `/api/v1/webhook/placement` | POST | Webhook receiver (204) |

## Run Tests

```bash
pytest                          # Run all tests
pytest --cov=app --cov-report=html  # With coverage report
```

## Docker

```bash
# Build
docker build -t haveloc-ai .

# Run
docker run -p 8001:8001 \
  -e OPENAI_API_KEY=sk-... \
  -e DATABASE_URL=postgresql+asyncpg://... \
  haveloc-ai

# Health check
curl http://localhost:8001/health
```

## Architecture

```
app/
├── main.py              # FastAPI entry (lifespan, routing, middleware)
├── core/
│   ├── config.py        # Pydantic Settings (12-factor)
│   ├── security.py      # JWT + API key auth
│   └── exceptions.py    # Custom error hierarchy
├── ai/
│   └── agents.py        # Multi-LLM agents (OpenAI/Groq fallback)
├── api/v1/
│   ├── endpoints/
│   │   ├── match.py     # /match, /parse-resume
│   │   └── tasks.py     # /tasks/generate, /predict, /webhook
│   └── graphql.py       # Strawberry schema
├── db/
│   ├── session.py       # Async SQLAlchemy + connection pooling
│   └── models.py        # 5 tables (matches, tasks, predictions, audit, webhooks)
├── middleware/
│   └── observability.py # Correlation IDs, Prometheus, structlog
tests/
├── conftest.py
└── test_api/
    └── test_endpoints.py  # 15 async test cases
```

## Production Checklist

| Category | Requirement | Status |
|----------|------------|--------|
| **Auth** | JWT + API key dual auth | ✅ |
| **RBAC** | Role-based access control | ✅ |
| **Rate Limiting** | Per-endpoint throttling | ✅ |
| **CORS** | Configurable origins | ✅ |
| **Input Validation** | Pydantic v2 strict models | ✅ |
| **Error Handling** | Structured JSON with correlation IDs | ✅ |
| **Logging** | Structured JSON (structlog) | ✅ |
| **Metrics** | Prometheus counters + histograms | ✅ |
| **Tracing** | Correlation ID propagation | ✅ |
| **Health Probes** | Liveness + Readiness | ✅ |
| **Database** | Async SQLAlchemy, connection pooling | ✅ |
| **Migrations** | Auto-create tables on startup | ✅ |
| **Audit Trail** | All AI operations logged | ✅ |
| **Multi-LLM** | OpenAI + Groq with auto-fallback | ✅ |
| **Bias Detection** | Match fairness metrics | ✅ |
| **GraphQL** | Strawberry parallel API surface | ✅ |
| **Tests** | 15 async test cases (pytest) | ✅ |
| **Docker** | Multi-stage, non-root, health-checked | ✅ |
| **K8s** | Deployment, HPA (3-20), PDB | ✅ |
| **SOC2** | Audit logs, encryption, RBAC | ✅ |
| **SLO** | < 1s p99 latency target | ✅ |
