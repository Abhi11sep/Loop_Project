const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

function generateFlowchartPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12;
  const contentWidth = pageWidth - 2 * margin;

  // Helper drawing functions
  function drawNode(x, y, w, h, text, subtext, bgColor, borderColor, textColor = '#ffffff') {
    // Fill background
    const rgbBg = hexToRgb(bgColor);
    doc.setFillColor(rgbBg.r, rgbBg.g, rgbBg.b);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');

    // Border
    const rgbBorder = hexToRgb(borderColor);
    doc.setDrawColor(rgbBorder.r, rgbBorder.g, rgbBorder.b);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, w, h, 3, 3, 'S');

    // Title Text
    const rgbText = hexToRgb(textColor);
    doc.setTextColor(rgbText.r, rgbText.g, rgbText.b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(text, x + w / 2, y + (subtext ? 4.5 : h / 2 + 1.5), { align: 'center' });

    // Subtext
    if (subtext) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(203, 213, 225); // slate-300
      doc.text(subtext, x + w / 2, y + 8.5, { align: 'center' });
    }
  }

  function drawArrowDown(x, yFrom, yTo, label = '') {
    doc.setDrawColor(99, 102, 241); // indigo-500
    doc.setLineWidth(0.6);
    doc.line(x, yFrom, x, yTo);
    // Arrow head
    doc.setFillColor(99, 102, 241);
    doc.triangle(x - 1.5, yTo - 2, x + 1.5, yTo - 2, x, yTo, 'F');

    if (label) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(165, 180, 252);
      doc.text(label, x + 2, (yFrom + yTo) / 2);
    }
  }

  function drawArrowRight(xFrom, xTo, y, label = '') {
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.6);
    doc.line(xFrom, y, xTo, y);
    doc.setFillColor(99, 102, 241);
    doc.triangle(xTo - 2, y - 1.5, xTo - 2, y + 1.5, xTo, y, 'F');

    if (label) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(165, 180, 252);
      doc.text(label, (xFrom + xTo) / 2, y - 2, { align: 'center' });
    }
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }

  // ==========================================
  // PAGE 1: USER WORKFLOW FLOWCHART
  // ==========================================

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PROJECT LOOP — VISUAL SYSTEM FLOWCHART', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(165, 180, 252);
  doc.text('End-to-End User Navigation & Role-Based Access Control (RBAC) Flow', margin, 18);

  let y = 35;

  // 1. Entry Node
  drawNode(margin + 50, y, 86, 10, '1. User Visits Project LOOP App', 'http://localhost:3000', '#1e1b4b', '#6366f1');
  drawArrowDown(margin + 93, y + 10, y + 18);

  y += 18;

  // 2. NextAuth Authentication
  drawNode(margin + 40, y, 106, 11, '2. NextAuth Authentication & Session Creation', 'JWT Token + Role + WorkspaceId Payload', '#0f172a', '#4f46e5');
  drawArrowDown(margin + 93, y + 11, y + 20, 'Verify Role');

  y += 20;

  // 3. RBAC Split Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240);
  doc.text('3. Role-Based Access Control (RBAC) Permissions Split', margin, y);
  y += 5;

  // 3 Role Cards side-by-side
  const colW = 58;
  const colGap = 6;
  const x1 = margin;
  const x2 = margin + colW + colGap;
  const x3 = margin + (colW + colGap) * 2;

  // ADMIN
  drawNode(x1, y, colW, 16, '👑 ADMIN ROLE', 'admin@loop.com', '#581c87', '#a855f7');
  // ANALYST
  drawNode(x2, y, colW, 16, '📊 ANALYST ROLE', 'analyst@loop.com', '#1e1b4b', '#6366f1');
  // VIEWER
  drawNode(x3, y, colW, 16, '👁️ VIEWER ROLE', 'viewer@loop.com', '#064e3b', '#10b981');

  // Subtext under roles
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Full Workspace & Member Admin', x1 + colW / 2, y + 20, { align: 'center' });
  doc.text('Ingest, Triage & AI Reports', x2 + colW / 2, y + 20, { align: 'center' });
  doc.text('Read-Only Observer Mode', x3 + colW / 2, y + 20, { align: 'center' });

  drawArrowDown(margin + 93, y + 22, y + 30);
  y += 30;

  // 4. Feature Navigation Split
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240);
  doc.text('4. Core Application Feature Routes & Data Processing', margin, y);
  y += 6;

  // Feature Route Grid (2 columns x 3 rows)
  const routeW = 88;
  const routeH = 17;
  const rx1 = margin;
  const rx2 = margin + routeW + 10;

  // Route 1: Dashboard
  drawNode(rx1, y, routeW, routeH, '📊 /dashboard — Analytics Dashboard', 'Stat Cards, Recharts Area/Donut/Bar Charts', '#0f172a', '#334155');
  // Route 2: Feedback Inbox
  drawNode(rx2, y, routeW, routeH, '📥 /inbox — Feedback Inbox & Triage', 'Search, Filters, Single/CSV Upload, Status Workflow', '#0f172a', '#334155');

  y += routeH + 5;

  // Route 3: Theme Trends
  drawNode(rx1, y, routeW, routeH, '📈 /trends — Theme Clustering & Spikes', 'AI Theme Grouping, Volume Spikes (+%), Drill-Down', '#0f172a', '#334155');
  // Route 4: Ask LOOP
  drawNode(rx2, y, routeW, routeH, '🤖 /ask — Ask LOOP Grounded RAG Q&A', 'TF-IDF Vector Search, Grounded Answer with Citations', '#0f172a', '#334155');

  y += routeH + 5;

  // Route 5: VoC Reports
  drawNode(rx1, y, routeW, routeH, '📄 /reports — Voice of Customer Reports', '1-Click Executive Digest Generator + PDF Export', '#0f172a', '#334155');
  // Route 6: Team Settings
  drawNode(rx2, y, routeW, routeH, '⚙️ /settings — Team Member Management', 'Invite Teammates & Assign RBAC Roles (Admin Only)', '#0f172a', '#334155');

  y += routeH + 12;

  // Footer Page 1
  doc.setDrawColor(51, 65, 85);
  doc.line(margin, 280, pageWidth - margin, 280);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Project LOOP — Page 1: User & Navigation Flowchart', margin, 285);
  doc.text('http://localhost:3000', pageWidth - margin - 35, 285);

  // ==========================================
  // PAGE 2: SYSTEM ARCHITECTURE & DATA FLOW
  // ==========================================
  doc.addPage();

  // Header Banner Page 2
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PROJECT LOOP — THREE-TIER ARCHITECTURE', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(165, 180, 252);
  doc.text('Data Processing Flow: Browser ➔ API Gateway ➔ AI Engine ➔ Database', margin, 18);

  y = 35;

  // Tier 1: Client Layer
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(margin, y, contentWidth, 38, 4, 4, 'F');
  doc.setDrawColor(71, 85, 105);
  doc.roundedRect(margin, y, contentWidth, 38, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(129, 140, 248);
  doc.text('TIER 1: CLIENT LAYER (Browser UI)', margin + 5, y + 7);

  drawNode(margin + 5, y + 12, 54, 18, 'React Server Components', 'Next.js 14 App Router', '#0f172a', '#475569');
  drawNode(margin + 65, y + 12, 54, 18, 'Interactive Client UI', 'Recharts + Glassmorphism', '#0f172a', '#475569');
  drawNode(margin + 125, y + 12, 54, 18, 'PDF Export Engine', 'jsPDF + html2canvas', '#0f172a', '#475569');

  drawArrowDown(margin + 93, y + 38, y + 48, 'HTTP REST API Requests');
  y += 48;

  // Tier 2: API Gateway & Security Layer
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentWidth, 42, 4, 4, 'F');
  doc.setDrawColor(71, 85, 105);
  doc.roundedRect(margin, y, contentWidth, 42, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(129, 140, 248);
  doc.text('TIER 2: API GATEWAY & SECURITY LAYER (Route Handlers)', margin + 5, y + 7);

  drawNode(margin + 5, y + 12, 42, 22, 'NextAuth Session', 'JWT Verification', '#0f172a', '#6366f1');
  drawNode(margin + 51, y + 12, 42, 22, 'RBAC Guard', 'Admin/Analyst Check', '#0f172a', '#a855f7');
  drawNode(margin + 97, y + 12, 42, 22, 'Tenancy Isolation', 'workspaceId Filter', '#0f172a', '#ec4899');
  drawNode(margin + 143, y + 12, 38, 22, 'Zod Validation', 'Runtime Schema', '#0f172a', '#10b981');

  drawArrowDown(margin + 93, y + 42, y + 52, 'Validated Request Payload');
  y += 52;

  // Tier 3: Business Logic & AI Engine
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentWidth, 45, 4, 4, 'F');
  doc.setDrawColor(71, 85, 105);
  doc.roundedRect(margin, y, contentWidth, 45, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(129, 140, 248);
  doc.text('TIER 3: BUSINESS LOGIC & AI INTELLIGENCE SERVICES', margin + 5, y + 7);

  drawNode(margin + 5, y + 12, 42, 25, 'Ingestion Service', 'Single, CSV Bulk & Simulate', '#0f172a', '#3b82f6');
  drawNode(margin + 51, y + 12, 42, 25, 'AI Classification (AI1)', 'Claude API / Local NLP', '#0f172a', '#6366f1');
  drawNode(margin + 97, y + 12, 42, 25, 'Grounded RAG (AI3)', 'Ask LOOP Vector Search', '#0f172a', '#8b5cf6');
  drawNode(margin + 143, y + 12, 38, 25, 'VoC Synthesizer (AI4)', 'Executive Report Engine', '#0f172a', '#f59e0b');

  drawArrowDown(margin + 93, y + 45, y + 55, 'Prisma ORM Queries');
  y += 55;

  // Tier 4: Database Layer
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 35, 4, 4, 'F');
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentWidth, 35, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(165, 180, 252);
  doc.text('TIER 4: MULTI-TENANT DATABASE STORE (PostgreSQL / SQLite via Prisma)', margin + 5, y + 7);

  const tables = ['Workspace', 'User (RBAC)', 'Feedback', 'Theme', 'Embedding (RAG)', 'Report (VoC)'];
  tables.forEach((tbl, idx) => {
    const tx = margin + 5 + (idx % 3) * 60;
    const ty = y + 13 + Math.floor(idx / 3) * 10;
    doc.setFillColor(30, 41, 59);
    doc.rect(tx, ty, 54, 7, 'F');
    doc.setFontSize(8);
    doc.setTextColor(241, 245, 249);
    doc.text(`📁 ${tbl}`, tx + 3, ty + 5);
  });

  // Footer Page 2
  doc.setDrawColor(51, 65, 85);
  doc.line(margin, 280, pageWidth - margin, 280);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Project LOOP — Page 2: System Architecture & Data Flowchart', margin, 285);
  doc.text('Complete Technical Flowchart', pageWidth - margin - 45, 285);

  const outputPath = path.join(__dirname, '..', 'Project_LOOP_Visual_Flowcharts.pdf');
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`Visual Flowchart PDF successfully generated at: ${outputPath}`);
}

generateFlowchartPDF();
