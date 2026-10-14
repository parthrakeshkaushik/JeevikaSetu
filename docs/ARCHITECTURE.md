# JeevikaSetu (जीविका सेतु) — Architecture & System Design
### Voice-First Flood Livelihood Recovery and Administrative Coordination Platform for Bihar
**Competition:** Hack for Social Cause (HSC 2027) — Viksit Bharat Young Leaders Dialogue 2027

---

## 1. System Overview

**JeevikaSetu** bridges flood-affected rural households in Bihar and the multi-tiered administrative machinery. Floods in North Bihar (Kosi, Gandak, Bagmati, Kamla-Balan basins) ravage crops, kill or starve milch cattle, wash away pumpsets, submerge small kirana stores, destroy stored food grains, and halt wage labor.

The core architectural imperative is:
> **"For citizens, reporting should feel as easy as telling another human being what happened. For administrators, managing those reports should be structured, traceable, accountable, and transparent."**

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CITIZEN MOBILE INTERFACE                        │
│   • Voice-First Speech-to-Text (Hindi / Bhojpuri)                      │
│   • 1 Prominent Mic Button (48px+ touch target)                        │
│   • Transcript Confirmation & TTS Audio Playback                       │
│   • Conversational Minimal Location & Contact Details                  │
│   • Unique Report ID (e.g. JS-2027-SUP-8411) & Visual Tracking         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         HTTPS POST /api/reports
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       JEEVIKASETU BACKEND ENGINE                       │
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │   AI Extraction &     │   │     Priority Scoring Engine          │  │
│  │   NLP Suggestion      │   │     (0-100 Explainable Score)        │  │
│  └───────────────────────┘   └──────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │           Workflow State Machine & Transition Engine              │  │
│  │  Submitted ➔ Triage ➔ Assignment ➔ Field Verification ➔ Recovery  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │   RBAC & Jurisdiction │   │     Audit & Compliance Logging       │  │
│  │   Enforcement         │   │     (Immutable Event History)        │  │
│  └───────────────────────┘   └──────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         Prisma ORM (SQLite / PostgreSQL)
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     ADMINISTRATIVE COMMAND PORTAL                      │
│   • Volunteer Field Inspection & Photo Evidence Logging                │
│   • BDO Block-Level Assignment, Overdue Triage & Duplicate Detection   │
│   • DDC / DPO Recovery Schemes (JEEViKA SHG, Animal Husbandry, MGNREGA)│
│   • SDM / ADM Subdivisional & Disaster Relief Escalation Review        │
│   • DM Strategic Decision Dashboard (Heatmaps, Bottlenecks, Directives)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Two Distinct Experiences

### A. Citizen Interface (Ultra-Simplified, Voice-First)
- Designed for low-literacy rural beneficiaries using affordable Android smartphones on slow 2G/3G/4G connections.
- **Strict UI Rules:**
  - Maximum 1 dominant primary action per screen.
  - Large touch targets (48px+).
  - High-contrast, large Devanagari typography with audio read-aloud assistance.
  - No login wall before reporting.
  - No administrative designations, department silos, or government acronyms.
- **Workflow:**
  1. Language selection: हिन्दी, भोजपुरी, English.
  2. Large Microphone Button: Citizen speaks naturally.
  3. Browser Web Speech Recognition with Hindi (`hi-IN`) and English (`en-IN`) models.
  4. Real-time deterministic fallback (sample statements and manual typing) if microphone permission is denied or Web Speech API is absent.
  5. Transcript review with text-to-speech audio verification.
  6. Conversational missing information: Village, Panchayat, Block, District, and Mobile Number.
  7. Instant unique Report ID (e.g. `JS-2027-SUP-8411`) with honest disclaimer: *"This report is registered for administrative verification. It does not constitute guaranteed cash relief or automatic approval."*

### B. Administrative Command Portal (Information-Dense, Role-Aware)
- Tailored for 8 distinct administrative tiers:
  1. **On-Ground Volunteer:** Assigned panchayat cases, physical damage verification, field observations, photo evidence, verified acreage/cattle numbers.
  2. **BDO (Block Development Officer):** Block queue, volunteer assignment, duplicate detection, overdue triage, referral to recovery schemes.
  3. **DDC (District Deputy Development Commissioner):** Cross-block summaries, rural development convergence (MGNREGA, JEEViKA SHG credit restructuring).
  4. **DPO (District Programme Officer):** Programme-specific follow-ups (JEEViKA livelihood cell, animal health camps).
  5. **SDM (Sub-Divisional Magistrate):** Subdivision-level coordination, administrative reviews, escalations.
  6. **ADM (Additional District Magistrate - Relief):** Disaster relief coordination, revenue records, critical bottleneck escalations.
  7. **DM (District Magistrate):** Strategic district command dashboard, deduplicated household metrics, block distribution, unassessed loss summaries, administrative directives.
  8. **System Administrator:** Role configuration, jurisdiction management, technical health, audit logs.

---

## 3. Workflow State Machine

The case lifecycle is managed by an explicit, server-side validated state machine (`WorkflowEngine.canTransition`):

```
                     ┌──────────────────┐
                     │    SUBMITTED     │
                     └────────┬─────────┘
                              │ (BDO/ADM/DM triage)
                              ▼
                     ┌──────────────────┐
                     │ AWAITING_REVIEW  │
                     └────────┬─────────┘
                              │ (Supervisor assigns)
                              ▼
           ┌──────────────────────────────────────┐
           │      ASSIGNED_FOR_VERIFICATION       │
           └──────────────────┬───────────────────┘
                              │ (Volunteer accepts)
                              ▼
           ┌──────────────────────────────────────┐
           │       VERIFICATION_IN_PROGRESS       │
           └──────────────────┬───────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │ (Physical field inspection completed)  │
         ▼                    ▼                    ▼
   ┌───────────┐    ┌────────────────────┐    ┌───────────────────────────┐
   │ VERIFIED  │    │ PARTIALLY_VERIFIED │    │ ADDITIONAL_INFO_REQUIRED  │
   └─────┬─────┘    └─────────┬──────────┘    └───────────────────────────┘
         │                    │
         └───────────┬────────┘
                     │ (Referred to JEEViKA / Animal Husbandry / Agriculture)
                     ▼
       ┌───────────────────────────────┐
       │     REFERRED_FOR_RECOVERY     │
       └─────────────┬─────────────────┘
                     │
                     ▼
       ┌───────────────────────────────┐
       │     FOLLOWUP_IN_PROGRESS      │
       └─────────────┬─────────────────┘
                     │ (Relief / credit recorded)
                     ▼
       ┌───────────────────────────────┐
       │        ACTION_RECORDED        │
       └─────────────┬─────────────────┘
                     │ (Case closed by authorized officer)
                     ▼
       ┌───────────────────────────────┐
       │            CLOSED             │
       └───────────────────────────────┘
```

### Transition Enforcement Matrix

| From Status | Allowed Target Status | Permitted Roles | Remarks Required |
|---|---|---|---|
| `SUBMITTED` | `AWAITING_REVIEW` | BDO, DDC, ADM, DM, ADMIN | No |
| `SUBMITTED`, `AWAITING_REVIEW` | `ASSIGNED_FOR_VERIFICATION` | BDO, DDC, SDM, ADM, DM, ADMIN | Yes (assignment note) |
| `ASSIGNED_FOR_VERIFICATION` | `VERIFICATION_IN_PROGRESS` | VOLUNTEER, BDO, ADMIN | No |
| `VERIFICATION_IN_PROGRESS` | `VERIFIED`, `PARTIALLY_VERIFIED`, `UNABLE_TO_VERIFY` | VOLUNTEER, BDO, ADMIN | Yes (observations & rationale) |
| `VERIFIED`, `PARTIALLY_VERIFIED` | `REFERRED_FOR_RECOVERY` | BDO, DDC, DPO, SDM, ADM, DM | Yes (scheme selection) |
| `REFERRED_FOR_RECOVERY` | `FOLLOWUP_IN_PROGRESS`, `ACTION_RECORDED` | BDO, DDC, DPO, ADM, DM | Yes (action details) |
| `ACTION_RECORDED`, `VERIFIED` | `CLOSED` | BDO, DDC, ADM, DM, ADMIN | Yes (closure justification) |
| `CLOSED` | `REOPENED` | ADM, SDM, DM, ADMIN | Yes (reopen justification) |

---

## 4. Explainable Priority Scoring Engine

To prevent arbitrary triage and support human decision-making, cases are scored between **0 and 100**:

$$\text{Priority Score} = \text{Base (20)} + \text{Category Impact (max 35)} + \text{Vulnerabilities (max 20)} + \text{Disruption / Family (max 15)} + \text{Aging Delay (max 15)}$$

### Scoring Breakdown
1. **Criticality of Livelihood Asset (+10 to +35 points):**
   - Livestock loss / Acute fodder shortage: **+20**
   - Submerged paddy or cash crop: **+15**
   - Wage labor cessation: **+15**
   - Small shop / grain inventory destruction: **+10**
   - Artisan tools / Fish pond breach: **+10**
2. **Voluntary Vulnerability Indicators (+5 to +20 points):**
   - Female-headed household: **+10**
   - Landless agricultural laborer: **+10**
   - Dependent with disability / Elderly: **+8**
   - Marginal farmer (< 1 ha): **+5**
3. **Disruption Duration & Household Load (+5 to +15 points):**
   - Household size $\ge 6$ members: **+5**
   - Disruption $> 7$ days: **+10** (3-7 days: **+5**)
4. **Aging / Overdue Penalty (+5 to +15 points):**
   - Pending $> 48$ hours without review: **+15**
   - Pending $24-48$ hours: **+8**

### Levels:
- **0–34:** LOW (सामान्य)
- **35–54:** MEDIUM (मध्यम)
- **55–74:** HIGH (उच्च)
- **75–100:** URGENT (अति-प्राथमिक)

**Explainability:** Every case exposes its exact mathematical rationale string (e.g. `पशुधन संकट (+20) • महिला प्रधान परिवार (+10) • दीर्घकालिक अवरोध (+10) • आधारभूत (+20)`) to ensure complete accountability.

---

## 5. Security, Privacy & Integrity Safeguards

1. **Role-Based Server-Side Authorization:** Every protected endpoint verifies JWT tokens and checks user role permissions on the backend.
2. **Jurisdiction Scoping:**
   - Volunteers only see cases assigned to them or within their assigned panchayat.
   - BDOs only access cases within their block.
   - Senior officers (DDC, ADM, DM) access district-level aggregated or individual records within their jurisdiction.
3. **Citizen Data Privacy:**
   - Citizens track reports securely using their unique Report ID and verified phone number.
   - Citizens **never** see internal administrative notes, staff designations, confidential communications, or other households' data.
   - Public dashboards report deduplicated households and anonymized counts without exposing personal mobile numbers or GPS coordinates.
4. **Audit Trail:**
   - Every status transition, assignment, verification, escalation, and user action is written immutably to `WorkflowEvent` and `SystemAuditLog`.

---

## 6. Production Database Migration (PostgreSQL)

For local development and zero-setup evaluation, JeevikaSetu defaults to SQLite (`file:./dev.db`).

To switch to production **PostgreSQL**:
1. In `server/prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In `server/.env`, set the PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/jeevikasetu?schema=public"
   ```
3. Run migrations:
   ```bash
   npm --workspace=server run prisma:push
   npm --workspace=server run seed
   ```
