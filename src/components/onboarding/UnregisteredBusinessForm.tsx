import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onComplete: () => void;
  onBack: () => void;
}

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
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border-2 border-red-500 p-3 font-bold text-red-700 text-sm">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <label className="block font-bold uppercase text-xs tracking-widest mb-2">Name of Enterprise *</label>
            <input 
              type="text" 
              value={formData.company_name || ''}
              onChange={(e) => updateFormData({ company_name: e.target.value })}
              className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
              placeholder="Raju Welding Shop"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2">Number of Proprietors</label>
              <input 
                type="number" 
                value={formData.num_proprietors || 1}
                onChange={(e) => updateFormData({ num_proprietors: parseInt(e.target.value) })}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
                min={1}
              />
            </div>
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2">Enterprise Email</label>
              <input 
                type="email" 
                value={formData.email || ''}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
                placeholder="shop@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2 flex justify-between">
                <span>Enterprise Phone Number *</span>
              </label>
              <input 
                type="tel" 
                value={formData.enterprise_phone || ''}
                onChange={(e) => updateFormData({ enterprise_phone: e.target.value })}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
                placeholder="Required"
                required
              />
            </div>
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2 flex justify-between">
                <span>GST Number</span>
                <span className="text-gray-400">Optional</span>
              </label>
              <input 
                type="text" 
                value={formData.gstin || ''}
                onChange={(e) => updateFormData({ gstin: e.target.value.toUpperCase() })}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50 uppercase"
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
            </div>
          </div>
          
          <div className={`p-4 border-2 border-[var(--color-charcoal)] ${udyamVerified ? 'bg-green-50' : 'bg-transparent'}`}>
            <label className="block font-bold uppercase text-xs tracking-widest mb-2 flex justify-between">
              <span>Udyam / MSME Certificate Number</span>
              <span className="text-gray-400">Optional</span>
            </label>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={formData.udyam_number || ''}
                onChange={(e) => updateFormData({ udyam_number: e.target.value.toUpperCase() })}
                disabled={udyamVerified}
                className="flex-1 border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50 uppercase disabled:bg-gray-200"
                placeholder="UDYAM-XX-00-0000000"
              />
              {!udyamVerified && formData.udyam_number && (
                <button 
                  type="button" 
                  onClick={handleVerifyUdyam}
                  disabled={loadingUdyam}
                  className="bg-[var(--color-charcoal)] text-white font-bold px-6 border-2 border-[var(--color-charcoal)] hard-shadow hover:translate-x-1 hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                  {loadingUdyam ? <Loader2 className="animate-spin" /> : 'Verify'}
                </button>
              )}
            </div>
            {udyamVerified && (
              <div className="mt-2 text-sm font-bold text-green-700 flex items-center gap-2">
                <CheckCircle2 size={16} /> Udyam Verified Successfully
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button" 
              onClick={onBack}
              className="flex-1 bg-[var(--color-paper)] text-[var(--color-charcoal)] font-bold uppercase tracking-widest py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft size={20} /> Back
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
              className="flex-1 bg-[var(--color-charcoal)] text-[var(--color-paper)] font-bold uppercase tracking-widest py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover flex items-center justify-center gap-2 transition-all"
            >
              Next <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right">
          <div>
            <label className="block font-bold uppercase text-xs tracking-widest mb-2">Proprietor Name *</label>
            <input 
              type="text" 
              value={formData.proprietor_name || ''}
              onChange={(e) => updateFormData({ proprietor_name: e.target.value })}
              className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
              placeholder="Rahul Sharma"
              required
            />
          </div>

          {/* Removed internal Aadhaar KYC to use unified KYC component */}

          <div className="flex gap-4 pt-6">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="flex-1 bg-[var(--color-paper)] text-[var(--color-charcoal)] font-bold uppercase tracking-widest py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft size={20} /> Back
            </button>
            <button 
              type="button"
              onClick={onComplete}
              className="flex-1 bg-[var(--color-charcoal)] text-[var(--color-paper)] font-bold uppercase tracking-widest py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover flex items-center justify-center gap-2 transition-all"
            >
              Next <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
