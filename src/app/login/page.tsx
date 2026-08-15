"use client";

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2, Mail, Phone, Zap, Hammer, Briefcase, Lock } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [side, setSide] = useState<'WORKER' | 'EMPLOYER' | null>(null);
  
  const { signInWithPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'worker' || type === 'employer') {
      const s = type === 'worker' ? 'WORKER' : 'EMPLOYER';
      localStorage.setItem('onboardingSide', s);
      setSide(s);
    } else {
      const saved = localStorage.getItem('onboardingSide');
      if (saved === 'WORKER' || saved === 'EMPLOYER') setSide(saved);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await signInWithPassword(email.trim(), password);

      if (signInError) {
        setError(signInError.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      localStorage.setItem('onboardingEmail', email.trim());
      localStorage.setItem('onboardingStartTime', Date.now().toString());

      // Check existing profile logic
      const checkExistingProfile = async () => {
        try {
          const { data: workerData } = await supabase
            .from('workers')
            .select('*')
            .eq('email', email.trim())
            .maybeSingle();
          if (workerData) {
            router.push('/dashboard');
            return;
          }
        } catch (e) {}
        try {
          const { data: employerData } = await supabase
            .from('employers')
            .select('*')
            .eq('email', email.trim())
            .maybeSingle();
          if (employerData) {
            router.push('/dashboard');
            return;
          }
        } catch (e) {}
        // No existing profile, go to onboarding
        router.push('/onboarding');
      };
      
      await checkExistingProfile();
    } catch (err) {
      console.error('signInWithPassword threw:', err);
      setError('Something went wrong, please try again.');
      setLoading(false);
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
            {side && (
              <div
                className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                  side === 'WORKER'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                }`}
              >
                {side === 'WORKER' ? <Hammer size={13} /> : <Briefcase size={13} />}
                {side === 'WORKER' ? 'I want work' : 'I need workers'}
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Enter the <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Factory</span>
            </h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
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
              <label className={labelCls}>Password</label>
              <div className="relative">
                <Lock className={iconCls} size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls + ' pl-11'}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className={primaryBtnCls}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Login'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Individual worker signup - a ChatGPT-style email/password entry that
              does not require the phone-OTP login above. */}
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
        </div>
      </main>
    </div>
  );
}
