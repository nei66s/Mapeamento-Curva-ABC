'use client';

import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Incident } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface IncidentMapProps {
  incidents: Incident[];
}

export default function IncidentMap({ incidents }: IncidentMapProps) {
  const Map = useMemo(
    () =>
      dynamic(() => import('@/components/dashboard/incidents/map'), {
        loading: () => <Skeleton className="h-full w-full" />,
        ssr: false,
      }),
    []
  );

  return <Map incidents={incidents} />;
}