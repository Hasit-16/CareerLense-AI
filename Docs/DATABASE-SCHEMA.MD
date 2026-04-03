# CareerLens AI — Database Schema Document

## 1. Overview

This document defines the database structure for CareerLens AI.

The database is designed to support:

* user authentication
* marksheet uploads
* extracted academic data
* adaptive question sessions
* recommendation reports
* Gujarat college recommendations
* saved report history

The schema should remain clean, scalable, and easy to reason about.

---

## 2. Database Goals

The database must support:

* SaaS user accounts
* one-to-many user report history
* structured marksheet extraction
* adaptive MCQ question flow
* final recommendation storage
* Gujarat college filtering
* downloadable report references

---

## 3. Tables

---

## 3.1 users

### Purpose

Stores authenticated user identity.

### Fields

* `id` (uuid, primary key)
* `email` (text, unique, not null)
* `created_at` (timestamp, default now)

### Notes

This table maps to authenticated product users.

---

## 3.2 marksheets

### Purpose

Stores uploaded marksheet metadata.

### Fields

* `id` (uuid, primary key)
* `user_id` (uuid, foreign key → users.id)
* `file_path` (text, not null)
* `board` (text)
* `class_level` (text)
* `stream` (text, nullable)
* `percentage` (numeric, nullable)
* `is_valid` (boolean, default false)
* `created_at` (timestamp, default now)

### Notes

Each uploaded marksheet belongs to one user.

---

## 3.3 subjects

### Purpose

Stores extracted subject-wise marks from each marksheet.

### Fields

* `id` (uuid, primary key)
* `marksheet_id` (uuid, foreign key → marksheets.id)
* `subject_name` (text, not null)
* `marks` (numeric, not null)

### Notes

One marksheet can have many subject rows.

---

## 3.4 features

### Purpose

Stores generated academic feature signals from marksheet analysis.

### Fields

* `id` (uuid, primary key)
* `marksheet_id` (uuid, foreign key → marksheets.id)
* `math_strength` (numeric, default 0)
* `science_strength` (numeric, default 0)
* `commerce_strength` (numeric, default 0)
* `language_strength` (numeric, default 0)
* `humanities_strength` (numeric, default 0)
* `overall_score` (numeric, default 0)
* `weak_subjects` (jsonb)
* `readiness_scores_json` (jsonb)
* `created_at` (timestamp, default now)

### Notes

This is the structured academic signal layer used by the question engine and recommendation engine.

---

## 3.5 question_sessions

### Purpose

Tracks one adaptive question flow session per marksheet analysis.

### Fields

* `id` (uuid, primary key)
* `user_id` (uuid, foreign key → users.id)
* `marksheet_id` (uuid, foreign key → marksheets.id)
* `dataset_type` (text, not null)
* `status` (text, default 'active')
* `created_at` (timestamp, default now)

### Notes

`dataset_type` must be one of:

* after_10th
* after_12th_science
* after_12th_commerce
* after_12th_arts

This enforces dataset isolation.

---

## 3.6 questions

### Purpose

Stores generated MCQ questions for a question session.

### Fields

* `id` (uuid, primary key)
* `session_id` (uuid, foreign key → question_sessions.id)
* `question_text` (text, not null)
* `options_json` (jsonb, not null)
* `order_index` (integer, not null)
* `created_at` (timestamp, default now)

### Notes

Each session contains multiple ordered questions.

---

## 3.7 answers

### Purpose

Stores user responses to adaptive MCQ questions.

### Fields

* `id` (uuid, primary key)
* `question_id` (uuid, foreign key → questions.id)
* `selected_option` (text, not null)
* `confidence` (text, nullable)
* `created_at` (timestamp, default now)

### Notes

Each question has one selected answer.

---

## 3.8 recommendations

### Purpose

Stores final recommendation output for a completed analysis.

### Fields

* `id` (uuid, primary key)
* `user_id` (uuid, foreign key → users.id)
* `marksheet_id` (uuid, foreign key → marksheets.id)
* `session_id` (uuid, foreign key → question_sessions.id)
* `primary_path` (text, not null)
* `backup_paths_json` (jsonb, not null)
* `avoid_path` (text, nullable)
* `fit_score` (numeric, default 0)
* `confidence_level` (text)
* `risk_level` (text)
* `score_breakdown_json` (jsonb)
* `reasoning_json` (jsonb)
* `mismatch_factors_json` (jsonb)
* `roadmap_json` (jsonb)
* `created_at` (timestamp, default now)

### Notes

This is the core report object used by the final dashboard.

---

## 3.9 colleges

### Purpose

Stores Gujarat college recommendation dataset.

### Fields

* `id` (uuid, primary key)
* `name` (text, not null)
* `state` (text, not null)
* `city` (text, nullable)
* `course` (text, not null)
* `min_percentage` (numeric, nullable)
* `fees` (text, nullable)
* `type` (text, nullable)
* `category_tag` (text, nullable)

### Notes

This table is used to generate:

* Dream
* Realistic
* Safe

college recommendations.

---

## 3.10 reports

### Purpose

Stores saved report and PDF reference metadata.

### Fields

* `id` (uuid, primary key)
* `user_id` (uuid, foreign key → users.id)
* `recommendation_id` (uuid, foreign key → recommendations.id)
* `file_path` (text, nullable)
* `created_at` (timestamp, default now)

### Notes

Used for saved history and report download.

---

## 4. Relationships

### User Relationships

* one user → many marksheets
* one user → many question_sessions
* one user → many recommendations
* one user → many reports

### Marksheet Relationships

* one marksheet → many subjects
* one marksheet → one feature row
* one marksheet → one or more question sessions
* one marksheet → one recommendation

### Question Flow Relationships

* one question_session → many questions
* one question → one answer

### Recommendation Relationships

* one recommendation → one saved report entry

---

## 5. Data Flow Summary

### Upload Stage

user → marksheets

### OCR Stage

marksheets → subjects

### Feature Stage

subjects / marksheets → features

### Question Stage

features → question_sessions → questions → answers

### Recommendation Stage

features + answers → recommendations

### Report Stage

recommendations → reports

### College Stage

recommendations + colleges → filtered college output

---

## 6. Important Rules

### Rule 1: Dataset Isolation

The `dataset_type` in `question_sessions` must control which recommendation dataset is used.

### Rule 2: One Analysis Chain

Each recommendation must be traceable to:

* one user
* one marksheet
* one question session

### Rule 3: Report History

Users must be able to reopen past recommendations.

---

## 7. Future Extendability

The schema should support future additions such as:

* multilingual report output
* counselor booking
* payment plans
* advanced analytics

These are not part of the hackathon MVP.

---

## 8. Final Schema Philosophy

The database should remain:

* simple
* modular
* traceable
* scalable
* easy to implement in Supabase

Every major user action should have a clean stored record.