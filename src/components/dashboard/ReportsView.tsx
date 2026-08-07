"use client";

import React from 'react';
import { Info, TrendingUp, Sparkles, IndianRupee, ArrowUpRight } from 'lucide-react';

// This whole page is a VISUAL MOCKUP. GO LESKA has no revenue / department /
// AI-summary / milestone backend concepts today, so every number and chart below
// is illustrative sample data (flagged by the banner). There are intentionally NO
// interactive controls (no export/save/refresh) that would imply real functionality.

const perfBars = [
  { label: 'Jan', value: 42 }, { label: 'Feb', value: 55 }, { label: 'Mar', value: 48 },
  { label: 'Apr', value: 63 }, { label: 'May', value: 70 }, { label: 'Jun', value: 58 },
  { label: 'Jul', value: 75 }, { label: 'Aug', value: 82 }, { label: 'Sep', value: 68 },
  { label: 'Oct', value: 88 }, { label: 'Nov', value: 79 }, { label: 'Dec', value: 95 },
];

const departments = [
  { name: 'Construction', value: 86 },
  { name: 'Logistics', value: 72 },
  { name: 'Facility', value: 64 },
  { name: 'Manufacturing', value: 58 },
];

const milestones = [
  { period: 'Q1', title: 'Platform launch', desc: 'Onboarded first pilot employers.' },
  { period: 'Q2', title: 'Dispatch engine', desc: 'Rolled out proximity-based matching.' },
  { period: 'Q3', title: 'KYC automation', desc: 'Integrated document verification.' },
  { period: 'Q4', title: 'Scale up', desc: 'Expanded to new cities.' },
];

export default function ReportsView() {
  const maxPerf = Math.max(...perfBars.map((b) => b.value));

  return (
    <div className="space-y-6">
      {/* Header + sample banner */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Reports</h1>
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Preview
          </span>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-bold">Sample data</span> - full analytics are coming soon. The numbers and charts on
            this page are illustrative only and do not reflect real account activity.
          </p>
        </div>
      </div>

      {/* Top stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <IndianRupee size={20} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Gross Revenue</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">₹0</p>
          <p className="mt-1 text-xs text-slate-400">Sample metric</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <ArrowUpRight size={20} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Organic Growth</p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold text-slate-900">
            +24% <TrendingUp size={22} className="text-emerald-500" />
          </p>
          <p className="mt-1 text-xs text-slate-400">Sample metric</p>
        </div>
      </div>

      {/* Year Performance Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-sm font-bold text-slate-900">Year Performance Overview</h3>
        <div className="flex h-56 items-end justify-between gap-1.5 sm:gap-2">
          {perfBars.map((b) => (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-blue-400"
                  style={{ height: `${Math.max(6, (b.value / maxPerf) * 100)}%` }}
                />
              </div>
              <span className="text-[9px] font-medium text-slate-400">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Efficiency */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Department Efficiency</h3>
          <div className="space-y-4">
            {departments.map((d) => (
              <div key={d.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">{d.name}</span>
                  <span className="font-bold text-slate-900">{d.value}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                    style={{ width: `${d.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <Sparkles size={16} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AI Summary</h3>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
              Sample
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Your hiring activity trended upward through the year, with strong momentum in the final quarter.
            Construction and logistics roles saw the highest fulfilment rates, while average time-to-dispatch
            improved steadily. This is placeholder narrative text illustrating where an AI-generated performance
            summary would appear.
          </p>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-5 text-sm font-bold text-slate-900">Year Milestone Timeline</h3>
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-1 h-[calc(100%-1rem)] w-0.5 bg-slate-200" />
          <div className="space-y-6">
            {milestones.map((m) => (
              <div key={m.period} className="relative">
                <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600 shadow" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">{m.period}</p>
                <p className="text-sm font-bold text-slate-900">{m.title}</p>
                <p className="text-xs text-slate-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
