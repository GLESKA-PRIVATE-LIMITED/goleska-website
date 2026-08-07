"use client";

import React from 'react';
import { LayoutDashboard, User, ShieldCheck, LogOut, Zap } from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

interface Props {
  active: string;
  workerName: string;
  isAvailable?: boolean;
  onNavigate: (tab: string) => void;
  onSignOut: () => void;
}

/**
 * Worker-side navigation sidebar. Uses the same visual language as the
 * employer ProfileSidebar (brand, rounded pill nav, bottom account chip +
 * log out), but deliberately NOT the employer's chat-style dispatch sidebar -
 * a worker has no hiring/dispatch workflow, so a single simple nav covering
 * their whole account (Dashboard / Profile / Security) is the right fit.
 * Documents are folded into Profile (ProfileView already lists them).
 */
export default function WorkerSidebar({ active, workerName, isAvailable, onNavigate, onSignOut }: Props) {
  const NAV: NavItem[] = [
    { key: 'WORKER_HOME', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'PROFILE', label: 'Profile', icon: User },
    { key: 'SECURITY', label: 'Security', icon: ShieldCheck },
  ];

  const initials =
    String(workerName || 'GL')
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'GL';

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex items-center gap-2 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
          <Zap size={18} className="text-white" fill="currentColor" />
        </div>
        <div className="min-w-0">
          <span className="block truncate font-[var(--font-anton)] text-lg uppercase tracking-wider text-slate-900">GO LESKA</span>
          <span className="block truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">Worker</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} className="shrink-0" /> {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: worker chip + log out */}
      <div className="mt-auto border-t border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-700">{workerName || 'Worker'}</p>
            {typeof isAvailable === 'boolean' && (
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {isAvailable ? 'Online' : 'Offline'}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} className="shrink-0" /> Log out
        </button>
      </div>
    </aside>
  );
}
