# JEEVIKASETU (जीविका सेतु)
## Voice-First Flood Livelihood Recovery and Administrative Coordination Platform for Bihar
### Hack for Social Cause — Viksit Bharat Young Leaders Dialogue 2027

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-10%20Passed-brightgreen.svg)]()

---

## 1. Executive Summary & Vision

**JeevikaSetu** is an operational, full-stack, voice-first humanitarian coordination platform tailored for the flood-prone plains of North Bihar (Supaul, Darbhanga, Madhubani, Muzaffarpur, Saharsa, Khagaria). 

While conventional disaster management focuses primarily on physical evacuation and short-term dry ration distribution, recurring floods inflict severe **livelihood destruction**:
- Submerged paddy, maize, and vegetable crops.
- Milch cows and buffaloes washed away or facing acute fodder starvation.
- Silted diesel pumpsets, sprayers, and agricultural implements.
- Submerged kirana stores, waterlogged grain inventories, and ruined artisan equipment.
- Complete cessation of daily wage agricultural labor for 10–25 days.

**The Governance Challenge:** Distress-affected rural citizens lack simple mechanisms to report livelihood losses in their mother tongue (Hindi/Bhojpuri), while district administrators receive fragmented, paper-based claims that are difficult to assign, verify, deduplicate, and follow up systematically.

**Core Mission:**
> **"Make it easy for a citizen to report a livelihood loss, and make it easier for the administration to verify, coordinate, and track the response."**

The platform maintains strict ethical transparency: **It does not falsely promise immediate compensation, cash transfers, or automatic relief.** It structures loss accounts into traceable administrative workflows.

---

## 2. Alignment with Official HSC 2027 Evaluation Criteria

| HSC 2027 Evaluation Parameter | Demonstrated Implementation in JeevikaSetu |
|---|---|
| **A. Relevance** | Addresses the annual flood livelihood crisis in North Bihar river basins (Kosi, Kamla-Balan, Gandak). Target beneficiaries: marginal farmers, sharecroppers (बटाईदार), livestock rearers, rural artisans, and landless wage laborers. |
| **B. Technical Strength** | Real database-backed architecture (Prisma ORM, SQLite/PostgreSQL), typed API contracts (Zod), validated 10-stage finite state machine, explainable priority engine, RBAC on every endpoint, and 100% test pass rate. |
| **C. Functionality** | Complete working end-to-end workflow: citizen speech recording $\rightarrow$ transcript confirmation $\rightarrow$ AI entity suggestion $\rightarrow$ submission $\rightarrow$ BDO triage $\rightarrow$ volunteer field verification $\rightarrow$ recovery scheme linkage $\rightarrow$ DM aggregate dashboard $\rightarrow$ citizen tracking. |
| **D. Creativity & Innovation** | Novel combination of voice-first Devanagari interaction, browser TTS playback, transparent priority score breakdown (0–100), jurisdiction-aware routing, and convergence with existing state schemes (JEEViKA, Animal Husbandry, MGNREGA). |
| **E. Social Cause Impact** | Substantially reduces reporting friction from hours of travel and queuing to $<3$ minutes on a mobile phone; reduces first-review response time to $<24$ hours; flags cases overdue $>48$ hours for administrative intervention. |
| **F. Presentation & Readiness** | Complete open-source repository, 7-slide pitch deck outline (`docs/HSC_SLIDES_OUTLINE.md`), 3–5 min demo script (`docs/DEMO_SCRIPT.md`), AI disclosure (`docs/AI_DISCLOSURE.md`), and instant 1-click evaluator role switcher. |

---

## 3. Two Distinct Experiences

### A. Citizen Experience (Ultra-Simplified & Voice-First)
- **Zero Jargon:** No administrative acronyms, departmental silos, or confusing eligibility matrices.
- **Large Touch Targets (48px+):** Designed for low-cost Android smartphones starting at 320px width.
- **Microphone First:** Single prominent action: **“अपना नुकसान बताइए” (Tell Us Your Loss)**.
- **Speech-to-Text & Fallback:** Web Speech API integration in Hindi (`hi-IN`) and English (`en-IN`), backed by one-click authentic sample prompts for noisy environments or unsupported browsers.
- **Transcript Confirmation & Read-back:** Large Devanagari text with text-to-speech (TTS) audio read-aloud assistance.
- **Conversational Form:** Step-by-step minimal missing info (Name, 10-digit Phone, authentic Bihar District/Block/Panchayat/Village dropdowns).
- **Transparent Tracking:** Unique Report ID (e.g. `JS-2027-SUP-8411`) with clear 5-stage progress timeline without exposing internal staff notes.

### B. Administrative Command Portal (Information-Dense & Role-Aware)
- **Role-Based Access Control (RBAC):** Tailored views and validated workflow permissions across 8 administrative tiers.
- **Interactive Role Switcher Bar:** Evaluators can switch between all 8 roles in **1 click** from the header toolbar!
- **Data-Driven Dashboards:** Real-time KPIs, Recharts bar and pie visualizations, block comparison charts, and aging/overdue queues (<24h, 24-48h, >48h overdue).
- **Dossier & Audit History:** Full case dossiers with citizen statements, volunteer field inspection notes, photo evidence, and immutable audit logs.

---

## 4. Administrative Role Matrix & Demo Credentials

Every demo account is pre-configured with the password: `password123`. The admin header includes an **instant 1-click role switcher dropdown** for rapid evaluation.

| Role | Demo Account Name | Email | Jurisdiction / Department | Permitted Core Responsibilities |
|---|---|---|---|---|
| **1. Volunteer** | Ramesh Mandal (रमेश मंडल) | `volunteer@jeevikasetu.gov.in` | Panchayat: Mahuwa, Nirmali Block | View assigned reports, conduct physical field inspection, record crop acreage/livestock loss, submit verification. |
| **2. BDO** | Anjali Kumari, BAS | `bdo.nirmali@jeevikasetu.gov.in` | Block: Nirmali, Supaul | Review block queue, assign cases to volunteers, detect duplicates, manage overdue cases, escalate bottlenecks. |
| **3. DDC** | Rajeshwar Prasad, IAS | `ddc.supaul@jeevikasetu.gov.in` | District: Supaul (DRDA) | Cross-block convergence, rural development linkages (MGNREGA wage jobs, JEEViKA SHG emergency loans). |
| **4. DPO** | Dr. Sunita Verma | `dpo.jeevika@jeevikasetu.gov.in` | District: Supaul (JEEViKA) | Programme-specific follow-ups, SHG micro-credit restructuring, animal health camp coordination. |
| **5. SDM** | Amit Kumar Roy, BAS | `sdm.nirmali@jeevikasetu.gov.in` | Subdivision: Nirmali | Subdivisional escalations, inter-departmental dispute review, administrative directives. |
| **6. ADM** | Sanjay Kumar Singh, BAS | `adm.relief@jeevikasetu.gov.in` | District: Supaul (Disaster Relief) | District disaster relief cell coordination, revenue loss records, severe vulnerability escalations. |
| **7. DM** | Kaushal Kishore, IAS | `dm.supaul@jeevikasetu.gov.in` | District: Supaul (Collectorate) | Strategic district command dashboard, block comparisons, policy directives, aggregate CSV export. |
| **8. Admin** | Priya Sharma | `admin@jeevikasetu.gov.in` | State: Bihar (IT Cell) | User account management, role assignments, system health, and security audit logs. |

---

## 5. Technology Stack & Architecture

```
JeevikaSetu Monorepo
├── client/                     # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/client.ts       # Typed API client
│   │   ├── components/         # VoiceRecorder, StatusBadge, PriorityBadge, AudioPlayer
│   │   ├── context/            # AuthContext, LanguageContext, AccessibilityContext
│   │   ├── i18n/               # Multilingual dictionary (Hindi, Bhojpuri, English)
│   │   └── pages/
│   │       ├── citizen/        # CitizenHome, VoiceReport, ReportSuccess, TrackReport
│   │       └── admin/          # AdminLogin, Dashboard, CasesList, CaseDetail, Analytics
├── server/                     # Node.js + Express + TypeScript + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma       # Relational schema (SQLite / PostgreSQL)
│   │   └── seed.ts             # Authentic Bihar flood demonstration dataset
│   ├── src/
│   │   ├── middleware/         # JWT auth, RBAC permissions, error handler
│   │   ├── routes/             # auth, reports, verification, analytics, jurisdictions, users
│   │   └── services/           # workflowEngine, priorityEngine, aiService, auditService
│   └── tests/                  # Vitest automated test suite (workflow & priority)
└── docs/                       # ARCHITECTURE.md, HSC_SLIDES_OUTLINE.md, DEMO_SCRIPT.md
```

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts.
- **Backend:** Node.js, Express, TypeScript, Zod Schema Validation, JWT, Bcrypt.
- **Database & ORM:** Prisma ORM with SQLite for zero-setup local demonstration; production PostgreSQL configuration documented.
- **Voice & NLP:** Web Speech API, SpeechSynthesis, and modular deterministic entity extraction (`AiService`).

---

## 6. Quickstart & Installation Instructions

### Prerequisites
- Node.js $\ge$ 18.0.0 (Tested on Node.js v24.19.0)
- npm $\ge$ 9.0.0

### Step 1: Clone and Install Dependencies
```bash
git clone https://github.com/your-org/JeevikaSetu.git
cd JeevikaSetu
npm install
```

### Step 2: Initialize Database and Seed Sample Data
```bash
# Generates Prisma client and creates SQLite dev.db
npm --workspace=server run prisma:generate
npm --workspace=server run prisma:push

# Seeds authentic Bihar flood reports, demo users, and relief directory
npm run seed
```

### Step 3: Run Automated Test Suite
```bash
npm test
```
*Expected: 10/10 tests pass across PriorityEngine and WorkflowEngine.*

### Step 4: Run Application
```bash
# Starts both Backend (Port 5000) and Frontend (Port 5173) concurrently:
npm run dev
```

Open your browser:
- **Citizen Portal:** [http://localhost:5173](http://localhost:5173)
- **Administrative Portal:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Backend API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 7. End-to-End Demonstration Scenario

Follow the step-by-step walkthrough in [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md):
1. **Citizen Loss Report:** Farmer Bhola Yadav speaks in Hindi: *"कोसी नदी के पानी से 2 बीघा धान की फसल डूब गई और गाय के लिए चारा नहीं है।"*
2. **Confirmation & Extraction:** Citizen confirms transcript with audio readback; AI extracts `धान (Paddy)` and `पशु चारा संकट (Fodder Crisis)`.
3. **Submission:** Report `JS-2027-SUP-8411` is created with priority score **78/100 (URGENT)**.
4. **BDO Assignment:** BDO assigns on-ground volunteer Ramesh Mandal.
5. **Volunteer Verification:** Volunteer records field observations: 2 bighas submerged crop, cows safe but urgent fodder needed.
6. **Recovery Convergence:** DDC refers case to Animal Husbandry Mobile Fodder Unit and Agriculture Seed Subsidy.
7. **DM Dashboard:** DM Kaushal Kishore reviews block distributions, aging bottlenecks, and exports planning CSV.
8. **Citizen Tracking:** Citizen enters `JS-2027-SUP-8411` at `/track` and sees the verified progress timeline!

---

## 8. Mobile Responsiveness & Cross-Device Compatibility

Mobile responsiveness is a core requirement for rural Bihar deployment. The application has been verified across key viewport widths:

| Viewport Width | Device Target | Tested Interactions & Layout Response |
|---|---|---|
| **320px** | Ultra-narrow Android | Single-column flow, 48px+ touch targets, no horizontal overflow, readable Devanagari text. |
| **360px** | Standard Entry Android | Comfortable single-hand microphone operation, bottom-sheet style cards. |
| **390px / 430px** | Modern Smartphones | Stepper navigation scales fluidly; transcript confirmation and audio read-aloud buttons fit neatly. |
| **768px** | Tablets / Field Tabs | 2-column detail grid, full Recharts charts, volunteer inspection form layout. |
| **1024px+** | Laptops & Desktops | Professional administrative sidebar, multi-column case dossiers, high-density analytics tables. |

---

## 9. Limitations & Real-World Deployment Roadmap

1. **Synthetic Demonstration Data:** The current database uses synthetic records clearly labeled as demonstration data to avoid privacy violations.
2. **Local Voice Recognition Variations:** Web Speech API accuracy depends on the user's browser engine and ambient noise. In production, an on-device Vosk/Whisper model or Bhashini API integration should be added.
3. **Official Procedure Verification:** Real-world rollout requires alignment with the Bihar State Disaster Management Authority (BSDMA) and Revenue & Land Reforms procedures.
4. **Deduplication Refinement:** Currently deduplicates households by combining phone number and village; production integration with Aadhaar-vault or Ration Card numbers would enhance precision.

---

## 10. Competition Deliverables & Documentation Directory

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Technical architecture, state machine, and data models.
- [`docs/HSC_SLIDES_OUTLINE.md`](docs/HSC_SLIDES_OUTLINE.md) — 7-slide official competition pitch deck outline.
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — 3–5 minute step-by-step judge presentation script.
- [`docs/AI_DISCLOSURE.md`](docs/AI_DISCLOSURE.md) — AI-use disclosure and ethical transparency self-certification.
- [`LICENSE`](LICENSE) — Open-source MIT License.

---
*Developed for Hack for Social Cause — Viksit Bharat Young Leaders Dialogue 2027.*
