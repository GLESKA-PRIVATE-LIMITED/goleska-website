"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  targetLat: number;
  targetLng: number;
}

export default function NavigationMapInner({ targetLat, targetLng }: Props) {
  const [workerLat, setWorkerLat] = useState<number | null>(null);
  const [workerLng, setWorkerLng] = useState<number | null>(null);

  useEffect(() => {
    // Get real location or mock one slightly offset from target
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setWorkerLat(pos.coords.latitude);
          setWorkerLng(pos.coords.longitude);
        },
        () => {
          // Mock location if GPS denied (2.5km away)
          setWorkerLat(targetLat - 0.02);
          setWorkerLng(targetLng - 0.02);
        }
      );
    } else {
      setWorkerLat(targetLat - 0.02);
      setWorkerLng(targetLng - 0.02);
    }
  }, [targetLat, targetLng]);

  if (!workerLat || !workerLng) {
    return <div className="w-full h-full bg-gray-900 flex items-center justify-center text-[var(--color-saffron)] font-[var(--font-anton)] text-xl tracking-widest uppercase">Initializing GPS...</div>;
  }

  // Dark mode CartoDB tile layer
  const darkTileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const bounds: L.LatLngBoundsExpression = [
    [workerLat, workerLng],
    [targetLat, targetLng]
  ];

  return (
    <div className="w-full h-full bg-black z-0">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
        style={{ height: '100%', width: '100%', backgroundColor: '#000' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url={darkTileUrl}
        />
        <Marker position={[workerLat, workerLng]} />
        <Marker position={[targetLat, targetLng]} />
        <Polyline positions={[[workerLat, workerLng], [targetLat, targetLng]]} color="var(--color-saffron)" weight={4} dashArray="10, 10" />
      </MapContainer>
    </div>
  );
}
