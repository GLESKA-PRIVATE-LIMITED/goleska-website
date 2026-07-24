"use client";

import React from 'react';
import { UserCog, UserX } from 'lucide-react';

interface Props {
  profileData: any;
}

const cardCls = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';

// Turns a director_data JSON key into a readable label (e.g. "din" -> "DIN",
// "date_of_appointment" -> "Date Of Appointment").
function formatKey(key: string): string {
  if (key.toLowerCase() === 'din') return 'DIN';
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DirectorProfileView({ profileData }: Props) {
  const directors: any[] = Array.isArray(profileData?.director_data) ? profileData.director_data : [];
  const isUnregistered = profileData?.account_type === 'UNREGISTERED_BUSINESS';

  // Unregistered businesses have a proprietor, not company directors.
  if (isUnregistered) {
    const propName = profileData?.proprietor_name || '';
    const rows: { label: string; value: React.ReactNode }[] = [
      { label: 'Number of Proprietors', value: profileData?.num_proprietors },
      { label: 'Enterprise Phone', value: profileData?.enterprise_phone },
      { label: 'Udyam Number', value: profileData?.udyam_number },
    ].filter((r) => r.value != null && String(r.value).trim() !== '');
    const pInitials =
      String(propName || 'P').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'P';

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Proprietor Profile</h1>
          <p className="mt-1 text-sm text-slate-500">The proprietor registered against this enterprise.</p>
        </div>

        {!propName && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <UserX size={26} />
            </div>
            <p className="text-sm font-bold text-slate-700">No proprietor information available</p>
            <p className="max-w-sm text-xs text-slate-400">Proprietor details captured during onboarding will appear here.</p>
          </div>
        ) : (
          <div className={cardCls}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                {pInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-extrabold text-slate-900">{propName || 'Proprietor'}</p>
                <p className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                  <UserCog size={12} /> Proprietor
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              {rows.map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{r.label}</span>
                  <span className="min-w-0 break-words text-right text-sm font-semibold text-slate-800">{String(r.value)}</span>
                </div>
              ))}
              {rows.length === 0 && <p className="text-xs text-slate-400">No additional details on record.</p>}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Director Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Directors registered against this business.</p>
      </div>

      {directors.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <UserX size={26} />
          </div>
          <p className="text-sm font-bold text-slate-700">No director information available</p>
          <p className="max-w-sm text-xs text-slate-400">
            Director records only exist for registered businesses/industries. Unregistered or individual accounts
            don&apos;t carry director details.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {directors.map((dir, idx) => {
            const entries = Object.entries(dir || {}).filter(
              ([, v]) => (typeof v === 'string' || typeof v === 'number') && String(v).trim() !== ''
            );
            const name = dir?.name || `Director ${idx + 1}`;
            const initials =
              String(name)
                .trim()
                .split(/\s+/)
                .map((w: string) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'D';

            return (
              <div key={idx} className={cardCls}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-extrabold text-slate-900">{name}</p>
                    <p className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                      <UserCog size={12} /> Director
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {entries
                    .filter(([k]) => k.toLowerCase() !== 'name')
                    .map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{formatKey(k)}</span>
                        <span className="min-w-0 break-words text-right text-sm font-semibold text-slate-800">{String(v)}</span>
                      </div>
                    ))}
                  {entries.filter(([k]) => k.toLowerCase() !== 'name').length === 0 && (
                    <p className="text-xs text-slate-400">No additional details on record.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
