"use client";

import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import MapPicker from './MapPicker';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
}

/**
 * Modal wrapper around the existing MapPicker (search via Nominatim + "Use Current
 * Location" geolocation + click-to-drop-pin). Reuses that component verbatim; this
 * only provides the modal chrome and returns the chosen coordinates via onSelect.
 */
export default function SelectLocationModal({ isOpen, onClose, onSelect }: Props) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <MapPin size={18} />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Select Location</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <MapPicker
          latitude={lat}
          longitude={lng}
          onChange={(la, ln) => {
            setLat(la);
            setLng(ln);
          }}
        />

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={lat === null || lng === null}
            onClick={() => {
              if (lat !== null && lng !== null) {
                onSelect(lat, lng);
                onClose();
              }
            }}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            Use this location
          </button>
        </div>
      </div>
    </div>
  );
}
