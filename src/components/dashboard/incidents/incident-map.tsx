'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Incident } from '@/lib/types';

// Import marker icons directly from leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface IncidentMapProps {
  incidents: Incident[];
}

export default function IncidentMap({ incidents }: IncidentMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Set up the default icon paths
    // This is a common fix for icon issues with webpack/Next.js
    (L.Icon.Default.prototype as any)._getIconUrl = function() { return '' };
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl.src,
      iconUrl: iconUrl.src,
      shadowUrl: shadowUrl.src,
    });


    // Ensure this code only runs in the browser and the map is not already initialized
    if (mapContainerRef.current && !mapRef.current) {
        
        const incidentsWithCoords = incidents.filter(
            incident => incident.lat != null && incident.lng != null && (incident.status === 'Aberto' || incident.status === 'Em Andamento')
        );
        
        const center: L.LatLngExpression =
            incidentsWithCoords.length > 0
            ? [incidentsWithCoords[0].lat!, incidentsWithCoords[0].lng!]
            : [-14.235, -51.9253]; // Fallback to Brazil's center

        // Initialize the map
        const map = L.map(mapContainerRef.current).setView(
            center, 
            incidentsWithCoords.length > 0 ? 5 : 4
        );
        mapRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Add markers
        incidentsWithCoords.forEach(incident => {
            L.marker([incident.lat!, incident.lng!])
            .addTo(map)
            .bindPopup(`<b>${incident.itemName}</b><br>${incident.location}`);
        });
    }

    // Cleanup function to destroy the map instance when the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [incidents]);

  return (
    <div 
        ref={mapContainerRef} 
        style={{ height: '400px', width: '100%', borderRadius: 'var(--radius)' }}
    />
  );
}
