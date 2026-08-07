'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Download, Sparkles, Plus, Calendar, AlertCircle, CheckCircle2, Quote, ArrowUpRight } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isViewer = user?.role === 'VIEWER';

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<any | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const json = await res.json();
      setReports(json.reports || []);
      if (json.reports && json.reports.length > 0) {
        setActiveReport(json.reports[0]);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (isViewer) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Voice of Customer Executive Report - ${new Date().toLocaleDateString()}` }),
      });
      if (res.ok) {
        const newReport = await res.json();
        setReports([newReport, ...reports]);
        setActiveReport(newReport);
      }
    } catch (err) {
      console.error('Report generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const exportPDF = async () => {
    const input = document.getElementById('voc-report-content');
    if (!input) return;

    try {
      const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#030712' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`VoC-Executive-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  let reportContent: any = null;
  if (activeReport?.contentJson) {
    try {
      reportContent = JSON.parse(activeReport.contentJson);
    } catch (e) {}
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 font-mono">
            <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-950/90 border border-cyan-500/40 px-2.5 py-0.5 rounded-full uppercase shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              EXECUTIVE DIGEST SYNTHESIS
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
            Voice of Customer (VoC) Reports
          </h1>
          <p className="text-slate-400 text-xs font-mono">
            Autonomous weekly executive digests synthesizing complaints, feature requests, and product action plans
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          {activeReport && (
            <button
              onClick={exportPDF}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 flex items-center gap-1.5 transition-all hover:border-cyan-400/50"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              EXPORT PDF
            </button>
          )}

          {!isViewer && (
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white flex items-center gap-2 shadow-xl shadow-cyan-500/25 disabled:opacity-50 transition-all border border-cyan-300/40"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'SYNTHESIZING...' : 'GENERATE NEW DIGEST'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-mono">
        {/* Saved Reports Sidebar List */}
        <div className="cyber-glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 lg:col-span-1">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saved VoC Digests</h3>

          {loading ? (
            <div className="text-xs text-slate-500 py-4">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-xs text-slate-500 py-4">No reports generated yet.</div>
          ) : (
            <div className="space-y-2">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setActiveReport(rep)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    activeReport?.id === rep.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border-cyan-400/40 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <p className="line-clamp-1 leading-snug">{rep.title}</p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Main Document View */}
        <div className="lg:col-span-3 font-sans">
          {!reportContent ? (
            <div className="cyber-glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3 font-mono">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-bold">Select or Generate a VoC Report</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click "GENERATE NEW DIGEST" to create a fresh executive Voice of Customer report.
              </p>
            </div>
          ) : (
            <div id="voc-report-content" className="cyber-glass-panel p-8 rounded-2xl border border-slate-800 space-y-8 bg-[#030712]">
              {/* Report Header */}
              <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 uppercase">
                    EXECUTIVE INTELLIGENCE DIGEST
                  </span>
                  <h2 className="text-2xl font-black text-white tracking-tight mt-2">{reportContent.reportTitle}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Generated by {activeReport.generatedBy?.name || 'AI Engine'} on{' '}
                    {new Date(activeReport.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Key Highlights Metrics Bar */}
              {reportContent.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Analyzed</span>
                    <span className="text-xl font-black text-white">{reportContent.metrics.totalFeedback}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Positive Sentiment</span>
                    <span className="text-xl font-black text-emerald-400">{reportContent.metrics.positivePercentage}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Negative Sentiment</span>
                    <span className="text-xl font-black text-red-400">{reportContent.metrics.negativePercentage}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Weekly Shift</span>
                    <span className="text-xs font-bold text-cyan-300">{reportContent.metrics.sentimentShift}</span>
                  </div>
                </div>
              )}

              {/* Top Complaints Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  Top Customer Complaints & Friction Points
                </h3>
                <div className="space-y-2">
                  {reportContent.topComplaints?.map((c: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-300 font-bold font-mono">
                        <span className="text-red-400 font-bold">{c.issue}</span>
                        <span className="text-[10px] text-slate-500">{c.channel}</span>
                      </div>
                      <p className="text-slate-300 italic">"{c.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Feature Requests Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Top Requested & Praised Features
                </h3>
                <div className="space-y-2">
                  {reportContent.topFeatures?.map((f: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-300 font-bold font-mono">
                        <span className="text-emerald-400 font-bold">{f.feature}</span>
                        <span className="text-[10px] text-slate-500">{f.channel}</span>
                      </div>
                      <p className="text-slate-300 italic">"{f.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action Plan */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Recommended Action Plan for Product Team
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                  {reportContent.recommendedActions?.map((act: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-300">{act.action}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          act.priority === 'HIGH' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {act.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{act.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
