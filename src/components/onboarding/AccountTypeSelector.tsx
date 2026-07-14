import React, { useState } from 'react';
import { AccountType } from '@/app/onboarding/page';
import { Building2, Factory, Store, UserCircle2, User, Hammer, Users } from 'lucide-react';

interface Props {
  selectedType: AccountType;
  onSelect: (type: AccountType) => void;
}

export default function AccountTypeSelector({ selectedType, onSelect }: Props) {
  const [side, setSide] = useState<'WORKER' | 'EMPLOYER' | null>(null);

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
      <div className="space-y-6">
        <p className="font-bold text-gray-500 text-center uppercase tracking-widest mb-6">What brings you to Go Leska?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setSide('EMPLOYER')}
            className="flex flex-col items-center justify-center p-8 border-4 border-black hard-shadow-hover transition-all bg-[var(--color-saffron)] group"
          >
            <div className="w-20 h-20 bg-black text-white flex items-center justify-center rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Users size={40} />
            </div>
            <h3 className="font-[var(--font-anton)] text-3xl uppercase text-black tracking-wide">I Need Workers</h3>
            <p className="font-bold text-sm text-gray-800 mt-2 text-center uppercase tracking-widest">Hire blue-collar workforce instantly</p>
          </button>

          <button
            onClick={() => setSide('WORKER')}
            className="flex flex-col items-center justify-center p-8 border-4 border-black hard-shadow-hover transition-all bg-[var(--color-jungle)] group"
          >
            <div className="w-20 h-20 bg-black text-white flex items-center justify-center rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Hammer size={40} />
            </div>
            <h3 className="font-[var(--font-anton)] text-3xl uppercase text-white tracking-wide">I Need Work</h3>
            <p className="font-bold text-sm text-green-100 mt-2 text-center uppercase tracking-widest">Find daily gigs or full-time jobs</p>
          </button>
        </div>
      </div>
    );
  }

  const options = side === 'EMPLOYER' ? employerOptions : workerOptions;

  return (
    <div className="space-y-4 animate-in slide-in-from-right">
      <div className="flex items-center justify-between mb-6">
        <p className="font-bold text-gray-500 uppercase tracking-widest">
          {side === 'EMPLOYER' ? 'Select Employer Type' : 'Select Worker Type'}
        </p>
        <button 
          onClick={() => setSide(null)}
          className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:underline"
        >
          Change Side
        </button>
      </div>
      
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={`w-full flex items-center p-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover transition-all text-left ${
            selectedType === opt.id ? 'bg-[var(--color-saffron)]' : 'bg-[var(--color-paper)] hover:bg-white'
          }`}
        >
          <div className="w-12 h-12 bg-[var(--color-charcoal)] text-[var(--color-paper)] flex items-center justify-center mr-4 border-2 border-[var(--color-charcoal)]">
            {opt.icon}
          </div>
          <div>
            <h3 className="font-[var(--font-anton)] tracking-wider text-xl uppercase">{opt.title}</h3>
            <p className="font-medium text-sm text-gray-700">{opt.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
