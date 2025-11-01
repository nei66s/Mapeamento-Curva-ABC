
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Store, RouteStop } from '@/lib/types';
import { format } from 'date-fns';

// Default icon fix
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RoutingMapProps {
  allStores: Store[];
  routeStops: RouteStop[];
}

const haversineDistance = (coords1: {lat: number, lng: number}, coords2: {lat: number, lng: number}): number => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

export default function RoutingMap({ allStores, routeStops }: RoutingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup>(new L.LayerGroup());

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl.src,
        iconUrl: iconUrl.src,
        shadowUrl: shadowUrl.src,
      });

      mapRef.current = L.map(mapContainerRef.current, {
        center: [-22.8, -47.2],
        zoom: 9
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      layersRef.current.addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    map.invalidateSize();
    layersRef.current.clearLayers();

    const routeStoreIds = new Set(routeStops.map(stop => stop.id));

    allStores.forEach(store => {
      if (!routeStoreIds.has(store.id)) {
        L.marker([store.lat, store.lng], { icon: blueIcon })
          .bindPopup(`<b>${store.name}</b><br>${store.city}`)
          .addTo(layersRef.current);
      }
    });
    
    routeStops.forEach((stop, index) => {
      let icon = greenIcon;
      let popupText = `<b>${stop.name}</b><br>${stop.city}`;

      if (stop.visitOrder === -1) { 
        icon = goldIcon;
        popupText += `<br><b>Ponto de Partida</b>`;
      } else {
        popupText += `<br><b>Visita #${stop.visitOrder + 1} na rota</b>`;
      }

      L.marker([stop.lat, stop.lng], { icon })
        .bindPopup(popupText)
        .addTo(layersRef.current);
    });

    if (routeStops.length > 1) {
      const latLngs = routeStops.map(stop => L.latLng(stop.lat, stop.lng));
      L.polyline(latLngs, { color: 'hsl(var(--primary))', weight: 3 }).addTo(layersRef.current);

      for (let i = 0; i < routeStops.length - 1; i++) {
        const start = routeStops[i];
        const end = routeStops[i+1];
        const distance = haversineDistance(start, end);
        const midPoint = L.latLng((start.lat + end.lat) / 2, (start.lng + end.lng) / 2);
        
        const distanceMarker = L.divIcon({
            className: 'distance-marker',
            html: `<div>${distance.toFixed(1)} km</div>`
        });
        
        L.marker(midPoint, { icon: distanceMarker }).addTo(layersRef.current);
      }
    }
    
    if (routeStops.length > 0) {
      const bounds = L.latLngBounds(routeStops.map(loc => [loc.lat, loc.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      map.setView([-22.8, -47.2], 9);
    }

  }, [allStores, routeStops]);
  
  useEffect(() => {
    // Inject custom CSS for distance markers
    const style = document.createElement('style');
    style.innerHTML = `
      .distance-marker {
        background-color: rgba(255, 255, 255, 0.8);
        border: 1px solid #777;
        border-radius: 4px;
        padding: 2px 5px;
        font-size: 10px;
        font-weight: bold;
        text-align: center;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}
