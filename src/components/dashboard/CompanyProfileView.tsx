"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Building2,
  Mail,
  Phone,
  Hash,
  Briefcase,
  Calendar,
  BadgeCheck,
  ShieldAlert,
  Factory,
  Tag,
  Pencil,
  Save,
  X,
  Loader2,
  Globe,
  Lock,
} from 'lucide-react';

interface Props {
  profileData: any;
  onUpdated?: (data: any) => void;
}

const cardCls = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';
const cardTitleCls = 'mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const labelCls = 'mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400';
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100';

function InfoRow({ icon: Icon, label, value, mono }: { icon: any; label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
        <Icon size={16} className="shrink-0 text-indigo-500" />
        <span className={`min-w-0 break-words text-sm font-semibold text-slate-800 ${mono ? 'font-mono uppercase break-all' : ''}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

// Read-only row for KYC/auth-locked fields, with a lock hint.
function LockedRow({ icon: Icon, label, value, mono }: { icon: any; label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label} <Lock size={10} className="text-slate-300" />
      </p>
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-100/70 px-3 py-2.5">
        <Icon size={16} className="shrink-0 text-slate-400" />
        <span className={`min-w-0 break-words text-sm font-semibold text-slate-500 ${mono ? 'font-mono uppercase break-all' : ''}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

function EditField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="min-w-0">
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls + ' pl-9'}
        />
      </div>
    </div>
  );
}

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// Only the genuinely user-editable Employer fields (see backend EmployerUpdate).
type EditForm = {
  company_name: string;
  business_category: string;
  website_url: string;
  description: string;
  industry_name: string;
  industry_type: string;
  nic_code: string;
  registration_number: string;
  registration_date: string;
  regulatory_authority: string;
  registration_status: string;
};

function buildForm(p: any): EditForm {
  return {
    company_name: p.company_name || '',
    business_category: p.business_category || '',
    website_url: p.website_url || '',
    description: p.description || '',
    industry_name: p.industry_name || '',
    industry_type: p.industry_type || '',
    nic_code: p.nic_code || '',
    registration_number: p.registration_number || '',
    registration_date: p.registration_date || '',
    regulatory_authority: p.regulatory_authority || '',
    registration_status: p.registration_status || '',
  };
}

export default function CompanyProfileView({ profileData, onUpdated }: Props) {
  const { session } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditForm>(() => buildForm(profileData || {}));

  if (!profileData) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-sm font-bold text-slate-500 shadow-sm">
        Loading company profile...
      </div>
    );
  }

  const isVerified = Boolean(profileData.is_verified);
  const isIndustry = profileData.account_type === 'REGISTERED_INDUSTRY';

  const set = (k: keyof EditForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const startEdit = () => {
    setForm(buildForm(profileData));
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm(buildForm(profileData));
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Send only the editable fields; the backend ignores everything else and
      // locks KYC identifiers itself.
      const payload: any = {
        company_name: form.company_name,
        business_category: form.business_category,
        website_url: form.website_url,
        description: form.description,
      };
      if (isIndustry) {
        payload.industry_name = form.industry_name;
        payload.industry_type = form.industry_type;
        payload.nic_code = form.nic_code;
        payload.registration_number = form.registration_number;
        payload.registration_date = form.registration_date;
        payload.regulatory_authority = form.regulatory_authority;
        payload.registration_status = form.registration_status;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/employers/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to save changes.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
      toast.success('Company profile updated');
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // Same completion heuristic ProfileView uses - count non-empty key fields.
  const fields = [
    profileData.company_name,
    profileData.email,
    profileData.phone,
    profileData.account_type,
    profileData.pan_number || profileData.gstin || profileData.cin_number,
    profileData.is_verified,
  ];
  const completion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Company Profile</h1>
          <p className="mt-1 text-sm text-slate-500">{isIndustry ? 'Your registered industry details.' : 'Your registered business details.'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isVerified ? <BadgeCheck size={14} /> : <ShieldAlert size={14} />}
            {isVerified ? 'Active' : 'Pending Verification'}
          </span>
          {!editing ? (
            <button
              onClick={startEdit}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <Pencil size={13} /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <X size={13} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Completion */}
      <div className={cardCls}>
        <div className="mb-1.5 flex items-center justify-between text-sm font-semibold">
          <span className="text-slate-600">Profile Completion</span>
          <span className="text-indigo-600">{completion}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {/* Industry Registration - REGISTERED_INDUSTRY only */}
      {isIndustry && (
        <div className={cardCls}>
          <h3 className={cardTitleCls}>Industry Registration</h3>
          {editing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <EditField icon={Factory} label="Industry Name" value={form.industry_name} onChange={set('industry_name')} />
              <EditField icon={Tag} label="Industry Type" value={form.industry_type} onChange={set('industry_type')} />
              <EditField icon={Hash} label="NIC Code" value={form.nic_code} onChange={set('nic_code')} />
              <EditField icon={Hash} label="Registration Number" value={form.registration_number} onChange={set('registration_number')} />
              <EditField icon={Calendar} label="Registration Date" value={form.registration_date} onChange={set('registration_date')} />
              <EditField icon={Building2} label="Regulatory Authority" value={form.regulatory_authority} onChange={set('regulatory_authority')} />
              <EditField icon={BadgeCheck} label="Registration Status" value={form.registration_status} onChange={set('registration_status')} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow icon={Factory} label="Industry Name" value={profileData.industry_name || profileData.company_name || 'Not provided'} />
              {profileData.industry_type && <InfoRow icon={Tag} label="Industry Type" value={profileData.industry_type} />}
              {profileData.nic_code && <InfoRow icon={Hash} label="NIC Code" value={profileData.nic_code} mono />}
              {profileData.registration_number && <InfoRow icon={Hash} label="Registration Number" value={profileData.registration_number} mono />}
              {profileData.registration_date && <InfoRow icon={Calendar} label="Registration Date" value={profileData.registration_date} />}
              {profileData.regulatory_authority && <InfoRow icon={Building2} label="Regulatory Authority" value={profileData.regulatory_authority} />}
              {profileData.registration_status && <InfoRow icon={BadgeCheck} label="Registration Status" value={profileData.registration_status} />}
            </div>
          )}
        </div>
      )}

      {/* Company Details */}
      <div className={cardCls}>
        <h3 className={cardTitleCls}>Company Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {editing ? (
            <>
              <EditField icon={Building2} label="Company Name" value={form.company_name} onChange={set('company_name')} />
              <EditField icon={Briefcase} label="Business Category" value={form.business_category} onChange={set('business_category')} placeholder="e.g. Construction" />
              <EditField icon={Globe} label="Website" value={form.website_url} onChange={set('website_url')} placeholder="https://" />
              <div className="min-w-0 sm:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description')(e.target.value)}
                  rows={3}
                  placeholder="Tell workers about your company"
                  className={inputCls}
                />
              </div>
            </>
          ) : (
            <>
              <InfoRow icon={Building2} label="Company Name" value={profileData.company_name || 'Not provided'} />
              <InfoRow icon={Briefcase} label="Account Type" value={profileData.account_type || 'Not provided'} />
              {profileData.business_category && <InfoRow icon={Briefcase} label="Business Category" value={profileData.business_category} />}
              {profileData.website_url && <InfoRow icon={Globe} label="Website" value={profileData.website_url} />}
              {profileData.description && (
                <div className="min-w-0 sm:col-span-2">
                  <InfoRow icon={Building2} label="Description" value={profileData.description} />
                </div>
              )}
            </>
          )}

          {/* Locked / KYC / auth fields - always read-only */}
          <LockedRow icon={Mail} label="Company Email" value={profileData.email || 'Not provided'} />
          <LockedRow icon={Phone} label="Company Number" value={profileData.phone || 'Not provided'} mono />
          {profileData.gstin && <LockedRow icon={Hash} label="GST Number" value={profileData.gstin} mono />}
          {profileData.cin_number && <LockedRow icon={Hash} label="CIN Number" value={profileData.cin_number} mono />}
          {profileData.pan_number && <LockedRow icon={Hash} label="PAN Number" value={profileData.pan_number} mono />}
          <LockedRow icon={Calendar} label="Member Since" value={formatDate(profileData.created_at)} />
        </div>

        <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <p className="text-xs font-medium leading-relaxed text-indigo-900/80">
            Note: Verified KYC details (GST, PAN, CIN), your registered email and phone are locked. You can edit your
            company name, business info{isIndustry ? ' and industry registration details' : ''}.
          </p>
        </div>
      </div>
    </div>
  );
}
