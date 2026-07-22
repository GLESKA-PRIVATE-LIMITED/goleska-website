import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, User, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import MapPicker from '../dashboard/MapPicker';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onComplete: () => void;
  onBack: () => void;
  accountType: 'EMPLOYEE' | 'INDIVIDUAL';
}

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100';
const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400';
const fileCls = 'block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-500 file:mr-4 file:cursor-pointer file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:opacity-90';
const primaryBtnCls = 'inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
const backBtnCls = 'inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50';

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
    <div className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5 animate-in fade-in">
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
                  required
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
                  required
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
                required
              />
            </div>
          </div>

          {accountType === 'EMPLOYEE' && (
            <div>
              <label className={labelCls}>Blood Group</label>
              <select
                value={formData.blood_group || ''}
                onChange={(e) => updateFormData({ blood_group: e.target.value })}
                className={inputCls}
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
                  reader.onloadend = () => {
                    updateFormData({ police_verification_file: reader.result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className={fileCls}
            />
            {formData.police_verification_file && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={12} /> File attached</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onBack} className={backBtnCls}>
              <ArrowLeft size={18} /> Back
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
              className={primaryBtnCls}
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Address Details</h3>
            <div className="space-y-4">
              <div className="relative">
                <MapPin className={iconCls} size={18} />
                <input
                  type="text"
                  placeholder="Address Line 1 (Flat, Building, Block)"
                  value={formData.permanent_address?.address_line_1 || ''}
                  onChange={(e) => handleAddressChange(e, 'address_line_1')}
                  className={inputCls + ' bg-white pl-11'}
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Address Line 2 (Street, Area, Landmark)"
                value={formData.permanent_address?.address_line_2 || ''}
                onChange={(e) => handleAddressChange(e, 'address_line_2')}
                className={inputCls + ' bg-white'}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.permanent_address?.city || ''}
                  onChange={(e) => handleAddressChange(e, 'city')}
                  className={inputCls + ' bg-white'}
                  required
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={formData.permanent_address?.pincode || ''}
                  onChange={(e) => handleAddressChange(e, 'pincode')}
                  className={inputCls + ' bg-white'}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="State"
                  value={formData.permanent_address?.state || ''}
                  onChange={(e) => handleAddressChange(e, 'state')}
                  className={inputCls + ' bg-white'}
                  required
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.permanent_address?.country || ''}
                  onChange={(e) => handleAddressChange(e, 'country')}
                  className={inputCls + ' bg-white'}
                  required
                />
              </div>
              <div className="mt-2">
                <label className={labelCls}>Pin Your Current Location</label>
                <MapPicker
                  latitude={formData.latitude || null}
                  longitude={formData.longitude || null}
                  onChange={(lat, lng) => updateFormData({ latitude: lat, longitude: lng })}
                />
              </div>
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
