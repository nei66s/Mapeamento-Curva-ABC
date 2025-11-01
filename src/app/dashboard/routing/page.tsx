
'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical, Sparkles, Warehouse } from 'lucide-react';
import { allStores } from '@/lib/mock-data';
import { mockTeams } from '@/lib/teams';
import type { Store, Team, RouteStop } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { optimizeRoute, type RouteOptimizerOutput } from '@/ai/flows/route-optimizer-flow';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const RoutingMap = dynamic(() => import('@/components/dashboard/routing/routing-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-[640px] w-full" />,
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
       {stop.visitDate && (
        <div className="text-sm font-medium text-muted-foreground pr-2">
          {format(new Date(stop.visitDate), 'dd/MM')}
        </div>
      )}
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


export default function RoutingPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [startPoint, setStartPoint] = useState<Store | null>(null);
  const [storesToVisit, setStoresToVisit] = useState<RouteStop[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<RouteOptimizerOutput | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());

  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const availableStores = useMemo(() => {
    const storesInRouteIds = new Set([...storesToVisit.map(s => s.id), startPoint?.id]);
    return allStores.filter(s => !storesInRouteIds.has(s.id)).sort((a,b) => a.name.localeCompare(b.name));
  }, [storesToVisit, startPoint]);


  const handleSetStartPoint = (storeId: string) => {
    const store = allStores.find(s => s.id === storeId);
    if(store) {
        setStartPoint(store);
        setOptimizationResult(null);
    }
  }

  const addStoreToRoute = (storeId: string) => {
    const store = availableStores.find(s => s.id === storeId);
    if (store) {
      setStoresToVisit(prev => [...prev, { ...store, visitOrder: prev.length }]);
      setOptimizationResult(null);
    }
  };
  
  const removeStoreFromRoute = (storeId: string) => {
    setStoresToVisit(prev => prev.filter(s => s.id !== storeId).map((s, i) => ({ ...s, visitOrder: i })));
    setOptimizationResult(null);
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
      setOptimizationResult(null);
    }
  }, []);

  const handleOptimizeRoute = async () => {
    if (!startPoint) {
      toast({ variant: 'destructive', title: 'Ponto de Partida necessário', description: 'Selecione um ponto de partida antes de otimizar.' });
      return;
    }
    if (storesToVisit.length === 0) {
        toast({ variant: 'destructive', title: 'Nenhuma loja para visitar', description: 'Adicione pelo menos uma loja para otimizar a rota.' });
        return;
    }
    
    setIsOptimizing(true);
    setOptimizationResult(null);

    const storesForApi = [startPoint, ...storesToVisit];

    try {
      const response = await optimizeRoute({ 
          stores: storesForApi,
          startDate: startDate?.toISOString() ?? new Date().toISOString(),
      });
      
      const storeVisitMap = new Map(storesForApi.map(s => [s.id, s]));
      const validOptimizedRoute = response.optimizedRoute.filter(stop => storeVisitMap.has(stop.storeId));
      
      // First item is start point, should not have a visit date
      const startPointId = validOptimizedRoute[0]?.storeId;

      const reorderedStops = validOptimizedRoute
        .slice(1) // Remove start point from optimized list
        .map((stop, index) => {
            const storeDetails = storeVisitMap.get(stop.storeId)!;
            return { ...storeDetails, visitOrder: index, visitDate: stop.visitDate };
        });
      
      if(startPointId !== startPoint.id){
         toast({ variant: 'destructive', title: 'Erro de Otimização', description: 'A IA não retornou o ponto de partida correto. Tente novamente.' });
      } else {
        setStoresToVisit(reorderedStops);
        setOptimizationResult(response);
        toast({
          title: 'Rota Otimizada!',
          description: `A rota foi otimizada com sucesso pela IA.`,
        });
      }
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
  
  const fullRouteForMap = useMemo(() => {
    if (!startPoint) return [];
    return [{...startPoint, visitOrder: -1}, ...storesToVisit]
  }, [startPoint, storesToVisit]);

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
                    <CardTitle>1. Selecione a Equipe e Data</CardTitle>
                    <CardDescription>Escolha a equipe e a data de início da rota.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
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
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'justify-start text-left font-normal',
                                !startDate && 'text-muted-foreground'
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, 'PPP', { locale: ptBR }) : <span>Data de início</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            locale={ptBR}
                            />
                        </PopoverContent>
                    </Popover>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>2. Selecione o Ponto de Partida</CardTitle>
                    <CardDescription>Escolha a loja que servirá como ponto de início da rota.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={handleSetStartPoint} value={startPoint?.id || ''}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o ponto de partida..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={startPoint?.id || ''} disabled={!startPoint}>{startPoint?.name}</SelectItem>
                            {availableStores.map(store => (
                                <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>3. Adicionar Lojas para Visitar</CardTitle>
                    <CardDescription>Adicione os destinos que devem ser visitados a partir do ponto de partida.</CardDescription>
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
                    <CardTitle>4. Sequência de Visitas</CardTitle>
                    <CardDescription>Ordene os destinos ou use a IA para otimizar a rota e as datas.</CardDescription>
                </CardHeader>
                <CardContent>
                    {startPoint && (
                      <div className="flex items-center justify-between mb-4">
                        <Button 
                            onClick={handleOptimizeRoute} 
                            disabled={isOptimizing || storesToVisit.length === 0 || !startDate}
                            className='flex gap-2'
                        >
                            <Sparkles />
                            {isOptimizing ? 'Otimizando...' : 'Otimizar Rota com IA'}
                        </Button>
                      </div>
                    )}
                    
                    {optimizationResult && (
                      <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Rota Otimizada</AlertTitle>
                        <AlertDescription>
                           Distância total estimada: <b>{optimizationResult.totalDistance.toFixed(2)} km</b>. As datas foram sugeridas.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <ScrollArea className="h-64 pr-4">
                       <div className="space-y-3">
                        {startPoint && <StartPointItem stop={startPoint} />}
                        
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
           <Card className="min-h-[720px] flex flex-col">
             <CardHeader>
              <CardTitle>Visão Geral do Mapa</CardTitle>
              <CardDescription>Visualize a rota planejada no mapa.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <RoutingMap allStores={allStores} routeStops={fullRouteForMap} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
