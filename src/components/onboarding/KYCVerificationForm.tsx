import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onComplete: () => void;
  onBack: () => void;
  accountType: 'REGISTERED_BUSINESS' | 'REGISTERED_INDUSTRY' | 'UNREGISTERED_BUSINESS' | 'EMPLOYEE' | 'INDIVIDUAL' | null;
}

export default function KYCVerificationForm({ formData, updateFormData, onComplete, onBack, accountType }: Props) {
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
      const isWorker = accountType === 'EMPLOYEE';
      const registerEndpoint = isWorker ? '/api/v1/workers/register' : '/api/v1/employers/register';
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${registerEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border-2 border-red-500 p-3 font-bold text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Initial Verification Step (CIN or PAN) */}
      <div className={`p-6 border-2 border-[var(--color-charcoal)] ${panVerified ? 'bg-green-50' : 'bg-gray-50'}`}>
        <h3 className="font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
          <span>1. E-KYC via {accountType === 'REGISTERED_BUSINESS' ? 'CIN' : 'PAN'}</span>
          {panVerified && <CheckCircle2 className="text-green-600" />}
        </h3>
        
        <div className="flex gap-4">
          {accountType === 'REGISTERED_BUSINESS' ? (
            <input 
              type="text" 
              value={formData.cin_number || ''}
              onChange={(e) => updateFormData({ cin_number: e.target.value.toUpperCase() })}
              disabled={panVerified}
              className="flex-1 border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold uppercase disabled:bg-gray-200"
              placeholder="U72900KA2015PTC083072"
              maxLength={21}
            />
          ) : (
            <input 
              type="text" 
              value={formData.pan_number || ''}
              onChange={(e) => updateFormData({ pan_number: e.target.value.toUpperCase() })}
              disabled={panVerified}
              className="flex-1 border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold uppercase disabled:bg-gray-200"
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          )}
          
          {!panVerified && (
            <button 
              type="button" 
              onClick={accountType === 'REGISTERED_BUSINESS' ? handleVerifyCin : handleVerifyPan}
              disabled={loadingPan}
              className="bg-[var(--color-charcoal)] text-white font-bold px-6 border-2 border-[var(--color-charcoal)] hard-shadow hover:translate-x-1 hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {loadingPan ? <Loader2 className="animate-spin" /> : 'Verify'}
            </button>
          )}
        </div>
        
        {panVerified && (
          <div className="mt-4 p-4 bg-white border border-gray-300">
            {accountType === 'REGISTERED_BUSINESS' ? (
               <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">CIN Verified:</p>
            ) : (
               <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">PAN Verified:</p>
            )}
            <p className="font-mono mb-4">{formData.company_name || formData.account_name || 'Verified Entity'}</p>
            
            {directors.length > 0 && (
              <>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Select Director for Aadhaar KYC:</p>
                <div className="space-y-2">
                  {directors.map((d, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 border border-gray-300 cursor-pointer hover:bg-gray-50">
                      <input 
                        type="radio" 
                        name="selected_director" 
                        className="w-4 h-4" 
                        onChange={() => updateFormData({ selected_director: d.name })}
                      />
                      <span className="font-bold">{d.name} <span className="text-gray-400 font-normal ml-2">DIN: {d.din}</span></span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Aadhaar Verification Step */}
      <div className={`p-6 border-2 border-[var(--color-charcoal)] ${aadhaarVerified ? 'bg-green-50' : 'bg-gray-50'} ${!panVerified ? 'opacity-50 pointer-events-none' : ''}`}>
        <h3 className="font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
          <span>2. {accountType === 'REGISTERED_BUSINESS' ? 'Director ' : ''}Aadhaar KYC</span>
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
