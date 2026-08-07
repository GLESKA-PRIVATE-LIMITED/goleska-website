import React from 'react';
import { Check } from 'lucide-react';

interface Props {
  steps: string[];
  current: number; // 1-based
}

/**
 * Shared top-horizontal step indicator (numbered circles + connecting line +
 * labels). Used by the standard onboarding card flow and the unregistered
 * business wizard.
 */
export default function StepIndicator({ steps, current }: Props) {
  return (
    <div className="mb-8 flex items-start">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                  active || done
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done ? <Check size={16} /> : n}
              </div>
              <span className={`mt-2 text-center text-[11px] font-semibold ${active || done ? 'text-slate-700' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mt-[18px] h-0.5 flex-1 rounded ${current > n ? 'bg-indigo-500' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
