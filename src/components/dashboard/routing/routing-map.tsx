
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

      mapRef.current = L.map(mapContainerRef.current).setView([-22.8, -47.2], 9);

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
      let popupText = `<b>${stop.name}</b><br>${stop.city}<br><b>Visita #${index + 1} na rota</b>`;

      if (index === 0) {
        icon = goldIcon;
        popupText = `<b>${stop.name}</b><br>Ponto de Partida`;
      }
      
      if (stop.visitDate && index > 0) {
          popupText += `<br>Data: ${format(new Date(stop.visitDate), 'dd/MM/yyyy')}`;
      }

      L.marker([stop.lat, stop.lng], { icon })
        .bindPopup(popupText)
        .addTo(layersRef.current);
    });

    if (routeStops.length > 1) {
      const latLngs = routeStops.map(stop => L.latLng(stop.lat, stop.lng));
      L.polyline(latLngs, { color: 'hsl(var(--primary))', weight: 3 }).addTo(layersRef.current);
    }
    
    const locations = routeStops.length > 0 ? routeStops : allStores;
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      map.setView([-22.8, -47.2], 9);
    }
  }, [allStores, routeStops]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
}
