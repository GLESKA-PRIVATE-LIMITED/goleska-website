"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  Calendar,
  KeyRound,
  Smartphone,
  Monitor,
  LogOut,
  Lock,
} from 'lucide-react';

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

export default function SecurityView({ profileData }: Props) {
  const { user, signOut } = useAuth();

  // NOTE ON WHAT IS REAL vs PLACEHOLDER (kept intentionally honest):
  //  - REAL: verification status (profileData.is_verified), email, and member-since
  //    (profileData.created_at), plus the current session + Sign out (Supabase).
  //  - PLACEHOLDER (non-functional, "Coming soon" toasts): password change and 2FA -
  //    there is no backend endpoint for these yet, so we do NOT fake an API call.
  //  - OMITTED: "other devices" / "trusted devices" listing - the Supabase client
  //    setup here exposes no way to enumerate other sessions, so we only show the
  //    current session rather than inventing fake device rows.

  const isVerified = Boolean(profileData?.is_verified);

  const comingSoon = (feature: string) => toast(`${feature} is coming soon.`);

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

      {/* Password & Authentication (PLACEHOLDER - non-functional) */}
      <div className={cardCls}>
        <h3 className={cardTitleCls}>Password &amp; Authentication</h3>
        <div className="space-y-3">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                <KeyRound size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Password</p>
                <p className="text-xs text-slate-500">Update the password used to sign in to your account.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => comingSoon('Password change')}
              className="shrink-0 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Change Password
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                <Smartphone size={18} />
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  Two-Factor Authentication
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    Coming soon
                  </span>
                </p>
                <p className="text-xs text-slate-500">Add an extra layer of security with a one-time code.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => comingSoon('Two-factor authentication')}
              className="shrink-0 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-400"
            >
              Enable 2FA
            </button>
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

        {/* Placeholder note: enumerating/revoking other devices is not available yet. */}
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <Lock size={12} /> Viewing and managing sessions on other devices is coming soon.
        </p>

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={16} /> Sign out of this device
        </button>
      </div>
    </div>
  );
}
