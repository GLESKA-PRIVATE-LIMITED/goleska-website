import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import MapPicker from '../dashboard/MapPicker';

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
  const [error, setError] = useState('');

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
            <label className="block font-bold uppercase text-xs tracking-widest mb-2">Alternate Phone *</label>
            <input 
              type="tel" 
              value={formData.alternate_phone || ''}
              onChange={(e) => updateFormData({ alternate_phone: e.target.value })}
              className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
              required
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2 flex justify-between">
                <span>Police Verification Cert.</span>
                <span className="text-gray-400">Optional</span>
              </label>
              <input 
                type="file" 
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      updateFormData({ police_verification_file: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-2 font-bold outline-none focus:bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-[var(--color-charcoal)] file:text-white hover:file:bg-black cursor-pointer"
              />
              {formData.police_verification_file && <p className="text-xs text-green-700 mt-2 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> File attached</p>}
            </div>
            {/* Add more fields here if needed */}
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
                if (!formData.first_name || !formData.last_name) {
                  setError('First and Last name are required');
                  return;
                }
                if (!formData.alternate_phone || formData.alternate_phone.length < 10) {
                  setError('Valid Alternate Phone is required');
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
                placeholder="Address Line 1 (Flat, Building, Block)"
                value={formData.permanent_address?.address_line_1 || ''}
                onChange={(e) => handleAddressChange(e, 'address_line_1')}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-white"
                required
              />
              <input 
                type="text" 
                placeholder="Address Line 2 (Street, Area, Landmark)"
                value={formData.permanent_address?.address_line_2 || ''}
                onChange={(e) => handleAddressChange(e, 'address_line_2')}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-white"
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="City"
                  value={formData.permanent_address?.city || ''}
                  onChange={(e) => handleAddressChange(e, 'city')}
                  className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-white"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Pincode"
                  value={formData.permanent_address?.pincode || ''}
                  onChange={(e) => handleAddressChange(e, 'pincode')}
                  className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-white"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block font-bold uppercase text-xs tracking-widest mb-2">Pin Your Current Location</label>
                <MapPicker 
                  latitude={formData.latitude || null} 
                  longitude={formData.longitude || null} 
                  onChange={(lat, lng) => updateFormData({ latitude: lat, longitude: lng })} 
                />
              </div>
            </div>
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
