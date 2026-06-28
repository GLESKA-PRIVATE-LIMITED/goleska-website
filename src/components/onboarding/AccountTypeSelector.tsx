import React from 'react';
import { AccountType } from '@/app/onboarding/page';
import { Building2, Factory, Store, UserCircle2, User } from 'lucide-react';

interface Props {
  selectedType: AccountType;
  onSelect: (type: AccountType) => void;
}

export default function AccountTypeSelector({ selectedType, onSelect }: Props) {
  const options = [
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
    },
    {
      id: 'EMPLOYEE' as AccountType,
      title: 'Employee',
      desc: 'Staff joining an organization',
      icon: <UserCircle2 size={24} />
    },
    {
      id: 'INDIVIDUAL' as AccountType,
      title: 'Individual',
      desc: 'Personal users',
      icon: <User size={24} />
    }
  ];

  return (
    <div className="space-y-4">
      <p className="font-bold text-gray-500 mb-6">Select how you want to use GO LESKA:</p>
      
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
            <h3 className="font-[var(--font-anton)] tracking-wider text-xl">{opt.title}</h3>
            <p className="font-medium text-sm text-gray-700">{opt.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
