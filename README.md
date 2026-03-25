<p align="center">
  <h1 align="center">🚀 Haveloc Pro</h1>
  <p align="center">
    <strong>AI-Native Enterprise Project Management & Placement Automation Platform</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#documentation">Docs</a>
  </p>
</p>

---

## 📋 Overview

**Haveloc Pro** is a next-generation, AI-native enterprise platform for **project management**, **team collaboration**, and **placement automation**. Built as a turborepo monorepo, it combines a modern Next.js frontend, NestJS API backend, and a FastAPI-powered AI service to deliver intelligent automation at scale.

> *"Make every team and placement process 10x faster, smarter, and stress-free — powered by AI that anticipates what you need before you ask."*

---

## ✨ Features

### 🎯 Project Management
- **Dashboard** — Real-time KPIs, task summaries, and upcoming deadlines
- **Task Management** — Create, assign, tag, filter with Kanban/list/calendar views
- **Topic Threads** — Contextual messaging attached to tasks and projects
- **Templates** — Pre-built project and placement templates

### 🤖 AI-Powered Intelligence
- **AI Resume Parser** — NLP-based extraction of skills, education, and experience
- **AI Job Matcher** — Candidate-job matching with confidence scores and bias auditing
- **AI Task Generator** — Auto-create tasks from meeting notes, emails, and documents
- **Predictive Delay Engine** — ML-based project delay forecasting

### 🎓 Placement Automation
- **Placement Drives** — End-to-end drive management with student registration
- **Candidate Profiles** — Parsed resumes with skill embeddings for semantic matching
- **Company Management** — Job postings, requirements, and multi-drive coordination
- **Match Results** — AI-ranked candidates with confidence scores and reasoning

### 🔐 Enterprise Security
- **RBAC** — Role-based access control (Super Admin, Admin, Manager, Member, Viewer)
- **Auth0 Integration** — OAuth2/OIDC, MFA, SSO (SAML 2.0)
- **Multi-Tenant** — Organization-level isolation with configurable settings

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| **Backend API** | NestJS, GraphQL (Apollo), REST, TypeScript |
| **AI Service** | FastAPI, LangChain, OpenAI GPT-4o, Python |
| **Database** | PostgreSQL 16 (+ pgvector), Prisma ORM |
| **Cache** | Redis 7 |
| **Event Bus** | Apache Kafka |
| **Auth** | Auth0 (OAuth2/OIDC) |
| **Infra** | Docker, Kubernetes (EKS), Terraform |
| **CI/CD** | GitHub Actions |
| **Monorepo** | TurboRepo |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │  Web App    │  │ Mobile App  │  │  Admin Dashboard   │  │
│  │ Next.js 15  │  │ React Native│  │    Next.js         │  │
│  │  :3000      │  │  Expo       │  │    :3001           │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────┬──────────┘  │
└─────────┼────────────────┼───────────────────┼─────────────┘
          │                │                   │
          └────────────────┼───────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    API Gateway                              │
└──────────────────────────┼──────────────────────────────────┘
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Core API    │  │  AI Service  │  │  Real-Time   │
│  NestJS      │  │  FastAPI     │  │  WebSocket   │
│  :4000       │  │  :8000       │  │  :4001       │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
┌──────┼─────────────────┼─────────────────┼──────────────────┐
│      ▼                 ▼                 ▼                  │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Postgres │  │    Redis     │  │    Kafka     │          │
│  │ pgvector │  │  Cache/PubSub│  │  Events      │          │
│  └──────────┘  └──────────────┘  └──────────────┘          │
│                      Data Layer                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **Docker Desktop** (for PostgreSQL & Redis)
- **npm** ≥ 10.x
- **Python** ≥ 3.12 (for AI service)

### Quick Start (Windows)

```bash
# 1. Clone the repository
git clone https://github.com/garvits01/intervu.git
cd intervu

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values (database, Auth0, OpenAI keys, etc.)

# 4. Run everything with one command
start.bat
```

The `start.bat` script will:
1. Start PostgreSQL & Redis containers via Docker
2. Wait for database readiness
3. Push the Prisma schema & seed the database
4. Launch the API server (port 4000) and Web server (port 3000)

### Manual Setup

```bash
# Start infrastructure
docker compose -f docker-compose.dev.yml up -d

# Set up the database
cd packages/db
npx prisma db push
npx ts-node prisma/seed.ts
cd ../..

# Start the API server
cd apps/api
npm run dev

# In a new terminal — start the web app
cd apps/web
npm run dev

# (Optional) Start the AI service
cd apps/ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Default Login

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@haveloc.pro` | `admin123` |

---

## 📁 Project Structure

```
intervu/
├── apps/
│   ├── api/                  # NestJS Backend API (GraphQL + REST)
│   │   └── src/
│   │       └── modules/
│   │           ├── auth/       # Authentication & RBAC
│   │           ├── users/      # User management
│   │           ├── projects/   # Project CRUD
│   │           ├── tasks/      # Task management
│   │           ├── placements/ # Placement drives & matching
│   │           ├── analytics/  # Analytics & reporting
│   │           └── health/     # Health checks
│   ├── web/                  # Next.js Frontend
│   │   └── src/
│   │       ├── app/
│   │       │   ├── dashboard/  # Main dashboard pages
│   │       │   ├── placements/ # Placement management UI
│   │       │   └── login/      # Authentication pages
│   │       ├── components/     # Shared React components
│   │       └── lib/            # Utilities (auth, rbac)
│   └── ai-service/           # FastAPI AI Service
│       ├── app/                # Main application
│       │   ├── ai/             # AI agents (matching, prediction)
│       │   └── api/            # API endpoints
│       └── tests/              # Pytest test suite (81% coverage)
├── packages/
│   ├── db/                   # Prisma schema, migrations & seed
│   │   └── prisma/
│   │       ├── schema.prisma   # Full data model (20+ models)
│   │       └── seed.ts         # Database seed script
│   └── ui/                   # Shared UI component library
│       └── src/components/     # Button, Card, Badge, KPI, DataTable
├── infra/
│   ├── k8s/                  # Kubernetes manifests
│   └── terraform/            # Infrastructure as Code
├── docs/                     # Documentation
│   ├── PRD.md                # Product Requirements Document
│   ├── ARCHITECTURE.md       # C4 Architecture Diagrams
│   ├── TECH_RADAR.md         # Technology Radar
│   └── PRODUCT_BACKLOG.md    # Product Backlog
├── docker-compose.yml        # Full stack Docker Compose
├── docker-compose.dev.yml    # Dev-only (Postgres + Redis)
├── turbo.json                # TurboRepo configuration
└── package.json              # Root workspace package
```

---

## 📜 Available Scripts

From the root directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps and packages |
| `npm run lint` | Lint all apps and packages |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run all test suites |
| `npm run format` | Format code with Prettier |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:generate` | Generate Prisma client |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [PRD](docs/PRD.md) | Product Requirements Document — features, user stories, roadmap |
| [Architecture](docs/ARCHITECTURE.md) | C4 architecture diagrams and data flows |
| [Tech Radar](docs/TECH_RADAR.md) | Technology decisions and evaluation |
| [Product Backlog](docs/PRODUCT_BACKLOG.md) | Prioritized product backlog |

---

## 🧪 Testing

```bash
# AI Service (Python) — 81% code coverage
cd apps/ai-service
pytest --cov=app tests/ -v

# Full stack tests via TurboRepo
npm run test
```

---

## 🐳 Docker

```bash
# Development (Postgres + Redis only)
docker compose -f docker-compose.dev.yml up -d

# Full stack (all services)
docker compose up -d
```

---

## 🗺 Roadmap

| Quarter | Milestones |
|---------|-----------|
| **Q1 2026** | ✅ MVP — Core PM + Placements + AI Matching |
| **Q2 2026** | AI Agents + Predictive Engine + Bias Auditing |
| **Q3 2026** | Enterprise Integrations (100+) + Plugin Marketplace |
| **Q4 2026** | SOC 2 Certification + Multi-Region + Mobile App |
| **2027** | No-Code Workflows + FedRAMP + White-Label |
| **2028-2030** | Industry Verticals + Global Expansion + Autonomous AI |

---

## 📄 License

This project is **UNLICENSED** — proprietary software. All rights reserved.

---

<p align="center">
  Built with ❤️ by <strong>Garvit Saini</strong>
</p>
