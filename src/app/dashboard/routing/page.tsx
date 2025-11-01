
'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { allStores } from '@/lib/mock-data';
import { mockTeams } from '@/lib/teams';
import type { Store, Team } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const RoutingMap = dynamic(() => import('@/components/dashboard/routing/routing-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

type Allocation = {
  id: string;
  date: Date;
  teamId: string;
  storeId: string;
};

const allocationSchema = z.object({
  teamId: z.string().min(1, 'É necessário selecionar uma equipe.'),
  storeId: z.string().min(1, 'É necessário selecionar uma loja.'),
});

type AllocationFormData = z.infer<typeof allocationSchema>;

function AllocationForm({
  onSubmit,
  onCancel,
  teams,
  stores,
  allocation,
}: {
  onSubmit: (data: AllocationFormData) => void;
  onCancel: () => void;
  teams: Team[];
  stores: Store[];
  allocation?: Allocation | null;
}) {
  const form = useForm<AllocationFormData>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      teamId: allocation?.teamId || '',
      storeId: allocation?.storeId || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="teamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipe</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma equipe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} ({team.region})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="storeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loja</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma loja" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Alocação</Button>
        </div>
      </form>
    </Form>
  );
}

export default function RoutingPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [displayDate, setDisplayDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const { toast } = useToast();

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const existingAllocation = allocations.find(
      alloc => format(alloc.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    setSelectedAllocation(existingAllocation || null);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = (data: AllocationFormData) => {
    if (!selectedDate) return;

    if (selectedAllocation) { // Editing existing allocation
      setAllocations(allocs => allocs.map(alloc => alloc.id === selectedAllocation.id ? { ...alloc, ...data } : alloc));
       toast({
        title: 'Alocação Atualizada!',
        description: `A equipe foi realocada para o dia ${format(selectedDate, 'dd/MM/yyyy')}.`,
      });
    } else { // Creating new allocation
       const newAllocation: Allocation = {
        id: `alloc-${Date.now()}`,
        date: selectedDate,
        ...data,
      };
      setAllocations(prev => [...prev, newAllocation]);
       toast({
        title: 'Equipe Alocada!',
        description: `Equipe alocada com sucesso para o dia ${format(selectedDate, 'dd/MM/yyyy')}.`,
      });
    }
    setIsFormOpen(false);
    setSelectedAllocation(null);
  };
  
  const handleDeleteAllocation = (allocationId: string) => {
    setAllocations(allocs => allocs.filter(a => a.id !== allocationId));
    toast({
      variant: 'destructive',
      title: 'Alocação Removida',
      description: 'A alocação da equipe para este dia foi removida.',
    });
  }

  const allocatedDates = useMemo(() => allocations.map(a => a.date), [allocations]);
  
  const monthlyAllocations = useMemo(() => {
    return allocations
      .filter(a => getMonth(a.date) === getMonth(displayDate) && getYear(a.date) === getYear(displayDate))
      .sort((a,b) => a.date.getTime() - b.date.getTime());
  }, [allocations, displayDate]);
  
  const allocatedStores = useMemo(() => {
    const storeIds = new Set(monthlyAllocations.map(a => a.storeId));
    return allStores.filter(s => storeIds.has(s.id));
  },[monthlyAllocations]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Roteirização de Equipes"
        description="Planeje e otimize as rotas de manutenção preventiva para suas equipes internas."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <Card className="h-full min-h-[600px]">
             <CardHeader>
              <CardTitle>Agenda Mensal de Alocação</CardTitle>
              <CardDescription>Clique em um dia para alocar uma equipe a uma loja.</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                onDayClick={handleDayClick}
                month={displayDate}
                onMonthChange={setDisplayDate}
                locale={ptBR}
                className="rounded-md border"
                modifiers={{ allocated: allocatedDates }}
                modifiersStyles={{ allocated: { color: 'hsl(var(--primary))', fontWeight: 'bold' } }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className='flex flex-col gap-8'>
             <Card>
                <CardHeader>
                    <CardTitle>Visão Geral do Mapa</CardTitle>
                    <CardDescription>Lojas com visitas agendadas neste mês.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                     <RoutingMap allStores={allStores} routeStops={allocatedStores.map(s => ({...s, visitOrder: 0}))} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Alocações do Mês</CardTitle>
                    <CardDescription>Equipes alocadas em {format(displayDate, 'MMMM \'de\' yyyy', {locale: ptBR})}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {monthlyAllocations.length > 0 ? monthlyAllocations.map(alloc => {
                            const team = mockTeams.find(t => t.id === alloc.teamId);
                            const store = allStores.find(s => s.id === alloc.storeId);
                            if (!team || !store) return null;
                            
                            return (
                                <div key={alloc.id} className="flex justify-between items-center p-2 rounded-md border bg-muted/50">
                                    <div>
                                        <p className="font-semibold">{format(alloc.date, 'dd/MM/yyyy')} - <span className="text-primary">{team.name}</span></p>
                                        <p className="text-sm text-muted-foreground">{store.name}</p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Tem certeza que deseja remover a alocação da equipe {team.name} para a loja {store.name} no dia {format(alloc.date, 'dd/MM/yyyy')}?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteAllocation(alloc.id)}>Excluir</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )
                        }) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma equipe alocada para este mês.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
      
       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>
                {selectedAllocation ? 'Editar Alocação' : 'Alocar Equipe para o dia'} {selectedDate && format(selectedDate, 'dd/MM/yyyy')}
            </DialogTitle>
            </DialogHeader>
            <AllocationForm 
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
                teams={mockTeams}
                stores={allStores}
                allocation={selectedAllocation}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}

    