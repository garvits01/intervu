@echo off
REM ── Haveloc Pro — One-Command Startup Script ──
REM Run this every time you open the project to start everything

echo.
echo  ============================================
echo   Haveloc Pro — Starting All Services...
echo  ============================================
echo.

REM Step 1: Start Docker containers (Postgres + Redis)
echo [1/4] Starting Postgres and Redis containers...
docker compose -f docker-compose.dev.yml up -d
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker failed. Is Docker Desktop running?
    pause
    exit /b 1
)
echo       Done!
echo.

REM Step 2: Wait for Postgres to be ready
echo [2/4] Waiting for Postgres to be ready...
:WAIT_POSTGRES
docker exec haveloc-postgres pg_isready -U haveloc -d haveloc_pro >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    timeout /t 2 /nobreak >nul
    goto WAIT_POSTGRES
)
echo       Postgres is ready!
echo.

REM Step 3: Push schema + seed database
echo [3/4] Setting up database schema and seed data...
cd packages\db
call npx prisma db push --skip-generate 2>nul
call npx ts-node prisma/seed.ts
cd ..\..
echo       Database ready!
echo.

REM Step 4: Start API and Web servers
echo [4/4] Starting API server (port 4000) and Web server (port 3000)...
echo.
echo  ============================================
echo   All services started! Open in browser:
echo   http://localhost:3000
echo.
echo   Login: admin@haveloc.pro / admin123
echo  ============================================
echo.

REM Start API in background, then Web in foreground
start "Haveloc API" cmd /k "cd apps\api && npm run dev"
timeout /t 3 /nobreak >nul
cd apps\web
npm run dev
