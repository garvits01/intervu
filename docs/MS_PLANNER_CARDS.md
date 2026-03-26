# Haveloc Pro — MS Planner Card Contents

> Copy-paste ready for each task card. Format matches your US01 sample exactly.

---

## ✅ Bucket: Completed

---

### US01 – User Registration & Login

| Field | Value |
|-------|-------|
| Bucket | Completed |
| Progress | Completed |
| Priority | Important |
| Start date | 02/27/2026 |
| Due date | 03/01/2026 |

**Notes:**

**User Story:**
As a student, I want to register and log in to the system, so that I can securely access and manage my interview details.

**Implementation Summary:**
- Registration form created
- Login authentication implemented
- Password encryption added
- Validation & error handling completed

**Checklist:**
- [x] Registration form with email/password
- [x] JWT access + refresh token flow
- [x] Password hashing (bcrypt)
- [x] Error handling & validation messages

---

### US02 – Auth0 SSO & Role-Based Access

| Field | Value |
|-------|-------|
| Bucket | Completed |
| Progress | Completed |
| Priority | Important |
| Start date | 02/27/2026 |
| Due date | 03/01/2026 |

**Notes:**

**User Story:**
As an admin, I want SSO login via Auth0 and role-based access control, so that enterprise users authenticate securely and see only features allowed by their role.

**Implementation Summary:**
- Auth0 OAuth2/OIDC integration configured
- RBAC middleware with role guards implemented (SUPER_ADMIN, ADMIN, MEMBER, VIEWER)
- Session management with secure cookie settings
- Route-level access restrictions enforced

**Checklist:**
- [x] Auth0 tenant setup & OAuth2 flow
- [x] Role definitions & NestJS guards
- [x] Protected route enforcement
- [x] Token expiry (1hr access / 7d refresh)

---

### US03 – Add Interview Details

| Field | Value |
|-------|-------|
| Bucket | Completed |
| Progress | Completed |
| Priority | Important |
| Start date | 02/27/2026 |
| Due date | 03/01/2026 |

**Notes:**

**User Story:**
As a recruiter, I want to add interview details for each placement drive round, so that candidates and hiring managers can view schedules and panel information.

**Implementation Summary:**
- Interview scheduling form created
- Round-wise interview details model implemented
- Panel assignment and room/link allocation added
- Candidate notification triggers configured

**Checklist:**
- [x] Interview CRUD (date, time, panel, location/link)
- [x] Round-wise scheduling per drive
- [x] Panel member assignment
- [x] Candidate view of interview schedule

---

### US04 – Recruitment Stage Tracking

| Field | Value |
|-------|-------|
| Bucket | Completed |
| Progress | Completed |
| Priority | Important |
| Start date | 02/28/2026 |
| Due date | 03/01/2026 |

**Notes:**

**User Story:**
As a campus recruiter, I want to track candidates through recruitment stages (Applied → Shortlisted → Interviewed → Offered → Placed), so that I have real-time visibility into pipeline progress.

**Implementation Summary:**
- Stage lifecycle model implemented
- Candidate status transitions with validation
- Pipeline dashboard with stage-wise counts
- Bulk status update functionality added

**Checklist:**
- [x] Recruitment stage model (5 stages)
- [x] Status transition validation logic
- [x] Pipeline count dashboard widget
- [x] Bulk candidate stage updates

---

### US06 – Basic Dashboard View

| Field | Value |
|-------|-------|
| Bucket | Completed |
| Progress | Completed |
| Priority | Medium |
| Start date | 02/28/2026 |
| Due date | 03/01/2026 |

**Notes:**

**User Story:**
As an admin, I want a centralized dashboard showing active drives, candidate stats, and recent activity, so that I can monitor overall placement performance at a glance.

**Implementation Summary:**
- Dashboard layout with KPI cards created
- Active drives count & candidate statistics displayed
- Recent activity feed integrated
- Data auto-refresh on page load implemented

**Checklist:**
- [x] KPI cards (active drives, total candidates, placements)
- [x] Recent activity notification feed
- [x] Data fetching from API endpoints
- [x] Responsive layout for desktop & tablet

---

## 🔍 Bucket: Awaiting Review

---

### US07 – Admin Company Management

| Field | Value |
|-------|-------|
| Bucket | Awaiting Review |
| Progress | In progress |
| Priority | Important |
| Start date | 03/01/2026 |
| Due date | 03/03/2026 |

**Notes:**

**User Story:**
As an admin, I want to add, edit, and manage recruiting companies within the platform, so that placement drives can be linked to verified company profiles.

**Implementation Summary:**
- Company CRUD with org-scoped isolation
- Company profile with logo, industry, and contact details
- Company-to-drive linking implemented
- Search & filter by industry/location added

**Checklist:**
- [ ] Company model (name, logo, industry, website, contact)
- [ ] CRUD API endpoints with org scoping
- [ ] Company listing with search & filters
- [ ] Link companies to placement drives

---

### US08 – Admin Update Recruitment Stage

| Field | Value |
|-------|-------|
| Bucket | Awaiting Review |
| Progress | In progress |
| Priority | Important |
| Start date | 03/01/2026 |
| Due date | 03/03/2026 |

**Notes:**

**User Story:**
As an admin, I want to update a candidate's recruitment stage with notes and timestamps, so that the placement pipeline accurately reflects each candidate's progress.

**Implementation Summary:**
- Admin stage update form with validation
- Stage transition logging with timestamps
- Notes/comments per stage transition captured
- Audit trail of all stage changes stored

**Checklist:**
- [ ] Stage update form with dropdown & notes field
- [ ] Timestamp logging per transition
- [ ] Validation for allowed stage transitions
- [ ] Stage change history view

---

### US09 – Edit/Delete Interview Entries

| Field | Value |
|-------|-------|
| Bucket | Awaiting Review |
| Progress | In progress |
| Priority | Medium |
| Start date | 03/01/2026 |
| Due date | 03/03/2026 |

**Notes:**

**User Story:**
As a recruiter, I want to edit or delete interview entries, so that I can correct scheduling errors and keep interview data accurate.

**Implementation Summary:**
- Edit interview form pre-populated with existing data
- Soft-delete with confirmation dialog implemented
- Cascade update notifications to affected candidates
- Audit log entry created for each edit/delete action

**Checklist:**
- [ ] Edit form with pre-filled interview details
- [ ] Delete with confirmation modal
- [ ] Notification trigger on reschedule/cancellation
- [ ] Audit log for edit/delete operations

---

## 🏃 Bucket: Sprint Backlog

---

### US05 – Notification & Reminders

| Field | Value |
|-------|-------|
| Bucket | Sprint Backlog |
| Progress | Not started |
| Priority | Important |
| Start date | 03/03/2026 |
| Due date | 03/07/2026 |

**Notes:**

**User Story:**
As a user, I want to receive real-time notifications for task assignments, interview schedules, and placement updates, so that I stay informed without manually checking each module.

**Implementation Summary:**
- In-app notification system with WebSocket delivery
- Notification types: TASK_ASSIGNED, PLACEMENT_UPDATE, INTERVIEW_SCHEDULED, AI_INSIGHT, SYSTEM
- Mark-as-read with read/unread indicators
- Email notification channel for critical alerts

**Checklist:**
- [ ] Notification model (type, title, body, isRead)
- [ ] WebSocket real-time delivery (<2s)
- [ ] Mark-as-read functionality
- [ ] Email triggers for interview reminders

---

### US10 – Mobile Responsiveness

| Field | Value |
|-------|-------|
| Bucket | Sprint Backlog |
| Progress | Not started |
| Priority | Medium |
| Start date | 03/03/2026 |
| Due date | 03/07/2026 |

**Notes:**

**User Story:**
As a student, I want to access the placement portal on my mobile device with a fully responsive UI, so that I can check drive statuses and interview schedules on the go.

**Implementation Summary:**
- Responsive layouts for all core pages (dashboard, drives, profile)
- Touch-friendly Kanban and list views
- Mobile navigation with hamburger menu
- Optimized LCP < 1.5s on mobile networks

**Checklist:**
- [ ] Responsive breakpoints for mobile/tablet/desktop
- [ ] Mobile navigation component
- [ ] Touch-friendly interactive elements
- [ ] Lighthouse mobile performance audit (LCP < 1.5s)

---

### Performance Optimization

| Field | Value |
|-------|-------|
| Bucket | Sprint Backlog |
| Progress | Not started |
| Priority | Medium |
| Start date | 03/03/2026 |
| Due date | 03/07/2026 |

**Notes:**

**User Story:**
As a platform user, I want pages to load quickly and API responses to return within acceptable latency thresholds, so that the platform feels fast and productive.

**Implementation Summary:**
- Redis caching layer for frequently accessed queries
- API response optimization with DataLoader pattern for GraphQL
- Database query indexing on hot paths
- Frontend code splitting and lazy loading

**Checklist:**
- [ ] Redis caching for dashboard & drive data (TTL-based)
- [ ] Database index optimization on hot queries
- [ ] GraphQL DataLoader for N+1 prevention
- [ ] Next.js code splitting & lazy-loaded routes

---

### UI Improvements

| Field | Value |
|-------|-------|
| Bucket | Sprint Backlog |
| Progress | Not started |
| Priority | Low |
| Start date | 03/03/2026 |
| Due date | 03/07/2026 |

**Notes:**

**User Story:**
As a platform user, I want a polished, consistent UI with accessible components and smooth interactions, so that the platform feels professional and enterprise-grade.

**Implementation Summary:**
- Design system consistency audit and fixes
- shadcn/ui component library refinements
- WCAG 2.2 AA accessibility improvements (keyboard nav, ARIA labels, contrast)
- Micro-animations and transition polish

**Checklist:**
- [ ] Component library audit (spacing, colors, typography)
- [ ] Keyboard navigation & focus indicators
- [ ] ARIA labels & color contrast ≥ 4.5:1
- [ ] Hover effects & transition animations

---

## 📋 Bucket: Product Backlog

---

### Role-Based Access Improvements

| Field | Value |
|-------|-------|
| Bucket | Product Backlog |
| Progress | Not started |
| Priority | Important |
| Start date | — |
| Due date | — |

**Notes:**

**User Story:**
As an admin, I want granular role-based access with attribute-level permissions (RBAC + ABAC), so that sensitive placement data is visible only to authorized personnel within each organization.

**Implementation Summary:**
- Extend RBAC with attribute-based rules (org, department, drive)
- Per-feature permission matrix for all roles
- Admin UI for custom role creation
- Tenant-scoped permission enforcement at API layer

**Checklist:**
- [ ] ABAC policy engine (org, department scoping)
- [ ] Custom role creation UI for admins
- [ ] Permission matrix per feature module
- [ ] API-level tenant permission enforcement

---

### Advanced Analytics Dashboard

| Field | Value |
|-------|-------|
| Bucket | Product Backlog |
| Progress | Not started |
| Priority | Medium |
| Start date | — |
| Due date | — |

**Notes:**

**User Story:**
As an executive sponsor, I want advanced analytics with AI-powered placement forecasting and trend analysis, so that I can proactively intervene before targets are missed.

**Implementation Summary:**
- Predictive placement rate forecasting (ML-based)
- Trend charts for placement velocity, company-wise conversion rates
- Exportable reports in PDF/CSV with scheduled email delivery
- Recharts-based interactive visualizations

**Checklist:**
- [ ] Placement forecasting model integration
- [ ] Trend analysis charts (Recharts)
- [ ] PDF/CSV report export with scheduling
- [ ] Executive summary dashboard view

---

### Email Integration for Notifications

| Field | Value |
|-------|-------|
| Bucket | Product Backlog |
| Progress | Not started |
| Priority | Medium |
| Start date | — |
| Due date | — |

**Notes:**

**User Story:**
As a recruiter, I want automated email notifications sent to candidates for drive registrations, interview reminders, and placement results, so that communication is timely without manual effort.

**Implementation Summary:**
- SendGrid email service integration
- Email templates for drive, interview, and result notifications
- Configurable email preferences per user
- Event-driven email triggers via Kafka consumer

**Checklist:**
- [ ] SendGrid API integration
- [ ] Email templates (registration, reminder, result)
- [ ] User email preference settings
- [ ] Kafka-driven async email dispatch
