"use client";

import React, { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Droplet,
  Heart,
  Briefcase,
  Wrench,
  Clock,
  IndianRupee,
  CircleCheck,
  MapPin,
  Home,
  FileText,
  ShieldCheck,
  BadgeCheck,
  Star,
  Pencil,
  Save,
  X,
  Plus,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  profileData: any;
  onUpdated?: (data: any) => void;
}

const cardCls = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';
const cardTitleCls = 'flex items-center gap-2 text-sm font-bold text-indigo-600';
const miniLabel = 'mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400';
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

function formatAddress(addr: any): string {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object') {
    const parts = Object.values(addr).filter((v) => typeof v === 'string' && (v as string).trim());
    return parts.join(', ');
  }
  return '';
}

// Read-only display row (icon + label + value inside a soft pill).
function ViewRow({ icon: Icon, label, value, mono }: { icon: any; label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className={miniLabel}>{label}</p>
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
        <Icon size={16} className="shrink-0 text-indigo-500" />
        <span className={`min-w-0 break-words text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</span>
      </div>
    </div>
  );
}

function EditRow({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="min-w-0">
      <p className={miniLabel}>{label}</p>
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls + ' pl-9'}
        />
      </div>
    </div>
  );
}

interface EditForm {
  name: string;
  marital_status: string;
  blood_group: string;
  current_profession: string;
  experience_years: string;
  expected_salary: string;
  is_available: boolean;
  skills: string[];
  permanent_address: string;
  current_address: string;
}

function buildForm(p: any): EditForm {
  return {
    name: p?.name || '',
    marital_status: p?.marital_status || '',
    blood_group: p?.blood_group || '',
    current_profession: p?.current_profession || '',
    experience_years: p?.experience_years || '',
    expected_salary: p?.expected_salary != null ? String(p.expected_salary) : '',
    is_available: Boolean(p?.is_available),
    skills: Array.isArray(p?.skills) ? p.skills : [],
    permanent_address: formatAddress(p?.permanent_address),
    current_address: formatAddress(p?.current_address),
  };
}

/**
 * Worker profile - a rich, editable "Your Profile" page modelled on the Business
 * Mall reference: gradient header + strength, Personal Information, Addresses and
 * Professional Details (skills as chips) on the left, Documents + a safety card
 * on the right. Editable fields are saved via PATCH /api/v1/workers/me.
 */
export default function WorkerProfileView({ profileData, onUpdated }: Props) {
  const { session } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditForm>(() => buildForm(profileData || {}));
  const [skillDraft, setSkillDraft] = useState('');

  const set = <K extends keyof EditForm>(k: K) => (v: EditForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const displayName = profileData?.name || 'Worker';
  const initials =
    String(displayName)
      .trim()
      .split(/\s+/)
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'GL';

  const strength = useMemo(() => {
    const fields = [
      profileData?.name,
      profileData?.email,
      profileData?.phone,
      profileData?.blood_group,
      profileData?.current_profession,
      Array.isArray(profileData?.skills) && profileData.skills.length > 0,
      profileData?.permanent_address || profileData?.current_address,
      profileData?.kyc_document_url,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profileData]);

  if (!profileData) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-sm font-bold text-slate-500 shadow-sm">
        Loading profile...
      </div>
    );
  }

  const startEdit = () => {
    setForm(buildForm(profileData));
    setEditing(true);
  };
  const cancelEdit = () => {
    setForm(buildForm(profileData));
    setEditing(false);
  };

  const addSkill = () => {
    const s = skillDraft.trim();
    if (!s) return;
    if (!form.skills.includes(s)) setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    setSkillDraft('');
  };
  const removeSkill = (s: string) => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));

  // Opens the uploaded government ID via a short-lived signed URL from the backend.
  const viewIdDocument = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/worker/id-url`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error('Could not load the document.');
      const d = await res.json();
      if (d.signed_url) window.open(d.signed_url, '_blank', 'noopener');
      else throw new Error('No document found.');
    } catch (e: any) {
      toast.error(e.message || 'Could not open the document.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name: form.name || null,
        marital_status: form.marital_status || null,
        blood_group: form.blood_group || null,
        current_profession: form.current_profession || null,
        experience_years: form.experience_years || null,
        skills: form.skills,
        is_available: form.is_available,
        expected_salary: form.expected_salary ? Number(form.expected_salary) : null,
        permanent_address: form.permanent_address ? { address: form.permanent_address } : null,
        current_address: form.current_address ? { address: form.current_address } : null,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/workers/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const detail = Array.isArray(err?.detail) ? err.detail.map((e: any) => e?.msg).filter(Boolean).join(', ') : err?.detail;
        throw new Error(detail || 'Failed to save changes.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
      toast.success('Profile updated');
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const skills: string[] = editing ? form.skills : Array.isArray(profileData.skills) ? profileData.skills : [];
  const permAddress = formatAddress(profileData.permanent_address);
  const currAddress = formatAddress(profileData.current_address);

  return (
    <div className="space-y-6 pb-24">
      {/* Gradient header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-16 h-32 w-32 rounded-full bg-purple-400/20 blur-2xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Your Profile</p>
            <h2 className="mt-0.5 text-2xl font-extrabold leading-tight">Let others know who you are</h2>

            {/* Strength */}
            <div className="mt-4 w-full max-w-xs rounded-xl bg-white/10 p-3 backdrop-blur">
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white/85">
                <span>Profile Strength</span>
                <span>{strength}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all" style={{ width: `${strength}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-white/70">{strength >= 80 ? 'Looking great!' : 'Almost there - add more details.'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:flex-col sm:items-end">
            {profileData.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileData.photo_url} alt={displayName} className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/40" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold uppercase ring-2 ring-white/25 backdrop-blur">
                {initials}
              </div>
            )}
            <div className="text-right">
              <p className="flex items-center justify-end gap-1.5 text-lg font-extrabold">
                {displayName}
                {profileData.is_verified && <BadgeCheck size={18} className="text-emerald-300" />}
              </p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-950">
                <Star size={12} fill="currentColor" /> {profileData.overall_rating != null ? Number(profileData.overall_rating).toFixed(1) : '5.0'} Rating
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Information */}
          <div className={cardCls}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={cardTitleCls}><User size={16} /> Personal Information</h3>
              {!editing && (
                <button onClick={startEdit} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                  <Pencil size={13} /> Edit
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {editing ? (
                <>
                  <EditRow icon={User} label="Display Name" value={form.name} onChange={set('name')} placeholder="Your name" />
                  <ViewRow icon={Phone} label="Phone Number" value={profileData.phone} mono />
                  <ViewRow icon={Mail} label="Email" value={profileData.email || 'Not provided'} />
                  <div className="min-w-0">
                    <p className={miniLabel}>Marital Status</p>
                    <div className="relative">
                      <Heart size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={form.marital_status} onChange={(e) => set('marital_status')(e.target.value)} className={inputCls + ' pl-9'}>
                        <option value="">Select</option>
                        <option value="Unmarried">Unmarried</option>
                        <option value="Married">Married</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <EditRow icon={Droplet} label="Blood Group" value={form.blood_group} onChange={set('blood_group')} placeholder="e.g. AB+" />
                </>
              ) : (
                <>
                  <ViewRow icon={User} label="Display Name" value={displayName} />
                  <ViewRow icon={Phone} label="Phone Number" value={profileData.phone} mono />
                  <ViewRow icon={Mail} label="Email" value={profileData.email || 'Not provided'} />
                  <ViewRow icon={Heart} label="Marital Status" value={profileData.marital_status || 'Not set'} />
                  <ViewRow icon={Droplet} label="Blood Group" value={profileData.blood_group || 'Not set'} />
                </>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className={cardCls}>
            <h3 className={cardTitleCls}><MapPin size={16} /> Addresses</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {editing ? (
                <>
                  <div className="min-w-0">
                    <p className={miniLabel}>Permanent Address</p>
                    <textarea value={form.permanent_address} onChange={(e) => set('permanent_address')(e.target.value)} rows={2} placeholder="House, street, city, state" className={inputCls} />
                  </div>
                  <div className="min-w-0">
                    <p className={miniLabel}>Current Address</p>
                    <textarea value={form.current_address} onChange={(e) => set('current_address')(e.target.value)} rows={2} placeholder="House, street, city, state" className={inputCls} />
                  </div>
                </>
              ) : (
                <>
                  <ViewRow icon={Home} label="Permanent Address" value={permAddress || 'Not provided'} />
                  <ViewRow icon={MapPin} label="Current Address" value={currAddress || 'Not provided'} />
                </>
              )}
            </div>
          </div>

          {/* Professional Details */}
          <div className={cardCls}>
            <h3 className={cardTitleCls}><Briefcase size={16} /> Professional Details</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {editing ? (
                <>
                  <EditRow icon={Clock} label="Work Experience" value={form.experience_years} onChange={set('experience_years')} placeholder="e.g. 3+ Years" />
                  <EditRow icon={Wrench} label="Current Profession" value={form.current_profession} onChange={set('current_profession')} placeholder="e.g. Electrician" />
                  <EditRow icon={IndianRupee} label="Expected Wage (per day)" value={form.expected_salary} onChange={set('expected_salary')} placeholder="e.g. 800" type="number" />
                  <div className="min-w-0">
                    <p className={miniLabel}>Availability</p>
                    <button
                      type="button"
                      onClick={() => set('is_available')(!form.is_available)}
                      className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                        form.is_available ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <CircleCheck size={16} /> {form.is_available ? 'Available for work' : 'Not available'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <ViewRow icon={Clock} label="Work Experience" value={profileData.experience_years || 'Not set'} />
                  <ViewRow icon={Wrench} label="Current Profession" value={profileData.current_profession || 'Not set'} />
                  <ViewRow icon={IndianRupee} label="Expected Wage" value={profileData.expected_salary ? `₹${profileData.expected_salary} / day` : 'Not set'} />
                  <ViewRow icon={CircleCheck} label="Availability" value={profileData.is_available ? 'Available for work' : 'Not available'} />
                </>
              )}
            </div>

            {/* Skills / Expertise */}
            <div className="mt-4">
              <p className={miniLabel}>Skills / Expertise</p>
              <div className="flex flex-wrap items-center gap-2">
                {skills.length === 0 && !editing && <span className="text-sm text-slate-400">No skills added yet.</span>}
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                    {s}
                    {editing && (
                      <button onClick={() => removeSkill(s)} className="text-indigo-400 transition hover:text-red-500">
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
                {editing && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-indigo-200 py-0.5 pl-2.5 pr-1">
                    <input
                      value={skillDraft}
                      onChange={(e) => setSkillDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      placeholder="Add skill"
                      className="w-24 bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                    />
                    <button onClick={addSkill} className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                      <Plus size={12} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="space-y-6">
          {/* Documents */}
          <div className={cardCls}>
            <h3 className={cardTitleCls}><FileText size={16} /> Documents</h3>
            <p className="mt-1 text-xs text-slate-400">Verification documents on your account.</p>
            <div className="mt-4 space-y-3">
              <DocRow label="ID Document" done={Boolean(profileData.kyc_document_url)} onView={profileData.kyc_document_url ? viewIdDocument : undefined} />
              <DocRow label="Liveness Selfie" done={Boolean(profileData.photo_url)} />
            </div>
          </div>

          {/* Safety card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-indigo-500/20">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <ShieldCheck size={24} />
              </div>
              <p className="mt-3 text-base font-extrabold">Your information is safe with us</p>
              <p className="mt-1 text-xs leading-relaxed text-white/75">We use enterprise-grade encryption to protect your data and privacy at all times.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save bar */}
      {editing && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">Unsaved changes</p>
            <div className="flex items-center gap-2">
              <button onClick={cancelEdit} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
                <X size={15} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocRow({ label, done, onView }: { label: string; done: boolean; onView?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <FileText size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
        <span
          className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {done ? 'On file' : 'Pending'}
        </span>
      </div>
      {onView && (
        <button
          onClick={onView}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
        >
          <ExternalLink size={13} /> View
        </button>
      )}
    </div>
  );
}
