# CareerLens AI — Frontend / Design System Document

## 1. Overview

This document defines the frontend design system of CareerLens AI.

The purpose of this document is to ensure:

* visual consistency across all screens
* premium SaaS quality
* strong trust and readability
* motion-driven brand identity
* abstract intelligence visuals
* GSAP + ScrollTrigger rules
* selective Three.js usage
* light pastel earthy premium SaaS theme
* clean handoff to Stitch and Antigravity

CareerLens AI must not look like:

* a chatbot
* a quiz app
* a gaming product
* a generic student portal
* a dark futuristic tech demo

It must look like:

* a premium SaaS career decision platform
* a trustworthy AI-assisted report product
* a serious, elegant, and memorable system

---

## 2. Design Style Name

### Primary Style

**Futuristic Warm SaaS Minimalism**

### Supporting Character

* premium
* elegant
* calm
* trustworthy
* slightly futuristic
* explainable
* student-friendly
* parent-friendly

---

## 3. Core Visual Philosophy

The interface should create this feeling:

* “This looks serious and trustworthy”
* “This feels like a real product”
* “This AI is smart but not intimidating”
* “This is easy to understand”
* “This feels premium and memorable”

Motion and abstract intelligence visuals should provide identity and emotional engagement.
The report/dashboard should provide trust, logic, and readability.

---

## 4. Color System

### 4.1 Base Background Colors

* primary page background: soft warm off-white
* secondary background: very light neutral beige / mist
* card background: white

### 4.2 Primary Brand Colors

* primary accent: deep indigo / blue-violet
* secondary accent: muted royal blue
* subtle highlight: controlled cyan

### 4.3 Status Colors

* success / fit: emerald
* warning / caution: amber
* danger / mismatch: muted red

### 4.4 Warm Supporting Accent

* very limited warm orange / amber to balance pastel earthy tones

### 4.5 Color Usage Ratio

* 70% neutral / white / off-white
* 20% indigo / blue-violet
* 8% warm support accents
* 2% highlight / glow usage

### Important Rule

Do not overuse bright colors or glow.
The interface must remain calm and premium.

---

## 5. Typography System

### Typography Feel

* modern sans-serif
* clean
* strong hierarchy
* highly readable

### Hierarchy

* Page headline: bold, large, authoritative
* Section title: strong but clean
* Supporting text: medium-weight, easy to scan
* Minor text: soft and readable, never too faint

### Tone

* avoid decorative type
* avoid cartoon or playful font feel
* text should feel product-grade

---

## 6. Layout System

### 6.1 Global Layout Principles

* high whitespace
* clear alignment
* card-based modular layout
* strong visual rhythm
* easy scanning

### 6.2 Grid Logic

* landing page: wide hero with strong central visual anchor
* upload page: centered trust-focused layout
* question page: abstract intelligence visuals on left / center-left, questions on right
* dashboard page: vertical report layout with strong section separation

### 6.3 Section Spacing

* generous vertical spacing between sections
* avoid clutter
* avoid too many cards packed together

---

## 7. Card Design Rules

### General Card Style

* white or very light neutral background
* soft shadow
* soft radius
* premium spacing
* subtle border if needed

### Important Rule

Different sections should not all look identical.
The report page must feel structured and layered, not repetitive.

---

## 8. Visual & Motion Rules

Abstract intelligence visuals and motion are the core brand anchor of CareerLens AI.

### 8.1 Landing Page

* selective Three.js usage is visually dominant
* create immediate wow factor with motion
* should harmonize with headline and CTA

### 8.2 Upload Page

* smooth GSAP transitions
* used only for continuity

### 8.3 Question Page

* abstract visuals are large and important
* placed left or center-left
* acts as intelligent guide
* should feel like premium AI mentor
* not like a playful mascot

### 8.4 Final Dashboard

* visuals must not dominate
* use as subtle branding accent only
* keep report readability as top priority

### 8.5 Report Preview / PDF

* minimal visual presence
* optional identity element only

### Important Rule

The product should feel inspired by seamless interactions, relying on GSAP + ScrollTrigger rules for high-value motion.

---

## 9. Motion and Interaction System

### Desired Feel

* smooth
* calm
* premium
* controlled
* elegant

### Allowed Motion

* subtle page transitions
* hover elevation
* progress animation
* selected-state emphasis
* card reveal transitions
* smooth motion through GSAP and selective Three.js

### Avoid

* excessive bounce
* flashy motion
* gaming-like interaction
* unnecessary parallax
* distracting effects

### Loading States

Loading states should feel intentional and premium, for example:

* Analyzing your marksheet…
* Understanding your strengths…
* Generating your career report…

---

## 10. Screen-Specific UI Rules

---

## 10.1 Landing Page

### Goals

* impress instantly
* communicate trust
* make user click Start Diagnosis

### Layout

* premium navbar
* strong hero
* prominent animated visual anchor
* headline + subheadline
* clear CTA
* product flow teaser
* trust-building sections

### Feel

* memorable
* premium
* not too busy

---

## 10.2 Upload Page

### Goals

* trust
* clarity
* simplicity

### Must Include

* heading
* upload zone
* supported document info
* clear next step

### Feel

* document-safe
* calm
* serious

---

## 10.3 Invalid Document State

### Goals

* guide user without panic

### Feel

* supportive
* clear
* calm
* professional

---

## 10.4 Question Page

### Goals

* interactive
* intelligent
* immersive
* easy to answer

### Must Include

* abstract motion visual
* question card
* 4 to 5 MCQ cards
* progress bar
* question count

### Feel

* “the system is understanding me”
* not like a quiz app

---

## 10.5 Final Report Dashboard

### Goals

* highest trust
* strongest visual impact
* total clarity
* transparent reasoning

### Must Include

* Main Result
* Score Breakdown
* Evidence Trail
* Top 3 Paths
* Mismatch Detector
* Why Not Other Options
* Parent Verdict
* Risk Preventer
* Career Reality
* 30-Day Roadmap
* Final Action Panel

### Feel

* serious report
* premium
* structured
* explainable
* visually dominant

### Important Rule

This page is not a normal analytics dashboard.
It is a career decision report page.

---

## 10.6 College Section

### Goals

* practicality
* next-step confidence

### Must Include

* Dream
* Realistic
* Safe

### Feel

* useful
* action-oriented
* integrated with report

---

## 10.7 Parent Verdict Section

### Goals

* reduce confusion for family
* simplify the result

### Feel

* softer
* calmer
* clearer
* no jargon

---

## 10.8 Report Preview

### Goals

* feel professional
* feel saveable and shareable

### Feel

* document-like
* clean
* trustworthy

---

## 11. UI Styles to Avoid

Do NOT use:

* glassmorphism-heavy UI
* brutalism
* dark cyberpunk UI
* neon dashboards
* cartoon educational app styling
* gaming UI patterns
* cluttered dashboards

---

## 12. Component Style Principles

### Buttons

* clean
* strong hierarchy
* obvious primary / secondary distinction

### Inputs

* calm
* readable
* consistent radius and spacing

### MCQ Cards

* clear selected state
* premium hover
* easy scanning
* not playful

### Report Sections

* each section visually distinct
* no repetitive copy-paste look

---

## 13. Stitch Workflow Rule

Before creating any Stitch screen, always reuse the same master design brief.

### Prompt Structure

[Master Design Brief] + [Screen-Specific Instructions]

### Important Rule

Never create prompts from scratch for each screen.
Always maintain one consistent design system.

---

## 14. Antigravity Implementation Rule

When implementing screens:

* preserve the same visual system
* do not redesign from scratch
* use reusable components
* match Stitch references faithfully

---

## 15. Final Design Philosophy

CareerLens AI should feel like a premium AI-assisted career audit platform.

The UI must balance:

* intelligence
* trust
* clarity
* elegance
* emotional engagement

The motion and abstract visuals create memorability.
The report creates trust.
The overall design creates product legitimacy.