"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, ShieldCheck, MapPin, Zap, IndianRupee } from 'lucide-react';
import LanguageSelector from '@/components/landing/LanguageSelector';
import ThemeToggle from '@/components/landing/ThemeToggle';
import { useLanguage } from '@/context/LanguageContext';

export default function LandingPage() {
  const { t } = useLanguage();

  const tickerKeys = ['ticker.aiDispatch', 'ticker.match60s', 'ticker.aadhaarVerified', 'ticker.dailyPayouts', 'ticker.languages12'];

  const tradesList = [
    { key: 'trade.welder', defaultText: 'Welder' },
    { key: 'trade.fitter', defaultText: 'Fitter' },
    { key: 'trade.cnc', defaultText: 'CNC Operator' },
    { key: 'trade.forklift', defaultText: 'Forklift Driver' },
    { key: 'trade.electrician', defaultText: 'Electrician' },
    { key: 'trade.plumber', defaultText: 'Plumber' },
    { key: 'trade.mason', defaultText: 'Mason' },
    { key: 'trade.painter', defaultText: 'Painter' },
    { key: 'trade.carpenter', defaultText: 'Carpenter' },
    { key: 'trade.machine', defaultText: 'Machine Operator' },
    { key: 'trade.packer', defaultText: 'Packer' },
    { key: 'trade.loader', defaultText: 'Loader' },
    { key: 'trade.guard', defaultText: 'Security Guard' },
    { key: 'trade.housekeeping', defaultText: 'Housekeeping' },
    { key: 'trade.cook', defaultText: 'Cook' },
  ];

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
            <Link href="#how" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">{t('nav.howItWorks')}</Link>
            <Link href="#worker" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">{t('nav.forWorkers')}</Link>
            <Link href="#employer" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">{t('nav.forEmployers')}</Link>
            <Link href="#trades" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">{t('nav.trades')}</Link>
          </div>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 py-16 sm:py-24 md:flex-row md:gap-12 md:py-28">
        <div className="relative z-10 w-full flex-1 space-y-7">
          <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
            {t('hero.badge')}
          </div>
          <h1 className="font-[var(--font-anton)] text-5xl uppercase leading-[0.95] tracking-wide text-slate-900 sm:text-6xl md:text-8xl dark:text-white">
            {t('hero.titleLine1')}<br /><span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('hero.titleLine2')}</span>
          </h1>
          <p className="max-w-xl text-lg font-medium leading-relaxed text-slate-600 md:text-xl dark:text-slate-300">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Link href="/login?type=worker" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700">
              {t('hero.ctaWorker')} <ArrowRight size={20} />
            </Link>
            <Link href="/login?type=employer" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              {t('hero.ctaEmployer')} <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* HERO IMAGE / INTERACTIVE COMPONENT */}
        <div className="relative h-[360px] w-full flex-1 overflow-hidden rounded-2xl shadow-xl shadow-slate-300/50 sm:h-[440px] md:h-[500px]">
          <img src="/hero.jpg" alt="Industrial workers at a refinery at sunset" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/70 to-transparent"></div>

          {/* Match badge overlay */}
          <div className="absolute bottom-6 left-6 z-20 inline-flex w-max max-w-[calc(100%-3rem)] items-center gap-3 rounded-full bg-white/95 py-2 pl-2 pr-5 shadow-lg backdrop-blur">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <ShieldCheck size={18} />
            </div>
            <span className="text-sm font-bold text-slate-900">{t('hero.verifiedBadge')}</span>
          </div>
        </div>
      </section>

      {/* TICKER - seamless auto-sliding marquee */}
      <div className="relative flex w-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 py-4">
        <div className="flex w-max shrink-0 animate-[scroll_20s_linear_infinite] items-center whitespace-nowrap font-[var(--font-anton)] text-2xl uppercase tracking-widest text-white">
          {[...tickerKeys, ...tickerKeys].map((key, i) => (
            <span key={i} className="mx-8 flex items-center gap-2">
              <span className="text-amber-300">&#9733;</span> {t(key)}
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="mb-14 text-center">
          <h2 className="font-[var(--font-anton)] text-4xl uppercase tracking-wide text-slate-900 sm:text-5xl md:text-6xl dark:text-white">{t('how.title')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-600 dark:text-slate-400">{t('how.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
          {[
            { step: "1", titleKey: "how.step1Title", descKey: "how.step1Desc" },
            { step: "2", titleKey: "how.step2Title", descKey: "how.step2Desc" },
            { step: "3", titleKey: "how.step3Title", descKey: "how.step3Desc" },
            { step: "4", titleKey: "how.step4Title", descKey: "how.step4Desc" },
            { step: "5", titleKey: "how.step5Title", descKey: "how.step5Desc" }
          ].map((s, i) => (
            <div key={i} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-[var(--font-anton)] text-xl text-white">{s.step}</span>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{t(s.titleKey)}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t(s.descKey)}</p>
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
            <h2 className="font-[var(--font-anton)] text-5xl uppercase leading-none text-amber-300 sm:text-6xl lg:text-7xl">{t('worker.titleLine1')}<br />{t('worker.titleLine2')}</h2>
            <p className="text-lg font-medium text-white/80">{t('worker.desc')}</p>
            <ul className="space-y-3.5 pt-2 text-base font-semibold text-white/90">
              <li className="flex items-center gap-3"><span className="text-amber-300">&#9656;</span> {t('worker.bullet1')}</li>
              <li className="flex items-center gap-3"><span className="text-amber-300">&#9656;</span> {t('worker.bullet2')}</li>
              <li className="flex items-center gap-3"><span className="text-amber-300">&#9656;</span> {t('worker.bullet3')}</li>
            </ul>
          </div>

          <div className="relative flex w-full flex-1 justify-center">
            {/* Phone Mockup Card */}
            <div className="w-full max-w-[320px] rounded-2xl bg-white p-5 text-slate-900 shadow-2xl">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('worker.pingTitle')}</span>
                <Zap size={16} className="fill-amber-500 text-amber-500" />
              </div>
              <h3 className="font-[var(--font-anton)] text-2xl uppercase leading-tight text-slate-900">{t('worker.jobTitle')}</h3>
              <div className="mt-2 inline-flex w-max items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-sm font-bold text-amber-700">
                <IndianRupee size={16} /> {t('worker.jobRate')}
              </div>
              <div className="mt-4 space-y-2 text-sm font-medium text-slate-600">
                <p className="flex items-center gap-2"><MapPin size={16} /> {t('worker.jobDistance')}</p>
                <p className="flex items-center gap-2"><Clock size={16} /> {t('worker.jobTimer')}</p>
              </div>
              <div className="mt-5 flex gap-2">
                <button className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-bold uppercase text-white">{t('worker.btnAccept')}</button>
                <button className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-bold uppercase text-slate-500">{t('worker.btnPass')}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR EMPLOYERS */}
      <section id="employer" className="mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 py-20 sm:py-24 lg:flex-row-reverse">
        <div className="flex-1 space-y-5">
          <h2 className="font-[var(--font-anton)] text-5xl uppercase leading-none text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">{t('employer.titleLine1')}<br />{t('employer.titleLine2')}<br />{t('employer.titleLine3')}</h2>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">{t('employer.desc')}</p>
        </div>

        <div className="w-full flex-1">
          {/* AI NLP Prompt Card */}
          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">LLM Dispatch Engine</div>
            <p className="mt-4 rounded-xl border-l-4 border-indigo-500 bg-slate-50 p-4 text-base italic text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {t('employer.demoPrompt')}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('employer.roleLabel')}</span>
                <span className="font-[var(--font-anton)] text-xl text-slate-900">{t('employer.roleVal')}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('employer.headcountLabel')}</span>
                <span className="font-[var(--font-anton)] text-xl text-slate-900">{t('employer.headcountVal')}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('employer.salaryLabel')}</span>
                <span className="font-[var(--font-anton)] text-xl text-slate-900">&#8377;800/day</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('employer.radiusLabel')}</span>
                <span className="font-[var(--font-anton)] text-xl text-slate-900">10 km</span>
              </div>
            </div>
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700">
              <Zap size={18} className="fill-amber-300 text-amber-300" /> {t('employer.dispatchBtn')}
            </button>
          </div>
        </div>
      </section>

      {/* TRADES WALL */}
      <section id="trades" className="border-y border-slate-200 bg-white px-6 py-20 sm:py-24 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center font-[var(--font-anton)] text-4xl uppercase text-slate-900 sm:text-5xl md:text-6xl dark:text-white">{t('trades.title')}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {tradesList.map((item) => (
              <div key={item.key} className="cursor-default rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 font-[var(--font-anton)] text-lg uppercase text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300">
                {t(item.key)}
              </div>
            ))}
            <div className="cursor-default rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-[var(--font-anton)] text-lg uppercase text-white">
              {t('trades.more')}
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="mx-auto max-w-4xl space-y-6 px-6 py-24 text-center sm:py-28">
        <p className="font-[var(--font-anton)] text-4xl uppercase leading-[0.95] text-slate-900 sm:text-5xl md:text-7xl dark:text-white">
          {t('manifesto.line1')}
        </p>
        <p className="mx-auto inline-block max-w-2xl rounded-2xl bg-indigo-50 px-6 py-4 text-xl font-medium leading-relaxed text-indigo-900/80 dark:bg-indigo-950/40 dark:text-indigo-200">
          {t('manifesto.line2')}
        </p>
      </section>

      {/* FOOTER CTA */}
      <footer className="bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-800 px-6 pb-8 pt-20 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center space-y-7 text-center">
          <h2 className="font-[var(--font-anton)] text-4xl uppercase sm:text-5xl md:text-7xl">{t('footer.title')}</h2>
          <p className="max-w-lg text-lg font-medium text-white/80">{t('footer.subtitle')}</p>

          <div className="mt-4 flex w-full max-w-md">
            <span className="inline-flex items-center rounded-l-full border border-r-0 border-white/20 bg-white/15 px-4 text-lg font-bold text-white">
              +91
            </span>
            <input type="tel" placeholder={t('footer.placeholder')} className="min-w-0 flex-1 border-y border-white/20 bg-white/10 px-4 py-3.5 text-lg font-semibold text-white outline-none placeholder:text-white/50" />
            <button className="shrink-0 rounded-r-full bg-amber-400 px-5 py-3.5 font-[var(--font-anton)] text-lg uppercase tracking-wider text-slate-900 transition hover:bg-amber-300 sm:px-6">
              {t('footer.getAppBtn')}
            </button>
          </div>

          <div className="mt-20 flex w-full flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 text-sm font-semibold text-white/60 md:flex-row">
            <div className="flex gap-6">
              <Link href="#" className="transition-colors hover:text-white">{t('footer.privacy')}</Link>
              <Link href="#" className="transition-colors hover:text-white">{t('footer.terms')}</Link>
              <Link href="#" className="transition-colors hover:text-white">{t('footer.contact')}</Link>
            </div>
            <p className="text-amber-300">{t('footer.madeIn')}</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
