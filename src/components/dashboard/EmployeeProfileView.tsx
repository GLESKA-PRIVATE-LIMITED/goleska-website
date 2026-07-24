"use client";

import React, { useEffect, useState } from 'react';
import { Users, Star, Droplet, Clock, Hash, BadgeCheck, Loader2, Trophy } from 'lucide-react';

interface Props {
  jwtToken: string;
}

interface WorkerRow {
  id: string;
  name: string | null;
  account_type: string | null;
  blood_group: string | null;
  photo_url: string | null;
  overall_rating: number | null;
  total_jobs: number | null;
  is_verified: boolean;
}

function initials(name?: string | null): string {
  return (
    String(name || 'W')
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'W'
  );
}

// A stable, human-friendly employee ID derived from the worker's UUID.
function companyId(id: string): string {
  return `GLK-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

/**
 * Employee Profile - real workers who have accepted/completed a job dispatched
 * by this employer (backed by GET /api/v1/employers/me/workers, which resolves
 * Job -> JobMatch -> Worker). Shows an honest empty state when there are none.
 */
export default function EmployeeProfileView({ jwtToken }: Props) {
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/employers/me/workers`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (!res.ok) throw new Error('Failed to load workers.');
        const data = await res.json();
        if (active) setWorkers(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (active) setError(e.message || 'Failed to load workers.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [jwtToken]);

  // Company ranking = average rating of the team (out of 5).
  const rated = workers.filter((w) => w.overall_rating != null);
  const companyRanking = rated.length
    ? rated.reduce((s, w) => s + Number(w.overall_rating), 0) / rated.length
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Employee Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Workers who have accepted or completed jobs you dispatched.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
          <Loader2 className="animate-spin text-indigo-600" size={28} />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
      ) : workers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Users size={26} />
          </div>
          <p className="text-sm font-bold text-slate-700">No workers yet</p>
          <p className="max-w-sm text-xs text-slate-400">
            Workers you&apos;ve dispatched will appear here once they accept or complete your jobs.
          </p>
        </div>
      ) : (
        <>
          {/* Company ranking banner */}
          <div className="flex items-center justify-between rounded-2xl border border-indigo-200 bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Your Company Ranking</p>
                <p className="text-2xl font-extrabold">
                  {companyRanking != null ? companyRanking.toFixed(1) : '-'}
                  <span className="text-base font-semibold text-white/70"> / 5.0</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold">{workers.length}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Team Size</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {workers.map((w) => {
              const workHrs = (w.total_jobs ?? 0) * 8; // ~8h per completed shift
              return (
                <div key={w.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    {w.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={w.photo_url}
                        alt={w.name || 'Worker'}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                        {initials(w.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-base font-extrabold text-slate-900">
                        <span className="truncate">{w.name || 'Worker'}</span>
                        {w.is_verified && <BadgeCheck size={16} className="shrink-0 text-emerald-500" />}
                      </p>
                      <p className="flex items-center gap-1 truncate text-xs font-semibold text-slate-400">
                        <Hash size={12} /> {companyId(w.id)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center">
                      <Droplet size={16} className="mx-auto text-rose-500" />
                      <p className="mt-1 text-sm font-bold text-slate-900">{w.blood_group || '-'}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Blood</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center">
                      <Clock size={16} className="mx-auto text-sky-500" />
                      <p className="mt-1 text-sm font-bold text-slate-900">{workHrs}h</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Work Hrs</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center">
                      <Star size={16} className="mx-auto text-amber-500" />
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {w.overall_rating != null ? Number(w.overall_rating).toFixed(1) : '-'}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Rating</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center">
                      <Trophy size={16} className="mx-auto text-indigo-500" />
                      <p className="mt-1 text-sm font-bold text-slate-900">{w.total_jobs ?? 0}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Jobs</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
