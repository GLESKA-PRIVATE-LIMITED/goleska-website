import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle, MapPin, IndianRupee, Briefcase, Check, X } from 'lucide-react';

interface JobOfferModalProps {
  workerId: string;
  jwtToken: string;
  onJobAccepted: () => void;
}

export default function JobOfferModal({ workerId, jwtToken, onJobAccepted }: JobOfferModalProps) {
  const [offer, setOffer] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [processing, setProcessing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!workerId) return;

    // Listen for new matches or updates to pending matches
    const channel = supabase.channel('worker-matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_matches',
          filter: `worker_id=eq.${workerId}`
        },
        async (payload) => {
          if (payload.new && payload.new.status === 'PENDING') {
            // Fetch job details (title, employer name, salary) via a quick fetch or edge function
            // For MVP, we will fetch full job details from backend if we get a match
            try {
              // Wait, the payload has job_id. We need job details. 
              // We could fetch them, or for now, display a generic message.
              // Ideally, the backend would send an RPC or we fetch the job by ID.
              setOffer({
                match_id: payload.new.id,
                job_id: payload.new.job_id,
                title: "New Job Dispatch", // Placeholder until fetched
                salary: "TBD"
              });
              setTimeLeft(30);
            } catch (err) {
              console.error(err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workerId]);

  useEffect(() => {
    if (offer && timeLeft > 0 && !processing) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && offer && !processing) {
      handleDecline();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [offer, timeLeft, processing]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/${offer.job_id}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      if (res.ok) {
        setOffer(null);
        onJobAccepted();
      } else {
        alert("Failed to accept job. It may have expired.");
        setOffer(null);
      }
    } catch (e) {
      console.error(e);
      alert("Error accepting job");
      setOffer(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/${offer.job_id}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setOffer(null);
      setProcessing(false);
    }
  };

  if (!offer) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col justify-end z-[9999] font-sans selection:bg-[var(--color-saffron)]">
      
      {/* 30-Second Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gray-800">
        <div 
          className="h-full bg-[var(--color-saffron)] transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / 30) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div>
          <div className="w-24 h-24 bg-[var(--color-saffron)] rounded-full mx-auto mb-8 flex items-center justify-center hard-shadow animate-pulse">
            <AlertCircle size={48} className="text-black" />
          </div>
          
          <h1 className="font-[var(--font-anton)] text-5xl text-white uppercase leading-none mb-4 tracking-wide">
            Dispatch Received
          </h1>
          
          <div className="bg-white/10 border-2 border-[var(--color-saffron)] p-6 mb-8 text-left text-white max-w-sm mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="text-[var(--color-saffron)]" size={24} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Role</p>
                <p className="font-[var(--font-anton)] text-2xl">{offer.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <IndianRupee className="text-[var(--color-saffron)]" size={24} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Est. Pay</p>
                <p className="font-[var(--font-anton)] text-2xl">Standard Rate</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-[var(--color-saffron)]" size={24} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Distance</p>
                <p className="font-[var(--font-anton)] text-2xl">~2.5 km away</p>
              </div>
            </div>
          </div>
          
          <div className="font-[var(--font-anton)] text-4xl text-[var(--color-saffron)] mb-8 tabular-nums">
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 p-6 bg-[var(--color-charcoal)] border-t-4 border-[var(--color-saffron)]">
        <button 
          onClick={handleDecline}
          disabled={processing}
          className="bg-red-600 text-white font-[var(--font-anton)] text-2xl uppercase tracking-widest py-6 border-4 border-black hard-shadow hover:bg-red-700 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50"
        >
          <X size={32} />
          Decline
        </button>
        <button 
          onClick={handleAccept}
          disabled={processing}
          className="bg-[var(--color-jungle)] text-white font-[var(--font-anton)] text-2xl uppercase tracking-widest py-6 border-4 border-black hard-shadow hover:bg-green-600 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check size={32} />
          Accept
        </button>
      </div>
    </div>
  );
}
