'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { IncidentForm } from '@/components/dashboard/incidents/incident-form';
import { mockIncidents, mockItems } from '@/lib/mock-data';
import type { Item, Incident } from '@/lib/types';
import { PlusCircle, Clock, Sparkles } from 'lucide-react';
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


export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {incidents.map(incident => (
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
