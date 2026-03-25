"""
Haveloc Pro AI Service — Production Entry Point
Enterprise-grade FastAPI application with observability, auth, and GraphQL.
"""

import logging
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.middleware.observability import (
    CorrelationMiddleware,
    metrics_endpoint,
    setup_logging,
)
from app.api.v1.endpoints.match import router as match_router
from app.api.v1.endpoints.tasks import router as tasks_router
from app.api.v1.graphql import schema

# ── Structured logging ──
setup_logging()
logger = structlog.get_logger("haveloc.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle."""
    settings = get_settings()
    logger.info(
        "startup",
        app=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        port=settings.PORT,
    )

    # Create DB tables if needed
    try:
        from app.db.session import engine, Base
        from app.db import models  # noqa: F401 — register models
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("database_ready")
    except Exception as e:
        logger.warning("database_init_skipped", reason=str(e))

    yield

    # Shutdown
    try:
        from app.db.session import engine
        await engine.dispose()
        logger.info("database_disconnected")
    except Exception:
        pass
    logger.info("shutdown_complete")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Haveloc Pro AI Service",
        description="Enterprise AI-powered placement matching, task generation, and predictive analytics",
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── Middleware (order matters — last added = first executed) ──
    app.add_middleware(CorrelationMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Correlation-ID", "X-Response-Time"],
    )

    # ── Exception handlers ──
    register_exception_handlers(app)

    # ── REST routes ──
    app.include_router(match_router, prefix="/api/v1")
    app.include_router(tasks_router, prefix="/api/v1")

    # ── GraphQL ──
    graphql_app = GraphQLRouter(schema, path="/graphql")
    app.include_router(graphql_app)

    # ── Health & Metrics ──
    @app.get("/health", tags=["system"])
    async def health():
        return {
            "status": "healthy",
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "service": settings.APP_NAME,
        }

    @app.get("/ready", tags=["system"])
    async def readiness():
        """Kubernetes readiness probe — checks external deps."""
        checks = {"database": "unknown", "llm": "unknown"}
        try:
            from app.db.session import engine
            async with engine.connect() as conn:
                await conn.execute("SELECT 1")  # type: ignore
            checks["database"] = "connected"
        except Exception:
            checks["database"] = "disconnected"

        from app.ai.agents import LLMClient
        checks["llm"] = "available" if LLMClient().available else "unavailable"

        healthy = checks["database"] != "error"
        return {"status": "ready" if healthy else "degraded", "checks": checks}

    if settings.PROMETHEUS_ENABLED:
        app.add_api_route("/metrics", metrics_endpoint, methods=["GET"], tags=["system"])

    return app


app = create_app()
