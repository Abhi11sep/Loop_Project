import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getThemeTrends } from '@/lib/ai';

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const trends = await getThemeTrends(workspaceId);

    return NextResponse.json({ trends });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
