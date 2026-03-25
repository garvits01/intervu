# Haveloc Pro — Architecture Document

**Version:** 1.0 | **Date:** 2026-02-16

---

## 1. C4 Context Diagram

```mermaid
graph TB
    subgraph External Users
        R[Campus Recruiter]
        S[Student / Candidate]
        H[Hiring Manager]
        P[Project Lead]
    end

    subgraph Haveloc Pro Platform
        HP[Haveloc Pro<br/>Web + Mobile + API]
    end

    subgraph External Systems
        LI[LinkedIn API]
        WD[Workday / SAP]
        GW[Google Workspace]
        EM[Email Services<br/>SendGrid]
        A0[Auth0 Identity]
        AI[OpenAI / Groq<br/>LLM Providers]
    end

    R --> HP
    S --> HP
    H --> HP
    P --> HP
    HP --> LI
    HP --> WD
    HP --> GW
    HP --> EM
    HP --> A0
    HP --> AI
```

---

## 2. C4 Container Diagram

```mermaid
graph TD
    subgraph Client Layer
        WEB[Web App<br/>Next.js 15 + React 19<br/>Port 3000]
        MOB[Mobile App<br/>React Native Expo]
        ADM[Admin Dashboard<br/>Next.js<br/>Port 3001]
    end

    subgraph API Gateway
        GW[Kong API Gateway<br/>Rate Limiting, Auth, Routing<br/>Port 8080]
    end

    subgraph Application Services
        API[Core API Service<br/>NestJS + GraphQL<br/>Port 4000]
        AIS[AI Service<br/>FastAPI + LangChain<br/>Port 8000]
        RT[Real-Time Service<br/>WebSocket Server<br/>Port 4001]
        NTF[Notification Service<br/>Event-Driven<br/>Port 4002]
    end

    subgraph Data Layer
        PG[(PostgreSQL 16<br/>+ pgvector<br/>+ TimescaleDB)]
        RD[(Redis 7<br/>Cache + Pub/Sub)]
        S3[(S3 / MinIO<br/>File Storage)]
        CH[(ClickHouse<br/>Analytics)]
    end

    subgraph Event Bus
        KF[Apache Kafka<br/>Event Streaming]
    end

    subgraph Observability
        PM[Prometheus]
        GF[Grafana]
        DD[DataDog APM]
    end

    WEB --> GW
    MOB --> GW
    ADM --> GW
    GW --> API
    GW --> AIS
    GW --> RT
    API --> PG
    API --> RD
    API --> S3
    API --> KF
    AIS --> PG
    AIS --> RD
    RT --> RD
    NTF --> KF
    KF --> CH
    PM -.-> API
    PM -.-> AIS
    GF -.-> PM
    DD -.-> GW
```

---

## 3. C4 Component Diagram — Core API Service

```mermaid
graph TD
    subgraph NestJS Core API
        AUTH[Auth Module<br/>JWT/Auth0 Guard]
        USR[User Module<br/>CRUD, RBAC, Profiles]
        ORG[Organization Module<br/>Multi-Tenant, Settings]
        PRJ[Project Module<br/>CRUD, Membership]
        TSK[Task Module<br/>CRUD, Assignments, Dependencies]
        PLC[Placement Module<br/>Drives, Registration, Matching]
        TPL[Template Module<br/>CRUD, Marketplace]
        ANL[Analytics Module<br/>Queries, Aggregations]
        NTF[Notification Module<br/>Email, Push, In-App]
        INT[Integration Module<br/>OAuth2, Webhooks]
    end

    subgraph Shared Infrastructure
        GQL[GraphQL Resolver Layer]
        PRS[Prisma Service<br/>DB Access]
        RDS[Redis Service<br/>Caching]
        EVT[Event Emitter<br/>Kafka Producer]
    end

    GQL --> AUTH
    GQL --> USR
    GQL --> ORG
    GQL --> PRJ
    GQL --> TSK
    GQL --> PLC
    GQL --> TPL
    GQL --> ANL
    AUTH --> PRS
    USR --> PRS
    ORG --> PRS
    PRJ --> PRS
    TSK --> PRS
    TSK --> RDS
    TSK --> EVT
    PLC --> PRS
    PLC --> EVT
    ANL --> RDS
    NTF --> EVT
```

---

## 4. Deployment Topology

```mermaid
graph TB
    subgraph AWS Region - US East
        subgraph VPC
            subgraph Public Subnet
                ALB[Application Load Balancer]
                CF[CloudFront CDN]
            end
            subgraph Private Subnet - EKS Cluster
                NG1[Node Group 1<br/>API + Web Pods]
                NG2[Node Group 2<br/>AI Service Pods<br/>GPU Instances]
                NG3[Node Group 3<br/>Workers<br/>Kafka Consumers]
            end
            subgraph Data Subnet
                RDS_PG[(RDS PostgreSQL<br/>Multi-AZ)]
                EC[(ElastiCache Redis<br/>Cluster Mode)]
                S3B[(S3 Bucket<br/>Assets + Uploads)]
            end
        end
    end

    USER[Users] --> CF
    CF --> ALB
    ALB --> NG1
    ALB --> NG2
    NG1 --> RDS_PG
    NG1 --> EC
    NG2 --> RDS_PG
    NG3 --> RDS_PG
    NG1 --> S3B
```

---

## 5. Data Flow — Placement Matching

```mermaid
sequenceDiagram
    participant Recruiter
    participant WebApp
    participant API
    participant AIService
    participant Postgres
    participant Redis

    Recruiter->>WebApp: Upload 500 resumes
    WebApp->>API: POST /placements/batch-upload
    API->>Postgres: Store raw resume files (S3 refs)
    API->>AIService: POST /parse-resumes (async via Kafka)
    AIService->>AIService: NLP extraction (skills, education, experience)
    AIService->>Postgres: Store parsed candidate profiles
    AIService->>API: Parsing complete (webhook)
    
    Recruiter->>WebApp: Click "AI Match"
    WebApp->>API: POST /placements/match
    API->>AIService: POST /match (candidates + jobs)
    AIService->>AIService: Generate embeddings (pgvector)
    AIService->>AIService: Cosine similarity + reranking (LLM)
    AIService->>AIService: Bias audit check
    AIService->>Redis: Cache match results (TTL: 1hr)
    AIService->>API: Return ranked matches
    API->>WebApp: Display match results + confidence scores
    Recruiter->>WebApp: Review and approve placements
```

---

## 6. Non-Functional Architecture Decisions

| Concern | Solution | Details |
|---------|----------|---------|
| **Rate Limiting** | Redis sliding window | 100 req/min per user, 1000 req/min per org |
| **Caching** | CDN (CloudFront) + Redis | Static assets: CDN, API responses: Redis (TTL-based) |
| **4xx/5xx Handling** | Global exception filter (NestJS) | Structured error responses, correlation IDs, Sentry alerts |
| **Circuit Breaker** | Resilience4j pattern | AI service calls wrapped in circuit breaker with fallback |
| **Idempotency** | Idempotency keys | All POST/PUT endpoints accept `Idempotency-Key` header |
| **Audit Logging** | Kafka → ClickHouse | All mutations logged with actor, timestamp, diff |
| **Multi-Tenancy** | Row-level security (Postgres RLS) | `org_id` column on all tables, enforced at DB level |

---

*Architecture approved for Phase 3 implementation.*
