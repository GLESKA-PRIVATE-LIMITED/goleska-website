"use client";

import React, { useEffect, useState } from 'react';
import {
  Menu,
  Zap,
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  CalendarCheck,
  MessageSquare,
  BarChart3,
  CreditCard,
  Settings,
  Landmark,
  UserCog,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  soon?: boolean;
}

interface Props {
  active: string;
  onNavigate: (tab: string) => void;
  onSignOut: () => void;
  companyName?: string;
}

// Real, navigable items route to a dashboard tab via `key`. Items with `soon`
// are NOT real GO LESKA concepts yet - they render disabled with a "Soon" badge
// rather than linking to a fake page.
const mainNav: NavItem[] = [
  { key: 'OVERVIEW', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'WORKERS', label: 'Workers', icon: Users },
  { key: 'DISPATCH', label: 'Jobs', icon: Briefcase },
  { key: 'CLIENTS', label: 'Clients', icon: Building2, soon: true },
  { key: 'ATTENDANCE', label: 'Attendance', icon: CalendarCheck, soon: true },
  { key: 'MESSAGES', label: 'Messages', icon: MessageSquare, soon: true },
  { key: 'REPORTS', label: 'Reports', icon: BarChart3 },
  { key: 'PAYMENTS', label: 'Payments', icon: CreditCard, soon: true },
  { key: 'PROFILE', label: 'Settings', icon: Settings },
];

const accountNav: NavItem[] = [
  { key: 'COMPANY', label: 'Company Profile', icon: Landmark },
  { key: 'DIRECTOR', label: 'Director Profile', icon: UserCog },
  { key: 'SECURITY', label: 'Security', icon: ShieldCheck },
];

/**
 * Richer employer sidebar with text labels (Business Mall admin style).
 * Same collapse/expand + active-highlight pattern as EmployerSidebar, but labels
 * are visible by default (expanded on desktop, collapsed on mobile).
 */
export default function AdminSidebar({ active, onNavigate, onSignOut, companyName }: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) setExpanded(true);
  }, []);

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = active === item.key;

    if (item.soon) {
      return (
        <div
          key={item.key}
          title={expanded ? undefined : `${item.label} (coming soon)`}
          className={`flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 ${
            expanded ? '' : 'justify-center'
          }`}
        >
          <Icon size={20} className="shrink-0" />
          {expanded && (
            <>
              <span className="truncate">{item.label}</span>
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Soon
              </span>
            </>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.key}
        onClick={() => onNavigate(item.key)}
        title={expanded ? undefined : item.label}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
          expanded ? '' : 'justify-center'
        } ${isActive ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' : 'text-slate-600 hover:bg-slate-100'}`}
      >
        <Icon size={20} className="shrink-0" />
        {expanded && <span className="truncate">{item.label}</span>}
      </button>
    );
  };

  const initials =
    String(companyName || 'GL')
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'GL';

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        expanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Brand + toggle */}
      <div className="flex items-center gap-2 p-3">
        <button
          onClick={() => setExpanded((v) => !v)}
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

      {/* Main nav */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex flex-col gap-1">{mainNav.map(renderItem)}</div>

        <div className="my-3 border-t border-slate-100" />
        {expanded && <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Account</p>}
        <div className="flex flex-col gap-1">{accountNav.map(renderItem)}</div>
      </div>

      {/* Bottom: user chip + sign out */}
      <div className="mt-auto border-t border-slate-200 p-3">
        {expanded ? (
          <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
              {initials}
            </div>
            <p className="min-w-0 truncate text-sm font-semibold text-slate-700">{companyName || 'My Company'}</p>
          </div>
        ) : null}
        <button
          onClick={onSignOut}
          title={expanded ? undefined : 'Sign out'}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 ${
            expanded ? 'w-full' : 'w-10 justify-center'
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {expanded && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
