'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layers, ShieldCheck, ArrowRight, Lock, KeyRound, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const fillQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden tech-grid-pattern">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-cyan-500/30 border border-cyan-400/30">
              <Layers className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">LOOP INTELLIGENCE</h1>
          <p className="text-slate-400 text-xs font-mono">ENTERPRISE AI FEEDBACK PLATFORM</p>
        </div>

        <div className="glass-panel-tech p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@loop.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-95 font-mono font-bold text-white text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 border border-cyan-400/30"
            >
              {loading ? 'Authenticating...' : 'AUTHENTICATE WORKSPACE'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins section */}
          <div className="pt-5 border-t border-slate-800/80">
            <p className="text-[11px] font-mono font-bold text-slate-400 mb-3 text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              1-Click Demo Accounts (@loop.com)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@loop.com')}
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold transition-all text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('analyst@loop.com')}
                className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold transition-all text-center"
              >
                Analyst
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('viewer@loop.com')}
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold transition-all text-center"
              >
                Viewer
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-400 text-center mt-3">
              Default Password: <code className="text-cyan-400 font-bold">password123</code>
            </p>
          </div>
        </div>

        <p className="text-center text-xs font-mono text-slate-400">
          Need a new workspace?{' '}
          <Link href="/signup" className="text-cyan-400 font-bold hover:underline">
            Register Workspace
          </Link>
        </p>
      </div>
    </div>
  );
}
