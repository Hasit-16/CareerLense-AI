# CareerLens AI — Product Requirements Document (PRD)

## 1. Product Overview

CareerLens AI is a SaaS-based career decision platform for Indian students after Class 10 and Class 12.

The platform analyzes a student’s marksheet, asks adaptive MCQ-based questions, and generates a transparent, structured career recommendation report with reasoning, risks, and Gujarat-specific college suggestions.

The product is designed to provide **clear, explainable, and actionable career decisions**, not generic suggestions.

---

## 2. Problem Statement

Students in India face major confusion after:

* Class 10 (stream selection vs diploma)
* Class 12 (degree and career selection)

Current problems:

* decisions based on peer pressure or trends
* lack of structured guidance
* generic online tools with no personalization
* parents do not trust vague recommendations
* no clear explanation of "why this career"

Students need:

* clarity
* reasoning
* trust
* real next steps

---

## 3. Solution Overview

CareerLens AI solves this problem through a structured decision pipeline:

1. User uploads marksheet
2. AI extracts academic data (OCR)
3. System validates supported document type
4. System generates academic features
5. Adaptive MCQ questions are asked
6. AI generates a final recommendation
7. A transparent report is shown
8. Gujarat colleges are recommended
9. User can save and download report

The system focuses on:

* accuracy
* transparency
* decision clarity
* real-world usability

---

## 4. Target Users

### Primary Users

* Students after Class 10
* Students after Class 12 (Science, Commerce, Arts)

### Secondary Users

* Parents who want understandable career guidance

---

## 5. Supported Scope (Hackathon Version)

### Supported Marksheet Types

* 10th: GSEB, CBSE, ICSE
* 12th Science: GSEB, CBSE, ICSE
* 12th Commerce: GSEB, CBSE, ICSE
* 12th Arts: GSEB, CBSE, ICSE

### Geographic Scope

* Gujarat only (for college recommendations)

### Dataset Restriction

* 10th users → after-10th career dataset only
* 12th Science → science dataset only
* 12th Commerce → commerce dataset only
* 12th Arts → arts dataset only

---

## 6. Core Features

### 6.1 Marksheet Upload & Validation

* upload marksheet image/PDF
* OCR extraction
* detect board, class, stream
* invalid document handling

### 6.2 Academic Feature Engine

* subject analysis
* strength detection
* weakness detection
* readiness scoring

### 6.3 Adaptive MCQ Engine

* one question at a time
* questions depend on:

  * marksheet data
  * previous answers
* simple language for 10th students
* structured decision-focused questions

### 6.4 Career Decision Engine

* 1 primary path
* 2 backup paths
* 1 avoid path
* fit score
* confidence level
* reasoning

### 6.5 Transparent Report Dashboard

Includes:

* Main Result
* Score Breakdown
* Evidence Trail
* Top 3 Career Paths
* Mismatch Detector
* Why Not Other Options
* Parent-Readable Verdict
* Next-Step Risk Preventer
* Career Tradeoff / Reality
* 30-Day Roadmap
* Final Action Panel

---

### 6.6 Gujarat College Recommender

* filter by:

  * course
  * marks
* categorized into:

  * Dream
  * Realistic
  * Safe

---

### 6.7 SaaS Features

* user authentication
* saved reports
* report history
* downloadable PDF
* reusable system

---

## 7. User Flow Summary

Landing Page
→ Start Diagnosis
→ Upload Marksheet
→ Validation (valid / invalid)
→ Adaptive Questions
→ Recommendation Generation
→ Final Report Dashboard
→ College Suggestions
→ Save / Download Report

---

## 8. Key Differentiators

* marksheet-first decision system
* adaptive questioning logic
* dataset-restricted recommendations
* transparent reasoning system
* mismatch detection
* parent-readable output
* real actionable roadmap
* Gujarat-focused practicality

---

## 9. Design Principles

* trust-first UI
* clarity over complexity
* decision-focused output
* explainable AI
* premium SaaS feel
* robot-guided interaction (non-cartoon, non-game)

---

## 10. Constraints

* limited to Gujarat for hackathon
* limited marksheet types
* no over-expansion
* focus on working MVP
* no unnecessary features

---

## 11. Success Criteria

The product is successful if:

* user gets a clear career decision
* reasoning is understandable
* report feels trustworthy
* UI feels like real SaaS product
* demo flow is smooth
* AI output varies meaningfully per user

---

## 12. Non-Goals

* nationwide college database
* chatbot-based interaction
* overly complex analytics
* social features
* gamification

---

## 13. Product Vision

CareerLens AI aims to become a trusted AI career decision system that helps students and families make informed, realistic, and confident career choices based on data, behavior, and structured reasoning.