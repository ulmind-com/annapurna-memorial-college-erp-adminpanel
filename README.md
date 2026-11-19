# Annapurna Memorial College ERP Admin Panel
**Sundarban Ashutosh B.Ed. College & Annapurna Memorial College**
*Production-grade Higher Education Management Console*

---

## 🌟 Key Features
- **Modern Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons.
- **Hardware-Accelerated Web Audio API Sound Synthesizer**:
  - Pure native oscillator synthesizer providing delicate micro-interaction clicks, navigation sweeps, validation alerts, and triumphant marksheet approval chords.
  - Persistent Sound Toggle (`🔊 Sound FX: ON/OFF`) in header.
- **Marksheet Approval Pipeline Command Center**:
  - Interactive multi-stage visual state machine:
    `DRAFT` ➔ `SUBMITTED_BY_FACULTY` ➔ `DEPARTMENT_VERIFIED` ➔ `ADMIN_APPROVED` ➔ `PUBLISHED` (with rejection and feedback routing).
  - Detailed subject marks tabulation with theory, practicum, credits, letter grades, and SGPA calculations.
  - One-click ReportLab PDF download.
  - Public Tamper-proof QR Code verification tool.
- **Student Admission & Trainee Roster**:
  - Full roll number directory, registration tracking, enrollment modal, profile view.
- **Faculty & Academic Staff Directory**:
  - NCTE subject allotments, qualifications, contact cards.
- **Curriculum & Academic Catalog**:
  - Courses (B.Ed., D.El.Ed., B.A. Ed.), Semester breakdowns, credit allocations.
- **Attendance & Biometric Compliance**:
  - Daily sheet taking, batch "Mark All Present", automated NCTE 75% short attendance warnings.
- **Fee Management & Financial Ledgers**:
  - Automated semester invoicing, payment recording (UPI, NEFT, Cash), collection rates.
- **Notices, Circulars & Digital Library**:
  - Instant broadcasting with priority badges (URGENT, HIGH, NORMAL).
  - Lecture notes and practicum repository.
- **Security Audit Logs**:
  - Institutional event history and action timestamps.
- **Resilient Dual-Mode Operation**:
  - Connects to live FastAPI backend (`http://localhost:8000/api/v1`).
  - Seamlessly falls back to reactive in-memory mock storage if the backend is temporarily offline, guaranteeing complete interactivity at all times.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The admin console will be accessible at [http://localhost:5173](http://localhost:5173).

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```
