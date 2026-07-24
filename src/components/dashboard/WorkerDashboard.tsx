import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Power, Navigation, Clock, CheckCircle, Loader2, ShieldCheck, Zap } from 'lucide-react';
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

  useEffect(() => {
    fetchWorkerJobs();
    // refreshSignal bumps when a job offer is accepted elsewhere on the
    // dashboard, so the freshly accepted assignment shows up here.
  }, [refreshSignal]);

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

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      {/* Availability Toggle */}
      <button
        type="button"
        onClick={loadingToggle ? undefined : toggleAvailability}
        disabled={loadingToggle}
        className={`relative w-full overflow-hidden rounded-2xl p-6 text-left shadow-xl transition ${
          isAvailable
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25'
            : 'bg-white text-slate-500 shadow-slate-300/40 ring-1 ring-slate-200'
        }`}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isAvailable ? 'animate-pulse bg-white' : 'bg-slate-300'}`} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">{isAvailable ? 'Online' : 'Offline'}</span>
            </div>
            <h2 className="text-2xl font-extrabold leading-tight">{isAvailable ? 'Searching for work' : "You're offline"}</h2>
            <p className={`mt-1 text-sm ${isAvailable ? 'text-white/80' : 'text-slate-400'}`}>
              {isAvailable ? 'Visible to employers nearby' : 'Tap to go online and get hired'}
            </p>
          </div>
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition ${
              isAvailable ? 'bg-white/15 ring-1 ring-white/25' : 'bg-slate-100'
            }`}
          >
            {loadingToggle ? (
              <Loader2 size={26} className="animate-spin" />
            ) : (
              <Power size={26} className={isAvailable ? 'text-white' : 'text-slate-400'} />
            )}
          </div>
        </div>
      </button>

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

      {/* Recent Jobs History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jobs Done</h3>
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
