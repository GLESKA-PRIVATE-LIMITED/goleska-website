"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut, Zap, Loader2, CheckCircle, Clock, MapPin, ArrowRight, XCircle, Sparkles, Users, ChevronDown } from 'lucide-react';

import ProfileView from '@/components/dashboard/ProfileView';
import SecurityView from '@/components/dashboard/SecurityView';
import JobSiteManager from '@/components/dashboard/JobSiteManager';
import SubscriptionModal from '@/components/payments/SubscriptionModal';
import WorkerDashboard from '@/components/dashboard/WorkerDashboard';
import JobOfferModal from '@/components/dashboard/JobOfferModal';
import ArrivalNotifier from '@/components/dashboard/ArrivalNotifier';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ReportsView from '@/components/dashboard/ReportsView';
import CompanyProfileView from '@/components/dashboard/CompanyProfileView';
import DirectorProfileView from '@/components/dashboard/DirectorProfileView';
import LocationSelectionView from '@/components/dashboard/LocationSelectionView';
import EmployerSidebar from '@/components/dashboard/EmployerSidebar';
import SelectLocationModal from '@/components/dashboard/SelectLocationModal';
import { toast } from 'sonner';

interface ParsedJob {
  title: string;
  headcount_required: number;
  max_daily_salary: number;
  min_experience: number;
}

type Tab = 'OVERVIEW' | 'DISPATCH' | 'WORKERS' | 'JOB_SITES' | 'REPORTS' | 'COMPANY' | 'DIRECTOR' | 'PROFILE' | 'SECURITY' | 'LOCATION';

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100';

export default function DashboardPage() {
  const { session, user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [checking, setChecking] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [userType, setUserType] = useState<'EMPLOYER' | 'WORKER'>('EMPLOYER');
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  
  const [prompt, setPrompt] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedJob, setParsedJob] = useState<ParsedJob | null>(null);
  // Form-based dispatch inputs (replaces the disabled LLM parsing flow).
  const [formRole, setFormRole] = useState('');
  const [formHeadcount, setFormHeadcount] = useState<number>(1);
  const [formSalary, setFormSalary] = useState<number>(500);
  const [formExperience, setFormExperience] = useState<number>(0);
  const [dispatching, setDispatching] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [jobSites, setJobSites] = useState<any[]>([]);
  const [selectedJobSiteId, setSelectedJobSiteId] = useState<string>('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [workerJobsRefreshKey, setWorkerJobsRefreshKey] = useState(0);

  useEffect(() => {
    // Employer sidebar defaults expanded on desktop, collapsed on smaller screens.
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) setSidebarExpanded(true);
  }, []);

  useEffect(() => {
    // [Onboarding Timer] Start time is stamped at OTP verification (login page).
    // When the user lands on the dashboard, log the total signup-to-dashboard
    // duration once, then clear the marker.
    const startRaw = typeof window !== 'undefined' ? localStorage.getItem('onboardingStartTime') : null;
    if (startRaw) {
      const elapsedMs = Date.now() - parseInt(startRaw, 10);
      console.log(
        `[Onboarding Timer] Reached dashboard in ${(elapsedMs / 1000).toFixed(1)}s (${elapsedMs} ms) from OTP verification.`
      );
      localStorage.removeItem('onboardingStartTime');
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.push('/login');
      return;
    }

    const tryEmployer = async (): Promise<'FOUND' | 'NOT_FOUND' | 'FORBIDDEN'> => {
      const empRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/employers/me`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (empRes.status === 403) return 'FORBIDDEN';
      if (!empRes.ok) return 'NOT_FOUND';

      const data = await empRes.json();
      setProfileData(data);
      setUserType('EMPLOYER');
      // REGISTERED_BUSINESS gets the chat-style dispatch experience as its landing.
      if (data.account_type === 'REGISTERED_BUSINESS') setActiveTab('DISPATCH');

      // Fetch Job Sites
      const siteRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/job-sites/me`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (siteRes.ok) {
        const sites = await siteRes.json();
        setJobSites(sites);
        if (sites.length > 0) setSelectedJobSiteId(sites[0].id);
      }
      return 'FOUND';
    };

    const tryWorker = async (): Promise<'FOUND' | 'NOT_FOUND' | 'FORBIDDEN'> => {
      const workerRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/workers/me`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (workerRes.status === 403) return 'FORBIDDEN';
      if (!workerRes.ok) return 'NOT_FOUND';

      const data = await workerRes.json();
      setProfileData(data);
      setUserType('WORKER');
      setActiveTab('PROFILE'); // Workers don't have dispatch yet
      return 'FOUND';
    };

    const checkProfile = async () => {
      try {
        // Respect the side chosen at login ("I want work" vs "I want workers")
        // so a dual-registered email lands on the intended dashboard.
        const savedSide = localStorage.getItem('onboardingSide');
        const [first, second] = savedSide === 'WORKER' ? [tryWorker, tryEmployer] : [tryEmployer, tryWorker];

        const firstResult = await first();
        if (firstResult === 'FORBIDDEN') {
          toast.error('Your account has been deactivated or deleted. Please contact support.');
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }
        if (firstResult === 'FOUND') return;

        const secondResult = await second();
        if (secondResult === 'FORBIDDEN') {
          toast.error('Your account has been deactivated or deleted. Please contact support.');
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }
        if (secondResult !== 'FOUND') {
          router.push('/onboarding');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };
    
    checkProfile();
  }, [session, router]);

  // Realtime Subscription
  useEffect(() => {
    if (!activeJobId) return;

    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'job_matches',
          filter: `job_id=eq.${activeJobId}`
        },
        (payload) => {
          if (payload.new.status === 'ACCEPTED') {
            setMatches((prev) => [...prev, payload.new]);
          } else if (payload.new.status === 'COMPLETED') {
            // Job fully wrapped up (both arrival and completion confirmed by
            // the employer) - clear the active dispatch panel.
            toast.success('Job completed! Dispatch cleared.');
            setActiveJobId(null);
            setMatches([]);
            setParsedJob(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeJobId]);

  /*
   * LLM-based parsing, disabled — using form-based input instead.
   * (Kept for future reference.) This handler invoked the Supabase Edge
   * Function 'llm-dispatcher' to parse a free-text / voice prompt into a job
   * card. Re-enable by uncommenting this handler and wiring it to an input.
   *
  const handleParsePrompt = async () => {
    if (!prompt.trim()) return;
    setParsing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('llm-dispatcher', {
        body: { 
          prompt: prompt,
          job_site_id: "00000000-0000-0000-0000-000000000000" 
        }
      });
      
      if (error) throw error;
      
      setParsedJob({
        title: data.title || data.role || "Unknown Role",
        headcount_required: data.headcount_required || data.headcount || 1,
        max_daily_salary: data.max_daily_salary || data.salary || 500,
        min_experience: data.min_experience || data.experience || 0
      });
    } catch (err) {
      console.error("Parse Error:", err);
      toast.error("Failed to parse prompt via AI. Please ensure the backend and edge function are running.");
    } finally {
      setParsing(false);
    }
  };
  */

  // Form-based dispatch: builds the same shape the LLM response used, so the
  // existing Confirm Job Card + dispatch flow is reused unchanged.
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRole.trim()) {
      toast.error("Please enter a role.");
      return;
    }
    setParsedJob({
      title: formRole.trim(),
      headcount_required: formHeadcount || 1,
      max_daily_salary: formSalary || 0,
      min_experience: formExperience || 0,
    });
  };

  const handleDispatch = async () => {
    if (!parsedJob) return;
    if (!selectedJobSiteId) {
      toast.error("Please select a Job Site before dispatching.");
      return;
    }
    
    setDispatching(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          title: parsedJob.title,
          job_site_id: selectedJobSiteId,
          headcount_required: parsedJob.headcount_required,
          max_daily_salary: parsedJob.max_daily_salary,
          min_experience: parsedJob.min_experience
        })
      });

      if (response.status === 402) {
        setShowSubscriptionModal(true);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to dispatch job");
      }
      
      const result = await response.json();
      setActiveJobId(result.job_id);
      
    } catch (err: any) {
      console.error("Dispatch Error:", err);
      toast.error(err.message || "Failed to dispatch.");
    } finally {
      setDispatching(false);
    }
  };

  const handleCancelDispatch = async () => {
    if (!activeJobId) return;

    setCancelling(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/${activeJobId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to cancel dispatch");
      }

      // Reset the dispatch UI back to its idle state.
      setActiveJobId(null);
      setMatches([]);
      setParsedJob(null);
      toast.success("Dispatch cancelled");
    } catch (err: any) {
      console.error("Cancel Error:", err);
      toast.error(err.message || "Failed to cancel dispatch.");
    } finally {
      setCancelling(false);
    }
  };

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center bg-[#eef1fb] text-xl font-extrabold text-slate-900">Loading dashboard...</div>;
  }

  // ---------------------------------------------------------------- WORKER VIEW
  // (unchanged experience - simple top bar + WorkerDashboard)
  if (userType === 'WORKER') {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] font-sans">
        <nav className="bg-[var(--color-charcoal)] text-white border-b-8 border-[var(--color-saffron)] px-4 sm:px-6 py-4 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-[var(--color-saffron)] text-[var(--color-charcoal)] border-2 border-white flex items-center justify-center font-[var(--font-anton)] text-2xl transform -rotate-3 shrink-0">
              GL
            </div>
            <div className="min-w-0">
              <h1 className="font-[var(--font-anton)] text-xl sm:text-2xl leading-none uppercase tracking-wide">Worker Hub</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">{profileData?.name}</p>
            </div>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 font-bold text-sm uppercase hover:text-[var(--color-saffron)] transition-colors shrink-0">
            <LogOut size={16} /> Sign Out
          </button>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <WorkerDashboard profileData={profileData} setProfileData={setProfileData} refreshSignal={workerJobsRefreshKey} />
        </main>

        {profileData?.id && (
          <JobOfferModal
            workerId={profileData.id}
            jwtToken={session?.access_token || ''}
            onJobAccepted={() => {
              // The real active-job card (with live arrive/complete/OTP flow)
              // lives in WorkerDashboard - just tell it to refetch.
              setWorkerJobsRefreshKey((k) => k + 1);
            }}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------- EMPLOYER VIEW
  const displayName = profileData?.company_name && profileData.company_name !== 'Name Not Found'
    ? profileData.company_name
    : (profileData?.proprietor_name || profileData?.email || 'there');

  const subStatus = profileData?.subscription_valid_until && new Date(profileData.subscription_valid_until) > new Date()
    ? `Subscribed until ${new Date(profileData.subscription_valid_until).toLocaleDateString()}`
    : !profileData?.has_availed_free_dispatch
      ? '1 Free Dispatch'
      : 'Subscription Required';

  const isRegBusiness = profileData?.account_type === 'REGISTERED_BUSINESS';

  return (
    <div className="flex min-h-screen bg-[#eef1fb] font-sans text-slate-900">
      {isRegBusiness ? (
        <EmployerSidebar
          jobSites={jobSites}
          companyName={displayName}
          expanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded((v) => !v)}
          onNewChat={() => { setActiveTab('DISPATCH'); setParsedJob(null); setFormRole(''); }}
          onSelectSite={(id) => { setSelectedJobSiteId(id); setActiveTab('DISPATCH'); }}
          onOpenProfile={() => setActiveTab('PROFILE')}
          onOpenSecurity={() => setActiveTab('SECURITY')}
          onSignOut={signOut}
        />
      ) : (
        <AdminSidebar
          active={activeTab}
          companyName={displayName}
          onNavigate={(tab) => {
            if (tab === 'DISPATCH') { setParsedJob(null); setFormRole(''); }
            setActiveTab(tab as Tab);
          }}
          onSignOut={signOut}
        />
      )}

      <main className="min-w-0 flex-1">
        {/* Null-rendering listener for real-time worker arrivals */}
        <ArrivalNotifier jwtToken={session?.access_token || ''} activeJobId={activeJobId} />

        {/* Top bar */}
        <div className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur sm:px-8">
          {profileData && (
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {subStatus}
            </span>
          )}
        </div>

        {/* ---- OVERVIEW ---- (default employer landing) */}
        {activeTab === 'OVERVIEW' && (
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 animate-in fade-in">
            <DashboardOverview
              profileData={profileData}
              activeJobId={activeJobId}
              onOpenReports={() => setActiveTab('REPORTS')}
              onPostJob={() => setActiveTab('DISPATCH')}
            />
          </div>
        )}

        {/* ---- WORKERS ---- (real: workers accepted on the live dispatch) */}
        {activeTab === 'WORKERS' && (
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 animate-in fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900">Workers</h1>
              <p className="mt-1 text-sm text-slate-500">Workers currently engaged on your active dispatch.</p>
            </div>
            {!activeJobId ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Users size={26} />
                </div>
                <p className="text-sm font-bold text-slate-700">No active dispatch</p>
                <p className="max-w-sm text-xs text-slate-400">Post a job to start matching with available workers. Accepted workers will appear here live.</p>
                <button
                  onClick={() => setActiveTab('DISPATCH')}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700"
                >
                  Post a Job <ArrowRight size={16} />
                </button>
              </div>
            ) : matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="text-sm font-medium text-slate-500">Waiting for workers to accept...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                      <CheckCircle size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">Worker #{match.worker_id.substring(0, 6)}</p>
                      <p className="text-xs text-slate-500">Engaged on current dispatch</p>
                    </div>
                    <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Accepted</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- DISPATCH ---- */}
        {activeTab === 'DISPATCH' && (
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
            {/* Hero */}
            <div className="text-center">
              {(!isRegBusiness || !sidebarExpanded) && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                  <Sparkles size={13} /> AI - Powered Hiring
                </div>
              )}
              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                Hey {displayName}, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Who are you hiring today??</span>
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">Ask GO LESKA to find talent, vendors, or manage your hiring</p>
            </div>

            {/* Segmented input + existing form fields (same state/handlers) */}
            <form onSubmit={handleFormSubmit} className="mt-8 space-y-4 text-left">
              {/* Segmented pill input row */}
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/60">
                <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                  <Users size={16} className="text-indigo-600" />
                  <span className="hidden sm:inline">I Want to hire</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="eg. Electrician, Welder, Driver..."
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!formRole.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white transition hover:opacity-90 disabled:opacity-40"
                  aria-label="Continue"
                >
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Location pill buttons */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-left text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15"><MapPin size={20} /></div>
                  <div>
                    <p className="font-bold leading-tight">Select Location</p>
                    <p className="text-xs text-white/70">Accurate and faster</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('JOB_SITES')}
                  className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-left text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15"><MapPin size={20} /></div>
                  <div>
                    <p className="font-bold leading-tight">Job Site</p>
                    <p className="text-xs text-white/70">Accurate and faster</p>
                  </div>
                </button>
              </div>

              {/* Existing dispatch fields - restyled, same state/handlers */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Dispatch details</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Target Job Site</label>
                    <select
                      value={selectedJobSiteId}
                      onChange={(e) => setSelectedJobSiteId(e.target.value)}
                      className={inputCls}
                    >
                      {jobSites.length === 0 && <option value="">No sites found - open Job Site to create one</option>}
                      {jobSites.map((site) => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className={labelCls}>Headcount</label>
                      <input type="number" min={1} value={formHeadcount} onChange={(e) => setFormHeadcount(parseInt(e.target.value) || 0)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Salary / Day (Rs)</label>
                      <input type="number" min={0} value={formSalary} onChange={(e) => setFormSalary(parseInt(e.target.value) || 0)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Min Experience (Yrs)</label>
                      <input type="number" min={0} value={formExperience} onChange={(e) => setFormExperience(parseInt(e.target.value) || 0)} className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Confirm Job Card */}
            {parsedJob && !activeJobId && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg animate-in slide-in-from-bottom-4">
                <h3 className="mb-4 text-lg font-extrabold text-slate-900">Confirm Job Card</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Role</span>
                    <span className="mt-0.5 block font-[var(--font-anton)] text-lg leading-tight text-slate-900">{parsedJob.title}</span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Headcount</span>
                    <span className="mt-0.5 block font-[var(--font-anton)] text-lg leading-tight text-slate-900">{parsedJob.headcount_required} Workers</span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Salary Cap</span>
                    <span className="mt-0.5 block font-[var(--font-anton)] text-lg leading-tight text-slate-900">₹{parsedJob.max_daily_salary}/day</span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Experience</span>
                    <span className="mt-0.5 block font-[var(--font-anton)] text-lg leading-tight text-slate-900">{parsedJob.min_experience}+ Years</span>
                  </div>
                </div>
                <button
                  onClick={handleDispatch}
                  disabled={dispatching || !selectedJobSiteId}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  {dispatching ? <Loader2 className="animate-spin" size={18} /> : <>Dispatch Now <ArrowRight size={18} /></>}
                </button>
              </div>
            )}

            {/* Active Dispatch State */}
            {activeJobId && (
              <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 animate-pulse">
                  <Zap size={30} fill="currentColor" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Dispatch Active</h3>
                <p className="mt-1 text-sm text-slate-500">Pinging workers within 10km radius...</p>
                <button
                  onClick={handleCancelDispatch}
                  disabled={cancelling}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-6 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelling ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
                  {cancelling ? 'Cancelling...' : 'Stop / Cancel Dispatch'}
                </button>
              </div>
            )}

            {/* Live Feed */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-bold text-slate-900">Live Feed</h2>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span> Connected
                </div>
              </div>
              <div className="max-h-[360px] space-y-3 overflow-y-auto p-4">
                {!activeJobId ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-400">
                    <Clock size={40} strokeWidth={1.5} />
                    <p className="text-sm font-medium">Waiting for active dispatch...</p>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-500">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <p className="text-sm font-medium">Waiting for workers to accept...</p>
                  </div>
                ) : (
                  matches.map((match, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 animate-in slide-in-from-right-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <CheckCircle size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">Worker #{match.worker_id.substring(0, 6)}</p>
                        <p className="text-xs text-slate-500">Accepted in {Math.floor(Math.random() * 45 + 5)}s</p>
                      </div>
                      <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Accepted</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---- JOB SITES ---- (reuses existing JobSiteManager) */}
        {activeTab === 'JOB_SITES' && (
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 animate-in fade-in">
            <JobSiteManager />
          </div>
        )}

        {/* ---- PROFILE / SETTINGS ---- (reuses existing ProfileView) */}
        {activeTab === 'PROFILE' && (
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 animate-in fade-in">
            <ProfileView userType={userType} profileData={profileData} />
          </div>
        )}

        {/* ---- SECURITY ---- */}
        {activeTab === 'SECURITY' && (
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 animate-in fade-in">
            <SecurityView userType={userType} profileData={profileData} />
          </div>
        )}

        {/* ---- REPORTS ---- (visual mockup) */}
        {activeTab === 'REPORTS' && (
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 animate-in fade-in">
            <ReportsView />
          </div>
        )}

        {/* ---- COMPANY PROFILE ---- (real data) */}
        {activeTab === 'COMPANY' && (
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 animate-in fade-in">
            <CompanyProfileView profileData={profileData} />
          </div>
        )}

        {/* ---- DIRECTOR PROFILE ---- (real data) */}
        {activeTab === 'DIRECTOR' && (
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 animate-in fade-in">
            <DirectorProfileView profileData={profileData} />
          </div>
        )}

        {/* ---- LOCATION ---- (dedicated page; reached from the dispatch "Select Location" pill) */}
        {activeTab === 'LOCATION' && (
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 animate-in fade-in">
            <LocationSelectionView
              jobSites={jobSites}
              onSelectSite={(id) => { setSelectedJobSiteId(id); setActiveTab('DISPATCH'); }}
            />
          </div>
        )}
      </main>

      <SelectLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={() => {
          setShowSubscriptionModal(false);
          toast.success("Payment Successful! You can now dispatch workers.");
          // Ideally refresh profileData here to show new subscription_valid_until
        }}
        jwtToken={session?.access_token || ''}
      />
    </div>
  );
}
