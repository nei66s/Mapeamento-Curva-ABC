'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, User, Wrench, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockPreventiveVisits, mockItems } from '@/lib/mock-data';
import type { PreventiveVisit } from '@/lib/types';
import { PreventiveVisitForm } from '@/components/dashboard/preventive/preventive-visit-form';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function PreventivePage() {
  const [visits, setVisits] = useState<PreventiveVisit[]>(mockPreventiveVisits);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const selectedDayVisits = date
    ? visits.filter(
        visit => format(new Date(visit.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
    : [];

  const handleFormSubmit = (values: Omit<PreventiveVisit, 'id'>) => {
    const newVisit: PreventiveVisit = {
      ...values,
      id: `VISIT-${Date.now()}`,
    };
    setVisits([newVisit, ...visits]);
    toast({
      title: 'Visita Agendada!',
      description: `Manutenção preventiva agendada para ${values.supplierName}.`,
    });
    setIsFormOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Plano de Manutenção Preventiva"
        description="Gerencie e acompanhe as visitas de manutenção programadas."
      >
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex gap-2">
              <PlusCircle />
              Agendar Visita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agendar Nova Visita Preventiva</DialogTitle>
            </DialogHeader>
            <PreventiveVisitForm
              items={mockItems}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendário de Visitas</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border p-4"
              locale={ptBR}
              modifiers={{
                scheduled: visits.map(v => new Date(v.date)),
              }}
              modifiersStyles={{
                scheduled: {
                  color: 'hsl(var(--primary-foreground))',
                  backgroundColor: 'hsl(var(--primary))',
                },
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Visitas para {date ? format(date, 'PPP', { locale: ptBR }) : 'Nenhum dia selecionado'}
            </CardTitle>
            <CardDescription>
              {selectedDayVisits.length > 0
                ? `${selectedDayVisits.length} visita(s) encontrada(s).`
                : 'Nenhuma visita agendada para este dia.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDayVisits.length > 0 ? (
              <div className="space-y-4">
                {selectedDayVisits.map(visit => (
                  <div key={visit.id} className="rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        {visit.supplierName}
                      </h3>
                      <Badge variant={visit.status === 'Concluída' ? 'success' : 'default'}>
                        {visit.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Itens: {visit.items.join(', ')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-start gap-2">
                        <CalendarIcon className="h-4 w-4 mt-0.5" />
                        <span>Notas: {visit.notes}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <CheckCircle className="mx-auto h-12 w-12" />
                <p className="mt-4">Nenhuma manutenção para hoje. Aproveite o dia!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
