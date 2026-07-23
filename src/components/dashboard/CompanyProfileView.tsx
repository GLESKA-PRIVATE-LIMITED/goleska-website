"use client";

import React from 'react';
import { Building2, Mail, Phone, Hash, Briefcase, Calendar, BadgeCheck, ShieldAlert } from 'lucide-react';

interface Props {
  profileData: any;
}

const cardCls = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';
const cardTitleCls = 'mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500';

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

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CompanyProfileView({ profileData }: Props) {
  if (!profileData) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-sm font-bold text-slate-500 shadow-sm">
        Loading company profile...
      </div>
    );
  }

  const isVerified = Boolean(profileData.is_verified);

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
          <p className="mt-1 text-sm text-slate-500">Your registered business details.</p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {isVerified ? <BadgeCheck size={14} /> : <ShieldAlert size={14} />}
          {isVerified ? 'Active' : 'Pending Verification'}
        </span>
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

      {/* Details */}
      <div className={cardCls}>
        <h3 className={cardTitleCls}>Company Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow icon={Building2} label="Company Name" value={profileData.company_name || 'Not provided'} />
          <InfoRow icon={Mail} label="Company Email" value={profileData.email || 'Not provided'} />
          <InfoRow icon={Phone} label="Company Number" value={profileData.phone || 'Not provided'} mono />
          <InfoRow icon={Briefcase} label="Account Type" value={profileData.account_type || 'Not provided'} />
          {profileData.gstin && <InfoRow icon={Hash} label="GST Number" value={profileData.gstin} mono />}
          {profileData.cin_number && <InfoRow icon={Hash} label="CIN Number" value={profileData.cin_number} mono />}
          {profileData.pan_number && <InfoRow icon={Hash} label="PAN Number" value={profileData.pan_number} mono />}
          <InfoRow icon={Calendar} label="Member Since" value={formatDate(profileData.created_at)} />
        </div>

        <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <p className="text-xs font-medium leading-relaxed text-indigo-900/80">
            Note: To maintain KYC integrity, your registered business details are locked. If you need to update legal
            information, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
