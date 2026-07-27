"use client";

import React, { useState } from 'react';
import { User, Mail, Phone, Hash, BadgeCheck, FileText, MapPin, Home, Briefcase, IndianRupee, CircleCheck, ExternalLink, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import WorkerProfileView from './WorkerProfileView';

interface Props {
  userType: 'EMPLOYER' | 'WORKER';
  profileData: any;
  onUpdated?: (data: any) => void;
}

const cardCls = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';
const cardTitleCls = 'mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500';

function InfoRow({ icon: Icon, label, value, mono }: { icon: any; label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
        <Icon size={16} className="shrink-0 text-indigo-500" />
        <span className={`min-w-0 break-words text-sm font-semibold text-slate-800 ${mono ? 'font-mono uppercase break-all' : ''}`}>{value}</span>
      </div>
    </div>
  );
}

// Formats an address JSON blob (unknown exact shape) into a readable line by
// joining its string values. Falls back gracefully for strings / empty values.
function formatAddress(addr: any): string {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object') {
    const parts = Object.values(addr).filter((v) => typeof v === 'string' && (v as string).trim());
    return parts.join(', ');
  }
  return '';
}

export default function ProfileView({ userType, profileData, onUpdated }: Props) {
  const { session } = useAuth();
  const [bizFile, setBizFile] = useState<File | null>(null);
  const [bizGst, setBizGst] = useState('');
  const [bizUploading, setBizUploading] = useState(false);

  // Opens the uploaded business document via a short-lived signed URL.
  const viewBusinessDoc = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/employer/business-url`, {
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

  // Uploads a business document and marks the employer verified (verify-business).
  const handleBusinessUpload = async () => {
    if (!bizFile) { toast.error('Please choose a document to upload.'); return; }
    setBizUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', bizFile);
      if (bizGst.trim()) fd.append('gstin', bizGst.trim());
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/employer/verify-business`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: fd,
      });
      if (!res.ok) {
        const e = await res.json().catch(() => null);
        throw new Error(e?.detail || 'Upload failed. Please try again.');
      }
      const me = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/employers/me`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (me.ok) onUpdated?.(await me.json());
      toast.success('Business document uploaded and verified.');
      setBizFile(null);
      setBizGst('');
    } catch (e: any) {
      toast.error(e.message || 'Upload failed.');
    } finally {
      setBizUploading(false);
    }
  };

  // Workers get the dedicated, editable "Your Profile" layout.
  if (userType === 'WORKER') {
    return <WorkerProfileView profileData={profileData} onUpdated={onUpdated} />;
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-sm font-bold text-slate-500 shadow-sm">
        Loading profile...
      </div>
    );
  }

  const isEmployer = userType === 'EMPLOYER';
  const displayName = isEmployer
    ? (profileData.company_name || profileData.proprietor_name || 'Your Company')
    : (profileData.name || 'Worker');

  const initials =
    String(displayName)
      .trim()
      .split(/\s+/)
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'GL';

  // Profile-strength heuristic (client-side): there is no server-side
  // completeness score, so we count how many of a small set of key fields are
  // non-empty for this account type and express it as a percentage.
  const strengthFields = isEmployer
    ? [
        profileData.company_name,
        profileData.email,
        profileData.phone,
        profileData.account_type,
        profileData.pan_number || profileData.gstin || profileData.cin_number,
        profileData.is_verified,
      ]
    : [
        profileData.name,
        profileData.email,
        profileData.phone,
        profileData.account_type,
        profileData.kyc_document_url,
        profileData.permanent_address || profileData.current_address,
      ];
  const filled = strengthFields.filter(Boolean).length;
  const strength = Math.round((filled / strengthFields.length) * 100);

  // Documents - only surface what the object actually carries.
  const docs: { label: string; view?: 'business' }[] = [];
  if (profileData.kyc_document_url) docs.push({ label: 'KYC Document' });
  if (profileData.business_document_url) docs.push({ label: 'Business Document', view: 'business' });

  const permAddress = formatAddress(profileData.permanent_address);
  const currAddress = formatAddress(profileData.current_address);
  const hasAddresses = Boolean(permAddress || currAddress);

  return (
    <div className="space-y-6">
      {/* Gradient banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-16 h-32 w-32 rounded-full bg-purple-400/20 blur-2xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold uppercase ring-1 ring-white/25 backdrop-blur">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Your Profile</p>
              <h2 className="flex items-center gap-2 text-2xl font-extrabold leading-tight">
                <span className="min-w-0 break-words">{displayName}</span>
                {profileData.is_verified && <BadgeCheck size={22} className="shrink-0 text-emerald-300" />}
              </h2>
              <p className="mt-0.5 text-sm text-white/70">Let others know who you are</p>
            </div>
          </div>

          {/* Profile strength */}
          <div className="w-full shrink-0 sm:w-56">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white/80">
              <span>Profile Strength</span>
              <span>{strength}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all"
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className={cardCls}>
        <h3 className={cardTitleCls}>Personal Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow icon={User} label="Display Name" value={displayName} />
          <InfoRow icon={Phone} label="Phone Number" value={profileData.phone} mono />
          <InfoRow icon={Mail} label="Email Address" value={profileData.email || 'Not provided'} />
        </div>
      </div>

      {/* Business / Professional Details */}
      <div className={cardCls}>
        <h3 className={cardTitleCls}>{isEmployer ? 'Business Details' : 'Professional Details'}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow icon={Briefcase} label="Account Type" value={profileData.account_type || userType} />

          {/* Worker-only professional details (real fields from /workers/me). */}
          {!isEmployer && (
            <InfoRow
              icon={IndianRupee}
              label="Expected Wage"
              value={profileData.expected_salary ? `₹${profileData.expected_salary} / day` : 'Not set'}
            />
          )}
          {!isEmployer && (
            <InfoRow
              icon={CircleCheck}
              label="Availability"
              value={profileData.is_available ? 'Available for work' : 'Not available'}
            />
          )}

          {isEmployer && profileData.pan_number && (
            <InfoRow icon={Hash} label="PAN Number" value={profileData.pan_number} mono />
          )}
          {isEmployer && profileData.cin_number && (
            <InfoRow icon={Hash} label="CIN Number" value={profileData.cin_number} mono />
          )}
          {isEmployer && profileData.gstin && (
            <InfoRow icon={Hash} label="GSTIN" value={profileData.gstin} mono />
          )}
          {isEmployer && profileData.udyam_number && (
            <InfoRow icon={Hash} label="Udyam Registration" value={profileData.udyam_number} mono />
          )}
          {isEmployer &&
            (profileData.account_type === 'REGISTERED_BUSINESS' || profileData.account_type === 'REGISTERED_INDUSTRY') && (
              <InfoRow
                icon={User}
                label="Director Name"
                value={
                  profileData.director_data && profileData.director_data.length > 0
                    ? profileData.director_data[0].name
                    : 'Not available'
                }
              />
            )}
          {isEmployer && profileData.account_type === 'UNREGISTERED_BUSINESS' && (
            <InfoRow icon={User} label="Proprietor Name" value={profileData.proprietor_name || 'Not available'} />
          )}
        </div>

        <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <p className="text-xs font-medium leading-relaxed text-indigo-900/80">
            Note: To maintain KYC integrity, your core profile details are locked. If you need to update legal
            information, please contact support.
          </p>
        </div>
      </div>

      {/* Business Verification - upload document + verify (employer) */}
      {isEmployer && (
        <div className={cardCls}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Business Verification</h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                profileData.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {profileData.is_verified && <BadgeCheck size={13} />} {profileData.is_verified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <p className="mb-3 text-xs text-slate-500">Upload your business registration / GST document to verify your account.</p>

          {profileData.business_document_url && (
            <button
              onClick={viewBusinessDoc}
              className="mb-3 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
            >
              <ExternalLink size={13} /> View current document
            </button>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Document (PDF/Image)</p>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setBizFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100"
              />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">GSTIN (optional)</p>
              <input
                type="text"
                value={bizGst}
                onChange={(e) => setBizGst(e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm font-semibold uppercase text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <button
            onClick={handleBusinessUpload}
            disabled={bizUploading || !bizFile}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bizUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Upload &amp; Verify
          </button>
        </div>
      )}

      {/* Documents - only if the object actually has document fields */}
      {docs.length > 0 && (
        <div className={cardCls}>
          <h3 className={cardTitleCls}>Documents</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {docs.map((doc) => (
              <div
                key={doc.label}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{doc.label}</p>
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    On file
                  </span>
                </div>
                {doc.view === 'business' && (
                  <button
                    onClick={viewBusinessDoc}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
                  >
                    <ExternalLink size={13} /> View
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Addresses - only if the worker object carries address JSON */}
      {hasAddresses && (
        <div className={cardCls}>
          <h3 className={cardTitleCls}>Addresses</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {permAddress && <InfoRow icon={Home} label="Permanent Address" value={permAddress} />}
            {currAddress && <InfoRow icon={MapPin} label="Current Address" value={currAddress} />}
          </div>
        </div>
      )}
    </div>
  );
}
