import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Power, Navigation, Clock, CheckCircle, Loader2, ShieldCheck, Zap, Radar, Briefcase, ChevronDown, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const JobNavigationSheet = dynamic(() => import('./JobNavigationSheet'), { ssr: false });

interface ActiveJob {
  match_id: string;
  job_id: string;
  title: string;
  employer_name: string;
  employer_phone: string;
  status: string;
  arrival_otp?: string | null;
  completion_otp?: string | null;
  salary: number;
  target_lat?: number | null;
  target_lng?: number | null;
}

interface CompletedJob {
  match_id: string;
  job_id: string;
  title: string;
  employer_name: string;
  salary: number;
  completed_at: string | null;
}

interface AvailableJob {
  job_id: string;
  title: string;
  salary: number;
  headcount: number;
  min_experience: number | null;
  employer_name: string;
  distance_m: number | null;
  distance_km: number | null;
}

interface WorkerDashboardProps {
  profileData: any;
  setProfileData: (data: any) => void;
  refreshSignal?: number;
}

// Shared visual for the arrival / completion OTP codes shown on the active job.
function OtpCard({ icon: Icon, label, code, hint }: { icon: any; label: string; code: string; hint: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60 p-5 text-center">
      <Icon size={80} className="pointer-events-none absolute -right-3 -top-3 text-slate-900/5" />
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="font-mono text-4xl font-extrabold tracking-[0.3em] text-slate-900">{code}</p>
      <p className="mt-2 text-xs font-medium text-slate-500">{hint}</p>
    </div>
  );
}

export default function WorkerDashboard({ profileData, setProfileData, refreshSignal }: WorkerDashboardProps) {
  const { session } = useAuth();
  const [isAvailable, setIsAvailable] = useState(profileData?.is_available ?? true);
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [arriving, setArriving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [availableJobs, setAvailableJobs] = useState<AvailableJob[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWorkOptions, setShowWorkOptions] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    fetchWorkerJobs();
    fetchAvailableJobs();
    // refreshSignal bumps when a job offer is accepted elsewhere on the
    // dashboard, so the freshly accepted assignment shows up here.
  }, [refreshSignal]);

  // Poll nearby open jobs on a light interval, mirroring the active-job refresh.
  useEffect(() => {
    const interval = setInterval(fetchAvailableJobs, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/workers/me/available-jobs`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableJobs(data.jobs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const fetchWorkerJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/workers/me/jobs`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveJob(data.active_job);
        setCompletedJobs(data.recent_jobs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingJobs(false);
    }
  };

  const toggleAvailability = async () => {
    const newValue = !isAvailable;
    setIsAvailable(newValue);
    setLoadingToggle(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/workers/me/availability`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_available: newValue })
      });
      if (!res.ok) {
        setIsAvailable(!newValue); // Revert on failure
      }
    } catch (e) {
      setIsAvailable(!newValue);
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleArrive = async () => {
    if (!activeJob) return;
    setArriving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/${activeJob.job_id}/arrive`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to mark arrival');
      }
      const data = await res.json();
      // Persist the OTP in local state; it also survives refresh because
      // /me/jobs returns arrival_otp for ARRIVED jobs.
      setActiveJob({ ...activeJob, status: data.status, arrival_otp: data.arrival_otp });
      toast.success('Arrival recorded! Share the OTP with your employer.');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to mark arrival.');
    } finally {
      setArriving(false);
    }
  };

  const handleRequestCompletion = async () => {
    if (!activeJob) return;
    setCompleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/${activeJob.job_id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to request completion');
      }
      const data = await res.json();
      // The job isn't done yet - the employer must enter this code on their
      // dashboard to actually mark it COMPLETED.
      setActiveJob({ ...activeJob, completion_otp: data.completion_otp });
      toast.success('Completion code generated! Share it with your employer to finish the job.');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to request completion.');
    } finally {
      setCompleting(false);
    }
  };

  // Once a completion code has been requested, poll for the employer having
  // confirmed it (job match leaving ARRIVED status clears activeJob).
  useEffect(() => {
    if (!activeJob?.completion_otp) return;
    const interval = setInterval(fetchWorkerJobs, 5000);
    return () => clearInterval(interval);
  }, [activeJob?.completion_otp]);

  const handleDismiss = async () => {
    if (!activeJob) return;
    if (!confirm('Clear this active assignment? This cannot be undone.')) return;
    setDismissing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/${activeJob.job_id}/dismiss`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to clear assignment');
      }
      setActiveJob(null);
      toast.success('Assignment cleared.');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to clear assignment.');
    } finally {
      setDismissing(false);
    }
  };

  const name = (profileData?.name || 'there').split(' ')[0];
  const q = searchQuery.trim().toLowerCase();
  const filteredJobs = q
    ? availableJobs.filter((j) => (j.title || '').toLowerCase().includes(q) || (j.employer_name || '').toLowerCase().includes(q))
    : availableJobs;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-1 pb-16">
      {/* Chat-style hero */}
      <div className="relative pt-2">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-56 w-[34rem] max-w-full -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200/50 via-blue-200/40 to-transparent blur-3xl"
        />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
            <Sparkles size={13} /> Your skill. Your army.
          </div>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Hey {name}, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ready to work today?</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Search nearby jobs, or go online so employers can hire you instantly.</p>
        </div>

        {/* Search + action pills */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/60">
            <button
              type="button"
              onClick={() => setShowWorkOptions((v) => !v)}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              <Briefcase size={16} className="text-indigo-600" />
              <span className="hidden sm:inline">I want work</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showWorkOptions ? 'rotate-180' : ''}`} />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role - Electrician, Welder, Driver..."
              className="min-w-0 flex-1 bg-transparent px-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={fetchAvailableJobs}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white transition hover:opacity-90"
              aria-label="Refresh jobs"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {showWorkOptions && (
            <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-top-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={loadingToggle ? undefined : toggleAvailability}
                disabled={loadingToggle}
                className={`flex items-center gap-3 rounded-2xl p-4 text-left text-white shadow-lg transition ${
                  isAvailable
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-slate-500 to-slate-600 shadow-slate-400/25'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  {loadingToggle ? <Loader2 size={20} className="animate-spin" /> : <Power size={20} />}
                </div>
                <div>
                  <p className="font-bold leading-tight">{isAvailable ? "You're Online" : "You're Offline"}</p>
                  <p className="text-xs text-white/70">{isAvailable ? 'Tap to go offline' : 'Tap to go online & get hired'}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={fetchAvailableJobs}
                className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-left text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <p className="font-bold leading-tight">Refresh Jobs</p>
                  <p className="text-xs text-white/70">Find the latest openings near you</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Job Card */}
      {loadingJobs ? (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
      ) : activeJob ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/40">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-5">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                <Zap size={11} fill="currentColor" /> Active Assignment
              </span>
              <h3 className="mt-2 text-xl font-extrabold text-slate-900">{activeJob.title}</h3>
              <p className="text-sm font-medium text-slate-500">{activeJob.employer_name}</p>
            </div>
            <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Pay</span>
              <span className="text-lg font-extrabold text-slate-900">₹{activeJob.salary}</span>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {activeJob.target_lat != null && activeJob.target_lng != null && (
              <button
                onClick={() => setShowNavigation(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700"
              >
                <Navigation size={16} /> View Navigation
              </button>
            )}

            {activeJob.status === 'ARRIVED' ? (
              <>
                {/* Arrival OTP (generated once on arrival, persisted server-side) */}
                <OtpCard
                  icon={ShieldCheck}
                  label="Arrival OTP Code"
                  code={activeJob.arrival_otp || '----'}
                  hint="Share this code with the employer to confirm you arrived."
                />

                {activeJob.completion_otp ? (
                  <div>
                    <OtpCard
                      icon={CheckCircle}
                      label="Completion Code"
                      code={activeJob.completion_otp}
                      hint="Give this code to your employer - they enter it on their dashboard to mark the job done."
                    />
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600">
                      <Loader2 className="animate-spin" size={14} /> Waiting for employer confirmation...
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleRequestCompletion}
                    disabled={completing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:opacity-90 disabled:opacity-50"
                  >
                    {completing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                    {completing ? 'Requesting...' : "I'm Done - Get Completion Code"}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleArrive}
                disabled={arriving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {arriving ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                {arriving ? 'Marking...' : "I've Arrived"}
              </button>
            )}

            <button
              onClick={handleDismiss}
              disabled={dismissing}
              className="w-full text-center text-xs font-semibold text-slate-400 underline-offset-2 transition hover:text-red-500 hover:underline disabled:opacity-50"
            >
              {dismissing ? 'Clearing...' : 'Clear this assignment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Clock size={26} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-700">No Active Jobs</h3>
          <p className="max-w-xs text-sm text-slate-400">
            Make sure you&apos;re online. New assignments will appear here the moment an employer hires you.
          </p>
        </div>
      )}

      {/* Available Jobs - collapsible; closed by default, opens on click. */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setShowAvailable((v) => !v)}
          className="flex w-full items-center justify-between gap-3 p-5 text-left transition hover:bg-slate-50 sm:p-6"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Available Jobs</h3>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              {loadingAvailable ? '...' : `${availableJobs.length} near you`}
            </span>
          </div>
          <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${showAvailable ? 'rotate-180' : ''}`} />
        </button>

        {showAvailable && (
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">

        {loadingAvailable ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : availableJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <Radar size={24} />
            </div>
            <p className="text-sm font-bold text-slate-700">No open jobs near you right now</p>
            <p className="max-w-sm text-xs text-slate-400">
              We&apos;ll match you the moment an employer nearby posts a job. Make sure your location is pinned and
              you&apos;re online.
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
            <p className="text-sm font-bold text-slate-700">No jobs match &quot;{searchQuery}&quot;</p>
            <p className="mt-1 text-xs text-slate-400">Try a different role or clear the search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <div
                key={job.job_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    <Briefcase size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">{job.title}</p>
                    <p className="truncate text-xs text-slate-500">
                      {job.employer_name}
                      {job.distance_km != null ? ` • ${job.distance_km} km away` : ''}
                      {` • ${job.headcount} needed`}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold text-slate-900">₹{job.salary}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">/ day</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-center text-[11px] text-slate-400">
          Jobs are dispatched to you automatically - you&apos;ll get an instant offer to accept as they arrive.
        </p>
          </div>
        )}
      </div>

      {/* Recent Jobs History - collapsible; closed by default, opens on click. */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setShowDone((v) => !v)}
          className="flex w-full items-center justify-between gap-3 p-5 text-left transition hover:bg-slate-50 sm:p-6"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jobs Done</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {completedJobs.length}
            </span>
          </div>
          <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${showDone ? 'rotate-180' : ''}`} />
        </button>
        {showDone && (
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            {completedJobs.length === 0 ? (
              <p className="text-sm text-slate-400">No completed jobs yet.</p>
            ) : (
              <div className="space-y-3">
                {completedJobs.map((job) => (
                  <div
                    key={job.match_id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <CheckCircle size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">{job.title}</p>
                        <p className="text-xs text-slate-500">
                          {job.employer_name}
                          {job.completed_at ? ` • ${new Date(job.completed_at).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-slate-900">₹{job.salary}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showNavigation && activeJob && activeJob.target_lat != null && activeJob.target_lng != null && (
        <JobNavigationSheet
          jobTitle={activeJob.title}
          employerName={activeJob.employer_name}
          employerPhone={activeJob.employer_phone}
          targetLat={activeJob.target_lat}
          targetLng={activeJob.target_lng}
          onClose={() => setShowNavigation(false)}
        />
      )}
    </div>
  );
}
