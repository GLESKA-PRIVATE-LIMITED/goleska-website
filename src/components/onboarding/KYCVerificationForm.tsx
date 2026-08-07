import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onComplete: () => void;
  onBack: () => void;
  accountType: 'REGISTERED_BUSINESS' | 'REGISTERED_INDUSTRY' | 'UNREGISTERED_BUSINESS' | 'EMPLOYEE' | 'INDIVIDUAL' | null;
}

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400';
const primaryBtnCls = 'inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
const backBtnCls = 'inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50';
const verifyBtnCls = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50';

export default function KYCVerificationForm({ formData, updateFormData, onComplete, onBack, accountType }: Props) {
  const { user, session } = useAuth();
  
  const [loadingPan, setLoadingPan] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [directors, setDirectors] = useState<any[]>([]);
  
  const [loadingAadhaar, setLoadingAadhaar] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarMethod, setAadhaarMethod] = useState<'NUMBER' | 'DIGILOCKER'>('NUMBER');
  
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  // Handle returning from Digilocker
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('digilocker_check') === 'true') {
      const vid = localStorage.getItem('digilocker_vid');
      if (vid) {
        checkDigilockerStatus(vid);
      }
    }
  }, []);

  const checkDigilockerStatus = async (vid: string) => {
    setLoadingAadhaar(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/kyc/digilocker-status/${vid}`);
      if (!res.ok) throw new Error('Digilocker verification incomplete or failed');
      const data = await res.json();
      
      // Assume success if we get valid data back
      updateFormData({ aadhaar_details: data });
      setAadhaarVerified(true);
      // Clean up
      localStorage.removeItem('digilocker_vid');
      window.history.replaceState({}, '', window.location.pathname);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAadhaar(false);
    }
  };

  const handleVerifyPan = async () => {
    if (!formData.pan_number || formData.pan_number.length < 10) {
      setError('Please enter a valid 10-character PAN number.');
      return;
    }
    
    setLoadingPan(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/kyc/verify-pan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan_number: formData.pan_number })
      });
      
      if (!res.ok) throw new Error('PAN verification failed');
      const data = await res.json();
      
      updateFormData({ 
        cin_number: data.cin_number, 
        director_data: data.directors,
        pan_details: data.raw_details
      });
      setDirectors(data.directors);
      setPanVerified(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingPan(false);
    }
  };

  const handleVerifyCin = async () => {
    if (!formData.cin_number || formData.cin_number.length < 21) {
      setError('Please enter a valid 21-character CIN number.');
      return;
    }
    
    setLoadingPan(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/kyc/verify-cin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cin_number: formData.cin_number })
      });
      
      if (!res.ok) throw new Error('CIN verification failed');
      const data = await res.json();
      
      updateFormData({ 
        company_name: data.company_name, 
        director_data: data.directors,
        cin_details: data.raw_details
      });
      setDirectors(data.directors || []);
      setPanVerified(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingPan(false);
    }
  };

  const handleVerifyAadhaar = async () => {
    const cleanAadhaar = (formData.kyc_aadhaar_number || '').replace(/\D/g, '');
    
    if (cleanAadhaar.length !== 12) {
      setError('Please enter a valid 12-digit numeric Aadhaar number.');
      return;
    }
    
    setLoadingAadhaar(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/kyc/verify-aadhaar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aadhaar_number: cleanAadhaar,
          selected_director_name: formData.selected_director || null
        })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Aadhaar verification failed');
      }
      const data = await res.json();
      
      updateFormData({ aadhaar_details: data.raw_details, kyc_aadhaar_number: cleanAadhaar });
      setAadhaarVerified(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAadhaar(false);
    }
  };

  const handleDigilockerRedirect = async () => {
    setLoadingAadhaar(true);
    setError('');
    
    try {
      let redirectUrl = window.location.origin + window.location.pathname + '?digilocker_check=true';
      
      // Cashfree STRICTLY requires https:// for the redirect_url, even in sandbox testing.
      // If we are on localhost HTTP, we spoof it to HTTPS just to pass the API validation.
      const isLocal = redirectUrl.startsWith('http://localhost') || redirectUrl.startsWith('http://127.0.0.1');
      if (isLocal) {
        redirectUrl = redirectUrl.replace('http://', 'https://');
        toast.info("LOCAL DEV NOTICE: Cashfree requires an HTTPS redirect. After completing DigiLocker, Cashfree will redirect you to 'https://localhost...'. Your browser will show a connection error because localhost doesn't have SSL. When that happens, simply change 'https://' back to 'http://' in your address bar and hit Enter to continue!", { duration: 12000 });
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/kyc/create-digilocker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirect_url: redirectUrl })
      });
      
      if (!res.ok) {
         const errData = await res.json().catch(() => null);
         throw new Error(errData?.detail || 'Failed to create Digilocker session');
      }
      const data = await res.json();
      
      if (!data.action_url) {
         throw new Error('Cashfree did not return an action_url. Check API keys and Sandbox limits.');
      }
      
      localStorage.setItem('digilocker_vid', data.verification_id);
      window.location.href = data.action_url;
    } catch (err: any) {
      setError(err.message);
      setLoadingAadhaar(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountType !== 'INDIVIDUAL' && (!panVerified || !aadhaarVerified)) {
      setError('Please complete all KYC verifications.');
      return;
    }
    
    setRegistering(true);
    setError('');
    
    try {
      // Register with the backend
      const isWorker = accountType === 'EMPLOYEE' || accountType === 'INDIVIDUAL';
      const registerEndpoint = isWorker ? '/api/v1/workers/register' : '/api/v1/employers/register';
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${registerEndpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          account_type: accountType,
          phone: user?.phone,
          ...(isWorker && { latitude: 28.6139, longitude: 77.2090 }) // Mock location for MVP workers
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to register');
      }

      onComplete();
    } catch (err: any) {
      setError(err.message);
      setRegistering(false);
    }
  };

  if (accountType === 'INDIVIDUAL') {
    return (
      <div className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">No Verification Required</h2>
          <p className="mt-1 text-sm text-slate-500">You can proceed directly to your dashboard.</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className={backBtnCls}>
            <ArrowLeft size={18} /> Back
          </button>
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={registering}
            className={primaryBtnCls}
          >
            {registering ? <Loader2 className="animate-spin" size={18} /> : 'Complete Setup'} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl bg-indigo-50 p-4">
        <ShieldCheck className="mt-0.5 shrink-0 text-indigo-600" size={20} />
        <p className="text-sm text-indigo-900/80">Your documents are verified securely against the government registry and never stored in plain text.</p>
      </div>

      {/* Step 1: CIN or PAN */}
      <div className={`rounded-xl border p-5 ${panVerified ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs text-white">1</span>
            E-KYC via {(accountType === 'REGISTERED_BUSINESS' || accountType === 'REGISTERED_INDUSTRY') ? 'CIN' : 'PAN'}
          </h3>
          {panVerified && <CheckCircle2 className="text-emerald-600" size={18} />}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {(accountType === 'REGISTERED_BUSINESS' || accountType === 'REGISTERED_INDUSTRY') ? (
            <div className="relative flex-1">
              <Hash className={iconCls} size={18} />
              <input
                type="text"
                value={formData.cin_number || ''}
                onChange={(e) => updateFormData({ cin_number: e.target.value.toUpperCase() })}
                disabled={panVerified}
                className={inputCls + ' pl-11 uppercase disabled:opacity-60'}
                placeholder="U72900KA2015PTC083072"
                maxLength={21}
              />
            </div>
          ) : (
            <div className="relative flex-1">
              <Hash className={iconCls} size={18} />
              <input
                type="text"
                value={formData.pan_number || ''}
                onChange={(e) => updateFormData({ pan_number: e.target.value.toUpperCase() })}
                disabled={panVerified}
                className={inputCls + ' pl-11 uppercase disabled:opacity-60'}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </div>
          )}

          {!panVerified && (
            <button
              type="button"
              onClick={(accountType === 'REGISTERED_BUSINESS' || accountType === 'REGISTERED_INDUSTRY') ? handleVerifyCin : handleVerifyPan}
              disabled={loadingPan}
              className={verifyBtnCls}
            >
              {loadingPan ? <Loader2 className="animate-spin" size={18} /> : 'Verify'}
            </button>
          )}
        </div>

        {panVerified && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {(accountType === 'REGISTERED_BUSINESS' || accountType === 'REGISTERED_INDUSTRY') ? 'CIN Verified' : 'PAN Verified'}
            </p>
            <p className="mb-3 font-mono text-sm text-slate-900">{formData.company_name || formData.account_name || 'Verified Entity'}</p>

            {directors.length > 0 && (
              <>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Select Director for Aadhaar KYC</p>
                <div className="space-y-2">
                  {directors.map((d, i) => (
                    <label key={i} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50">
                      <input
                        type="radio"
                        name="selected_director"
                        className="h-4 w-4 accent-indigo-600"
                        onChange={() => updateFormData({ selected_director: d.name })}
                      />
                      <span className="text-sm font-semibold text-slate-800">{d.name} <span className="ml-1 font-normal text-slate-400">DIN: {d.din}</span></span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Aadhaar */}
      <div className={`rounded-xl border p-5 ${aadhaarVerified ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50/60'} ${!panVerified ? 'pointer-events-none opacity-50' : ''}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs text-white">2</span>
            {(accountType === 'REGISTERED_BUSINESS' || accountType === 'REGISTERED_INDUSTRY') ? 'Director ' : ''}Aadhaar KYC
          </h3>
          {aadhaarVerified && <CheckCircle2 className="text-emerald-600" size={18} />}
        </div>

        {!aadhaarVerified && (
          <div className="mb-4 flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="radio" checked={aadhaarMethod === 'NUMBER'} onChange={() => setAadhaarMethod('NUMBER')} className="h-4 w-4 accent-indigo-600" />
              <span className="text-sm font-semibold text-slate-700">Aadhaar Number (OTP)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="radio" checked={aadhaarMethod === 'DIGILOCKER'} onChange={() => setAadhaarMethod('DIGILOCKER')} className="h-4 w-4 accent-indigo-600" />
              <span className="text-sm font-semibold text-slate-700">DigiLocker</span>
            </label>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {aadhaarMethod === 'NUMBER' ? (
            <>
              <div className="relative flex-1">
                <Hash className={iconCls} size={18} />
                <input
                  type="text"
                  value={formData.kyc_aadhaar_number || ''}
                  onChange={(e) => updateFormData({ kyc_aadhaar_number: e.target.value })}
                  disabled={aadhaarVerified}
                  className={inputCls + ' pl-11 disabled:opacity-60'}
                  placeholder="0000 0000 0000"
                  maxLength={14}
                />
              </div>
              {!aadhaarVerified && (
                <button type="button" onClick={handleVerifyAadhaar} disabled={loadingAadhaar} className={verifyBtnCls}>
                  {loadingAadhaar ? <Loader2 className="animate-spin" size={18} /> : 'Verify'}
                </button>
              )}
            </>
          ) : (
            <div className="flex-1">
              {!aadhaarVerified && (
                <button
                  type="button"
                  onClick={handleDigilockerRedirect}
                  disabled={loadingAadhaar}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1e3a8a] disabled:opacity-50"
                >
                  {loadingAadhaar ? <Loader2 className="animate-spin" size={18} /> : 'Continue with DigiLocker'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className={backBtnCls}>
          <ArrowLeft size={18} /> Back
        </button>
        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={!panVerified || !aadhaarVerified || registering}
          className={primaryBtnCls}
        >
          {registering ? <Loader2 className="animate-spin" size={18} /> : 'Complete Setup'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
