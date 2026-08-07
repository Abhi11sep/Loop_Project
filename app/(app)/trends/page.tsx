'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Flame, Layers, ArrowUpRight, MessageSquare, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Theme Clustering & Trend Spikes
        </h1>
        <p className="text-slate-400 text-sm">
          AI automatically groups customer feedback into themes and highlights emerging spikes
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map((theme) => (
            <div
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={`glass-card p-6 rounded-2xl border cursor-pointer relative overflow-hidden transition-all hover:scale-[1.02] ${
                theme.isSpiking
                  ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-slate-900/60'
                  : 'border-slate-800'
              }`}
            >
              {/* Spiking Badge */}
              {theme.isSpiking && (
                <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                  Spike Detected (+{theme.growthPercent}%)
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md"
                  style={{ backgroundColor: theme.color || '#6366f1' }}
                >
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{theme.name}</h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {theme.totalCount} Total Feedback Items
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-4 line-clamp-2">{theme.description}</p>

              {/* Volume Delta stats */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs mb-4">
                <div>
                  <span className="text-[11px] text-slate-500 block">Past 7 Days</span>
                  <span className="font-bold text-white text-sm">{theme.currentPeriodCount} items</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Prev 7 Days</span>
                  <span className="font-bold text-slate-400 text-sm">{theme.previousPeriodCount} items</span>
                </div>
              </div>

              {/* Sample Verbatim Quote */}
              {theme.sampleFeedback?.[0] && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 italic mb-3">
                  "{theme.sampleFeedback[0].content}"
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-xs text-indigo-400 font-semibold">
                <span>View all items</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drill-down Theme Modal */}
      {selectedTheme && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                  Theme Drill-Down
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedTheme.name}</h2>
              </div>
              <button
                onClick={() => setSelectedTheme(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300">{selectedTheme.description}</p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Sample Feedback Items in this Cluster:
              </h4>
              {selectedTheme.sampleFeedback?.map((item: any) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">"{item.content}"</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Source: <strong className="text-slate-300">{item.channel}</strong></span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      item.sentiment === 'POS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
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
