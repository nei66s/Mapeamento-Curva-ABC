'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Store, RouteStop } from '@/lib/types';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
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

interface RoutingMapProps {
  allStores: Store[];
  routeStops: RouteStop[];
}


export default function RoutingMap({ allStores, routeStops }: RoutingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const routeLineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: iconRetinaUrl.src,
            iconUrl: iconUrl.src,
            shadowUrl: shadowUrl.src,
        });
      mapRef.current = L.map(mapContainerRef.current).setView([-22.8, -47.2], 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
      markersLayerRef.current.addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers and route line
    markersLayerRef.current.clearLayers();
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    const routeStoreIds = new Set(routeStops.map(stop => stop.id));

    // Add markers for all stores
    allStores.forEach(store => {
      const isInRoute = routeStoreIds.has(store.id);
      const icon = isInRoute ? greenIcon : blueIcon;
      const stopInfo = routeStops.find(s => s.id === store.id);

      let popupText = `<b>${store.name}</b><br>${store.city}`;
      if (stopInfo) {
        popupText += `<br><b>Visita #${stopInfo.visitOrder} na rota</b>`;
      }

      L.marker([store.lat, store.lng], { icon })
        .bindPopup(popupText)
        .addTo(markersLayerRef.current);
    });
    
    // Draw route line if there are stops
    if (routeStops.length > 1) {
      const latLngs = routeStops.map(stop => L.latLng(stop.lat, stop.lng));
      routeLineRef.current = L.polyline(latLngs, { color: 'hsl(var(--primary))', weight: 3 }).addTo(map);
    }

    // Fit map to show all stores if there are stops
    if (routeStops.length > 0) {
      const bounds = L.latLngBounds(routeStops.map(stop => [stop.lat, stop.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
        map.setView([-22.8, -47.2], 9);
    }


  }, [allStores, routeStops]);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%', borderRadius: 'var(--radius)' }} />;
}
