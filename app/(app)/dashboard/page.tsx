'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
  Activity,
  Zap,
  CheckCircle2,
  Radio,
  Cpu,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState('30');

  useEffect(() => {
    fetchDashboardData(rangeDays);
  }, [rangeDays]);

  const fetchDashboardData = async (days: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-slate-900/90 rounded-xl border border-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-slate-900/80 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-88 bg-slate-900/80 rounded-2xl border border-slate-800" />
          <div className="h-88 bg-slate-900/80 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  const { stats, volumeOverTime, sentimentBreakdown, topThemes } = data;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Telemetry Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-950/90 border border-cyan-500/40 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              EXECUTIVE TELEMETRY HUB
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
            Feedback Intelligence Dashboard
          </h1>
          <p className="text-slate-400 text-xs font-mono">
            Real-time multi-channel sentiment signals, volume spikes, and theme distribution
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#0b101e] p-1.5 rounded-xl border border-slate-800 font-mono">
          <Calendar className="w-4 h-4 text-cyan-400 ml-2" />
          {['7', '30', '90'].map((d) => (
            <button
              key={d}
              onClick={() => setRangeDays(d)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                rangeDays === d
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-300/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {d === '7' ? '7 DAYS' : d === '30' ? '30 DAYS' : '90 DAYS'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="cyber-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">Total Feedback Ingested</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-white font-mono tracking-tight">{stats.totalItems}</div>
          <div className="text-xs text-cyan-300 font-mono font-bold mt-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 inline text-cyan-400 animate-pulse" />
            <span>Multi-channel stream active</span>
          </div>
        </div>

        <div className="cyber-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">Negative Friction Ratio</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center shadow-md">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-red-400 font-mono tracking-tight">{stats.percentNegative}%</div>
          <div className="text-xs text-slate-400 font-mono mt-2">
            <span className="text-red-400 font-bold">{stats.negativeCount} items</span> requiring product action
          </div>
        </div>

        <div className="cyber-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">Positive User Sentiment</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-emerald-400 font-mono tracking-tight">{stats.percentPositive}%</div>
          <div className="text-xs text-slate-400 font-mono mt-2">
            <span className="text-emerald-400 font-bold">{stats.positiveCount} items</span> satisfied users
          </div>
        </div>

        <div className="cyber-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">Triage Queue</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-purple-300 font-mono tracking-tight">{stats.newThisWeek}</div>
          <div className="text-xs text-slate-400 font-mono mt-2">Queued for AI classification</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback Volume Over Time Chart */}
        <div className="lg:col-span-2 cyber-glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-white font-mono flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Feedback Volume Trajectory
              </h2>
              <p className="text-xs text-slate-400 font-mono">Daily sentiment distribution across ingested channels</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b101e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPos)" name="Positive" />
                <Area type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNeg)" name="Negative" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Breakdown Donut Chart */}
        <div className="cyber-glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-white font-mono mb-1">Sentiment Radar Matrix</h2>
            <p className="text-xs text-slate-400 font-mono mb-4">Auto-classified sentiment breakdown</p>
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {sentimentBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#030712" strokeWidth={3} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b101e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 text-center font-mono">
            {sentimentBreakdown.map((item: any) => (
              <div key={item.name}>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{item.name}</span>
                <span className="text-base font-black text-white" style={{ color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Themes Bar Chart */}
      <div className="cyber-glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-white font-mono">Top Feedback Topic Clusters</h2>
            <p className="text-xs text-slate-400 font-mono">Most frequent themes detected across all integrated channels</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topThemes} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={140} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b101e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[0, 8, 8, 0]} name="Feedback Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
