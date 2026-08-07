'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, Sparkles, ShieldCheck, BarChart3, Bot, FileText, Cpu, CheckCircle2, Zap, Radio, Terminal, Database } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-between relative overflow-hidden cyber-grid-bg font-sans">
      {/* Dynamic Background Glow Spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between z-10 max-w-7xl mx-auto w-full font-mono">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/40">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tight text-white">LOOP INTELLIGENCE</span>
            <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase">AUTONOMOUS FEEDBACK PLATFORM</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition-all hover:border-cyan-400/50"
          >
            SIGN IN
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-95 text-xs font-bold text-white shadow-xl shadow-cyan-500/30 transition-all border border-cyan-300/40"
          >
            CREATE WORKSPACE
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 text-center space-y-8 z-10 my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.25)]">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          AUTONOMOUS AI VOICE-OF-CUSTOMER PLATFORM
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight text-white">
          Close the Loop on Feedback with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-400 font-mono">
            Autonomous AI Intelligence
          </span>
        </h1>

        <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
          Centralize support tickets, App Store reviews, NPS surveys, and sales notes. AI automatically classifies sentiment, clusters emerging trends, answers grounded queries via RAG, and generates 1-click executive digests.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 font-mono">
          <Link
            href="/login"
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-3 transition-all hover:scale-105 border border-cyan-300/40"
          >
            <span>LAUNCH DEMO WORKSPACE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 font-bold text-sm text-slate-200 transition-all hover:border-slate-600"
          >
            REGISTER NEW WORKSPACE
          </Link>
        </div>

        {/* Interactive Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pt-12 text-left font-sans">
          <div className="cyber-card p-6 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1 font-mono">Multi-Tenant RBAC</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Isolated workspace data with Admin, Analyst, and Viewer permissions.</p>
          </div>

          <div className="cyber-card p-6 rounded-2xl border border-slate-800">
            <BarChart3 className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1 font-mono">Auto-Classification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Structured sentiment, score, theme tags, and feature area detection.</p>
          </div>

          <div className="cyber-card p-6 rounded-2xl border border-slate-800">
            <Terminal className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1 font-mono">Ask LOOP Grounded Q&A</h3>
            <p className="text-xs text-slate-400 leading-relaxed">RAG semantic search answering questions with direct source citations.</p>
          </div>

          <div className="cyber-card p-6 rounded-2xl border border-slate-800">
            <FileText className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1 font-mono">VoC Executive Reports</h3>
            <p className="text-xs text-slate-400 leading-relaxed">1-click weekly digests with complaints, feature requests, and PDF export.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-slate-800/80 text-center text-xs font-mono text-slate-400">
        LOOP INTELLIGENCE SYSTEM · AUTONOMOUS AI FEEDBACK ENGINE · BUILT WITH NEXT.JS 14, TYPESCRIPT & PRISMA
      </footer>
    </div>
  );
}
