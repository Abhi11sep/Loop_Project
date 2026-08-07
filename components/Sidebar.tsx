'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, TrendingUp, Sparkles, FileText, Settings, ShieldAlert, Activity, Database, CheckCircle2, Terminal } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  const navItems = [
    { label: 'Executive Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Feedback Triage Inbox', href: '/inbox', icon: Inbox },
    { label: 'Theme Anomaly Radar', href: '/trends', icon: TrendingUp },
    { label: 'Ask LOOP (AI Terminal)', href: '/ask', icon: Terminal, badge: 'RAG V2' },
    { label: 'VoC Executive Briefings', href: '/reports', icon: FileText },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Team RBAC Settings', href: '/settings', icon: Settings });
  }

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#070c1a]/95 backdrop-blur-2xl flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-4rem)] relative z-20 font-mono">
      <div className="space-y-6">
        <div>
          <div className="px-3 flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-400">
              COMMAND DOCK
            </p>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/10 text-cyan-300 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] font-mono'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="space-y-3">
        {user?.role === 'VIEWER' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2.5 font-mono">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5 uppercase">OBSERVER MODE</span>
              Triage edits restricted.
            </div>
          </div>
        )}

        {/* Cyber Telemetry Box */}
        <div className="p-4 rounded-xl bg-[#0b101e] border border-slate-800 text-xs space-y-2.5 text-slate-400 font-mono shadow-inner">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase font-black text-cyan-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> SYSTEM STATUS
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3 h-3 text-purple-400" /> Vectors
            </span>
            <span className="font-bold text-slate-200">125 Embedded</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
