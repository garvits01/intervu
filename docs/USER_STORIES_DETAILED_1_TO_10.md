# Haveloc Pro - User Stories (1-10)

## US01 — User Registration & Login

**User Story**

As a student, I want to register and log in to the system so that I can securely access and manage my interview details.

**Description**

This user story enables students to create an account and authenticate themselves to gain secure access to the Haveloc Pro platform. The registration functionality validates user input such as email format and password strength, while the login functionality verifies credentials against stored records. Upon successful login, the system creates a secure JWT-based session and redirects the user to their dashboard. 

**Linked Tasks**

- Design User Registration and Login UI interfaces.
- Implement input validation for registration and login fields (email format, password strength).
- Create backend API endpoints for registration and login authentication.
- Implement password hashing using bcrypt/scrypt (min 10 salt rounds).
- Generate and manage secure JWT access (1hr) and refresh tokens (7d).
- Implement error handling for invalid login/registration attempts (duplicate email, wrong password).
- Update user record with `lastLoginAt` timestamp on successful login.
- Conduct testing of registration and login workflows.

**Acceptance Criteria**

**Scenario 1 – Successful Registration**
Given a new user who is not registered
When the user submits the registration form with a valid email and strong password
Then the system creates a new user account securely and displays a success message.

**Scenario 2 – Invalid Registration Input**
Given a new user on the registration page
When the user enters an invalid email format, weak password, or duplicate email
Then the system displays specific validation errors and prevents submission.

**Scenario 3 – Successful Login**
Given a registered user enters valid login credentials
When the user submits the login form
Then the system authenticates the user, issues a JWT, updates `lastLoginAt`, and redirects to the dashboard.

**Scenario 4 – Invalid Login Credentials**
Given a user enters an incorrect email or password
When the login form is submitted
Then the system displays an error message indicating invalid credentials.

**Estimated Effort:** 3 Days

**Functional Requirements**

- The system must allow users to register with a unique email and password.
- The system must authenticate users using email and password.
- The system must issue JWT access and refresh tokens upon successful login.
- The system must display clear error messages for invalid registration or login attempts.
- The system must record the time of successful login.
- The system must redirect users to the dashboard upon successful authentication.

**Non-Functional Requirements**

- Passwords must be securely hashed using bcrypt/scrypt with a minimum of 10 salt rounds.
- Access token must have an expiry of 1 hour, and refresh token 7 days.
- Authentication and registration actions should process within 1 second.

---

## US02 — Auth0 SSO & Role-Based Access Control

**User Story**

As an admin, I want SSO login via Auth0 and role-based access control so that enterprise users authenticate securely and see only features allowed by their role.

**Description**

This user story implements Single Sign-On (SS0) via Auth0 for enterprise clients and strictly enforces Role-Based Access Control (RBAC). It guarantees that when users authenticate, they are assigned to one of four specific roles (SUPER_ADMIN, ADMIN, MEMBER, VIEWER), which dictate the APIs and UI features they are permitted to interact with. Unauthorized access attempts yield graceful redirections rather than structural failures.

**Linked Tasks**

- Configure Auth0 tenant with OAuth2/OIDC flows.
- Implement SSO login handler in frontend and backend.
- Create database role mappings and seed default roles in the system.
- Implement NestJS backend HTTP Guards to lock API endpoints by role requirement.
- Configure Next.js frontend middleware to restrict routing based on role permissions.
- Validate and handle unauthorized access redirects.

**Acceptance Criteria**

**Scenario 1 – Successful SSO Authentication**
Given an enterprise user uses the SSO login option
When Auth0 successfully authenticates the user
Then the system issues a secure session token and maps the user's role correctly.

**Scenario 2 – Role-Based API Restriction**
Given a user with a "VIEWER" role
When the user attempts to trigger an "ADMIN" restricted backend API
Then the API rejects the request and returns an unauthorized access error.

**Scenario 3 – Frontend Route Protection**
Given an unauthorized or incorrectly roled user
When they try to navigate directly to an administrative URL via their browser
Then the frontend middleware intercepts the request and redirects them to the login page.

**Estimated Effort:** 4 Days

**Functional Requirements**

- The system must integrate Auth0 OAuth2/OIDC SSO capabilities.
- The system must define and assign one of the specific core roles to every authenticated user.
- The frontend must evaluate session roles before rendering secure views.
- The backend must intercept API requests lacking the required permission scopes.

**Non-Functional Requirements**

- OAuth processing must adhere strictly to OIDC secure configuration standards.
- Session tokens should be stored within secure, HttpOnly cookies.
- Middleware redirection should be imperceptible (latency < 200ms).

---

## US03 — Add Interview Details

**User Story**

As a recruiter, I want to add interview details for each placement drive round so that candidates and hiring managers can view schedules and panel information.

**Description**

This user story allows recruiters to securely enter, modify, and store interview logistics for candidates involved in placement drives. By providing dates, times, designated panel members, and locations/links, it establishes a single source of truth that candidates can view on their specific dashboards and that hiring managers can track. The system automatically handles notifications based on these detailed assignments.

**Linked Tasks**

- Design the UI form for adding/editing interview entry data.
- Develop backend CRUD endpoints for interview records associated with placement drives.
- Implement database relationships for panel-to-interview mappings.
- Implement logic to display relevant interview schedules on candidate dashboards.
- Integrate automated notification triggers upon interview creation or updates.

**Acceptance Criteria**

**Scenario 1 – Create Interview Entry**
Given a recruiter is viewing a placement drive
When they submit the form with a date, time, panel, and meeting link
Then the system saves the interview entry and associates it successfully with the round.

**Scenario 2 – Candidate Dashboard Visibility**
Given an interview entry is created for a candidate
When the candidate navigates to their personal dashboard
Then they can clearly view the correct scheduled date, time, and instructions.

**Scenario 3 – Automated Notifications**
Given an interview is actively scheduled by a recruiter
When the database confirms the entry creation
Then the system triggers an immediate notification to the candidate alerting them to the schedule.

**Estimated Effort:** 2.5 Days

**Functional Requirements**

- System must support Create, Read, Update, and Delete operations for interview logistics.
- An interview must associate specific panel members to specific time slots.
- Candidates must only see schedule entries matching their ID on their dashboard.
- The system must have automated notifications mapped explicitly to new schedule events.

**Non-Functional Requirements**

- Time zones should be handled robustly across both API payloads and front-end displays.
- Database queries mapping candidates to upcoming schedules must be highly optimized.

---

## US04 — Recruitment Stage Tracking

**User Story**

As a campus recruiter, I want to track candidates through recruitment stages (Applied → Shortlisted → Interviewed → Offered → Placed) so that I have real-time visibility into pipeline progress.

**Description**

This user story enables recruiters to visually and logically track candidate progression across a structured five-stage pipeline. Transitions are strictly validated to prevent illegal state jumps, ensuring data integrity. It offers bulk manipulation capabilities for batch processing alongside real-time dashboard tracking, giving recruiters quick overviews of conversion funnels across placement drives.

**Linked Tasks**

- Create the five-stage pipeline lifecycle model within the database architecture.
- Write server-side validation logic restricting illegal candidate status transitions.
- Build the UI pipeline dashboard widget capable of displaying aggregate counts per stage.
- Implement bulk data mutation handling for mass candidate updates.
- Ensure every pipeline state modification generates a trackable audit log entry.

**Acceptance Criteria**

**Scenario 1 – Valid Status Transition**
Given a candidate currently holds an "Applied" status
When the recruiter explicitly upgrades their stage to "Shortlisted"
Then the system strictly validates the change, saves the state, and creates an audit log.

**Scenario 2 – Invalid Status Transition Prevention**
Given a candidate currently holds an "Applied" status
When the recruiter attempts to transition them immediately to "Placed" skipping intermediate stages
Then the system blocks the transition and throws a visible validation error.

**Scenario 3 – Bulk Stage Updates**
Given a recruiter selects multiple candidates
When the recruiter applies a single bulk status upgrade command
Then the system concurrently validates and upgrades the candidates who meet requirements.

**Estimated Effort:** 3.5 Days

**Functional Requirements**

- The system must employ a hardcoded Applied → Shortlisted → Interviewed → Offered → Placed hierarchy.
- The system must visually summarize the aggregate counts of candidates sitting within each stage.
- The system must support the bulk selection and state mutation of candidate pools.
- The system must log every movement persistently within the database.

**Non-Functional Requirements**

- Bulk update constraints must handle transactional failures safely without corrupting partial batches.
- The dashboard widget should refresh or display stage aggregates instantaneously via optimal querying.

---

## US05 — Notifications & Reminders

**User Story**

As a user, I want to receive real-time notifications for task assignments, interview schedules, and placement updates so that I stay informed without manually checking each module.

**Description**

This user story creates a low-latency, event-driven notification apparatus supporting WebSocket connections. Whenever sensitive application actions execute (like auto-generating tasks or finalizing interview schedules), real-time alerts instantly materialize for the affected users. The underlying engineering handles high-volume messaging (1000+ alerts) without lag and pushes critical communications directly to users via external channels (emails).

**Linked Tasks**

- Design the database model structured for complex Notification types.
- Set up a highly optimized WebSocket connection handler on the backend.
- Create frontend components for standard in-app notifications (Read/Unread triggers).
- Introduce email integration strictly for high-priority notification types.
- Optimize the fetch/load pipeline for vast numbers of unverified alerts globally.

**Acceptance Criteria**

**Scenario 1 – Real-time Delivery**
Given an external event triggers a notification payload intended for an active user
When the action completes its database transaction
Then the user instantly receives a live WebSocket pulse showing the notification without refreshing.

**Scenario 2 – Unread Notification Management**
Given a user has multiple unread notifications
When the user clicks marking an individual or all notifications as read
Then the indicator count accurately updates and visual badges transition to a passive state.

**Scenario 3 – Critical Event Forwarding**
Given a high-priority "INTERVIEW_SCHEDULED" event takes place
When the system drops the internal notification
Then the system simultaneously triggers a targeted email alert safely to the user's registered inbox.

**Estimated Effort:** 5 Days

**Functional Requirements**

- The system must parse strictly specific alert types (TASK_ASSIGNED, PLACEMENT_UPDATE, etc.).
- The system must provide users straightforward mechanics to manually clear and mark unread items.
- The system must independently fire an email workflow asynchronously on predefined urgent events.
- Client browsers must dynamically establish WebSocket ties securely on application initialization.

**Non-Functional Requirements**

- Notifications should demonstrably arrive through WebSocket links with under 2-seconds of latency.
- Internal list fetches must successfully query and render up to 1000 items in under 500ms.

---

## US06 — Basic Dashboard View

**User Story**

As an admin, I want a centralized dashboard showing active drives, candidate stats, and recent activity so that I can monitor overall placement performance at a glance.

**Description**

This user story provides the landing hub for system administrators. The dashboard acts as a fast, high-level intelligence center providing immediate Key Performance Indicators regarding campaigns running within the platform. The UI balances numerical aggregates (drives count, total placements) with a dedicated recent-activity feed auto-populating upon load, designed heavily for high-fidelity responsive behavior.

**Linked Tasks**

- Architect aggregate backend queries mapped to core statistical endpoints.
- Build the core KPI card components displaying total values.
- Thread the recent activity notifications widget directly into the dashboard layout.
- Ensure automated data fetching resolves swiftly upon primary application entry.
- Build responsive CSS constraints for desktop, laptop, and tablet boundaries.

**Acceptance Criteria**

**Scenario 1 – Data Load Operations**
Given a qualified admin navigates to the core dashboard page
When the application completes its initial rendering state
Then KPI cards visually confirm the accurate aggregates of Candidates, Drives, and Placements.

**Scenario 2 – Refresh Activity Feed**
Given new placements or critical activities are occurring in real-time
When the admin invokes a page load or data refresh
Then the Recent Activity notification feed prominently surfaces the newly generated data.

**Scenario 3 – Responsive Constraint Verification**
Given an admin shrinks their browser viewport vertically and horizontally simulating a tablet
When the window breaks past specific boundaries
Then the widgets cleanly rearrange layout grids without breaking overflow formatting rules.

**Estimated Effort:** 2.5 Days

**Functional Requirements**

- The system must output statistical totals from raw entity counts securely.
- The system must explicitly populate an activity center natively mapping recent historical events.
- The system must support immediate auto-refresh mechanisms executing immediately upon navigation.

**Non-Functional Requirements**

- Overall Dashboard initial display and paint should be blazing fast (LCP securely under 2 seconds).
- The presentation models should function interchangeably ignoring screen layout dimensions.

---

## US07 — Admin Company Management

**User Story**

As an admin, I want to add, edit, and manage recruiting companies within the platform so that placement drives can be linked to verified company profiles.

**Description**

This user story builds the internal repository system that maps placement drives against actual corporate entities. Admins are empowered to execute full CRUD functions on Company profiles containing branding logic (name, logo) and contact matrices. Strict security isolates this functionality exclusively to Administrative hierarchies to prevent basic members from establishing unregulated or fraudulent company connections on the software. 

**Linked Tasks**

- Design the foundational Database "Company" model strictly isolated by organizational tenant.
- Construct the primary CRUD REST operations explicitly protecting the routes through Role Guards.
- Build a polished Company Profile UX view detailing websites, industries, and relevant metadata.
- Implement linking mechanics permitting new placement drives to bind securely to these generated entities.
- Develop dynamic search and filtering protocols optimizing administrative traversal.

**Acceptance Criteria**

**Scenario 1 – Profile Generation Validation**
Given a user holds an ADMIN or SUPER_ADMIN permission token
When they submit comprehensive company metadata via the form
Then the system creates an isolated company profile entity stored globally to their organization.

**Scenario 2 – RBAC Security Breach Prevention**
Given a user securely holding a flat predefined "MEMBER" role
When they deliberately attempt to execute the Creation API for a company framework
Then the API rejects the request instantly raising a robust access-denied network response.

**Scenario 3 – Directory Searching Options**
Given an administrator opens the Company list interface
When they actively type industry filters or specialized geographical location queries
Then the list dynamically trims the available companies to match exactly those parameters.

**Estimated Effort:** 3 Days

**Functional Requirements**

- The system must exclusively grant the capability of Company Creation/Modification to Admins.
- The system must map comprehensive metrics natively linking generated Organizations against Drives.
- The system must render robust Search parameter systems scanning metadata dynamically.
- System must allow profiles to hold standard fields (URL, contact info, graphical logo structures).

**Non-Functional Requirements**

- Company associations strictly adhere to strict multitenancy constraints prohibiting accidental leakage.
- Database schema indexing properly optimizes Company searching requests against large strings.

---

## US08 — Admin Update Recruitment Stage

**User Story**

As an admin, I want to update a candidate's recruitment stage with notes and timestamps so that the placement pipeline accurately reflects each candidate's progress.

**Description**

This user story grants administrative overseers the capability to forcibly advance or halt a candidate's journey across the recruitment logic while injecting contextual notes alongside the action. This ensures every pipeline adjustment contains justification reasoning attached directly to the precise chronological timestamp and executing administrator's identity. 

**Linked Tasks**

- Build UI update forms integrating specific note-taking field mechanics paired to dropdown models.
- Intercept the stage update procedure to seamlessly map the originating Admin's contextual identity.
- Verify identical pipeline strict-state validations are executed precisely server-side.
- Configure historical timeline components dedicated to summarizing the candidate’s phase shifts.
- Route stage modifications directly into compliance-focused Audit Data Logging frameworks.

**Acceptance Criteria**

**Scenario 1 – Annotated Stage Update**
Given an administrator aims to advance a specific candidate
When they alter the state to "Interviewed" and insert an explanatory contextual note via the form
Then the system executes the transition, saving the precise note alongside their specific Admin ID.

**Scenario 2 – Deep Historical Visibility**
Given a candidate has undergone multiple sequential recruitment shifts
When an authorized personnel examines the candidate's core dashboard view
Then they discover a distinct linear chronological history mapped accurately to previous stage phases.

**Scenario 3 – Compliance Logging**
Given an administrator successfully mutates candidate stage vectors
When the internal update logic resolves
Then an immutable tracking event writes directly to the core compliance Audit Table securely.

**Estimated Effort:** 2.5 Days

**Functional Requirements**

- The system must offer dropdown capabilities explicitly paired to free-text justification sections.
- The system must extract the session token mapping the current administrator's identity to the transition.
- The system must generate visual pipeline histories attached fundamentally to candidate object IDs.
- The system must preserve raw records in immutable auditing databases ensuring total compliance.

**Non-Functional Requirements**

- Stringent internal checking limits state mutations avoiding illegal skips regardless of UI bypassing.
- Audit table insertions possess minimal performance penalties against main interaction responses.

---

## US09 — Edit/Delete Interview Entries

**User Story**

As a recruiter, I want to edit or delete interview entries so that I can correct scheduling errors and keep interview data accurate.

**Description**

This user story addresses standard corrective actions on placement logistics by managing Interview Entry modification. Because rescheduling disrupts downstream chains, editing triggers automatic notifications cascading securely to impact participants. Deletion relies heavily upon soft-deletion practices preserving historical data in the database while successfully masking the UI layer from displaying obsolete candidate assignments.

**Linked Tasks**

- Equip Interview forms to auto-populate existing object metadata dynamically over state structures.
- Engineer "Soft-Delete" methodologies intercepting standard destructive Database behaviors natively.
- Scaffold warning confirmation modal prompts explicitly before deletion approvals.
- Assemble automated message payloads broadcasting to candidates whenever times shift.
- Inject modification audit markers securing tracking integrity per manipulation.

**Acceptance Criteria**

**Scenario 1 – Standard Update Operation**
Given a recruiter accesses an erroneous interview record
When they modify a parameter and trigger submission
Then the form inherently supplies previous parameters seamlessly allowing minor modifications.

**Scenario 2 – Regulated Deletion Masking**
Given a recruiter completes a firm deletion action upon an interview slot
When processing completes post-confirmation dialog
Then the record completely disappears on frontend candidate views while remaining flagged in the database.

**Scenario 3 – Reschedule Cascade Broadcasting**
Given a recruiter successfully shifts a foundational date or time component natively
When the database solidifies that structural alteration 
Then candidates impacted dynamically receive immediate email/system alerts regarding the logistical slip.

**Estimated Effort:** 3 Days

**Functional Requirements**

- The system must deliver auto-filled parameter forms retrieving accurate primary entry characteristics.
- The system must deploy strict Confirmation Modals stopping accidental logistical destructions.
- The system must perform soft-deletion retaining primary records explicitly masking public-facing UI.
- The system must evaluate mutations logically broadcasting required downstream target alerts.

**Non-Functional Requirements**

- Hard database purging is universally prohibited against active event logistics structures.
- Automated alert triggers operate optimally using offline async message brokers protecting UI speeds.

---

## US10 — Mobile Responsiveness

**User Story**

As a student, I want to access the placement portal on my mobile device with a fully responsive UI so that I can check drive statuses and interview schedules on the go.

**Description**

This user story focuses entirely on engineering high-fidelity CSS and accessibility matrices targeting diverse browser viewports. Because students primarily check notifications and candidate statuses on cellular devices, the structure integrates standard Hamburger navigations and expanded tap-target resolutions. It aims for intense Lighthouse performance scorings optimizing critical render paths for small structural environments.

**Linked Tasks**

- Establish standard viewport Tailwind UI constraints (<640px Mobile, <1024px tablet).
- Rework main Header constructs installing collapsible hamburger mechanics gracefully.
- Adjust internal spacing parameters expanding interactive touch-targets securing 44px boundaries minimums.
- Re-map intricate list layers and Kanban interfaces to transition naturally mapping single-column grids.
- Run dedicated Lighthouse profiling testing aggressively minimizing internal payload delays.

**Acceptance Criteria**

**Scenario 1 – Dimensional Adapting**
Given a user loads complex Kanban architectures heavily relying on horizontal constraints
When viewed through extreme viewport resolutions like cellular smartphones
Then those architectures autonomously fold into vertically stacked interactive list streams.

**Scenario 2 – Navigational Collapsing**
Given a student interfaces the portal natively over mobile hardware environments
When analyzing explicit top-tier navigational frameworks
Then those frameworks disappear integrating cleanly into tapable Hamburger icon popover solutions.

**Scenario 3 – Tactical Usability Targets**
Given an individual evaluates core input metrics structurally
When tracing interaction constraints specifically natively via testing
Then all primary submission nodes mathematically hit spacing guarantees preserving 44px tap boundaries.

**Estimated Effort:** 4 Days

**Functional Requirements**

- The system must autonomously shift CSS grids relying cleanly upon variable viewport resolution boundaries.
- The system must natively embed Hamburger toggle structures displacing massive internal navigation layers.
- The system must reconfigure large, unwieldy data spreadsheets utilizing responsive card layouts.

**Non-Functional Requirements**

- Accessibility evaluations must ensure touch sizes easily exceed minimum tactile response guidelines.
- Mobile lighthouse audits explicitly mandate rendering architectures maintaining LCP averages below 1.5s.
- No horizontal scrolling malfunctions should occur strictly under 320px viewport boundaries natively.
