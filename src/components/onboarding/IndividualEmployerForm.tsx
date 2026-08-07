"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import OnboardingSidePanel from '@/components/onboarding/OnboardingSidePanel';
import {
  User,
  Mail,
  Briefcase,
  Loader2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onComplete: () => void;
  onBackToStart: () => void;
}

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100';
const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400';
const primaryBtnCls =
  'inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
const backBtnCls =
  'inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50';

/**
 * Individual EMPLOYER onboarding - a private person (household / individual)
 * who wants to HIRE help, as opposed to the Individual WORKER who looks for
 * gigs. Deliberately lightweight (no GST/CIN/PAN): just a name so we can create
 * an employer profile (account_type = INDIVIDUAL) and drop them on the hiring
 * dashboard. The phone + email are already verified from the OTP login.
 */
export default function IndividualEmployerForm({ formData, updateFormData, onComplete, onBackToStart }: Props) {
  const { user, session } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    const name = (formData.contact_name || '').trim();
    if (!name) {
      setError('Please enter your name.');
      return;
    }
    if (!formData.email?.trim()) {
      setError('Your email is missing - please go back and log in again.');
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/employers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          account_type: 'INDIVIDUAL',
          company_name: name, // an individual has no company - store their own name
          contact_name: name,
          business_category: formData.business_category || null,
          email: formData.email,
          phone: user?.phone,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        const detail = Array.isArray(err?.detail)
          ? err.detail.map((e: any) => e?.msg).filter(Boolean).join(', ')
          : err?.detail;
        throw new Error(detail || 'Failed to register. Please try again.');
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setRegistering(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#eef1fb] font-sans text-slate-900">
      <OnboardingSidePanel />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8">
          {/* Mobile brand (side panel hidden below lg) */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Zap size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="font-[var(--font-anton)] text-xl uppercase tracking-wider text-slate-900">GO LESKA</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Individual Account</h1>
            <p className="mt-1 text-sm text-slate-500">Hire help for your home or personal needs - no business details required.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-5 animate-in fade-in">
            <div>
              <label className={labelCls}>Your Name *</label>
              <div className="relative">
                <User className={iconCls} size={18} />
                <input
                  type="text"
                  value={formData.contact_name || ''}
                  onChange={(e) => updateFormData({ contact_name: e.target.value })}
                  className={inputCls + ' pl-11'}
                  placeholder="Anjaneya Tiwari"
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <div className="relative">
                <Mail className={iconCls} size={18} />
                <input
                  type="email"
                  value={formData.email || ''}
                  disabled
                  className={inputCls + ' cursor-not-allowed pl-11 opacity-70'}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>What do you need help with? (optional)</label>
              <div className="relative">
                <Briefcase className={iconCls} size={18} />
                <input
                  type="text"
                  value={formData.business_category || ''}
                  onChange={(e) => updateFormData({ business_category: e.target.value })}
                  className={inputCls + ' pl-11'}
                  placeholder="e.g. Household, Cook, Driver, Electrician"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onBackToStart} className={backBtnCls}>
                <ArrowLeft size={16} /> Back
              </button>
              <button type="button" onClick={handleSubmit} disabled={registering} className={primaryBtnCls}>
                {registering ? <Loader2 className="animate-spin" size={18} /> : <>Finish <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
