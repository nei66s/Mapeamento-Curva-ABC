'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Incident } from '@/lib/types';

// Importa as imagens dos marcadores
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface IncidentMapProps {
  incidents: Incident[];
}

// Cria uma instância de ícone explícita para evitar problemas com a configuração global
const defaultIcon = L.icon({
    iconRetinaUrl: iconRetinaUrl.src,
    iconUrl: iconUrl.src,
    shadowUrl: shadowUrl.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});


export default function IncidentMap({ incidents }: IncidentMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Garante que o código só rode no browser
    if (!mapContainerRef.current) {
      return;
    }

    // Previne a reinicialização do mapa
    if (!mapRef.current) {
      const incidentsWithCoords = incidents.filter(
        incident => incident.lat != null && incident.lng != null && (incident.status === 'Aberto' || incident.status === 'Em Andamento')
      );

      const center: L.LatLngExpression =
        incidentsWithCoords.length > 0
          ? [incidentsWithCoords[0].lat!, incidentsWithCoords[0].lng!]
          : [-14.235, -51.9253];

      const map = L.map(mapContainerRef.current).setView(
        center,
        incidentsWithCoords.length > 0 ? 5 : 4
      );
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      incidentsWithCoords.forEach(incident => {
        L.marker([incident.lat!, incident.lng!], { icon: defaultIcon }) // Usa a instância de ícone explícita
          .addTo(map)
          .bindPopup(`<b>${incident.itemName}</b><br>${incident.location}`);
      });
    }

    // Função de limpeza para destruir o mapa quando o componente for desmontado
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
