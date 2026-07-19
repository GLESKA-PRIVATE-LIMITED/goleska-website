"use client";

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ArrivalNotifierProps {
  jwtToken: string;
}

/**
 * Employer-side real-time listener for worker arrivals.
 *
 * Follows the same Supabase Realtime pattern as JobOfferModal: it subscribes to
 * UPDATE events on the `job_matches` table. When a match flips to ARRIVED, the
 * (column-only) realtime payload is enriched by calling the backend
 * GET /jobs/{job_id}/arrivals endpoint, which also enforces that the job belongs
 * to the current employer (non-owned jobs return 403/404 and are ignored). On
 * success a toast with the worker's name, phone and the job title is shown.
 */
export default function ArrivalNotifier({ jwtToken }: ArrivalNotifierProps) {
  // Match ids we've already notified for, to avoid duplicate toasts.
  const notified = useRef<Set<string>>(new Set());

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
          if (!row || row.status !== 'ARRIVED') return;

          const matchId: string | undefined = row.id;
          if (matchId && notified.current.has(matchId)) return;

          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/${row.job_id}/arrivals`,
              { headers: { 'Authorization': `Bearer ${jwtToken}` } }
            );
            // 403 / 404 => not this employer's job (or removed). Ignore silently.
            if (!res.ok) return;

            const data = await res.json();
            const arrival =
              (data.arrivals || []).find((a: any) => a.worker_id === row.worker_id) ||
              (data.arrivals || [])[0];
            if (!arrival) return;

            if (matchId) notified.current.add(matchId);

            toast.success(`${arrival.name || 'A worker'} has arrived on site`, {
              description: `${data.job_title} \u2022 Contact: ${arrival.phone || 'N/A'}`,
              duration: 10000,
            });
          } catch (e) {
            console.error('Arrival notify error:', e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jwtToken]);

  return null;
}
