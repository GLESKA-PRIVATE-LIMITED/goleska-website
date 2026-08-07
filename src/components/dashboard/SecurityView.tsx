"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  Calendar,
  Monitor,
  LogOut,
} from 'lucide-react';
import DeleteAccountSection from './DeleteAccountSection';

interface Props {
  userType: 'EMPLOYER' | 'WORKER';
  profileData: any;
}

const cardCls = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';
const cardTitleCls = 'mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500';

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function SecurityView({ userType, profileData }: Props) {
  const { user, signOut } = useAuth();

  // Only real, backend-backed security info is rendered here. Anything without
  // real backend support (password change, 2FA, other-device session listing)
  // is intentionally NOT rendered - we will add it back once the backend
  // supports it, rather than showing a disabled/coming-soon stub.
  const isVerified = Boolean(profileData?.is_verified);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Security</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your account security and sign-in.</p>
      </div>

      {/* Security Status (REAL data) */}
      <div className={cardCls}>
        <h3 className={cardTitleCls}>Security Status</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${
                isVerified ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-500'
              }`}
            >
              {isVerified ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Account Verified</p>
              <p className="text-sm font-bold text-slate-800">{isVerified ? 'Verified' : 'Not verified'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Email</p>
              <p className="truncate text-sm font-bold text-slate-800">{profileData?.email || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Member Since</p>
              <p className="text-sm font-bold text-slate-800">{formatDate(profileData?.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions (current session is REAL; other-device listing omitted) */}
      <div className={cardCls}>
        <h3 className={cardTitleCls}>Active Sessions</h3>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <Monitor size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800">This device</p>
            <p className="truncate text-xs text-slate-500">
              {user?.email || profileData?.email || 'Current session'}
              {user?.last_sign_in_at ? ` · Signed in ${formatDate(user.last_sign_in_at)}` : ''}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active now
          </span>
        </div>

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={16} /> Sign out of this device
        </button>
      </div>

      <DeleteAccountSection userType={userType} />
    </div>
  );
}
