
'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PlusCircle, Trash2, GripVertical, Sparkles, AlertCircle } from 'lucide-react';
import { allStores } from '@/lib/mock-data';
import { mockTeams } from '@/lib/teams';
import type { Store, Team, RouteStop } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { optimizeRoute } from '@/ai/flows/route-optimizer-flow';
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
            <p className="font-semibold text-primary">{stop.name}</p>
            <p className="text-sm text-muted-foreground">{stop.city}</p>
        </div>
      </div>
    </div>
  );
}


export default function RoutingPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [storesToVisit, setStoresToVisit] = useState<RouteStop[]>([]);
  const [availableStores, setAvailableStores] = useState<Store[]>(allStores);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedDistance, setOptimizedDistance] = useState<number | null>(null);

  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const addStoreToRoute = (storeId: string) => {
    const store = availableStores.find(s => s.id === storeId);
    if (store) {
      setStoresToVisit(prev => [...prev, { ...store, visitOrder: prev.length + 1 }]);
      setAvailableStores(prev => prev.filter(s => s.id !== storeId));
    }
  };
  
  const removeStoreFromRoute = (storeId: string) => {
    const store = storesToVisit.find(s => s.id === storeId);
    if(store) {
        setStoresToVisit(prev => prev.filter(s => s.id !== storeId));
        // Add back to available stores, keeping original sorting
        setAvailableStores(prev => [...prev, allStores.find(s => s.id === storeId)!].sort((a,b) => a.name.localeCompare(b.name)));
    }
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const {active, over} = event;

    if (over && active.id !== over.id) {
      setStoresToVisit((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        return newOrder.map((item, index) => ({...item, visitOrder: index + 1}));
      });
    }
  }, []);

  const handleOptimizeRoute = async () => {
    if (storesToVisit.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Não é possível otimizar',
        description: 'Adicione pelo menos duas lojas à rota para otimização.',
      });
      return;
    }
    setIsOptimizing(true);
    setOptimizedDistance(null);
    try {
      const response = await optimizeRoute({ stores: storesToVisit });
      
      const reorderedStops = response.optimizedRoute.map((storeId, index) => {
          const store = storesToVisit.find(s => s.id === storeId)!;
          return { ...store, visitOrder: index + 1 };
      });
      
      setStoresToVisit(reorderedStops);
      setOptimizedDistance(response.totalDistance);

      toast({
        title: 'Rota Otimizada!',
        description: `A rota foi otimizada com sucesso pela IA. Distância total: ${response.totalDistance.toFixed(2)} km.`,
      });
    } catch (error) {
      console.error("Error optimizing route:", error);
      toast({
        variant: 'destructive',
        title: 'Erro na Otimização',
        description: 'Não foi possível otimizar a rota. Tente novamente.',
      });
    } finally {
      setIsOptimizing(false);
    }
  };
  
  const selectedTeam = useMemo(() => mockTeams.find(t => t.id === selectedTeamId), [selectedTeamId]);


  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Roteirização de Equipes"
        description="Planeje e otimize as rotas de manutenção preventiva para suas equipes internas."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 flex flex-col gap-8">
            <Card>
                 <CardHeader>
                    <CardTitle>1. Selecione a Equipe</CardTitle>
                    <CardDescription>Escolha a equipe que fará a rota de visitas.</CardDescription>
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
                    <CardTitle>2. Monte a Rota</CardTitle>
                    <CardDescription>Adicione as lojas que devem ser visitadas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Select onValueChange={addStoreToRoute} value="" disabled={!selectedTeamId}>
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
                    <CardTitle>3. Rota do Mês</CardTitle>
                    <CardDescription>Ordene as visitas. A primeira da lista é a primeira a ser visitada.</CardDescription>
                </CardHeader>
                <CardContent>
                    {storesToVisit.length > 0 && (
                      <div className="flex items-center justify-between mb-4">
                        <Button 
                            onClick={handleOptimizeRoute} 
                            disabled={isOptimizing || storesToVisit.length < 2}
                            className='flex gap-2'
                        >
                            <Sparkles />
                            {isOptimizing ? 'Otimizando...' : 'Otimizar Rota com IA'}
                        </Button>
                      </div>
                    )}
                    
                    {optimizedDistance !== null && (
                      <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Rota Otimizada</AlertTitle>
                        <AlertDescription>
                           Distância total estimada: <b>{optimizedDistance.toFixed(2)} km</b>.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <ScrollArea className="h-64 pr-4">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={storesToVisit.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-3">
                                    {storesToVisit.map(stop => (
                                      <div key={stop.id} className="flex items-center gap-2">
                                        <SortableStoreItem stop={stop} />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeStoreFromRoute(stop.id)}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </ScrollArea>
                    {storesToVisit.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma loja na rota. Adicione lojas para começar.</p>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
           <Card className="h-full min-h-[600px]">
             <CardHeader>
              <CardTitle>Visão Geral do Mapa</CardTitle>
              <CardDescription>Visualize a rota planejada no mapa.</CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)]">
              <RoutingMap allStores={allStores} routeStops={storesToVisit} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
