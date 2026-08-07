import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = signupSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    // Create Workspace and Admin User in transaction
    const result = await db.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: validated.companyName,
        },
      });

      const user = await tx.user.create({
        data: {
          name: validated.name,
          email: validated.email,
          passwordHash,
          role: 'ADMIN',
          workspaceId: workspace.id,
        },
      });

      // Default Seed Themes
      const themes = [
        { name: 'Onboarding & UX', description: 'Signup, initial setup, navigation friction', color: '#6366f1' },
        { name: 'Payment & Billing', description: 'Invoices, payment failures, subscription pricing', color: '#ef4444' },
        { name: 'Performance & Latency', description: 'App speed, loading times, timeout errors', color: '#f59e0b' },
        { name: 'Integrations & API', description: 'APIs, CSV export, third-party tools', color: '#10b981' },
        { name: 'Mobile Experience', description: 'Mobile web responsiveness and touch UI', color: '#8b5cf6' },
      ];

      for (const t of themes) {
        await tx.theme.create({
          data: {
            ...t,
            workspaceId: workspace.id,
          },
        });
      }

      return { user, workspace };
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        userId: result.user.id,
        workspaceId: result.workspace.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
