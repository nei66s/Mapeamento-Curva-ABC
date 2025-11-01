'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Incident } from '@/lib/types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Solução para o ícone padrão do Leaflet não aparecer corretamente no Next.js
// Esta configuração é necessária para evitar problemas com o StrictMode e o hot-reloading.
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

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

function IncidentMap({ incidents }: IncidentMapProps) {
  const incidentsWithCoords = incidents.filter(
    incident => incident.lat != null && incident.lng != null && (incident.status === 'Aberto' || incident.status === 'Em Andamento')
  );

  // Calcula o centro do mapa
  const center: [number, number] =
    incidentsWithCoords.length > 0
      ? [incidentsWithCoords[0].lat!, incidentsWithCoords[0].lng!]
      : [-14.235, -51.9253]; // Centro do Brasil

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

export default IncidentMap;
