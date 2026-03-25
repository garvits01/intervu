# ═══════════════════════════════════════════════════
# Haveloc Pro AI Service — Production Dockerfile
# Multi-stage, non-root, health-checked
# ═══════════════════════════════════════════════════

FROM python:3.12-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# ── Dependencies stage ──
FROM base AS deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Production stage ──
FROM base AS production

# Create non-root user
RUN groupadd -r haveloc && useradd -r -g haveloc -d /app -s /sbin/nologin haveloc

# Copy installed packages from deps
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Set ownership
RUN chown -R haveloc:haveloc /app

# Switch to non-root
USER haveloc

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import httpx; r = httpx.get('http://localhost:8001/health'); exit(0 if r.status_code == 200 else 1)"

# Start with Gunicorn + Uvicorn workers
CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8001", \
     "--workers", "4", \
     "--loop", "uvloop", \
     "--http", "httptools", \
     "--access-log", \
     "--log-level", "info"]
