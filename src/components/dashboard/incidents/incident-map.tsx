'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Incident } from '@/lib/types';

interface IncidentMapProps {
  incidents: Incident[];
}

export default function IncidentMap({ incidents }: IncidentMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) {
      return;
    }
    
    // Este hack corrige o problema do ícone não encontrado no Next.js
    // Ele força o Leaflet a usar o estilo CSS padrão em vez de tentar carregar uma imagem.
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    const incidentsWithCoords = incidents.filter(
      incident => incident.lat != null && incident.lng != null && (incident.status === 'Aberto' || incident.status === 'Em Andamento')
    );

    // Só inicializa o mapa se ele ainda não foi criado
    if (!mapRef.current) {
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
            L.marker([incident.lat!, incident.lng!])
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
