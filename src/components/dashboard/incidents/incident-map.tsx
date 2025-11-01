'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Incident } from '@/lib/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon not showing up
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl.src,
    iconUrl: iconUrl.src,
    shadowUrl: shadowUrl.src,
  });
}


interface IncidentMapProps {
  incidents: Incident[];
}

export const IncidentMap = ({ incidents }: IncidentMapProps) => {
  const incidentsWithCoords = incidents.filter(
    incident => incident.lat != null && incident.lng != null && (incident.status === 'Aberto' || incident.status === 'Em Andamento')
  );

  // Calculate center of map
  const center: [number, number] =
    incidentsWithCoords.length > 0
      ? [incidentsWithCoords[0].lat!, incidentsWithCoords[0].lng!]
      : [-14.235, -51.9253]; // Brazil center

  return (
    <MapContainer
      center={center}
      zoom={incidentsWithCoords.length > 0 ? 5 : 4}
      scrollWheelZoom={false}
      style={{ height: '400px', width: '100%', borderRadius: 'var(--radius)' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {incidentsWithCoords.map(incident => (
        <Marker key={incident.id} position={[incident.lat!, incident.lng!]}>
          <Popup>
            <b>{incident.itemName}</b>
            <br />
            {incident.location}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
