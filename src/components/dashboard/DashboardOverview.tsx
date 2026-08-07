"use client";

import React, { useState } from 'react';
import { Users, UserCheck, Loader2, CheckCircle2, ArrowRight, TrendingUp, Bell } from 'lucide-react';

interface Props {
  profileData: any;
  activeJobId: string | null;
  onOpenReports: () => void;
  onPostJob: () => void;
}

// Static, illustrative trend datasets. There is NO time-series backend data for
// this, so these bars are purely visual chrome (clearly tagged "Sample") - not
// numbers presented as real facts.
const trendData: Record<string, { label: string; value: number }[]> = {
  Day: [
    { label: '9a', value: 8 }, { label: '11a', value: 14 }, { label: '1p', value: 10 },
    { label: '3p', value: 20 }, { label: '5p', value: 16 }, { label: '7p', value: 24 }, { label: '9p', value: 18 },
  ],
  Week: [
    { label: 'Mon', value: 32 }, { label: 'Tue', value: 45 }, { label: 'Wed', value: 38 },
    { label: 'Thu', value: 52 }, { label: 'Fri', value: 60 }, { label: 'Sat', value: 48 }, { label: 'Sun', value: 28 },
  ],
  Month: [
    { label: 'W1', value: 120 }, { label: 'W2', value: 165 }, { label: 'W3', value: 140 }, { label: 'W4', value: 190 },
  ],
  Year: [
    { label: 'Q1', value: 420 }, { label: 'Q2', value: 560 }, { label: 'Q3', value: 480 }, { label: 'Q4', value: 640 },
  ],
};

function StatCard({
  icon: Icon,
  label,
  value,
  soon,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: React.ReactNode;
  soon?: boolean;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-white ${accent}`}>
        <Icon size={20} />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      {soon ? (
        <p className="mt-1 text-sm font-bold text-slate-400">Coming soon</p>
      ) : (
        <p className="mt-1 text-3xl font-extrabold text-slate-900">{value}</p>
      )}
    </div>
  );
}

export default function DashboardOverview({ profileData, activeJobId, onOpenReports, onPostJob }: Props) {
  const [range, setRange] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Week');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const name =
    profileData?.company_name && profileData.company_name !== 'Name Not Found'
      ? profileData.company_name
      : profileData?.proprietor_name || 'there';

  // Jobs in Progress is the ONE aggregate we can honestly derive right now: the
  // app tracks a single live dispatch client-side (activeJobId). Everything else
  // (workforce counts, completed-job history) has no backend endpoint -> "Coming soon".
  const jobsInProgress = activeJobId ? 1 : 0;

  const bars = trendData[range];
  const maxVal = Math.max(...bars.map((b) => b.value));

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {greeting}, {name} <span className="inline-block">👋</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Workers" soon accent="bg-gradient-to-br from-blue-600 to-indigo-600" />
        <StatCard icon={UserCheck} label="Active Workers" soon accent="bg-gradient-to-br from-violet-600 to-purple-600" />
        <StatCard
          icon={Loader2}
          label="Jobs in Progress"
          value={jobsInProgress}
          accent="bg-gradient-to-br from-amber-500 to-orange-500"
        />
        <StatCard icon={CheckCircle2} label="Completed Jobs" soon accent="bg-gradient-to-br from-emerald-500 to-teal-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend chart (illustrative) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Daily Workforce Trend</h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                Sample
              </span>
            </div>
            <div className="flex rounded-full bg-slate-100 p-0.5">
              {(['Day', 'Week', 'Month', 'Year'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    range === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex h-52 items-end justify-between gap-2 sm:gap-3">
            {bars.map((b) => (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 transition-all"
                    style={{ height: `${Math.max(6, (b.value / maxVal) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-400">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity (honest empty state - no activity-log backend) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Recent Activity</h3>
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-slate-400">
            <Bell size={36} strokeWidth={1.5} />
            <p className="text-sm font-medium">No recent activity yet</p>
            <p className="max-w-[220px] text-xs text-slate-400">
              Your dispatches and worker updates will show up here.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="max-w-lg">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
              <TrendingUp size={13} /> Insights
            </div>
            <h3 className="text-xl font-extrabold sm:text-2xl">Grow your Business with Better Insights</h3>
            <p className="mt-1 text-sm text-white/75">
              Track hiring trends, workforce efficiency and more with GO LESKA analytics.
            </p>
          </div>
          <button
            onClick={onOpenReports}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-slate-100"
          >
            View Reports <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick action to preserve the AI-hiring dispatch flow entry point */}
      <div className="flex justify-center">
        <button
          onClick={onPostJob}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700"
        >
          Post a Job <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
