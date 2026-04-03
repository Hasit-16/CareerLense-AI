# CareerLens AI — AI Pipeline Document

## 1. Overview

This document defines the complete AI pipeline of CareerLens AI.

The AI system is responsible for:

* extracting marksheet data
* generating academic features
* asking adaptive MCQ questions
* generating final career recommendations
* providing transparent reasoning

The pipeline is structured, deterministic, and explainable.

---

## 2. AI System Architecture

The AI pipeline is divided into 4 stages:

1. OCR Extraction Layer
2. Feature Engineering Layer
3. Adaptive Question Engine
4. Recommendation Engine

Each stage has a specific responsibility and must not overlap.

---

## 3. Stage 1: OCR Extraction Layer

### Objective

Convert marksheet image into structured JSON data.

### Input

* image or PDF of marksheet

### Output (JSON format)

```json
{
  "board": "",
  "class_level": "",
  "stream": "",
  "subjects": [
    { "name": "", "marks": 0 }
  ],
  "percentage": 0
}
```

### Responsibilities

* detect board (GSEB, CBSE, ICSE)
* detect class level (10th or 12th)
* detect stream (Science, Commerce, Arts if applicable)
* extract subjects and marks
* estimate percentage if not directly available

### Validation

* check if extracted data matches supported categories
* if not, trigger invalid document flow

---

## 4. Stage 2: Feature Engineering Layer

### Objective

Convert raw marks into structured academic signals.

### Input

* OCR JSON output

### Output (Features Object)

```json
{
  "math_strength": 0,
  "science_strength": 0,
  "commerce_strength": 0,
  "language_strength": 0,
  "humanities_strength": 0,
  "weak_subjects": [],
  "overall_score": 0,
  "readiness_scores": {}
}
```

### Responsibilities

* normalize subject names
* calculate subject category strengths
* identify weak subjects
* generate readiness scores for:

  * streams (10th)
  * career paths (12th)

### Rules

* must be deterministic (not random)
* must be consistent across users
* must reflect actual marks

---

## 5. Stage 3: Adaptive Question Engine

### Objective

Refine understanding using behavioral input.

### Input

* feature object
* previous answers (if any)

### Output

* next MCQ question with options

---

### Question Generation Logic

#### Question 1:

* based only on feature object

#### Question 2:

* based on feature object + answer 1

#### Question 3:

* based on feature object + answer 1 + answer 2

Continue until:

* decision confidence threshold is reached

---

### Question Format

Each question must include:

* question text
* 4 to 5 options
* simple language
* decision-oriented framing

---

### Dataset Restriction Rules

#### 10th Students:

* only after-10th dataset
* focus:

  * stream selection
  * diploma vs 11th–12th

#### 12th Science:

* only science dataset

#### 12th Commerce:

* only commerce dataset

#### 12th Arts:

* only arts dataset

System must NEVER mix datasets.

---

### Special Rule for 10th Students

Questions must:

* be simple and clear
* avoid jargon
* address real confusion
* guide decision, not test knowledge

---

## 6. Stage 4: Recommendation Engine

### Objective

Generate final career decision with reasoning.

### Input

* feature object
* all question answers
* dataset constraints

### Output (Recommendation Object)

```json
{
  "primary_path": "",
  "backup_paths": [],
  "avoid_path": "",
  "fit_score": 0,
  "confidence_level": "",
  "risk_level": "",
  "reasoning": {},
  "mismatch_factors": [],
  "roadmap": {}
}
```

---

### Responsibilities

#### 1. Path Selection

* select best-fit path
* select 2 backup paths
* select 1 avoid path

#### 2. Score Calculation

* combine:

  * academic fit
  * interest fit
  * work-style fit
  * feasibility fit

#### 3. Reasoning Generation

Explain:

* why selected
* what factors influenced result

#### 4. Mismatch Detection

Identify:

* weak subject alignment
* interest mismatch
* work-style conflict

#### 5. Risk Evaluation

Provide:

* difficulty level
* pressure level
* success likelihood

#### 6. Roadmap Generation

Generate:

* 4-week actionable plan

---

## 7. Transparency Layer (Critical)

Every output must be explainable.

The system must provide:

* Evidence Trail
* Score Breakdown
* Why Not Other Options

This ensures:

* trust
* clarity
* credibility

---

## 8. Model Strategy

### Development Phase

* use Gemini API for:

  * OCR testing
  * prompt tuning

### Production / Final Execution

* use GPT-4o mini for:

  * OCR
  * question generation
  * recommendation

---

## 9. Prompt Design Principles

* structured prompts
* strict JSON output
* no hallucinated fields
* no vague language
* enforce format consistency

---

## 10. Failure Handling

### OCR Failure

* retry extraction

### Low Confidence Recommendation

* fallback to safe path

### Missing Data

* request additional input if needed

---

## 11. Key AI Principles

* deterministic behavior where possible
* controlled randomness
* dataset isolation
* explainability first
* decision clarity over creativity

---

## 12. Final AI Philosophy

CareerLens AI is not a chatbot.

It is a structured decision system where:

* data → features → behavior → reasoning → decision

Every output must feel:

* logical
* justified
* trustworthy