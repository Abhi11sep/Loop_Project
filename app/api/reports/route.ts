import { NextResponse } from 'next/server';
import { getAuthSession, hasRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateVoCReport } from '@/lib/ai';

// GET /api/reports - List saved VoC reports
export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;

    const reports = await db.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: { generatedBy: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/reports - Generate new VoC report
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    if (!hasRole(role, ['ADMIN', 'ANALYST'])) {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot generate reports' }, { status: 403 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const body = await req.json();
    const { title } = body;

    const reportContent = await generateVoCReport(workspaceId, title);

    const now = new Date();
    const periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const report = await db.report.create({
      data: {
        title: reportContent.reportTitle,
        periodStart,
        periodEnd: now,
        contentJson: JSON.stringify(reportContent),
        generatedById: userId,
        workspaceId,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
