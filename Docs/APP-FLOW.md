# CareerLens AI — Application Flow Document

## 1. Overview

This document defines the complete user journey and system flow of CareerLens AI.

The flow ensures:

* structured decision-making
* correct dataset usage
* controlled AI behavior
* clear transition between stages

The system must strictly follow this flow without deviation.

---

## 2. High-Level Flow

Landing Page
→ Start Diagnosis
→ Upload Marksheet
→ Marksheet Validation
→ Feature Extraction
→ Adaptive Question Flow
→ Recommendation Generation
→ Final Report Dashboard
→ College Recommendation
→ Save / Download Report

---

## 3. Detailed Step-by-Step Flow

---

## Step 1: Landing Page

User lands on the platform.

Actions:

* sees robot-centered hero section
* understands product
* clicks "Start Diagnosis"

Next → Upload Page

---

## Step 2: Upload Marksheet

User uploads marksheet (image or PDF)

System Actions:

* file uploaded to storage
* file linked to user

Next → Validation

---

## Step 3: Marksheet Validation

System checks if uploaded document is supported.

### Supported:

* 10th: GSEB, CBSE, ICSE
* 12th Science: GSEB, CBSE, ICSE
* 12th Commerce: GSEB, CBSE, ICSE
* 12th Arts: GSEB, CBSE, ICSE

### If INVALID:

* show invalid document state
* explain supported formats
* allow re-upload

### If VALID:

* proceed to OCR extraction

Next → Feature Extraction

---

## Step 4: OCR + Feature Extraction

System performs:

### OCR Extraction:

* extract subjects
* extract marks
* identify board
* identify class level
* identify stream (if 12th)

### Feature Generation:

* subject strengths
* subject weaknesses
* overall academic score
* readiness scores (stream-wise)

Features are saved in database.

Next → Question Flow

---

## Step 5: Adaptive Question Flow

System starts MCQ-based questioning.

### Rules:

* one question at a time
* each question depends on:

  * marksheet features
  * all previous answers

### Question Logic:

Question 1:

* based only on marksheet features

Question 2:

* based on marksheet + answer 1

Question 3:

* based on marksheet + answer 1 + answer 2

Continue until:

* sufficient decision confidence is reached

---

### Dataset Control Rule

Based on detected category:

#### If 10th student:

* only after-10th dataset allowed
* focus:

  * Science vs Commerce vs Arts
  * Diploma vs 11th–12th

#### If 12th Science:

* only science dataset
* focus:

  * engineering, BSc, BCA, alternatives

#### If 12th Commerce:

* only commerce dataset
* focus:

  * BCom, CA, CS, management

#### If 12th Arts:

* only arts dataset
* focus:

  * BA, humanities careers, alternatives

System must NEVER mix datasets.

---

### Special Rule for 10th Students

Questions must be:

* simple
* easy to understand
* practical
* focused on confusion:

  * stream vs diploma
  * interest vs marks
  * pressure tolerance

---

Next → Recommendation Engine

---

## Step 6: Recommendation Generation

System combines:

* marksheet features
* all question answers
* dataset constraints

System generates:

* Primary Path (best fit)
* Backup Path 1
* Backup Path 2
* Avoid Path

Each includes:

* fit score
* confidence level
* reasoning
* risk level

Next → Report Dashboard

---

## Step 7: Final Report Dashboard

User sees structured report.

Sections:

1. Main Result
2. Score Breakdown
3. Evidence Trail
4. Top 3 Career Paths
5. Mismatch Detector
6. Why Not Other Options
7. Parent-Readable Verdict
8. Next-Step Risk Preventer
9. Career Tradeoff / Reality
10. FINAL ACTION PANEL

This is the most important page.

---

## Step 8: Gujarat College Recommendation

Based on selected path:

System filters Gujarat colleges by:

* course
* marks

Categorization:

* Dream
* Realistic
* Safe

Next → Save / Download

---

## Step 9: Save / Download Report

User can:

* save report to account
* view history
* download PDF

---

## 4. Error Handling Flow

### Invalid Document

* show error state
* retry upload

### OCR Failure

* show retry option

### No Recommendation Confidence

* fallback to safe path

---

## 5. State Transitions Summary

Upload → Valid / Invalid
Valid → Feature Extraction
Feature Extraction → Question Flow
Question Flow → Recommendation
Recommendation → Dashboard
Dashboard → Colleges → Save

---

## 6. Key Flow Principles

* no skipping steps
* no dataset mixing
* always explain decisions
* always maintain user trust
* keep flow simple and linear
* avoid confusion

---

## 7. Final Flow Philosophy

CareerLens AI is not a suggestion tool.

It is a structured decision system where:

* data → questions → reasoning → decision → action

Every step must feel connected and logical.