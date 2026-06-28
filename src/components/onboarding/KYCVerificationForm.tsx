import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onComplete: () => void;
  onBack: () => void;
}

export default function KYCVerificationForm({ formData, updateFormData, onComplete, onBack }: Props) {
  const { user } = useAuth();
  
  const [loadingPan, setLoadingPan] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [directors, setDirectors] = useState<any[]>([]);
  
  const [loadingAadhaar, setLoadingAadhaar] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

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
      
      updateFormData({ cin_number: data.cin_number, director_data: data.directors });
      setDirectors(data.directors);
      setPanVerified(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingPan(false);
    }
  };

  const handleVerifyAadhaar = async () => {
    if (!formData.kyc_aadhaar_number || formData.kyc_aadhaar_number.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    
    setLoadingAadhaar(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/kyc/verify-aadhaar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_number: formData.kyc_aadhaar_number })
      });
      
      if (!res.ok) throw new Error('Aadhaar verification failed');
      setAadhaarVerified(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAadhaar(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panVerified || !aadhaarVerified) {
      setError('Please complete all KYC verifications.');
      return;
    }
    
    setRegistering(true);
    setError('');
    
    try {
      // Register with the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/employers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: user?.phone,
          hiring_mode: 'MANUAL'
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

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border-2 border-red-500 p-3 font-bold text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* PAN Verification Step */}
      <div className={`p-6 border-2 border-[var(--color-charcoal)] ${panVerified ? 'bg-green-50' : 'bg-gray-50'}`}>
        <h3 className="font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
          <span>1. C-KYC via PAN</span>
          {panVerified && <CheckCircle2 className="text-green-600" />}
        </h3>
        
        <div className="flex gap-4">
          <input 
            type="text" 
            value={formData.pan_number || ''}
            onChange={(e) => updateFormData({ pan_number: e.target.value.toUpperCase() })}
            disabled={panVerified}
            className="flex-1 border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold uppercase disabled:bg-gray-200"
            placeholder="ABCDE1234F"
            maxLength={10}
          />
          {!panVerified && (
            <button 
              type="button" 
              onClick={handleVerifyPan}
              disabled={loadingPan}
              className="bg-[var(--color-charcoal)] text-white font-bold px-6 border-2 border-[var(--color-charcoal)] hard-shadow hover:translate-x-1 hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {loadingPan ? <Loader2 className="animate-spin" /> : 'Verify'}
            </button>
          )}
        </div>
        
        {panVerified && (
          <div className="mt-4 p-4 bg-white border border-gray-300">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">CIN Detected:</p>
            <p className="font-mono mb-4">{formData.cin_number}</p>
            
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Select Director for Aadhaar KYC:</p>
            <div className="space-y-2">
              {directors.map((d, i) => (
                <label key={i} className="flex items-center gap-3 p-3 border border-gray-300 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="selected_director" className="w-4 h-4" />
                  <span className="font-bold">{d.name} <span className="text-gray-400 font-normal ml-2">DIN: {d.din}</span></span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Aadhaar Verification Step */}
      <div className={`p-6 border-2 border-[var(--color-charcoal)] ${aadhaarVerified ? 'bg-green-50' : 'bg-gray-50'} ${!panVerified ? 'opacity-50 pointer-events-none' : ''}`}>
        <h3 className="font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
          <span>2. Director Aadhaar KYC</span>
          {aadhaarVerified && <CheckCircle2 className="text-green-600" />}
        </h3>
        
        <div className="flex gap-4">
          <input 
            type="text" 
            value={formData.kyc_aadhaar_number || ''}
            onChange={(e) => updateFormData({ kyc_aadhaar_number: e.target.value })}
            disabled={aadhaarVerified}
            className="flex-1 border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold disabled:bg-gray-200"
            placeholder="0000 0000 0000"
            maxLength={12}
          />
          {!aadhaarVerified && (
            <button 
              type="button" 
              onClick={handleVerifyAadhaar}
              disabled={loadingAadhaar}
              className="bg-[var(--color-charcoal)] text-white font-bold px-6 border-2 border-[var(--color-charcoal)] hard-shadow hover:translate-x-1 hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {loadingAadhaar ? <Loader2 className="animate-spin" /> : 'Verify'}
            </button>
          )}
        </div>
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
          onClick={handleFinalSubmit}
          disabled={!panVerified || !aadhaarVerified || registering}
          className="flex-1 bg-[var(--color-saffron)] text-[var(--color-charcoal)] font-bold uppercase tracking-widest py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:bg-gray-300"
        >
          {registering ? <Loader2 className="animate-spin" /> : 'Complete Setup'} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
