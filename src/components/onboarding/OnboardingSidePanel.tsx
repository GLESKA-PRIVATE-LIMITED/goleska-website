import React from 'react';
import { Zap, ShieldCheck, IndianRupee, Lock } from 'lucide-react';

const features = [
  { icon: <Zap size={20} />, title: 'AI Dispatch', desc: 'Match verified workers to jobs in 60 seconds.' },
  { icon: <ShieldCheck size={20} />, title: 'Verified Workers', desc: 'Aadhaar + skill verified, trusted profiles.' },
  { icon: <IndianRupee size={20} />, title: 'Daily Payouts', desc: 'No salary delays - workers paid every day.' },
  { icon: <Lock size={20} />, title: 'Secure & Compliant', desc: 'Bank-grade KYC and encrypted data.' },
];

/**
 * Shared left panel for the split-screen onboarding layout.
 * Static branding + value props. Hidden below the lg breakpoint.
 */
export default function OnboardingSidePanel() {
  return (
    <aside className="relative hidden w-[45%] shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 p-10 text-white lg:flex xl:w-1/2 xl:p-14">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

      {/* Brand + tagline + heading */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <Zap size={22} className="text-amber-300" fill="currentColor" />
          </div>
          <span className="font-[var(--font-anton)] text-2xl uppercase tracking-wider">GO LESKA</span>
        </div>

        <div className="mt-10 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90">
          Your AI-Powered Hiring Platform
        </div>

        <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] xl:text-5xl">
          Kaam Milega.
          <br />
          <span className="text-amber-300">Turant.</span>
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
          India&apos;s blue-collar army, matched to real jobs in seconds - powered by AI, built for the factory floor.
        </p>
      </div>

      {/* Feature rows */}
      <div className="relative z-10 my-10 space-y-5">
        {features.map((f) => (
          <div key={f.title} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300 ring-1 ring-white/15">
              {f.icon}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white">{f.title}</p>
              <p className="text-sm text-white/60">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust badge */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex -space-x-2">
          {['bg-amber-300', 'bg-emerald-300', 'bg-rose-300', 'bg-sky-300'].map((c, i) => (
            <div key={i} className={`h-9 w-9 rounded-full border-2 border-indigo-600 ${c}`} />
          ))}
        </div>
        <p className="text-sm font-medium text-white/80">
          <span className="font-bold text-white">10,000+</span> Workers &amp; Employers trust GO LESKA
        </p>
      </div>
    </aside>
  );
}
