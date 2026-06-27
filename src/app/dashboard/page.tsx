"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut, Zap, Mic, Loader2, CheckCircle, Clock, MapPin, IndianRupee, ArrowRight } from 'lucide-react';

interface ParsedJob {
  title: string;
  headcount_required: number;
  max_daily_salary: number;
  min_experience: number;
}

export default function DashboardPage() {
  const { session, user, signOut } = useAuth();
  const router = useRouter();
  
  const [checking, setChecking] = useState(true);
  const [employer, setEmployer] = useState<any>(null);
  
  const [prompt, setPrompt] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedJob, setParsedJob] = useState<ParsedJob | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [jobSites, setJobSites] = useState<any[]>([]);
  const [selectedJobSiteId, setSelectedJobSiteId] = useState<string>('');

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    const checkEmployer = async () => {
      const phone = user?.phone;
      if (!phone) return;
      
      const { data, error } = await supabase.from('employers').select('*').eq('phone', phone).single();
      
      if (error || !data) {
        router.push('/register');
      } else {
        setEmployer(data);
        
        // Fetch Job Sites
        const { data: sites } = await supabase.from('job_sites').select('*').eq('employer_id', data.id);
        if (sites && sites.length > 0) {
          setJobSites(sites);
          setSelectedJobSiteId(sites[0].id);
        }
        
        setChecking(false);
      }
    };
    
    checkEmployer();
  }, [session, user, router]);

  // Realtime Subscription
  useEffect(() => {
    if (!activeJobId) return;

    // Subscribe to job_matches table for this specific job
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
          console.log('Realtime match update!', payload);
          if (payload.new.status === 'ACCEPTED') {
            setMatches((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeJobId]);

  const handleParsePrompt = async () => {
    if (!prompt.trim()) return;
    setParsing(true);
    
    try {
      // The backend llm-dispatcher requires both a prompt and a job_site_id
      const { data, error } = await supabase.functions.invoke('llm-dispatcher', {
        body: { 
          prompt: prompt,
          job_site_id: "00000000-0000-0000-0000-000000000000" 
        }
      });
      
      if (error) throw error;
      
      setParsedJob({
        title: data.role || "Unknown Role",
        headcount_required: data.headcount || 1,
        max_daily_salary: data.salary || 500,
        min_experience: data.experience || 0
      });
    } catch (err) {
      console.error("Parse Error:", err);
      alert("Failed to parse prompt via AI. Please ensure the backend and edge function are running.");
    } finally {
      setParsing(false);
    }
  };

  const handleDispatch = async () => {
    if (!parsedJob) return;
    if (!selectedJobSiteId) {
      alert("Please select a Job Site before dispatching.");
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

      if (!response.ok) {
        throw new Error("Failed to dispatch job");
      }
      
      const result = await response.json();
      setActiveJobId(result.job_id);
      
    } catch (err) {
      console.error("Dispatch Error:", err);
      alert("Failed to dispatch. Ensure backend is running and valid job_site_id.");
    } finally {
      setDispatching(false);
    }
  };

  if (checking) {
    return <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center font-[var(--font-anton)] text-3xl">LOADING DASHBOARD...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-sans selection:bg-[var(--color-saffron)] selection:text-white">
      {/* NAV */}
      <nav className="bg-[var(--color-charcoal)] text-white border-b-8 border-[var(--color-saffron)] px-6 py-4 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--color-saffron)] text-[var(--color-charcoal)] border-2 border-white flex items-center justify-center font-[var(--font-anton)] text-2xl transform -rotate-3">
            GL
          </div>
          <div>
            <h1 className="font-[var(--font-anton)] text-3xl leading-none uppercase tracking-wide">Command Center</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{employer?.company_name}</p>
          </div>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 font-bold text-sm uppercase hover:text-[var(--color-saffron)] transition-colors">
          <LogOut size={16} /> Exit
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* DISPATCH COLUMN */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="bg-white border-4 border-[var(--color-charcoal)] hard-shadow p-6 relative">
             <div className="absolute -top-4 -left-4 bg-[var(--color-charcoal)] text-white font-bold px-4 py-1 border-2 border-[var(--color-charcoal)] uppercase tracking-widest text-sm">
               LLM Dispatch Engine
             </div>
             
             <div className="mt-6">
                <div className="mb-4">
                  <label className="block font-bold uppercase text-xs tracking-widest mb-2 text-gray-500">Target Job Site</label>
                  <select 
                    value={selectedJobSiteId}
                    onChange={(e) => setSelectedJobSiteId(e.target.value)}
                    className="w-full border-2 border-[var(--color-charcoal)] p-3 font-bold uppercase outline-none focus:bg-[var(--color-paper)]"
                  >
                    {jobSites.length === 0 && <option value="">No Sites Found</option>}
                    {jobSites.map(site => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  </select>
                </div>
                
                <label className="block font-bold uppercase text-xs tracking-widest mb-2 text-gray-500">Voice or Text Input (Hindi/English)</label>
                <div className="relative">
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full border-2 border-[var(--color-charcoal)] p-4 text-xl font-medium outline-none focus:bg-[var(--color-paper)] min-h-[120px] resize-none"
                    placeholder="E.g. Mujhe 5 fiber laser operators chahiye, kam se kam 3 saal experience, Hindi-English aata ho, salary ₹800/day..."
                  />
                  <button className="absolute bottom-4 right-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors">
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
             </div>
          </div>

          {/* PARSED RESULT */}
          {parsedJob && !activeJobId && (
            <div className="bg-[var(--color-paper)] border-4 border-[var(--color-charcoal)] hard-shadow p-6 animate-in slide-in-from-bottom-4 relative overflow-hidden">
               {/* Grid background */}
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
                 disabled={dispatching}
                 className="w-full mt-6 bg-[var(--color-saffron)] text-[var(--color-charcoal)] font-[var(--font-anton)] text-2xl uppercase tracking-wider py-4 border-4 border-[var(--color-charcoal)] hard-shadow-hover hover:bg-[var(--color-ember)] transition-all flex items-center justify-center gap-3 relative z-10"
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
              <h3 className="font-[var(--font-anton)] text-4xl uppercase">Dispatch Active</h3>
              <p className="font-bold text-lg">Pinging workers within 10km radius...</p>
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
        
      </main>
    </div>
  );
}
