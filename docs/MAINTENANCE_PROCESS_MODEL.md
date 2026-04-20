# Maintenance Process Model Presentation Content

Here is the expanded, comprehensive content tailored for your PowerPoint presentation based on the **Haveloc Pro (Intervu)** project. You can use the first two slides for the strict template, and the subsequent slides to show your faculty a deeper understanding of the model.

---

### Slide 1: Title Slide

**Project Title:** 
Haveloc Pro — AI-Native Enterprise Placement Platform

**Team Members:** 
Garvit Saini *(and list any other team members here)*

---

### Slide 2: Maintenance Process Model & Justification
*(This satisfies your exact template requirement)*

**1. Suitable Maintenance Process Model:** 
Iterative Enhancement Model

**2. Justification:**
The **Iterative Enhancement Model** is the most highly appropriate maintenance framework for the Haveloc Pro platform for the following key reasons:

* **Alignment with Agile Sprints:** Haveloc Pro is actively managed using an Agile Sprint methodology. The Iterative Enhancement model treats maintenance not as an unpredictable separate phase, but as a continuous cycle of incremental updates, perfectly matching our sprint-based workflow.
* **Managing Architectural Complexity:** The platform utilizes a complex, modern tech stack (Next.js, NestJS, FastAPI). Attempting massive overarching system updates is highly risky. This model mitigates risk by safely isolating specific components (like the AI Matcher or backend roles) and updating them iteratively without breaking the core system.
* **Adaptability to Requirements:** User feedback is constant in enterprise environments. The iterative approach deliberately accommodates shifting business requirements, allowing us to continuously refactor and maintain the codebase while simultaneously adding new features.

---

### Slide 3: How the Model Works in Haveloc Pro
*(Extra Slide: Demonstrating practical application)*

**Phases of Iterative Maintenance Execution:**

1. **Phase 1: Analysis of Existing System:** Before any updates, the team evaluates the current codebase baseline and Prisma database schema to ensure new modifications won't disrupt existing data logic.
2. **Phase 2: Classification of Modifications:** Maintenance tasks are sorted in the backlog as either Corrective (bug fixes), Adaptive (environment changes), or Perfective (enhancing the AI parsing algorithms).
3. **Phase 3: Design & Implementation:** The required changes are developed within our standard 2-week sprints, ensuring maintenance work is actively planned alongside new feature development.
4. **Phase 4: Testing & Deployment:** The iteration is tested against our established Acceptance Criteria and deployed seamlessly, establishing a new stable baseline for the next iteration.

---

### Slide 4: Key Advantages Achieved
*(Extra Slide: Highlighting project benefits)*

**Why this guarantees project success:**

* **Minimized Downtime:** Because updates are small and incremental, the core placement platform remains reliably online for recruiters and students.
* **Faster Defect Resolution:** By iteratively analyzing the system, critical bugs (like login failures or strict routing errors) are identified and patched in the immediate next cycle.
* **Continuous Modernization:** It prevents the software from becoming legacy code by constantly refining the AI matching models and frontend UI over time, prolonging the platform's lifespan.
