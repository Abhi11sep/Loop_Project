'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Layers, LogOut, Shield, User, Building2 } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    ANALYST: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    VIEWER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
              LOOP
              <span className="text-[10px] font-semibold tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase">
                AI Intelligence
              </span>
            </span>
          </div>
        </Link>

        {user?.workspaceName && (
          <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800 text-xs text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium text-slate-200">{user.workspaceName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${roleColors[user.role] || roleColors.VIEWER}`}>
              <Shield className="w-3 h-3 inline mr-1" />
              {user.role}
            </span>

            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">{user.name}</span>
              <span className="text-[11px] text-slate-400">{user.email}</span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
