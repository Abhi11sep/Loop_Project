import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession, hasRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { classifyFeedback } from '@/lib/ai';

const feedbackSchema = z.object({
  content: z.string().min(3, 'Feedback content is required'),
  channel: z.string().min(1, 'Channel is required'),
  customerLabel: z.string().optional(),
  sourceRef: z.string().optional(),
});

// GET /api/feedback - Search, Filter, Paginated Inbox List
export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    const search = searchParams.get('search') || '';
    const channel = searchParams.get('channel') || '';
    const sentiment = searchParams.get('sentiment') || '';
    const status = searchParams.get('status') || '';
    const themeId = searchParams.get('themeId') || '';

    // Scope query strictly to user's workspaceId
    const where: any = {
      workspaceId,
    };

    if (search) {
      where.OR = [
        { content: { contains: search } },
        { customerLabel: { contains: search } },
        { featureArea: { contains: search } },
      ];
    }

    if (channel && channel !== 'ALL') {
      where.channel = channel;
    }

    if (sentiment && sentiment !== 'ALL') {
      where.sentiment = sentiment;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (themeId && themeId !== 'ALL') {
      where.feedbackThemes = {
        some: {
          themeId,
        },
      };
    }

    const [items, total] = await Promise.all([
      db.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          feedbackThemes: {
            include: {
              theme: true,
            },
          },
        },
      }),
      db.feedback.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/feedback - Ingest Single Feedback (Analyst/Admin only)
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!hasRole(role, ['ADMIN', 'ANALYST'])) {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot create feedback' }, { status: 403 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const body = await req.json();
    const validated = feedbackSchema.parse(body);

    // Get existing workspace themes
    const existingThemes = await db.theme.findMany({
      where: { workspaceId },
    });
    const themeNames = existingThemes.map((t) => t.name);

    // AI Classification
    const classification = await classifyFeedback(validated.content, themeNames);

    // Save Feedback record scoped to workspaceId
    const feedback = await db.feedback.create({
      data: {
        content: validated.content,
        channel: validated.channel,
        customerLabel: validated.customerLabel || null,
        sourceRef: validated.sourceRef || null,
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
      }

      await db.feedbackTheme.create({
        data: {
          feedbackId: feedback.id,
          themeId: themeObj.id,
          confidence: 0.9,
        },
      });
    }

    // Generate Embedding vector
    const keywords = validated.content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    await db.embedding.create({
      data: {
        feedbackId: feedback.id,
        vectorJson: JSON.stringify(Array.from(new Set(keywords))),
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
