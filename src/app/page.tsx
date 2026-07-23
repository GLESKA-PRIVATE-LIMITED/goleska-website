"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, ShieldCheck, MapPin, Zap, IndianRupee } from 'lucide-react';
import LanguageSelector from '@/components/landing/LanguageSelector';
import ThemeToggle from '@/components/landing/ThemeToggle';

const TICKER_ITEMS = ['AI Dispatch', '60 Second Match', 'Aadhaar Verified', 'Daily Payouts', '12 Languages'];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#eef1fb] font-sans text-slate-900 selection:bg-indigo-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">

      {/* STICKY NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <span className="font-[var(--font-anton)] text-2xl uppercase tracking-wide text-slate-900 dark:text-white">GO LESKA</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden gap-8 text-sm font-semibold text-slate-600 md:flex dark:text-slate-300">
            <Link href="#how" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">How it works</Link>
            <Link href="#worker" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">For Workers</Link>
            <Link href="#employer" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">For Employers</Link>
            <Link href="#trades" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Trades</Link>
          </div>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 py-16 sm:py-24 md:flex-row md:gap-12 md:py-28">
        <div className="relative z-10 w-full flex-1 space-y-7">
          <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
            The Blue Collar Army
          </div>
          <h1 className="font-[var(--font-anton)] text-5xl uppercase leading-[0.95] tracking-wide text-slate-900 sm:text-6xl md:text-8xl dark:text-white">
            Kaam Milega.<br /><span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Turant.</span>
          </h1>
          <p className="max-w-xl text-lg font-medium leading-relaxed text-slate-600 md:text-xl dark:text-slate-300">
            India&apos;s blue-collar army deserves better than waiting at the chowk. GO LESKA matches verified workers to real jobs in <span className="font-bold text-indigo-600">60 seconds</span> - powered by AI, built for the factory floor.
          </p>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Link href="/login?type=worker" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700">
              I want work <ArrowRight size={20} />
            </Link>
            <Link href="/login?type=employer" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              I need workers <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* HERO IMAGE / INTERACTIVE COMPONENT */}
        <div className="relative h-[360px] w-full flex-1 overflow-hidden rounded-2xl shadow-xl shadow-slate-300/50 sm:h-[440px] md:h-[500px]">
          <img src="/hero.jpg" alt="Industrial workers at a refinery at sunset" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/70 to-transparent"></div>

          {/* 60s Match Card Overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center gap-4 rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <ShieldCheck />
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-slate-600"><Clock size={14} /> Accepted job in 14s</p>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER - seamless auto-sliding marquee (content duplicated 2x, animated -50%) */}
      <div className="relative flex w-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 py-4">
        <div className="flex w-max shrink-0 animate-[scroll_20s_linear_infinite] items-center whitespace-nowrap font-[var(--font-anton)] text-2xl uppercase tracking-widest text-white">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mx-8 flex items-center gap-2">
              <span className="text-amber-300">&#9733;</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="mb-14 text-center">
          <h2 className="font-[var(--font-anton)] text-4xl uppercase tracking-wide text-slate-900 sm:text-5xl md:text-6xl dark:text-white">The 60-second hiring cycle</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-600 dark:text-slate-400">Inspired by Ola/Uber dispatch, rebuilt for India&apos;s industrial workforce. From &quot;I need workers&quot; to &quot;workers on the way&quot; - under a minute.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
          {[
            { step: "1", title: "Boss Speaks", desc: "Speak or type in Hindi/English." },
            { step: "2", title: "AI Parses", desc: "LLM extracts roles & salary instantly." },
            { step: "3", title: "Engine Ranks", desc: "Matches top local candidates." },
            { step: "4", title: "Worker Pinged", desc: "Gets 30s to accept the job card." },
            { step: "5", title: "Nav Starts", desc: "GPS routing directly to factory." }
          ].map((s, i) => (
            <div key={i} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-[var(--font-anton)] text-xl text-white">{s.step}</span>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOR WORKERS */}
      <section id="worker" className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 py-20 sm:py-24 lg:flex-row">
          <div className="flex-1 space-y-6">
            <h2 className="font-[var(--font-anton)] text-5xl uppercase leading-none text-amber-300 sm:text-6xl lg:text-7xl">Tumhari skill.<br />Tumhari fauj.</h2>
            <p className="text-lg font-medium text-white/80">No more middlemen. No more standing at the chowk at 5 AM. Get verified once, get matched forever. Every job adds to your permanent reputation.</p>
            <ul className="space-y-3.5 pt-2 text-base font-semibold text-white/90">
              <li className="flex items-center gap-3"><span className="text-amber-300">&#9656;</span> 12 Indian languages - Hindi, Marathi, Tamil...</li>
              <li className="flex items-center gap-3"><span className="text-amber-300">&#9656;</span> Aadhaar + skill verification = trust badge</li>
              <li className="flex items-center gap-3"><span className="text-amber-300">&#9656;</span> Daily payout. No salary delay drama.</li>
            </ul>
          </div>

          <div className="relative flex w-full flex-1 justify-center">
            {/* Phone Mockup Card */}
            <div className="w-full max-w-[320px] rounded-2xl bg-white p-5 text-slate-900 shadow-2xl">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">New Job Ping</span>
                <Zap size={16} className="fill-amber-500 text-amber-500" />
              </div>
              <h3 className="font-[var(--font-anton)] text-2xl uppercase leading-tight text-slate-900">Fiber Laser Operator</h3>
              <div className="mt-2 inline-flex w-max items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-sm font-bold text-amber-700">
                <IndianRupee size={16} /> 800 / day
              </div>
              <div className="mt-4 space-y-2 text-sm font-medium text-slate-600">
                <p className="flex items-center gap-2"><MapPin size={16} /> 2.1 km away (Pune Factory)</p>
                <p className="flex items-center gap-2"><Clock size={16} /> Accept within 00:24</p>
              </div>
              <div className="mt-5 flex gap-2">
                <button className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-bold uppercase text-white">Accept</button>
                <button className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-bold uppercase text-slate-500">Pass</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR EMPLOYERS */}
      <section id="employer" className="mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 py-20 sm:py-24 lg:flex-row-reverse">
        <div className="flex-1 space-y-5">
          <h2 className="font-[var(--font-anton)] text-5xl uppercase leading-none text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">Bolo.<br />AI samajhega.<br />Workers aayenge.</h2>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Type or speak in any Indian language. Our LLM extracts skills, experience, salary and radius. Pick Autonomous AI dispatch or review candidates manually.</p>
        </div>

        <div className="w-full flex-1">
          {/* AI NLP Prompt Card */}
          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">LLM Dispatch Engine</div>
            <p className="mt-4 rounded-xl border-l-4 border-indigo-500 bg-slate-50 p-4 text-base italic text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              &quot;Mujhe 5 fiber laser operators chahiye, kam se kam 3 saal experience, Hindi-English aata ho, salary &#8377;800/day, 10km radius mein.&quot;
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Role</span>
                <span className="font-[var(--font-anton)] text-xl text-slate-900">Laser Operator</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Headcount</span>
                <span className="font-[var(--font-anton)] text-xl text-slate-900">5 Workers</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Salary Cap</span>
                <span className="font-[var(--font-anton)] text-xl text-slate-900">&#8377;800/day</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Radius</span>
                <span className="font-[var(--font-anton)] text-xl text-slate-900">10 km</span>
              </div>
            </div>
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700">
              <Zap size={18} className="fill-amber-300 text-amber-300" /> Dispatch Now
            </button>
          </div>
        </div>
      </section>

      {/* TRADES WALL */}
      <section id="trades" className="border-y border-slate-200 bg-white px-6 py-20 sm:py-24 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center font-[var(--font-anton)] text-4xl uppercase text-slate-900 sm:text-5xl md:text-6xl dark:text-white">38 Trades. One Army.</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Welder', 'Fitter', 'CNC Operator', 'Forklift Driver', 'Electrician', 'Plumber', 'Mason', 'Painter', 'Carpenter', 'Machine Operator', 'Packer', 'Loader', 'Security Guard', 'Housekeeping', 'Cook'].map((trade) => (
              <div key={trade} className="cursor-default rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 font-[var(--font-anton)] text-lg uppercase text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300">
                {trade}
              </div>
            ))}
            <div className="cursor-default rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-[var(--font-anton)] text-lg uppercase text-white">
              + 23 More
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="mx-auto max-w-4xl space-y-6 px-6 py-24 text-center sm:py-28">
        <p className="font-[var(--font-anton)] text-4xl uppercase leading-[0.95] text-slate-900 sm:text-5xl md:text-7xl dark:text-white">
          India was not built by spreadsheets.
        </p>
        <p className="mx-auto inline-block max-w-2xl rounded-2xl bg-indigo-50 px-6 py-4 text-xl font-medium leading-relaxed text-indigo-900/80 dark:bg-indigo-950/40 dark:text-indigo-200">
          It was built by hands, by sweat, by people who show up at 5 AM with a tiffin and a tool bag. They deserve technology that respects them.
        </p>
      </section>

      {/* FOOTER CTA */}
      <footer className="bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-800 px-6 pb-8 pt-20 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center space-y-7 text-center">
          <h2 className="font-[var(--font-anton)] text-4xl uppercase sm:text-5xl md:text-7xl">Join the blue collar army.</h2>
          <p className="max-w-lg text-lg font-medium text-white/80">Drop your number. We&apos;ll text you the app link and onboard you in 4 minutes - Aadhaar verification included.</p>

          <div className="mt-4 flex w-full max-w-md">
            <span className="inline-flex items-center rounded-l-full border border-r-0 border-white/20 bg-white/15 px-4 text-lg font-bold text-white">
              +91
            </span>
            <input type="tel" placeholder="Mobile Number" className="min-w-0 flex-1 border-y border-white/20 bg-white/10 px-4 py-3.5 text-lg font-semibold text-white outline-none placeholder:text-white/50" />
            <button className="shrink-0 rounded-r-full bg-amber-400 px-5 py-3.5 font-[var(--font-anton)] text-lg uppercase tracking-wider text-slate-900 transition hover:bg-amber-300 sm:px-6">
              Get App
            </button>
          </div>

          <div className="mt-20 flex w-full flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 text-sm font-semibold text-white/60 md:flex-row">
            <div className="flex gap-6">
              <Link href="#" className="transition-colors hover:text-white">Privacy</Link>
              <Link href="#" className="transition-colors hover:text-white">Terms</Link>
              <Link href="#" className="transition-colors hover:text-white">Contact</Link>
            </div>
            <p className="text-amber-300">Made in Bharat 🇮🇳</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
