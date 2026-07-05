"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ position, onChange }: { position: [number, number] | null, onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapPickerInner({ latitude, longitude, onChange }: Props) {
  // Default to New Delhi coordinates
  const defaultCenter: [number, number] = [28.6139, 77.2090];
  const position: [number, number] | null = (latitude && longitude) ? [latitude, longitude] : null;

  const [address, setAddress] = React.useState<string>('Click on the map to drop a pin');
  const [loadingAddress, setLoadingAddress] = React.useState<boolean>(false);

  useEffect(() => {
    if (latitude && longitude) {
      const fetchAddress = async () => {
        setLoadingAddress(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            setAddress(data.display_name || 'Address not found');
          } else {
            setAddress('Failed to load address');
          }
        } catch (err) {
          setAddress('Error fetching address');
        } finally {
          setLoadingAddress(false);
        }
      };
      
      // Debounce slightly if needed, but here we just fetch immediately on change
      fetchAddress();
    }
  }, [latitude, longitude]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoadingAddress(true);
    setAddress('Fetching GPS location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        alert("Unable to retrieve your location");
        setLoadingAddress(false);
        setAddress('Click on the map to drop a pin');
      }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 p-3">
        <div className="flex items-start gap-2 text-sm font-bold text-blue-900 pr-4">
          <span className="shrink-0 mt-0.5">📍</span>
          <span>{loadingAddress ? 'Fetching location...' : address}</span>
        </div>
        <button
          type="button"
          onClick={handleCurrentLocation}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 text-xs uppercase tracking-widest rounded transition-colors"
        >
          Use Current Location
        </button>
      </div>
      <div className="border-4 border-[var(--color-charcoal)] hard-shadow w-full h-[300px] bg-gray-100 z-0">
        <MapContainer 
          center={position || defaultCenter} 
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onChange={onChange} />
        </MapContainer>
      </div>
    </div>
  );
}
