'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Item, PreventiveVisit } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PreventiveVisitFormProps {
  items: Item[];
  onSubmit: (data: Omit<PreventiveVisit, 'id'>) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  date: z.date({
    required_error: 'A data da visita é obrigatória.',
  }),
  supplierName: z.string().min(3, { message: 'O nome do fornecedor é obrigatório.' }),
  items: z.array(z.string()).refine(value => value.some(item => item), {
    message: "Você deve selecionar ao menos um item.",
  }),
  notes: z.string().optional(),
  status: z.enum(['Agendada', 'Concluída']),
});

type VisitFormData = z.infer<typeof formSchema>;

export function PreventiveVisitForm({ items, onSubmit, onCancel }: PreventiveVisitFormProps) {
  const form = useForm<VisitFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      supplierName: '',
      items: [],
      notes: '',
      status: 'Agendada',
    },
  });

  const handleSubmit = (data: VisitFormData) => {
    onSubmit({
      ...data,
      date: data.date.toISOString(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplierName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fornecedor</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do fornecedor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Visita</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date('1900-01-01')}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="items"
            render={() => (
              <FormItem>
                 <div className="mb-4">
                    <FormLabel>Itens para Manutenção</FormLabel>
                    <p className="text-sm text-muted-foreground">Selecione os itens que serão verificados nesta visita.</p>
                 </div>
                <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border p-4">
                  {items.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="items"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.name)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.name])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.name
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item.name}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                 <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status da visita" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Agendada">Agendada</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas / Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Adicione qualquer observação relevante sobre a visita." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Agendamento</Button>
        </div>
      </form>
    </Form>
  );
}
