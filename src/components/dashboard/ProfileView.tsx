import React from 'react';
import { User, Mail, Phone, Hash, BadgeCheck, FileText, MapPin, Home, Briefcase, IndianRupee, CircleCheck } from 'lucide-react';
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
  const docs: { label: string }[] = [];
  if (profileData.kyc_document_url) docs.push({ label: 'KYC Document' });
  if (profileData.business_document_url) docs.push({ label: 'Business Document' });

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
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{doc.label}</p>
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    On file
                  </span>
                </div>
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
