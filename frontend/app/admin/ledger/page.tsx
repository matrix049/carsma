'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchLedger,
  createLedgerEntry,
  updateLedgerEntry,
  deleteLedgerEntry,
  LedgerEntry,
  LedgerEntryInput,
  LedgerStatus,
  LedgerSource,
} from '@/lib/apiServices';
import WheelLoader from '@/components/WheelLoader';

const STATUS_LABELS: Record<NonNullable<LedgerStatus>, string> = {
  payee: 'Payée',
  annuler: 'Annulée',
  en_attente: 'En attente',
};

const STATUS_BADGE: Record<NonNullable<LedgerStatus>, string> = {
  payee: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  annuler: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  en_attente: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
};

const SOURCE_LABELS: Record<LedgerSource, string> = {
  manual: 'Manual',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  website: 'Website',
  other: 'Other',
};

/**
 * Caisse (running cash balance) at the end of each row:
 *   caisse_new = caisse_prev + apport + (customerOwes if status === 'payee' else 0)
 *                            - cost - deliveryCost
 *
 * Validated against every row in the operator's source spreadsheet — the
 * numbers line up to the dirham across all 22 rows.
 */
function computeRunningCaisse(entries: LedgerEntry[]): number[] {
  let running = 0;
  return entries.map((entry) => {
    const income = entry.status === 'payee' ? entry.customerOwes : 0;
    running = running + entry.apport + income - entry.cost - entry.deliveryCost;
    return running;
  });
}

const todayISO = () => new Date().toISOString().slice(0, 10);

function emptyDraft(): LedgerEntryInput {
  return {
    date: todayISO(),
    cost: 0,
    commande: '',
    city: '',
    deliveryCost: 0,
    customerOwes: 0,
    status: null,
    apport: 0,
    source: 'manual',
    notes: '',
    totalDhs: null,
  };
}

export default function AdminLedgerPage() {
  const { logout } = useAuth();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<LedgerEntryInput>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await fetchLedger();
      setEntries(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load ledger');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const caisseValues = useMemo(() => computeRunningCaisse(entries), [entries]);
  const currentCaisse = caisseValues.length > 0 ? caisseValues[caisseValues.length - 1] : 0;

  const totals = useMemo(() => {
    let income = 0;
    let costs = 0;
    let deliveries = 0;
    let outstanding = 0;
    let apport = 0;
    for (const e of entries) {
      costs += e.cost;
      deliveries += e.deliveryCost;
      apport += e.apport;
      if (e.status === 'payee') income += e.customerOwes;
      else if (e.status === 'en_attente') outstanding += e.customerOwes;
    }
    return { income, costs, deliveries, outstanding, apport };
  }, [entries]);

  const startNew = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setFormError(null);
  };

  const startEdit = (entry: LedgerEntry) => {
    setEditingId(entry._id);
    setDraft({
      date: entry.date.slice(0, 10),
      cost: entry.cost,
      commande: entry.commande,
      city: entry.city,
      deliveryCost: entry.deliveryCost,
      customerOwes: entry.customerOwes,
      status: entry.status,
      apport: entry.apport,
      source: entry.source,
      notes: entry.notes,
      totalDhs: entry.totalDhs,
    });
    setFormError(null);
    // scroll the form into view on mobile
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        document.getElementById('ledger-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateLedgerEntry(editingId, draft);
      } else {
        await createLedgerEntry(draft);
      }
      await load();
      setEditingId(null);
      setDraft(emptyDraft());
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this ledger entry? This cannot be undone.')) return;
    try {
      await deleteLedgerEntry(id);
      await load();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete entry');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <AdminSidebar onLogout={logout} />
        <main className="lg:ml-64 px-4 sm:px-6 lg:px-10 py-6 sm:py-10 pt-20 lg:pt-10">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase leading-none tracking-tight">
                Ledger · Comptabilité
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-bold uppercase tracking-widest mt-2">
                Costs, deliveries, deposits, and running cash balance
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-3 self-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                Caisse actuelle
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-500">
                {currentCaisse.toFixed(0)} <span className="text-sm text-zinc-500">DH</span>
              </span>
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <StatCard label="Income (payée)" value={totals.income} positive />
            <StatCard label="Costs" value={totals.costs} />
            <StatCard label="Deliveries" value={totals.deliveries} />
            <StatCard label="Apport" value={totals.apport} positive />
            <StatCard label="Outstanding" value={totals.outstanding} muted />
          </div>

          {/* Form */}
          <form
            id="ledger-form"
            onSubmit={onSubmit}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6 md:p-8 mb-10"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-widest text-zinc-200">
                {editingId ? 'Edit entry' : 'New entry'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={startNew}
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
                >
                  + New instead
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              <Field label="Date">
                <input
                  type="date"
                  required
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  className="ledger-input"
                />
              </Field>
              <Field label="Commande">
                <input
                  type="text"
                  placeholder="e.g. 911 / 1 / logo"
                  value={draft.commande || ''}
                  onChange={(e) => setDraft({ ...draft, commande: e.target.value })}
                  className="ledger-input"
                />
              </Field>
              <Field label="Livraison (city)">
                <input
                  type="text"
                  placeholder="casablanca, tanger…"
                  value={draft.city || ''}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                  className="ledger-input"
                />
              </Field>
              <Field label="État">
                <select
                  value={draft.status ?? ''}
                  onChange={(e) =>
                    setDraft({ ...draft, status: (e.target.value || null) as LedgerStatus })
                  }
                  className="ledger-input"
                >
                  <option value="">—</option>
                  <option value="payee">Payée</option>
                  <option value="annuler">Annulée</option>
                  <option value="en_attente">En attente</option>
                </select>
              </Field>
              <Field label="Couts (DH)">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.cost ?? 0}
                  onChange={(e) => setDraft({ ...draft, cost: Number(e.target.value) })}
                  className="ledger-input"
                />
              </Field>
              <Field label="Cout livraison (DH)">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.deliveryCost ?? 0}
                  onChange={(e) => setDraft({ ...draft, deliveryCost: Number(e.target.value) })}
                  className="ledger-input"
                />
              </Field>
              <Field label="Doit payer (DH)">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.customerOwes ?? 0}
                  onChange={(e) => setDraft({ ...draft, customerOwes: Number(e.target.value) })}
                  className="ledger-input"
                />
              </Field>
              <Field label="Apport (DH)">
                <input
                  type="number"
                  step="0.01"
                  value={draft.apport ?? 0}
                  onChange={(e) => setDraft({ ...draft, apport: Number(e.target.value) })}
                  className="ledger-input"
                />
              </Field>
              <Field label="Total DHS (manual)">
                <input
                  type="number"
                  step="0.01"
                  value={draft.totalDhs ?? ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      totalDhs: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className="ledger-input"
                  placeholder="—"
                />
              </Field>
              <Field label="Source">
                <select
                  value={draft.source ?? 'manual'}
                  onChange={(e) => setDraft({ ...draft, source: e.target.value as LedgerSource })}
                  className="ledger-input"
                >
                  <option value="manual">Manual</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="website">Website</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Notes" wide>
                <input
                  type="text"
                  value={draft.notes || ''}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  className="ledger-input"
                  placeholder="Optional notes"
                />
              </Field>
            </div>

            {formError && (
              <p className="mt-4 text-xs font-bold text-rose-500">{formError}</p>
            )}

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={startNew}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:bg-zinc-900"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Add entry'}
              </button>
            </div>
          </form>

          {/* Table */}
          {isLoading ? (
            <div className="py-24 flex justify-center">
              <WheelLoader size="lg" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-500 text-sm font-bold">
              {error}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-zinc-600 text-sm font-black uppercase tracking-widest">
                No ledger entries yet. Add your first one above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/60">
                  <tr className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Couts</th>
                    <th className="px-4 py-3">Commande</th>
                    <th className="px-4 py-3">Livraison</th>
                    <th className="px-4 py-3">Cout liv.</th>
                    <th className="px-4 py-3">Doit payer</th>
                    <th className="px-4 py-3">État</th>
                    <th className="px-4 py-3">Total DHS</th>
                    <th className="px-4 py-3">Apport</th>
                    <th className="px-4 py-3">Caisse</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {entries.map((entry, idx) => (
                    <tr key={entry._id} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-400">
                        {new Date(entry.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-300">
                        {entry.cost ? `${entry.cost.toFixed(0)} DH` : '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-200 font-medium">
                        {entry.commande || '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{entry.city || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-300">
                        {entry.deliveryCost ? `${entry.deliveryCost.toFixed(0)} DH` : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-200 font-bold">
                        {entry.customerOwes ? `${entry.customerOwes.toFixed(0)} DH` : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {entry.status ? (
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_BADGE[entry.status]}`}
                          >
                            {STATUS_LABELS[entry.status]}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-300">
                        {entry.totalDhs === null || entry.totalDhs === undefined
                          ? '—'
                          : `${entry.totalDhs.toFixed(0)} DH`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-300">
                        {entry.apport ? `${entry.apport.toFixed(0)} DH` : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-emerald-500">
                        {caisseValues[idx].toFixed(0)} DH
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest">
                        {entry.orderRef ? (
                          <Link
                            href="/admin/orders"
                            className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-blue-500 hover:bg-blue-500/20"
                            title="Open in Orders"
                          >
                            {SOURCE_LABELS[entry.source]}
                            <span aria-hidden>↗</span>
                          </Link>
                        ) : (
                          <span className="text-zinc-500">{SOURCE_LABELS[entry.source]}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(entry)}
                            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:bg-zinc-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(entry._id)}
                            className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        <style jsx>{`
          .ledger-input {
            width: 100%;
            background-color: rgb(9, 9, 11);
            border: 1px solid rgb(39, 39, 42);
            border-radius: 0.75rem;
            padding: 0.625rem 0.875rem;
            font-size: 0.875rem;
            color: rgb(228, 228, 231);
            transition: border-color 0.15s;
          }
          .ledger-input:focus {
            outline: none;
            border-color: rgb(37, 99, 235);
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}

/* ── Small leaf components ────────────────────────────────────────────── */

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${wide ? 'sm:col-span-2 lg:col-span-2' : ''}`}>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  positive,
  muted,
}: {
  label: string;
  value: number;
  positive?: boolean;
  muted?: boolean;
}) {
  const color = muted
    ? 'text-amber-500'
    : positive
      ? 'text-emerald-500'
      : 'text-rose-500';
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`mt-2 text-lg sm:text-xl font-black ${color}`}>
        {value.toFixed(0)} <span className="text-xs text-zinc-500">DH</span>
      </p>
    </div>
  );
}
