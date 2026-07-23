"use client";

import React, { useEffect, useState } from 'react';
import { X, MapPin, Loader2, Crosshair, Zap, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export interface AddressData {
  country: string;
  state: string;
  city: string;
  line1: string;
  line2: string;
  zip: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (address: AddressData) => void;
}

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500';
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100';

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore', 'Australia', 'Canada'];

const EMPTY: AddressData = { country: 'India', state: '', city: '', line1: '', line2: '', zip: '' };

/**
 * "Select Location" flow: an address-entry form (country/state/city/lines/zip)
 * with a "Share your location" permission overlay shown on top first. The
 * overlay reuses the same browser geolocation + Nominatim reverse-geocode
 * pattern as MapPickerInner to auto-fill the address.
 */
export default function SelectLocationModal({ isOpen, onClose, onSave }: Props) {
  const [address, setAddress] = useState<AddressData>(EMPTY);
  const [showPermission, setShowPermission] = useState(true);
  const [locating, setLocating] = useState(false);

  // Re-show the permission prompt each time the modal is opened.
  useEffect(() => {
    if (isOpen) {
      setShowPermission(true);
      setLocating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (patch: Partial<AddressData>) => setAddress((a) => ({ ...a, ...patch }));

  const handleShareLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setShowPermission(false);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await res.json();
          const a = data.address || {};
          set({
            country: a.country || address.country,
            state: a.state || a.region || '',
            city: a.city || a.town || a.village || a.county || '',
            line1: [a.house_number, a.road].filter(Boolean).join(' ') || a.neighbourhood || '',
            line2: a.suburb || '',
            zip: a.postcode || '',
          });
          toast.success('Location detected. Please review the details.');
        } catch {
          toast.error('Could not fetch address. Please enter it manually.');
        } finally {
          setLocating(false);
          setShowPermission(false);
        }
      },
      () => {
        toast.error('Location permission denied. Please enter your address manually.');
        setLocating(false);
        setShowPermission(false);
      }
    );
  };

  const handleSave = () => {
    if (!address.line1.trim() || !address.city.trim()) {
      toast.error('Please enter at least the city and address line 1.');
      return;
    }
    onSave?.(address);
    toast.success('Address saved.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
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

        {/* Address form */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Country</label>
            <select value={address.country} onChange={(e) => set({ country: e.target.value })} className={inputCls}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>State / Province</label>
              <input value={address.state} onChange={(e) => set({ state: e.target.value })} className={inputCls} placeholder="Maharashtra" />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input value={address.city} onChange={(e) => set({ city: e.target.value })} className={inputCls} placeholder="Pune" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Address Line 1</label>
            <input value={address.line1} onChange={(e) => set({ line1: e.target.value })} className={inputCls} placeholder="Plot / building / street" />
          </div>

          <div>
            <label className={labelCls}>Address Line 2</label>
            <input value={address.line2} onChange={(e) => set({ line2: e.target.value })} className={inputCls} placeholder="Area / landmark (optional)" />
          </div>

          <div>
            <label className={labelCls}>Zip / Postal Code</label>
            <input value={address.zip} onChange={(e) => set({ zip: e.target.value })} className={inputCls} placeholder="411001" />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700"
          >
            Save Address
          </button>
        </div>

        {/* Share-location permission overlay */}
        {showPermission && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/95 p-6 backdrop-blur-sm">
            <div className="w-full max-w-sm text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                <MapPin size={30} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Share your location</h3>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-slate-500">
                This allows us to find your address automatically for a faster experience.
              </p>

              <div className="mx-auto mt-6 max-w-xs space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Crosshair size={18} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Accurate position</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Zap size={18} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Faster experience</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <ShieldCheck size={18} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Secure &amp; Private</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleShareLocation}
                disabled={locating}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
              >
                {locating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Detecting...
                  </>
                ) : (
                  'Share Location'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowPermission(false)}
                className="mt-3 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
              >
                Enter Address Manually
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
