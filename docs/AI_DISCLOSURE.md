# AI-Use Disclosure & Ethical Alignment
### Hack for Social Cause (HSC 2027) — Viksit Bharat Young Leaders Dialogue 2027
**Project:** JeevikaSetu (जीविका सेतु)

---

## 1. Compliance Statement

In alignment with the competition transparency standards of Hack for Social Cause 2027 under the Viksit Bharat Young Leaders Dialogue, this disclosure details how artificial intelligence tools and models were utilized in the design, engineering, and operation of JeevikaSetu.

---

## 2. In-App AI Capabilities & Operational Safeguards

The JeevikaSetu platform incorporates AI-driven technologies to solve acute accessibility challenges for distressed rural citizens in Bihar:

### A. Speech-to-Text (Voice-First Reporting)
- **Implementation:** Web Speech API in browser client with fallback transcription simulation.
- **Languages Supported:** Hindi (`hi-IN`), Bhojpuri, and English (`en-IN`).
- **Ethical Safeguards:**
  - **No Unconfirmed Submissions:** Speech recognition transcripts are never submitted directly to government records. The citizen must explicitly confirm, edit, or re-record the statement on Step 2.
  - **Honest Fallback:** If microphone permission is unavailable or background noise is severe, deterministic sample prompts and manual text typing are provided immediately.
  - **Privacy:** No audio recordings are shared with third-party advertising or general-purpose external chatbots.

### B. Natural Language Processing & Category Suggestion
- **Implementation:** Deterministic regex and NLP entity extraction engine (`AiService.extractFromTranscript`).
- **Function:** Analyzes natural Devanagari speech (e.g. *"2 बीघा धान डूब गई और गाय का चारा नहीं बचा"*) and suggests structured categories (`CROP`, `LIVESTOCK`) and entities (paddy, cow fodder crisis).
- **Ethical Safeguards:**
  - Explicitly labeled in the UI as **"एआई सुझावित आजीविका श्रेणियां (AI-extracted suggestions)"**.
  - System disclaims: *"AI suggestions do not constitute assessed facts or legal eligibility. Final assessment requires human on-ground physical inspection."*

### C. Prohibited AI Uses
- **No Automated Approval:** AI is strictly prohibited from approving cash compensation, assessing legal loss damages, or determining entitlement.
- **No Hallucinated Records:** The system never invents missing names, dates, loss amounts, or land measurements.

---

## 3. Development-Time AI Assistance Disclosure

The development of this prototype utilized AI coding assistants for software scaffolding and documentation structuring:

| Activity / Component | AI-Assisted Aspects | Team Validation & Human Engineering |
|---|---|---|
| **System Architecture** | Initial boilerplate schema scaffolding | Custom Bihar flood jurisdiction hierarchy, state machine rules, and role permission matrices designed by the team. |
| **Workflow State Machine** | Transition validation boilerplate | State transition matrix, permission boundaries, and role separation implemented and validated with 10 unit tests. |
| **Frontend UI/UX** | Tailwind CSS styling suggestions | Mobile-first accessibility (48px+ touch targets), Devanagari font tuning, and dual citizen/admin information architecture. |
| **Priority Scoring Engine** | Mathematical formulation assistance | Deterministic 0-100 explainability algorithm with explicit human-readable rationale strings. |
| **Documentation & Outlines** | Drafting formatting templates | Domain-specific content, field research context, Bihar disaster convergence pathways, and presentation scripts written and reviewed by the team. |

---

## 4. Self-Certification

We certify that:
1. All database operations, role permissions, workflow transitions, and state checks are backed by real, executing software code and tests.
2. Demonstration data is synthetic, clearly labeled as sample data, and does not impersonate real living citizens or fabricate official government approvals.
3. No proprietary, plagiarized, or unauthorized third-party intellectual property has been incorporated into this submission.

*Signed by the JeevikaSetu Project Contributors*
*Hack for Social Cause 2027*
