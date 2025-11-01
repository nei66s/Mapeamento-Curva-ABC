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
import { mockIncidents, mockItems } from '@/lib/mock-data';
import type { Item, Incident, Classification, IncidentStatus } from '@/lib/types';
import { PlusCircle, Clock, Sparkles, Search, ListFilter, MoreVertical, Pencil, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IncidentAnalysis } from '@/components/dashboard/incidents/incident-analysis';
import { Skeleton } from '@/components/ui/skeleton';

const IncidentMap = dynamic(() =>
  import('@/components/dashboard/incidents/incident-map'),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" /> 
  }
);


const statusVariantMap: Record<Incident['status'], 'destructive' | 'accent' | 'success' | 'default'> = {
  Aberto: 'destructive',
  'Em Andamento': 'accent',
  Resolvido: 'success',
  Fechado: 'default',
};

const allStatuses: IncidentStatus[] = ['Aberto', 'Em Andamento', 'Resolvido', 'Fechado'];
const allClassifications: Classification[] = ['A', 'B', 'C'];


export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<IncidentStatus>>(new Set());
  const [classificationFilters, setClassificationFilters] = useState<Set<Classification>>(new Set());

  const itemsMap = useMemo(() => new Map(mockItems.map(item => [item.name, item])), []);

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

  const handleFormSubmit = (values: Omit<Incident, 'id' | 'openedAt' | 'status'|'lat'|'lng'>) => {
    if (selectedIncident) {
      const updatedIncident = { ...selectedIncident, ...values };
      setIncidents(incidents.map(inc => inc.id === selectedIncident.id ? updatedIncident : inc));
      toast({
        title: 'Incidente Atualizado!',
        description: `O incidente para o item "${values.itemName}" foi atualizado.`,
      });
    } else {
      const newIncident: Incident = {
        ...values,
        id: `INC-${Date.now()}`,
        openedAt: new Date().toISOString(),
        status: 'Aberto',
        lat: 0,
        lng: 0,
      };
      setIncidents([newIncident, ...incidents]);
      toast({
        title: 'Incidente Registrado!',
        description: `O incidente para o item "${values.itemName}" foi aberto.`,
      });
    }
    
    setIsFormOpen(false);
    setSelectedIncident(null);
  };
  
  const openEditDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    setSelectedIncident(null);
    setIsFormOpen(true);
  }

  const handleAnalysisClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsAnalysisOpen(true);
  }
  
  const handleChangeStatus = (incidentId: string, newStatus: IncidentStatus) => {
    setIncidents(incidents.map(inc => inc.id === incidentId ? { ...inc, status: newStatus } : inc));
    toast({
      title: 'Status Atualizado!',
      description: `O status do incidente foi alterado para "${newStatus}".`,
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

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Registro de Incidentes"
        description="Registre e acompanhe eventos específicos para análise futura."
      >
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="flex gap-2">
              <PlusCircle />
              Registrar Incidente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedIncident ? 'Editar Incidente' : 'Registrar Novo Incidente'}</DialogTitle>
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
            <CardTitle>Mapa de Incidentes</CardTitle>
            <CardDescription>Visualização geográfica dos incidentes abertos ou em andamento.</CardDescription>
        </CardHeader>
        <CardContent>
            <IncidentMap incidents={filteredIncidents} />
        </CardContent>
      </Card>


      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div>
                <CardTitle>Lista de Incidentes</CardTitle>
                <CardDescription>{filteredIncidents.length} incidentes encontrados.</CardDescription>
            </div>
             <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" /> Mock Data
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar incidentes..."
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
                                Editar Incidente
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                     <Sparkles className="mr-2 h-4 w-4" />
                                    Alterar Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {allStatuses.map(status => (
                                        <DropdownMenuItem key={status} onSelect={() => handleChangeStatus(incident.id, status)} disabled={incident.status === status}>
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
                      Aberto{' '}
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
              <DialogTitle>Análise de Incidente com IA</DialogTitle>
            </DialogHeader>
           {selectedIncident && <IncidentAnalysis incident={selectedIncident} items={mockItems}/>}
          </DialogContent>
        </Dialog>
    </div>
  );
}
