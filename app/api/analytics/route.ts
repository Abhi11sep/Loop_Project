import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const { searchParams } = new URL(req.url);

    const rangeDays = parseInt(searchParams.get('days') || '30', 10);
    const now = new Date();
    const startDate = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const feedbackList = await db.feedback.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        feedbackThemes: {
          include: {
            theme: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const total = feedbackList.length;
    const positiveCount = feedbackList.filter((f) => f.sentiment === 'POS').length;
    const negativeCount = feedbackList.filter((f) => f.sentiment === 'NEG').length;
    const neutralCount = feedbackList.filter((f) => f.sentiment === 'NEU').length;

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newThisWeek = feedbackList.filter((f) => new Date(f.createdAt) >= sevenDaysAgo).length;

    const percentNegative = total > 0 ? Math.round((negativeCount / total) * 100) : 0;
    const percentPositive = total > 0 ? Math.round((positiveCount / total) * 100) : 0;

    // Volume over time
    const dateMap: Record<string, { date: string; total: number; positive: number; negative: number; neutral: number }> = {};

    feedbackList.forEach((item) => {
      const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { date: dateStr, total: 0, positive: 0, negative: 0, neutral: 0 };
      }
      dateMap[dateStr].total += 1;
      if (item.sentiment === 'POS') dateMap[dateStr].positive += 1;
      else if (item.sentiment === 'NEG') dateMap[dateStr].negative += 1;
      else dateMap[dateStr].neutral += 1;
    });

    const volumeOverTime = Object.values(dateMap);

    // Sentiment Breakdown for PieChart
    const sentimentBreakdown = [
      { name: 'Positive', value: positiveCount, color: '#10b981' },
      { name: 'Neutral', value: neutralCount, color: '#6b7280' },
      { name: 'Negative', value: negativeCount, color: '#ef4444' },
    ];

    // Top Themes breakdown
    const themeMap: Record<string, { name: string; count: number; color: string }> = {};

    feedbackList.forEach((item) => {
      item.feedbackThemes.forEach((ft) => {
        const name = ft.theme.name;
        if (!themeMap[name]) {
          themeMap[name] = { name, count: 0, color: ft.theme.color || '#6366f1' };
        }
        themeMap[name].count += 1;
      });
    });

    const topThemes = Object.values(themeMap).sort((a, b) => b.count - a.count).slice(0, 6);

    // Breakdown by Channel
    const channelMap: Record<string, number> = {};
    feedbackList.forEach((item) => {
      channelMap[item.channel] = (channelMap[item.channel] || 0) + 1;
    });
    const channelBreakdown = Object.entries(channelMap).map(([channel, count]) => ({ channel, count }));

    return NextResponse.json({
      stats: {
        totalItems: total,
        percentNegative,
        percentPositive,
        newThisWeek,
        positiveCount,
        negativeCount,
        neutralCount,
      },
      volumeOverTime,
      sentimentBreakdown,
      topThemes,
      channelBreakdown,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
