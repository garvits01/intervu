# RMMM (Risk Mitigation, Monitoring, and Management) Plan

**Project:** Haveloc Pro — AI-Native Enterprise Placement Platform

---

## Step 1: Forming a Risk Table

| RISK ID | RISKS | CATEGORY | PROBABILITY | IMPACT | RMMM |
|:-------:|-------|:--------:|:-----------:|:------:|------|
| 1 | Database performance degradation during mass placement drive registrations | PS | 55% | 1 | Implement Redis caching on read-heavy endpoints, add database indexes on hot tables, conduct load testing before every major drive launch |
| 2 | Mid-sprint requirement scope creep due to late placement rule changes | BU | 65% | 3 | Enforce 48-hour requirement freeze before sprint start, reserve 15% sprint buffer capacity for unplanned work, track scope changes formally |
| 3 | AI Matcher produces inaccurate or biased candidate screening results | TE | 70% | 2 | Implement bias auditing on every match result, allow manual HR overrides on all AI shortlists, continuously retrain model with updated datasets |
| 4 | Redis or Kafka broker failure causes WebSocket notifications to stop delivering | TE | 30% | 2 | Deploy Redis and Kafka in High Availability cluster mode, implement frontend long-polling as fallback, integrate health-check monitoring alerts |
| 5 | Enterprise clients fail to integrate Auth0 SSO with their corporate IT systems | CU | 25% | 3 | Conduct early sandbox testing with client IT teams, provide detailed OAuth integration documentation, assign dedicated onboarding support engineer |

---

## Step 2: Sort the risks in descending order based on probability of risk occurrence.

| RISK ID | RISKS | CATEGORY | PROBABILITY | IMPACT | RMMM |
|:-------:|-------|:--------:|:-----------:|:------:|------|
| 3 | AI Matcher produces inaccurate or biased candidate screening results | TE | 70% | 2 | Implement bias auditing on every match result, allow manual HR overrides on all AI shortlists, continuously retrain model with updated datasets |
| 2 | Mid-sprint requirement scope creep due to late placement rule changes | BU | 65% | 3 | Enforce 48-hour requirement freeze before sprint start, reserve 15% sprint buffer capacity for unplanned work, track scope changes formally |
| 1 | Database performance degradation during mass placement drive registrations | PS | 55% | 1 | Implement Redis caching on read-heavy endpoints, add database indexes on hot tables, conduct load testing before every major drive launch |
| 4 | Redis or Kafka broker failure causes WebSocket notifications to stop delivering | TE | 30% | 2 | Deploy Redis and Kafka in High Availability cluster mode, implement frontend long-polling as fallback, integrate health-check monitoring alerts |
| 5 | Enterprise clients fail to integrate Auth0 SSO with their corporate IT systems | CU | 25% | 3 | Conduct early sandbox testing with client IT teams, provide detailed OAuth integration documentation, assign dedicated onboarding support engineer |

---

## Step 3: To form a Risk Information Sheet (RIS) for each Risks separately.

---

### Risk Information Sheet (RIS) for 70% Risk

| Risk ID: 3 | Date: 10/04/2026 | Probability: 70% | Impact: 2 |
|:----------:|:----------------:|:-----------------:|:---------:|

| Field | Details |
|-------|---------|
| **Description** | AI Matcher produces inaccurate or biased candidate screening results, leading to unfair candidate rejections during placement drives |
| **Refinement & Context** | **Sub condition 1:** AI model lacks sufficient domain-specific training data for niche technology stacks and non-CS profiles **Sub condition 2:** Non-standard resume formatting causes NLP parsing failures and incorrect skill extraction **Sub condition 3:** Inherent algorithmic bias incorrectly penalizes candidates from certain educational backgrounds |
| **Mitigation & Monitoring Strategies** | 1. Implement comprehensive bias auditing logs for every AI match result generated 2. Enable recruiter "Manual Override" feature for all AI-generated shortlists 3. Collect continuous feedback from recruiters on prediction accuracy 4. Run weekly regression tests against the FastAPI model using benchmark datasets |
| **Contingency Plan and Management** | 1. Fall back to manual keyword-based candidate searching and filtering 2. Re-weight the vector database matching algorithm immediately 3. Re-evaluate and re-parse rejected candidate pools manually 4. Issue formal communication to affected recruiters and candidates |
| **Trigger** | When recruiters dispute more than 10% of AI-generated candidate shortlists or student dispute tickets spike visibly |
| **Status** | Mitigation actions initiated (Monitoring in progress) |
| **Assigned To:** Scrum Master | **Originator:** Risk Management Team |

---

### Risk Information Sheet (RIS) for 65% Risk

| Risk ID: 2 | Date: 10/04/2026 | Probability: 65% | Impact: 3 |
|:----------:|:----------------:|:-----------------:|:---------:|

| Field | Details |
|-------|---------|
| **Description** | Mid-sprint requirement scope creep due to late-arriving university placement rule changes, causing schedule slips and developer context-switching |
| **Refinement & Context** | **Sub condition 1:** Stakeholders fail to finalize placement drive formats before sprint start **Sub condition 2:** New regulatory compliance rules announced unexpectedly by universities mid-sprint **Sub condition 3:** Developers get pulled into unplanned stakeholder meetings, breaking sprint velocity |
| **Mitigation & Monitoring Strategies** | 1. Enforce strict 48-hour requirement freeze before sprint planning 2. Build a 15% buffer into every sprint capacity for unplanned work 3. Monitor sprint burndown charts daily to detect velocity drops 4. Appoint Product Owner as the absolute gatekeeper for mid-sprint changes |
| **Contingency Plan and Management** | 1. De-prioritize non-critical stories to accommodate emergency changes 2. Renegotiate delivery timelines immediately with stakeholders 3. Document scope alterations formally in the sprint retrospective 4. Redistribute workload among team members if needed |
| **Trigger** | When Product Owner receives a major feature request after the sprint has actively commenced |
| **Status** | Mitigation actions initiated (Monitoring in progress) |
| **Assigned To:** Scrum Master | **Originator:** Risk Management Team |

---

### Risk Information Sheet (RIS) for 55% Risk

| Risk ID: 1 | Date: 10/04/2026 | Probability: 55% | Impact: 1 |
|:----------:|:----------------:|:-----------------:|:---------:|

| Field | Details |
|-------|---------|
| **Description** | Database performance degradation and timeouts during mass placement drive registration events when 1000+ students register simultaneously |
| **Refinement & Context** | **Sub condition 1:** Insufficient Prisma connection pooling configuration under heavy concurrent load **Sub condition 2:** Complex relational joins on candidate and drive tables cause row-level database locks **Sub condition 3:** Server RAM and CPU bottlenecking during sudden high-traffic registration windows |
| **Mitigation & Monitoring Strategies** | 1. Implement Redis caching layer for all read-heavy dashboard and drive endpoints 2. Benchmark API response capacity using k6 load-testing tool before drive launch 3. Apply proper database indexes on hot Prisma schema columns (userId, driveId) 4. Monitor PostgreSQL CPU and memory metrics using monitoring dashboards |
| **Contingency Plan and Management** | 1. Dynamically scale database instance class during known peak drive hours 2. Implement temporary API rate-limiting per IP and user to prevent overload 3. Temporarily disable resource-heavy background analytics workers 4. Communicate delay status to students if system is under heavy load |
| **Trigger** | When API health-check monitoring reports response latency exceeding 500ms or HTTP 5xx status codes persisting for more than 2 minutes |
| **Status** | Mitigation actions initiated (Monitoring in progress) |
| **Assigned To:** Scrum Master | **Originator:** Risk Management Team |

---

### Risk Information Sheet (RIS) for 30% Risk

| Risk ID: 4 | Date: 10/04/2026 | Probability: 30% | Impact: 2 |
|:----------:|:----------------:|:-----------------:|:---------:|

| Field | Details |
|-------|---------|
| **Description** | Redis or Kafka broker failure causes real-time WebSocket notification delivery to stop entirely for all connected frontend clients |
| **Refinement & Context** | **Sub condition 1:** Memory eviction policies incorrectly purge active notification queues from Redis cache **Sub condition 2:** Network partitioning occurs between the NestJS API server and Kafka broker clusters **Sub condition 3:** Misconfigured Docker container orchestration causes unexpected broker process restarts |
| **Mitigation & Monitoring Strategies** | 1. Configure Redis and Kafka in robust High Availability cluster modes with replicas 2. Integrate continuous health-check probes alerting directly to team Slack channels 3. Implement frontend long-polling as an automatic fallback if WebSocket connections fail 4. Ensure persistent volume storage mapping for all message queues |
| **Contingency Plan and Management** | 1. Automatically switch frontend notification routing to standard REST polling 2. Restart broker containers in a safe rolling sequence to minimize downtime 3. Dispatch fallback broadcast email for critically delayed notifications 4. Conduct post-incident review and root cause analysis within 24 hours |
| **Trigger** | When frontend detects WebSocket connection drops that fail to reconnect after 3 successive retry attempts |
| **Status** | Analysis complete (Design phase integration pending) |
| **Assigned To:** Scrum Master | **Originator:** Risk Management Team |

---

### Risk Information Sheet (RIS) for 25% Risk

| Risk ID: 5 | Date: 10/04/2026 | Probability: 25% | Impact: 3 |
|:----------:|:----------------:|:-----------------:|:---------:|

| Field | Details |
|-------|---------|
| **Description** | Enterprise client organizations fail to integrate Auth0 SSO with their existing internal IT security infrastructure, blocking their onboarding |
| **Refinement & Context** | **Sub condition 1:** Client uses heavily firewalled internal network configurations that block OAuth callback URLs **Sub condition 2:** Haveloc Pro RBAC role mappings fail to correlate with the client's existing Active Directory groups **Sub condition 3:** Client security compliance teams endlessly delay protocol review and approval processes |
| **Mitigation & Monitoring Strategies** | 1. Draft extensive step-by-step API and OAuth integration documentation 2. Set up pre-configured Auth0 sandbox tenants for client IT experimentation 3. Assign a dedicated onboarding support engineer during initial deployment 4. Verify OIDC compliance via automated integration test suites before handoff |
| **Contingency Plan and Management** | 1. Revert affected client to standard secure email and password login temporarily 2. Organize live troubleshooting sessions with client developers 3. Offer customized middleware bridging solutions if strictly necessary 4. Escalate to Auth0 enterprise support if issue persists beyond 5 business days |
| **Trigger** | When client IT administrators fail to successfully authenticate more than 5 test users during the onboarding window |
| **Status** | Mitigation actions initiated (Monitoring in progress) |
| **Assigned To:** Scrum Master | **Originator:** Risk Management Team |
