"use client";

import React from 'react';
import { LayoutDashboard, UserCog, User, Landmark, Users, FileText, ShieldCheck, LogOut, Zap } from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

interface Props {
  active: string;
  companyName: string;
  accountType?: string;
  onNavigate: (tab: string) => void;
  onSignOut: () => void;
}

/**
 * Profile/account-area sidebar for business employers (registered + unregistered).
 * Shown when the user is inside their profile area (Company/Director-or-Proprietor/
 * Employee/Documents/Security); outside it, the chat-style EmployerSidebar is used.
 * For UNREGISTERED_BUSINESS the "Director profile" item becomes "Proprietor profile".
 */
export default function ProfileSidebar({ active, companyName, accountType, onNavigate, onSignOut }: Props) {
  const isUnregistered = accountType === 'UNREGISTERED_BUSINESS';
  const isIndividual = accountType === 'INDIVIDUAL';
  // An individual employer has no company/director - just their own profile.
  const NAV: NavItem[] = isIndividual
    ? [
        { key: 'DISPATCH', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'COMPANY', label: 'My profile', icon: User },
        { key: 'EMPLOYEE', label: 'Hired workers', icon: Users },
        { key: 'PROFILE', label: 'Documents', icon: FileText },
        { key: 'SECURITY', label: 'Security', icon: ShieldCheck },
      ]
    : [
        { key: 'DISPATCH', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'DIRECTOR', label: isUnregistered ? 'Proprietor profile' : 'Director profile', icon: isUnregistered ? User : UserCog },
        { key: 'COMPANY', label: 'Company profile', icon: Landmark },
        { key: 'EMPLOYEE', label: 'Employee profile', icon: Users },
        { key: 'PROFILE', label: 'Documents', icon: FileText },
        { key: 'SECURITY', label: 'Security', icon: ShieldCheck },
      ];
  const initials =
    String(companyName || 'GL')
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
          <span className="block truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">Account</span>
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

      {/* Bottom: company chip + log out */}
      <div className="mt-auto border-t border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
            {initials}
          </div>
          <p className="min-w-0 truncate text-sm font-semibold text-slate-700">{companyName || (isIndividual ? 'My Account' : 'My Company')}</p>
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
