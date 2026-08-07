import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Project LOOP database...');

  // Clear existing data
  await prisma.report.deleteMany();
  await prisma.embedding.deleteMany();
  await prisma.feedbackTheme.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  // 1. Create Demo Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Cloud Platform',
    },
  });

  console.log(`Created workspace: ${workspace.name} (${workspace.id})`);

  // 2. Create 3 Demo Users (Admin, Analyst, Viewer)
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Connor (Admin)',
      email: 'admin@acme.com',
      passwordHash,
      role: 'ADMIN',
      workspaceId: workspace.id,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Alex Rivera (Analyst)',
      email: 'analyst@acme.com',
      passwordHash,
      role: 'ANALYST',
      workspaceId: workspace.id,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: 'David Chen (Viewer)',
      email: 'viewer@acme.com',
      passwordHash,
      role: 'VIEWER',
      workspaceId: workspace.id,
    },
  });

  console.log('Created 3 demo users: admin@acme.com, analyst@acme.com, viewer@acme.com (password: password123)');

  // 3. Create Key Themes
  const themesData = [
    { name: 'Onboarding & UX', description: 'User signup, initial setup, walkthroughs, and UI navigation friction', color: '#6366f1' },
    { name: 'Payment & Billing', description: 'Checkout failures, invoices, billing page timeouts, subscription management, SSO billing', color: '#ef4444' },
    { name: 'Performance & Latency', description: 'Dashboard load times, app speed, server timeouts, loading spinners', color: '#f59e0b' },
    { name: 'Integrations & API', description: 'Third-party integrations, webhook reliability, REST API rate limits', color: '#10b981' },
    { name: 'Mobile Experience', description: 'Mobile web responsiveness, iOS/Android usability, touch targets', color: '#8b5cf6' },
    { name: 'Security & Auth', description: 'SSO support, 2FA setup, role permissions, session expiration', color: '#ec4899' },
  ];

  const themes: Record<string, any> = {};
  for (const t of themesData) {
    const created = await prisma.theme.create({
      data: {
        ...t,
        workspaceId: workspace.id,
      },
    });
    themes[t.name] = created;
  }

  console.log(`Created ${Object.keys(themes).length} seed themes`);

  // 4. Create 120+ realistic feedback items spanning the last 30 days
  const channels = ['Support ticket', 'App store review', 'NPS survey', 'Sales call note', 'Community post'];
  
  const rawFeedbackList = [
    // Payment & Billing issues
    { content: "Billing page keeps timing out whenever I try to download an invoice. Extremely frustrating for our finance team.", channel: "Support ticket", sentiment: "NEG", score: -0.8, theme: "Payment & Billing", featureArea: "Billing Portal", customerLabel: "Enterprise Plan" },
    { content: "Prospect wants SSO before they'll sign — third time this month we lost a enterprise deal over SAML/SSO.", channel: "Sales call note", sentiment: "NEG", score: -0.7, theme: "Security & Auth", featureArea: "Authentication", customerLabel: "Prospect: Fintech Global" },
    { content: "Credit card payment failed with error code ERR_402, but my card was charged twice! Please refund immediately.", channel: "Support ticket", sentiment: "NEG", score: -0.9, theme: "Payment & Billing", featureArea: "Checkout", customerLabel: "Pro Tier User" },
    { content: "Why is there no annual billing discount option? We want to pay upfront for the whole team for a discount.", channel: "NPS survey", sentiment: "NEU", score: -0.2, theme: "Payment & Billing", featureArea: "Pricing Plans", customerLabel: "Team Admin" },
    { content: "Updating billing email contact is broken. It throws an unhandled server exception every time.", channel: "Support ticket", sentiment: "NEG", score: -0.6, theme: "Payment & Billing", featureArea: "Account Settings", customerLabel: "Mid-Market Customer" },

    // Onboarding & UX
    { content: "Onboarding took forever — I couldn't figure out how to invite my team members without reading 4 help docs.", channel: "Support ticket", sentiment: "NEG", score: -0.6, theme: "Onboarding & UX", featureArea: "Team Setup", customerLabel: "New Workspace Creator" },
    { content: "The new user walkthrough wizard is so helpful! Guided me right to setting up my first workspace in under 2 minutes.", channel: "App store review", sentiment: "POS", score: 0.9, theme: "Onboarding & UX", featureArea: "Onboarding Flow", customerLabel: "Verified Reviewer" },
    { content: "Initial setup screen freezes on step 2 when selecting workspace timezone. Had to refresh twice.", channel: "Community post", sentiment: "NEG", score: -0.5, theme: "Onboarding & UX", featureArea: "Onboarding Flow", customerLabel: "Community Member" },
    { content: "Love how clean and intuitive the dashboard layout is. Super easy to get started with no training required.", channel: "NPS survey", sentiment: "POS", score: 0.85, theme: "Onboarding & UX", featureArea: "Dashboard UI", customerLabel: "Product Manager" },
    { content: "Empty state illustrations and tooltips make onboarding feel seamless and modern.", channel: "Community post", sentiment: "POS", score: 0.8, theme: "Onboarding & UX", featureArea: "UI Component Library", customerLabel: "UI Designer" },

    // Performance & Latency
    { content: "The new dashboard is gorgeous and finally fast. Huge improvement over last month's slowness!", channel: "App store review", sentiment: "POS", score: 0.9, theme: "Performance & Latency", featureArea: "Dashboard UI", customerLabel: "Power User" },
    { content: "Data exports take more than 45 seconds to generate when filtering over 5,000 feedback records.", channel: "Support ticket", sentiment: "NEG", score: -0.65, theme: "Performance & Latency", featureArea: "Export Service", customerLabel: "Analytics Lead" },
    { content: "Loading charts on the analytics page feels laggy on Safari browser. It takes 5+ seconds to render.", channel: "Community post", sentiment: "NEG", score: -0.55, theme: "Performance & Latency", featureArea: "Analytics Charts", customerLabel: "Mac User" },
    { content: "Noticeable speedup in page transitions after the recent v1.2 release. Everything feels snappy!", channel: "NPS survey", sentiment: "POS", score: 0.8, theme: "Performance & Latency", featureArea: "Core App Performance", customerLabel: "Founder" },

    // Mobile Experience
    { content: "It does the job, but the mobile experience needs work. Table columns get clipped on iPhone 14 screens.", channel: "NPS survey", sentiment: "NEU", score: 0.1, theme: "Mobile Experience", featureArea: "Mobile Web View", customerLabel: "Mobile Analyst" },
    { content: "Cannot tap the status dropdown on mobile Safari because the tap target is too tiny.", channel: "Support ticket", sentiment: "NEG", score: -0.5, theme: "Mobile Experience", featureArea: "Inbox Triage", customerLabel: "On-the-go PM" },
    { content: "Mobile navigation drawer doesn't close after selecting a menu route.", channel: "Community post", sentiment: "NEG", score: -0.4, theme: "Mobile Experience", featureArea: "Navigation Header", customerLabel: "Beta Tester" },

    // Integrations & API
    { content: "Love the new CSV bulk export feature, saved me an hour of manual data formatting today!", channel: "Community post", sentiment: "POS", score: 0.95, theme: "Integrations & API", featureArea: "Data Import/Export", customerLabel: "Operations Mgr" },
    { content: "We urgently need a native Zendesk integration. Importing CSV manually every Monday is tedious.", channel: "Sales call note", sentiment: "NEU", score: -0.3, theme: "Integrations & API", featureArea: "Integrations", customerLabel: "Prospect: HealthTech Corp" },
    { content: "API webhook rate limit is too restrictive (100 req/min). We hit throttles during peak hours.", channel: "Support ticket", sentiment: "NEG", score: -0.6, theme: "Integrations & API", featureArea: "REST API", customerLabel: "Developer User" },

    // Security & Auth
    { content: "Please add two-factor authentication (2FA) via authenticator app. Required by our compliance policy.", channel: "Support ticket", sentiment: "NEU", score: 0.0, theme: "Security & Auth", featureArea: "User Security", customerLabel: "Security Officer" },
    { content: "Role-based permissions work great! Finally able to give read-only access to our executive board without risking edits.", channel: "NPS survey", sentiment: "POS", score: 0.9, theme: "Security & Auth", featureArea: "RBAC", customerLabel: "VP of Product" },
  ];

  // We generate 120 items by repeating & randomizing dates over the last 30 days
  const now = new Date();
  const feedbackItemsToInsert = [];

  for (let i = 0; i < 125; i++) {
    const base = rawFeedbackList[i % rawFeedbackList.length];
    // Random date within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000));
    
    // Status distribution
    const statuses = ['NEW', 'REVIEWED', 'ACTIONED'];
    const status = statuses[i % 3];

    feedbackItemsToInsert.push({
      content: base.content + (i > rawFeedbackList.length ? ` (Reference #${1000 + i})` : ''),
      channel: base.channel,
      customerLabel: base.customerLabel,
      sourceRef: `REF-${2000 + i}`,
      sentiment: base.sentiment,
      sentimentScore: base.score,
      status,
      featureArea: base.featureArea,
      rationale: `Classified based on keywords and sentiment indicator in feedback body.`,
      workspaceId: workspace.id,
      createdAt,
      themeName: base.theme,
    });
  }

  console.log(`Inserting ${feedbackItemsToInsert.length} feedback items...`);

  for (const item of feedbackItemsToInsert) {
    const { themeName, ...feedbackData } = item;
    const createdFeedback = await prisma.feedback.create({
      data: feedbackData,
    });

    // Connect to theme
    const themeObj = themes[themeName];
    if (themeObj) {
      await prisma.feedbackTheme.create({
        data: {
          feedbackId: createdFeedback.id,
          themeId: themeObj.id,
          confidence: 0.92,
        },
      });
    }

    // Create lightweight keyword vector JSON for Ask LOOP semantic search grounding
    const keywords = feedbackData.content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);
      
    await prisma.embedding.create({
      data: {
        feedbackId: createdFeedback.id,
        vectorJson: JSON.stringify(Array.from(new Set(keywords))),
      },
    });
  }

  console.log('Successfully seeded database with 125 feedback items & embeddings!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
