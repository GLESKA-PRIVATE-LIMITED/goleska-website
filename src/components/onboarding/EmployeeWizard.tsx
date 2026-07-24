"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import MapPicker from '../dashboard/MapPicker';
import {
  User,
  MapPin,
  ShieldCheck,
  ClipboardCheck,
  Check,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Hash,
  Home,
  FileText,
  Camera,
  Droplet,
  Phone,
  Mail,
  AlertCircle,
  Zap,
  CheckCircle2,
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
const fileCls =
  'block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-500 file:mr-4 file:cursor-pointer file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:opacity-90';
const primaryBtnCls =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
const secondaryBtnCls =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50';

const STEPS = [
  { icon: User, title: 'Personal Details', subtitle: 'Tell us about you' },
  { icon: MapPin, title: 'Address Details', subtitle: 'Where you are based' },
  { icon: ShieldCheck, title: 'Verification', subtitle: 'PAN + ID & liveness' },
  { icon: ClipboardCheck, title: 'Review & Submit', subtitle: 'Confirm and finish' },
];

const HEADING_SUB = [
  'Basic details so employers know who they are hiring.',
  'Where you live and your current location.',
  'Verify your PAN, then your government ID and a live selfie.',
  'Confirm your details and finish registration.',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

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
        stroke="url(#empWizardProgressGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
      />
      <defs>
        <linearGradient id="empWizardProgressGrad" x1="0" y1="0" x2="1" y2="1">
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
 * EMPLOYEE ("Employment Candidate") onboarding wizard. Same 4-step left-rail
 * structure as the business/industry wizards. Steps 1-2 reuse EmployeeForm's
 * exact personal + address fields. Step 3 does REAL verification: a public PAN
 * check (/kyc/verify-pan), then a government-ID upload + selfie face-match
 * liveness (the worker endpoints under /auth/worker/*).
 *
 * Ordering note: the ID-upload and liveness endpoints resolve the worker from
 * the JWT and 401 if the worker row does not exist yet, so the account must be
 * registered before those calls. We therefore register the worker lazily
 * (ensureRegistered) the first time it is needed - when uploading the ID - and
 * the final "Submit" button calls the very same register endpoint (idempotent,
 * a no-op if it already ran). Aadhaar is intentionally NOT part of this flow.
 */
export default function EmployeeWizard({ formData, updateFormData, onBackToStart, onComplete }: Props) {
  const { user, session } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const totalSteps = 4;
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState('');

  // Registration is done once and reused. It must precede ID/liveness because
  // those endpoints require an existing worker row (resolved from the JWT).
  const registeredRef = useRef(false);

  // PAN
  const [loadingPan, setLoadingPan] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [panResult, setPanResult] = useState<{ valid: boolean; name: string } | null>(null);
  const [panError, setPanError] = useState('');

  // Government ID upload
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const [idError, setIdError] = useState('');

  // Liveness / face-match selfie
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [verifyingLiveness, setVerifyingLiveness] = useState(false);
  const [livenessVerified, setLivenessVerified] = useState(false);
  const [livenessError, setLivenessError] = useState('');

  // Final submit
  const [registering, setRegistering] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const percent = Math.round((step / totalSteps) * 100);

  const composedName = () =>
    (formData.name || `${formData.first_name || ''} ${formData.last_name || ''}`).trim();

  const handleAddressChange = (value: string, field: string) => {
    updateFormData({
      permanent_address: { ...(formData.permanent_address || {}), [field]: value },
    });
  };

  // Registers the worker exactly once. Treats an "already registered" response
  // as success so the flow is safe to call from both ID-upload and final submit.
  const ensureRegistered = async (): Promise<boolean> => {
    if (registeredRef.current) return true;
    const res = await fetch(`${backendUrl}/api/v1/workers/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        ...formData,
        account_type: 'EMPLOYEE',
        name: composedName(),
        phone: user?.phone,
        latitude: formData.latitude ?? 28.6139,
        longitude: formData.longitude ?? 77.209,
      }),
    });
    if (res.ok) {
      registeredRef.current = true;
      return true;
    }
    const err = await res.json().catch(() => null);
    const detail = (err?.detail || '').toString().toLowerCase();
    if (detail.includes('already')) {
      registeredRef.current = true;
      return true;
    }
    throw new Error(err?.detail || 'Could not create your worker account. Please try again.');
  };

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
      const res = await fetch(`${backendUrl}/api/v1/kyc/verify-pan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan_number: formData.pan_number }),
      });
      if (!res.ok) throw new Error('PAN verification failed. Please check the number and try again.');
      const data = await res.json();
      setPanResult({ valid: data.valid, name: data.company_name });
      setPanVerified(true);
      updateFormData({ pan_details: data.raw_details });
    } catch (err: any) {
      setPanVerified(false);
      setPanResult(null);
      setPanError(err.message || 'PAN verification failed. Please try again.');
    } finally {
      setLoadingPan(false);
    }
  };

  const handleUploadId = async () => {
    setIdError('');
    if (!idFile) {
      setIdError('Please choose a government ID image to upload.');
      return;
    }
    setUploadingId(true);
    try {
      // The upload endpoint needs an existing worker row - register first.
      await ensureRegistered();
      const fd = new FormData();
      fd.append('file', idFile);
      const res = await fetch(`${backendUrl}/api/v1/auth/worker/upload-id`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'ID upload failed. Please try again.');
      }
      const data = await res.json();
      setIdUploaded(true);
      updateFormData({ kyc_document_url: data.kyc_document_url });
    } catch (err: any) {
      setIdUploaded(false);
      setIdError(err.message || 'ID upload failed. Please try again.');
    } finally {
      setUploadingId(false);
    }
  };

  const handleVerifyLiveness = async () => {
    setLivenessError('');
    if (!idUploaded) {
      setLivenessError('Please upload your government ID first.');
      return;
    }
    if (!selfieFile) {
      setLivenessError('Please choose a selfie to verify.');
      return;
    }
    setVerifyingLiveness(true);
    try {
      const fd = new FormData();
      fd.append('file', selfieFile);
      const res = await fetch(`${backendUrl}/api/v1/auth/worker/liveness`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Face match failed. Make sure your selfie clearly matches your ID.');
      }
      setLivenessVerified(true);
    } catch (err: any) {
      setLivenessVerified(false);
      setLivenessError(err.message || 'Liveness verification failed. Please try again.');
    } finally {
      setVerifyingLiveness(false);
    }
  };

  const goNext = () => {
    setStepError('');
    if (step === 1) {
      if (!formData.first_name || !formData.last_name) {
        setStepError('First and last name are required.');
        return;
      }
      if (!formData.alternate_phone || formData.alternate_phone.length < 10) {
        setStepError('A valid alternate phone is required.');
        return;
      }
      updateFormData({ name: `${formData.first_name} ${formData.last_name}` });
    }
    if (step === 3) {
      if (!panVerified) {
        setStepError('Please verify your PAN before continuing.');
        return;
      }
      if (!idUploaded) {
        setStepError('Please upload your government ID before continuing.');
        return;
      }
      if (!livenessVerified) {
        setStepError('Please complete the liveness (face-match) check before continuing.');
        return;
      }
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
      // Reuses the exact worker registration call. Already ran during the ID
      // step, so this is a no-op in the normal flow.
      await ensureRegistered();
      onComplete();
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
      setRegistering(false);
    }
  };

  const addr = formData.permanent_address || {};
  const fullAddress = [addr.address_line_1, addr.address_line_2, addr.city, addr.pincode, addr.state, addr.country]
    .filter(Boolean)
    .join(', ');
  const locationPinned = formData.latitude != null && formData.longitude != null;

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
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Employment Candidate</p>
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

            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>First Name *</label>
                    <div className="relative">
                      <User className={iconCls} size={18} />
                      <input
                        type="text"
                        value={formData.first_name || ''}
                        onChange={(e) => updateFormData({ first_name: e.target.value })}
                        className={inputCls + ' pl-11'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Last Name *</label>
                    <div className="relative">
                      <User className={iconCls} size={18} />
                      <input
                        type="text"
                        value={formData.last_name || ''}
                        onChange={(e) => updateFormData({ last_name: e.target.value })}
                        className={inputCls + ' pl-11'}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Email</label>
                  <div className="relative">
                    <Mail className={iconCls} size={18} />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      className={inputCls + ' pl-11'}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Alternate Phone *</label>
                  <div className="relative">
                    <Phone className={iconCls} size={18} />
                    <input
                      type="tel"
                      value={formData.alternate_phone || ''}
                      onChange={(e) => updateFormData({ alternate_phone: e.target.value })}
                      className={inputCls + ' pl-11'}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Blood Group</label>
                  <div className="relative">
                    <Droplet className={iconCls} size={18} />
                    <select
                      value={formData.blood_group || ''}
                      onChange={(e) => updateFormData({ blood_group: e.target.value })}
                      className={inputCls + ' pl-11'}
                    >
                      <option value="">Select...</option>
                      {BLOOD_GROUPS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className={labelCls + ' mb-0'}>Police Verification Cert.</label>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Optional</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => updateFormData({ police_verification_file: reader.result });
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={fileCls}
                  />
                  {formData.police_verification_file && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={12} /> File attached
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Address Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Address Line 1</label>
                  <div className="relative">
                    <Home className={iconCls} size={18} />
                    <input
                      type="text"
                      placeholder="Flat, Building, Block"
                      value={addr.address_line_1 || ''}
                      onChange={(e) => handleAddressChange(e.target.value, 'address_line_1')}
                      className={inputCls + ' pl-11'}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Address Line 2</label>
                  <input
                    type="text"
                    placeholder="Street, Area, Landmark"
                    value={addr.address_line_2 || ''}
                    onChange={(e) => handleAddressChange(e.target.value, 'address_line_2')}
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>City</label>
                    <input
                      type="text"
                      value={addr.city || ''}
                      onChange={(e) => handleAddressChange(e.target.value, 'city')}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Pincode</label>
                    <input
                      type="text"
                      value={addr.pincode || ''}
                      onChange={(e) => handleAddressChange(e.target.value, 'pincode')}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>State</label>
                    <input
                      type="text"
                      value={addr.state || ''}
                      onChange={(e) => handleAddressChange(e.target.value, 'state')}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Country</label>
                    <input
                      type="text"
                      value={addr.country || ''}
                      onChange={(e) => handleAddressChange(e.target.value, 'country')}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Pin Your Current Location</label>
                  <MapPicker
                    latitude={formData.latitude || null}
                    longitude={formData.longitude || null}
                    onChange={(lat, lng) => updateFormData({ latitude: lat, longitude: lng })}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Verification - PAN + ID + liveness */}
            {step === 3 && (
              <div className="space-y-5">
                {/* PAN */}
                <div className={`rounded-xl border p-5 ${panVerified ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50/60'}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs text-white">1</span>
                      PAN Verification
                    </h3>
                    {panVerified && <CheckCircle2 className="text-emerald-600" size={18} />}
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
                        className={inputCls + ' bg-white pl-11 uppercase disabled:opacity-60'}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>

                  <label className="mt-3 flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={!!formData.pan_consent}
                      onChange={(e) => updateFormData({ pan_consent: e.target.checked })}
                      disabled={panVerified}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                    />
                    <span className="text-sm text-slate-600">
                      I consent to the use of my PAN details for KYC verification and agree to the{' '}
                      <a href="#" className="font-semibold text-indigo-600 hover:underline">terms &amp; conditions</a>.
                    </span>
                  </label>

                  {panError && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" /> {panError}
                    </div>
                  )}

                  {!panVerified ? (
                    <button
                      type="button"
                      onClick={handleVerifyPan}
                      disabled={loadingPan || !formData.pan_consent || (formData.pan_number || '').length < 10}
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Check size={16} className="text-emerald-600" />
                        <p className="text-sm font-bold text-emerald-800">PAN Verified</p>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <p className={miniLabel}>Name on PAN</p>
                          <p className="text-sm font-semibold text-slate-900">{panResult?.name || 'Not returned'}</p>
                        </div>
                        <div>
                          <p className={miniLabel}>PAN Number</p>
                          <p className="font-mono text-sm font-semibold text-slate-900">{formData.pan_number}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Government ID + Liveness */}
                <div className={`rounded-xl border p-5 ${livenessVerified ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50/60'}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs text-white">2</span>
                      Government ID &amp; Liveness
                    </h3>
                    {livenessVerified && <CheckCircle2 className="text-emerald-600" size={18} />}
                  </div>

                  {/* Sub-step A: ID upload */}
                  <div className="mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-indigo-500" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upload Government ID</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    disabled={idUploaded}
                    onChange={(e) => {
                      setIdFile(e.target.files?.[0] || null);
                      setIdError('');
                    }}
                    className={fileCls + ' disabled:opacity-60'}
                  />
                  {idError && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" /> {idError}
                    </div>
                  )}
                  {!idUploaded ? (
                    <button
                      type="button"
                      onClick={handleUploadId}
                      disabled={uploadingId || !idFile}
                      className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadingId ? (
                        <>
                          <Loader2 className="animate-spin" size={18} /> Uploading...
                        </>
                      ) : (
                        <>
                          Upload ID <FileText size={16} />
                        </>
                      )}
                    </button>
                  ) : (
                    <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                      <Check size={16} /> Government ID uploaded
                    </p>
                  )}

                  {/* Sub-step B: Selfie liveness / face-match */}
                  <div className={`mt-5 border-t border-slate-200 pt-5 ${!idUploaded ? 'pointer-events-none opacity-50' : ''}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <Camera size={16} className="text-indigo-500" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Selfie Liveness (Face Match)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      disabled={livenessVerified}
                      onChange={(e) => {
                        setSelfieFile(e.target.files?.[0] || null);
                        setLivenessError('');
                      }}
                      className={fileCls + ' disabled:opacity-60'}
                    />
                    {livenessError && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" /> {livenessError}
                      </div>
                    )}
                    {!livenessVerified ? (
                      <button
                        type="button"
                        onClick={handleVerifyLiveness}
                        disabled={verifyingLiveness || !idUploaded || !selfieFile}
                        className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {verifyingLiveness ? (
                          <>
                            <Loader2 className="animate-spin" size={18} /> Matching...
                          </>
                        ) : (
                          <>
                            Verify Liveness <Camera size={16} />
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Check size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-emerald-800">Face Match Verified</p>
                            <p className="text-xs text-slate-500">Your selfie matched the uploaded ID.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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

                <ReviewSection title="Personal Details" onEdit={() => setStep(1)}>
                  <ReviewRow label="Name" value={composedName()} />
                  <ReviewRow label="Email" value={formData.email} />
                  <ReviewRow label="Alternate Phone" value={formData.alternate_phone} />
                  <ReviewRow label="Blood Group" value={formData.blood_group} />
                  <ReviewRow label="Police Verification" value={formData.police_verification_file ? 'Attached' : 'Not provided'} />
                </ReviewSection>

                <ReviewSection title="Address Details" onEdit={() => setStep(2)}>
                  <ReviewRow label="Address" value={fullAddress} />
                  <ReviewRow label="Location Pin" value={locationPinned ? 'Pinned' : 'Not pinned'} />
                </ReviewSection>

                <ReviewSection title="Verification" onEdit={() => setStep(3)}>
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
                  <ReviewRow
                    label="Government ID"
                    value={
                      idUploaded ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Check size={14} /> Uploaded
                        </span>
                      ) : (
                        'Not uploaded'
                      )
                    }
                  />
                  <ReviewRow
                    label="Liveness (Face Match)"
                    value={
                      livenessVerified ? (
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
