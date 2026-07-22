import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, Store, Mail, Phone, Hash, User, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onComplete: () => void;
  onBack: () => void;
}

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100';
const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400';
const primaryBtnCls = 'inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
const backBtnCls = 'inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50';
const verifyBtnCls = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50';

export default function UnregisteredBusinessForm({ formData, updateFormData, onComplete, onBack }: Props) {
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loadingUdyam, setLoadingUdyam] = useState(false);
  const [udyamVerified, setUdyamVerified] = useState(false);

  const handleVerifyUdyam = async () => {
    if (!formData.udyam_number) {
      setError('Please enter a Udyam number.');
      return;
    }
    
    setLoadingUdyam(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/kyc/verify-udyam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ udyam_number: formData.udyam_number })
      });
      
      if (!res.ok) throw new Error('Udyam verification failed');
      const data = await res.json();
      
      updateFormData({ udyam_details: data.raw_details });
      setUdyamVerified(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingUdyam(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

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
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Number of Proprietors</label>
              <div className="relative">
                <Users className={iconCls} size={18} />
                <input
                  type="number"
                  value={formData.num_proprietors || 1}
                  onChange={(e) => updateFormData({ num_proprietors: parseInt(e.target.value) })}
                  className={inputCls + ' pl-11'}
                  min={1}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Enterprise Email</label>
              <div className="relative">
                <Mail className={iconCls} size={18} />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateFormData({ email: e.target.value })}
                  className={inputCls + ' pl-11'}
                  placeholder="shop@example.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Enterprise Phone Number *</label>
              <div className="relative">
                <Phone className={iconCls} size={18} />
                <input
                  type="tel"
                  value={formData.enterprise_phone || ''}
                  onChange={(e) => updateFormData({ enterprise_phone: e.target.value })}
                  className={inputCls + ' pl-11'}
                  placeholder="Required"
                  required
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className={labelCls + ' mb-0'}>GST Number</label>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Optional</span>
              </div>
              <div className="relative">
                <Hash className={iconCls} size={18} />
                <input
                  type="text"
                  value={formData.gstin || ''}
                  onChange={(e) => updateFormData({ gstin: e.target.value.toUpperCase() })}
                  className={inputCls + ' pl-11 uppercase'}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${udyamVerified ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50/60'}`}>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={labelCls + ' mb-0'}>Udyam / MSME Certificate Number</label>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Optional</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Hash className={iconCls} size={18} />
                <input
                  type="text"
                  value={formData.udyam_number || ''}
                  onChange={(e) => updateFormData({ udyam_number: e.target.value.toUpperCase() })}
                  disabled={udyamVerified}
                  className={inputCls + ' pl-11 uppercase disabled:opacity-60'}
                  placeholder="UDYAM-XX-00-0000000"
                />
              </div>
              {!udyamVerified && formData.udyam_number && (
                <button
                  type="button"
                  onClick={handleVerifyUdyam}
                  disabled={loadingUdyam}
                  className={verifyBtnCls}
                >
                  {loadingUdyam ? <Loader2 className="animate-spin" size={18} /> : 'Verify'}
                </button>
              )}
            </div>
            {udyamVerified && (
              <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={16} /> Udyam Verified Successfully
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onBack} className={backBtnCls}>
              <ArrowLeft size={18} /> Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (!formData.company_name || !formData.email) {
                  setError('Enterprise Name and Email are required');
                  return;
                }
                if (!formData.enterprise_phone || formData.enterprise_phone.length < 10) {
                  setError('Valid Enterprise Phone is required');
                  return;
                }
                setError('');
                setStep(2);
              }}
              className={primaryBtnCls}
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-in fade-in">
          <div>
            <label className={labelCls}>Proprietor Name *</label>
            <div className="relative">
              <User className={iconCls} size={18} />
              <input
                type="text"
                value={formData.proprietor_name || ''}
                onChange={(e) => updateFormData({ proprietor_name: e.target.value })}
                className={inputCls + ' pl-11'}
                placeholder="Rahul Sharma"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(1)} className={backBtnCls}>
              <ArrowLeft size={18} /> Back
            </button>
            <button type="button" onClick={onComplete} className={primaryBtnCls}>
              Continue <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
