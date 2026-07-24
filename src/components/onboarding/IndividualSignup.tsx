"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import OnboardingSidePanel from './OnboardingSidePanel';
import {
  User,
  Mail,
  Lock,
  Phone,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  MailCheck,
  Lock as LockIcon,
} from 'lucide-react';

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100';
const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400';
const primaryBtnCls =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60';

type Step = 'ACCOUNT' | 'CONFIRM_EMAIL' | 'PHONE' | 'FINALIZING';

// Simple client-side password-strength heuristic (0-4). No dependency.
function scorePassword(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

// Turns a backend error body into a human-readable message. FastAPI validation
// (422) responses put an ARRAY of { loc, msg, type } objects in `detail`, which
// would otherwise render as "[object Object]" and scare users.
function parseApiError(err: any, fallback: string): string {
  const d = err?.detail;
  if (!d) return fallback;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    const msgs = d.map((e: any) => e?.msg || e?.message).filter(Boolean);
    return msgs.length ? msgs.join(', ') : fallback;
  }
  if (typeof d === 'object') return d.msg || d.message || fallback;
  return fallback;
}

const STRENGTH = [
  { label: 'Too weak', color: 'bg-red-500', text: 'text-red-600' },
  { label: 'Weak', color: 'bg-red-500', text: 'text-red-600' },
  { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' },
  { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' },
  { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' },
];

/**
 * INDIVIDUAL worker signup - a ChatGPT/Claude-style flow:
 *   1. Create Account (email + password; Google/Apple shown but disabled since
 *      those providers are NOT enabled in this Supabase project).
 *   2. Mandatory phone verification on the now-authenticated user via
 *      supabase.auth.updateUser({ phone }) -> real SMS OTP -> verifyOtp with
 *      type 'phone_change', which genuinely attaches + verifies the phone on
 *      the Supabase user (required because the backend resolves the worker by
 *      the phone in the Supabase JWT).
 *   3. Register the worker (POST /api/v1/workers/register) and go straight to
 *      the dashboard.
 *
 * The component also handles two other entry states so it is robust from any
 * link: an already-authenticated user WITHOUT a phone lands on the phone step;
 * an already-authenticated user WITH a verified phone is registered directly.
 */
export default function IndividualSignup() {
  const router = useRouter();
  const { session, user, loading: authLoading } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [step, setStep] = useState<Step>('ACCOUNT');
  const [error, setError] = useState('');

  // Create Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // Phone verify
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const registeredRef = useRef(false);
  const bootstrappedRef = useRef(false);

  const strength = scorePassword(password);

  const registerAndGo = async () => {
    if (registeredRef.current) return;
    registeredRef.current = true;
    setError('');
    setStep('FINALIZING');
    try {
      const { data } = await supabase.auth.getSession();
      const activeSession = data.session;
      const token = activeSession?.access_token;
      const finalName = (name || (activeSession?.user?.user_metadata?.full_name as string) || '').trim();
      const finalEmail = (email || activeSession?.user?.email || '').trim();
      const res = await fetch(`${backendUrl}/api/v1/workers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          account_type: 'INDIVIDUAL',
          // Send null (not '') for empty optional fields - an empty string
          // fails the backend's EmailStr validation and returns a 422.
          name: finalName || null,
          email: finalEmail || null,
          phone: activeSession?.user?.phone,
          // Individuals take dispatch gigs; a real pin is captured later on the
          // dashboard. Seed with a default location like the other worker flows.
          latitude: 28.6139,
          longitude: 77.209,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const msg = parseApiError(err, 'We could not finish creating your account. Please try again.');
        if (!msg.toLowerCase().includes('already')) {
          throw new Error(msg);
        }
      }
      router.push('/dashboard');
    } catch (e: any) {
      registeredRef.current = false;
      setError(e.message || 'Something went wrong finishing your account.');
      setStep('PHONE');
    }
  };

  // Decide the starting step based on the current session. Runs once auth is
  // resolved; also catches the return from the email-confirmation link.
  useEffect(() => {
    if (authLoading || bootstrappedRef.current) return;
    if (session?.user) {
      bootstrappedRef.current = true;
      if (session.user.phone) {
        registerAndGo();
      } else {
        setStep('PHONE');
      }
    }
    // no session -> stay on ACCOUNT (default)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, session]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8 || strength < 2) {
      setError('Please choose a stronger password (at least 8 characters).');
      return;
    }

    setCreating(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/signup/individual`,
        },
      });
      if (signUpError) {
        setError(signUpError.message || 'Could not create your account. Please try again.');
        setCreating(false);
        return;
      }
      // With email auto-confirm off, no session is returned until the user
      // confirms via email; otherwise we can go straight to phone verify.
      if (data.session) {
        setStep('PHONE');
      } else {
        setStep('CONFIRM_EMAIL');
      }
    } catch (err: any) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setSendingOtp(true);
    try {
      // Attaches the phone to the already-authenticated user and triggers a
      // real SMS OTP (Supabase "phone_change" verification).
      const { error: updateError } = await supabase.auth.updateUser({ phone: phone.trim() });
      if (updateError) {
        setError(updateError.message || 'Could not send the verification code. Please try again.');
        setSendingOtp(false);
        return;
      }
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Could not send the verification code. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.trim().length < 6) {
      setError('Please enter the 6-digit code sent to your phone.');
      return;
    }
    setVerifyingOtp(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otp.trim(),
        type: 'phone_change',
      });
      if (verifyError) {
        setError(verifyError.message || 'That code was incorrect or expired. Please try again.');
        setVerifyingOtp(false);
        return;
      }
      await registerAndGo();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#eef1fb] font-sans text-slate-900">
      <OnboardingSidePanel />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8">
          {/* Mobile brand */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Zap size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="font-[var(--font-anton)] text-xl uppercase tracking-wider text-slate-900">GO LESKA</span>
          </div>

          {step !== 'FINALIZING' && (
            <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
              <ArrowLeft size={16} /> Back to login
            </Link>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          {/* STEP: Create Account */}
          {step === 'ACCOUNT' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  Create your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">account</span>
                </h1>
                <p className="mt-1 text-sm text-slate-500">Sign up to take daily gigs and dispatch jobs.</p>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-5">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <div className="relative">
                    <User className={iconCls} size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputCls + ' pl-11'}
                      placeholder="Ravi Kumar"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Email Address</label>
                  <div className="relative">
                    <Mail className={iconCls} size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputCls + ' pl-11'}
                      placeholder="you@email.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <Lock className={iconCls} size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputCls + ' pl-11 pr-11'}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition ${i < strength ? STRENGTH[strength].color : 'bg-slate-200'}`}
                          />
                        ))}
                      </div>
                      <p className={`mt-1 text-[11px] font-semibold ${STRENGTH[strength].text}`}>
                        {STRENGTH[strength].label}
                      </p>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={creating} className={primaryBtnCls}>
                  {creating ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
                  {!creating && <ArrowRight size={18} />}
                </button>
              </form>

              {/* OAuth - shown but disabled: Google/Apple are NOT enabled in this
                  Supabase project (a dashboard config task, not a code fix). */}
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">or</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled
                  title="Google sign-in is not enabled for this workspace yet"
                  className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-bold text-slate-400"
                >
                  <LockIcon size={15} /> Continue with Google
                </button>
                <button
                  type="button"
                  disabled
                  title="Apple sign-in is not enabled for this workspace yet"
                  className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-bold text-slate-400"
                >
                  <LockIcon size={15} /> Continue with Apple
                </button>
                <p className="text-center text-[11px] font-medium text-slate-400">
                  Google &amp; Apple sign-in are not enabled for this workspace yet.
                </p>
              </div>
            </>
          )}

          {/* STEP: Confirm email (only when email auto-confirm is off) */}
          {step === 'CONFIRM_EMAIL' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                <MailCheck className="text-indigo-600" size={28} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">Confirm your email</h1>
              <p className="mt-2 text-sm text-slate-500">
                We sent a confirmation link to <span className="font-semibold text-slate-700">{email}</span>. Click it to
                continue, then you&apos;ll verify your phone number.
              </p>
              <p className="mt-4 text-xs text-slate-400">
                This step appears because email confirmation is enabled for this workspace. Once confirmed, you&apos;ll
                return here automatically.
              </p>
            </div>
          )}

          {/* STEP: Phone verification */}
          {step === 'PHONE' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  Verify your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">phone</span>
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {otpSent ? 'Enter the 6-digit code we sent you.' : 'Add a phone number so employers can reach you.'}
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
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
                  <button type="submit" disabled={sendingOtp} className={primaryBtnCls}>
                    {sendingOtp ? <Loader2 className="animate-spin" size={18} /> : 'Send OTP'}
                    {!sendingOtp && <ArrowRight size={18} />}
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
                      Sent to +91 {phone}
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                          setError('');
                        }}
                        className="ml-1 font-semibold text-indigo-600 underline"
                      >
                        Edit
                      </button>
                    </p>
                  </div>
                  <button type="submit" disabled={verifyingOtp} className={primaryBtnCls}>
                    {verifyingOtp ? <Loader2 className="animate-spin" size={18} /> : 'Verify & Enter'}
                    {!verifyingOtp && <Check size={18} />}
                  </button>
                </form>
              )}

              <div className="mt-6 flex items-start gap-2 rounded-xl bg-indigo-50 p-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-indigo-600" size={16} />
                <p className="text-xs text-indigo-900/80">
                  Your phone is verified and securely attached to your account - it&apos;s how employers confirm and
                  reach you for jobs.
                </p>
              </div>
            </>
          )}

          {/* STEP: Finalizing */}
          {step === 'FINALIZING' && (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Setting up your account</h1>
                <p className="mt-1 text-sm text-slate-500">Taking you to your dashboard...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
