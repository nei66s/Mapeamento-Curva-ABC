
'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical, Warehouse, Route as RouteIcon, Clock } from 'lucide-react';
import { allStores } from '@/lib/mock-data';
import { mockTeams } from '@/lib/teams';
import type { Store, Team, RouteStop } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

const RoutingMap = dynamic(() => import('@/components/dashboard/routing/routing-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

function SortableStoreItem({ stop }: { stop: RouteStop }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: stop.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-2 rounded-md border bg-background">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab h-8 w-8">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
        </Button>
        <div>
            <p className="font-semibold">{stop.name}</p>
            <p className="text-sm text-muted-foreground">{stop.city}</p>
        </div>
      </div>
    </div>
  );
}

const StartPointItem = ({ stop }: { stop: RouteStop }) => (
    <div className="flex items-center justify-between p-2 rounded-md border bg-primary/10 border-primary">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center"><Warehouse className="h-5 w-5 text-primary" /></div>
        <div>
            <p className="font-semibold text-primary">{stop.name}</p>
            <p className="text-sm text-muted-foreground">Ponto de Partida</p>
        </div>
      </div>
    </div>
);

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

const calculateTravelTime = (distance: number): number => {
    const AVERAGE_SPEED_KMH = 50;
    return (distance / AVERAGE_SPEED_KMH) * 60; // Return in minutes
};

function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h > 0) {
        return `${h}h ${m}min`;
    }
    return `${m} min`;
}


export default function RoutingPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [startPoint, setStartPoint] = useState<Store | null>(null);
  const [storesToVisit, setStoresToVisit] = useState<RouteStop[]>([]);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const availableStores = useMemo(() => {
    const storesInRouteIds = new Set([...storesToVisit.map(s => s.id), startPoint?.id]);
    return allStores.filter(s => !storesInRouteIds.has(s.id)).sort((a,b) => a.name.localeCompare(b.name));
  }, [storesToVisit, startPoint]);
  
  const fullRouteForMap = useMemo(() => {
    if (!startPoint) return [];
    
    const combinedStops: (Store | RouteStop)[] = [
        {...startPoint, visitOrder: -1}, 
        ...storesToVisit
    ];

    const sortedStops = combinedStops.sort((a, b) => (a as RouteStop).visitOrder - (b as RouteStop).visitOrder);

    const stopsWithLegData: RouteStop[] = sortedStops.map((stop, index) => {
        let distanceToNext = 0;
        let timeToNext = 0;
        if (index < sortedStops.length - 1) {
            const nextStop = sortedStops[index+1];
            distanceToNext = haversineDistance(stop, nextStop);
            timeToNext = calculateTravelTime(distanceToNext);
        }
        return {
            ...(stop as RouteStop),
            distanceToNext,
            timeToNext
        };
    });

    return stopsWithLegData;
  }, [startPoint, storesToVisit]);
  
  const routeSummary = useMemo(() => {
    const totalDistance = fullRouteForMap.reduce((acc, stop) => acc + (stop.distanceToNext || 0), 0);
    const totalTime = fullRouteForMap.reduce((acc, stop) => acc + (stop.timeToNext || 0), 0);
    return { totalDistance, totalTime };
  }, [fullRouteForMap]);


  const handleSetStartPoint = (storeId: string) => {
    const store = allStores.find(s => s.id === storeId);
    if(store) {
        setStartPoint(store);
    }
  }

  const addStoreToRoute = (storeId: string) => {
    const store = availableStores.find(s => s.id === storeId);
    if (store) {
      setStoresToVisit(prev => [...prev, { ...store, visitOrder: prev.length }]);
    }
  };
  
  const removeStoreFromRoute = (storeId: string) => {
    setStoresToVisit(prev => prev.filter(s => s.id !== storeId).map((s, i) => ({ ...s, visitOrder: i })));
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const {active, over} = event;

    if (over && active.id !== over.id) {
      setStoresToVisit((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        return newOrder.map((item, index) => ({...item, visitOrder: index}));
      });
    }
  }, []);
  
  const selectedTeam = useMemo(() => mockTeams.find(t => t.id === selectedTeamId), [selectedTeamId]);
  

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Roteirização de Equipes"
        description="Planeje as rotas de manutenção preventiva para suas equipes internas."
      />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
            <Card>
                 <CardHeader>
                    <CardTitle>1. Selecione a Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={setSelectedTeamId} value={selectedTeamId || ''}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma equipe" />
                        </SelectTrigger>
                        <SelectContent>
                            {mockTeams.map(team => (
                                <SelectItem key={team.id} value={team.id}>
                                    {team.name} ({team.region})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>2. Ponto de Partida</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={handleSetStartPoint} value={startPoint?.id || ''}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o ponto de partida..." />
                        </SelectTrigger>
                        <SelectContent>
                            {allStores.map(store => (
                                <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>3. Adicionar Lojas para Visitar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Select onValueChange={addStoreToRoute} value="" disabled={!startPoint}>
                             <SelectTrigger>
                                <SelectValue placeholder="Adicionar uma loja à rota..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableStores.map(store => (
                                    <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>4. Sequência e Resumo da Rota</CardTitle>
                    <CardDescription>Ordene os destinos e veja o resumo.</CardDescription>
                </CardHeader>
                <CardContent>
                    {routeSummary.totalDistance > 0 && (
                      <Alert className="mb-4">
                        <AlertTitle className="flex items-center gap-2">
                            Resumo da Rota
                        </AlertTitle>
                        <AlertDescription className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                           <span className="flex items-center gap-2 font-medium">
                            <RouteIcon className="h-4 w-4" />
                            Distância Total:
                           </span>
                           <span className="text-right font-semibold">{routeSummary.totalDistance.toFixed(2)} km</span>
                           <span className="flex items-center gap-2 font-medium">
                            <Clock className="h-4 w-4" />
                            Tempo de Viagem:
                           </span>
                           <span className="text-right font-semibold">{formatDuration(routeSummary.totalTime)}</span>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <ScrollArea className="h-64 pr-4">
                       <div className="space-y-3">
                        {startPoint && <StartPointItem stop={{...startPoint, visitOrder: -1}} />}
                        
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={storesToVisit.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                
                                    {storesToVisit.map((stop) => (
                                      <div key={stop.id} className="flex items-center gap-2">
                                        <SortableStoreItem stop={stop} />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeStoreFromRoute(stop.id)}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                
                            </SortableContext>
                        </DndContext>
                       </div>
                    </ScrollArea>
                    {!startPoint && (
                        <p className="text-sm text-muted-foreground text-center py-8">Selecione um ponto de partida para começar.</p>
                    )}
                    {startPoint && storesToVisit.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma loja de destino. Adicione lojas para continuar.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
           <Card className="h-[720px]">
                <CardContent className="p-0 h-full">
                    <RoutingMap allStores={allStores} routeStops={fullRouteForMap} />
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
