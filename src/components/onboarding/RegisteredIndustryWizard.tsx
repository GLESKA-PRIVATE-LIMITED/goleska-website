"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Factory,
  ShieldCheck,
  Landmark,
  ClipboardCheck,
  Check,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Tag,
  Hash,
  Calendar,
  Building2,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onBackToStart: () => void;
  onComplete: () => void;
}

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100';
const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400';
const miniLabel = 'mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400';
const primaryBtnCls =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
const secondaryBtnCls =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50';

const STEPS = [
  { icon: Factory, title: 'Industry Details', subtitle: 'Your industry registration' },
  { icon: ShieldCheck, title: 'KYC Information', subtitle: 'Verify your PAN' },
  { icon: Landmark, title: 'Bank Account Setup', subtitle: 'Add payout account' },
  { icon: ClipboardCheck, title: 'Review & Submit', subtitle: 'Confirm and finish' },
];

const HEADING_SUB = [
  'Tell us about your registered industry.',
  'Verify your industry PAN with CKYC.',
  'Add the bank account for your payouts.',
  'Confirm your details and finish registration.',
];

const INDUSTRY_TYPES = [
  'Manufacturing',
  'Textiles & Apparel',
  'Chemicals',
  'Automotive',
  'Food Processing',
  'Pharmaceuticals',
  'Steel & Metals',
  'Electronics',
  'Construction Materials',
  'Heavy Machinery',
  'Other',
];

function ProgressRing({ percent }: { percent: number }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="url(#indWizardProgressGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
      />
      <defs>
        <linearGradient id="indWizardProgressGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <text x="32" y="37" textAnchor="middle" className="fill-slate-900 text-sm font-bold">
        {percent}%
      </text>
    </svg>
  );
}

function ReviewRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-800">{value || '-'}</span>
    </div>
  );
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-indigo-600 transition hover:underline">
          Edit
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/**
 * REGISTERED_INDUSTRY onboarding wizard. Same 4-step left-rail structure as
 * RegisteredBusinessWizard; only Step 1 differs (industry-specific fields).
 * Steps 2 (PAN KYC) and 3 (bank penny-drop) reuse the exact same real
 * verification logic. Industry Name doubles as the required company_name.
 */
export default function RegisteredIndustryWizard({ formData, updateFormData, onBackToStart, onComplete }: Props) {
  const { user, session } = useAuth();
  const totalSteps = 4;
  const [step, setStep] = useState(1);

  const [loadingPan, setLoadingPan] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [panResult, setPanResult] = useState<{ valid: boolean; company_name: string; cin_number: string } | null>(null);
  const [panError, setPanError] = useState('');

  const [loadingBank, setLoadingBank] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);
  const [bankResult, setBankResult] = useState<{ valid: boolean; account_name: string; bank_name?: string } | null>(null);
  const [bankError, setBankError] = useState('');

  const [registering, setRegistering] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [stepError, setStepError] = useState('');

  const percent = Math.round((step / totalSteps) * 100);

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

  const handleVerifyBank = async () => {
    setBankError('');
    if (!formData.bank_account_number?.trim() || !formData.bank_ifsc?.trim()) {
      setBankError('Please enter your account number and IFSC code.');
      return;
    }

    setLoadingBank(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/kyc/penny-drop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_number: formData.bank_account_number, ifsc: formData.bank_ifsc }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Bank verification failed. Please check the details and try again.');
      }
      const data = await res.json();
      if (!data.valid) {
        throw new Error('We could not verify this bank account. Please check the account number and IFSC.');
      }

      setBankResult({ valid: data.valid, account_name: data.account_name, bank_name: data.bank_name });
      setBankVerified(true);
      updateFormData({
        bank_verified: true,
        bank_account_holder_name: formData.bank_account_holder_name || data.account_name,
      });
    } catch (err: any) {
      setBankVerified(false);
      setBankResult(null);
      updateFormData({ bank_verified: false });
      setBankError(err.message || 'Bank verification failed. Please try again.');
    } finally {
      setLoadingBank(false);
    }
  };

  const goNext = () => {
    setStepError('');
    if (step === 1) {
      if (!(formData.industry_name?.trim() || formData.company_name?.trim())) {
        setStepError('Please enter the industry / company name.');
        return;
      }
    }
    if (step === 2 && !panVerified) {
      setStepError('Please verify your PAN before continuing.');
      return;
    }
    if (step === 3 && !bankVerified) {
      setStepError('Please verify your bank account before continuing.');
      return;
    }
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const goPrev = () => {
    setStepError('');
    if (step === 1) {
      onBackToStart();
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setSubmitError('');
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
          account_type: 'REGISTERED_INDUSTRY',
          phone: user?.phone,
          // A freshly submitted registration is pending admin verification.
          registration_status: formData.registration_status || 'Pending',
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

  const maskedAccount = formData.bank_account_number
    ? `•••• ${String(formData.bank_account_number).slice(-4)}`
    : '-';

  return (
    <div className="flex min-h-screen w-full bg-[#eef1fb] font-sans text-slate-900">
      {/* LEFT RAIL */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-slate-200 bg-white p-8 lg:flex xl:w-96 xl:p-10">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <span className="font-[var(--font-anton)] text-xl uppercase tracking-wider text-slate-900">GO LESKA</span>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <ProgressRing percent={percent} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Industry Registration</p>
            <p className="text-lg font-extrabold text-slate-900">
              Step {step} of {totalSteps}
            </p>
          </div>
        </div>

        <div className="relative">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const isCompleted = step > n;
            const isCurrent = step === n;
            const Icon = s.icon;
            return (
              <div key={n} className="relative flex gap-4 pb-8 last:pb-0">
                {i < STEPS.length - 1 && (
                  <span
                    className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${
                      isCompleted ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : 'border-2 border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : isCurrent ? <Icon size={18} /> : n}
                </div>
                <div className="pt-1.5">
                  <p className={`text-sm font-bold ${isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}</p>
                  <p className="text-xs text-slate-400">{s.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-10">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Zap size={16} className="text-white" fill="currentColor" />
            </div>
            <span className="font-[var(--font-anton)] text-lg uppercase tracking-wider text-slate-900">GO LESKA</span>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            Step {step}/{totalSteps}
          </span>
        </div>

        <div className="mx-auto w-full max-w-2xl flex-1">
          <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900">{STEPS[step - 1].title}</h1>
              <p className="mt-1 text-sm text-slate-500">{HEADING_SUB[step - 1]}</p>
            </div>

            {stepError && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {stepError}
              </div>
            )}

            {/* STEP 1: Industry Details (new real fields) */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Industry Name *</label>
                  <div className="relative">
                    <Factory className={iconCls} size={18} />
                    <input
                      type="text"
                      value={formData.industry_name || formData.company_name || ''}
                      onChange={(e) => updateFormData({ industry_name: e.target.value, company_name: e.target.value })}
                      className={inputCls + ' pl-11'}
                      placeholder="Tata Steel Works"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Industry Type</label>
                    <div className="relative">
                      <Tag className={iconCls} size={18} />
                      <select
                        value={formData.industry_type || ''}
                        onChange={(e) => updateFormData({ industry_type: e.target.value })}
                        className={inputCls + ' pl-11'}
                      >
                        <option value="">Select...</option>
                        {INDUSTRY_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>NIC Code</label>
                    <div className="relative">
                      <Hash className={iconCls} size={18} />
                      <input
                        type="text"
                        value={formData.nic_code || ''}
                        onChange={(e) => updateFormData({ nic_code: e.target.value })}
                        className={inputCls + ' pl-11'}
                        placeholder="e.g. 24105"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Registration Number</label>
                    <div className="relative">
                      <Hash className={iconCls} size={18} />
                      <input
                        type="text"
                        value={formData.registration_number || ''}
                        onChange={(e) => updateFormData({ registration_number: e.target.value })}
                        className={inputCls + ' pl-11'}
                        placeholder="REG-000000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Registration Date</label>
                    <div className="relative">
                      <Calendar className={iconCls} size={18} />
                      <input
                        type="date"
                        value={formData.registration_date || ''}
                        onChange={(e) => updateFormData({ registration_date: e.target.value })}
                        className={inputCls + ' pl-11'}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Regulatory Authority</label>
                  <div className="relative">
                    <Building2 className={iconCls} size={18} />
                    <input
                      type="text"
                      value={formData.regulatory_authority || ''}
                      onChange={(e) => updateFormData({ regulatory_authority: e.target.value })}
                      className={inputCls + ' pl-11'}
                      placeholder="e.g. Ministry of MSME"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: KYC Information - real PAN verify + confirmation (shared pattern) */}
            {step === 2 && (
              <div className="space-y-5">
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
              </div>
            )}

            {/* STEP 3: Bank Account Setup - real penny-drop verification (shared pattern) */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-xl bg-indigo-50 p-4">
                  <ShieldCheck className="mt-0.5 shrink-0 text-indigo-600" size={20} />
                  <p className="text-sm text-indigo-900/80">
                    Your payout account is verified with a secure penny-drop check against the bank registry.
                  </p>
                </div>

                <div>
                  <label className={labelCls}>Account Holder Name</label>
                  <div className="relative">
                    <Landmark className={iconCls} size={18} />
                    <input
                      type="text"
                      value={formData.bank_account_holder_name || ''}
                      onChange={(e) => updateFormData({ bank_account_holder_name: e.target.value })}
                      disabled={bankVerified}
                      className={inputCls + ' pl-11 disabled:opacity-60'}
                      placeholder="Registered account name"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Account Number *</label>
                  <div className="relative">
                    <Hash className={iconCls} size={18} />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.bank_account_number || ''}
                      onChange={(e) => {
                        updateFormData({ bank_account_number: e.target.value.replace(/\D/g, ''), bank_verified: false });
                        setBankVerified(false);
                        setBankResult(null);
                      }}
                      disabled={bankVerified}
                      className={inputCls + ' pl-11 disabled:opacity-60'}
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>IFSC Code *</label>
                  <div className="relative">
                    <Hash className={iconCls} size={18} />
                    <input
                      type="text"
                      value={formData.bank_ifsc || ''}
                      onChange={(e) => {
                        updateFormData({ bank_ifsc: e.target.value.toUpperCase(), bank_verified: false });
                        setBankVerified(false);
                        setBankResult(null);
                      }}
                      disabled={bankVerified}
                      maxLength={11}
                      className={inputCls + ' pl-11 uppercase disabled:opacity-60'}
                      placeholder="HDFC0001234"
                    />
                  </div>
                </div>

                {bankError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> {bankError}
                  </div>
                )}

                {!bankVerified ? (
                  <button
                    type="button"
                    onClick={handleVerifyBank}
                    disabled={loadingBank || !(formData.bank_account_number || '').trim() || !(formData.bank_ifsc || '').trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingBank ? (
                      <>
                        <Loader2 className="animate-spin" size={18} /> Verifying...
                      </>
                    ) : (
                      <>
                        Verify Account <ShieldCheck size={16} />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check size={18} />
                      </div>
                      <p className="text-sm font-bold text-emerald-800">Bank Account Verified</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className={miniLabel}>Account Holder</p>
                        <p className="text-sm font-semibold text-slate-900">{bankResult?.account_name || formData.bank_account_holder_name || '-'}</p>
                      </div>
                      <div>
                        <p className={miniLabel}>Account Number</p>
                        <p className="font-mono text-sm font-semibold text-slate-900">{maskedAccount}</p>
                      </div>
                      {bankResult?.bank_name ? (
                        <div>
                          <p className={miniLabel}>Bank</p>
                          <p className="text-sm font-semibold text-slate-900">{bankResult.bank_name}</p>
                        </div>
                      ) : null}
                      <div>
                        <p className={miniLabel}>Status</p>
                        <p className="text-sm font-semibold text-emerald-700">{bankResult?.valid ? 'Valid' : 'Verified'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Review & Submit */}
            {step === 4 && (
              <div className="space-y-4">
                {submitError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> {submitError}
                  </div>
                )}

                <ReviewSection title="Industry Details" onEdit={() => setStep(1)}>
                  <ReviewRow label="Industry Name" value={formData.industry_name || formData.company_name} />
                  <ReviewRow label="Industry Type" value={formData.industry_type} />
                  <ReviewRow label="NIC Code" value={formData.nic_code} />
                  <ReviewRow label="Registration Number" value={formData.registration_number} />
                  <ReviewRow label="Registration Date" value={formData.registration_date} />
                  <ReviewRow label="Regulatory Authority" value={formData.regulatory_authority} />
                </ReviewSection>

                <ReviewSection title="KYC Information" onEdit={() => setStep(2)}>
                  <ReviewRow label="PAN Number" value={formData.pan_number} />
                  <ReviewRow
                    label="PAN Status"
                    value={
                      panVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Check size={14} /> Verified
                        </span>
                      ) : (
                        'Not verified'
                      )
                    }
                  />
                  {panResult?.company_name ? <ReviewRow label="Registered Name" value={panResult.company_name} /> : null}
                  {formData.cin_number ? <ReviewRow label="CIN" value={formData.cin_number} /> : null}
                </ReviewSection>

                <ReviewSection title="Bank Account" onEdit={() => setStep(3)}>
                  <ReviewRow label="Account Holder" value={formData.bank_account_holder_name} />
                  <ReviewRow label="Account Number" value={maskedAccount} />
                  <ReviewRow label="IFSC Code" value={formData.bank_ifsc} />
                  <ReviewRow
                    label="Verification"
                    value={
                      bankVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Check size={14} /> Verified
                        </span>
                      ) : (
                        'Not verified'
                      )
                    }
                  />
                </ReviewSection>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={goPrev} className={secondaryBtnCls}>
                <ArrowLeft size={18} /> Previous
              </button>
              {step < totalSteps ? (
                <button type="button" onClick={goNext} className={primaryBtnCls}>
                  Save &amp; Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={registering} className={primaryBtnCls}>
                  {registering ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Submitting...
                    </>
                  ) : (
                    <>
                      Submit Registration <Check size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
