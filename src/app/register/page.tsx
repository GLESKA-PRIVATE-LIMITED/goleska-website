"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Building, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const { session, user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    gstin: '',
  });

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    const checkExisting = async () => {
      // Check if they already exist in our DB
      const phone = user?.phone;
      if (!phone) return;
      
      const { data } = await supabase.from('employers').select('*').eq('phone', phone).single();
      
      if (data) {
        // Already registered, go to dashboard
        router.push('/dashboard');
      } else {
        setChecking(false);
      }
    };
    
    checkExisting();
  }, [session, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name || !formData.email) {
      setError('Company Name and Email are required.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Hit the FastAPI backend to register
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/employers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          phone: user?.phone,
          hiring_mode: 'MANUAL'
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to register employer');
      }

      // Successful registration
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (checking) {
    return <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center font-[var(--font-anton)] text-3xl">VERIFYING RECORDS...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-sans flex items-center justify-center p-6 selection:bg-[var(--color-saffron)] selection:text-white">
      <div className="w-full max-w-lg bg-white border-4 border-[var(--color-charcoal)] hard-shadow p-8 relative">
        <div className="absolute -top-6 -right-6 bg-[var(--color-saffron)] text-white w-12 h-12 flex items-center justify-center border-2 border-[var(--color-charcoal)] hard-shadow transform rotate-12">
          <ShieldCheck size={24} className="text-[var(--color-charcoal)]" />
        </div>
        
        <div className="mb-8">
          <h1 className="font-[var(--font-anton)] text-5xl uppercase tracking-wide">Setup Factory</h1>
          <p className="font-bold text-gray-500 mt-2 text-sm uppercase tracking-widest">Complete your profile to start hiring</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-500 p-3 mb-6 font-bold text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-bold uppercase text-xs tracking-widest mb-2">Company Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Building size={20} />
              </div>
              <input 
                type="text" 
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full border-2 border-[var(--color-charcoal)] pl-12 pr-4 py-3 text-lg font-bold outline-none focus:bg-gray-50"
                placeholder="Tata Steel Ltd."
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2">Contact Name</label>
              <input 
                type="text" 
                name="contact_name"
                value={formData.contact_name}
                onChange={handleChange}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
                placeholder="Rahul"
              />
            </div>
            
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2">Email *</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
                placeholder="hr@factory.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block font-bold uppercase text-xs tracking-widest mb-2 flex justify-between">
              <span>GSTIN Number</span>
              <span className="text-gray-400">Optional</span>
            </label>
            <input 
              type="text" 
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50 uppercase"
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[var(--color-charcoal)] text-[var(--color-paper)] font-bold uppercase tracking-widest py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Registration'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
