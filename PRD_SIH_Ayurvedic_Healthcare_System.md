# Product Requirements Document
## Holistic AI-Powered Ayurvedic Healthcare System
### SIH1346 · SIH1347 · SIH1383

---

**Document Version:** 1.0  
**Status:** Ready for Development  
**Last Updated:** August 2026  
**Owner:** Product & Architecture Team  

---

## Table of Contents

1. [Executive Summary & Objectives](#1-executive-summary--objectives)
2. [User Personas & Pain Points](#2-user-personas--pain-points)
3. [User Stories & Acceptance Criteria](#3-user-stories--acceptance-criteria)
4. [Functional Requirements](#4-functional-requirements)
5. [Technical Architecture & Data Flow](#5-technical-architecture--data-flow)
6. [Success Metrics & KPIs](#6-success-metrics--kpis)
7. [Implementation Plan / High-Level Timeline](#7-implementation-plan--high-level-timeline)

---

## 1. Executive Summary & Objectives

### 1.1 Project Overview

The **Holistic AI-Powered Ayurvedic Healthcare System** is a web-based, clinician-supervised digital health platform that unifies three Smart India Hackathon (SIH) problem statements into one seamless hospital workflow. The system modernises Ayurvedic patient care by combining AI-driven intake, intelligent scheduling, and classical-text-backed clinical decision support — while keeping every clinical decision firmly in the hands of licensed practitioners.

| SIH Problem | Focus | Scope |
|---|---|---|
| SIH1346 | AI chatbot for Prakriti (body-constitution) assessment | Patient-facing |
| SIH1347 | Source-cited Ayurvedic drug/formulation discovery | Clinician-facing |
| SIH1383 | Doctor availability optimisation & appointment allocation | Hospital operations |

### 1.2 Problem Statement

India's public Ayurvedic hospitals face three compounding challenges:

- **Long, unstructured OPD queues** with no real-time visibility for patients or staff.
- **No standardised Prakriti intake** — assessment quality varies widely between practitioners.
- **Clinician reliance on memory** for classical formulations, risking missed contraindications and untraceable prescriptions.

### 1.3 Strategic Objectives

| # | Objective | Linked SIH |
|---|---|---|
| O1 | Reduce average OPD waiting time by ≥ 30% | SIH1383 |
| O2 | Deliver a reproducible, transparent Prakriti assessment in < 10 minutes | SIH1346 |
| O3 | Surface source-cited Ayurvedic formulation options for ≥ 95% of confirmed diagnoses | SIH1347 |
| O4 | Eliminate known contraindication slip-throughs (jaggery for diabetics, alcohol in preparations for pregnant patients, etc.) | SIH1347 |
| O5 | Support ABDM/ABHA-compatible patient registration | All |
| O6 | Maintain 100% human override authority on every clinical decision | All |

### 1.4 Out of Scope (v1.0 Prototype)

- Computer vision diagnostics (tongue, eye, nail analysis)
- Smartwatch / wearable integration
- Comprehensive allopathy–Ayurveda drug interaction database (flagged for v2)
- Direct ABHA record writing (mock flow only in v1)
- Full pharmacy substitution workflow automation

---

## 2. User Personas & Pain Points

### Persona 1 — Ravi, the Rural Patient (Primary)

> *"I have to travel 40 km, wait 3 hours, and the doctor barely has time to ask me questions."*

- **Age:** 52 | **Tech literacy:** Low | **Language:** Hindi
- Presents with chronic digestive complaints; unaware of Prakriti concept
- **Pain Points:**
  - No prior information on expected wait time
  - Repeats the same medical history at every visit
  - Doesn't understand Ayurvedic constitutional assessment
  - Cannot read prescription instructions; needs vernacular guidance

### Persona 2 — Dr Meena, the Ayurvedic Clinician (Primary)

> *"I see 60–80 patients a day. I need information at my fingertips, not buried in texts I don't have time to open."*

- **Age:** 38 | **Role:** BAMS physician in an OPD
- **Pain Points:**
  - Manually querying classical texts for formulations is impractical in a busy OPD
  - No system flags jaggery or alcohol in preparations for high-risk patients
  - Patient history arrives fragmented or not at all before the consultation starts
  - No visibility into real-time queue load

### Persona 3 — Priya, the Hospital Receptionist / Admin (Secondary)

> *"Doctors call in late and I have 30 patients demanding to know when they'll be seen."*

- **Age:** 29 | **Role:** OPD desk coordinator
- **Pain Points:**
  - Manually reshuffling appointment slots when a doctor is delayed
  - No real-time tool to communicate delays to waiting patients
  - Duplicate paper tokens leading to queue disputes

### Persona 4 — Ankit, the Pharmacist (Secondary)

> *"Doctors prescribe medicines we ran out of last week. By the time I notice, the patient is already at the counter."*

- **Age:** 35 | **Role:** Hospital Ayurvedic pharmacist
- **Pain Points:**
  - No pre-prescription inventory check
  - Manual alerting to doctors about stock-outs is slow
  - Substitutions require renegotiating with the doctor at the last moment

### Persona 5 — Prof. Shalini, the Researcher (Tertiary)

> *"Our Prakriti studies use paper records that take months to de-identify."*

- **Age:** 45 | **Role:** Ayurvedic academic
- **Pain Points:**
  - No consent-driven, de-identified dataset for Prakriti reliability studies
  - Treatment outcome tracking doesn't exist in most hospitals

---

## 3. User Stories & Acceptance Criteria

Stories are tagged **[P0]** (must-have for prototype), **[P1]** (high priority), or **[P2]** (future sprint).

---

### Epic 1: Patient Onboarding & Emergency Screening (SIH1346 / SIH1383)

---

**US-101 [P0] — ABHA-Compatible Registration**  
*As a patient, I want to register using my ABHA number or basic details so the system recognises me across visits.*

**Acceptance Criteria:**
- [ ] Patient can register via mobile number + OTP or mock ABHA Scan-and-Share
- [ ] Form collects: name, age, gender, contact, preferred language, and consent checkboxes
- [ ] Consent covers health data use, voice input, and optional research participation
- [ ] Existing patient recognised by mobile number; history pre-filled on return visit
- [ ] Registration completes in ≤ 2 minutes on a mid-range mobile device

---

**US-102 [P0] — Emergency Red-Flag Screening**  
*As a patient, I want the system to immediately alert hospital staff if I report a life-threatening symptom.*

**Acceptance Criteria:**
- [ ] Red-flag symptom list checked before any further flow (chest pain, severe breathlessness, fainting, severe bleeding, confusion, acute high-risk fever, severe allergic reaction)
- [ ] On red-flag detection: appointment flow halts; patient sees emergency guidance message; triage desk receives alert with patient name, token, and flagged symptom
- [ ] A nurse or doctor must manually confirm the triage priority before the patient's queue status changes
- [ ] System does not display a diagnosis label in the red-flag screen

---

**US-103 [P0] — Multilingual Symptom Intake Chatbot**  
*As a patient, I want to describe my symptoms in my regional language using voice or text.*

**Acceptance Criteria:**
- [ ] Supports: English, Hindi, Tamil, Malayalam (expandable via language config)
- [ ] Voice input transcribed via Bhashini API or equivalent; text displayed for patient confirmation before submission
- [ ] Collects: current symptoms, duration, severity, existing diseases, current medicines, allergies, age-group flags (pediatric/geriatric), pregnancy/lactation status, prior consultation notes
- [ ] Patient can correct any answer before proceeding to the next screen
- [ ] Session auto-saves so the patient can resume if disconnected

---

### Epic 2: Prakriti Assessment (SIH1346)

---

**US-201 [P0] — Transparent Prakriti Questionnaire**  
*As a patient, I want to answer a structured questionnaire so the system generates my body-constitution profile.*

**Acceptance Criteria:**
- [ ] Questionnaire covers: physical traits (body frame, skin, hair), physiological traits (digestion, sleep, appetite), psychological traits (memory, temperament), and lifestyle patterns
- [ ] Minimum 30, maximum 60 questions presented in adaptive order; irrelevant branches skipped
- [ ] Each question offers voice, text, or button input
- [ ] Progress bar shown throughout; patient can go back and revise
- [ ] Assessment completable in ≤ 10 minutes

---

**US-202 [P0] — Prakriti Result Display**  
*As a patient, I want to see my Vata–Pitta–Kapha scores clearly with a confidence indicator.*

**Acceptance Criteria:**
- [ ] Result shows relative scores (e.g., Vata 55%, Pitta 30%, Kapha 15%) as a visual bar or chart, not a single fixed label
- [ ] Confidence level displayed (Low / Moderate / High) based on answer consistency
- [ ] Prominent disclaimer: *"AI-assisted assessment — clinician verification required"*
- [ ] Prakriti profile stored separately from the patient's current symptom record
- [ ] Patient can download or share the report as a PDF

---

**US-203 [P1] — Clinician Override of Prakriti**  
*As a doctor, I want to accept, modify, or reject the AI-generated Prakriti profile during consultation.*

**Acceptance Criteria:**
- [ ] Dashboard shows AI Prakriti result alongside confidence level
- [ ] Doctor can edit each Dosha score independently or mark profile as "Clinician-Revised"
- [ ] Revised profile is timestamped and logged under the doctor's credentials
- [ ] Original AI result preserved in audit log

---

### Epic 3: Appointment Allocation & Queue Management (SIH1383)

---

**US-301 [P0] — Smart Appointment Allocation**  
*As a patient, I want the system to assign me an appointment based on my symptoms, department preference, and live doctor availability.*

**Acceptance Criteria:**
- [ ] System reads live doctor availability status before slot allocation
- [ ] Allocation considers: selected department, symptom urgency category, current queue length, check-in status, and patient-preferred time window
- [ ] Patient receives: appointment date, estimated consultation window (displayed as a time range), digital token number
- [ ] Slot allocation completes in < 3 seconds

---

**US-302 [P0] — Live Queue Tracker**  
*As a patient, I want a live view of my position in the queue so I don't have to wait in the OPD hall.*

**Acceptance Criteria:**
- [ ] Queue page shows: current token, patients ahead, estimated consultation window, doctor delay status
- [ ] Page auto-refreshes every 30 seconds without manual reload
- [ ] Push notification (web push / SMS fallback) sent when patient is 2 tokens away
- [ ] "Approach OPD" notification sent when patient is next

---

**US-303 [P0] — Doctor Availability Management**  
*As a doctor or staff member, I want to update my availability status in real time.*

**Acceptance Criteria:**
- [ ] Statuses: Available · Consulting · Delayed · On Rounds · Emergency Duty · Unavailable
- [ ] Status updatable via staff web app, QR check-in, NFC tap, or workstation login
- [ ] Hospital admin/reception can manually override any doctor's status with reason logged
- [ ] Status change propagates to patient queue view within 10 seconds

---

**US-304 [P1] — Predictive Delay Notifications**  
*As a patient, I want to receive an updated consultation time if my doctor is running late.*

**Acceptance Criteria:**
- [ ] Delay engine recalculates estimated wait when a doctor's status changes or average consultation time deviates by > 10 minutes
- [ ] SMS / WhatsApp / web push notification sent automatically: *"Your consultation is expected between [HH:MM] and [HH:MM]. Please arrive 15 minutes before."*
- [ ] Estimated windows displayed as ranges, never a single exact time
- [ ] Patient can opt out of SMS notifications during registration

---

**US-305 [P1] — Priority Routing with Human Confirmation**  
*As a nurse, I want the system to flag urgent patients so I can manually assign priority before they are moved up the queue.*

**Acceptance Criteria:**
- [ ] System generates triage alert for any patient whose symptom intake flags a red-flag keyword
- [ ] Alert visible on nurse/reception dashboard with patient details and flagged symptom
- [ ] Priority change only applied after nurse/doctor manually confirms; system cannot auto-reassign queue position
- [ ] All priority changes logged with confirming staff member's ID and timestamp

---

### Epic 4: Formulation Decision Support (SIH1347)

---

**US-401 [P0] — Source-Cited Formulation Discovery**  
*As a doctor, I want to see relevant Ayurvedic classical formulations for a confirmed diagnosis, each with its source text citation.*

**Acceptance Criteria:**
- [ ] Module activates only after the doctor marks diagnosis as confirmed
- [ ] Searches curated classical text database (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, and approved formularies)
- [ ] Each formulation result displays: name, classical indication, source text + chapter/verse/page, ingredients, Rasa/Guna/Virya/Vipaka, Dosha relevance, dosage form, Anupana options, and contraindications
- [ ] Results returned in ≤ 5 seconds for any confirmed condition in the prototype database (5–10 conditions in v1)
- [ ] Doctor can bookmark, accept, or reject any suggestion

---

**US-402 [P0] — Patient-Specific Contraindication Filtering**  
*As a doctor, I want contraindicated formulations clearly flagged based on this patient's comorbidities and current medicines.*

**Acceptance Criteria:**
- [ ] System checks patient profile against: diabetes (jaggery/sugar-containing preparations), fermented/alcohol-containing preparations, known allergies, pregnancy/lactation, pediatric/geriatric cautions, kidney or liver disease, herbo-mineral cautions
- [ ] Flagged formulations show a clear warning badge and reason (e.g., "Contains jaggery — caution in diabetes")
- [ ] System never automatically removes an ingredient from a classical formulation
- [ ] System suggests complete alternative classical formulations that address the same condition without the contraindicated component
- [ ] Flags require doctor acknowledgement before proceeding (cannot be silently dismissed)

---

**US-403 [P1] — Anupana Recommendation**  
*As a doctor, I want the system to suggest appropriate Anupana (vehicle/adjuvant) options based on the confirmed diagnosis and patient context.*

**Acceptance Criteria:**
- [ ] Anupana suggestions (warm water, ghee, honey, milk, etc.) displayed alongside each formulation with classical source citation
- [ ] Any Anupana with a patient-specific caution is flagged (e.g., honey in high Pitta conditions)
- [ ] Doctor selects final Anupana; system cannot auto-select

---

**US-404 [P0] — Doctor Review and Prescription Finalisation**  
*As a doctor, I want to accept, modify, or independently write a prescription after reviewing formulation suggestions.*

**Acceptance Criteria:**
- [ ] Doctor can accept a suggestion, modify dosage/Anupana/duration, or write a completely independent prescription
- [ ] All modifications are logged with the doctor's ID and timestamp
- [ ] Prescription marked as "Doctor-Finalised" before it proceeds to pharmacy or patient
- [ ] AI suggestions not accepted by the doctor are retained in audit log but excluded from the active prescription

---

### Epic 5: Pharmacy & Pathya-Apathya (SIH1347 / SIH1383)

---

**US-501 [P0] — Pharmacy Inventory Pre-Check**  
*As a pharmacist and doctor, I want to know if a prescribed formulation is in stock before the prescription is finalised.*

**Acceptance Criteria:**
- [ ] Inventory check triggered automatically when doctor moves to prescription finalisation
- [ ] Displays: availability status, quantity in stock, batch number, expiry date
- [ ] Out-of-stock alert shown to both doctor and pharmacist dashboards
- [ ] Any alternative formulation substitution requires explicit doctor/pharmacist approval
- [ ] Inventory data updated in real time or at a maximum 15-minute sync interval

---

**US-502 [P0] — Doctor-Approved Pathya-Apathya Plan**  
*As a patient, I want a clear, downloadable lifestyle plan after consultation.*

**Acceptance Criteria:**
- [ ] Plan generated as a draft containing: recommended and avoidable foods, daily routine guidance, seasonal advice, approved yoga/wellness suggestions, medicine timing + Anupana, follow-up date, and warning signs requiring urgent care
- [ ] Plan released to patient only after doctor's explicit digital approval
- [ ] Downloadable as a PDF; text also readable in the patient app in the patient's preferred language
- [ ] Patient receives a reminder notification for the follow-up date

---

### Epic 6: Research & Admin (All)

---

**US-601 [P2] — De-Identified Research Dashboard**  
*As a researcher, I want access to de-identified, consent-driven data for Prakriti and treatment outcome studies.*

**Acceptance Criteria:**
- [ ] Only patients who have provided explicit research consent are included
- [ ] Data fully de-identified before exposure to researcher role
- [ ] Available datasets: Prakriti scores, symptom patterns, formulation acceptance rates, waiting time logs, treatment adherence feedback
- [ ] Export format: CSV / JSON with dataset versioning

---

## 4. Functional Requirements

### 4.1 Module F1 — Patient Portal (Web & Mobile-Responsive)

| ID | Requirement |
|---|---|
| F1.1 | Responsive single-page web application; WCAG 2.1 AA compliant |
| F1.2 | Language switcher available on every screen; default detected from browser locale |
| F1.3 | Voice input component integrated (Bhashini API or Web Speech API fallback) |
| F1.4 | Emergency red-flag engine runs before any other intake step; list configurable by admin |
| F1.5 | Prakriti questionnaire engine: adaptive branching, session persistence, back-navigation |
| F1.6 | Queue tracker: auto-refresh polling; web-push notification support |
| F1.7 | Pathya-Apathya report viewer: multilingual, print/PDF-ready |
| F1.8 | Session timeout after 15 minutes of inactivity with a 60-second warning |

### 4.2 Module F2 — Doctor Dashboard

| ID | Requirement |
|---|---|
| F2.1 | Structured patient summary card before consultation (symptoms, history, meds, allergies, Prakriti, queue info) |
| F2.2 | All chatbot-sourced fields labelled "Patient-Reported — Requires Verification" |
| F2.3 | Diagnosis confirmation button; formulation module locked until clicked |
| F2.4 | Formulation search results panel: filterable by Dosha, dosage form, source text |
| F2.5 | Contraindication flags shown inline; doctor must acknowledge each flag |
| F2.6 | Prescription editor: free-text override + structured fields (medicine, dose, Anupana, duration) |
| F2.7 | Prakriti override panel with score sliders and free-text note field |
| F2.8 | Pathya-Apathya draft editor with approve/reject control |

### 4.3 Module F3 — Staff / Reception Dashboard

| ID | Requirement |
|---|---|
| F3.1 | Real-time OPD queue view per department: token, patient name, status, wait estimate |
| F3.2 | Doctor availability board: all doctors, current status, last updated timestamp |
| F3.3 | Manual override: change doctor status with mandatory reason field |
| F3.4 | Triage alert inbox: shows red-flag patients with confirm-priority action |
| F3.5 | Bulk appointment reschedule tool for doctor emergencies |

### 4.4 Module F4 — Pharmacist Dashboard

| ID | Requirement |
|---|---|
| F4.1 | Incoming prescription view: formulation, dose, quantity, patient token |
| F4.2 | Inventory status badge per prescribed item (in stock / low stock / out of stock) |
| F4.3 | Substitution request workflow: pharmacist proposes → doctor approves |
| F4.4 | Inventory update interface (manual entry for v1; API-ready for ERP integration) |

### 4.5 Module F5 — AI/ML Services

| ID | Requirement |
|---|---|
| F5.1 | Prakriti scoring engine: weighted multi-axis scoring; outputs relative percentages + confidence level |
| F5.2 | NLP entity extraction: identifies symptoms, medicines, allergies from free-text/voice input |
| F5.3 | Formulation retrieval: semantic search over classical-text vector database |
| F5.4 | Contraindication rule engine: rule-based deterministic checks (not probabilistic) for patient safety |
| F5.5 | Queue delay estimator: regression model on historical consultation durations; retrains nightly |
| F5.6 | All AI outputs include confidence scores and are non-final without clinician action |

### 4.6 Module F6 — Admin Panel

| ID | Requirement |
|---|---|
| F6.1 | Role management: Patient · Reception · Nurse · Doctor · Pharmacist · Researcher · Admin |
| F6.2 | Classical text database management: add/update formulations with version control and expert-validation workflow |
| F6.3 | Red-flag symptom list editor |
| F6.4 | Language pack manager |
| F6.5 | Audit log viewer: filterable by role, action type, patient ID, and date range |
| F6.6 | System health dashboard: API response times, queue lengths, error rates |

---

## 5. Technical Architecture & Data Flow

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  Patient Web App  │  Doctor Dashboard  │  Staff Dashboard   │
│  (React / Next.js — Mobile-Responsive)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                     API GATEWAY                             │
│         (REST + WebSocket · Auth middleware · Rate limit)    │
└────┬──────────────┬──────────────┬──────────────┬───────────┘
     │              │              │              │
┌────▼───┐   ┌──────▼────┐  ┌─────▼─────┐  ┌───▼──────────┐
│ Auth   │   │ Patient   │  │ Queue /   │  │ Formulation  │
│Service │   │ Intake    │  │ Appt.     │  │ Decision     │
│(JWT)   │   │ Service   │  │ Service   │  │ Support Svc  │
└────────┘   └──────┬────┘  └─────┬─────┘  └───┬──────────┘
                    │             │             │
          ┌─────────▼─────────────▼─────────────▼──────────┐
          │              AI / ML SERVICE LAYER              │
          │  Prakriti Scorer │ NLP Extractor │ Delay Model  │
          │  Semantic Search (FAISS / pgvector)              │
          │  Contraindication Rule Engine                   │
          └─────────────────────────┬───────────────────────┘
                                    │
          ┌─────────────────────────▼───────────────────────┐
          │                  DATA LAYER                      │
          │  PostgreSQL (patient records, queue, prescriptions│
          │  audit logs)                                     │
          │  Vector DB (classical text embeddings)           │
          │  Redis (queue state, session cache)              │
          │  Object Storage (PDF reports, voice recordings)  │
          └─────────────────────────────────────────────────┘
```

### 5.2 Core Data Flow — Patient Journey

```
Patient Registers
       │
       ▼
Emergency Red-Flag Screen ──── RED FLAG ──► Triage Alert → Staff Dashboard
       │ CLEAR
       ▼
Symptom & Medical History Intake (voice/text → NLP entity extraction)
       │
       ▼
Optional Prakriti Questionnaire → Prakriti Scorer → Score + Confidence
       │
       ▼
Appointment Allocation (availability check → slot assignment → token issued)
       │
       ▼
[Patient waits] ← Live Queue Tracker (WebSocket) ← Queue Delay Estimator
       │
       ▼
Doctor Dashboard receives patient summary card
       │
       ▼
Doctor Consults → Confirms / Modifies Diagnosis
       │
       ▼
Formulation Module Unlocks
Semantic Search (classical text vector DB) → Results ranked by relevance
       │
       ▼
Contraindication Rule Engine filters/flags results against patient profile
       │
       ▼
Doctor Reviews → Accepts / Modifies / Overrides
       │
       ▼
Inventory Pre-Check (pharmacy DB) → Alert if out of stock
       │
       ▼
Doctor Finalises Prescription → Pathya-Apathya Draft → Doctor Approves
       │
       ├──► Pharmacist Dashboard (dispense)
       └──► Patient App (plan + follow-up reminder)
```

### 5.3 Technology Stack Recommendations

| Layer | Recommended Technology | Rationale |
|---|---|---|
| Frontend | React + Next.js (SSR) | SEO, mobile performance, accessible component ecosystem |
| Styling | Tailwind CSS | Rapid UI, consistent design tokens |
| State Management | Zustand | Lightweight, suited to real-time queue updates |
| Backend API | Node.js (Express) or Python (FastAPI) | Both have strong Ayurvedic NLP library options |
| Auth | JWT + refresh tokens; role-based middleware | Stateless; scalable |
| Database (primary) | PostgreSQL | Relational integrity for medical records and audit logs |
| Vector DB | pgvector (Postgres extension) or FAISS | Classical text semantic search |
| Cache / Queues | Redis | Session state, real-time queue pub/sub |
| Voice / Language | Bhashini API (primary), Web Speech API (fallback) | Indian language support mandate |
| AI/ML | Python (scikit-learn, sentence-transformers, spaCy) | Prakriti scorer, NLP, semantic search |
| Notifications | Firebase Cloud Messaging (web push) + SMS gateway | Dual-channel reliability |
| Object Storage | S3-compatible (MinIO for on-prem) | PDF reports, voice recordings |
| Deployment | Docker + Kubernetes (or Railway/Render for prototype) | Scalable; portable |
| CI/CD | GitHub Actions | Automated test + deploy pipeline |

### 5.4 Data Models (Core Entities)

**Patient**
```
id, abha_id (nullable), name, age, gender, contact,
preferred_language, consent_flags (JSON), registered_at
```

**PatientSession**
```
id, patient_id, symptom_entities (JSON), red_flag_triggered,
prakriti_score (JSON), prakriti_confidence, appointment_id, created_at
```

**Doctor**
```
id, name, department, qualifications, current_status,
status_updated_at, avg_consultation_duration_minutes
```

**Appointment**
```
id, patient_id, doctor_id, department, token_number,
urgency_category, estimated_window_start, estimated_window_end,
status (waiting | in_consultation | done | cancelled), created_at
```

**Prescription**
```
id, appointment_id, doctor_id, diagnoses (JSON),
formulations (JSON — includes source citations), anupana,
pathya_apathya (JSON), finalised_at, inventory_checked_at
```

**ClassicalFormulation**
```
id, name, source_text, chapter, verse_page, ingredients (JSON),
rasa, guna, virya, vipaka, dosha_relevance, dosage_form,
anupana_options (JSON), contraindications (JSON), version, validated_by
```

**AuditLog**
```
id, actor_id, actor_role, action_type, entity_type, entity_id,
before_state (JSON), after_state (JSON), timestamp
```

### 5.5 Security & Privacy Requirements

| Requirement | Implementation |
|---|---|
| Data encryption at rest | AES-256 for all PII fields |
| Data encryption in transit | TLS 1.3 mandatory |
| Role-based access control | JWT claims checked at API gateway per endpoint |
| Consent enforcement | Every patient data read checks consent_flags before returning data |
| Audit logging | Every create/update/delete on clinical data written to AuditLog |
| Voice data | Transcribed on-device or via compliant API; raw audio deleted after confirmation |
| Research data | De-identification pipeline strips name, contact, ABHA ID before researcher export |
| Session management | 15-minute idle timeout; secure HttpOnly cookies |

---

## 6. Success Metrics & KPIs

### 6.1 Operational Metrics (SIH1383)

| KPI | Baseline (Target) | Measurement Method |
|---|---|---|
| Average OPD wait time | ≥ 30% reduction from hospital baseline | Queue timestamps (appointment created → consultation start) |
| Queue position accuracy | Estimated window within ± 15 minutes, 80% of the time | Compare estimated vs actual consultation start |
| Doctor status update latency | < 10 seconds end-to-end | Server log timestamps |
| Appointment slot allocation time | < 3 seconds | API response time monitoring |
| Triage alert response time | < 5 minutes (nurse acknowledgement) | Alert timestamp vs acknowledgement timestamp |

### 6.2 Clinical Quality Metrics (SIH1346)

| KPI | Target | Measurement Method |
|---|---|---|
| Prakriti assessment completion rate | ≥ 80% of patients who start | Session completion logs |
| Prakriti assessment time | ≤ 10 minutes median | Session start–end timestamps |
| Clinician override rate | Tracked (no target; informational) | Count of doctor modifications vs acceptances |
| Prakriti confidence level distribution | > 60% of assessments at Moderate/High | Prakriti scorer output logs |

### 6.3 Formulation Decision Support Metrics (SIH1347)

| KPI | Target | Measurement Method |
|---|---|---|
| Formulation retrieval coverage | ≥ 95% of confirmed diagnoses return ≥ 1 result | Query hit-rate logs |
| Contraindication flag accuracy | 0 false negatives on known rule set (jaggery/diabetes, alcohol/pregnancy, etc.) | Rule engine unit test coverage; random audit sample |
| Doctor acceptance rate of suggestions | Tracked (informational) | Prescription audit: suggestion accepted vs overridden |
| Formulation retrieval latency | ≤ 5 seconds | API response time |
| Source citation completeness | 100% of returned formulations include source text + chapter/verse | DB integrity check |

### 6.4 System Health Metrics

| KPI | Target |
|---|---|
| API uptime | ≥ 99.5% |
| Page load time (patient portal) | ≤ 3 seconds on 4G |
| Accessibility compliance | WCAG 2.1 AA |
| Critical bug SLA | P0 bugs resolved within 4 hours |
| Audit log completeness | 100% of clinical state changes logged |

### 6.5 Prototype Demo Targets (SIH Judging)

| Scenario | Pass Criteria |
|---|---|
| End-to-end patient flow | Registration → Prakriti → Appointment → Doctor Dashboard → Prescription in < 15 minutes live demo |
| Red-flag detection | Chest-pain input triggers triage alert in < 5 seconds |
| Contraindication filter | Jaggery-containing formulation flagged for a diabetic patient before prescription |
| Multilingual input | Hindi voice input correctly captured and displayed in English on doctor dashboard |
| Queue live update | Doctor marks "Delayed"; patient queue view updates within 10 seconds |

---

## 7. Implementation Plan / High-Level Timeline

### Phase 0 — Foundation (Weeks 1–2)

**Goal:** Dev environment, data architecture, and base project scaffold ready.

| Task | Owner | Output |
|---|---|---|
| Repository setup, CI/CD pipeline, Docker config | Backend Lead | Repo with automated lint + test |
| PostgreSQL schema creation (all core entities) | Backend Lead | Versioned migrations |
| pgvector / FAISS setup and classical text seed data (5–10 conditions) | AI/ML Lead | Searchable vector index |
| Next.js project scaffold with Tailwind, routing, auth flow | Frontend Lead | Login + role-redirect working |
| Bhashini API key setup and integration spike | Frontend Lead | Voice → text proof of concept |
| Role-based auth (JWT) and user management API | Backend Lead | Auth endpoints passing tests |

---

### Phase 1 — Patient Intake & Prakriti (Weeks 3–5)

**Goal:** Patient can complete registration, red-flag screen, symptom intake, and Prakriti assessment.

| Task | Priority |
|---|---|
| Emergency red-flag screen UI + rule engine API | P0 |
| Multilingual symptom chatbot UI (voice + text) | P0 |
| NLP entity extraction service (symptoms, meds, allergies) | P0 |
| Prakriti questionnaire — adaptive branching engine | P0 |
| Prakriti scorer (weighted algorithm) → result display | P0 |
| Session persistence (resume interrupted assessments) | P0 |
| Patient profile & consent management | P0 |

**Milestone:** Patient completes full intake + Prakriti in a live demo session.

---

### Phase 2 — Scheduling & Queue (Weeks 4–6)

*(Runs in parallel with Phase 1)*

**Goal:** Appointment allocation and live queue visible to patient and staff.

| Task | Priority |
|---|---|
| Doctor availability management API + staff UI | P0 |
| Smart appointment allocation algorithm | P0 |
| Queue state management (Redis pub/sub) | P0 |
| Live queue tracker (patient-facing, WebSocket) | P0 |
| Triage alert inbox (staff dashboard) | P0 |
| Delay estimator model (regression, historical data stub) | P1 |
| Push notification integration (web push + SMS) | P1 |

**Milestone:** Doctor goes "Delayed"; patient's queue view updates in < 10 seconds.

---

### Phase 3 — Formulation Decision Support (Weeks 6–8)

**Goal:** Doctor dashboard with patient summary and source-cited formulation module.

| Task | Priority |
|---|---|
| Doctor dashboard — patient summary card | P0 |
| Diagnosis confirmation gate | P0 |
| Formulation semantic search API (vector DB) | P0 |
| Contraindication rule engine (full rule set for v1) | P0 |
| Formulation results panel UI with flag badges | P0 |
| Anupana suggestion display | P1 |
| Doctor Prakriti override panel | P1 |
| Prescription editor (structured + free-text) | P0 |

**Milestone:** Doctor confirms a diagnosis for a diabetic patient; jaggery-containing formulation is flagged; alternative displayed; prescription finalised.

---

### Phase 4 — Pharmacy, Pathya-Apathya & Integration (Weeks 8–10)

**Goal:** End-to-end flow complete including pharmacy check and patient plan delivery.

| Task | Priority |
|---|---|
| Pharmacist dashboard + inventory check API | P0 |
| Pathya-Apathya draft generator + doctor approval flow | P0 |
| Patient-facing prescription + plan viewer | P0 |
| PDF generation for Pathya-Apathya report | P0 |
| Follow-up reminder notifications | P1 |
| Mock ABHA Scan-and-Share registration flow | P0 |
| Audit log viewer (admin panel) | P1 |

**Milestone:** Complete end-to-end patient journey runnable without manual intervention.

---

### Phase 5 — QA, Polish & Demo Prep (Weeks 10–12)

**Goal:** Production-quality prototype ready for SIH judging.

| Task |
|---|
| Full end-to-end QA across all roles and all screen sizes |
| Accessibility audit (WCAG 2.1 AA) |
| Performance testing (queue under load, formulation search latency) |
| Security review (RBAC, injection, session management) |
| Contraindication rule engine unit test coverage (target: 100% of defined rules) |
| Demo script preparation and walkthrough rehearsal |
| Seed database with 5–10 conditions, representative patient profiles, and inventory data |
| Deployment to staging environment with shareable demo URL |

---

### Summary Gantt (12 Weeks)

```
Week     1  2  3  4  5  6  7  8  9  10 11 12
Phase 0  ██ ██
Phase 1        ██ ██ ██
Phase 2        ██ ██ ██
Phase 3              ██ ██ ██
Phase 4                    ██ ██ ██
Phase 5                             ██ ██ ██
```

---

## Appendix A — Classical Text Database (Seed Scope for v1)

Conditions to include in the initial 5–10 seed:

1. Arsha (Haemorrhoids)
2. Grahani (Irritable Bowel / Malabsorption)
3. Prameha (Diabetes / Urinary disorders)
4. Amlapitta (Hyperacidity / GERD)
5. Vatarakta (Gout)
6. Kasa (Cough)
7. Jwara (Fever)
8. Shirorog (Headache / Migraine)
9. Sandhivata (Osteoarthritis)
10. Raktapitta (Bleeding disorders)

Source texts to digitise: Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, and AYUSH Government Formulary.

---

## Appendix B — Contraindication Rule Set (v1)

| Patient Condition | Flagged Ingredient / Preparation Type |
|---|---|
| Diabetes | Jaggery (Guda), cane sugar, honey in large quantities |
| Pregnancy | Alcohol-containing (Arishta, Asava) preparations; Vishagarbha tail; emmenagogues |
| Lactation | Preparations with Kampillaka, Langali |
| Allergy (patient-reported) | Any ingredient in patient's stated allergy list |
| Pediatric (< 12 years) | Shodhita Visha (purified mercury/arsenic formulations) without specialist sign-off |
| Kidney disease | High-oxalate herbs; excessive Lavaṇa content |
| Liver disease | Alcohol-containing preparations; heavy Shodhita metals without specialist sign-off |
| Geriatric (> 70 years) | Flag high-potency Ruksha (drying) formulations for review |

---

## Appendix C — API Endpoints (High-Level)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/patients                         # create patient
GET    /api/patients/:id/summary             # doctor view
POST   /api/sessions                         # start intake session
PUT    /api/sessions/:id/symptoms            # save symptom data
PUT    /api/sessions/:id/prakriti            # save Prakriti answers
GET    /api/sessions/:id/prakriti-result     # fetch scored result

POST   /api/appointments                     # allocate appointment
GET    /api/appointments/:id/queue-status    # live queue position
PUT    /api/doctors/:id/status               # update doctor availability
GET    /api/doctors/availability             # list all doctors + status

POST   /api/formulations/search              # semantic search (post-diagnosis)
GET    /api/formulations/:id                 # formulation detail
POST   /api/contraindications/check         # rule engine check

POST   /api/prescriptions                    # create prescription draft
PUT    /api/prescriptions/:id/finalise       # doctor finalises
GET    /api/pharmacy/inventory/:formulationId# inventory check
POST   /api/pathya-apathya                   # generate plan draft
PUT    /api/pathya-apathya/:id/approve       # doctor approves plan

GET    /api/admin/audit-logs                 # filtered audit log
GET    /api/admin/system-health              # API + queue health
```

---

*This PRD is a living document. All clinical logic, classical text content, and contraindication rules must be reviewed and validated by licensed Ayurvedic practitioners before any production deployment.*
