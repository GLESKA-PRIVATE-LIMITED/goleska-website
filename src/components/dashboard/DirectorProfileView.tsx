"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { UserCog, UserX, Pencil, Save, X, Loader2, Lock } from 'lucide-react';

interface Props {
  profileData: any;
  onUpdated?: (data: any) => void;
}

const cardCls = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';
const labelCls = 'mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400';
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100';

// Turns a director_data JSON key into a readable label (e.g. "din" -> "DIN").
function formatKey(key: string): string {
  if (key.toLowerCase() === 'din') return 'DIN';
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function EditBtns({
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
}: {
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  if (!editing) {
    return (
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
      >
        <Pencil size={13} /> Edit
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onCancel}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
      >
        <X size={13} /> Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
      >
        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Changes
      </button>
    </div>
  );
}

async function patchEmployer(token: string | undefined, payload: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/employers/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || 'Failed to save changes.');
  }
  return res.json();
}

export default function DirectorProfileView({ profileData, onUpdated }: Props) {
  const { session } = useAuth();
  const directors: any[] = Array.isArray(profileData?.director_data) ? profileData.director_data : [];
  const isUnregistered = profileData?.account_type === 'UNREGISTERED_BUSINESS';

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Proprietor edit form (unregistered).
  const [prop, setProp] = useState({
    proprietor_name: profileData?.proprietor_name || '',
    enterprise_phone: profileData?.enterprise_phone || '',
    num_proprietors: profileData?.num_proprietors != null ? String(profileData.num_proprietors) : '',
    udyam_number: profileData?.udyam_number || '',
  });

  // Director names edit form (registered) - only names are user-editable; the
  // KYC-sourced identifiers (DIN etc.) stay locked.
  const [names, setNames] = useState<string[]>(directors.map((d) => d?.name || ''));

  const startEdit = () => {
    setProp({
      proprietor_name: profileData?.proprietor_name || '',
      enterprise_phone: profileData?.enterprise_phone || '',
      num_proprietors: profileData?.num_proprietors != null ? String(profileData.num_proprietors) : '',
      udyam_number: profileData?.udyam_number || '',
    });
    setNames(directors.map((d) => d?.name || ''));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveProprietor = async () => {
    setSaving(true);
    try {
      const updated = await patchEmployer(session?.access_token, {
        proprietor_name: prop.proprietor_name,
        enterprise_phone: prop.enterprise_phone,
        num_proprietors: prop.num_proprietors === '' ? null : parseInt(prop.num_proprietors, 10) || null,
        udyam_number: prop.udyam_number,
      });
      onUpdated?.(updated);
      toast.success('Proprietor profile updated');
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const saveDirectors = async () => {
    setSaving(true);
    try {
      // Preserve every existing director field, only overriding the name.
      const newDirectorData = directors.map((d, i) => ({ ...d, name: names[i] }));
      const updated = await patchEmployer(session?.access_token, { director_data: newDirectorData });
      onUpdated?.(updated);
      toast.success('Director profile updated');
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------- PROPRIETOR
  if (isUnregistered) {
    const propName = profileData?.proprietor_name || '';
    const rows: { label: string; value: React.ReactNode }[] = [
      { label: 'Number of Proprietors', value: profileData?.num_proprietors },
      { label: 'Enterprise Phone', value: profileData?.enterprise_phone },
      { label: 'Udyam Number', value: profileData?.udyam_number },
    ].filter((r) => r.value != null && String(r.value).trim() !== '');
    const pInitials =
      String(propName || 'P').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'P';

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Proprietor Profile</h1>
            <p className="mt-1 text-sm text-slate-500">The proprietor registered against this enterprise.</p>
          </div>
          <EditBtns editing={editing} saving={saving} onEdit={startEdit} onCancel={cancelEdit} onSave={saveProprietor} />
        </div>

        {editing ? (
          <div className={cardCls}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Proprietor Name</label>
                <input value={prop.proprietor_name} onChange={(e) => setProp((p) => ({ ...p, proprietor_name: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Enterprise Phone</label>
                <input value={prop.enterprise_phone} onChange={(e) => setProp((p) => ({ ...p, enterprise_phone: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Number of Proprietors</label>
                <input type="number" min={1} value={prop.num_proprietors} onChange={(e) => setProp((p) => ({ ...p, num_proprietors: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Udyam Number</label>
                <input value={prop.udyam_number} onChange={(e) => setProp((p) => ({ ...p, udyam_number: e.target.value }))} className={inputCls} />
              </div>
            </div>
          </div>
        ) : !propName && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <UserX size={26} />
            </div>
            <p className="text-sm font-bold text-slate-700">No proprietor information available</p>
            <p className="max-w-sm text-xs text-slate-400">Proprietor details captured during onboarding will appear here. Use Edit to add them.</p>
          </div>
        ) : (
          <div className={cardCls}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                {pInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-extrabold text-slate-900">{propName || 'Proprietor'}</p>
                <p className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                  <UserCog size={12} /> Proprietor
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              {rows.map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{r.label}</span>
                  <span className="min-w-0 break-words text-right text-sm font-semibold text-slate-800">{String(r.value)}</span>
                </div>
              ))}
              {rows.length === 0 && <p className="text-xs text-slate-400">No additional details on record.</p>}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------------ DIRECTORS
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Director Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Directors registered against this business.</p>
        </div>
        {directors.length > 0 && (
          <EditBtns editing={editing} saving={saving} onEdit={startEdit} onCancel={cancelEdit} onSave={saveDirectors} />
        )}
      </div>

      {directors.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <UserX size={26} />
          </div>
          <p className="text-sm font-bold text-slate-700">No director information available</p>
          <p className="max-w-sm text-xs text-slate-400">
            Director records only exist for registered businesses/industries. Unregistered or individual accounts
            don&apos;t carry director details.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {directors.map((dir, idx) => {
            const entries = Object.entries(dir || {}).filter(
              ([, v]) => (typeof v === 'string' || typeof v === 'number') && String(v).trim() !== ''
            );
            const name = dir?.name || `Director ${idx + 1}`;
            const initials =
              String(name)
                .trim()
                .split(/\s+/)
                .map((w: string) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'D';

            return (
              <div key={idx} className={cardCls}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    {editing ? (
                      <div>
                        <label className={labelCls}>Director Name</label>
                        <input
                          value={names[idx] ?? ''}
                          onChange={(e) => setNames((arr) => arr.map((n, i) => (i === idx ? e.target.value : n)))}
                          className={inputCls}
                        />
                      </div>
                    ) : (
                      <>
                        <p className="truncate text-base font-extrabold text-slate-900">{name}</p>
                        <p className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                          <UserCog size={12} /> Director
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {entries
                    .filter(([k]) => k.toLowerCase() !== 'name')
                    .map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          {formatKey(k)} {editing && <Lock size={10} className="text-slate-300" />}
                        </span>
                        <span className="min-w-0 break-words text-right text-sm font-semibold text-slate-800">{String(v)}</span>
                      </div>
                    ))}
                  {entries.filter(([k]) => k.toLowerCase() !== 'name').length === 0 && (
                    <p className="text-xs text-slate-400">No additional details on record.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <p className="text-center text-xs text-slate-400">
          Only director names are editable here - KYC-verified identifiers (DIN, etc.) are locked.
        </p>
      )}
    </div>
  );
}
