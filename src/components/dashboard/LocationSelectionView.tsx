"use client";

import React, { useState } from 'react';
import { MapPin, Search, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import MapPicker from './MapPicker';

interface Props {
  jobSites: any[];
  onSelectSite: (id: string) => void;
}

const POPULAR_CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'];

/**
 * Full-page location selector. Reuses the existing MapPicker (search + geolocation
 * + click-to-pin) and the jobSites-based "Recents" pattern from the sidebar.
 * Popular-city pills geocode via the same public service the map already uses.
 */
export default function LocationSelectionView({ jobSites, onSelectSite }: Props) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState<string | null>(null);

  const geocodeCity = async (city: string) => {
    setGeocoding(city);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1&countrycodes=in`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setLat(parseFloat(data[0].lat));
        setLng(parseFloat(data[0].lon));
      } else {
        toast.error(`Could not find ${city}`);
      }
    } catch {
      toast.error('Location search failed. Please try again.');
    } finally {
      setGeocoding(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Select Your Location</h1>
        <p className="mt-1 text-sm text-slate-500">Search a city, drop a pin, or pick one of your saved job sites.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map + search + popular */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {/* Popular searches */}
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Search size={12} /> Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => geocodeCity(city)}
                    disabled={geocoding !== null}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    {geocoding === city ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} className="text-indigo-500" />}
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Reused map picker (has its own search + current location) */}
            <MapPicker latitude={lat} longitude={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />

            <button
              type="button"
              disabled={lat === null || lng === null}
              onClick={() => {
                if (lat !== null && lng !== null) {
                  toast.success(`Location set (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
                }
              }}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              Use this location
            </button>
          </div>
        </div>

        {/* Recents (real job sites) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <Clock size={12} /> Recents
          </div>
          {jobSites.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No saved job sites yet.</p>
          ) : (
            <div className="space-y-1">
              {jobSites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => onSelectSite(site.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-100"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-indigo-500">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-700">{site.name}</p>
                    <p className="truncate text-[11px] text-slate-400">India</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
