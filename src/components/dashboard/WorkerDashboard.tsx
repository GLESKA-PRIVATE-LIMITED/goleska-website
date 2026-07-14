import React, { useState, useEffect } from 'react';
import { Power, MapPin, Navigation, Clock, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ActiveJob {
  match_id: string;
  job_id: string;
  title: string;
  employer_name: string;
  employer_phone: string;
  status: string;
  salary: number;
}

interface WorkerDashboardProps {
  profileData: any;
  setProfileData: (data: any) => void;
}

export default function WorkerDashboard({ profileData, setProfileData }: WorkerDashboardProps) {
  const { session } = useAuth();
  const [isAvailable, setIsAvailable] = useState(profileData?.is_available ?? true);
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    fetchWorkerJobs();
  }, []);

  const fetchWorkerJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/workers/me/jobs`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveJob(data.active_job);
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
          
          <button className="w-full bg-black text-white font-[var(--font-anton)] text-xl uppercase tracking-widest py-4 border-4 border-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mb-3">
            <Navigation size={20} /> I've Arrived
          </button>
          <button className="w-full bg-white text-black font-bold uppercase tracking-widest py-3 border-4 border-black hover:bg-gray-100 transition-colors">
            Mark Complete
          </button>
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
        <h3 className="font-[var(--font-anton)] text-xl uppercase mb-4 tracking-wide border-b-4 border-black pb-2 inline-block">Recent History</h3>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border-2 border-black p-4 flex justify-between items-center hard-shadow">
              <div>
                <p className="font-[var(--font-anton)] text-lg uppercase leading-none">Welder</p>
                <p className="text-xs font-bold text-gray-500 mt-1">Tata Steel • 2 days ago</p>
              </div>
              <div className="flex gap-1 text-[var(--color-saffron)]">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
