"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the map to avoid Server-Side Rendering (SSR) issues with Leaflet touching the `window` object
const MapPickerInner = dynamic(
  () => import('./MapPickerInner'),
  { 
    ssr: false, 
    loading: () => (
      <div className="border-4 border-[var(--color-charcoal)] hard-shadow w-full h-[300px] bg-[var(--color-paper)] flex flex-col items-center justify-center text-gray-500 font-bold uppercase tracking-widest gap-3">
        <Loader2 className="animate-spin" size={32} />
        Loading Map...
      </div>
    )
  }
);

interface Props {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

export default function MapPicker(props: Props) {
  return <MapPickerInner {...props} />;
}
