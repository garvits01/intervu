"""
Middleware — Request correlation, structured logging, Prometheus metrics.
"""

import time
import uuid

from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
import structlog

logger = structlog.get_logger("haveloc.middleware")

# ── Prometheus Metrics ──
REQUEST_COUNT = Counter(
    "haveloc_requests_total",
    "Total HTTP requests",
    ["method", "path", "status"],
)
REQUEST_LATENCY = Histogram(
    "haveloc_request_duration_seconds",
    "Request latency",
    ["method", "path"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)
AI_LATENCY = Histogram(
    "haveloc_ai_operation_seconds",
    "AI operation latency",
    ["operation"],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0],
)


class CorrelationMiddleware(BaseHTTPMiddleware):
    """Inject correlation ID into every request for distributed tracing."""

    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        request.state.correlation_id = correlation_id

        start = time.monotonic()
        response = await call_next(request)
        elapsed = time.monotonic() - start

        # Add tracing headers
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Response-Time"] = f"{elapsed*1000:.1f}ms"

        # Structured log
        path = request.url.path
        if path not in ("/health", "/metrics"):
            logger.info(
                "http_request",
                method=request.method,
                path=path,
                status=response.status_code,
                latency_ms=round(elapsed * 1000, 1),
                correlation_id=correlation_id,
                client=request.client.host if request.client else "unknown",
            )

        # Prometheus metrics
        REQUEST_COUNT.labels(
            method=request.method,
            path=self._normalize_path(path),
            status=response.status_code,
        ).inc()
        REQUEST_LATENCY.labels(
            method=request.method,
            path=self._normalize_path(path),
        ).observe(elapsed)

        return response

    @staticmethod
    def _normalize_path(path: str) -> str:
        """Normalize paths for metrics (avoid high cardinality)."""
        parts = path.strip("/").split("/")
        if len(parts) > 3:
            return "/" + "/".join(parts[:3])
        return path


def metrics_endpoint(request: Request) -> Response:
    """Prometheus scrape endpoint."""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )


def setup_logging():
    """Configure structlog for production JSON logging."""
    import logging as _logging
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(_logging.INFO),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
