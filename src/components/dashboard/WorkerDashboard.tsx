import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Power, Navigation, Clock, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
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
    <div className="space-y-6 max-w-lg mx-auto pb-24">
      {/* Availability Toggle */}
      <div 
        onClick={loadingToggle ? undefined : toggleAvailability}
        className={`relative border-4 border-black p-6 cursor-pointer hard-shadow transition-all overflow-hidden
          ${isAvailable ? 'bg-[var(--color-jungle)] text-white' : 'bg-gray-300 text-gray-600'}
        `}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(currentColor 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="font-[var(--font-anton)] text-3xl uppercase leading-none">
              {isAvailable ? 'Searching...' : 'Offline'}
            </h2>
            <p className="font-bold text-sm uppercase tracking-widest mt-1">
              {isAvailable ? 'Visible to employers' : 'Hidden from search'}
            </p>
          </div>
          <div className={`p-4 border-4 border-black rounded-full bg-white transition-transform ${isAvailable ? 'scale-110 shadow-[4px_4px_0_0_#000]' : 'scale-90 shadow-none'}`}>
            <Power size={32} strokeWidth={3} className={isAvailable ? 'text-[var(--color-jungle)]' : 'text-gray-400'} />
          </div>
        </div>
      </div>

      {/* Active Job Card */}
      {loadingJobs ? (
        <div className="h-40 bg-gray-200 animate-pulse border-4 border-black"></div>
      ) : activeJob ? (
        <div className="bg-[var(--color-saffron)] border-4 border-black hard-shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="bg-black text-[var(--color-saffron)] text-[10px] font-bold px-2 py-1 uppercase tracking-widest border-2 border-black">Active Assignment</span>
              <h3 className="font-[var(--font-anton)] text-2xl uppercase mt-2">{activeJob.title}</h3>
              <p className="font-bold text-sm text-gray-800">{activeJob.employer_name}</p>
            </div>
            <div className="bg-white border-2 border-black p-2 text-center">
              <span className="block text-xs font-black uppercase text-gray-500">Pay</span>
              <span className="font-[var(--font-anton)] text-xl leading-none">₹{activeJob.salary}</span>
            </div>
          </div>

          {activeJob.target_lat != null && activeJob.target_lng != null && (
            <button
              onClick={() => setShowNavigation(true)}
              className="w-full bg-black text-white font-bold uppercase tracking-widest text-sm py-3 border-2 border-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <Navigation size={16} /> View Navigation
            </button>
          )}

          <button
            onClick={handleDismiss}
            disabled={dismissing}
            className="w-full text-xs font-bold uppercase tracking-widest text-gray-700 hover:text-black underline mb-3 disabled:opacity-50"
          >
            {dismissing ? 'Clearing...' : 'Clear this assignment'}
          </button>

          {activeJob.status === 'ARRIVED' ? (
            <>
              {/* Arrival OTP (generated once on arrival, persisted server-side) */}
              <div className="bg-white border-4 border-black p-4 mb-3 text-center relative overflow-hidden">
                <div className="absolute -right-3 -top-3 opacity-10">
                  <ShieldCheck size={90} />
                </div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Arrival OTP Code</p>
                <p className="font-[var(--font-anton)] text-5xl tracking-[0.3em] leading-none">{activeJob.arrival_otp || '----'}</p>
                <p className="text-xs font-bold text-gray-600 mt-2">Share this code with the employer to confirm you arrived.</p>
              </div>

              {activeJob.completion_otp ? (
                <div className="bg-white border-4 border-black p-4 text-center relative overflow-hidden">
                  <div className="absolute -right-3 -top-3 opacity-10">
                    <CheckCircle size={90} />
                  </div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Completion Code</p>
                  <p className="font-[var(--font-anton)] text-5xl tracking-[0.3em] leading-none">{activeJob.completion_otp}</p>
                  <p className="text-xs font-bold text-gray-600 mt-2">Give this code to your employer - they enter it on their dashboard to mark the job done.</p>
                  <p className="text-xs font-bold text-[var(--color-jungle)] mt-3 flex items-center justify-center gap-1">
                    <Loader2 className="animate-spin" size={14} /> Waiting for employer confirmation...
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleRequestCompletion}
                  disabled={completing}
                  className="w-full bg-[var(--color-jungle)] text-white font-[var(--font-anton)] text-xl uppercase tracking-widest py-4 border-4 border-black hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {completing ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                  {completing ? 'Requesting...' : "I'm Done - Get Completion Code"}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleArrive}
              disabled={arriving}
              className="w-full bg-black text-white font-[var(--font-anton)] text-xl uppercase tracking-widest py-4 border-4 border-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {arriving ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
              {arriving ? 'Marking...' : "I've Arrived"}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border-4 border-black p-8 text-center hard-shadow">
          <Clock size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-[var(--font-anton)] text-2xl uppercase text-gray-400">No Active Jobs</h3>
          <p className="font-bold text-sm text-gray-400 uppercase tracking-widest mt-2">Make sure you are online</p>
        </div>
      )}

      {/* Recent Jobs History */}
      <div>
        <h3 className="font-[var(--font-anton)] text-xl uppercase mb-4 tracking-wide border-b-4 border-black pb-2 inline-block">Jobs Done</h3>
        {completedJobs.length === 0 ? (
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No completed jobs yet.</p>
        ) : (
          <div className="space-y-4">
            {completedJobs.map((job) => (
              <div key={job.match_id} className="bg-white border-2 border-black p-4 flex justify-between items-center hard-shadow">
                <div>
                  <p className="font-[var(--font-anton)] text-lg uppercase leading-none">{job.title}</p>
                  <p className="text-xs font-bold text-gray-500 mt-1">
                    {job.employer_name}
                    {job.completed_at ? ` • ${new Date(job.completed_at).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <span className="font-[var(--font-anton)] text-lg">₹{job.salary}</span>
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
