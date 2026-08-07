# Project LOOP — AI Customer-Feedback Intelligence Platform

> **"Close the loop on customer feedback."**
> Project LOOP is a corporate-grade multi-tenant SaaS application that ingests customer feedback across multiple channels, automatically classifies sentiment and themes with AI, detects volume trend spikes, powers retrieval-grounded Q&A (Ask LOOP), and generates Voice-of-Customer (VoC) executive reports with PDF export.

---

## 🌟 Key Features Overview

### 1. Multi-Tenant Authentication & Workspaces
- **Tenant Isolation**: Every single database model (`User`, `Feedback`, `Theme`, `Embedding`, `Report`) carries a `workspaceId` foreign key and queries filter strictly by workspace.
- **Role-Based Access Control (RBAC)** across 3 roles:
  - **👑 ADMIN**: Full workspace administration, team member & role management at `/settings`, feedback ingestion, triage, and report generation.
  - **📊 ANALYST**: Feedback ingestion, CSV bulk upload, simulated channel sync, triage inbox status workflow, AI classification, and VoC report generation.
  - **👁️ VIEWER**: Read-only observer mode (view dashboard, inbox, trends, Ask LOOP, and reports). Protected by server-side `403 Forbidden` guards.

### 2. Feedback Ingestion & Inbox Triage
- **Single Entry Form**: Manual feedback creation modal with instant AI auto-classification.
- **CSV Bulk Import**: Upload CSV files with row parsing, validation, and success/failed summary counts.
- **Simulate Integration**: 1-click button simulating Zendesk, AppStore, and Intercom channel syncs.
- **Paginated Inbox**: Server-side pagination (`/api/feedback`), full-text search bar, and multi-filters (channel, sentiment, status, theme).
- **Inline Status Workflow**: Instant status updates (`NEW` ➔ `REVIEWED` ➔ `ACTIONED`).

### 3. Analytics Dashboard
- Real-time stat cards (Total feedback, % negative ratio, % positive ratio, new items this week).
- **Recharts Data Visualizations**:
  - **Volume Over Time** (AreaChart with daily sentiment gradients)
  - **Sentiment Distribution** (Donut Chart)
  - **Top Themes Frequency** (Horizontal BarChart)
- Responsive time-range filter toggles (Past 7 Days, Past 30 Days, Past 90 Days).

### 4. Core AI Features (AI1 - AI4)
- **AI Auto-Classification (AI1)**: Classifies sentiment (`POS`/`NEU`/`NEG`), sentiment score (-1.0 to 1.0), theme tags, feature area, and rationale. Features 1-click "Re-Classify" button.
- **Theme Clustering & Spike Trends (AI2)**: Groups feedback items into named themes, computes 7-day volume growth vs previous period, flags spiking themes (+% growth), and provides drill-down modals.
- **Ask LOOP Grounded Q&A (AI3)**: Retrieval-Augmented Generation (RAG) using semantic vector TF-IDF search over stored feedback embeddings with mandatory citations to source feedback IDs (`[Source ID: ...]`).
- **Voice of Customer (VoC) Executive Reports (AI4)**: Synthesizes top complaints, top feature requests, sentiment shifts, verbatim quotes, recommended action plan, and offers 1-click PDF Export (`jspdf` + `html2canvas`).

---

## 🔑 Pre-Configured Seed Demo Credentials

Graders and users can test all three RBAC roles on the pre-configured **Acme Cloud Platform** demo workspace using the following credentials on [http://localhost:3000/login](http://localhost:3000/login):

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@acme.com` | `password123` | Full workspace administration, team management & AI features |
| **ANALYST** | `analyst@acme.com` | `password123` | Feedback ingestion, triage inbox, AI classification & reports |
| **VIEWER** | `viewer@acme.com` | `password123` | Read-only access to dashboard, inbox, trends & Ask LOOP |

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons + Custom Glassmorphism UI
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM
- **Authentication**: NextAuth.js (Auth.js) with JWT sessions
- **AI Engine**: Anthropic Claude API (`@anthropic-ai/sdk`) + Local Intelligent Fallback Engine
- **Charts**: Recharts
- **Validation**: Zod
- **PDF Export**: jsPDF + html2canvas

---

## ⚡ Local Setup & Execution Guide

### Prerequisites
- Node.js v18 LTS or newer
- Git

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (.env)
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="loop-secret-key-32-chars-minimum-super-secure!"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="" # Optional: Add Anthropic Claude API key
```

### 3. Initialize Database & Seed 125 Demo Records
```bash
npx prisma db push
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
