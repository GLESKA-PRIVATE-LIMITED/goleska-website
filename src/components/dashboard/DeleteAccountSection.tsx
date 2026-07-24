"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  userType: 'EMPLOYER' | 'WORKER';
}

/**
 * "Danger zone" delete-account control, shown on every account type's profile.
 * Deletes the account on the spot (backend releases the phone/email so the same
 * credentials can onboard fresh), then signs out and returns to the landing page.
 */
export default function DeleteAccountSection({ userType }: Props) {
  const { session, signOut } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const endpoint = userType === 'WORKER' ? '/api/v1/workers/me' : '/api/v1/employers/me';
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Could not delete your account. Please try again.');
      }
      // Clear local onboarding markers so a fresh onboarding starts clean.
      try {
        localStorage.removeItem('onboardingSide');
        localStorage.removeItem('onboardingEmail');
      } catch {
        /* ignore */
      }
      toast.success('Your account has been deleted. You can sign up again with the same phone or email anytime.');
      await signOut(); // clears the session and returns to the landing page
    } catch (e: any) {
      toast.error(e.message || 'Could not delete your account.');
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm sm:p-6">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle size={18} className="text-red-600" />
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-red-600">Danger Zone</h3>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        Permanently delete your account. This happens on the spot and frees up your phone &amp; email so you can
        onboard fresh anytime.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 size={16} /> Delete your account
        </button>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold text-red-700">Are you sure? This can&apos;t be undone.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {deleting ? 'Deleting...' : 'Yes, delete'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
