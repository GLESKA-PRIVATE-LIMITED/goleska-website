import React from 'react';
import { ArrowRight, ArrowLeft, Building2, Tag, Globe, Mail } from 'lucide-react';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100';
const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400';
const primaryBtnCls = 'inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
const backBtnCls = 'inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50';

export default function BusinessDetailsForm({ formData, updateFormData, onNext, onBack }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelCls}>Legal Business Name *</label>
        <div className="relative">
          <Building2 className={iconCls} size={18} />
          <input
            type="text"
            value={formData.company_name || ''}
            onChange={(e) => updateFormData({ company_name: e.target.value })}
            className={inputCls + ' pl-11'}
            placeholder="Tata Steel Pvt Ltd"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Business Type</label>
          <select
            value={formData.business_type || ''}
            onChange={(e) => updateFormData({ business_type: e.target.value })}
            className={inputCls}
          >
            <option value="">Select...</option>
            <option value="PVT_LTD">Private Limited</option>
            <option value="LLP">LLP</option>
            <option value="PUBLIC_LTD">Public Limited</option>
            <option value="OPC">One Person Company</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <div className="relative">
            <Tag className={iconCls} size={18} />
            <input
              type="text"
              value={formData.business_category || ''}
              onChange={(e) => updateFormData({ business_category: e.target.value })}
              className={inputCls + ' pl-11'}
              placeholder="Manufacturing"
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Website URL</label>
        <div className="relative">
          <Globe className={iconCls} size={18} />
          <input
            type="url"
            value={formData.website_url || ''}
            onChange={(e) => updateFormData({ website_url: e.target.value })}
            className={inputCls + ' pl-11'}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Email Address *</label>
        <div className="relative">
          <Mail className={iconCls} size={18} />
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className={inputCls + ' pl-11'}
            placeholder="admin@company.com"
            required
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onBack} className={backBtnCls}>
          <ArrowLeft size={18} /> Back
        </button>
        <button type="submit" className={primaryBtnCls}>
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
