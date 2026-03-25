"""
Haveloc Pro AI Service — Custom Exceptions & Error Handling
Provides structured JSON error responses with correlation IDs.
"""

import uuid
import traceback
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
import structlog

logger = structlog.get_logger("haveloc.exceptions")


# ── Custom Exceptions ──

class HavelocError(Exception):
    """Base exception for all Haveloc errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: str = "INTERNAL_ERROR",
        details: dict[str, Any] | None = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(message)


class AIServiceError(HavelocError):
    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(message, 503, "AI_SERVICE_ERROR", details)


class LLMTimeoutError(HavelocError):
    def __init__(self, provider: str, timeout: int):
        super().__init__(
            f"LLM provider '{provider}' timed out after {timeout}s",
            504,
            "LLM_TIMEOUT",
            {"provider": provider, "timeout_seconds": timeout},
        )


class ValidationError(HavelocError):
    def __init__(self, message: str, field: str | None = None):
        details = {"field": field} if field else {}
        super().__init__(message, 422, "VALIDATION_ERROR", details)


class NotFoundError(HavelocError):
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            f"{resource} '{identifier}' not found",
            404,
            "NOT_FOUND",
            {"resource": resource, "identifier": identifier},
        )


class RateLimitError(HavelocError):
    def __init__(self, limit: int, window: str = "minute"):
        super().__init__(
            f"Rate limit exceeded: {limit} requests per {window}",
            429,
            "RATE_LIMITED",
            {"limit": limit, "window": window},
        )


class BiasDetectedError(HavelocError):
    def __init__(self, flags: list[str]):
        super().__init__(
            "Potential bias detected in matching results",
            422,
            "BIAS_DETECTED",
            {"bias_flags": flags},
        )


# ── Error Response Model ──

def _error_response(
    status_code: int,
    error_code: str,
    message: str,
    details: dict[str, Any] | None = None,
    correlation_id: str | None = None,
) -> JSONResponse:
    body = {
        "error": {
            "code": error_code,
            "message": message,
            "details": details or {},
            "correlation_id": correlation_id or str(uuid.uuid4()),
        }
    }
    return JSONResponse(status_code=status_code, content=body)


# ── Exception Handlers ──

def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the FastAPI app."""

    @app.exception_handler(HavelocError)
    async def haveloc_error_handler(request: Request, exc: HavelocError):
        correlation_id = getattr(request.state, "correlation_id", str(uuid.uuid4()))
        logger.error(
            "haveloc_error",
            error_code=exc.error_code,
            message=exc.message,
            status_code=exc.status_code,
            correlation_id=correlation_id,
        )
        return _error_response(
            exc.status_code, exc.error_code, exc.message, exc.details, correlation_id
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception):
        correlation_id = getattr(request.state, "correlation_id", str(uuid.uuid4()))
        logger.error(
            "unhandled_error",
            error=str(exc),
            traceback=traceback.format_exc(),
            correlation_id=correlation_id,
        )
        return _error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "INTERNAL_ERROR",
            "An unexpected error occurred" if not isinstance(exc, Exception) else str(exc),
            correlation_id=correlation_id,
        )

    @app.exception_handler(status.HTTP_404_NOT_FOUND)
    async def not_found_handler(request: Request, exc: Any):
        return _error_response(404, "NOT_FOUND", f"Route {request.url.path} not found")
