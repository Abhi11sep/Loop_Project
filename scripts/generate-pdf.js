const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

function createProjectPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  function checkPageBreak(heightNeeded = 10) {
    if (y + heightNeeded > 275) {
      doc.addPage();
      y = 20;
    }
  }

  // Header Banner
  doc.setFillColor(15, 23, 42); // Dark Navy background
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PROJECT LOOP', margin, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(165, 180, 252);
  doc.text('AI Customer-Feedback Intelligence Platform', margin, 28);
  doc.text('Zidio Internship Project Final Deliverable & Documentation', margin, 34);

  y = 50;

  // Section 1: Executive Overview
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Product Overview', margin, y);
  y += 7;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const overviewText = 
    'Project LOOP is a corporate-grade multi-tenant SaaS application designed to help businesses collect, organize, and analyze customer feedback across multiple channels. Using advanced AI capabilities, the platform automatically classifies sentiment, identifies recurring themes, flags trend spikes, answers grounded plain-English questions, and generates Voice-of-Customer (VoC) executive digests.';
  const splitOverview = doc.splitTextToSize(overviewText, contentWidth);
  doc.text(splitOverview, margin, y);
  y += splitOverview.length * 5 + 6;

  // Section 2: Tech Stack & Architecture
  checkPageBreak(30);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Technology Stack', margin, y);
  y += 7;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  const stackItems = [
    '• Framework: Next.js 14 (App Router) + TypeScript',
    '• Styling: Tailwind CSS + Glassmorphism UI System + Lucide Icons',
    '• Database & ORM: PostgreSQL / SQLite with Prisma ORM (Multi-Tenant Scoped)',
    '• Authentication: NextAuth.js (JWT Sessions + bcrypt password hashing)',
    '• AI Engine: Anthropic Claude API (@anthropic-ai/sdk) + Local Intelligent NLP Engine',
    '• Analytics & Visuals: Recharts Data Visualizations',
    '• Export Capabilities: PDF Report Export Engine (jsPDF + html2canvas)',
  ];
  stackItems.forEach((item) => {
    checkPageBreak(6);
    doc.text(item, margin + 2, y);
    y += 5;
  });
  y += 4;

  // Section 3: Seed Credentials Table
  checkPageBreak(40);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Pre-Configured Seed Demo Credentials', margin, y);
  y += 8;

  // Draw Table Header
  doc.setFillColor(79, 70, 229); // Indigo Header
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Role', margin + 3, y + 5.5);
  doc.text('Email', margin + 35, y + 5.5);
  doc.text('Password', margin + 85, y + 5.5);
  doc.text('Permissions Scope', margin + 120, y + 5.5);
  y += 8;

  const rolesData = [
    { role: 'ADMIN', email: 'admin@loop.com', pass: 'password123', scope: 'Full Workspace & Team Admin' },
    { role: 'ANALYST', email: 'analyst@loop.com', pass: 'password123', scope: 'Feedback Ingestion, Triage & AI' },
    { role: 'VIEWER', email: 'viewer@loop.com', pass: 'password123', scope: 'Read-Only Observer (Protected)' },
  ];

  rolesData.forEach((row, i) => {
    checkPageBreak(8);
    doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, 252);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 8, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(row.role, margin + 3, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(row.email, margin + 35, y + 5.5);
    doc.text(row.pass, margin + 85, y + 5.5);
    doc.text(row.scope, margin + 120, y + 5.5);
    y += 8;
  });
  y += 8;

  // Section 4: Key Features Breakdown
  checkPageBreak(50);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Detailed Feature Breakdown', margin, y);
  y += 7;

  const features = [
    { title: 'Multi-Tenant Auth & RBAC', desc: 'Complete data isolation by workspaceId with Admin, Analyst, and Viewer roles.' },
    { title: 'Feedback Ingestion', desc: 'Single manual form, CSV bulk importer, and simulated channel integration.' },
    { title: 'Feedback Inbox', desc: 'Server-side pagination, search bar, multi-filters, and inline triage status workflow.' },
    { title: 'Analytics Dashboard', desc: 'Recharts area, donut, and bar charts with 7d/30d/90d time-range selectors.' },
    { title: 'AI Auto-Classification (AI1)', desc: 'Auto-detects sentiment, score (-1 to 1), themes, feature area, and re-classify action.' },
    { title: 'Theme Clustering & Trends (AI2)', desc: 'Groups feedback into named themes, detects volume growth spikes (+%), and drill-down.' },
    { title: 'Ask LOOP Grounded Q&A (AI3)', desc: 'RAG semantic vector search answering questions cited with source feedback IDs.' },
    { title: 'VoC Executive Reports (AI4)', desc: '1-click weekly digests with complaints, feature requests, action plans, and PDF export.' },
  ];

  features.forEach((feat) => {
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(67, 56, 202);
    doc.text(`• ${feat.title}`, margin + 2, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const splitF = doc.splitTextToSize(feat.desc, contentWidth - 8);
    doc.text(splitF, margin + 6, y);
    y += splitF.length * 4.5 + 3;
  });

  // Footer
  checkPageBreak(15);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, 280, pageWidth - margin, 280);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Project LOOP — Generated Deliverable PDF Document', margin, 285);
  doc.text(`Page 1 of 1 · ${new Date().toLocaleDateString()}`, pageWidth - margin - 35, 285);

  const outputPath = path.join(__dirname, '..', 'Project_LOOP_Documentation.pdf');
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`PDF successfully generated at: ${outputPath}`);
}

createProjectPDF();
