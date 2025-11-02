
'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { IncidentForm } from '@/components/dashboard/incidents/incident-form';
import { mockIncidents, mockItems, allStores } from '@/lib/mock-data';
import type { Item, WorkOrder, Classification, WorkOrderStatus } from '@/lib/types';
import { PlusCircle, Clock, Sparkles, Search, ListFilter, MoreVertical, Pencil, Tag, Hourglass, CalendarCheck, CheckCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IncidentAnalysis } from '@/components/dashboard/incidents/incident-analysis';
import { Skeleton } from '@/components/ui/skeleton';

const statusVariantMap: Record<WorkOrderStatus, 'destructive' | 'accent' | 'success' | 'default' | 'secondary' | 'outline'> = {
  'Aberta': 'destructive',
  'Em Andamento': 'accent',
  'Aguardando Peças': 'secondary',
  'Agendada': 'outline',
  'Concluída': 'success',
  'Validada': 'default',
};

const allStatuses: WorkOrderStatus[] = ['Aberta', 'Em Andamento', 'Aguardando Peças', 'Agendada', 'Concluída', 'Validada'];
const allClassifications: Classification[] = ['A', 'B', 'C'];


export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<WorkOrder[]>(mockIncidents);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const [selectedIncident, setSelectedIncident] = useState<WorkOrder | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<WorkOrderStatus>>(new Set());
  const [classificationFilters, setClassificationFilters] = useState<Set<Classification>>(new Set());

  const itemsMap = useMemo(() => new Map(mockItems.map(item => [item.name, item])), []);
  
  const IncidentMap = useMemo(() => dynamic(() => import('@/components/dashboard/incidents/incident-map'), {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
  }), []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const item = itemsMap.get(incident.itemName);
      
      const searchMatch = searchTerm === '' ||
        incident.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilters.size === 0 || statusFilters.has(incident.status);
      
      const classificationMatch = classificationFilters.size === 0 || (item && classificationFilters.has(item.classification));

      return searchMatch && statusMatch && classificationMatch;
    }).sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
  }, [incidents, searchTerm, statusFilters, classificationFilters, itemsMap]);

  const handleFormSubmit = (values: Omit<WorkOrder, 'id' | 'openedAt' | 'status'|'lat'|'lng'>) => {
    const store = allStores.find(s => s.name === values.location);

    if (selectedIncident) {
      const updatedIncident = { 
        ...selectedIncident, 
        ...values,
        lat: store?.lat || selectedIncident.lat,
        lng: store?.lng || selectedIncident.lng,
      };
      setIncidents(incidents.map(inc => inc.id === selectedIncident.id ? updatedIncident : inc));
      toast({
        title: 'Ordem de Serviço Atualizada!',
        description: `A O.S. para o item "${values.itemName}" foi atualizada.`,
      });
    } else {
      const newIncident: WorkOrder = {
        ...values,
        id: `INC-${Date.now()}`,
        openedAt: new Date().toISOString(),
        status: 'Aberta',
        lat: store?.lat || 0,
        lng: store?.lng || 0,
      };
      setIncidents([newIncident, ...incidents]);
      toast({
        title: 'Ordem de Serviço Registrada!',
        description: `A O.S. para o item "${values.itemName}" foi aberta.`,
      });
    }
    
    setIsFormOpen(false);
    setSelectedIncident(null);
  };
  
  const openEditDialog = (incident: WorkOrder) => {
    setSelectedIncident(incident);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    setSelectedIncident(null);
    setIsFormOpen(true);
  }

  const handleAnalysisClick = (incident: WorkOrder) => {
    setSelectedIncident(incident);
    setIsAnalysisOpen(true);
  }
  
  const handleChangeStatus = (incidentId: string, newStatus: WorkOrderStatus) => {
    setIncidents(incidents.map(inc => inc.id === incidentId ? { ...inc, status: newStatus } : inc));
    toast({
      title: 'Status Atualizado!',
      description: `O status da O.S. foi alterado para "${newStatus}".`,
    });
  };

  const toggleFilter = <T,>(set: Set<T>, value: T) => {
    const newSet = new Set(set);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    return newSet;
  };

  const getStatusIcon = (status: WorkOrderStatus) => {
    switch(status) {
        case 'Aguardando Peças': return <Hourglass className="mr-2 h-4 w-4" />;
        case 'Agendada': return <CalendarCheck className="mr-2 h-4 w-4" />;
        case 'Concluída': return <CheckCheck className="mr-2 h-4 w-4" />;
        case 'Validada': return <CheckCheck className="mr-2 h-4 w-4" />;
        default: return <Sparkles className="mr-2 h-4 w-4" />;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ordens de Serviço"
        description="Gerencie e acompanhe o ciclo de vida das ordens de serviço."
      >
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="flex gap-2">
              <PlusCircle />
              Abrir O.S.
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedIncident ? 'Editar Ordem de Serviço' : 'Abrir Nova Ordem de Serviço'}</DialogTitle>
            </DialogHeader>
            <IncidentForm
              items={mockItems}
              incident={selectedIncident}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <Card>
        <CardHeader>
            <CardTitle>Mapa de Lojas e Ordens de Serviço</CardTitle>
            <CardDescription>Visualização geográfica de todas as lojas e O.S. ativas.</CardDescription>
        </CardHeader>
        <CardContent>
            <IncidentMap incidents={filteredIncidents} />
        </CardContent>
      </Card>


      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div>
                <CardTitle>Lista de Ordens de Serviço</CardTitle>
                <CardDescription>{filteredIncidents.length} O.S. encontradas.</CardDescription>
            </div>
             <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" /> Mock Data
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar O.S...."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filtros
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allStatuses.map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilters.has(status)}
                    onSelect={e => e.preventDefault()}
                    onCheckedChange={() => setStatusFilters(prev => toggleFilter(prev, status))}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar por Classificação</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {allClassifications.map(classification => (
                  <DropdownMenuCheckboxItem
                    key={classification}
                    checked={classificationFilters.has(classification)}
                    onSelect={e => e.preventDefault()}
                    onCheckedChange={() => setClassificationFilters(prev => toggleFilter(prev, classification))}
                  >
                    Curva {classification}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredIncidents.map(incident => (
              <Card key={incident.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{incident.itemName}</CardTitle>
                        <CardDescription>{incident.location}</CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEditDialog(incident)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar O.S.
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                     <Sparkles className="mr-2 h-4 w-4" />
                                    Alterar Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {allStatuses.map(status => (
                                        <DropdownMenuItem key={status} onSelect={() => handleChangeStatus(incident.id, status)} disabled={incident.status === status}>
                                            {getStatusIcon(status)}
                                            {status}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {incident.description}
                  </p>
                  <div className='flex items-center justify-between'>
                    <Button variant="outline" size="sm" onClick={() => handleAnalysisClick(incident)}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Análise com IA
                    </Button>
                     <Badge variant={statusVariantMap[incident.status]}>
                        {incident.status}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>
                      Aberta{' '}
                      {formatDistanceToNow(new Date(incident.openedAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
       <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Análise de O.S. com IA</DialogTitle>
            </DialogHeader>
           {selectedIncident && <IncidentAnalysis incident={selectedIncident} items={mockItems}/>}
          </DialogContent>
        </Dialog>
    </div>
  );
}
