'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { allStores } from '@/lib/mock-data';
import { mockTeams } from '@/lib/teams';
import type { Store, Team, RouteStop } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const RoutingMap = dynamic(() => import('@/components/dashboard/routing/routing-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

function SortableRouteItem({ stop }: { stop: RouteStop }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-3 mb-2 flex items-center justify-between bg-background rounded-lg border cursor-grab active:cursor-grabbing">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
          {stop.visitOrder}
        </div>
        <div>
          <p className="font-semibold">{stop.name}</p>
          <p className="text-sm text-muted-foreground">{stop.city}</p>
        </div>
      </div>
    </div>
  );
}

export default function RoutingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(mockTeams[0]?.id || null);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const { toast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor));

  const availableStores = useMemo(() => {
    const routeStoreIds = new Set(routeStops.map(stop => stop.id));
    return allStores.filter(store => !routeStoreIds.has(store.id));
  }, [routeStops]);

  const handleAddStoreToRoute = (storeId: string) => {
    const storeToAdd = allStores.find(s => s.id === storeId);
    if (storeToAdd) {
      const newStop: RouteStop = {
        ...storeToAdd,
        visitOrder: routeStops.length + 1,
      };
      setRouteStops(prev => [...prev, newStop]);
      toast({
        title: 'Loja Adicionada à Rota',
        description: `${storeToAdd.name} foi adicionada ao roteiro.`,
      });
    }
  };

  const handleRemoveStoreFromRoute = (storeId: string) => {
    const storeToRemove = routeStops.find(s => s.id === storeId);
     if (storeToRemove) {
      setRouteStops(prev => 
        prev.filter(s => s.id !== storeId)
            .map((stop, index) => ({ ...stop, visitOrder: index + 1 }))
      );
      toast({
        variant: 'destructive',
        title: 'Loja Removida da Rota',
        description: `${storeToRemove.name} foi removida do roteiro.`,
      });
    }
  };
  
  const handleDragEnd = (event: any) => {
    const {active, over} = event;
    
    if (active.id !== over.id) {
      setRouteStops((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        return newArray.map((item, index) => ({...item, visitOrder: index + 1}));
      });
    }
  };

  const selectedTeam = mockTeams.find(t => t.id === selectedTeamId);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Roteirização de Equipes"
        description="Planeje e otimize as rotas de manutenção preventiva para suas equipes internas."
      />

      <Card>
        <CardHeader>
          <CardTitle>Controles de Roteirização</CardTitle>
          <CardDescription>Selecione a data e a equipe para montar o roteiro de visitas.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Data da Rota</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn('w-full justify-start text-left font-normal mt-2', !selectedDate && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Equipe Responsável</label>
            <Select value={selectedTeamId || ''} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="mt-2">
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
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Mapa de Lojas</CardTitle>
              <CardDescription>Visualize todas as lojas e as que estão na rota atual.</CardDescription>
            </CardHeader>
            <CardContent>
              <RoutingMap allStores={allStores} routeStops={routeStops} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-rows-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Lojas Disponíveis</CardTitle>
              <CardDescription>Adicione lojas à rota da equipe.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                {availableStores.map(store => (
                  <div key={store.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                    <div>
                      <p className="font-medium text-sm">{store.name}</p>
                      <p className="text-xs text-muted-foreground">{store.city}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleAddStoreToRoute(store.id)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rota do Dia</CardTitle>
               {selectedTeam && <CardDescription>Para a equipe <span className='font-semibold text-primary'>{selectedTeam.name}</span></CardDescription>}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={routeStops} strategy={verticalListSortingStrategy}>
                    {routeStops.length > 0 ? (
                      routeStops.map(stop => (
                        <div key={stop.id} className="relative group">
                          <SortableRouteItem stop={stop} />
                           <Button 
                              variant="ghost" 
                              size="icon"
                              className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-destructive/70 opacity-0 group-hover:opacity-100"
                              onClick={() => handleRemoveStoreFromRoute(stop.id)}
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        Nenhuma loja na rota. Adicione lojas da lista ao lado.
                      </div>
                    )}
                  </SortableContext>
                </DndContext>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
