'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Search,
  Filter,
  Plus,
  Upload,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Tag,
  MessageSquare,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';
import Papa from 'papaparse';

export default function InboxPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isViewer = user?.role === 'VIEWER';

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('ALL');
  const [sentiment, setSentiment] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  // Modals
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Forms
  const [singleForm, setSingleForm] = useState({
    content: '',
    channel: 'Support ticket',
    customerLabel: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [reclassifyingId, setReclassifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback(pagination.page);
  }, [pagination.page, search, channel, sentiment, status]);

  const fetchFeedback = async (page: number = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search,
        channel,
        sentiment,
        status,
      });
      const res = await fetch(`/api/feedback?${query}`);
      const data = await res.json();
      setItems(data.items || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (isViewer) return;
    try {
      const res = await fetch(`/api/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setItems(items.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleReclassify = async (id: string) => {
    if (isViewer) return;
    setReclassifyingId(id);
    try {
      const res = await fetch(`/api/feedback/${id}/reclassify`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchFeedback(pagination.page);
      }
    } catch (err) {
      console.error('Reclassify failed:', err);
    } finally {
      setReclassifyingId(null);
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleForm),
      });
      if (res.ok) {
        setIsSingleModalOpen(false);
        setSingleForm({ content: '', channel: 'Support ticket', customerLabel: '' });
        fetchFeedback(1);
      }
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile || isViewer) return;
    setSubmitting(true);
    setImportSummary(null);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch('/api/feedback/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: results.data, type: 'csv' }),
          });
          const summary = await res.json();
          setImportSummary(summary);
          fetchFeedback(1);
        } catch (err) {
          console.error('CSV import failed:', err);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleSimulateIntegration = async () => {
    if (isViewer) return;
    setLoading(true);
    const sampleItems = [
      { content: "Zendesk Sync: User requested dark mode setting for the dashboard UI.", channel: "Zendesk Integration", customerLabel: "Zendesk Ticket #892" },
      { content: "AppStore Sync: 1-star review: Payment checkout failed with error code 500 on iOS 17.", channel: "AppStore Sync", customerLabel: "App Store User" },
      { content: "Intercom Chat: Customer asked if SAML / SSO login is supported for enterprise plan.", channel: "Intercom Live Chat", customerLabel: "Enterprise Prospect" },
    ];
    try {
      await fetch('/api/feedback/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: sampleItems, type: 'simulate' }),
      });
      fetchFeedback(1);
    } catch (err) {
      console.error('Simulate failed:', err);
    }
  };

  const sentimentBadges: Record<string, string> = {
    POS: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-mono shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    NEU: 'bg-slate-500/10 text-slate-300 border-slate-500/40 font-mono',
    NEG: 'bg-red-500/10 text-red-300 border-red-500/40 font-mono shadow-[0_0_10px_rgba(239,68,68,0.2)]',
  };

  const statusColors: Record<string, string> = {
    NEW: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40 font-mono',
    REVIEWED: 'bg-amber-500/10 text-amber-300 border-amber-500/40 font-mono',
    ACTIONED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-mono',
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-950/90 border border-cyan-500/40 px-2.5 py-0.5 rounded-full uppercase shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              FEEDBACK TRIAGE CENTER
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
            Feedback Inbox & AI Classification
          </h1>
          <p className="text-slate-400 text-xs font-mono">
            Search, filter, and action customer feedback streams with autonomous AI tagging
          </p>
        </div>

        {!isViewer && (
          <div className="flex items-center gap-2 flex-wrap font-mono">
            <button
              onClick={handleSimulateIntegration}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all hover:border-amber-500/50"
              title="Simulate Channel Import"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              SIMULATE INTEGRATION
            </button>

            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all hover:border-cyan-500/50"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              CSV UPLOAD
            </button>

            <button
              onClick={() => setIsSingleModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition-all border border-cyan-300/40"
            >
              <Plus className="w-4 h-4" />
              ADD FEEDBACK
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="cyber-glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search feedback content, feature areas, or customer labels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto font-mono text-xs">
          {/* Channel filter */}
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Channels</option>
            <option value="Support ticket">Support Ticket</option>
            <option value="App store review">App Store Review</option>
            <option value="NPS survey">NPS Survey</option>
            <option value="Sales call note">Sales Call Note</option>
            <option value="Community post">Community Post</option>
          </select>

          {/* Sentiment filter */}
          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Sentiments</option>
            <option value="POS">Positive</option>
            <option value="NEU">Neutral</option>
            <option value="NEG">Negative</option>
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ACTIONED">Actioned</option>
          </select>
        </div>
      </div>

      {/* Feedback Data Table */}
      <div className="cyber-glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">Loading feedback stream...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-bold font-mono">No feedback records found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-mono">
              Try adjusting your search query or filters, or import feedback using the CSV / Single entry buttons.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070c1a] text-slate-400 font-mono text-[11px] uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4">Feedback Content</th>
                  <th className="py-4 px-4">Channel & Source</th>
                  <th className="py-4 px-4">Sentiment & Clusters</th>
                  <th className="py-4 px-4">Status</th>
                  {!isViewer && <th className="py-4 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 px-4 max-w-md">
                      <p className="text-slate-100 font-medium line-clamp-2 leading-relaxed">{item.content}</p>
                      {item.featureArea && (
                        <span className="inline-block mt-1.5 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-500/40">
                          {item.featureArea}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-mono">
                      <span className="font-bold text-slate-200 block text-xs">{item.channel}</span>
                      <span className="text-[11px] text-slate-400">{item.customerLabel || 'Anonymous Customer'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${sentimentBadges[item.sentiment]}`}>
                          {item.sentiment} ({item.sentimentScore > 0 ? `+${item.sentimentScore}` : item.sentimentScore})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 font-mono">
                        {item.feedbackThemes?.map((ft: any) => (
                          <span key={ft.theme.id} className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {ft.theme.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-mono">
                      {isViewer ? (
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                      ) : (
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold bg-slate-900 cursor-pointer focus:outline-none ${statusColors[item.status]}`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="REVIEWED">REVIEWED</option>
                          <option value="ACTIONED">ACTIONED</option>
                        </select>
                      )}
                    </td>
                    {!isViewer && (
                      <td className="py-4 px-4 text-right whitespace-nowrap font-mono">
                        <button
                          onClick={() => handleReclassify(item.id)}
                          disabled={reclassifyingId === item.id}
                          className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition-all inline-flex items-center gap-1.5"
                          title="Re-run AI auto-classification"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${reclassifyingId === item.id ? 'animate-spin' : ''}`} />
                          RE-CLASSIFY
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        <div className="p-4 bg-[#070c1a] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Showing <span className="font-bold text-slate-200">{items.length}</span> of{' '}
            <span className="font-bold text-slate-200">{pagination.total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              className="p-2 rounded-lg border border-slate-700 bg-slate-900 disabled:opacity-40 hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-slate-300 font-bold">
              PAGE {pagination.page} OF {pagination.totalPages || 1}
            </span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              className="p-2 rounded-lg border border-slate-700 bg-slate-900 disabled:opacity-40 hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Single Entry Modal */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="cyber-glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4 font-mono">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              ADD CUSTOMER FEEDBACK
            </h2>
            <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Channel Source</label>
                <select
                  value={singleForm.channel}
                  onChange={(e) => setSingleForm({ ...singleForm, channel: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="Support ticket">Support Ticket</option>
                  <option value="App store review">App Store Review</option>
                  <option value="NPS survey">NPS Survey</option>
                  <option value="Sales call note">Sales Call Note</option>
                  <option value="Community post">Community Post</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Customer Label / ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Admin or user@loop.com"
                  value={singleForm.customerLabel}
                  onChange={(e) => setSingleForm({ ...singleForm, customerLabel: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Feedback Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste raw customer feedback text here..."
                  value={singleForm.content}
                  onChange={(e) => setSingleForm({ ...singleForm, content: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 border border-cyan-300/40"
                >
                  <Sparkles className="w-4 h-4" />
                  {submitting ? 'CLASSIFYING...' : 'SAVE & AI CLASSIFY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="cyber-glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4 font-mono">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              CSV BULK IMPORT
            </h2>
            <p className="text-xs text-slate-400">
              Upload a CSV file containing <code className="text-cyan-300">content</code>, <code className="text-cyan-300">channel</code>, and optional <code className="text-cyan-300">customer_label</code> columns.
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
            />

            {importSummary && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                <p className="font-bold">Import Summary:</p>
                <p>• Imported: {importSummary.importedCount} items</p>
                <p>• Failed: {importSummary.failedCount} items</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsCsvModalOpen(false);
                  setImportSummary(null);
                  setCsvFile(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
              >
                CLOSE
              </button>
              <button
                type="button"
                disabled={!csvFile || submitting}
                onClick={handleCsvUpload}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {submitting ? 'CLASSIFYING...' : 'START IMPORT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
