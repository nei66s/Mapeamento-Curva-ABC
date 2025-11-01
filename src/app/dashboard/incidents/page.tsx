'use client';

import { useState, useMemo } from 'react';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { IncidentForm } from '@/components/dashboard/incidents/incident-form';
import { mockIncidents, mockItems } from '@/lib/mock-data';
import type { Item, Incident, Classification, IncidentStatus } from '@/lib/types';
import { PlusCircle, Clock, Sparkles, Search, ListFilter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IncidentAnalysis } from '@/components/dashboard/incidents/incident-analysis';

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
    });
  }, [incidents, searchTerm, statusFilters, classificationFilters, itemsMap]);

  const handleFormSubmit = (values: Omit<Incident, 'id' | 'openedAt' | 'status'|'lat'|'lng'>) => {
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
    setIsFormOpen(false);
  };

  const handleAnalysisClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsAnalysisOpen(true);
  }

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
            <Button className="flex gap-2">
              <PlusCircle />
              Registrar Incidente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Novo Incidente</DialogTitle>
            </DialogHeader>
            <IncidentForm
              items={mockItems}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <div>
            <CardTitle>Lista de Incidentes</CardTitle>
            <CardDescription>{filteredIncidents.length} incidentes encontrados.</CardDescription>
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
                    <CardTitle className="text-lg">{incident.itemName}</CardTitle>
                     <Badge variant={statusVariantMap[incident.status]}>
                        {incident.status}
                    </Badge>
                  </div>
                  <CardDescription>{incident.location}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {incident.description}
                  </p>
                    <Button variant="outline" size="sm" onClick={() => handleAnalysisClick(incident)}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Análise com IA
                    </Button>
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
