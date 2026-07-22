import React, { useState, useEffect } from 'react';
import { AccountType } from '@/app/onboarding/page';
import { Building2, Factory, Store, UserCircle2, Hammer, Users, ChevronRight } from 'lucide-react';

interface Props {
  selectedType: AccountType;
  onSelect: (type: AccountType) => void;
  initialSide?: 'WORKER' | 'EMPLOYER' | null;
}

export default function AccountTypeSelector({ selectedType, onSelect, initialSide = null }: Props) {
  const [side, setSide] = useState<'WORKER' | 'EMPLOYER' | null>(initialSide);

  useEffect(() => {
    if (initialSide) {
      setSide(initialSide);
    }
  }, [initialSide]);

  const employerOptions = [
    {
      id: 'REGISTERED_BUSINESS' as AccountType,
      title: 'Registered Business',
      desc: 'Pvt Ltd, LLP, Public Ltd with GST/CIN',
      icon: <Building2 size={24} />
    },
    {
      id: 'REGISTERED_INDUSTRY' as AccountType,
      title: 'Registered Industry',
      desc: 'Factories and Manufacturing Units',
      icon: <Factory size={24} />
    },
    {
      id: 'UNREGISTERED_BUSINESS' as AccountType,
      title: 'Unregistered Business',
      desc: 'Proprietors & Informal Businesses',
      icon: <Store size={24} />
    }
  ];

  const workerOptions = [
    {
      id: 'INDIVIDUAL' as AccountType,
      title: 'Gig Worker / Individual',
      desc: 'Take temporary gigs and daily dispatch jobs',
      icon: <Hammer size={24} />
    },
    {
      id: 'EMPLOYEE' as AccountType,
      title: 'Permanent Employee',
      desc: 'Seeking full-time payroll employment',
      icon: <UserCircle2 size={24} />
    }
  ];

  if (!side) {
    return (
      <div className="space-y-5">
        <p className="text-center text-sm font-medium text-slate-500">What brings you to GO LESKA?</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => setSide('EMPLOYER')}
            className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white transition group-hover:scale-105">
              <Users size={30} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">I Need Workers</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">Hire blue-collar workforce instantly</p>
          </button>

          <button
            onClick={() => setSide('WORKER')}
            className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white transition group-hover:scale-105">
              <Hammer size={30} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">I Need Work</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">Find daily gigs or full-time jobs</p>
          </button>
        </div>
      </div>
    );
  }

  const options = side === 'EMPLOYER' ? employerOptions : workerOptions;

  return (
    <div className="space-y-3 animate-in fade-in">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {side === 'EMPLOYER' ? 'Select Employer Type' : 'Select Worker Type'}
      </p>

      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
            selectedType === opt.id
              ? 'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-200'
              : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            {opt.icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900">{opt.title}</h3>
            <p className="text-sm text-slate-500">{opt.desc}</p>
          </div>
          <ChevronRight className="ml-auto shrink-0 text-slate-300" size={20} />
        </button>
      ))}
    </div>
  );
}
