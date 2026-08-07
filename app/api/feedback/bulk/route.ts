import { NextResponse } from 'next/server';
import { getAuthSession, hasRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { classifyFeedback } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!hasRole(role, ['ADMIN', 'ANALYST'])) {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot import feedback' }, { status: 403 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const body = await req.json();

    const { items, type } = body; // type can be 'csv' or 'simulate'

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No feedback items provided' }, { status: 400 });
    }

    const existingThemes = await db.theme.findMany({ where: { workspaceId } });
    const themeNames = existingThemes.map((t) => t.name);

    let importedCount = 0;
    let failedCount = 0;

    for (const raw of items) {
      try {
        const content = raw.content || raw.feedback || raw.text;
        const channel = raw.channel || (type === 'simulate' ? 'Zendesk Integration' : 'CSV Import');
        const customerLabel = raw.customer_label || raw.customerLabel || raw.email || null;

        if (!content || typeof content !== 'string' || content.trim().length < 3) {
          failedCount++;
          continue;
        }

        // Run classification
        const classification = await classifyFeedback(content, themeNames);

        const feedback = await db.feedback.create({
          data: {
            content: content.trim(),
            channel,
            customerLabel,
            sourceRef: raw.sourceRef || `BULK-${Math.floor(Math.random() * 10000)}`,
            sentiment: classification.sentiment,
            sentimentScore: classification.sentimentScore,
            featureArea: classification.featureArea,
            rationale: classification.rationale,
            status: 'NEW',
            workspaceId,
          },
        });

        // Link themes
        for (const themeName of classification.themes) {
          let themeObj = existingThemes.find((t) => t.name.toLowerCase() === themeName.toLowerCase());
          if (!themeObj) {
            themeObj = await db.theme.create({
              data: {
                name: themeName,
                workspaceId,
              },
            });
            existingThemes.push(themeObj);
          }

          await db.feedbackTheme.create({
            data: {
              feedbackId: feedback.id,
              themeId: themeObj.id,
              confidence: 0.9,
            },
          });
        }

        // Embed
        const keywords = content
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter((w: string) => w.length > 3);

        await db.embedding.create({
          data: {
            feedbackId: feedback.id,
            vectorJson: JSON.stringify(Array.from(new Set(keywords))),
          },
        });

        importedCount++;
      } catch (err) {
        console.error('Failed to import row:', err);
        failedCount++;
      }
    }

    return NextResponse.json({
      message: `Bulk import completed`,
      importedCount,
      failedCount,
      totalProcessed: items.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
