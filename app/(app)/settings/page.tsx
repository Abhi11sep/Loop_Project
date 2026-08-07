'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldCheck, UserPlus, Users, Building2, CheckCircle2, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN';

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ANALYST',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/members');
      const json = await res.json();
      setMembers(json.members || []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/settings/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add team member');

      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'ANALYST' });
      fetchMembers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)] font-mono',
    ANALYST: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-mono',
    VIEWER: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)] font-mono',
  };

  if (!isAdmin) {
    return (
      <div className="cyber-glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3 font-mono">
        <Lock className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white uppercase">Admin Access Restricted</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Only users with the <strong className="text-purple-400">ADMIN</strong> role can manage workspace team members and security permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 font-mono">
            <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-950/90 border border-cyan-500/40 px-2.5 py-0.5 rounded-full uppercase shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              WORKSPACE ACCESS CONTROL
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
            Team Members & Role RBAC
          </h1>
          <p className="text-slate-400 text-xs font-mono">
            Manage workspace teammates and role-based authorization scopes
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition-all border border-cyan-300/40"
        >
          <UserPlus className="w-4 h-4" />
          ADD TEAMMATE
        </button>
      </div>

      {/* Member List Table */}
      <div className="cyber-glass-panel rounded-2xl border border-slate-800 overflow-hidden font-mono">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">Loading telemetry...</div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070c1a] text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="py-4 px-4">User Details</th>
                <th className="py-4 px-4">Assigned Role</th>
                <th className="py-4 px-4">Permission Scope</th>
                <th className="py-4 px-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/50">
                  <td className="py-4 px-4 font-mono">
                    <span className="font-bold text-slate-100 block">{m.name}</span>
                    <span className="text-[11px] text-slate-400">{m.email}</span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold flex items-center gap-1.5 w-fit ${roleColors[m.role]}`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {m.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-xs">
                    {m.role === 'ADMIN' && 'Full workspace administration & team RBAC management'}
                    {m.role === 'ANALYST' && 'Feedback ingestion, triage, AI classification & VoC digests'}
                    {m.role === 'VIEWER' && 'Read-only access to dashboard, inbox, trends & Ask LOOP'}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="cyber-glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4 font-mono">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              ADD TEAMMATE
            </h2>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Rivera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Work Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@loop.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Assign Role (RBAC Scope)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="ANALYST">ANALYST (Ingest, Triage & AI)</option>
                  <option value="ADMIN">ADMIN (Full Workspace Control)</option>
                  <option value="VIEWER">VIEWER (Read-Only Observer)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/30"
                >
                  {submitting ? 'CREATING...' : 'INVITE MEMBER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
