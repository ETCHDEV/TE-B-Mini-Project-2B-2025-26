# Pathfinder Pal (PlacementPal) — Full Implementation Document

> **Project Name:** Pathfinder Pal  
> **Short Description:** An AI-powered placement readiness platform that assesses engineering students across multiple technical tracks (DSA, ML, SQL, Backend), generates adaptive learning roadmaps with curated resources, provides resume analysis with an integrated AI career chatbot, and offers a full TPO admin panel for placement-drive management with automated email notifications.  
> **Type:** Mini project / Portfolio project

---

## Table of Contents

1. [Executive Summary / Project Overview](#1-executive-summary--project-overview)  
2. [System Architecture](#2-system-architecture)  
3. [Technology Stack](#3-technology-stack)  
4. [Database Schema & Design](#4-database-schema--design)  
5. [Backend — Express.js AI Server](#5-backend--expressjs-ai-server)  
6. [Backend Services Layer (Modular AI Engine)](#6-backend-services-layer-modular-ai-engine)  
7. [Core Engine / Business Logic](#7-core-engine--business-logic)  
8. [Frontend / Client Application](#8-frontend--client-application)  
9. [Authentication & Security](#9-authentication--security)  
10. [Data Pipeline / Background Jobs](#10-data-pipeline--background-jobs)  
11. [API Reference](#11-api-reference)  
12. [Environment & Configuration](#12-environment--configuration)  
13. [Supabase Edge Functions](#13-supabase-edge-functions)  
14. [Testing Strategy](#14-testing-strategy)  
15. [User Flows & Demo Script](#15-user-flows--demo-script)  
16. [Performance, Known Issues & Roadmap](#16-performance-known-issues--roadmap)

---

## 1. Executive Summary / Project Overview

### Problem It Solves

Engineering students preparing for campus placement drives face three challenges:

1. **No clear self-assessment** — they don't know where they stand relative to industry expectations across different technical domains.
2. **Unstructured learning** — even after identifying gaps, they waste time hunting for quality, topic-specific resources.
3. **No coordination tool for the Training & Placement Office (TPO)** — managing hundreds of student registrations, shortlisting, and email notifications is a manual, error-prone process.

### What the System Does (Non-Technical)

Pathfinder Pal is a web-based platform with two user roles:

- **Students** upload their resumes, get an AI-driven analysis with a career chatbot, take timed assessments across four technical tracks, and receive a personalised weekly learning roadmap complete with curated YouTube videos, articles, and coding-practice links.
- **TPO Admins** see analytics dashboards showing student readiness levels, manage placement registrations via bulk Excel upload, update student statuses, and send automated registration/shortlisting emails.

### Target Users & Use Cases

| User | Main Use Case |
|------|---------------|
| Engineering students (final year) | Assess skills → identify gaps → follow tailored roadmap → become "placement ready" |
| TPO coordinators | Upload student data → manage drive lifecycle → email notifications → view assessment analytics |

### Examiner / Interviewer Explanation (3–5 sentences)

"Pathfinder Pal is a full-stack placement-readiness platform.  Students take AI-generated assessments proctored with TensorFlow.js pose-detection; their answers are verified by an LLM and their readiness level is predicted by a pre-trained XGBoost model bridged to Node.js via a Python subprocess.  Based on prediction results, a dynamic weekly roadmap is created by an LLM recommender, and resources are discovered in real-time from YouTube Data API v3, Google Custom Search, and an AI fallback — all cached in Supabase.  The TPO Admin panel provides CSV/Excel upload, status management, and Gmail SMTP-based email automation.  The frontend is a React + TypeScript SPA with Tailwind CSS, shadcn/ui, and Framer Motion, and the backend is an Express.js server calling the Groq cloud API (Llama-3.3 70B) with automatic Ollama fallback."

---

## 2. System Architecture

### Major Components

| Component | Description |
|-----------|-------------|
| **React SPA (Frontend)** | Vite + React 18 + TypeScript. Routes for Student and TPO flows. |
| **Express.js Server (Backend)** | AI orchestration layer on port 3001. Hosts chat, assessment, prediction, and email endpoints. |
| **Supabase Cloud (BaaS)** | PostgreSQL database, Auth (email+password), Storage (avatars), Edge Functions, Row-Level Security. |
| **Groq Cloud LLM** | Primary LLM provider — Llama 3.3 70B via OpenAI-compatible API for question generation, evaluation, analysis, and roadmap. |
| **Ollama (Local LLM)** | Fallback LLM (llama3.2:1b) for chat and when Groq is rate-limited. |
| **XGBoost ML Model** | Pre-trained classifier (Python) invoked via `child_process.spawn` for readiness-level prediction. |
| **YouTube Data API v3** | Discovers tutorial videos per topic. |
| **Google Custom Search API** | Discovers articles and documentation per topic. |
| **Gmail SMTP (Nodemailer)** | Sends registration and shortlisting emails for placement drives. |

### ASCII Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (Client)                               │
│   React 18 + TypeScript + Tailwind + shadcn/ui + Framer Motion             │
│   ┌─────────────┐ ┌────────────┐ ┌───────────┐ ┌──────────────────────┐    │
│   │ Student     │ │ Assessment │ │ Learning  │ │ TPO Admin Panel      │    │
│   │ Home/Resume │ │ + Proctor  │ │ Path      │ │ Dashboard/Placement  │    │
│   └──────┬──────┘ └─────┬──────┘ └─────┬─────┘ └──────────┬───────────┘    │
│          │              │              │                   │                │
│          └──────────────┼──────────────┼───────────────────┘                │
│                         │ HTTP (fetch / axios)                              │
└─────────────────────────┼──────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────────┐
│ Express.js :3001│ │ Supabase     │ │ Supabase Edge        │
│ (AI Backend)    │ │ PostgREST    │ │ Functions (Deno)     │
│                 │ │ + Auth       │ │ (resume-analyze,     │
│ ┌─────────────┐ │ │ + Storage    │ │  generate-assessment,│
│ │ services/   │ │ └──────┬───────┘ │  skill-prediction…)  │
│ │ llm.js      │ │        │         └──────────────────────┘
│ │ generator.js│ │        │
│ │ evaluator.js│ │        ▼
│ │ analyzer.js │ │ ┌──────────────┐
│ │ recommender │ │ │ PostgreSQL   │
│ │ resource_   │ │ │ (Supabase)   │
│ │  finder.js  │ │ │ 20+ tables   │
│ │ rag.js      │ │ └──────────────┘
│ │ syllabus.js │ │
│ └──────┬──────┘ │
│        │        │
│   ┌────┴────┐   │
│   │ Python  │   │       ┌───────────────────────┐
│   │ XGBoost │◄──┤       │ External APIs         │
│   │ model   │   │       │ ┌───────────────────┐ │
│   └─────────┘   │       │ │ Groq (Llama 3.3)  │ │
│                 │◄──────│ │ Ollama (local)    │ │
│                 │       │ │ YouTube Data v3   │ │
│                 │       │ │ Google Custom Srch│ │
│                 │       │ │ Gmail SMTP        │ │
│                 │       │ └───────────────────┘ │
└─────────────────┘       └───────────────────────┘
```

### Data Flow Summary

1. **Student signs up** → Supabase Auth creates user → `user_roles` row inserted → frontend redirects to student home.
2. **Resume upload** → PDF parsed client-side (pdfjs-dist) → text scored locally → analysis stored in `resumes` table → AI chat available via `/chat` endpoint (Ollama).
3. **Assessment** → Student selects track → frontend calls `/assessment/generate` → server uses RAG context + Groq LLM → proctoring (TensorFlow.js MoveNet) runs in browser → answers submitted to `/assessment/verify` → verified answers sent to `/assessment/predict` → XGBoost predicts level → LLM generates roadmap + resources discovered.
4. **Learning Path** → Frontend renders roadmap, fetches curated courses from `courses` table, and shows discovery resources.
5. **TPO Admin** → Uploads Excel → parsed client-side (xlsx) → upserted into `placement_registrations` → admin triggers email campaigns → Express server sends via Gmail SMTP.

---

## 3. Technology Stack

| Layer | Technology | Version (from `package.json` / code) | Notes |
|-------|-----------|--------------------------------------|-------|
| **Frontend Framework** | React | 18.3.1 | SPA with client-side routing |
| **Language** | TypeScript | 5.8.3 | Strict typing throughout frontend |
| **Build Tool** | Vite | 5.4.19 | SWC plugin for fast HMR |
| **Styling** | Tailwind CSS | 3.4.17 | With `tailwindcss-animate` and `@tailwindcss/typography` |
| **UI Components** | shadcn/ui (Radix primitives) | Latest | 25+ Radix primitives installed |
| **Animations** | Framer Motion | 12.29.0 | Page transitions, micro-animations |
| **State Management** | React Context + TanStack React Query | 5.83.0 | Auth context + query caching |
| **Routing** | React Router DOM | 6.30.1 | Protected routes with RBAC |
| **Charts** | Recharts | 2.15.4 | Dashboard analytics charts |
| **Backend Runtime** | Node.js + Express | 5.2.1 | ES Modules (`"type": "module"`) |
| **Database / BaaS** | Supabase (PostgreSQL) | JS SDK 2.98.0 | Auth, DB, Storage, Edge Functions, RLS |
| **Primary LLM** | Groq Cloud (Llama 3.3 70B Versatile) | API | JSON-mode, retry logic, concurrency control |
| **Fallback LLM** | Ollama (llama3.2:1b) | Local | Used for chat and post-retry fallback |
| **ML Model** | XGBoost (Python) | via `xgboost` pip package | 3-class classifier (Beginner/Intermediate/Ready) |
| **ML Runtime** | Python 3 + NumPy | — | Invoked via `child_process.spawn` |
| **Browser ML** | TensorFlow.js + MoveNet | tfjs 4.22.0, pose-detection 2.1.3 | Proctoring: pose detection for body movement |
| **PDF Parsing** | pdfjs-dist | 3.11.174 | Client-side resume text extraction |
| **Email** | Nodemailer | 8.0.1 | Gmail SMTP transport |
| **Excel Parsing** | SheetJS (xlsx) | 0.18.5 | Client-side Excel/CSV upload parsing |
| **Schema Validation** | Zod | 3.25.76 | AI response validation in `analyzer.js` |
| **Concurrency** | p-limit | 7.3.0 | 1-at-a-time LLM API calls |
| **HTTP Client** | Axios | 1.14.0 | YouTube/Google API calls |
| **Testing** | Vitest + Testing Library | 3.2.4 / 16.0.0 | jsdom environment |
| **Linting** | ESLint 9 + typescript-eslint | 9.32.0 / 8.38.0 | — |

---

## 4. Database Schema & Design

The database is hosted on Supabase (PostgreSQL 15). Schema is defined across **33 migration files** in `supabase/migrations/`.

### Entity-Relationship Overview

```
┌──────────────┐       ┌─────────────────────┐       ┌──────────────┐
│   students   │──1:N──│  assessment_results  │       │   courses    │
│   (profiles) │       │  (attempts)          │       │   (catalog)  │
└──────┬───────┘       └──────────────────────┘       └──────┬───────┘
       │                                                     │
       │ 1:N           ┌──────────────────────┐              │ 1:N
       ├───────────────│      resumes         │              │
       │               └──────────────────────┘              │
       │ 1:N                                                 │
       ├───────────────┐                                     │
       │               ▼                                     ▼
       │        ┌──────────────┐                    ┌──────────────┐
       │        │ learning_    │────────────────────>│  courses     │
       │        │   paths      │  (course_id FK)     └──────────────┘
       │        └──────────────┘
       │ 1:N
       ├──────>┌──────────────────────┐
       │       │ shortlisted_students │──N:1──┌─────────────────┐
       │       └──────────────────────┘       │ placement_rounds│
       │                                      └─────────────────┘
       │
       └──────>┌──────────────┐
               │   user_roles │  (user_id → auth.users)
               └──────────────┘

                Standalone Tables:
       ┌────────────────────────┐  ┌───────────────────────┐
       │ placement_registrations│  │  placement_upload_logs │
       └────────────────────────┘  └───────────────────────┘
       ┌────────────────────────┐  ┌───────────────────────┐
       │   cached_assessments   │  │     resource_cache     │
       └────────────────────────┘  └───────────────────────┘
       ┌────────────────────────┐  ┌───────────────────────┐
       │    prediction_logs     │  │      messages          │
       └────────────────────────┘  └───────────────────────┘
       ┌─────────────────────────────────────────────────────┐
       │ assessment_tracks → assessment_categories            │
       │                   → assessment_questions             │
       │                   → assessment_user_responses        │
       └─────────────────────────────────────────────────────┘
```

### Core Table Definitions

#### `students`
```sql
CREATE TABLE public.students (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT NOT NULL UNIQUE,
  email      TEXT,
  phone      TEXT,
  parent_email TEXT,
  department TEXT,
  year       INTEGER,
  is_registered BOOLEAN NOT NULL DEFAULT false,
  -- Extended profile fields (added via later migrations):
  full_name  TEXT,
  bio        TEXT,
  target_role TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- INDEXES: idx_students_username, idx_students_department
```

#### `assessment_results`
```sql
CREATE TABLE public.assessment_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID REFERENCES students(id) ON DELETE CASCADE,
  student_username  TEXT NOT NULL,
  track             TEXT NOT NULL,
  correct_answers   INTEGER NOT NULL DEFAULT 0,
  total_questions   INTEGER NOT NULL DEFAULT 5,
  level             TEXT NOT NULL DEFAULT 'Beginner',
  gaps              JSONB DEFAULT '[]',
  question_responses JSONB DEFAULT '[]',
  ai_prediction     JSONB,
  confidence_score  DECIMAL(5,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- INDEXES: idx_assessment_results_student, idx_assessment_results_track
-- REALTIME: enabled
```

#### `resumes`
```sql
CREATE TABLE public.resumes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES students(id) ON DELETE CASCADE,
  student_username TEXT NOT NULL,
  file_url         TEXT,
  file_name        TEXT,
  extracted_text   TEXT,
  skills_found     JSONB DEFAULT '[]',
  analysis_json    JSONB,
  overall_score    DECIMAL(5,2),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `courses`
```sql
CREATE TABLE public.courses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  platform         TEXT NOT NULL,   -- YouTube, Udemy, freeCodeCamp, etc.
  url              TEXT NOT NULL,
  track            TEXT NOT NULL,   -- e.g. 'Data Science & ML'
  skill_covered    TEXT NOT NULL,   -- topic name
  difficulty_level TEXT NOT NULL DEFAULT 'Beginner',
  duration_hours   INTEGER,
  is_free          BOOLEAN NOT NULL DEFAULT false,
  is_curated       BOOLEAN DEFAULT false,  -- manually curated flag
  rating           DECIMAL(3,2),
  description      TEXT,
  instructor       TEXT,
  resource_type    TEXT DEFAULT 'video', -- 'video', 'article', 'practice'
  category         TEXT,             -- 'curated_video', 'practice_problem', 'article'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- INDEXES: idx_courses_track, idx_courses_skill
```

#### `placement_registrations`
```sql
CREATE TABLE placement_registrations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('Registered','Unregistered','Shortlisted','Rejected')),
  registration_email_sent BOOLEAN DEFAULT FALSE,
  shortlist_email_sent  BOOLEAN DEFAULT FALSE,
  drive_id              TEXT,
  uploaded_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
-- INDEXES: email, status, drive_id, email_sent flags
-- UNIQUE CONSTRAINT: (email, COALESCE(drive_id, ''))
```

#### `cached_assessments`
```sql
CREATE TABLE public.cached_assessments (
  track      TEXT PRIMARY KEY,
  questions  JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `resource_cache`
```sql
CREATE TABLE public.resource_cache (
  topic           TEXT NOT NULL,
  user_level      TEXT NOT NULL,  -- 'Beginner', 'Intermediate', 'Ready'
  resources       JSONB NOT NULL, -- array of resource objects
  source          TEXT NOT NULL,  -- 'Curated', 'API_YouTube', 'Mixed'
  content_hash    TEXT,
  algorithm_version TEXT DEFAULT 'v3',
  click_count     INT DEFAULT 0,
  search_count    INT DEFAULT 0,
  last_updated    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (topic, user_level)
);
-- INDEXES: idx_resource_topic_level, idx_resource_last_updated, idx_resource_clicks
-- HELPER FUNCTIONS: increment_resource_click(), increment_resource_search()
```

#### `prediction_logs`
```sql
CREATE TABLE public.prediction_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id),
  track            TEXT NOT NULL,
  assessment_score FLOAT NOT NULL,
  mastery_ratio    FLOAT NOT NULL,
  resume_score     FLOAT NOT NULL,
  prev_attempts    INT NOT NULL DEFAULT 0,
  avg_difficulty   FLOAT NOT NULL DEFAULT 2.0,
  skill_gap_count  INT NOT NULL,
  track_id         INT NOT NULL DEFAULT 0,
  prediction       INT NOT NULL,          -- 0/1/2
  prediction_label TEXT NOT NULL,
  confidence       FLOAT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

#### `user_roles`
```sql
CREATE TABLE public.user_roles (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- references auth.users(id)
  role    app_role NOT NULL DEFAULT 'student'
);
-- ENUM: app_role = 'student' | 'tpo'
```

#### Assessment Question Bank (Relational)
```sql
-- assessment_tracks:   { id, name, description }
-- assessment_categories: { id, track_id (FK), name, description }
-- assessment_questions:  { id, category_id (FK), type, question, options,
--                          correct_answer, explanation, difficulty, points }
-- assessment_user_responses: { id, user_id (FK), question_id (FK),
--                              user_answer, is_correct, response_time_seconds }
```

### Row-Level Security (RLS)

All tables have RLS **enabled**. Most policies are currently permissive (`USING (true)`) for demo mode, with the exception of:
- `placement_registrations` / `placement_upload_logs` — restricted to `auth.jwt()->>'role' = 'ADMIN'`.
- `prediction_logs` — users can insert their own, view their own, or admin can view all.
- `resource_cache` — public read, service-role write.

### Stored Functions (RPCs)

| Function | Purpose |
|----------|---------|
| `get_user_role(_user_id UUID)` | Returns the role string for a user |
| `has_role(_role, _user_id)` | Boolean check for role |
| `get_assessment_stats()` | Aggregates assessment results by track level |
| `get_recent_assessments(limit_count)` | Returns latest N assessment attempts |
| `admin_get_users()` | Returns all users with roles for admin panel |
| `get_assessment_questions_by_track(track_name, num_questions)` | Returns questions from the relational question bank |
| `increment_resource_click(topic, level)` | Updates click_count on resource_cache |
| `increment_resource_search(topic, level)` | Upserts search_count on resource_cache |

---

## 5. Backend — Express.js AI Server

### Location & Entry Point

- **Entry:** `server.js` (root)
- **Port:** `3001` (configurable via `PORT` env var)
- **Run:** `npm run server` → `node server.js`

### Directory Structure

```
pathfinder-pal/
├── server.js                ← Main Express server (routes + email)
├── supabase_client.js       ← Backend Supabase clients (anon + admin)
├── services/                ← Modular AI service layer
│   ├── llm.js               ← LLM abstraction (Groq + Ollama)
│   ├── generator.js         ← Assessment question generator
│   ├── evaluator.js         ← Answer verification engine
│   ├── analyzer.js          ← Readiness analysis + XGBoost bridge
│   ├── recommender.js       ← Adaptive roadmap generator
│   ├── resource_finder.js   ← Dynamic resource discovery engine
│   ├── rag.js               ← RAG context retrieval from DB
│   └── syllabus.js          ← Static syllabus definitions (4 tracks)
├── predict_with_xgboost.py  ← Python ML prediction script
├── model.json               ← Serialised XGBoost model (695 KB)
├── feature_order.json       ← Feature column order for model
├── train_model.py           ← Model training script
├── generateDataset.py       ← Synthetic dataset generator
├── improve.py               ← Label improvement script
├── dataset.csv              ← Original 1000-row dataset
└── dataset_improved.csv     ← Enhanced dataset with better labels
```

### Middleware & Configuration

```javascript
// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());              // Open CORS (no origin restriction)
app.use(express.json());      // JSON body parsing
```

### Route Groups

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/chat` | inline | AI career assistant chat (Ollama) |
| POST | `/assessment/generate` | `generateAssessment()` | RAG-powered question generation (Groq) |
| POST | `/assessment/verify` | `verifyResponses()` | Answer verification (local + Groq) |
| POST | `/assessment/predict` | `analyzeReadiness()` + `getRecommendations()` + `findResources()` | Full prediction pipeline |
| POST | `/api/admin/send-registration-emails` | inline | Send registration confirmation emails |
| POST | `/api/admin/send-shortlist-emails` | inline | Send shortlisting congratulation emails |

---

## 6. Backend Services Layer (Modular AI Engine)

### 6.1 `services/llm.js` — LLM Abstraction Layer

**Purpose:** Unified interface to call LLMs with retry logic, rate-limit handling, and automatic fallback.

| Export | Description |
|--------|-------------|
| `callGroqAPI(system, user, jsonMode, retries)` | Primary API — Groq Cloud (Llama 3.3 70B) |
| `callOllamaAPI(system, user, jsonMode)` | Local Ollama (llama3.2:1b) |
| `callNvidiaAPI` | Alias → `callGroqAPI` (backward compat) |
| `callEvaluationAPI` | Alias → `callGroqAPI` |
| `callCohereAPI` | Alias → `callGroqAPI` |
| `safeParse(text)` | Robust JSON parser for LLM output (handles markdown fences, raw JSON) |

**Key Design Decisions:**
- Uses `p-limit(1)` for global concurrency — max 1 parallel Groq call.
- Exponential backoff with jitter on 429 responses (`delay * 2 + random 0–2s`).
- After 3 retries, falls back to Ollama automatically.
- `safeParse()` handles 4 extraction strategies: direct parse → fenced code block → first `{`/`[` extraction.

### 6.2 `services/generator.js` — Assessment Generator

**Purpose:** Generates diverse, non-redundant assessment questions using LLM.

**Flow:**
1. Determine if targeted (specific topics) or full-syllabus assessment.
2. Get all allowed topics from `syllabus.js`.
3. Send structured prompt to Groq requesting exact JSON schema.
4. Parse response, assign IDs and question numbers.
5. Cache questions in `cached_assessments` table (JSON cache).
6. Persist to relational `assessment_questions` table (background, non-blocking).
7. On generation failure, fall back to cached version.

**Question Format:**
- Full assessment: 9 MCQ + 6 coding = 15 questions
- Targeted assessment: 100% MCQ
- Mix of Easy / Medium / Hard

### 6.3 `services/evaluator.js` — Answer Verification Engine

**Purpose:** Two-phase verification of student answers.

**Phase 1 — Local Processing (Fast Path):**
- MCQ: direct index comparison
- Coding: exact string match (case-insensitive)

**Phase 2 — Batch AI Evaluation (Slow Path):**
- Pending coding/short-answer questions sent to Groq in a single batch prompt
- LLM scores each answer 0–10 and provides feedback
- Score ≥ 7 → correct

**Output:** `{ results[], correctCount, totalQuestions, gaps[] }`

### 6.4 `services/analyzer.js` — Readiness Analyzer

**Purpose:** Predicts student readiness level using a real XGBoost model, then generates AI mentor feedback.

**Pipeline:**
1. Calculate `assessmentScore`, `masteryRatio` from raw results.
2. Fetch `prevAttempts` from `prediction_logs` table.
3. Map track name to `trackId` integer.
4. Build 7-feature vector: `[assessment_score, mastery_ratio, resume_score, prev_attempts, avg_difficulty, skill_gap_count, track_id]`.
5. Invoke `predict_with_xgboost.py` via `child_process.spawn` (stdin JSON → stdout JSON).
6. On Python failure, use `heuristicFallback()` (weighted formula).
7. Log prediction to `prediction_logs` table.
8. Call LLM for detailed topic classification + mentor feedback.
9. Validate LLM response with **Zod schema**.
10. Merge AI classification with explicit gap data.

**Zod Schema:**
```javascript
z.object({
  confidence: z.number(),
  estimatedReadinessWeeks: z.number(),
  topicClassification: z.object({
    strong: z.array(z.string()),
    weak:   z.array(z.string()),
    unknown: z.array(z.string())
  }),
  skillGaps: z.array(z.object({
    skill: z.string(),
    gapType: z.string(),
    priority: z.enum(["High", "Medium", "Low"])
  })),
  overallAnalysis: z.string()
})
```

### 6.5 `services/recommender.js` — Adaptive Roadmap Generator

**Purpose:** Creates a weekly learning plan tailored to the student's weak and unknown topics.

**Key Rules (enforced in prompt):**
- Skip mastered ("strong") topics entirely.
- Dynamic timeline: 1–8 weeks depending on gap count.
- Logical flow: weak topics first, then unknown.

**Output Schema:**
```json
{
  "recommendations": ["...", "..."],
  "weeklyPlan": [
    {
      "week": 1,
      "title": "...",
      "focus": "...",
      "tasks": ["...", "..."],
      "resourceHint": "...",
      "topics": ["..."]
    }
  ],
  "overallAdvice": "..."
}
```

### 6.6 `services/resource_finder.js` — Elite Resource Discovery Engine (V3)

**Purpose:** Real-time, multi-source resource aggregation with caching and ranking.

**Architecture:**

```
findResources(topic, level)
    │
    ├── 1. Return curated (hardcoded) resources immediately
    ├── 2. Check DB cache (resource_cache table)
    │      └── If fresh → merge curated + cached → return
    ├── 3. If stale or missing:
    │      ├── Parallel fetch:
    │      │   ├── fetchYouTube(topic, level)   ← YouTube Data API v3
    │      │   └── fetchGoogle(topic, level)     ← Google Custom Search API
    │      ├── Diversity check:
    │      │   └── Missing article/practice types → fetchAIRecommendations(topic)
    │      ├── processResources() → dedupe + score + rank + ensure diversity
    │      └── saveCache(topic, level, processed)
    └── Return top 5 resources
```

**Scoring Formula (V3):**
```
score = (relevance × 0.35) + (difficultyMatch × 0.25) + (rating × 0.20)
      + (popularity × 0.15) + (durationScore × 0.05)
```

**Diversity Enforcement:** At least 1 video, 1 article, 1 practice resource in every result set.

**Cache Strategy:**
- Hot topics (click_count > 10): 3-day TTL
- Cold topics: 7-day TTL
- Stale-while-revalidate: returns cached + refreshes in background

### 6.7 `services/rag.js` — RAG Context Retrieval

**Purpose:** Fetches domain skills from `domain_skills` table to ground LLM prompts.

```javascript
export async function getTrackContext(track) {
  // SELECT skill FROM domain_skills WHERE domain = track
  // Returns formatted string: "Domain: ...\nKey Skills to assess:\n- skill1\n- skill2"
  // Fallback: generic context string if table is empty
}
```

### 6.8 `services/syllabus.js` — Static Syllabus Definitions

**Purpose:** Authoritative topic lists for all four tracks.

| Track | Weeks | Total Topics |
|-------|-------|-------------|
| Programming & DSA | 6 | 28 topics |
| Data Science & ML | 16 | 48 topics |
| Database Management & SQL | 10 | 26 topics |
| Backend / Web Dev | 14 | 35 topics |

Exports: `getSyllabus(track)`, `getAllTopics(track)`.

---

## 7. Core Engine / Business Logic

### 7.1 XGBoost Readiness Prediction Pipeline

**Training Pipeline** (`train_model.py` + `generateDataset.py` + `improve.py`):

```
generateDataset.py                   improve.py                   train_model.py
┌──────────────┐                ┌──────────────┐             ┌──────────────────┐
│ Generate 1000│──dataset.csv──>│ Re-label with│─improved──> │ XGBClassifier    │
│ synthetic    │                │ weighted     │  .csv        │ n_estimators=150 │
│ samples      │                │ formula      │              │ max_depth=5      │
└──────────────┘                └──────────────┘              │ lr=0.08          │
                                                             │ → model.json     │
                                                             │ → feature_order  │
                                                             └──────────────────┘
```

**Feature Vector (7 dimensions):**

| # | Feature | Range | Description |
|---|---------|-------|-------------|
| 0 | `assessment_score` | 0.0–1.0 | Correct answers / total questions |
| 1 | `mastery_ratio` | 0.0–1.0 | Correctly answered topics / all syllabus topics |
| 2 | `resume_score` | 0.0–1.0 | Normalised resume analysis score |
| 3 | `prev_attempts` | 0–N | Past prediction count from `prediction_logs` |
| 4 | `avg_difficulty` | 1.0–4.0 | Average difficulty of presented questions |
| 5 | `skill_gap_count` | 0–N | Number of topics the student got wrong |
| 6 | `track_id` | 0–3 | Integer encoding of the 4 tracks |

**Label Improvement Formula** (`improve.py`):
```python
val = (assessment_score × 0.5) + (resume_score × 0.2) - (min(skill_gap_count/10, 1.0) × 0.3)
# val > 0.65 → Ready (2)
# val > 0.35 → Intermediate (1)
# else       → Beginner (0)
```

**Prediction Script** (`predict_with_xgboost.py`):
- Reads features from stdin (JSON).
- Loads `model.json` and `feature_order.json`.
- Returns: `{ level, confidence, raw_prediction, probabilities, top_factors }`.
- `top_factors` provides **model explainability** — the 3 most important features for this prediction.

**Heuristic Fallback:** If Python script fails (missing dependencies, timeout), the same weighted formula from `improve.py` is used with 50% confidence flag.

### 7.2 Resume Analysis Engine

**Location:** `src/lib/resumeScoring.ts` (client-side)

**Inputs:** Raw text extracted from PDF (via pdfjs-dist) + selected track.

**Scoring Dimensions (6 axes):**

| Dimension | Weight | Calculation |
|-----------|--------|-------------|
| Skill Match | 30% | Matched skills / total required skills for track |
| Project Quality | 25% | Count of project-related keywords × 10 (capped at 100) |
| Experience | 15% | Count of experience keywords × 12 (capped at 100) |
| Resume Structure | 10% | Presence of standard sections (skills, experience, education, projects, summary) |
| Action Verbs | 10% | Count of action verbs (developed, implemented, led…) × 8 (capped at 100) |
| Consistency | 10% | Average of structure + action verbs scores |

**Overall Score = Σ(weight × dimension)**

Each track has a specific skill list:
- **Programming & DSA:** c, c++, java, python, data structures, algorithms, arrays, linked list, trees, graphs, dynamic programming, sorting, searching, recursion, competitive programming
- **Data Science & ML:** python, tensorflow, pytorch, machine learning, deep learning, neural networks, pandas, numpy, scikit-learn, nlp, computer vision, keras, jupyter, data analysis
- **Database Management & SQL:** sql, mysql, postgresql, mongodb, database, normalization, indexing, query optimization, joins, stored procedures, nosql, redis, data modeling, acid, transactions
- **Backend / Web Dev:** node.js, express, rest api, graphql, javascript, typescript, docker, git, ci/cd, microservices, authentication, jwt, websockets, nginx, aws

### 7.3 AI Proctoring System

**Location:** `src/components/proctoring/`

**Components:**
| Component | Purpose |
|-----------|---------|
| `ProctoringProvider.tsx` | React Context managing proctoring state, camera, pose detection |
| `ProctoringSetup.tsx` | Permission request UI, model loading indicator |
| `CameraFeed.tsx` | Live camera preview overlay |
| `WarningOverlay.tsx` | Warning notification display |

**Violation Detection:**

| Violation Type | Detection Method |
|----------------|-----------------|
| `tab_switch` | `document.visibilitychange` + `window.blur` events |
| `body_movement` | MoveNet pose detection — nose & eye keypoints confidence < 0.3 |
| `camera_hidden` | MoveNet detects 0 poses in frame |

**Configuration:**
- Max warnings: **3** → triggers `onMaxWarningsReached` callback (auto-fail).
- Pose analysis runs every **1.5 seconds** to save CPU.
- 1-second cooldown between same-type violations to prevent double-counting.

---

## 8. Frontend / Client Application

### 8.1 Directory Structure

```
src/
├── main.tsx                    ← React root + Vite entry
├── App.tsx                     ← Router + Providers (Auth, Query, Tooltip) + ErrorBoundary
├── App.css                     ← Minimal app-level styles
├── index.css                   ← Tailwind directives + CSS custom properties
├── vite-env.d.ts               ← Vite type declarations
│
├── pages/
│   ├── Index.tsx               ← Root redirect (unused placeholder)
│   ├── RoleSelection.tsx       ← Landing page: Student vs TPO Admin
│   ├── Register.tsx            ← Student registration (email+password)
│   ├── Login.tsx               ← Student login
│   ├── TPOAdminLogin.tsx       ← TPO admin login (hardcoded email check)
│   ├── StudentHome.tsx         ← Student dashboard home (29K lines)
│   ├── ResumeAnalysis.tsx      ← Resume upload + analysis + AI chat (44K lines)
│   ├── TrackSelection.tsx      ← Choose assessment track (DSA/ML/SQL/Backend)
│   ├── Assessment.tsx          ← Timed assessment UI with proctoring (54K lines)
│   ├── LearningPath.tsx        ← Roadmap + curated resources (63K lines)
│   ├── StudentDashboard.tsx    ← Analytics + tracked progress
│   ├── StudentChat.tsx         ← Standalone chat page
│   ├── Profile.tsx             ← Student profile editor + avatar upload (28K)
│   ├── TPODashboard.tsx        ← TPO analytics dashboard
│   ├── TPOUsersManagement.tsx  ← User management (view/edit roles)
│   ├── TPOPlacementPanel.tsx   ← Placement drive management (42K lines)
│   ├── TPOPlacementPanelSimple.tsx ← Simplified placement panel
│   ├── TPOChat.tsx             ← TPO ↔ Student messaging (16K)
│   └── NotFound.tsx            ← 404 page
│
├── components/
│   ├── Navbar.tsx              ← Top navigation bar (role-aware)
│   ├── ProtectedRoute.tsx      ← RBAC route guard
│   ├── ErrorBoundary.tsx       ← React error boundary
│   ├── CursorGlow.tsx          ← Decorative cursor glow effect
│   ├── NavLink.tsx             ← Navigation link helper
│   ├── FloatingTPOChat.tsx     ← Floating chat widget
│   ├── proctoring/             ← TensorFlow.js proctoring system
│   │   ├── ProctoringProvider.tsx
│   │   ├── ProctoringSetup.tsx
│   │   ├── CameraFeed.tsx
│   │   └── WarningOverlay.tsx
│   └── ui/                     ← shadcn/ui components (25+ Radix primitives)
│
├── hooks/
│   ├── use-toast.ts            ← Toast notification hook
│   ├── use-mobile.tsx          ← Mobile breakpoint detection
│   └── useResumeChat.ts       ← AI career chatbot hook
│
├── services/
│   ├── assessmentService.ts    ← Frontend assessment API service
│   └── adminService.ts         ← Frontend admin API service
│
├── lib/
│   ├── authContext.tsx          ← Auth React Context (Supabase Auth)
│   ├── resumeScoring.ts        ← Client-side resume analysis engine
│   ├── mockData.ts             ← Type definitions + fallback mock data
│   ├── errorHandler.ts         ← Singleton error handler + toast
│   └── utils.ts                ← Utility functions (cn)
│
├── integrations/
│   └── supabase/
│       ├── client.ts           ← Supabase browser client
│       └── types.ts            ← Auto-generated DB type definitions (705 lines)
│
└── test/
    ├── setup.ts                ← Test environment setup
    └── example.test.ts         ← Placeholder test
```

### 8.2 Routing

```typescript
// App.tsx — All routes
// PUBLIC
/                    → RoleSelection (or redirect if logged in)
/register            → Register
/role-selection       → RoleSelection
/login               → Login
/tpo-admin-login     → TPOAdminLogin

// STUDENT (requiredRole="student")
/student-home        → StudentHome
/resume              → ResumeAnalysis
/tracks              → TrackSelection
/assessment          → Assessment
/learning-path       → LearningPath
/student-dashboard   → StudentDashboard
/student-chat        → StudentChat
/profile             → Profile

// TPO (requiredRole="tpo")
/tpo-dashboard       → TPODashboard
/tpo-users           → TPOUsersManagement
/tpo-placement-panel → TPOPlacementPanel
/tpo-chat            → TPOChat

// UNPROTECTED
/tpo-placement-simple → TPOPlacementPanelSimple

// CATCH-ALL
*                    → NotFound
```

### 8.3 Frontend ↔ Backend Communication

| Target | Method | Base URL |
|--------|--------|----------|
| Express.js AI Server | `fetch()` | `http://localhost:3001` |
| Supabase DB/Auth/Storage | `supabase` client SDK | `VITE_SUPABASE_URL` |
| YouTube/Google APIs | (server-side only) | Via Express proxy |

**Frontend Services:**

- **`assessmentService.ts`** — Wraps Supabase RPCs (`get_assessment_stats`, `get_recent_assessments`) and direct table queries for `assessment_results`.
- **`adminService.ts`** — Wraps admin operations: `admin_get_users`, `placement_registrations` CRUD, `placement_upload_logs`, `user_roles` management.

### 8.4 Key Pages / Screens

| Page | Responsibilities |
|------|-----------------|
| **StudentHome** | Welcome dashboard, quick stat cards, navigation to main features, domain interest display via marquee scroll |
| **ResumeAnalysis** | PDF upload → pdfjs-dist extraction → client-side scoring → radar chart visualisation (Recharts) → Supabase persistence → AI chat panel (Ollama) |
| **TrackSelection** | 4 track cards with descriptions → stores selection for assessment |
| **Assessment** | Proctoring setup → timed 15-question test → MCQ/coding UI → progress bar → submit → verify → predict → results panel with level + confidence + roadmap |
| **LearningPath** | Weekly roadmap accordion → 3-section resource view per topic (curated videos, practice problems, articles) → fetches from `courses` table |
| **Profile** | Editable fields (name, bio, target role, LinkedIn, GitHub) → avatar upload to Supabase Storage → domain interest display |
| **TPODashboard** | Assessment stats by track → pie/bar charts → recent attempts table → aggregate gap analysis |
| **TPOPlacementPanel** | Excel/CSV upload → student table → status editor → one-click email campaigns → upload history |
| **TPOUsersManagement** | All registered users → role management (student ↔ tpo) |
| **TPOChat** | Messaging interface → TPO-Student communication via `messages` table |

---

## 9. Authentication & Security

### Auth Flow

1. **Provider:** Supabase Auth (Email + Password).
2. **Session Storage:** `localStorage` (`persistSession: true`, `autoRefreshToken: true`).
3. **Auth State Listener:** `supabase.auth.onAuthStateChange()` in `AuthProvider`.
4. **Role Resolution:**
   - Primary: `supabase.rpc('get_user_role', { _user_id })` — checks `user_roles` table.
   - Fallback: Hardcoded TPO admin email check (`muazshaikh7861@gmail.com`).
5. **Route Protection:** `ProtectedRoute` component checks `isLoggedIn` and `role` against `requiredRole` prop.
6. **Logout:** `supabase.auth.signOut()` + state reset.

### Security Measures in Code

| Measure | Implementation |
|---------|---------------|
| **Row-Level Security** | Enabled on all tables; demo-mode permissive policies |
| **Service Role Key** | Used only server-side (`supabase_client.js`) for admin operations |
| **CORS** | Currently open (`cors()` with no origin restriction) — dev mode |
| **Input Validation** | Zod schema validation on AI analyzer responses |
| **Error Handling** | `ErrorHandler` singleton with Supabase error code mapping (PGRST116, 23505, etc.) |
| **Protected Routes** | React `ProtectedRoute` component with `requiredRole` guard |
| **API Rate Limiting** | `p-limit(1)` concurrency + exponential backoff for Groq API |
| **Proctoring Integrity** | Tab-switch detection + body-movement AI detection (3 warnings = auto-fail) |

### Known Security Gaps (for a portfolio project)

- API keys are stored in `.env` which is **committed** (not in `.gitignore` in practice — the `.gitignore` file exists but keys are present in repo).
- CORS is completely open.
- RLS policies are demo-mode permissive on most tables.
- TPO admin is identified by hardcoded email, not a proper RBAC system.
- No CSRF protection.
- No request rate limiting on Express endpoints.

---

## 10. Data Pipeline / Background Jobs

### 10.1 ML Training Pipeline (Offline)

```bash
# 1. Generate synthetic dataset (1000 samples)
python generateDataset.py       # → dataset.csv

# 2. Improve labels with weighted formula
python improve.py               # → dataset_improved.csv

# 3. Train XGBoost classifier
python train_model.py           # → model.json + feature_order.json
```

### 10.2 Course Seeding (Migration-Based)

Curated courses are seeded via SQL migration files:

| Migration | Track | Contents |
|-----------|-------|----------|
| `20260222065400_seed_courses.sql` | Multi-track | Initial course catalog |
| `20260328010000_populate_extensive_courses.sql` | Multi-track | Extended catalog |
| `20260331010000_seed_curated_ml_courses.sql` | Data Science & ML | 22K of curated ML YouTube links |
| `20260331030000_seed_curated_dsa_courses.sql` | Programming & DSA | ~8K of curated DSA links |
| `20260331030000_seed_curated_sql_courses.sql` | Database & SQL | 17K of curated SQL links |
| `20260401000000_seed_dsa_courses_simple.sql` | Programming & DSA | Simplified seed |

### 10.3 Background Tasks in Server

- **Assessment caching:** After successful generation, questions are cached to `cached_assessments` and persisted to `assessment_questions` **asynchronously** (fire-and-forget `.then()`).
- **Resource caching:** After discovery, resources are saved to `resource_cache` in the background. Stale-while-revalidate pattern ensures users never wait for cache refresh.
- **Prediction logging:** Every XGBoost prediction is logged to `prediction_logs` for future model retraining.
- **Resource search counting:** Each search increments `search_count` via RPC before fetching APIs.

---

## 11. API Reference

### Express.js Server (`localhost:3001`)

#### `POST /chat`
**Purpose:** AI career assistant powered by local Ollama.

**Request:**
```json
{
  "message": "What skills am I missing?",
  "history": "User: Hi\nAssistant: Hello!",
  "context": "Overall Score: 65%, Missing Skills: docker, kubernetes"
}
```

**Response:**
```json
{
  "reply": "Based on your resume, you should focus on containerization tools like Docker and Kubernetes. These are highly valued for backend roles."
}
```

---

#### `POST /assessment/generate`
**Purpose:** Generate AI-powered assessment questions with RAG context.

**Request:**
```json
{
  "track": "Programming & DSA",
  "numQuestions": 15,
  "topics": []
}
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": "q_1711900000000_0",
      "questionNumber": 1,
      "question": "What is the time complexity of binary search?",
      "type": "mcq",
      "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      "correctAnswer": 1,
      "explanation": "Binary search divides the search space in half each step.",
      "topic": "Binary Search",
      "difficulty": "Easy"
    }
  ]
}
```

---

#### `POST /assessment/verify`
**Purpose:** Verify student answers against correct answers.

**Request:**
```json
{
  "responses": [
    { "questionNumber": 1, "answer": "1" },
    { "questionNumber": 2, "answer": "def sort(arr): return sorted(arr)" }
  ],
  "questions": [
    { "questionNumber": 1, "type": "mcq", "correctAnswer": 1, "explanation": "...", "topic": "..." },
    { "questionNumber": 2, "type": "coding", "correctAnswer": "...", "explanation": "...", "topic": "..." }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    { "index": 0, "isCorrect": true, "score": 10, "correctAnswer": 1, "explanation": "..." },
    { "index": 1, "isCorrect": false, "score": 4, "correctAnswer": "...", "explanation": "..." }
  ],
  "correctCount": 1,
  "totalQuestions": 2,
  "gaps": ["Sorting Algorithms"]
}
```

---

#### `POST /assessment/predict`
**Purpose:** Full prediction pipeline — ML level prediction + AI roadmap + resource discovery.

**Request:**
```json
{
  "track": "Programming & DSA",
  "correctAnswers": 10,
  "totalQuestions": 15,
  "gaps": ["Dynamic Programming", "Graphs"],
  "correctTopics": ["Arrays", "Binary Search", "Sorting"],
  "resumeScore": 72
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "level": "Intermediate",
    "mlConfidence": 78.5,
    "mlFactors": [
      { "feature": "assessment_score", "importance": 12.3, "value": 0.67 },
      { "feature": "skill_gap_count", "importance": 8.7, "value": 2 }
    ],
    "confidence": 78.5,
    "estimatedReadinessWeeks": 3,
    "topicClassification": {
      "strong": ["Arrays", "Binary Search", "Sorting"],
      "weak": ["Dynamic Programming", "Graphs"],
      "unknown": ["Tries", "Bit Manipulation"]
    },
    "skillGaps": [
      { "skill": "Dynamic Programming", "gapType": "Conceptual", "priority": "High" }
    ],
    "recommendations": ["Focus on DP patterns: memoization and tabulation", "..."],
    "weeklyPlan": [
      {
        "week": 1,
        "title": "Foundation Recovery",
        "focus": "Dynamic Programming basics",
        "tasks": ["Solve 5 easy DP problems on LeetCode", "..."],
        "resourceHint": "Take a DP course on YouTube",
        "topics": ["Dynamic Programming"]
      }
    ],
    "overallAdvice": "You are on the right track...",
    "discoveryResources": {
      "Dynamic Programming": [
        { "title": "DP Tutorial", "platform": "YouTube", "url": "https://...", "type": "video" },
        { "title": "LeetCode DP Problems", "platform": "LeetCode", "url": "https://...", "type": "practice" }
      ]
    }
  }
}
```

---

#### `POST /api/admin/send-registration-emails`
**Purpose:** Send registration confirmation emails to students.

**Request:**
```json
{ "email": "student@college.edu" }     // optional — omit to send to all unsent
```

**Response:**
```json
{
  "message": "Email campaign completed",
  "sent": 15,
  "failed": 0,
  "errors": []
}
```

---

#### `POST /api/admin/send-shortlist-emails`
**Purpose:** Send shortlisting congratulation emails.

**Request/Response:** Same shape as registration emails, but targets `status = 'Shortlisted'`.

---

### Supabase RPCs (called from frontend)

| RPC | Args | Returns |
|-----|------|---------|
| `get_user_role` | `_user_id: UUID` | `string` (`'student'` or `'tpo'`) |
| `get_assessment_stats` | — | `{ track, total_students, beginner_count, intermediate_count, ready_count, percentages }[]` |
| `get_recent_assessments` | `limit_count: int` | `{ id, user_email, track, correct_answers, total_questions, gaps, level, completed_at }[]` |
| `admin_get_users` | — | `{ user_id, email, role, created_at, last_sign_in_at }[]` |

---

## 12. Environment & Configuration

### `.env` Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_PROJECT_ID` | Supabase project identifier |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public-facing Supabase key (frontend auth) |
| `VITE_SUPABASE_URL` | Supabase REST API base URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend anon key (Row-Level Security scoped) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key (bypasses RLS) |
| `SUPABASE_URL` | Server-side Supabase URL (same as VITE_ version) |
| `NVIDIA_API_KEY` | Legacy key name (unused — Groq is used instead) |
| `COHERE_API_KEY` | Legacy key (unused — aliased to Groq) |
| `GROQ_API_KEY` | **Primary LLM key** — Groq Cloud API |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key for resource discovery |
| `GOOGLE_API_KEY` | Google Custom Search API key |
| `GOOGLE_CX` | Google Custom Search Engine ID |

### Key Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite dev server (port 8080, HMR, `@` alias, SWC plugin) |
| `vitest.config.ts` | Test runner (jsdom, setup file, `@` alias) |
| `tailwind.config.ts` | Tailwind theme customization (colors, fonts, animations) |
| `postcss.config.js` | PostCSS with Tailwind and Autoprefixer |
| `tsconfig.json` | TypeScript project references |
| `tsconfig.app.json` | App-specific TS config (strict, paths) |
| `eslint.config.js` | ESLint 9 flat config with React hooks/refresh plugins |
| `components.json` | shadcn/ui configuration (component paths, aliases) |
| `supabase/config.toml` | Supabase project config + Edge Function JWT settings |
| `feature_order.json` | ML model feature alignment (7 features) |
| `deno.json` | Deno config for Edge Functions (import maps) |

---

## 13. Supabase Edge Functions

The repo contains **19 Edge Function directories** under `supabase/functions/`. These are Deno-based serverless functions deployed to Supabase. Key functions:

| Function | Purpose |
|----------|---------|
| `resume-analyze` | Server-side resume analysis |
| `resume-chat` | AI chat for resume insights |
| `generate-assessment` | Assessment generation (Edge Function variant) |
| `verify-assessment` | Answer verification variant |
| `generate-learning-path` | Learning path generation |
| `skill-prediction` | ML prediction via Edge Function |
| `linkedin-analyze` | LinkedIn profile analysis |
| `assign-tpo-role` | Admin role assignment |
| `manage-users` | User management operations |
| `send-placement-emails` | Email sending (Edge Function variant) |
| `send-email-gmail-smtp` | Gmail SMTP email variant |
| Various `send-email-*` | Multiple email implementation iterations |

> **Note:** The primary runtime backend is the Express.js server (`server.js`). Edge Functions appear to be parallel implementations / earlier iterations. All JWT verification is disabled in `supabase/config.toml` (`verify_jwt = false`).

---

## 14. Testing Strategy

### Current Test Infrastructure

**Framework:** Vitest 3.2.4 + Testing Library (React 16.0.0) + jest-dom

**Configuration (`vitest.config.ts`):**
```typescript
{
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test/setup.ts"],
  include: ["src/**/*.{test,spec}.{ts,tsx}"]
}
```

**Existing Tests:**
- `src/test/example.test.ts` — Single placeholder test (`expect(true).toBe(true)`).

**How to run:**
```bash
npm test          # vitest run (single pass)
npm run test:watch # vitest (watch mode)
```

### Recommended Test Coverage

| Priority | Area | Test Type | What to Test |
|----------|------|-----------|-------------|
| **P0** | `services/evaluator.js` | Unit | MCQ index comparison, exact match, edge cases |
| **P0** | `src/lib/resumeScoring.ts` | Unit | Score calculations for each dimension, edge cases |
| **P0** | `services/llm.js` → `safeParse()` | Unit | JSON extraction from various LLM output formats |
| **P1** | `services/analyzer.js` → `heuristicFallback()` | Unit | Level classification boundaries |
| **P1** | `src/lib/authContext.tsx` | Unit | Role resolution, login/logout state |
| **P1** | `src/components/ProtectedRoute.tsx` | Component | Redirect behavior for unauthenticated/wrong role |
| **P2** | `services/resource_finder.js` | Integration | Cache hit/miss, diversity enforcement |
| **P2** | `services/generator.js` | Integration | Cache fallback, question format normalisation |
| **P3** | Full assessment flow | E2E (Playwright) | Track selection → assessment → results |

---

## 15. User Flows & Demo Script

### Flow 1: Student — Full Assessment Journey

1. **Navigate to** `/` → See role selection screen.
2. **Click "I'm a Student"** → Redirected to `/login`.
3. **Register/Login** with email and password → Redirect to `/student-home`.
4. **Click "Resume Analysis"** → Navigate to `/resume`.
5. **Upload PDF** → See radar chart with 6-axis scoring → Chat with AI assistant about improvements.
6. **Navigate to "Assessment"** → `/tracks` → Select "Programming & DSA".
7. **Proctoring Setup** → Grant camera + microphone permissions → Assessment loads.
8. **Answer 15 questions** (9 MCQ + 6 coding) → Timer visible → Warnings for tab switches.
9. **Submit** → See results: X/15 correct, skill gaps highlighted.
10. **View Prediction** → ML-predicted level (e.g., "Intermediate — 78% confidence") with top contributing factors.
11. **View Roadmap** → Weekly plan (e.g., "Week 1: Focus on Dynamic Programming") → expand for tasks + resources.
12. **Navigate to Learning Path** → `/learning-path` → See curated videos, practice problems, and articles per topic.
13. **Check Dashboard** → `/student-dashboard` → See latest assessment results + track progress.

### Flow 2: TPO Admin — Placement Drive Management

1. **Navigate to** `/` → Click "I'm TPO Admin".
2. **Login** with TPO admin credentials → Redirect to `/tpo-dashboard`.
3. **View Dashboard** → Assessment analytics by track (pie charts, bar graphs) + recent attempts table.
4. **Navigate to Users** → `/tpo-users` → View all registered students, update roles if needed.
5. **Navigate to Placement Panel** → `/tpo-placement-panel`.
6. **Upload Excel file** → Student data parsed client-side → Preview table shown → Confirm upload.
7. **View student records** → Edit statuses (Registered → Shortlisted).
8. **Click "Send Registration Emails"** → Server sends confirmation emails via Gmail SMTP.
9. **Click "Send Shortlist Emails"** → Server sends congratulation emails to shortlisted students.
10. **Check Messages** → `/tpo-chat` → Send/receive messages to/from students.

### Flow 3: Resume Analysis → AI Career Chat

1. **Student navigates to** `/resume`.
2. **Upload resume PDF** → Text extracted → 6-axis analysis displayed as radar chart.
3. **Overall score** displayed (e.g., "67%").
4. **Missing skills** listed with recommendations.
5. **Open Chat Panel** → AI greets with personalised summary.
6. **Ask**: "How can I improve my resume?" → AI responds with specific advice based on analysis.
7. **Ask**: "What skills am I missing for backend roles?" → AI lists missing skills from the track.

### Flow 4: Learning Path — Curated Resource Discovery

1. **After completing assessment**, student sees roadmap on results page.
2. **Navigate to** `/learning-path`.
3. **Select track** → See weekly schedule accordion.
4. **Expand Week 1** → See three resource sections:
   - 🎥 **Curated Videos** (from `courses` table where `is_curated = true`)
   - 💻 **Practice Problems** (LeetCode/HackerRank links)
   - 📚 **Articles** (MDN, freeCodeCamp, GeeksforGeeks)
5. **Click a resource** → Opens in new tab.
6. **Click "Take Quiz"** → Inline practice quiz (MCQ) generated targeting specific week's topics.

---

## 16. Performance, Known Issues & Roadmap

### Performance Considerations

| Area | Current Approach | Impact |
|------|-----------------|--------|
| **LLM Latency** | `p-limit(1)` serialisation + 3-retry with backoff | Prevents rate limiting but creates queue delay |
| **XGBoost Prediction** | Python subprocess spawn per prediction | ~1–3s overhead per prediction; cold start if Python not cached |
| **Resource Discovery** | Parallel YouTube + Google APIs with 10s timeout | Can take 5–10s per topic; mitigated by cache |
| **Assessment Caching** | `cached_assessments` table (JSON blob per track) | Near-instant fallback on LLM failure |
| **Resource Caching** | `resource_cache` with TTL (3d hot / 7d cold) | Prevents API abuse; stale-while-revalidate UX |
| **Database Indexes** | 10+ indexes on frequently queried columns | Optimised for common queries (username, track, email, status) |
| **Realtime** | Supabase Realtime on `assessment_results` and `shortlisted_students` | Live updates for TPO dashboard |
| **Frontend Bundle** | Vite tree-shaking + SWC | Fast builds; TensorFlow.js adds ~2MB to bundle |
| **Pose Detection** | Frame analysis every 1.5s (not every frame) | Balances accuracy vs CPU usage |

### Known Issues & Technical Debt

| Issue | Severity | Location |
|-------|----------|----------|
| API keys committed to `.env` in repo | 🔴 High | `.env` |
| CORS is completely open (no origin whitelist) | 🟡 Medium | `server.js` |
| RLS policies are demo-mode permissive (`USING(true)`) | 🟡 Medium | Migrations |
| TPO admin identified by hardcoded email, not DB role | 🟡 Medium | `authContext.tsx`, `ProtectedRoute.tsx` |
| Resume analysis uses text extraction simulation for some paths | 🟡 Medium | `resumeScoring.ts` → `simulateResumeContent()` |
| Only 1 placeholder test exists | 🟡 Medium | `src/test/example.test.ts` |
| XGBoost model trained on synthetic data (1000 samples) | 🟡 Medium | `generateDataset.py` |
| Multiple email Edge Function iterations (11 variants) | 🟠 Low | `supabase/functions/send-email-*` |
| Server log files committed to repo | 🟠 Low | `server*.log` files in root |
| `TODO` comments for production improvements | 🟠 Low | `analyzer.js:103` |
| Some type assertions (`as any`) in frontend services | 🟠 Low | `assessmentService.ts`, `adminService.ts` |

### Future Roadmap

| Phase | Feature | Description |
|-------|---------|-------------|
| **Phase 1** | **Production Auth** | Migrate from hardcoded admin email to proper RBAC with `user_roles` table enforcement |
| **Phase 1** | **Secret Management** | Move API keys to environment variables only (not committed); use Supabase Vault or similar |
| **Phase 1** | **RLS Tightening** | Implement proper row-level policies (students see only their own data, TPO sees all) |
| **Phase 2** | **Real Resume Parsing** | Integrate proper NLP-based skill extraction (spaCy / LLM-based) instead of keyword matching |
| **Phase 2** | **Model Retraining Pipeline** | Use `prediction_logs` data to periodically retrain XGBoost model with real student data |
| **Phase 2** | **Test Suite** | Add unit tests for all services, component tests for key pages, E2E with Playwright |
| **Phase 3** | **WebSocket for Chat** | Replace polling-based chat with Supabase Realtime subscriptions |
| **Phase 3** | **Multi-College Support** | Add institution/college entity; partition data by college |
| **Phase 3** | **Interview Scheduling** | Extend placement panel with calendar-based interview slot management |
| **Phase 4** | **Mobile App** | React Native or Capacitor wrapper for student mobile access |
| **Phase 4** | **Analytics Dashboard V2** | Time-series tracking, cohort analysis, predictive analytics for TPO |
| **Phase 4** | **Adaptive Assessment** | Adjust question difficulty in real-time based on student's running accuracy |

---

*Document generated based on real code analysis of the `pathfinder-pal` repository.*  
*Last updated: April 2026*
