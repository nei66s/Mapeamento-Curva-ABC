'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Incident } from '@/lib/types';

// Solução para o ícone padrão do Leaflet não aparecer corretamente no Next.js
const DefaultIcon = L.icon({
    iconRetinaUrl: iconRetinaUrl.src,
    iconUrl: iconUrl.src,
    shadowUrl: shadowUrl.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface IncidentMapProps {
  incidents: Incident[];
}

export default function IncidentMap({ incidents }: IncidentMapProps) {
  const Map = useMemo(
    () =>
      dynamic(
        () => import('@/components/dashboard/incidents/map'),
        {
          loading: () => <p>A map is loading</p>,
          ssr: false,
        }
      ),
    []
  );

  return <Map incidents={incidents} />;
}
