'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Flame, Layers, ArrowUpRight, MessageSquare, AlertTriangle, ShieldCheck, ChevronRight, Activity } from 'lucide-react';

export default function TrendsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<any | null>(null);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trends');
      const json = await res.json();
      setTrends(json.trends || []);
    } catch (err) {
      console.error('Failed to load theme trends:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-950/90 border border-cyan-500/40 px-2.5 py-0.5 rounded-full uppercase shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            CLUSTER & ANOMALY RADAR
          </span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
          Theme Clustering & Trend Spikes
        </h1>
        <p className="text-slate-400 text-xs font-mono">
          Autonomous AI groups feedback streams into emergent topic clusters and flags volume anomalies
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-60 bg-slate-900/80 rounded-2xl border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map((theme) => (
            <div
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={`cyber-card p-6 rounded-2xl border cursor-pointer relative overflow-hidden transition-all hover:scale-[1.02] ${
                theme.isSpiking
                  ? 'border-amber-500/60 bg-gradient-to-b from-amber-500/15 via-slate-900/80 to-slate-950/95 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                  : 'border-slate-800'
              }`}
            >
              {/* Spiking Badge */}
              {theme.isSpiking && (
                <div className="absolute top-4 right-4 bg-amber-500/15 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  SPIKE DETECTED (+{theme.growthPercent}%)
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md border border-white/20"
                  style={{ backgroundColor: theme.color || '#6366f1' }}
                >
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight font-mono">{theme.name}</h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {theme.totalCount} Ingested Items
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">{theme.description}</p>

              {/* Volume Delta stats */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs mb-4 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Past 7 Days</span>
                  <span className="font-bold text-white text-sm">{theme.currentPeriodCount} items</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Prev 7 Days</span>
                  <span className="font-bold text-slate-400 text-sm">{theme.previousPeriodCount} items</span>
                </div>
              </div>

              {/* Sample Verbatim Quote */}
              {theme.sampleFeedback?.[0] && (
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[11px] text-slate-300 italic mb-3 font-sans">
                  "{theme.sampleFeedback[0].content}"
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-xs font-mono text-cyan-300 font-bold">
                <span>INSPECT CLUSTER RECORDS</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drill-down Theme Modal */}
      {selectedTheme && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="cyber-glass-panel w-full max-w-2xl p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
                  CLUSTER DRILL-DOWN TELEMETRY
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedTheme.name}</h2>
              </div>
              <button
                onClick={() => setSelectedTheme(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                CLOSE
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedTheme.description}</p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sample Feedback Items in this Cluster:
              </h4>
              {selectedTheme.sampleFeedback?.map((item: any) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-sans">
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">"{item.content}"</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Source: <strong className="text-slate-300">{item.channel}</strong></span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      item.sentiment === 'POS' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
