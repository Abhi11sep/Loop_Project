const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function convertMarkdownToPDF() {
  const mdPath = 'C:\\Users\\TEMP.DESKTOP-D022FF5.007\\.gemini\\antigravity\\brain\\673b4e9e-ae2b-4b6b-bfea-29d02dfcb3f2\\architecture_flowchart.md';
  const htmlPath = path.join(__dirname, 'architecture_flowchart_rendered.html');
  const pdfPath = 'C:\\Users\\TEMP.DESKTOP-D022FF5.007\\.gemini\\antigravity\\brain\\673b4e9e-ae2b-4b6b-bfea-29d02dfcb3f2\\architecture_flowchart.pdf';

  const mdContent = fs.readFileSync(mdPath, 'utf-8');

  // Convert Markdown content to HTML structure with Mermaid JS
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Project LOOP - Architecture & Flowcharts</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0f19;
      color: #e2e8f0;
      padding: 30px;
      margin: 0;
    }
    h1 {
      color: #ffffff;
      font-size: 26px;
      border-bottom: 2px solid #312e81;
      padding-bottom: 10px;
    }
    h2 {
      color: #818cf8;
      font-size: 20px;
      margin-top: 30px;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
    }
    .mermaid-container {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0 40px 0;
      display: flex;
      justify-content: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .mermaid {
      width: 100%;
    }
    @media print {
      body {
        background-color: #0b0f19 !important;
        -webkit-print-color-adjust: exact;
      }
      .mermaid-container {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <h1>Project LOOP — System Architecture & Workflow Diagrams</h1>
  <p>This document contains the rendered visual flowcharts for Project LOOP (AI Customer Feedback Intelligence Platform).</p>

  <h2>1. 🔄 End-to-End User & Role Workflow Diagram</h2>
  <div class="mermaid-container">
    <pre class="mermaid">
flowchart TD
    Start([User Visits Project LOOP]) --> Login{Authenticated?}
    
    Login -- No --> AuthPage[Login / Signup Page]
    AuthPage --> SubmitAuth[Submit Credentials / Register Workspace]
    SubmitAuth --> CreateSession[NextAuth Session Created]
    CreateSession --> CheckRole

    Login -- Yes --> CheckRole{User Role?}

    CheckRole -- ADMIN --> AdminAccess["👑 ADMIN Role<br/>• Full Workspace Control<br/>• Team Member Management<br/>• Ingest, Triage, AI & VoC Reports"]
    CheckRole -- ANALYST --> AnalystAccess["📊 ANALYST Role<br/>• Ingest Feedback & CSV Upload<br/>• Triage Inbox & Status Workflow<br/>• Run AI Classification & VoC Reports"]
    CheckRole -- VIEWER --> ViewerAccess["👁️ VIEWER Role<br/>• Read-Only Access<br/>• View Dashboard & Trends<br/>• Ask LOOP Q&A & View Reports"]

    AdminAccess --> Navigation
    AnalystAccess --> Navigation
    ViewerAccess --> Navigation

    Navigation{Select Feature Navigation}
    
    Navigation -- Dashboard --> DashPage["📊 Analytics Dashboard<br/>• Stat Cards (Total, % Neg, % Pos)<br/>• Volume Over Time AreaChart<br/>• Sentiment Donut Chart<br/>• Top Themes BarChart"]
    
    Navigation -- Feedback Inbox --> InboxPage["📥 Feedback Inbox<br/>• Search & Multi-Filters<br/>• Single Entry Form<br/>• CSV Bulk Import<br/>• Simulate Channel Sync<br/>• Inline Status: NEW -> REVIEWED -> ACTIONED"]
    
    Navigation -- Theme Trends --> TrendsPage["📈 Theme Clustering & Trends<br/>• AI Theme Grouping<br/>• Spike Detection (+% Growth)<br/>• Drill-Down Feedback Modal"]
    
    Navigation -- Ask LOOP AI --> AskPage["🤖 Ask LOOP (Grounded RAG)<br/>• Question Input<br/>• Vector Retrieval<br/>• Grounded Answer with Source Citations"]
    
    Navigation -- VoC Reports --> ReportsPage["📄 Voice of Customer Reports<br/>• 1-Click Executive Digest Generator<br/>• Top Complaints & Feature Requests<br/>• Recommended Action Plan<br/>• PDF Export"]
    
    Navigation -- Team Settings --> SettingsPage["⚙️ Team Settings (Admin Only)<br/>• Invite Teammates<br/>• Assign Roles (ADMIN/ANALYST/VIEWER)"]
    </pre>
  </div>

  <h2>2. 🏗️ System Architecture & Data Flow Diagram</h2>
  <div class="mermaid-container">
    <pre class="mermaid">
flowchart LR
    subgraph Client["1. Client Layer (Browser)"]
        UI["React Components<br/>(Next.js 14 App Router)"]
    end

    subgraph APILayer["2. API Gateway & Security Layer"]
        AuthGuard["NextAuth Session Guard"]
        RBACGuard["Role Security Guard<br/>(ADMIN / ANALYST / VIEWER)"]
        TenancyGuard["Workspace Isolation Guard<br/>(workspaceId Scope)"]
        ZodVal["Zod Schema Validator"]
    end

    subgraph ServiceLayer["3. Services & AI Intelligence Layer"]
        IngestService["Ingestion Service"]
        AIEngine["AI Classification Engine<br/>(Claude API / Local NLP)"]
        VectorEngine["RAG Vector Engine"]
        ReportEngine["VoC Digest Synthesizer"]
    end

    subgraph DatabaseLayer["4. Data Storage Layer"]
        PrismaORM["Prisma ORM Client"]
        SQLiteDB[("Database (PostgreSQL / SQLite)<br/>• Workspace, User, Feedback<br/>• Theme, Embedding, Report")]
    end

    UI -->|HTTP Requests| AuthGuard
    AuthGuard --> RBACGuard
    RBACGuard --> TenancyGuard
    TenancyGuard --> ZodVal
    ZodVal --> IngestService
    ZodVal --> VectorEngine
    ZodVal --> ReportEngine
    IngestService --> AIEngine
    AIEngine --> PrismaORM
    VectorEngine --> PrismaORM
    ReportEngine --> PrismaORM
    PrismaORM <--> SQLiteDB
    </pre>
  </div>

  <h2>3. 🧠 AI Auto-Classification & RAG Sequence Flow</h2>
  <div class="mermaid-container">
    <pre class="mermaid">
sequenceDiagram
    autonumber
    participant U as User / Ingestion
    participant API as Feedback API Handler
    participant AI as Claude API / NLP Engine
    participant Vec as Vector Embedding Engine
    participant DB as Database (Prisma)

    U->>API: Post raw feedback content
    API->>API: Verify workspaceId & Analyst/Admin role
    API->>AI: Send feedback text + existing workspace themes
    AI-->>API: Return JSON (Sentiment, Score, Themes, Feature Area)
    API->>DB: Save Feedback record with classification
    API->>Vec: Generate keyword vector JSON
    Vec->>DB: Store Embedding record linked to Feedback ID
    API-->>U: Return created feedback with AI tags
    </pre>
  </div>

  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' }
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`HTML rendered at: ${htmlPath}`);

  // Use Edge headless print to PDF
  const edgePath = '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"';
  const cmd = `${edgePath} --headless --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=5000 --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`;

  try {
    execSync(cmd);
    console.log(`PDF successfully generated at: ${pdfPath}`);
  } catch (err) {
    console.error('Failed to convert HTML to PDF via Edge:', err);
  }
}

convertMarkdownToPDF();
