import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AccountType } from '@/app/onboarding/page';
import {
  Building2,
  Factory,
  Store,
  UserCircle2,
  Hammer,
  Users,
  ChevronRight,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Sparkles,
  Headphones,
  Laptop,
  Briefcase,
  User,
  LayoutGrid,
} from 'lucide-react';

interface Props {
  selectedType: AccountType;
  onSelect: (type: AccountType) => void;
  initialSide?: 'WORKER' | 'EMPLOYER' | null;
}

interface Option {
  id: AccountType;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  color: string;
}

// One distinct colour per account type, all drawn from the existing blue/indigo
// design palette (indigo/teal/purple/blue/emerald - 600 shades).
const employerOptions: Option[] = [
  { id: 'REGISTERED_INDUSTRY', title: 'Registered Industry', desc: 'Factories and manufacturing units', icon: Factory, color: 'bg-teal-600' },
  { id: 'REGISTERED_BUSINESS', title: 'Registered Business', desc: 'Pvt Ltd, LLP, Public Ltd with GST/CIN', icon: Building2, color: 'bg-indigo-600' },
  { id: 'UNREGISTERED_BUSINESS', title: 'Unregistered Business', desc: 'Proprietors & informal businesses', icon: Store, color: 'bg-purple-600' },
];

const workerOptions: Option[] = [
  { id: 'EMPLOYEE', title: 'Employment Candidate', desc: 'Seeking full-time payroll employment', icon: UserCircle2, color: 'bg-blue-600' },
  { id: 'INDIVIDUAL', title: 'Individual', desc: 'Take temporary gigs and daily dispatch jobs', icon: Hammer, color: 'bg-emerald-600' },
];

const trustItems = [
  { icon: ShieldCheck, title: 'Trusted Platform', desc: 'Secure & Verified' },
  { icon: Users, title: '10,000+ Users', desc: 'Growing Community' },
  { icon: Sparkles, title: 'Endless Opportunities', desc: 'For Everyone' },
  { icon: Headphones, title: '24/7 Support', desc: "We're here to help" },
];

// Decorative floating icon used in the right-panel illustration.
function FloatingIcon({
  icon: Icon,
  color,
  className,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  className: string;
}) {
  return (
    <div
      className={`absolute flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${color} ${className}`}
    >
      <Icon size={20} />
    </div>
  );
}

export default function AccountTypeSelector({ selectedType, onSelect, initialSide = null }: Props) {
  // The worker/employer side is ALREADY chosen on the landing page (?type=) and
  // carried in onboardingSide. We never re-ask it here. Default to EMPLOYER on the
  // first (SSR-consistent) render, then correct from initialSide / localStorage in
  // an effect - reading localStorage during render would cause a hydration mismatch.
  const [side, setSide] = useState<'WORKER' | 'EMPLOYER'>(initialSide ?? 'EMPLOYER');

  useEffect(() => {
    if (initialSide) {
      setSide(initialSide);
    } else if (typeof window !== 'undefined' && localStorage.getItem('onboardingSide') === 'WORKER') {
      setSide('WORKER');
    }
  }, [initialSide]);

  // Keep the two sides clean: "I need workers" shows only the 3 business types,
  // "I want work" shows only the 2 worker types (Employment Candidate + Individual).
  // Individual is a WORKER account - it must never appear on the employer side.
  const options = side === 'WORKER' ? workerOptions : employerOptions;

  return (
    <div className="flex min-h-screen w-full bg-[#eef1fb] font-sans text-slate-900">
      {/* LEFT: options */}
      <div className="flex w-full flex-col px-5 py-8 sm:px-10 lg:w-1/2 lg:px-14 lg:py-12">
        <Link
          href="/login"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="flex flex-1 flex-col justify-center py-8">
          {/* Mobile brand (right panel is hidden below lg) */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Zap size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="font-[var(--font-anton)] text-xl uppercase tracking-wider text-slate-900">GO LESKA</span>
          </div>

          <>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Choose your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">account</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">Select the option that best describes you.</p>

            <div className="mt-6 space-y-3">
              {options.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelect(opt.id)}
                    className={`group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-100 ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-200'
                        : 'border-indigo-100 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${opt.color}`}>
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900">{opt.title}</h3>
                      <p className="text-sm text-slate-500">{opt.desc}</p>
                    </div>
                    <ChevronRight className="ml-auto shrink-0 text-indigo-300 transition group-hover:text-indigo-500" size={20} />
                  </button>
                );
              })}
            </div>
          </>
        </div>
      </div>

      {/* RIGHT: decorative panel (hidden on mobile, like OnboardingSidePanel) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-l border-slate-200 bg-white p-10 lg:flex xl:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl" />

        {/* Heading */}
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold leading-tight text-slate-900 xl:text-5xl">
            Join <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GO LESKA</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            Choose how you&apos;d like to participate in the marketplace.
          </p>
        </div>

        {/* Illustration: laptop with floating icons (decorative chrome) */}
        <div className="relative z-10 mx-auto flex h-56 w-full max-w-sm items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/30">
            <Laptop size={48} />
          </div>
          <FloatingIcon icon={Briefcase} color="bg-teal-500" className="left-4 top-4 animate-pulse" />
          <FloatingIcon icon={Building2} color="bg-indigo-500" className="right-6 top-2" />
          <FloatingIcon icon={User} color="bg-blue-500" className="bottom-6 left-8" />
          <FloatingIcon icon={LayoutGrid} color="bg-purple-500" className="bottom-4 right-4 animate-pulse" />
        </div>

        {/* Trust bar */}
        <div className="relative z-10 grid grid-cols-2 gap-5">
          {trustItems.map((t) => {
            const TIcon = t.icon;
            return (
              <div key={t.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <TIcon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
