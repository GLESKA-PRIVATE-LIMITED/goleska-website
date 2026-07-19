"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Phone, ShieldAlert, CheckCircle2, Navigation } from 'lucide-react';

const NavigationMapInner = dynamic(() => import('./NavigationMapInner'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black flex items-center justify-center font-[var(--font-anton)] text-[var(--color-saffron)] text-2xl uppercase tracking-widest">Loading Map...</div>
});

interface JobNavigationSheetProps {
  jobTitle: string;
  employerName: string;
  employerPhone: string;
  targetLat?: number;
  targetLng?: number;
  onCancel: () => void;
  onArrived: () => void;
}

export default function JobNavigationSheet({ 
  jobTitle, 
  employerName, 
  employerPhone, 
  targetLat = 28.6139, 
  targetLng = 77.2090, 
  onCancel, 
  onArrived 
}: JobNavigationSheetProps) {
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Top Bar overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="bg-black/80 border-2 border-[var(--color-saffron)] text-white px-4 py-2 pointer-events-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-saffron)] animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-widest text-[var(--color-saffron)]">Live Tracking ON</span>
        </div>
        <button className="bg-white text-black p-3 rounded-full border-4 border-black hard-shadow pointer-events-auto">
          <Navigation size={20} fill="currentColor" />
        </button>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <NavigationMapInner targetLat={targetLat} targetLng={targetLng} />
      </div>

      {/* Bottom Sheet */}
      <div 
        className={`bg-[var(--color-paper)] border-t-8 border-[var(--color-charcoal)] transition-all duration-300 ease-in-out absolute bottom-0 left-0 right-0 z-20 flex flex-col`}
        style={{ height: sheetExpanded ? '80vh' : 'auto', maxHeight: '80vh' }}
      >
        {/* Drag Handle Area */}
        <div 
          className="w-full p-4 flex justify-center cursor-pointer active:bg-gray-200 transition-colors"
          onClick={() => setSheetExpanded(!sheetExpanded)}
        >
          <div className="w-16 h-2 bg-gray-400 rounded-full" />
        </div>

        <div className="px-6 pb-8 flex-1 overflow-y-auto">
          <div className="flex justify-between items-start mb-6 gap-3">
            <div className="min-w-0">
              <h2 className="font-[var(--font-anton)] text-3xl sm:text-4xl uppercase leading-none mb-1 break-words">{jobTitle}</h2>
              <p className="font-bold text-gray-500 text-sm uppercase tracking-widest truncate">{employerName}</p>
            </div>
            <a 
              href={`tel:${employerPhone}`}
              className="bg-black text-[var(--color-saffron)] p-4 rounded-full border-4 border-black hard-shadow-hover hover:scale-105 transition-transform shrink-0"
            >
              <Phone size={24} fill="currentColor" />
            </a>
          </div>

          <div className="bg-white border-4 border-black p-4 mb-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <ShieldAlert size={100} />
            </div>
            <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">Arrival OTP Code</p>
            <p className="font-[var(--font-anton)] text-5xl tracking-widest">4892</p>
            <p className="text-xs font-bold text-gray-600 mt-2">Share this code with the employer when you arrive at the job site.</p>
          </div>

          <button 
            onClick={onArrived}
            className="w-full bg-[var(--color-jungle)] text-white font-[var(--font-anton)] text-2xl uppercase tracking-widest py-5 border-4 border-black hard-shadow hover:bg-green-600 transition-colors flex items-center justify-center gap-3 mb-4"
          >
            <CheckCircle2 size={28} /> I Have Arrived
          </button>

          {sheetExpanded && (
            <div className="mt-8 pt-8 border-t-4 border-dashed border-gray-300">
              {cancelling ? (
                <div className="bg-red-50 border-4 border-red-500 p-6">
                  <h3 className="font-[var(--font-anton)] text-2xl text-red-600 uppercase mb-2">Emergency Cancel</h3>
                  <p className="font-bold text-sm text-red-900 mb-6">Cancelling an accepted job severely impacts your trust score. Are you absolutely sure?</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setCancelling(false)} className="bg-white border-4 border-black font-bold uppercase py-3 hover:bg-gray-100">Go Back</button>
                    <button onClick={onCancel} className="bg-red-600 text-white border-4 border-black font-bold uppercase py-3 hover:bg-red-700">Yes, Cancel</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setCancelling(true)}
                  className="w-full bg-white text-red-600 font-bold uppercase tracking-widest py-4 border-4 border-black hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={20} /> Emergency / Cancel Job
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
