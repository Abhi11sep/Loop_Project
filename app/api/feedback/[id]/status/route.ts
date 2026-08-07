import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession, hasRole } from '@/lib/auth';
import { db } from '@/lib/db';

const statusSchema = z.object({
  status: z.enum(['NEW', 'REVIEWED', 'ACTIONED']),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!hasRole(role, ['ADMIN', 'ANALYST'])) {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot update status' }, { status: 403 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const body = await req.json();
    const validated = statusSchema.parse(body);

    const feedback = await db.feedback.findUnique({
      where: { id: params.id },
    });

    if (!feedback || feedback.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Feedback record not found' }, { status: 404 });
    }

    const updated = await db.feedback.update({
      where: { id: params.id },
      data: { status: validated.status },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
