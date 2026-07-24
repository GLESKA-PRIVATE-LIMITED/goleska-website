"use client";

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2, Mail, Phone, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import OnboardingSidePanel from '@/components/onboarding/OnboardingSidePanel';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100';
const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400';
const primaryBtnCls = 'inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60';

function LoginPageInner() {
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
    setError('');

    // Client-side validation - never let malformed input reach the backend/Twilio.
    const phoneRegex = /^\d{10}$/; // 10 digits (the +91 is a fixed visual prefix)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!phoneRegex.test(phone.trim())) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await signInWithOtp(phone);

      if (signInError) {
        // Don't surface raw Twilio/Supabase error text to the user.
        console.error('signInWithOtp failed:', signInError);
        setError('Something went wrong, please try again.');
        setLoading(false);
        return;
      }

      setStep('OTP');
      setLoading(false);
    } catch (err) {
      console.error('signInWithOtp threw:', err);
      setError('Something went wrong, please try again.');
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
      // [Onboarding Timer] Stamp signup start = OTP verification time.
      localStorage.setItem('onboardingStartTime', Date.now().toString());
      console.log('[Onboarding Timer] Started at OTP verification.');
      router.push('/onboarding');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#eef1fb] font-sans text-slate-900">
      <OnboardingSidePanel />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8">

          {/* Mobile brand (side panel hidden below lg) */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Zap size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="font-[var(--font-anton)] text-xl uppercase tracking-wider text-slate-900">GO LESKA</span>
          </div>

          <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
            <ArrowLeft size={16} /> Back to home
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Enter the <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Factory</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">Login via OTP to continue.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className={labelCls}>Email Address</label>
                <div className="relative">
                  <Mail className={iconCls} size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls + ' pl-11'}
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-600">+91</span>
                  <div className="relative flex-1">
                    <Phone className={iconCls} size={18} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputCls + ' rounded-l-none pl-11'}
                      placeholder="9999999999"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className={primaryBtnCls}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send OTP'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className={labelCls}>6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={inputCls + ' text-center text-2xl font-bold tracking-[0.5em]'}
                  placeholder="000000"
                  maxLength={6}
                />
                <p className="mt-2 text-center text-xs font-medium text-slate-500">
                  Sent to +91 {phone} <button type="button" onClick={() => setStep('PHONE')} className="ml-1 font-semibold text-indigo-600 underline">Edit</button>
                </p>
              </div>

              <button type="submit" disabled={loading} className={primaryBtnCls}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Verify & Enter'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          {/* Individual worker signup - a ChatGPT-style email/password entry that
              does not require the phone-OTP login above. */}
          {step === 'PHONE' && (
            <>
              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">new here?</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <Link
                href="/signup/individual"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Sign up as an Individual worker <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
