
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Store, StoreComplianceData } from '@/lib/types';

// Import marker icons
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface ComplianceMapProps {
  allStores: Store[];
  scheduledVisits: StoreComplianceData[];
}

// Define custom icons
const blueIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
	shadowUrl: shadowUrl.src,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
	shadowUrl: shadowUrl.src,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
	shadowUrl: shadowUrl.src,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});


export default function ComplianceMap({ allStores, scheduledVisits }: ComplianceMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Correctly configure the default icon path for Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl.src,
      iconUrl: iconUrl.src,
      shadowUrl: shadowUrl.src,
    });
  }, []);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
        const map = L.map(mapContainerRef.current).setView([-22.8, -47.2], 9);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
    }

    // Clear previous markers
    if (mapRef.current) {
      markersRef.current.forEach(marker => mapRef.current!.removeLayer(marker));
      markersRef.current = [];
    }
    
    // Determine the status of each store
    const storeStatusMap = new Map<string, 'completed' | 'pending'>();
    scheduledVisits.forEach(visit => {
        const hasPending = visit.items.some(item => item.status === 'pending');
        storeStatusMap.set(visit.storeId, hasPending ? 'pending' : 'completed');
    });

    if (mapRef.current) {
        allStores.forEach(store => {
            let icon = blueIcon;
            let popupText = `<b>${store.name}</b><br>${store.city}<br>Sem visita no período.`;
            const status = storeStatusMap.get(store.id);

            if (status === 'completed') {
                icon = greenIcon;
                popupText = `<b>${store.name}</b><br>${store.city}<br>Status: Concluído`;
            } else if (status === 'pending') {
                icon = orangeIcon;
                popupText = `<b>${store.name}</b><br>${store.city}<br>Status: Pendente`;
            }
            
            const marker = L.marker([store.lat, store.lng], { icon })
                .addTo(mapRef.current!)
                .bindPopup(popupText);
            
            markersRef.current.push(marker);
        });
    }

    return () => {
       if (mapRef.current) {
            markersRef.current.forEach(marker => {
                if (mapRef.current!.hasLayer(marker)) {
                    mapRef.current!.removeLayer(marker);
                }
            });
       }
    };
  }, [allStores, scheduledVisits]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: '400px', width: '100%', borderRadius: 'var(--radius)' }}
    />
  );
}
