import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BusinessDetailsForm({ formData, updateFormData, onNext, onBack }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-bold uppercase text-xs tracking-widest mb-2">Legal Business Name *</label>
        <input 
          type="text" 
          value={formData.company_name || ''}
          onChange={(e) => updateFormData({ company_name: e.target.value })}
          className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
          placeholder="Tata Steel Pvt Ltd"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-bold uppercase text-xs tracking-widest mb-2">Business Type</label>
          <select 
            value={formData.business_type || ''}
            onChange={(e) => updateFormData({ business_type: e.target.value })}
            className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
          >
            <option value="">Select...</option>
            <option value="PVT_LTD">Private Limited</option>
            <option value="LLP">LLP</option>
            <option value="PUBLIC_LTD">Public Limited</option>
            <option value="OPC">One Person Company</option>
          </select>
        </div>
        <div>
          <label className="block font-bold uppercase text-xs tracking-widest mb-2">Category</label>
          <input 
            type="text" 
            value={formData.business_category || ''}
            onChange={(e) => updateFormData({ business_category: e.target.value })}
            className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
            placeholder="Manufacturing"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold uppercase text-xs tracking-widest mb-2">Website URL</label>
        <input 
          type="url" 
          value={formData.website_url || ''}
          onChange={(e) => updateFormData({ website_url: e.target.value })}
          className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
          placeholder="https://example.com"
        />
      </div>
      
      <div>
        <label className="block font-bold uppercase text-xs tracking-widest mb-2">Email Address *</label>
        <input 
          type="email" 
          value={formData.email || ''}
          onChange={(e) => updateFormData({ email: e.target.value })}
          className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
          placeholder="admin@company.com"
          required
        />
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
          type="submit" 
          className="flex-1 bg-[var(--color-charcoal)] text-[var(--color-paper)] font-bold uppercase tracking-widest py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover flex items-center justify-center gap-2 transition-all"
        >
          Next <ArrowRight size={20} />
        </button>
      </div>
    </form>
  );
}
