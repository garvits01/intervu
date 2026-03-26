# Haveloc Pro — Detailed User Stories, Test Cases, and Retrospectives

**Date:** 2026-03-27 | **Author:** Garvit Saini
**Status:** Generated post Sprint 1

---

## Part 1: Completed Stories (Sprint 1)

### US01 – User Registration & Login

**1. User Story Description**
**As a** student, **I want to** register and log in to the system, **so that** I can securely access and manage my interview details.
- **Priority:** Important | **Sprint:** Sprint 1
- **Checklist:** Registration form with email/password, JWT access + refresh token flow, Password hashing (bcrypt), Error handling & validation messages.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| User Registration | Valid Registration | 1. Open registration page.<br>2. Enter valid email and strong password.<br>3. Click "Register". | System creates account, hashes password, and redirects to login/dashboard. Success message shown. | System creates account, redirects to dashboard. | Pass | Password hashed in DB using bcrypt. |
| User Registration | Invalid Email Format | 1. Open registration page.<br>2. Enter "invalid-email" and password.<br>3. Click "Register". | System displays validation error for email format. Account is not created. | Application shows "Invalid email format" inline error. | Pass | Handled by frontend + backend validation. |
| User Registration | Duplicate Email | 1. Open registration page.<br>2. Enter an already registered email.<br>3. Click "Register". | System rejects registration and shows "Email already in use" error. | System rejects registration, shows duplicate email error. | Pass | Prevents duplicate accounts. |
| User Login | Valid Login | 1. Open login page.<br>2. Enter valid email and password.<br>3. Click "Login". | System authenticates user, issues JWT tokens, redirects to dashboard. | User authenticated, redirected to dashboard. | Pass | JWT access (1hr) and refresh (7d) tokens generated. `lastLoginAt` updated. |
| User Login | Invalid Password | 1. Open login page.<br>2. Enter valid email, wrong password.<br>3. Click "Login". | System denies access and shows "Invalid credentials" error message. | System shows "Invalid credentials". | Pass | Generic error message to prevent email enumeration. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| JWT authentication and bcrypt integration was smooth due to NestJS built-in guards. | Handling the refresh token rotation mechanism took longer than expected due to edge cases in cookie management. | Extract the token rotation logic into a standalone utility for easier testing and reuse. | Document the exact cookie config (SameSite, Secure) required for the frontend-backend token exchange. |

---

### US02 – Auth0 SSO & Role-Based Access

**1. User Story Description**
**As an admin**, **I want** SSO login via Auth0 and role-based access control, **so that** enterprise users authenticate securely and see only features allowed by their role.
- **Priority:** Important | **Sprint:** Sprint 1
- **Checklist:** Auth0 tenant setup & OAuth2 flow, Role definitions & NestJS guards (SUPER_ADMIN, ADMIN, MEMBER, VIEWER), Protected route enforcement, Token expiry.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Auth0 SSO | Enterprise SSO Login | 1. Click "Login with Auth0".<br>2. Complete flow on Auth0 page.<br>3. Return to app. | User is authenticated via OAuth2 and redirected to dashboard. User profile is synced. | User authenticated and redirected. Profile initialized. | Pass | Auth0 tenant correctly configured with callback URLs. |
| RBAC | Admin Access | 1. Login as User with `ADMIN` role.<br>2. Navigate to Admin Company Management settings. | User can access and view the admin settings page. | User successfully accesses admin pages. | Pass | NestJS `RolesGuard` allows access. |
| RBAC | Unauthorized Access | 1. Login as User with `VIEWER` role.<br>2. Attempt to POST to `/api/companies` or access admin UI. | API returns 403 Forbidden. Frontend redirects to unauthorized/dashboard page. | API returns 403. Frontend blocks view. | Pass | Guards actively block lower-tier roles from mutation endpoints. |
| Session | Token Expiry | 1. Login and wait 1 hour for access token to expire.<br>2. Make an API request. | App automatically uses refresh token to get a new access token and fulfills the request. | App seamlessly refreshes token and completes request. | Pass | Silent token refresh working as expected. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| NestJS custom decorators made applying roles to routes extremely clean (`@Roles(Role.ADMIN)`). | Initial Auth0 configuration had mismatched callback URLs between local dev and the Auth0 tenant settings. | Use terraform or scripts to manage Auth0 tenant configurations across dev/prod environments automatically. | Create a standardized checklist for environment variable setup for new developers onboarding to the auth flow. |

---

### US03 – Add Interview Details

**1. User Story Description**
**As a** recruiter, **I want to** add interview details for each placement drive round, **so that** candidates and hiring managers can view schedules and panel information.
- **Priority:** Important | **Sprint:** Sprint 1
- **Checklist:** Interview CRUD (date, time, panel, location/link), Round-wise scheduling per drive, Panel member assignment, Candidate view of interview schedule.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Interview Mgmt | Create Interview Slot | 1. Go to drive details.<br>2. Click "Add Interview".<br>3. Fill date, time, panel ID, link.<br>4. Submit. | Interview slot is saved against the placement drive. Success notification shown. | Slot saved to database. Success toast displayed. | Pass | `PlacementDrive` correctly linked to interview entity. |
| Interview Mgmt | Conflicting Schedule | 1. Attempt to schedule Panel A at 10:00 AM.<br>2. Attempt to schedule Panel A again at 10:00 AM on the same day. | System detects conflict and shows warning: "Panel member already booked for this time." | System blocks creation and shows conflict warning. | Pass | Conflict validation logic applied on panel assignment. |
| Candidate View | View Schedule | 1. Login as Candidate assigned to an interview round.<br>2. Navigate to Dashboard. | Candidate sees their scheduled interview date, time, and meeting link. | Candidate sees correct interview details on dashboard. | Pass | UI filters interviews by `candidateId`. |
| Notifications | Trigger on Create | 1. Recruiter creates interview entry for Candidate A.<br>2. Candidate A logs in. | A notification is generated alerting Candidate A of the new interview schedule. | Notification generated and visible in Candidate A's feed. | Pass | Integrated with notification service hooks. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Integrating the forms with the UI library went quickly; form validation was robust. | Timezone handling caused bugs where candidates saw interviews offset by several hours. | Enforce strict UTC storage for all DateTimes and only localize on the frontend client. | Update all Prisma schemas to explicitly note UTC expectations and audit frontend date parsing logic. |

---

### US04 – Recruitment Stage Tracking

**1. User Story Description**
**As a** campus recruiter, **I want to** track candidates through recruitment stages (Applied → Shortlisted → Interviewed → Offered → Placed), **so that** I have real-time visibility into pipeline progress.
- **Priority:** Important | **Sprint:** Sprint 1
- **Checklist:** Recruitment stage model (5 stages), Status transition validation logic, Pipeline count dashboard widget, Bulk candidate stage updates.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Pipeline | Valid Stage Transition | 1. View candidate in "Applied".<br>2. Update status to "Shortlisted". | Status successfully updates. Audit log records transition. | Status updated to Shortlisted. | Pass | Database enum tracking status correctly updates. |
| Pipeline | Invalid Transition | 1. View candidate in "Applied".<br>2. Attempt to update directly to "Placed". | System blocks the update and warns that stages cannot be skipped. | System rejects update, shows validation error. | Pass | State machine validation working. |
| Pipeline | Bulk Update | 1. Select 5 candidates in "Shortlisted" stage.<br>2. Click Bulk Update -> "Interviewed". | All 5 candidates successfully update to "Interviewed" stage simultaneously. | 5 candidates updated to Interviewed. | Pass | Batch update API handles multiple IDs efficiently. |
| Dashboard | Pipeline Counts | 1. Dashboard loads pipeline widget.<br>2. Check counts against actual candidate statuses. | Widget accurately displays totals (e.g., 50 Applied, 10 Shortlisted). | Widget shows correct aggregated counts. | Pass | GroupBy query performance is within acceptable limits. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Bulk update API endpoint was highly optimized using Prisma's `updateMany`. | The rules for "Invalid Transitions" changed mid-sprint, requiring a rework of the validation logic. | Use a configurable state machine library or JSON-defined transitions rather than hardcoding logic. | Plan a buffer for scope changes; enforce requirements freeze 48h before the sprint starts. |

---

### US06 – Basic Dashboard View

**1. User Story Description**
**As an** admin, **I want** a centralized dashboard showing active drives, candidate stats, and recent activity, **so that** I can monitor overall placement performance at a glance.
- **Priority:** Medium | **Sprint:** Sprint 1
- **Checklist:** KPI cards (active drives, total candidates, placements), Recent activity notification feed, Data fetching from API endpoints, Responsive layout.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| KPI Metrics | Verify Data Accuracy | 1. Login as Admin.<br>2. View KPI cards (Active Drives, Total Candidates). | Numbers exactly match the current database records for the organization. | Numbers match DB state. | Pass | API aggregates data efficiently. |
| Layout | Responsive Design | 1. Open dashboard on desktop browser.<br>2. Resize window to tablet/mobile width. | Grid layouts reflow into a single column. KPI cards stack vertically without overflow. | UI reflows correctly layout stacking works. | Pass | Tailwind grid/flex classes applied properly. |
| Activity Feed | Data Fetching | 1. Trigger a background system event (e.g. dummy placement update).<br>2. Refresh Dashboard. | The recent activity feed displays the newly created event at the top of the list. | Activity feed shows new event upon refresh. | Pass | Fetches latest `Notification` or `ActivityLog` entries. |
| Performance | Page Load Speed | 1. Load the dashboard page. | Dashboard renders all primary structure and KPI data within 2 seconds (LCP < 2s). | Dashboard loads in ~1.2 seconds. | Pass | Skeleton loaders used while fetching data. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Implementing skeleton loaders dramatically improved the perceived performance of the dashboard. | Initially fetching all KPI statistics sequentially caused the dashboard to load slowly. | Use `Promise.all` on the backend, or GraphQL aliases to fetch all KPI aggregates concurrently. | Refactored the dashboard API controller to resolve data dependencies in parallel. |

---

## Part 2: Awaiting Review

### US07 – Admin Company Management

**1. User Story Description**
**As an** admin, **I want to** add, edit, and manage recruiting companies within the platform, **so that** placement drives can be linked to verified company profiles.
- **Priority:** Important | **Sprint:** Sprint 2 
- **Checklist:** Company model (name, logo, industry, website, contact), CRUD API endpoints with org scoping, Company listing with search & filters, Link companies to placement drives.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Company CRUD | Create Company | 1. Login as Admin.<br>2. Go to Companies -> Add New.<br>3. Fill in name, industry, website.<br>4. Click Save. | Company is created and appears in the organization's company list. | Company created successfully. | Pass | Ensure `orgId` scoping is strictly applied. |
| Company CRUD | Edit Company | 1. Select existing company.<br>2. Edit industry field.<br>3. Click Save. | The company profile updates, reflecting the new industry. | Profile successfully updated. | Pass | Form pre-populates correctly before edit. |
| Search & Filter | Filter by Industry | 1. Go to company list.<br>2. Select "Technology" from the industry dropdown filter. | List updates instantly to show only companies matching the "Technology" industry. | List filtered correctly. | Pass | Database query optimized to filter by industry. |
| Drive Linking | Link Company to Drive | 1. Edit a Placement Drive.<br>2. Note the 'Company' dropdown.<br>3. Select a created company. | Drive saves the relationship. The company is now displayed on the Drive dashboard. | Drive successfully linked. | Pass | Validates `companyId` exists in the org. |
| Authorization | Viewer Restrictions | 1. Login as Viewer.<br>2. Attempt to view the `Add Company` button or navigate to `/admin/companies/new`. | Button is hidden. Direct navigation redirects to unauthorized page. | UI block enforced. Page access denied. | Pass | Fallback check in API returns 403. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| UI for the company listing was built very quickly by reusing the `DataTable` shadcn/ui component from other pages. | Initially, the API did not strictly enforce `orgId` filtering on companies, leading to cross-tenant data bleed in local testing. | Make tenant scoping a mandatory interceptor/middleware instead of relying on developers to manually add `.where({ orgId })`. | Implemented an organization context service on the backend to append `orgId` queries automatically to all Prisma queries across this module. |

---

### US08 – Admin Update Recruitment Stage

**1. User Story Description**
**As an** admin, **I want to** update a candidate's recruitment stage with notes and timestamps, **so that** the placement pipeline accurately reflects each candidate's progress.
- **Priority:** Important | **Sprint:** Sprint 2
- **Checklist:** Stage update form with dropdown & notes field, Timestamp logging per transition, Validation for allowed stage transitions, Stage change history view.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Stage Update | Valid Update with Notes | 1. Open candidate profile.<br>2. Change stage (e.g., Shortlisted -> Interviewed).<br>3. Add "Passed technical round" note.<br>4. Save. | Stage updates. Note and timestamp are appended to the candidate's history log. | Stage updated. Note saved to history. | Pass | Audit log captures the `adminId` performing the update. |
| Validation | Invalid Transition | 1. Open candidate in "Applied" stage.<br>2. Select "Placed" stage.<br>3. Save. | System returns error stating the candidate cannot skip stages. | System blocks save. Shows error. | Pass | State machine enforces transitions. |
| History View | Stage History Render | 1. Open candidate profile.<br>2. Click "View Stage History". | A timeline appears showing all previous stages, timestamps, notes, and the admin who made the change. | Timeline displays logs chronologically. | Pass | Fetches `AuditLog` joining the candidate entity. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Storing notes directly alongside the stage transition record in a JSON `metadata` field handled the requirements cleanly without complex joins. | Figuring out how to display the timeline (chronological vs. reverse-chronological) caused some minor UI rework mid-development. | Always establish clear UI mockups for complex components like timelines before backend work begins. | Enforce stricter requirements definition; wait for design finalization on components tracking historical data. |

---

### US09 – Edit/Delete Interview Entries

**1. User Story Description**
**As a** recruiter, **I want to** edit or delete interview entries, **so that** I can correct scheduling errors and keep interview data accurate.
- **Priority:** Medium | **Sprint:** Sprint 2
- **Checklist:** Edit form with pre-filled interview details, Delete with confirmation modal, Notification trigger on reschedule/cancellation, Audit log for edit/delete operations.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Entry Edit | Pre-populate Fields | 1. Find scheduled interview.<br>2. Click 'Edit'. | Edit form opens with Date, Time, Link, and Panel values correctly populated. | Form fields populated. | Pass | Relies on React Hook Form defaults. |
| Entry Edit | Save Changes | 1. Change the interview Date.<br>2. Click 'Save'. | Interview date updates. Success toast shown. Assigned candidate receives a reschedule notification. | Date updated. Notification sent. | Pass | Edit triggers a Kafka event for notification dispatch. |
| Entry Delete | Soft Delete | 1. Find scheduled interview.<br>2. Click 'Delete'.<br>3. Confirm in modal dialog. | Interview is marked as deleted (hidden from UI). Warning toast confirms deletion. Assigned candidate receives cancellation notification. | Deleted successfully. Notification sent. | Pass | `deletedAt` flag updated instead of hard DB drop. |
| Audit Trail | Edit Log Creation | 1. Perform edit and delete actions.<br>2. Query audit logs in DB. | DB contains an `UPDATE` log showing before/after JSON, and a `DELETE` log for the respective entities. | DB contains accurate audit logs. | Pass | Global audit interceptor working flawlessly. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Implementing the confirmation modal for destructive deletes was seamless using the shared UI components. | Soft-deletes complicated queries elsewhere in the app; we had to manually add `deletedAt: null` to dozens of fetch queries. | Implement a global Prisma middleware or extension that automatically filters out soft-deleted records. | Update Prisma Client instantiation to use an extension that appends `where: { deletedAt: null }` to all `findMany` queries by default. |

---

## Part 3: Sprint 2 Backlog & Future Items

### US05 – Notification & Reminders

**1. User Story Description**
**As a** user, **I want to** receive real-time notifications for task assignments, interview schedules, and placement updates, **so that** I stay informed without manually checking each module.
- **Priority:** Important | **Sprint:** Sprint 2
- **Checklist:** Notification model (type, title, body, isRead), WebSocket real-time delivery (<2s), Mark-as-read functionality, Email triggers for interview reminders.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Real-time Alerts | WebSocket Delivery | 1. Have User A assign a task to User B.<br>2. Verify User B's active session. | User B sees an immediate toast notification and the bell icon badge increments natively (< 2s). | User B receives real-time UI alert. | Pass | NestJS WebSocket Gateway emitting correctly. |
| User Actions | Mark as Read | 1. Click the notification bell.<br>2. Click on an unread notification. | The notification background changes to indicate 'read'. The unread badge count decrements by 1. | Notification state toggles in DB and UI updates. | Pass | Optimistic UI update used for responsiveness. |
| Data Model | Notification Types | 1. Trigger an AI INSIGHT event.<br>2. Trigger a SYSTEM event. | The database creates the `Notification` records with the correct enum types. | Enums assigned properly. | Pass | Factory functions handle type routing correctly. |
| Email Fallback | Send Reminder Email | 1. Add an interview within 24hrs.<br>2. Trigger daily cron job. | System dispatches an email via SendGrid to the candidate reminding them of the interview. | Email lands in candidate's inbox. | Pass | Kafka topic `email.reminders` consumed properly. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Modeling the notifications using Prisma went smoothly, indexing by `userId` and `isRead` kept queries blazing fast. | Ensuring WebSockets stayed connected and gracefully reconnected during server restarts (or browser sleep) caused dropped notifications. | Implement a reconnection strategy on the client utilizing socket.io defaults and fall-back to HTTP polling if sockets fail. | Integrate a reliable reconnect UI indicator and adjust the socket payload to fetch 'missed' notifications upon reconnection. |

---

### US10 – Mobile Responsiveness

**1. User Story Description**
**As a** student, **I want to** access the placement portal on my mobile device with a fully responsive UI, **so that** I can check drive statuses and interview schedules on the go.
- **Priority:** Medium | **Sprint:** Sprint 2
- **Checklist:** Responsive breakpoints for mobile/tablet/desktop, Mobile navigation component, Touch-friendly interactive elements, Lighthouse mobile performance audit (LCP < 1.5s).

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Layout | Responsive Breakpoints | 1. Open app.<br>2. Resize browser simulated width under 640px. | Sidebar disappears, bottom/hamburger navigation appears. Grids switch to single column. | Breakpoint handles layout shift perfectly. | Pass | Tailwind `md:` and `lg:` classes applied. |
| UX | Touch Targets | 1. Load app on mobile device/simulator.<br>2. Click standard buttons / cards. | All buttons, links, and cards have a minimum 44px hit area to prevent miss-taps. | Buttons meet 44px touch target guidelines. | Pass | Padding and margins verified in browser dev tools. |
| Components | Mobile Navigation | 1. Click mobile navigation toggle.<br>2. Click navigation link. | Slide-out or full-screen menu opens. Clicking a link navigates and closes the menu. | Navigation operates smoothly with animations. | Pass | React context manages mobile menu open state. |
| Performance | Lighthouse Audit | 1. Run Lighthouse on Mobile configuration targeting the Dashboard. | Performance score is ≥ 90, LCP is under 1.5s over simulated 4G connection. | Lighthouse score is 92, LCP is 1.2s. | Pass | Image optimization and font loading strategies succeed. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Implementing the mobile navigation toggle and hiding the sidebar was seamless thanks to Next.js layouts and Tailwind CSS breakpoints. | Displaying the Kanban board for Task Management on small screens was fundamentally broken initially (requires horizontal scrolling). | Convert the Kanban board into an accordion or a paginated list view specifically when the user drops below the `md:` breakpoint. | Design a dedicated mobile view for complex horizontal components (Data Tables, Kanban boards) and write media queries to swap components entirely on small screens. |

---

### Performance Optimization

**1. User Story Description**
**As a** platform user, **I want** pages to load quickly and API responses to return within acceptable latency thresholds, **so that** the platform feels fast and productive.
- **Priority:** Medium | **Sprint:** Sprint 2
- **Checklist:** Redis caching for dashboard & drive data (TTL-based), Database query indexing on hot paths, GraphQL DataLoader for N+1 prevention, Next.js code splitting & lazy-loaded routes.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| API Latency | Redis Caching | 1. Hit the `/api/dashboard/stats` endpoint.<br>2. Hit it a second time. | Second request returns in < 50ms from Redis cache instead of querying Postgres. | Second request returns in 32ms. | Pass | Cache TTL set to 60 seconds for dashboard stats. |
| DB Querying | Index Usage | 1. Query Tasks by `projectId`.<br>2. Check query execution plan. | Database uses the `projectId` index, resulting in sub-millisecond lookup times even with 10k rows. | Index hit successfully (Seq Scan avoided). | Pass | Prisma schema updated with `@@index([projectId])`. |
| Frontend | Lazy Loading | 1. Open browser network tab.<br>2. Navigate to Admin Company Management. | The JavaScript bundle for the admin page is only downloaded when the user actually navigates there. | Bundle loaded dynamically on route change. | Pass | Next.js dynamic imports applied to heavy chart libraries. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Next.js route segment caching and dynamic imports immediately dropped our initial page load size by 40%. | The N+1 query problem was severely impacting the GraphQL resolvers when fetching Candidate profiles alongside their Match Results. | Integrate Prisma's `include` carefully, or strictly use `DataLoader` batches for GraphQL field resolvers. | Enforce a code-review strict policy: loops making database calls are rejected; batching must be used. |

---

### UI Improvements

**1. User Story Description**
**As a** platform user, **I want** a polished, consistent UI with accessible components and smooth interactions, **so that** the platform feels professional and enterprise-grade.
- **Priority:** Low | **Sprint:** Sprint 2
- **Checklist:** Component library audit (spacing, colors, typography), Keyboard navigation & focus indicators, ARIA labels & color contrast ≥ 4.5:1, Hover effects & transition animations.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Accessibility | Keyboard Navigation | 1. Open dashboard.<br>2. Use only the `Tab` and `Enter` keys to navigate to a Placement Drive. | Focus ring clearly visible on all interactive elements. Enter key successfully triggers links/buttons. | Fully navigable via keyboard. Focus rings visible. | Pass | `focus-visible` Tailwind classes applied. |
| Accessibility | Color Contrast | 1. Run Lighthouse Accessibility audit or axe-core scanner. | No contrast violations (ratio ≥ 4.5:1 for standard text). | Score 100/100, zero contrast errors. | Pass | Adjusted secondary text color from gray-400 to gray-500. |
| UX | Micro-animations | 1. Hover over a Project card.<br>2. Click a toggle switch. | Card elevates smoothly (`transition-all duration-200`). Toggle slides smoothly. | Animations trigger without layout jank. | Pass | Standardized transition classes across all interactive elements. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Using the shadcn/ui library gave us a massive head start on accessibility, as Radix UI primitives handle most ARIA roles out of the box. | Updating the brand color palette caused contrast ratios to fail on several primary buttons in dark mode. | Lock the color palette in Figma and run contrast checkers *before* copying hex codes to Tailwind config. | Perform an automated `axe-core` scan in the CI pipeline to catch accessibility regressions before merging PRs. |

---

### Role-Based Access Improvements (RBAC + ABAC)

**1. User Story Description**
**As an admin**, **I want** granular role-based access with attribute-level permissions (RBAC + ABAC), **so that** sensitive placement data is visible only to authorized personnel within each organization.
- **Priority:** Important | **Sprint:** Sprint 3 (Product Backlog)
- **Checklist:** ABAC policy engine (org, department scoping), Custom role creation UI for admins, Permission matrix per feature module, API-level tenant permission enforcement.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ABAC Scoping | Department Isolation | 1. Login as Member of 'CS Department'.<br>2. Attempt to view drives mapped to 'Mechanical Dept'. | API returns empty list or 403 Forbidden. User cannot see cross-department data. | User only sees CS department data. | Pass | Policy engine validates `user.departmentId == resource.departmentId`. |
| Custom Roles | Create Role | 1. Admin navigates to Roles UI.<br>2. Creates "Interviewer" role with strictly read-only access to Candidates.<br>3. Assigns role to User C. | User C can view Candidate profiles but the "Edit" and "Delete" buttons are hidden. API blocks mutations. | Custom role correctly limits UI and API access. | Pass | Permission matrix evaluated on every request. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Refactoring the NestJS Guards to accept dynamic permission strings (`@RequiresPermission('drives:read')`) made the controllers much cleaner. | The ABAC database queries became highly complex, involving multiple joins to verify exact resource ownership before returning data. | Centralize the authorization checks into a single Policy module rather than scattering `hasAccess` logic inside every service. | Adopt a dedicated authorization library (like CASL) instead of building a custom policy engine from scratch. |

---

### Advanced Analytics Dashboard

**1. User Story Description**
**As an executive sponsor**, **I want** advanced analytics with AI-powered placement forecasting and trend analysis, **so that** I can proactively intervene before targets are missed.
- **Priority:** Medium | **Sprint:** Sprint 3 (Product Backlog)
- **Checklist:** Placement forecasting model integration, Trend analysis charts (Recharts), PDF/CSV report export with scheduling, Executive summary dashboard view.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| AI Forecast | View Predictions | 1. Open Executive Analytics.<br>2. View "Projected Placements by March" chart. | Chart displays historical data (solid line) and predicted trajectory (dotted line with confidence interval bounds). | Chart renders ML predictions correctly. | Pass | Data fetched from FastAPI ML service. |
| Reporting | Export CSV | 1. Click "Export Data".<br>2. Select "CSV". | Browser downloads a `.csv` file matching the table data exactly, including all filtered columns. | File downloads, formatting is intact. | Pass | Handled by frontend CSV parsing utility. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Recharts handled the complex visualizations (dotted lines, intervals) surprisingly well without needing a heavier D3.js implementation. | Generating PDF reports on the client-side caused browser crashes for large datasets. | Move PDF generation to a backend worker using Puppeteer or a dedicated PDF library. | Shift the "Export to PDF" functionality to an asynchronous queue that emails the user the report when it's done rendering. |

---

### Email Integration for Notifications

**1. User Story Description**
**As a** recruiter, **I want** automated email notifications sent to candidates for drive registrations, interview reminders, and placement results, **so that** communication is timely without manual effort.
- **Priority:** Medium | **Sprint:** Sprint 3 (Product Backlog)
- **Checklist:** SendGrid API integration, Email templates, User email preference settings, Kafka-driven async email dispatch.

**2. Functional Test Cases**

| Feature | Test Case | Steps to execute test case | Expected Output | Actual Output | Status | More Information |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Email Dispatch | Interview Reminder | 1. Cron job triggers 24h before an interview.<br>2. Check Kafka logs. | A message is published to Kafka. The consumer reads it and sends an email via SendGrid. | Email delivered to recipient inbox within seconds. | Pass | HTML template populated correctly with candidate name and time. |
| User Settings | Opt-out Flow | 1. Candidate unchecks "Interview Reminders" in settings.<br>2. Trigger a reminder event for them. | System detects the preference and skips the email dispatch for that user. | Email successfully bypassed. | Pass | Preferences checked before Kafka publish. |

**3. Sprint Retrospective**

| What went well | What went poorly | What ideas do you have | How should we take action |
| :--- | :--- | :--- | :--- |
| Decoupling the email dispatch logic from the main API using Kafka drastically improved API response times during bulk operations. | Designing cross-client compatible HTML email templates was incredibly frustrating and time-consuming. | Use a framework like React Email or MJML instead of hand-writing inline CSS in HTML strings. | Refactor existing email templates to use React Email and set up a preview environment for designers. |
