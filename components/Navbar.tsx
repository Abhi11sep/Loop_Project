'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Layers, LogOut, ShieldCheck, Cpu, Radio, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const roleBadgeStyles: Record<string, string> = {
    ADMIN: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    ANALYST: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    VIEWER: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#070c1a]/90 backdrop-blur-2xl sticky top-0 z-50 px-6 flex items-center justify-between cyber-grid-bg">
      {/* Brand & Ticker */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-all border border-cyan-300/40">
            <Layers className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-[#070c1a] animate-ping" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-white to-purple-300 font-mono">
                LOOP
              </span>
              <span className="text-[9px] font-mono font-black tracking-widest text-cyan-300 bg-cyan-950/90 border border-cyan-500/40 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                COMMAND HUB
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider hidden sm:inline">
              AUTONOMOUS FEEDBACK PLATFORM
            </span>
          </div>
        </Link>

        {/* Live Telemetry Ticker (Hidden on small screens) */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-cyan-400 font-bold">LIVE TELEMETRY:</span>
          <span>125 STREAM RECORDS INGESTED</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">RAG ENGINE 100%</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Workspace:</span>
              <span className="font-bold text-white">Loop Enterprise AI</span>
            </div>

            <span className={`text-xs font-mono font-extrabold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${roleBadgeStyles[user.role] || roleBadgeStyles.VIEWER}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {user.role}
            </span>

            <div className="hidden md:flex flex-col text-right font-mono">
              <span className="text-xs font-bold text-slate-200">{user.name}</span>
              <span className="text-[10px] text-slate-400">{user.email}</span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all"
              title="Sign out of workspace"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
