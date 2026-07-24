"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  Menu,
  Plus,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  Briefcase,
  Zap,
  MessageSquare,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';

interface RecentItem {
  title: string;
  subtitle: string;
}

interface Props {
  workerName: string;
  expanded: boolean;
  active: string; // WORKER_HOME | PROFILE | SECURITY
  recents: RecentItem[];
  isAvailable?: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
}

/**
 * Worker dashboard left navigation - the same ChatGPT / "Business Mall" chat-app
 * style used by EmployerSidebar, adapted for a worker (Find work / Search jobs /
 * Recent jobs). At the bottom the account chip taps straight to Profile, and a
 * Settings popover holds Help and Sign out (Security lives in the profile area,
 * reachable via the chip).
 */
export default function WorkerChatSidebar({
  workerName,
  expanded,
  active,
  recents,
  isAvailable,
  onToggle,
  onNewChat,
  onOpenProfile,
  onSignOut,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const initials =
    String(workerName || 'GL')
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'GL';

  // Settings popover - Help + Sign out only (Profile/Security live in the
  // profile area reached via the account chip).
  const settingsMenu = (
    <>
      <button
        onClick={() => { setSettingsOpen(false); toast.info('Need help? Reach the GO LESKA team at support@goleska.in'); }}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <HelpCircle size={16} /> Help &amp; Support
      </button>
      <button
        onClick={() => { setSettingsOpen(false); onSignOut(); }}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <LogOut size={16} /> Sign out
      </button>
    </>
  );

  return (
    <aside className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200 ${expanded ? 'w-64' : 'w-16'}`}>
      {/* Top: hamburger + brand */}
      <div className="flex items-center gap-2 p-3">
        <button
          onClick={onToggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        {expanded && (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Zap size={16} className="text-white" fill="currentColor" />
            </div>
            <span className="truncate font-[var(--font-anton)] text-lg uppercase tracking-wider text-slate-900">GO LESKA</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 px-3">
        {expanded ? (
          <>
            <button
              onClick={onNewChat}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                active === 'WORKER_HOME'
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <Plus size={18} className="text-indigo-600" /> Find work
            </button>
            <button
              type="button"
              onClick={onNewChat}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
            >
              <Search size={18} /> Search jobs
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onNewChat}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
              title="Find work"
            >
              <MessageSquare size={20} />
            </button>
            <button
              onClick={onToggle}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
              title="Search jobs"
            >
              <Search size={20} />
            </button>
          </>
        )}
      </div>

      {/* Recents (worker's recent jobs) */}
      {expanded ? (
        <div className="mt-5 flex-1 overflow-y-auto px-3">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recent jobs</p>
          <div className="space-y-0.5">
            {recents.length === 0 && <p className="px-2 py-2 text-xs text-slate-400">No recent jobs yet.</p>}
            {recents.map((item, i) => (
              <button
                key={i}
                onClick={onNewChat}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-slate-100"
              >
                <Briefcase size={16} className="shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{item.title}</p>
                  <p className="truncate text-[11px] text-slate-400">{item.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Bottom: Dashboard, a Settings popover (Help / Sign out), and the
          account chip which taps straight to Profile. */}
      {expanded ? (
        <div className="mt-auto border-t border-slate-200 p-2">
          <button
            onClick={onNewChat}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active === 'WORKER_HOME' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <div className="relative mt-1" ref={settingsRef}>
            {settingsOpen && (
              <div className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-300/40">
                {settingsMenu}
              </div>
            )}
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <Settings size={18} /> Settings
            </button>
          </div>

          <button
            onClick={onOpenProfile}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{workerName || 'Worker'}</p>
              <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {isAvailable ? 'Online' : 'Offline'}
              </p>
            </div>
          </button>
        </div>
      ) : (
        <div className="mt-auto flex flex-col items-center gap-1 border-t border-slate-200 p-2">
          <button
            onClick={onNewChat}
            title="Dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          >
            <LayoutDashboard size={20} />
          </button>
          <div className="relative" ref={settingsRef}>
            {settingsOpen && (
              <div className="absolute bottom-0 left-[calc(100%+0.5rem)] z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-300/40">
                {settingsMenu}
              </div>
            )}
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              title="Settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
            >
              <Settings size={20} />
            </button>
          </div>
          <button
            onClick={onOpenProfile}
            title="Profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white"
          >
            {initials}
          </button>
        </div>
      )}
    </aside>
  );
}
