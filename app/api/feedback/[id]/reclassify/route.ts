import { NextResponse } from 'next/server';
import { getAuthSession, hasRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { classifyFeedback } from '@/lib/ai';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!hasRole(role, ['ADMIN', 'ANALYST'])) {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot reclassify feedback' }, { status: 403 });
    }

    const workspaceId = (session.user as any).workspaceId;

    const feedback = await db.feedback.findUnique({
      where: { id: params.id },
    });

    if (!feedback || feedback.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Feedback record not found' }, { status: 404 });
    }

    const existingThemes = await db.theme.findMany({ where: { workspaceId } });
    const themeNames = existingThemes.map((t) => t.name);

    // Re-run AI classification
    const classification = await classifyFeedback(feedback.content, themeNames);

    // Remove existing themes for this feedback
    await db.feedbackTheme.deleteMany({
      where: { feedbackId: feedback.id },
    });

    // Update feedback record
    const updated = await db.feedback.update({
      where: { id: feedback.id },
      data: {
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        featureArea: classification.featureArea,
        rationale: classification.rationale,
      },
    });

    // Re-link themes
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
          confidence: 0.95,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
