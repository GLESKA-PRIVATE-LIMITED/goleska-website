"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut, Zap, Mic, Loader2, CheckCircle, Clock, MapPin, IndianRupee, ArrowRight, LayoutDashboard, Building, UserCircle, XCircle } from 'lucide-react';

import ProfileView from '@/components/dashboard/ProfileView';
import JobSiteManager from '@/components/dashboard/JobSiteManager';
import SubscriptionModal from '@/components/payments/SubscriptionModal';
import WorkerDashboard from '@/components/dashboard/WorkerDashboard';
import JobOfferModal from '@/components/dashboard/JobOfferModal';
import ArrivalNotifier from '@/components/dashboard/ArrivalNotifier';
import { toast } from 'sonner';

interface ParsedJob {
  title: string;
  headcount_required: number;
  max_daily_salary: number;
  min_experience: number;
}

type Tab = 'DISPATCH' | 'JOB_SITES' | 'PROFILE';

export default function DashboardPage() {
  const { session, user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [checking, setChecking] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [userType, setUserType] = useState<'EMPLOYER' | 'WORKER'>('EMPLOYER');
  const [activeTab, setActiveTab] = useState<Tab>('DISPATCH');
  
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
  const [workerJobsRefreshKey, setWorkerJobsRefreshKey] = useState(0);

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
   * card. Re-enable by uncommenting this handler and the LLM input JSX block
   * below, and removing the form-based input.
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
    return <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center font-[var(--font-anton)] text-3xl">LOADING DASHBOARD...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-sans selection:bg-[var(--color-saffron)] selection:text-white">
      {/* NAV */}
      <nav className="bg-[var(--color-charcoal)] text-white border-b-8 border-[var(--color-saffron)] px-4 sm:px-6 py-4 flex justify-between items-center gap-3 relative z-50">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 bg-[var(--color-saffron)] text-[var(--color-charcoal)] border-2 border-white flex items-center justify-center font-[var(--font-anton)] text-2xl transform -rotate-3 shrink-0">
            GL
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="font-[var(--font-anton)] text-xl sm:text-2xl md:text-3xl leading-none uppercase tracking-wide">
                {userType === 'EMPLOYER' ? 'Command Center' : 'Worker Hub'}
              </h1>
              {userType === 'EMPLOYER' && profileData && (
                <span className="bg-[var(--color-saffron)] text-[var(--color-charcoal)] text-[10px] px-2 py-0.5 uppercase font-black tracking-widest border border-[var(--color-charcoal)]">
                  {profileData.subscription_valid_until && new Date(profileData.subscription_valid_until) > new Date()
                    ? `Subscribed to ${new Date(profileData.subscription_valid_until).toLocaleDateString()}`
                    : !profileData.has_availed_free_dispatch 
                      ? '1 Free Dispatch'
                      : 'Subscription Required'}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              {userType === 'EMPLOYER' 
                ? (profileData?.company_name === 'Name Not Found' ? (profileData?.proprietor_name || profileData?.email) : profileData?.company_name)
                : profileData?.name}
            </p>
          </div>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 font-bold text-sm uppercase hover:text-[var(--color-saffron)] transition-colors shrink-0">
          <LogOut size={16} /> Sign Out
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* TABS */}
        <div className="flex gap-2 sm:gap-4 mb-8 border-b-4 border-[var(--color-charcoal)] overflow-x-auto">
          {userType === 'EMPLOYER' && (
            <>
              <button 
                onClick={() => setActiveTab('DISPATCH')}
                className={`px-4 sm:px-6 py-3 font-[var(--font-anton)] text-base sm:text-xl tracking-wide uppercase border-t-4 border-l-4 border-r-4 border-[var(--color-charcoal)] transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'DISPATCH' ? 'bg-white text-[var(--color-charcoal)] translate-y-1' : 'bg-gray-200 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2"><Zap size={20} /> Dispatch</div>
              </button>
              <button 
                onClick={() => setActiveTab('JOB_SITES')}
                className={`px-4 sm:px-6 py-3 font-[var(--font-anton)] text-base sm:text-xl tracking-wide uppercase border-t-4 border-l-4 border-r-4 border-[var(--color-charcoal)] transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'JOB_SITES' ? 'bg-white text-[var(--color-charcoal)] translate-y-1' : 'bg-gray-200 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2"><Building size={20} /> Job Sites</div>
              </button>
            </>
          )}
          <button 
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 sm:px-6 py-3 font-[var(--font-anton)] text-base sm:text-xl tracking-wide uppercase border-t-4 border-l-4 border-r-4 border-[var(--color-charcoal)] transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'PROFILE' ? 'bg-white text-[var(--color-charcoal)] translate-y-1' : 'bg-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCircle size={20} /> {userType === 'EMPLOYER' ? 'Profile' : 'Dashboard'}
            </div>
          </button>
        </div>

        {/* TAB CONTENTS */}
        
        {activeTab === 'PROFILE' && userType === 'EMPLOYER' && (
          <div className="animate-in fade-in">
            <ProfileView userType={userType} profileData={profileData} />
          </div>
        )}

        {activeTab === 'JOB_SITES' && userType === 'EMPLOYER' && (
          <div className="animate-in fade-in">
            <JobSiteManager />
          </div>
        )}

        {activeTab === 'DISPATCH' && userType === 'EMPLOYER' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
            {/* DISPATCH COLUMN */}
            <div className="lg:col-span-7 space-y-8">
              <ArrivalNotifier jwtToken={session?.access_token || ''} activeJobId={activeJobId} />
              <div className="bg-white border-4 border-[var(--color-charcoal)] hard-shadow p-6 relative">
                 <div className="absolute -top-4 -left-4 bg-[var(--color-charcoal)] text-white font-bold px-4 py-1 border-2 border-[var(--color-charcoal)] uppercase tracking-widest text-sm">
                   Post a Job
                 </div>
                 
                 <div className="mt-6">
                    <div className="mb-4">
                      <label className="block font-bold uppercase text-xs tracking-widest mb-2 text-gray-500">Target Job Site</label>
                      <select 
                        value={selectedJobSiteId}
                        onChange={(e) => setSelectedJobSiteId(e.target.value)}
                        className="w-full border-2 border-[var(--color-charcoal)] p-3 font-bold uppercase outline-none focus:bg-[var(--color-paper)]"
                      >
                        {jobSites.length === 0 && <option value="">No Sites Found (Go to Job Sites tab to create one)</option>}
                        {jobSites.map(site => (
                          <option key={site.id} value={site.id}>{site.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/*
                      LLM-based parsing, disabled — using form-based input instead. (Kept for future reference.)
                      The "Voice or Text Input" + "Extract Requirements" block below called handleParsePrompt()
                      (commented out above), which invoked the Supabase Edge Function 'llm-dispatcher'.
                      Re-enable by uncommenting handleParsePrompt and this block, and removing the form below.
                    <label className="block font-bold uppercase text-xs tracking-widest mb-2 text-gray-500">Voice or Text Input (Hindi/English)</label>
                    <div className="relative">
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full border-2 border-[var(--color-charcoal)] p-4 text-xl font-medium outline-none focus:bg-[var(--color-paper)] min-h-[120px] resize-none"
                        placeholder="E.g. Mujhe 5 fiber laser operators chahiye, kam se kam 3 saal experience, Hindi-English aata ho, salary ₹800/day..."
                      />
                      <button 
                        onClick={() => {
                          if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                            toast.error("Speech recognition is not supported in this browser. Try Chrome.");
                            return;
                          }
                          // @ts-ignore
                          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                          const recognition = new SpeechRecognition();
                          recognition.lang = 'hi-IN'; // Setting Hindi/English mix as default for Indian blue collar context
                          recognition.continuous = false;
                          
                          recognition.onstart = () => {
                             // Use a visual indicator inline or via alert if needed
                             console.log("Listening...");
                          };
                          
                          recognition.onresult = (event: any) => {
                            const transcript = event.results[0][0].transcript;
                            setPrompt((prev) => prev ? prev + ' ' + transcript : transcript);
                          };
                          
                          recognition.start();
                        }}
                        className="absolute bottom-4 right-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors focus:outline-none"
                        title="Click and speak"
                      >
                        <Mic size={20} className="text-gray-600" />
                      </button>
                    </div>
                    <button 
                      onClick={handleParsePrompt}
                      disabled={parsing || !prompt.trim()}
                      className="mt-4 bg-[var(--color-charcoal)] text-white font-bold uppercase tracking-widest px-6 py-3 border-2 border-[var(--color-charcoal)] hard-shadow-hover hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {parsing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} className="fill-[var(--color-saffron)] text-[var(--color-saffron)]" />}
                      Extract Requirements
                    </button>
                    */}

                    {/* Form-based dispatch input (replaces the LLM parsing flow) */}
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div>
                        <label className="block font-bold uppercase text-xs tracking-widest mb-2 text-gray-500">Role</label>
                        <input
                          type="text"
                          value={formRole}
                          onChange={(e) => setFormRole(e.target.value)}
                          className="w-full border-2 border-[var(--color-charcoal)] p-3 font-bold outline-none focus:bg-[var(--color-paper)]"
                          placeholder="e.g. Fiber Laser Operator"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-bold uppercase text-xs tracking-widest mb-2 text-gray-500">Headcount</label>
                          <input
                            type="number"
                            min={1}
                            value={formHeadcount}
                            onChange={(e) => setFormHeadcount(parseInt(e.target.value) || 0)}
                            className="w-full border-2 border-[var(--color-charcoal)] p-3 font-bold outline-none focus:bg-[var(--color-paper)]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase text-xs tracking-widest mb-2 text-gray-500">Salary / Day (Rs)</label>
                          <input
                            type="number"
                            min={0}
                            value={formSalary}
                            onChange={(e) => setFormSalary(parseInt(e.target.value) || 0)}
                            className="w-full border-2 border-[var(--color-charcoal)] p-3 font-bold outline-none focus:bg-[var(--color-paper)]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase text-xs tracking-widest mb-2 text-gray-500">Min Experience (Yrs)</label>
                          <input
                            type="number"
                            min={0}
                            value={formExperience}
                            onChange={(e) => setFormExperience(parseInt(e.target.value) || 0)}
                            className="w-full border-2 border-[var(--color-charcoal)] p-3 font-bold outline-none focus:bg-[var(--color-paper)]"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={!formRole.trim()}
                        className="mt-2 bg-[var(--color-charcoal)] text-white font-bold uppercase tracking-widest px-6 py-3 border-2 border-[var(--color-charcoal)] hard-shadow-hover hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <Zap size={18} className="fill-[var(--color-saffron)] text-[var(--color-saffron)]" /> Review Job Card
                      </button>
                    </form>
                 </div>
              </div>

              {/* PARSED RESULT */}
              {parsedJob && !activeJobId && (
                <div className="bg-[var(--color-paper)] border-4 border-[var(--color-charcoal)] hard-shadow p-6 animate-in slide-in-from-bottom-4 relative overflow-hidden">
                   <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#111 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                   
                   <h3 className="font-[var(--font-anton)] text-3xl uppercase mb-6 relative z-10">Confirm Job Card</h3>
                   
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                     <div className="bg-white border-2 border-[var(--color-charcoal)] p-3">
                       <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Role</span>
                       <span className="font-[var(--font-anton)] text-xl leading-tight">{parsedJob.title}</span>
                     </div>
                     <div className="bg-white border-2 border-[var(--color-charcoal)] p-3">
                       <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Headcount</span>
                       <span className="font-[var(--font-anton)] text-xl leading-tight">{parsedJob.headcount_required} Workers</span>
                     </div>
                     <div className="bg-white border-2 border-[var(--color-charcoal)] p-3">
                       <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Salary Cap</span>
                       <span className="font-[var(--font-anton)] text-xl leading-tight">₹{parsedJob.max_daily_salary}/day</span>
                     </div>
                     <div className="bg-white border-2 border-[var(--color-charcoal)] p-3">
                       <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Experience</span>
                       <span className="font-[var(--font-anton)] text-xl leading-tight">{parsedJob.min_experience}+ Years</span>
                     </div>
                   </div>

                   <button 
                     onClick={handleDispatch}
                     disabled={dispatching || !selectedJobSiteId}
                     className="w-full mt-6 bg-[var(--color-saffron)] text-[var(--color-charcoal)] font-[var(--font-anton)] text-2xl uppercase tracking-wider py-4 border-4 border-[var(--color-charcoal)] hard-shadow-hover hover:bg-[var(--color-ember)] transition-all flex items-center justify-center gap-3 relative z-10 disabled:opacity-50"
                   >
                     {dispatching ? <Loader2 className="animate-spin" size={24} /> : 'Dispatch to Army'}
                     {!dispatching && <ArrowRight size={24} />}
                   </button>
                </div>
              )}
              
              {/* ACTIVE DISPATCH STATE */}
              {activeJobId && (
                <div className="bg-[var(--color-saffron)] border-4 border-[var(--color-charcoal)] hard-shadow p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-white border-4 border-[var(--color-charcoal)] flex items-center justify-center mx-auto rounded-full hard-shadow animate-pulse">
                    <Zap size={32} className="fill-[var(--color-ember)] text-[var(--color-ember)]" />
                  </div>
                  <h3 className="font-[var(--font-anton)] text-3xl sm:text-4xl uppercase">Dispatch Active</h3>
                  <p className="font-bold text-lg">Pinging workers within 10km radius...</p>
                  <button
                    onClick={handleCancelDispatch}
                    disabled={cancelling}
                    className="w-full bg-[var(--color-charcoal)] text-white font-[var(--font-anton)] text-lg sm:text-xl uppercase tracking-wider py-3 border-4 border-[var(--color-charcoal)] hard-shadow-hover hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {cancelling ? <Loader2 className="animate-spin" size={20} /> : <XCircle size={20} />}
                    {cancelling ? 'Cancelling...' : 'Stop / Cancel Dispatch'}
                  </button>
                </div>
              )}
            </div>

            {/* REALTIME MATCHES COLUMN */}
            <div className="lg:col-span-5">
              <div className="bg-[var(--color-charcoal)] text-white border-4 border-[var(--color-charcoal)] hard-shadow min-h-[600px] flex flex-col relative">
                <div className="p-4 border-b-2 border-gray-700 flex justify-between items-center bg-black/20">
                  <h2 className="font-[var(--font-anton)] text-2xl uppercase tracking-wide">Live Feed</h2>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-jungle)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-jungle)] animate-pulse"></span>
                    Connected
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {!activeJobId ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 space-y-4">
                      <Clock size={48} strokeWidth={1.5} />
                      <p className="font-bold uppercase tracking-widest text-sm text-center">Waiting for active dispatch...</p>
                    </div>
                  ) : matches.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 text-gray-300">
                      <Loader2 className="animate-spin text-[var(--color-saffron)]" size={48} />
                      <p className="font-bold uppercase tracking-widest text-sm text-center animate-pulse">Waiting for workers to accept...</p>
                    </div>
                  ) : (
                    matches.map((match, i) => (
                      <div key={i} className="bg-white text-black border-2 border-[var(--color-saffron)] p-4 hard-shadow relative animate-in slide-in-from-right-4">
                         <div className="absolute top-0 right-0 bg-[var(--color-jungle)] text-white text-[10px] font-bold uppercase px-2 py-1 flex items-center gap-1 border-b-2 border-l-2 border-black">
                           <CheckCircle size={12} /> Accepted
                         </div>
                         <div className="flex gap-4">
                           <div className="w-12 h-12 bg-gray-200 border-2 border-black"></div>
                           <div>
                             <p className="font-[var(--font-anton)] text-xl uppercase leading-none">Worker #{match.worker_id.substring(0,6)}</p>
                             <p className="text-xs font-bold text-gray-500 mt-1">Accepted in {Math.floor(Math.random() * 45 + 5)}s</p>
                           </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* WORKER DASHBOARD (Overrides tabs if active) */}
        {userType === 'WORKER' && activeTab === 'PROFILE' && (
           <WorkerDashboard profileData={profileData} setProfileData={setProfileData} refreshSignal={workerJobsRefreshKey} />
        )}

      </main>

      {userType === 'WORKER' && profileData?.id && (
        <>
          <JobOfferModal
            workerId={profileData.id}
            jwtToken={session?.access_token || ''}
            onJobAccepted={() => {
              // The real active-job card (with live arrive/complete/OTP flow)
              // lives in WorkerDashboard - just tell it to refetch.
              setWorkerJobsRefreshKey((k) => k + 1);
            }}
          />
        </>
      )}

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
