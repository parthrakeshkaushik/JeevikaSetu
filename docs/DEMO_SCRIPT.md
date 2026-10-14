# JeevikaSetu (जीविका सेतु) — 3-5 Minute Demonstration Script
### Hack for Social Cause (HSC 2027) — Viksit Bharat Young Leaders Dialogue 2027

This script provides an end-to-end walkthrough of the working prototype for competition judges and evaluators.

---

## Demonstration Setup
1. **Application URLs:**
   - Citizen Portal: `http://localhost:5173/`
   - Administrative Portal: `http://localhost:5173/admin/login`
2. **Pre-seeded Accounts:**
   - All 8 roles can be logged into instantly with **1 click** using the **"मूल्यांकन रोल स्विच करें" (Evaluator Role Switcher)** toolbar at the top of the administrative interface!

---

## Act 1: The Citizen's Voice Journey (1.5 Minutes)

### Scenario:
*Farmer Bhola Yadav from Mahuwa village (Nirmali block, Supaul district) has suffered devastating flood damage: 2 bighas of submerged paddy crop and an acute fodder shortage for his two dairy cows.*

1. **Open the Citizen Home Page (`/`):**
   - Point out the radical simplicity: no government acronyms, no login wall.
   - Show the language selector: हिन्दी, भोजपुरी, English.
   - Show accessibility controls: A- / A+ text enlargement, high-contrast mode, and the **"ध्वनि निर्देश सुनें" (Listen Instructions)** audio player.
2. **Tap the Large Primary Button ("अपना नुकसान बताइए"):**
   - Directs to `/report`.
   - Explain the microphone interaction:
     - In supported browsers (Chrome, Edge), tap the mic and speak in Hindi or Bhojpuri.
     - Demonstrate the honest fallback: tap sample prompt **#1: *"कोसी नदी के पानी से 2 बीघा धान की फसल डूब गई और गाय के लिए चारा नहीं है।"***
3. **Step 2: Confirm Transcript:**
   - Display the recognized statement in large, crisp Devanagari text.
   - Tap **"विवरण को आवाज में सुनें"** to play audio read-back (SpeechSynthesis) for citizens who struggle with reading.
   - Point out the **AI-extracted tags**: `धान (Paddy)`, `पशु चारा संकट (Fodder Crisis)` automatically suggested with confidence and clear disclaimers.
   - Tap **"हाँ, सही है (आगे बढ़ें)"**.
4. **Step 3: Location and Minimal Contact:**
   - Fill in:
     - Name: `भोला यादव (Bhola Yadav)`
     - Phone: `9876543210`
     - District: `Supaul` $\rightarrow$ Block: `Nirmali` $\rightarrow$ Panchayat: `Mahuwa` $\rightarrow$ Village: `महुवा दक्षिण टोला`
     - Self-reported estimate: `₹48,000` (highlight honest disclaimer: *"This is a self-reported estimate, not official compensation"*).
     - Vulnerability flag: Check *सीमांत कृषक (Marginal Farmer)*.
5. **Step 4: Review and Submit:**
   - Review concise summary.
   - Tap **"रिपोर्ट दर्ज करें"**.
   - Land on `/report/success` displaying unique Report ID: `JS-2027-SUP-8411`.
   - Tap **"कॉपी करें"** to copy the Report ID.

---

## Act 2: Administrative Triage & Field Verification (1.5 Minutes)

1. **Log In to Administrative Portal (`/admin/login`):**
   - Use the **1-Click Evaluator Toolbar** to select **BDO (अंजलि कुमारी, निर्मली)**.
2. **BDO Block Command Dashboard (`/admin/dashboard`):**
   - Point out the KPIs: Total reports, Deduplicated households, Pending verification, Overdue cases.
   - Note the Livelihood Category Bar Chart and Block Comparison charts.
3. **View the Case Dossier (`/admin/cases`):**
   - Locate report `JS-2027-SUP-8411`.
   - Notice the **Priority Badge: URGENT (78/100)**.
   - Hover over the badge to reveal the explainable mathematical rationale:
     `पशुधन संकट (+20) • फसल जलमग्नता (+15) • सीमांत कृषक (+5) • बड़ा परिवार (+5) • आधारभूत (+20)`.
   - Click **"विवरण (Dossier)"**.
4. **Assign Field Verification:**
   - BDO clicks **"स्वयंसेवक को सौंपें (Assign)"**.
   - Selects **Ramesh Mandal (Volunteer, Nirmali)** with the note: *"कृपया 24 घंटे में स्थल पर जाकर फसल व चारा क्षति की पुष्टि करें।"*
   - Status updates automatically to `ASSIGNED_FOR_VERIFICATION`.
5. **Switch Role to Volunteer (Ramesh Mandal):**
   - In the top header role switcher, select **1. Volunteer (रमेश मंडल)**.
   - Open the case dossier.
   - Volunteer clicks **"भौतिक सत्यापन दर्ज करें (Verify)"**:
     - Outcome: `सत्यापित (VERIFIED)`
     - Field Notes: *"मौके पर खेत में 4 फीट पानी भरा पाया गया। धान की फसल सड़ चुकी है। दोनों गायें सुरक्षित हैं परंतु सूखे चारे की भारी कमी है।"*
     - Decision Rationale: *"स्थल निरीक्षण एवं स्थानीय मुखिया से पुष्टि उपरांत दावा पूर्णतः सत्य पाया गया।"*
     - Verified Crop Loss: `2.0 बीघा`.
     - Recommended Action: *"पशुचारा शिविर से तत्काल भूसा एवं कृषि विभाग से आकस्मिक बीज मिनीकिट।"*
     - Submit verification.

---

## Act 3: Recovery Convergence & Citizen Tracking (1 Minute)

1. **Switch Role to DDC (राजेश्वर प्रसाद, IAS) or BDO:**
   - Open case `JS-2027-SUP-8411`.
   - Officer clicks **"पुनर्प्राप्ति योजना (Recovery)"**:
     - Scheme: `ANIMAL_HUSBANDRY_CAMP`
     - Department: `Animal Husbandry Dept, Supaul`
     - Action: *"सचल पशु चिकित्सा शिविर के माध्यम से 2 बोरी पशु चारा एवं संक्रामक रोग टीका उपलब्ध कराया गया।"*
     - Save. Status advances to `REFERRED_FOR_RECOVERY` $\rightarrow$ `ACTION_RECORDED`.
2. **Switch Role to District Magistrate (कौशल किशोर, IAS):**
   - View the District Overview dashboard (`/admin/dashboard`).
   - Check the **Aging Queue**: Cases $<24$h, $24-48$h, and $>48$h overdue.
   - Click **"एनालिटिक्स (Analytics)"** $\rightarrow$ Click **"CSV निर्यात करें"** to download the official aggregate planning report.
3. **Citizen Closes the Loop (`/track`):**
   - Return to the public citizen tracker at `http://localhost:5173/track`.
   - Enter Report ID `JS-2027-SUP-8411`.
   - The citizen sees the completed progress timeline:
     - ✓ रिपोर्ट प्राप्त हुई (Report Received)
     - ✓ प्रशासनिक समीक्षा एवं आवंटन (Assigned to Volunteer)
     - ✓ भौतिक क्षेत्र सत्यापन पूर्ण (Verified)
     - ✓ आजीविका पुनर्प्राप्ति योजना अग्रेषित (Fodder & Seed Relief Action Recorded)
   - Highlight: Internal private staff notes and official files remain protected, while the citizen receives a transparent, compassionate, and dignified response.

---
*End of demonstration.*
