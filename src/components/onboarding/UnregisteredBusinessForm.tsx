"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import OnboardingSidePanel from '@/components/onboarding/OnboardingSidePanel';
import StepIndicator from '@/components/onboarding/StepIndicator';
import {
  Store,
  User,
  Users,
  Mail,
  Phone,
  Hash,
  Briefcase,
  FileText,
  ShieldCheck,
  Check,
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
const miniLabel = 'mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400';
const primaryBtnCls =
  'inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
const backBtnCls =
  'inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50';

const STEP_LABELS = ['Business Info', 'Contact Details', 'Verification'];
const HEADINGS = ['Business Information', 'Contact Details', 'Verification'];
const SUBHEADINGS = [
  'Tell us about your enterprise.',
  'How can we reach your business?',
  'Verify your PAN to finish setup.',
];

export default function UnregisteredBusinessForm({ formData, updateFormData, onComplete, onBackToStart }: Props) {
  const { user, session } = useAuth();

  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState('');

  const [loadingPan, setLoadingPan] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [panResult, setPanResult] = useState<{ valid: boolean; company_name: string; cin_number: string } | null>(null);
  const [panError, setPanError] = useState('');

  // Udyam is OPTIONAL (recommended) - never blocks submission.
  const [loadingUdyam, setLoadingUdyam] = useState(false);
  const [udyamVerified, setUdyamVerified] = useState(false);
  const [udyamResult, setUdyamResult] = useState<{ valid: boolean; company_name: string } | null>(null);
  const [udyamError, setUdyamError] = useState('');

  const [registering, setRegistering] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Reuses the exact PAN verification pattern from RegisteredBusinessWizard.
  const handleVerifyPan = async () => {
    setPanError('');
    if (!formData.pan_number || formData.pan_number.length < 10) {
      setPanError('Please enter a valid 10-character PAN number.');
      return;
    }
    if (!formData.pan_consent) {
      setPanError('Please provide consent before verifying your PAN.');
      return;
    }

    setLoadingPan(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/kyc/verify-pan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan_number: formData.pan_number }),
      });
      if (!res.ok) throw new Error('PAN verification failed. Please check the number and try again.');
      const data = await res.json();

      setPanResult({ valid: data.valid, company_name: data.company_name, cin_number: data.cin_number });
      setPanVerified(true);
      updateFormData({ pan_details: data.raw_details, cin_number: data.cin_number });
    } catch (err: any) {
      setPanVerified(false);
      setPanResult(null);
      setPanError(err.message || 'PAN verification failed. Please try again.');
    } finally {
      setLoadingPan(false);
    }
  };

  // Optional Udyam (MSME) verification - reuses POST /api/v1/kyc/verify-udyam.
  const handleVerifyUdyam = async () => {
    setUdyamError('');
    if (!formData.udyam_number?.trim()) {
      setUdyamError('Please enter your Udyam registration number.');
      return;
    }
    setLoadingUdyam(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/kyc/verify-udyam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ udyam_number: formData.udyam_number }),
      });
      if (!res.ok) throw new Error('Udyam verification failed. Please check the number and try again.');
      const data = await res.json();
      setUdyamResult({ valid: data.valid, company_name: data.company_name });
      setUdyamVerified(true);
      updateFormData({ udyam_details: data.raw_details });
    } catch (err: any) {
      setUdyamVerified(false);
      setUdyamResult(null);
      setUdyamError(err.message || 'Udyam verification failed. Please try again.');
    } finally {
      setLoadingUdyam(false);
    }
  };

  const goNext = () => {
    setStepError('');
    if (step === 1) {
      if (!formData.company_name?.trim()) {
        setStepError('Please enter the name of your enterprise.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.email?.trim()) {
        setStepError('Please enter a contact email.');
        return;
      }
      if (!formData.enterprise_phone?.trim() || formData.enterprise_phone.trim().length < 10) {
        setStepError('Please enter a valid phone number.');
        return;
      }
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const goPrev = () => {
    setStepError('');
    if (step === 1) {
      onBackToStart();
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  // Preserves the existing employer registration call exactly.
  const handleSubmit = async () => {
    setSubmitError('');
    if (!panVerified) {
      setSubmitError('Please verify your PAN before submitting.');
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
          ...formData,
          account_type: 'UNREGISTERED_BUSINESS',
          phone: user?.phone,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to register. Please try again.');
      }

      onComplete();
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
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
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{HEADINGS[step - 1]}</h1>
            <p className="mt-1 text-sm text-slate-500">{SUBHEADINGS[step - 1]}</p>
          </div>

          <StepIndicator steps={STEP_LABELS} current={step} />

          {stepError && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {stepError}
            </div>
          )}

          {/* STEP 1: Business Info */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <label className={labelCls}>Name of Enterprise *</label>
                <div className="relative">
                  <Store className={iconCls} size={18} />
                  <input
                    type="text"
                    value={formData.company_name || ''}
                    onChange={(e) => updateFormData({ company_name: e.target.value })}
                    className={inputCls + ' pl-11'}
                    placeholder="Raju Welding Shop"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Proprietor Name</label>
                <div className="relative">
                  <User className={iconCls} size={18} />
                  <input
                    type="text"
                    value={formData.proprietor_name || ''}
                    onChange={(e) => updateFormData({ proprietor_name: e.target.value })}
                    className={inputCls + ' pl-11'}
                    placeholder="Rahul Sharma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Business Type</label>
                  <div className="relative">
                    <Briefcase className={iconCls} size={18} />
                    <select
                      value={formData.business_category || ''}
                      onChange={(e) => updateFormData({ business_category: e.target.value })}
                      className={inputCls + ' pl-11'}
                    >
                      <option value="">Select...</option>
                      <option value="Retail / Shop">Retail / Shop</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Services">Services</option>
                      <option value="Trading">Trading</option>
                      <option value="Food & Beverage">Food &amp; Beverage</option>
                      <option value="Construction">Construction</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Number of Proprietor</label>
                  <div className="relative">
                    <Users className={iconCls} size={18} />
                    <input
                      type="number"
                      min={1}
                      value={formData.num_proprietors || 1}
                      onChange={(e) => updateFormData({ num_proprietors: parseInt(e.target.value) || 1 })}
                      className={inputCls + ' pl-11'}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Nature of Business</label>
                <div className="relative">
                  <FileText className={iconCls} size={18} />
                  <input
                    type="text"
                    value={formData.description || ''}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    className={inputCls + ' pl-11'}
                    placeholder="e.g. Welding and metal fabrication"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Contact Details */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <label className={labelCls}>Gmail *</label>
                <div className="relative">
                  <Mail className={iconCls} size={18} />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    className={inputCls + ' pl-11'}
                    placeholder="shop@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Phone Number *</label>
                <div className="relative">
                  <Phone className={iconCls} size={18} />
                  <input
                    type="tel"
                    value={formData.enterprise_phone || ''}
                    onChange={(e) => updateFormData({ enterprise_phone: e.target.value })}
                    className={inputCls + ' pl-11'}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Verification - PAN only */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              {/* Demo mode notice */}
              <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0 text-lg">🧪</span>
                  <div>
                    <p className="text-xs font-bold text-amber-800">Demo / Sandbox Mode — Any PAN accepted</p>
                    <p className="mt-0.5 text-xs text-amber-700">Enter any 10-character PAN and it will pass verification.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { updateFormData({ pan_number: 'ABCDE1234F', pan_consent: true }); setPanVerified(false); setPanResult(null); }}
                  className="shrink-0 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-200"
                >
                  Autofill
                </button>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-indigo-50 p-4">
                <ShieldCheck className="mt-0.5 shrink-0 text-indigo-600" size={20} />
                <p className="text-sm text-indigo-900/80">
                  Your PAN is verified securely against the government registry and never stored in plain text.
                </p>
              </div>

              <div>
                <label className={labelCls}>PAN Number *</label>
                <div className="relative">
                  <Hash className={iconCls} size={18} />
                  <input
                    type="text"
                    value={formData.pan_number || ''}
                    onChange={(e) => {
                      updateFormData({ pan_number: e.target.value.toUpperCase() });
                      setPanVerified(false);
                      setPanResult(null);
                    }}
                    disabled={panVerified}
                    maxLength={10}
                    className={inputCls + ' pl-11 uppercase disabled:opacity-60'}
                    placeholder="ABCDE1234F"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={!!formData.pan_consent}
                  onChange={(e) => updateFormData({ pan_consent: e.target.checked })}
                  disabled={panVerified}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                />
                <span className="text-sm text-slate-600">
                  I/We consent to the use of PAN details for CKYC verification and agree to the{' '}
                  <a href="#" className="font-semibold text-indigo-600 hover:underline">
                    terms &amp; conditions
                  </a>
                  .
                </span>
              </label>

              {panError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /> {panError}
                </div>
              )}

              {!panVerified ? (
                <button
                  type="button"
                  onClick={handleVerifyPan}
                  disabled={loadingPan || !formData.pan_consent || (formData.pan_number || '').length < 10}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingPan ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Verifying...
                    </>
                  ) : (
                    <>
                      Verify PAN <ShieldCheck size={16} />
                    </>
                  )}
                </button>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check size={18} />
                    </div>
                    <p className="text-sm font-bold text-emerald-800">PAN Verified</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className={miniLabel}>Registered Name</p>
                      <p className="text-sm font-semibold text-slate-900">{panResult?.company_name || 'Not returned'}</p>
                    </div>
                    <div>
                      <p className={miniLabel}>PAN Number</p>
                      <p className="font-mono text-sm font-semibold text-slate-900">{formData.pan_number}</p>
                    </div>
                    {panResult?.cin_number ? (
                      <div>
                        <p className={miniLabel}>CIN</p>
                        <p className="font-mono text-sm font-semibold text-slate-900">{panResult.cin_number}</p>
                      </div>
                    ) : null}
                    <div>
                      <p className={miniLabel}>Status</p>
                      <p className="text-sm font-semibold text-emerald-700">{panResult?.valid ? 'Valid' : 'Returned'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Optional: Udyam (MSME) registration verify */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-1 flex items-center justify-between">
                  <label className={labelCls + ' mb-0'}>Udyam Registration <span className="font-normal text-slate-400">(optional)</span></label>
                  {udyamVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><Check size={14} /> Verified</span>
                  )}
                </div>
                <p className="mb-3 text-xs text-slate-500">Recommended for MSMEs - boosts your trust score.</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className={iconCls} size={18} />
                    <input
                      type="text"
                      value={formData.udyam_number || ''}
                      onChange={(e) => { updateFormData({ udyam_number: e.target.value.toUpperCase() }); setUdyamVerified(false); setUdyamResult(null); }}
                      disabled={udyamVerified}
                      className={inputCls + ' pl-11 uppercase disabled:opacity-60'}
                      placeholder="UDYAM-XX-00-0000000"
                    />
                  </div>
                  {!udyamVerified && (
                    <button
                      type="button"
                      onClick={handleVerifyUdyam}
                      disabled={loadingUdyam || !(formData.udyam_number || '').trim()}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingUdyam ? <Loader2 className="animate-spin" size={16} /> : 'Verify'}
                    </button>
                  )}
                </div>
                {udyamVerified && udyamResult && (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">{udyamResult.company_name}</p>
                )}
                {udyamError && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle size={13} /> {udyamError}</p>
                )}
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /> {submitError}
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex gap-3">
            <button type="button" onClick={goPrev} className={backBtnCls}>
              <ArrowLeft size={18} /> Back
            </button>
            {step < 3 ? (
              <button type="button" onClick={goNext} className={primaryBtnCls}>
                Continue <ArrowRight size={18} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={registering || !panVerified} className={primaryBtnCls}>
                {registering ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Submitting...
                  </>
                ) : (
                  <>
                    Complete Registration <Check size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
