"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Phone, Navigation, X } from 'lucide-react';

const NavigationMapInner = dynamic(() => import('./NavigationMapInner'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black flex items-center justify-center font-[var(--font-anton)] text-[var(--color-saffron)] text-2xl uppercase tracking-widest">Loading Map...</div>
});

interface JobNavigationSheetProps {
  jobTitle: string;
  employerName: string;
  employerPhone: string;
  targetLat: number;
  targetLng: number;
  onClose: () => void;
}

export default function JobNavigationSheet({
  jobTitle,
  employerName,
  employerPhone,
  targetLat,
  targetLng,
  onClose,
}: JobNavigationSheetProps) {
  const [sheetExpanded, setSheetExpanded] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Top Bar overlay - z-index must clear Leaflet's own control layer (~1000) or it renders on top and eats clicks */}
      <div className="absolute top-0 left-0 right-0 p-4 z-[1200] flex justify-between items-center pointer-events-none">
        <div className="bg-black/80 border-2 border-[var(--color-saffron)] text-white px-4 py-2 pointer-events-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-saffron)] animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-widest text-[var(--color-saffron)]">Live Tracking ON</span>
        </div>
        <button
          onClick={onClose}
          className="bg-white text-black p-3 rounded-full border-4 border-black hard-shadow pointer-events-auto"
          aria-label="Close navigation"
        >
          <X size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <NavigationMapInner targetLat={targetLat} targetLng={targetLng} />
      </div>

      {/* Bottom Sheet */}
      <div
        className={`bg-[var(--color-paper)] border-t-8 border-[var(--color-charcoal)] transition-all duration-300 ease-in-out absolute bottom-0 left-0 right-0 z-[1200] flex flex-col`}
        style={{ height: sheetExpanded ? '50vh' : 'auto', maxHeight: '50vh' }}
      >
        {/* Drag Handle Area */}
        <div
          className="w-full p-4 flex justify-center cursor-pointer active:bg-gray-200 transition-colors"
          onClick={() => setSheetExpanded(!sheetExpanded)}
        >
          <div className="w-16 h-2 bg-gray-400 rounded-full" />
        </div>

        <div className="px-6 pb-8 flex-1 overflow-y-auto">
          <div className="flex justify-between items-start gap-3">
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

          <button
            onClick={onClose}
            className="w-full mt-6 bg-[var(--color-charcoal)] text-white font-bold uppercase tracking-widest py-4 border-4 border-black hard-shadow-hover flex items-center justify-center gap-2 transition-all"
          >
            <Navigation size={20} /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
