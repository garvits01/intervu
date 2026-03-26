# Haveloc Pro — User Stories, Test Case Mapping & Gap Analysis

**Version:** 1.1 | **Date:** 2026-03-27 | **Author:** Garvit Saini  
**Status:** Refined post Sprint 1 Retrospective

---

## 1. Project Context Overview

**Haveloc Pro** is an AI-native enterprise platform for project management, team collaboration, and campus placement automation. Built as a TurboRepo monorepo, the architecture consists of three main services: a **Next.js 15 frontend** (web app), a **NestJS GraphQL/REST API** (backend), and a **FastAPI AI service** (Python, for resume parsing, candidate-job matching, and predictive analytics). The data layer uses **PostgreSQL 16** with Prisma ORM (20+ models covering users, organizations, projects, tasks, placement drives, jobs, candidate profiles, match results, notifications, templates, and audit logs), complemented by **Redis** for caching and **Kafka** for event-driven processing.

The platform targets four key personas: **Campus Recruiters** managing placement drives across hundreds of companies, **Students/Candidates** tracking application status and interview schedules, **Hiring Managers** reviewing AI-screened shortlists, and **Project Leads** coordinating team tasks and milestones. Core differentiators include AI-powered candidate-job matching with bias auditing, predictive delay forecasting, NLP resume parsing, and role-based multi-tenant access (SUPER_ADMIN, ADMIN, MEMBER, VIEWER).

As of Sprint 1 completion (late February 2026), the team has delivered authentication (US01-US02), interview scheduling (US03), recruitment pipeline tracking (US04), the main dashboard (US06), and core backend modules. The sprint retrospective highlighted that **all tasks were completed on time** and **team communication was seamless**, but **requirements changed mid-sprint**, prompting a process action item to build scope-change buffers and set stricter requirement finalization deadlines. Three stories (US07, US08, US09) are currently awaiting review, and four stories (US05, US10, Performance, UI) are in the sprint backlog for Sprint 2.

---

## 2. Sprint Retrospective — Key Themes

> Extracted from the Sprint 1 retrospective document.

| Category | Details |
|----------|---------|
| ✅ **What Went Well** | All tasks completed on time. Team communication was seamless. |
| ❌ **What Went Poorly** | Requirements changed mid-sprint, causing rework and context-switching. |
| 💡 **Ideas** | Plan for a buffer to handle scope changes — allocate ~15% sprint capacity for unplanned work. |
| 🎯 **Action Items** | Set stricter deadlines for finalizing requirements before sprint commitment. |

### Retrospective-Driven Stories

The retrospective insights led to two new process-focused stories (**US16**, **US17**) and influenced the scope/priority of existing stories. Sprint 2 planning should reserve buffer capacity per the "Ideas" column.

---

## 3. User Stories

### ✅ Completed (Sprint 1)

---

#### US01 — User Registration & Login
**As a** student, **I want to** register and log in to the system **so that** I can securely access and manage my interview details.

**Acceptance Criteria:**
- User can register with a valid email and password
- On login, system issues JWT access token (1hr) + refresh token (7d)
- Passwords hashed with bcrypt/scrypt (min 10 salt rounds)
- Validation errors shown for invalid email format, weak passwords, duplicate emails
- Login time recorded in `lastLoginAt` field
- User is redirected to dashboard on successful login

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 1 | ✅ Completed |

---

#### US02 — Auth0 SSO & Role-Based Access Control
**As an** admin, **I want** SSO login via Auth0 and role-based access control **so that** enterprise users authenticate securely and see only features allowed by their role.

**Acceptance Criteria:**
- Auth0 OAuth2/OIDC flow configured with tenant
- Four roles enforced: SUPER_ADMIN, ADMIN, MEMBER, VIEWER
- NestJS guards restrict API endpoints by role
- Frontend middleware redirects unauthorized users to login
- Token expiry: 1hr access / 7d refresh
- Session managed with secure cookie settings

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 1 | ✅ Completed |

---

#### US03 — Add Interview Details
**As a** recruiter, **I want to** add interview details for each placement drive round **so that** candidates and hiring managers can view schedules and panel information.

**Acceptance Criteria:**
- CRUD operations for interview entries (date, time, panel, location/link)
- Round-wise scheduling supported per drive
- Panel members can be assigned to specific interview slots
- Candidates see their interview schedule on their dashboard
- Notification triggered upon interview scheduling

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 1 | ✅ Completed |

---

#### US04 — Recruitment Stage Tracking
**As a** campus recruiter, **I want to** track candidates through recruitment stages (Applied → Shortlisted → Interviewed → Offered → Placed) **so that** I have real-time visibility into pipeline progress.

**Acceptance Criteria:**
- Five-stage lifecycle model implemented
- Status transitions validated (e.g., cannot skip from Applied to Placed)
- Pipeline dashboard widget shows stage-wise candidate counts
- Bulk status updates supported for batch operations
- Stage change triggers an audit log entry

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 1 | ✅ Completed |

---

#### US06 — Basic Dashboard View
**As an** admin, **I want** a centralized dashboard showing active drives, candidate stats, and recent activity **so that** I can monitor overall placement performance at a glance.

**Acceptance Criteria:**
- KPI cards display: active drives count, total candidates, total placements
- Recent activity notification feed visible on dashboard
- Data auto-refreshes on page load from API endpoints
- Responsive layout for desktop and tablet
- Page load LCP < 2s

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 1 | ✅ Completed |

---

### 🔍 Awaiting Review

---

#### US07 — Admin Company Management
**As an** admin, **I want to** add, edit, and manage recruiting companies within the platform **so that** placement drives can be linked to verified company profiles.

**Acceptance Criteria:**
- Company CRUD with organization-scoped isolation
- Company profile includes: name, logo, industry, website, contact details
- Companies can be linked to placement drives
- Search & filter by industry, location, and name
- Only ADMIN and SUPER_ADMIN roles can create/edit companies

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 2 | 🔍 Awaiting Review |

---

#### US08 — Admin Update Recruitment Stage
**As an** admin, **I want to** update a candidate's recruitment stage with notes and timestamps **so that** the placement pipeline accurately reflects each candidate's progress.

**Acceptance Criteria:**
- Admin stage update form with dropdown and notes field
- Each transition logged with timestamp and admin identity
- Only valid stage transitions allowed (validated server-side)
- Stage change history view accessible per candidate
- Audit trail stored for compliance

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 2 | 🔍 Awaiting Review |

---

#### US09 — Edit/Delete Interview Entries
**As a** recruiter, **I want to** edit or delete interview entries **so that** I can correct scheduling errors and keep interview data accurate.

**Acceptance Criteria:**
- Edit form pre-populated with existing interview data
- Soft-delete with confirmation dialog
- Cascade notifications sent to affected candidates on reschedule/cancel
- Audit log entry created for each edit/delete action
- Deleted interviews hidden from candidate view but retained in DB

| Priority | Sprint | Status |
|----------|--------|--------|
| Should | Sprint 2 | 🔍 Awaiting Review |

---

### 🏃 Sprint Backlog (Sprint 2)

---

#### US05 — Notifications & Reminders
**As a** user, **I want to** receive real-time notifications for task assignments, interview schedules, and placement updates **so that** I stay informed without manually checking each module.

**Acceptance Criteria:**
- Notification types: TASK_ASSIGNED, PLACEMENT_UPDATE, INTERVIEW_SCHEDULED, AI_INSIGHT, SYSTEM
- WebSocket delivery with < 2s latency from event trigger
- Mark-as-read functionality with read/unread indicators
- Email channel for critical alerts (interview reminders)
- Notification list loads within 500ms
- Support 1000+ unread notifications per user without degradation

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 2 | Not Started |

---

#### US10 — Mobile Responsiveness
**As a** student, **I want to** access the placement portal on my mobile device with a fully responsive UI **so that** I can check drive statuses and interview schedules on the go.

**Acceptance Criteria:**
- Responsive breakpoints for mobile (< 640px), tablet (640–1024px), desktop (> 1024px)
- Mobile hamburger navigation component
- Touch-friendly interactive elements (min 44px touch targets)
- Lighthouse mobile performance score ≥ 90 (LCP < 1.5s)
- Kanban and list views usable on small screens

| Priority | Sprint | Status |
|----------|--------|--------|
| Should | Sprint 2 | Not Started |

---

#### US11 — Performance Optimization
**As a** platform user, **I want** pages to load quickly and API responses to return within acceptable latency thresholds **so that** the platform feels fast and productive.

**Acceptance Criteria:**
- Redis caching for dashboard and drive data (TTL-based)
- Database query indexes on hot paths (tasks by projectId, notifications by userId)
- GraphQL DataLoader pattern for N+1 query prevention
- Next.js code splitting and lazy-loaded routes
- API latency: p50 < 50ms, p99 < 200ms
- Page LCP < 1.5s

| Priority | Sprint | Status |
|----------|--------|--------|
| Should | Sprint 2 | Not Started |

---

#### US12 — UI Polish & Accessibility
**As a** platform user, **I want** a polished, consistent UI with accessible components and smooth interactions **so that** the platform feels professional and enterprise-grade.

**Acceptance Criteria:**
- Design system consistency audit (spacing, colors, typography)
- Keyboard navigation and focus indicators on all interactive elements
- ARIA labels on all form inputs and buttons
- Color contrast ≥ 4.5:1 (WCAG 2.2 AA)
- Hover effects and transition animations on interactive elements
- No axe-core accessibility violations on core pages

| Priority | Sprint | Status |
|----------|--------|--------|
| Could | Sprint 2 | Not Started |

---

### 📋 Product Backlog (Future Sprints)

---

#### US13 — Granular Role-Based Access (RBAC + ABAC)
**As an** admin, **I want** granular role-based access with attribute-level permissions (RBAC + ABAC) **so that** sensitive placement data is visible only to authorized personnel within each organization.

**Acceptance Criteria:**
- ABAC policy engine scoping by org, department, and drive
- Admin UI for custom role creation and permission assignment
- Per-feature permission matrix for all modules
- API-level tenant permission enforcement
- Existing RBAC backward-compatible

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 3 | Not Started |

---

#### US14 — Advanced Analytics Dashboard
**As an** executive sponsor, **I want** advanced analytics with AI-powered placement forecasting and trend analysis **so that** I can proactively intervene before targets are missed.

**Acceptance Criteria:**
- Predictive placement rate forecasting (ML model integration)
- Trend charts: placement velocity, company-wise conversion rates (Recharts)
- PDF/CSV report export with optional scheduled email delivery
- Executive summary view with top-level metrics and risk indicators
- Forecast confidence intervals displayed

| Priority | Sprint | Status |
|----------|--------|--------|
| Should | Sprint 3 | Not Started |

---

#### US15 — Email Integration for Notifications
**As a** recruiter, **I want** automated email notifications sent to candidates for drive registrations, interview reminders, and placement results **so that** communication is timely without manual effort.

**Acceptance Criteria:**
- SendGrid API integration for transactional email
- Email templates for: registration confirmation, interview reminder, result notification
- User-configurable email preferences (opt-in / opt-out per type)
- Event-driven async email dispatch via Kafka consumer
- Email delivery status tracking (sent, delivered, bounced)

| Priority | Sprint | Status |
|----------|--------|--------|
| Should | Sprint 3 | Not Started |

---

#### US16 — Sprint Scope Change Buffer *(Process)*
**As a** dev team, **I want** a defined scope change process with buffer capacity **so that** mid-sprint requirement changes don't derail committed work.

> *Driven by Sprint 1 retrospective: "Requirements changed mid-sprint."*

**Acceptance Criteria:**
- Reserve ~15% of sprint capacity as buffer for unplanned work
- Scope change requests go through PO approval before mid-sprint inclusion
- Change impact documented (effort, risk, affected stories)
- Metrics tracked: # of scope changes per sprint, buffer utilization %
- Team retrospective reviews buffer effectiveness each sprint

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 2 (Process) | Not Started |

---

#### US17 — Requirements Finalization Deadline *(Process)*
**As a** product owner, **I want** a strict requirements-finalization deadline (48h before sprint start) **so that** the development team has a stable scope to commit to.

> *Driven by Sprint 1 retrospective: "Set stricter deadlines for finalizing requirements."*

**Acceptance Criteria:**
- Requirements freeze 48 hours before sprint planning
- All user stories must have complete acceptance criteria before freeze
- Any post-freeze changes follow the scope change process (US16)
- PO signs off on sprint scope at planning meeting
- Violations tracked and reviewed in retrospective

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 2 (Process) | Not Started |

---

#### US18 — Password Recovery / Forgot Password
**As a** user, **I want to** reset my password via email **so that** I can regain access to my account if I forget my credentials.

> *Derived from functional test case TC-02 (Password Recovery), which has no corresponding user story in the backlog.*

**Acceptance Criteria:**
- "Forgot Password" link visible on login page
- System sends password reset email to registered email address
- Reset link expires after 30 minutes
- Link redirects to password reset page
- New password must meet strength requirements
- Confirmation message shown after successful reset

| Priority | Sprint | Status |
|----------|--------|--------|
| Must | Sprint 2 | Not Started |

---

## 4. User Story ↔ Test Case Mapping

### Existing Functional Test Cases

| Test Case ID | Feature | Test Case Name | Status | Mapped User Story |
|--------------|---------|----------------|--------|-------------------|
| TC-01 | User Login | Valid User Login | ✅ Pass | **US01** — User Registration & Login |
| TC-02 | Password Recovery | Forgot Password | ✅ Pass | **US18** — Password Recovery *(new story created)* |

> **Inconsistency found:** TC-02 (Password Recovery) tests functionality that was not tracked as a separate user story. The existing US01 covers registration and login but does not explicitly include password recovery. **Resolution:** Created **US18** to formally cover this feature and ensure it is planned, tracked, and tested independently.

### Proposed Test Case Extensions

The table below proposes additional test cases needed to achieve adequate coverage across all user stories.

| Proposed TC ID | User Story | Test Case Name | Description |
|----------------|-----------|----------------|-------------|
| TC-03 | US01 | Invalid Login (wrong password) | Enter valid email + wrong password → error message displayed |
| TC-04 | US01 | Registration with duplicate email | Attempt to register with existing email → validation error |
| TC-05 | US01 | Registration with weak password | Enter password < 8 chars → strength validation error |
| TC-06 | US02 | Auth0 SSO Login | Login via Auth0 → redirected to dashboard with correct role |
| TC-07 | US02 | Role-restricted route access | VIEWER accesses admin route → redirected to unauthorized page |
| TC-08 | US02 | Token expiry and refresh | Access token expires → refresh token issues new access token |
| TC-09 | US03 | Create interview entry | Add interview with date, panel, link → saved and visible to candidate |
| TC-10 | US03 | Schedule conflict detection | Add interview overlapping existing slot → warning displayed |
| TC-11 | US04 | Valid stage transition | Move candidate Applied → Shortlisted → success |
| TC-12 | US04 | Invalid stage transition | Move candidate Applied → Placed (skipping stages) → error |
| TC-13 | US04 | Bulk stage update | Select 10 candidates → bulk update to Shortlisted → all updated |
| TC-14 | US06 | Dashboard data load | Login as admin → KPI cards show correct counts from API |
| TC-15 | US06 | Dashboard responsiveness | Resize to tablet width → layout adapts without overflow |
| TC-16 | US07 | Create company profile | Admin adds company with details → saved and searchable |
| TC-17 | US07 | Non-admin company creation | MEMBER attempts to create company → access denied |
| TC-18 | US08 | Stage update with notes | Admin updates stage + adds note → note visible in history |
| TC-19 | US09 | Edit interview entry | Edit interview time → candidates notified of change |
| TC-20 | US09 | Delete interview with confirmation | Delete interview → confirmation modal → soft-deleted |
| TC-21 | US05 | Real-time notification delivery | Assign task → notification appears within 2s via WebSocket |
| TC-22 | US05 | Mark notification as read | Click notification → marked as read, visual indicator changes |
| TC-23 | US10 | Mobile navigation | Open on 375px screen → hamburger menu works correctly |
| TC-24 | US18 | Password reset with expired link | Click expired reset link (> 30min) → error message shown |
| TC-25 | US18 | Password reset with invalid email | Enter unregistered email → generic "email sent" message (no info leak) |

---

## 5. Gaps and Recommendations

### 5.1 Missing User Stories (identified from test cases / codebase)

| Gap | Source | Recommendation |
|-----|--------|----------------|
| **Password Recovery** | TC-02 exists but no story covered it | ✅ Created **US18** |
| **Candidate Self-Service Portal** | Prisma schema has `CandidateProfile` with rich fields, but no story for candidate-facing features beyond resume upload | Consider adding a story for candidates to view match scores, drive statuses, and interview schedules |
| **Organization Management** | Schema has `Organization` model with slug, plan, settings, but no story for org admin CRUD | Consider adding if multi-org onboarding is a near-term goal |
| **Integration Management** | `Integration` model exists in schema with OAuth tokens, but no story covers third-party integrations | Backlog for Sprint 4+ |

### 5.2 Stories Lacking Sufficient Test Coverage

| User Story | Current Coverage | Recommended Action |
|------------|-----------------|-------------------|
| **US02** (Auth0 SSO & RBAC) | 0 test cases | Add TC-06, TC-07, TC-08 — critical security feature |
| **US04** (Stage Tracking) | 0 test cases | Add TC-11, TC-12, TC-13 — core business logic |
| **US05** (Notifications) | 0 test cases | Add TC-21, TC-22 — real-time testing required |
| **US06** (Dashboard) | 0 test cases | Add TC-14, TC-15 — high-visibility feature |
| **US07** (Company Mgmt) | 0 test cases | Add TC-16, TC-17 — includes authorization check |
| **US11** (Performance) | 0 test cases | Add Lighthouse CI, k6 load tests (automated) |
| **US12** (Accessibility) | 0 test cases | Add axe-core automated scan in CI pipeline |

### 5.3 Inconsistencies Found

| Issue | Details | Resolution |
|-------|---------|------------|
| **US numbering gap** | US05 exists in Sprint Backlog but MS Planner progression jumps US05 → US06 (both from Sprint 1). US05 was not in Sprint 1 despite appearing in the same timeline. | US05 was intentionally deferred to Sprint 2 — the backlog correctly reflects this. No action needed. |
| **Password in docker-compose** | `docker-compose.dev.yml` has `POSTGRES_PASSWORD: haveloc_dev_2026`, which differs from `docker-compose.yml`'s `haveloc_dev`. The `.env` file uses `haveloc_dev_2026`. | Standardize to `haveloc_dev_2026` across all files, or use environment variable injection in both compose files. |
| **Seed default credentials** | `start.bat` prints `admin@haveloc.pro / admin123` as login credentials, and seed script confirms this. These match the test case TC-01. | Acceptable for dev — add a US or tech task for production credential management before any staging/production deployment. |

### 5.4 Critical Risks & Dependencies

| Risk | Severity | Mitigation |
|------|----------|------------|
| **WebSocket infrastructure** (US05) depends on Redis pub/sub being stable | High | Validate Redis connection resilience before Sprint 2 notifications work begins |
| **AI service availability** for matching features (US14) | Medium | AI service has 81% test coverage, but no integration tests with the NestJS API — add e2e test |
| **Mid-sprint scope creep** (Retro insight) | Medium | Enforce US16 + US17 process stories starting Sprint 2 |
| **Mobile responsiveness** (US10) touching all pages | Medium | Prioritize core pages (login, dashboard, drives) — defer admin pages to Sprint 3 |
| **No E2E test framework** currently in place | High | Adopt Playwright for browser testing; add to CI before Sprint 2 completion |

---

## 6. Summary Table — All User Stories

| ID | Title | Priority | Sprint | Status |
|----|-------|----------|--------|--------|
| US01 | User Registration & Login | Must | Sprint 1 | ✅ Completed |
| US02 | Auth0 SSO & RBAC | Must | Sprint 1 | ✅ Completed |
| US03 | Add Interview Details | Must | Sprint 1 | ✅ Completed |
| US04 | Recruitment Stage Tracking | Must | Sprint 1 | ✅ Completed |
| US05 | Notifications & Reminders | Must | Sprint 2 | Not Started |
| US06 | Basic Dashboard View | Must | Sprint 1 | ✅ Completed |
| US07 | Admin Company Management | Must | Sprint 2 | 🔍 Awaiting Review |
| US08 | Admin Update Recruitment Stage | Must | Sprint 2 | 🔍 Awaiting Review |
| US09 | Edit/Delete Interview Entries | Should | Sprint 2 | 🔍 Awaiting Review |
| US10 | Mobile Responsiveness | Should | Sprint 2 | Not Started |
| US11 | Performance Optimization | Should | Sprint 2 | Not Started |
| US12 | UI Polish & Accessibility | Could | Sprint 2 | Not Started |
| US13 | Granular RBAC + ABAC | Must | Sprint 3 | Not Started |
| US14 | Advanced Analytics Dashboard | Should | Sprint 3 | Not Started |
| US15 | Email Integration for Notifications | Should | Sprint 3 | Not Started |
| US16 | Sprint Scope Change Buffer *(Process)* | Must | Sprint 2 | Not Started |
| US17 | Requirements Finalization Deadline *(Process)* | Must | Sprint 2 | Not Started |
| US18 | Password Recovery / Forgot Password | Must | Sprint 2 | Not Started |
