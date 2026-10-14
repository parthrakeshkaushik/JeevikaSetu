# Hack for Social Cause (HSC 2027) — Pitch Deck Outline
### Viksit Bharat Young Leaders Dialogue 2027
**Project Title:** JeevikaSetu (जीविका सेतु)
**Sub-Theme:** Disaster Resilience, Rural Livelihoods & Administrative Coordination
**Focus State:** Bihar (Kosi & North Bihar Flood Plains)

---

## Slide 1: Title & Social Problem Statement

### Slide Title:
**JeevikaSetu: Voice-First Flood Livelihood Recovery and Administrative Coordination Platform for Bihar**

### Key Content:
- **The Core Crisis in Bihar:**
  - Floods in North Bihar (Kosi, Gandak, Bagmati basins) are recurring annual disasters.
  - While disaster relief focuses on immediate evacuation and dry ration distribution, **livelihood losses**—submerged standing crops, dead or starving milch cattle, destroyed kirana store inventory, silted diesel pumpsets, and halted wage employment—plunge marginal households into chronic debt cycles.
- **The Governance Gap:**
  - Rural citizens struggle with complex paperwork, digital illiteracy, and English/official terminology.
  - Administrative offices receive fragmented, paper-based claims that are difficult to verify, track, or deduplicate.
- **The Vision:**
  - One coordinated platform connecting vulnerable citizens via voice to a multi-tiered, accountable administrative response.

---

## Slide 2: Target Beneficiary Profile & Deep Human Need

### Slide Title:
**Who We Serve: The Human Face of Flood Disruption**

### Key Content:
- **Intended Beneficiaries:**
  1. **Marginal Farmers & Sharecroppers (बटाईदार):** Submerged paddy/maize crops, silted agricultural machinery.
  2. **Livestock Keepers & Dairy Producers:** Cows/buffaloes washed away or suffering acute green fodder shortage and waterborne diseases.
  3. **Landless Agricultural Wage Workers:** 10–20 days of zero daily wage labor during flood inundation.
  4. **Rural Micro-Entrepreneurs:** Kirana shops, tea kiosks, and artisan workshops destroyed by floodwaters.
- **Behavioral Realities & Constraints:**
  - Dialect preference: Hindi and Bhojpuri over English.
  - Device profile: Inexpensive Android smartphones, erratic 2G/3G connectivity.
  - Psychological state: Acute distress, displacement, immediate survival priorities.
- **Product Principle:**
  > *"Reporting a livelihood loss should feel as natural as telling a neighbor what happened."*

---

## Slide 3: Two Distinct Experiences: Citizen Simplicity vs Administrative Command

### Slide Title:
**Dual Architecture: Designed for Radical Inclusivity & Operational Rigor**

### Key Content:
- **Citizen Experience (Ultra-Simplified):**
  - Zero jargon, zero login barriers before reporting.
  - One dominant microphone button ("अपना नुकसान बताइए").
  - Real-time speech-to-text in Hindi and Bhojpuri.
  - Transcript confirmation with text-to-speech audio verification.
  - Conversational 1-question-at-a-time location & contact collection.
  - Memorable Report ID (e.g., `JS-2027-SUP-8411`) with honest tracking timeline.
- **Administrative Command Portal (Information-Dense):**
  - 8 distinct administrative tiers: Volunteer, BDO, DDC, DPO (JEEViKA), SDM, ADM, DM, Admin.
  - Searchable case queues, volunteer field assignment, and photo inspection logging.
  - Clear distinction between *Report Counts* vs *Deduplicated Households* vs *Self-Reported Estimates* vs *Verified Claims*.

---

## Slide 4: Workflow State Machine & Transparent Priority Scoring

### Slide Title:
**Traceable Case Lifecycle & Explainable Triage**

### Key Content:
- **Validated 10-Stage State Machine:**
  - `Submitted` $\rightarrow$ `Awaiting Review` $\rightarrow$ `Assigned for Field Verification` $\rightarrow$ `Verification in Progress` $\rightarrow$ `Verified / Partially Verified` $\rightarrow$ `Referred for Recovery` $\rightarrow$ `Action Recorded` $\rightarrow$ `Closed`.
  - Strict role-based transition permissions enforced server-side.
- **Transparent Priority Scoring (0 to 100):**
  - **Critical Asset Impact (+10 to +35 pts):** Livestock/fodder crisis (+20), crop submerged (+15), wage disruption (+15).
  - **Vulnerability Weighting (+5 to +20 pts):** Female-headed household (+10), landless laborer (+10), disabled dependent (+8).
  - **Aging Delay Penalty (+5 to +15 pts):** $>48$ hours pending review (+15).
- **Explainability:**
  - Full mathematical breakdown displayed on every case dossier to eliminate arbitrary bureaucratic discretion.

---

## Slide 5: System Architecture & Technical Strength

### Slide Title:
**Robust, Modern Full-Stack Engineering**

### Key Content:
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts for data visualization.
- **Backend:** Node.js, Express, TypeScript, Zod schema validation, JWT auth with RBAC.
- **Database & ORM:** Prisma ORM with SQLite for zero-setup demo; production-ready PostgreSQL migration schema.
- **Voice & Accessibility:**
  - Web Speech API integration (`hi-IN`, `en-IN`).
  - Text-To-Speech read-back for illiterate citizens.
  - High-contrast mode and dynamic text scaling (A-/A+).
  - Deterministic NLP fallback for keyword & category extraction without external vendor lock-in.
- **Quality Assurance:** 100% automated test suite pass rate covering workflow transitions, permissions, and priority calculations.

---

## Slide 6: Measurable Social Cause Impact Indicators

### Slide Title:
**Evidence-Based Impact: Measuring What Matters**

### Key Content:
- **Key Performance Indicators (KPIs):**
  1. **Citizen Submission Time:** Reduced from hours of travel and office queuing to $<3$ minutes on a mobile phone.
  2. **First-Response Triage Time:** Target $<24$ hours from citizen report to volunteer field inspection assignment.
  3. **Verification Coverage Rate:** Tracking the percentage of reported households verified by on-ground volunteers.
  4. **Overdue Bottleneck Rate:** Transparent flagging of cases pending $>48$ hours for DM/ADM escalation.
  5. **Convergence Success Rate:** Percentage of verified livelihood losses successfully linked to recovery schemes (JEEViKA SHG emergency credit, Animal Husbandry fodder camps, Agriculture contingency seeds, MGNREGA muster rolls).
- **Ethical Safeguard:** No claims of "automatic cash transfer" or "guaranteed compensation"—honest administrative coordination.

---

## Slide 7: Pilot Implementation Pathway & Scalability in Bihar

### Slide Title:
**Roadmap to Reality: From Prototype to Panchayats**

### Key Content:
- **Phase 1: Controlled Pilot (Months 1–3):**
  - Deploy in 2 high-vulnerability flood blocks: Nirmali (Supaul) and Kusheshwar Asthan (Darbhanga).
  - Onboard 50 JEEViKA Community Resource Persons (CRPs) and rural youth volunteers as field verifiers.
- **Phase 2: Departmental Convergence (Months 4–6):**
  - Integrate with Bihar Disaster Management Department (Disaster Management Portal), Animal Husbandry fodder units, and District Emergency Operations Centres (DEOC).
- **Phase 3: State-Wide Rollout (Months 7–12):**
  - Expand to all 15 flood-prone districts across North and Central Bihar.
- **Team Responsibilities:**
  - Product & Field Beneficiary Validation.
  - Frontend, Accessibility & Voice Interaction.
  - Backend, Data Architecture, Security & Analytics.

---
*Prepared for Hack for Social Cause — Viksit Bharat Young Leaders Dialogue 2027*
