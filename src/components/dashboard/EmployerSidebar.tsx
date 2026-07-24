"use client";

import React from 'react';
import {
  Menu,
  Plus,
  Search,
  Settings,
  MapPin,
  Zap,
  MessageSquare,
} from 'lucide-react';

interface Props {
  jobSites: any[];
  companyName: string;
  expanded: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectSite: (id: string) => void;
  onOpenProfile: () => void;
  onOpenSecurity: () => void;
}

/**
 * Employer dashboard left navigation (ChatGPT / "Business Mall" chat-app style),
 * shared by all business employers (REGISTERED_BUSINESS, REGISTERED_INDUSTRY,
 * UNREGISTERED_BUSINESS).
 *
 * The account entry point follows the reference pattern: the name + avatar live
 * top-right in the top bar (see dashboard page) and tap straight through to the
 * Profile area - there is no bottom-left account chip / dropdown here anymore.
 * The settings gear stays at the bottom of the sidebar and also opens the
 * Profile/account area, where Security and Sign out live (ProfileSidebar's
 * "Security" tab + "Log out", and SecurityView's "Sign out of this device").
 */
export default function EmployerSidebar({
  jobSites,
  companyName,
  expanded,
  onToggle,
  onNewChat,
  onSelectSite,
  onOpenProfile,
  onOpenSecurity,
}: Props) {
  const initials =
    String(companyName || 'GL')
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'GL';

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
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <Plus size={18} className="text-indigo-600" /> New chat
            </button>
            <button
              type="button"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
            >
              <Search size={18} /> Search chats
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onNewChat}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
              title="New chat"
            >
              <MessageSquare size={20} />
            </button>
            <button
              onClick={onToggle}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
              title="Search"
            >
              <Search size={20} />
            </button>
          </>
        )}
      </div>

      {/* Recents (from the employer's existing job sites) */}
      {expanded ? (
        <div className="mt-5 flex-1 overflow-y-auto px-3">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recents</p>
          <div className="space-y-0.5">
            {jobSites.length === 0 && <p className="px-2 py-2 text-xs text-slate-400">No recent locations yet.</p>}
            {jobSites.map((site) => (
              <button
                key={site.id}
                onClick={() => onSelectSite(site.id)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-slate-100"
              >
                <MapPin size={16} className="shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{site.name}</p>
                  <p className="truncate text-[11px] text-slate-400">India</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Bottom (ChatGPT-style): Settings, then the account/profile chip -
          both stacked at the bottom. Tapping the chip goes straight to Profile;
          Settings opens account security. Security + Sign out live in the
          profile area (ProfileSidebar's Security tab + Log out, and
          SecurityView's "Sign out of this device"). */}
      {expanded ? (
        <div className="mt-auto border-t border-slate-200 p-2">
          <button
            onClick={onOpenSecurity}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <Settings size={18} /> Settings
          </button>
          <button
            onClick={onOpenProfile}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{companyName || 'My Company'}</p>
              <p className="truncate text-xs text-slate-400">Business Owner</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="mt-auto flex flex-col items-center gap-1 border-t border-slate-200 p-2">
          <button
            onClick={onOpenSecurity}
            title="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          >
            <Settings size={20} />
          </button>
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
