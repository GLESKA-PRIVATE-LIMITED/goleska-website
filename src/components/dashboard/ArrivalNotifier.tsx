"use client";

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Phone, ShieldCheck, User } from 'lucide-react';

interface ArrivalEntry {
  match_id: string;
  worker_id: string;
  job_id: string;
  job_title: string;
  name: string;
  phone: string;
  selfie_url: string | null;
  arrival_confirmed: boolean;
  completion_requested: boolean;
}

interface ArrivalNotifierProps {
  jwtToken: string;
  // The employer's currently-dispatched job, if any - used to seed the panel
  // with arrivals that happened before this component mounted.
  activeJobId?: string | null;
}

/**
 * Employer-side panel of workers who have marked ARRIVED on one of the
 * employer's jobs. Unlike a transient toast, this stays on screen (backed by
 * local state) until the employer confirms completion (or the assignment is
 * otherwise cleared), and lets them enter the completion code the worker
 * shares with them in person - job completion requires this, a worker cannot
 * mark their own job done.
 */
export default function ArrivalNotifier({ jwtToken, activeJobId }: ArrivalNotifierProps) {
  const [arrivals, setArrivals] = useState<Record<string, ArrivalEntry>>({});
  const notifiedToast = useRef<Set<string>>(new Set());

  const fetchArrivalsForJob = async (jobId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/${jobId}/arrivals`,
        { headers: { 'Authorization': `Bearer ${jwtToken}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      setArrivals((prev) => {
        const next = { ...prev };
        for (const a of data.arrivals || []) {
          next[a.match_id] = {
            match_id: a.match_id,
            worker_id: a.worker_id,
            job_id: jobId,
            job_title: data.job_title,
            name: a.name,
            phone: a.phone,
            selfie_url: a.selfie_url,
            arrival_confirmed: a.arrival_confirmed,
            completion_requested: a.completion_requested,
          };
          if (!notifiedToast.current.has(a.match_id)) {
            notifiedToast.current.add(a.match_id);
            toast.success(`${a.name || 'A worker'} has arrived on site`, {
              description: `${data.job_title} • Contact: ${a.phone || 'N/A'}`,
              duration: 10000,
            });
          }
        }
        return next;
      });
    } catch (e) {
      console.error('Arrival fetch error:', e);
    }
  };

  // Seed the panel with any arrival that happened before mount / before the
  // realtime subscription was active for the currently tracked job.
  useEffect(() => {
    if (activeJobId) fetchArrivalsForJob(activeJobId);
  }, [activeJobId]);

  useEffect(() => {
    if (!jwtToken) return;

    const channel = supabase.channel('employer-arrivals')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'job_matches',
        },
        async (payload: any) => {
          const row = payload.new;
          if (!row) return;

          if (row.status === 'ARRIVED') {
            // Covers both the initial arrival and the later completion-code
            // request (both are UPDATEs on this row while status stays ARRIVED).
            await fetchArrivalsForJob(row.job_id);
          } else if (row.id) {
            // Job left ARRIVED (completed elsewhere / cancelled / dismissed) -
            // drop it from the panel.
            setArrivals((prev) => {
              if (!(row.id in prev)) return prev;
              const next = { ...prev };
              delete next[row.id];
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jwtToken]);

  const handleConfirmed = (matchId: string) => {
    setArrivals((prev) => {
      const next = { ...prev };
      delete next[matchId];
      return next;
    });
  };

  const list = Object.values(arrivals);
  if (list.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <h3 className="font-[var(--font-anton)] text-xl uppercase tracking-wide border-b-4 border-black pb-2 inline-block">
        Arrived Workers
      </h3>
      {list.map((a) => (
        <ArrivalCard key={a.match_id} arrival={a} jwtToken={jwtToken} onConfirmed={() => handleConfirmed(a.match_id)} />
      ))}
    </div>
  );
}

function ArrivalCard({ arrival, jwtToken, onConfirmed }: { arrival: ArrivalEntry; jwtToken: string; onConfirmed: () => void }) {
  return (
    <div className="bg-white border-4 border-black hard-shadow p-4 flex flex-col sm:flex-row gap-4">
      <div className="shrink-0 w-16 h-16 border-2 border-black bg-gray-100 overflow-hidden flex items-center justify-center">
        {arrival.selfie_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={arrival.selfie_url} alt={arrival.name || 'Worker selfie'} className="w-full h-full object-cover" />
        ) : (
          <User className="text-gray-400" size={28} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-[var(--font-anton)] text-lg uppercase leading-none truncate">{arrival.name || 'Worker'}</p>
        <p className="text-xs font-bold text-gray-500 mt-1 truncate">{arrival.job_title}</p>
        <a href={`tel:${arrival.phone}`} className="text-xs font-bold text-blue-700 mt-1 flex items-center gap-1">
          <Phone size={12} /> {arrival.phone || 'N/A'}
        </a>
      </div>

      <div className="shrink-0 flex flex-col gap-3 sm:w-48">
        {!arrival.arrival_confirmed && (
          <OtpConfirmForm
            label="Arrival code"
            buttonLabel="Confirm Arrival"
            endpoint={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/${arrival.job_id}/confirm-arrival`}
            jwtToken={jwtToken}
            workerId={arrival.worker_id}
            onSuccess={() => toast.success(`Arrival confirmed for ${arrival.name || 'worker'}.`)}
          />
        )}

        {arrival.completion_requested ? (
          <OtpConfirmForm
            label="Completion code"
            buttonLabel="Confirm Complete"
            endpoint={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/${arrival.job_id}/confirm-completion`}
            jwtToken={jwtToken}
            workerId={arrival.worker_id}
            onSuccess={() => {
              toast.success(`Job marked complete for ${arrival.name || 'worker'}.`);
              onConfirmed();
            }}
          />
        ) : (
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center sm:text-right">
            Waiting for worker to request completion...
          </p>
        )}
      </div>
    </div>
  );
}

function OtpConfirmForm({
  label,
  buttonLabel,
  endpoint,
  jwtToken,
  workerId,
  onSuccess,
}: {
  label: string;
  buttonLabel: string;
  endpoint: string;
  jwtToken: string;
  workerId: string;
  onSuccess: () => void;
}) {
  const [otp, setOtp] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    if (otp.length !== 4) {
      toast.error(`Enter the 4-digit ${label.toLowerCase()} the worker gave you.`);
      return;
    }
    setConfirming(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ worker_id: workerId, otp }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `Failed to confirm - check the ${label.toLowerCase()}.`);
      }
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || 'Failed to confirm.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        placeholder={label}
        className="border-2 border-black px-3 py-2 text-center font-[var(--font-anton)] text-lg tracking-widest outline-none"
      />
      <button
        onClick={handleConfirm}
        disabled={confirming}
        className="bg-[var(--color-jungle)] text-white font-bold uppercase text-xs tracking-widest py-2 border-2 border-black hover:bg-green-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
      >
        {confirming ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
        {confirming ? 'Confirming...' : buttonLabel}
      </button>
    </div>
  );
}
