# CareerLens AI — System Architecture Document

## 1. Overview

This document defines the high-level system architecture of CareerLens AI.

CareerLens AI is a SaaS-based career decision platform for Indian students that:

* accepts a marksheet upload
* validates supported academic documents
* extracts academic data
* generates adaptive MCQ questions
* produces a transparent career recommendation report
* suggests Gujarat-specific colleges
* saves user reports for future access

The architecture is designed for:

* clean modularity
* scalability
* explainability
* hackathon-speed implementation
* real-world SaaS usability

---

## 2. Architecture Goals

The system architecture must support:

* clear separation of concerns
* independent functional layers
* scalable request handling
* modular AI integration
* reusable SaaS backend
* transparent recommendation generation

---

## 3. High-Level Architecture

The system is divided into 5 major layers:

1. Frontend Layer
2. API Orchestration Layer
3. Backend Service Layer
4. AI Intelligence Layer
5. Data Persistence Layer

---

## 4. Frontend Layer

### Technology

* Next.js
* TypeScript
* Tailwind CSS

### Responsibilities

* UI rendering
* user interaction
* page navigation
* protected SaaS routes
* dashboard display
* upload interface
* question interface
* report interface

### Core Screens

* Landing Page
* Login / Signup
* Upload Page
* Invalid Document State
* Adaptive Question Screen
* Final Report Dashboard
* Gujarat College Section
* Report Preview / Download

### Notes

The frontend should remain presentation-focused and should not contain core business logic.

---

## 5. API Orchestration Layer

### Technology

* Next.js Route Handlers

### Responsibilities

* receive frontend requests
* coordinate service calls
* call AI providers
* write to database
* read from storage
* return structured responses

### Key Routes

* `/api/upload-marksheet`
* `/api/extract-marksheet`
* `/api/generate-features`
* `/api/generate-questions`
* `/api/submit-answers`
* `/api/generate-recommendation`
* `/api/colleges`
* `/api/generate-report`

### Notes

This layer is the control center of the application.
It should remain thin and orchestration-focused.

---

## 6. Backend Service Layer

### Technology

* Supabase
* utility services in application code

### Responsibilities

* authentication
* database operations
* file storage
* user report persistence
* session management

### Backend Functions

* create user accounts
* store uploaded marksheets
* persist extracted subjects
* persist features
* persist question sessions and answers
* persist recommendations
* store downloadable reports

---

## 7. AI Intelligence Layer

### Providers

* Gemini API for development / prompt testing
* GPT-4o mini for final execution

### Responsibilities

* OCR extraction
* academic data structuring
* adaptive MCQ generation
* recommendation generation
* reasoning generation

### Internal AI Stages

1. OCR Extraction
2. Feature Derivation
3. Adaptive Question Generation
4. Final Recommendation

### Notes

The AI layer must be controlled through structured prompts and strict output formatting.
The frontend must never call AI providers directly.

---

## 8. Data Persistence Layer

### Technology

* Supabase PostgreSQL
* Supabase Storage

### Responsibilities

* store users
* store marksheet metadata
* store extracted subjects
* store academic features
* store question sessions
* store questions and answers
* store final recommendations
* store colleges dataset
* store saved PDF/report references

### Storage Buckets

* `marksheets`
* `reports` (optional for MVP)

---

## 9. End-to-End Flow

### Flow Summary

Landing
→ Upload Marksheet
→ Validate Document
→ Extract Academic Data
→ Generate Features
→ Start Adaptive MCQ Session
→ Store Answers
→ Generate Recommendation
→ Render Final Report
→ Filter Gujarat Colleges
→ Save / Download Report

---

## 10. Detailed System Flow

### Step 1: Upload

Frontend sends marksheet file to `/api/upload-marksheet`

### Step 2: Storage

API uploads file to Supabase Storage and creates marksheet row in database

### Step 3: Validation + OCR

API calls AI provider through `/api/extract-marksheet`

### Step 4: Feature Generation

Extracted marksheet data is transformed into academic signals by `/api/generate-features`

### Step 5: Question Session Start

System creates question session and sends first adaptive MCQ through `/api/generate-questions`

### Step 6: Sequential Questioning

Every answer is stored through `/api/submit-answers`
Next question depends on:

* marksheet features
* previous answers

### Step 7: Recommendation Generation

Final output is generated through `/api/generate-recommendation`

### Step 8: Dashboard Render

Frontend renders transparent report dashboard using saved recommendation object

### Step 9: College Matching

Recommended path is used to filter Gujarat colleges through `/api/colleges`

### Step 10: Report Save / Download

Recommendation is linked to saved history and optional PDF generation

---

## 11. Scalability Strategy

The architecture supports scalability because:

* frontend is stateless
* API routes are stateless orchestrators
* AI calls are isolated
* data is stored in managed backend services
* user reports are persisted independently
* each stage of the pipeline can be optimized separately

### Judge-Friendly Scaling Statement

Each stage is stateless and can be scaled independently.
Database and storage are managed by Supabase, AI calls are isolated behind route handlers, and the frontend is deployable on Vercel as a serverless SaaS application.

---

## 12. Clean Architecture Principles

### Principle 1: Separation of Concerns

* frontend handles interaction
* API layer handles orchestration
* AI handles intelligence
* database handles persistence

### Principle 2: Traceability

Each recommendation should be traceable back to:

* uploaded marksheet
* extracted subjects
* generated features
* question session
* answers

### Principle 3: Dataset Isolation

Recommendation logic must stay constrained to the correct dataset category.

### Principle 4: Report Transparency

The final dashboard must expose reasoning, not just results.

---

## 13. Deployment Architecture

### Hosting

* Vercel for frontend and route handlers

### Backend

* Supabase for auth, database, storage

### AI Providers

* Gemini during development
* GPT-4o mini during final execution

### Source Control

* GitHub for code tracking and progress visibility

---

## 14. Failure Handling Strategy

### Invalid Document

* intercepted before feature generation

### OCR Failure

* retry or fallback error state

### Missing Fields

* controlled parsing and defaults

### Low Confidence Recommendation

* fallback to safe path

### College Match Gaps

* show limited or nearest match results

---

## 15. Why This Architecture Fits the Hackathon

This architecture directly supports hackathon evaluation criteria because it shows:

* technical feasibility
* modular system design
* real AI integration
* clean SaaS architecture
* scalable structure
* usable product flow

It is strong enough for demo execution while remaining realistic for a hackathon MVP.

---

## 16. Final Architecture Philosophy

CareerLens AI should be built as a real SaaS system, not a one-page AI demo.

The architecture must communicate:

* structured intelligence
* strong system design
* user trust
* practical execution

Every major layer must have one clear job and must connect cleanly to the next.