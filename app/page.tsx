'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, Sparkles, Shield, BarChart3, MessageSquare, Bot, FileText } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">Project LOOP</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            Create Workspace
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center space-y-8 z-10 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Corporate-Grade AI Feedback Intelligence Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
          Close the Loop on Customer Feedback with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">AI Intelligence</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Ingest support tickets, reviews, NPS surveys, and sales notes into one centralized system. Let AI automatically classify sentiment, cluster emerging trends, answer grounded questions, and generate Voice-of-Customer executive digests.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span>Explore Demo Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 font-bold text-sm text-slate-200 transition-all"
          >
            Register New Company
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-12 text-left">
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <Shield className="w-6 h-6 text-purple-400 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Multi-Tenant RBAC</h3>
            <p className="text-xs text-slate-400">Isolated workspace data with Admin, Analyst, and Viewer permissions.</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <BarChart3 className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Auto-Classification</h3>
            <p className="text-xs text-slate-400">Structured sentiment, score, theme tags, and feature area detection.</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <Bot className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Ask LOOP Grounded Q&A</h3>
            <p className="text-xs text-slate-400">RAG semantic search answering questions with direct source citations.</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <FileText className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">VoC Executive Reports</h3>
            <p className="text-xs text-slate-400">1-click weekly digests with complaints, feature requests, and PDF export.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        Project LOOP — AI Customer-Feedback Intelligence Platform · Built with Next.js 14, TypeScript & Prisma
      </footer>
    </div>
  );
}
