"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signInWithOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'worker' || type === 'employer') {
      localStorage.setItem('onboardingSide', type === 'worker' ? 'WORKER' : 'EMPLOYER');
    }
  }, [searchParams]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const { error: signInError } = await signInWithOtp(phone);
    
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      setStep('OTP');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const { error: verifyError } = await verifyOtp(phone, otp);
    
    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
    } else {
      // OTP verified successfully!
      // Save email for onboarding
      localStorage.setItem('onboardingEmail', email);
      router.push('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-sans flex items-center justify-center p-6 selection:bg-[var(--color-saffron)] selection:text-white">
      <div className="w-full max-w-md bg-white border-4 border-[var(--color-charcoal)] hard-shadow p-8 relative">
        <Link href="/" className="absolute -top-4 -left-4 bg-[var(--color-charcoal)] text-white w-10 h-10 flex items-center justify-center font-[var(--font-anton)] text-xl border-2 border-[var(--color-charcoal)] hover:bg-[var(--color-saffron)] hover:-translate-y-1 transition-all hard-shadow">
          ←
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="font-[var(--font-anton)] text-4xl uppercase tracking-wide">Enter the Factory</h1>
          <p className="font-bold text-gray-500 mt-2 text-sm uppercase tracking-widest">Login via OTP</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-500 p-3 mb-6 font-bold text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 text-lg font-bold outline-none focus:bg-gray-50 mb-4"
                placeholder="you@company.com"
                required
              />
            </div>
            
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2">Mobile Number</label>
              <div className="flex">
                <div className="bg-[var(--color-paper)] border-2 border-[var(--color-charcoal)] border-r-0 px-4 flex items-center justify-center font-bold text-xl">
                  +91
                </div>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 border-2 border-[var(--color-charcoal)] px-4 py-3 text-xl font-bold outline-none focus:bg-gray-50"
                  placeholder="9999999999"
                  maxLength={10}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[var(--color-saffron)] text-[var(--color-charcoal)] font-bold uppercase tracking-widest py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_#111]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send OTP'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block font-bold uppercase text-xs tracking-widest mb-2">6-Digit OTP</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 text-2xl tracking-[0.5em] text-center font-bold outline-none focus:bg-gray-50"
                placeholder="000000"
                maxLength={6}
              />
              <p className="text-xs font-bold text-gray-500 mt-2 text-center">
                Sent to +91 {phone} <button type="button" onClick={() => setStep('PHONE')} className="text-blue-600 underline ml-1">Edit</button>
              </p>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[var(--color-jungle)] text-white font-bold uppercase tracking-widest py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Enter'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
