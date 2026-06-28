import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onComplete: () => void;
  onBack: () => void;
  accountType: 'EMPLOYEE' | 'INDIVIDUAL';
}

export default function EmployeeForm({ formData, updateFormData, onComplete, onBack, accountType }: Props) {
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loadingAadhaar, setLoadingAadhaar] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyAadhaar = async () => {
    if (!formData.aadhaar_number || formData.aadhaar_number.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    
    setLoadingAadhaar(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/kyc/verify-aadhaar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_number: formData.aadhaar_number })
      });
      
      if (!res.ok) throw new Error('Aadhaar verification failed');
      setAadhaarVerified(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAadhaar(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (accountType === 'EMPLOYEE' && !aadhaarVerified) {
      setError('Please verify Aadhaar before proceeding.');
      return;
    }
    
    setRegistering(true);
    setError('');
    
    try {
      // Register with the backend as a worker
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/workers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          account_type: accountType,
          phone: user?.phone,
          // Require lat/long for worker registration schema (mock location for MVP)
          latitude: 28.6139,
          longitude: 77.2090
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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    updateFormData({
      permanent_address: {
        ...(formData.permanent_address || {}),
        [field]: e.target.value
      }
    });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2">First Name *</label>
              <input 
                type="text" 
                value={formData.first_name || ''}
                onChange={(e) => updateFormData({ first_name: e.target.value })}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2">Last Name *</label>
              <input 
                type="text" 
                value={formData.last_name || ''}
                onChange={(e) => updateFormData({ last_name: e.target.value })}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase text-xs tracking-widest mb-2">Email</label>
            <input 
              type="email" 
              value={formData.email || ''}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block font-bold uppercase text-xs tracking-widest mb-2">Alternate Phone</label>
            <input 
              type="tel" 
              value={formData.alternate_phone || ''}
              onChange={(e) => updateFormData({ alternate_phone: e.target.value })}
              className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
            />
          </div>

          {accountType === 'EMPLOYEE' && (
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2">Blood Group</label>
              <select 
                value={formData.blood_group || ''}
                onChange={(e) => updateFormData({ blood_group: e.target.value })}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
              >
                <option value="">Select...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          )}

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
                if (!formData.first_name || !formData.last_name) {
                  setError('First and Last name are required');
                  return;
                }
                updateFormData({ name: `${formData.first_name} ${formData.last_name}` });
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
          
          <div className="p-4 border-2 border-[var(--color-charcoal)] bg-gray-50">
            <h3 className="font-bold uppercase tracking-widest mb-4">Address Details</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Street / Flat"
                value={formData.permanent_address?.street || ''}
                onChange={(e) => handleAddressChange(e, 'street')}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-white"
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="City"
                  value={formData.permanent_address?.city || ''}
                  onChange={(e) => handleAddressChange(e, 'city')}
                  className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-white"
                />
                <input 
                  type="text" 
                  placeholder="Pincode"
                  value={formData.permanent_address?.pincode || ''}
                  onChange={(e) => handleAddressChange(e, 'pincode')}
                  className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {accountType === 'EMPLOYEE' && (
            <div className={`p-6 border-2 border-[var(--color-charcoal)] ${aadhaarVerified ? 'bg-green-50' : 'bg-gray-50'}`}>
              <h3 className="font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Employee Aadhaar KYC</span>
                {aadhaarVerified && <CheckCircle2 className="text-green-600" />}
              </h3>
              
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={formData.aadhaar_number || ''}
                  onChange={(e) => updateFormData({ aadhaar_number: e.target.value })}
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
          )}

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
              onClick={handleFinalSubmit}
              disabled={(accountType === 'EMPLOYEE' && !aadhaarVerified) || registering}
              className="flex-1 bg-[var(--color-saffron)] text-[var(--color-charcoal)] font-bold uppercase tracking-widest py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:bg-gray-300"
            >
              {registering ? <Loader2 className="animate-spin" /> : 'Complete Setup'} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
