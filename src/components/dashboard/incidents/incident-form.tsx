'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Item, Incident } from '@/lib/types';

interface IncidentFormProps {
  items: Item[];
  onSubmit: (data: Omit<Incident, 'id' | 'openedAt' | 'status' | 'lat' | 'lng'>) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  itemName: z.string({ required_error: 'Selecione o item relacionado.' }),
  location: z.string().min(3, { message: 'A localização deve ter pelo menos 3 caracteres.' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres.' }),
});

type IncidentFormData = z.infer<typeof formSchema>;

export function IncidentForm({ items, onSubmit, onCancel }: IncidentFormProps) {
  const form = useForm<IncidentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: '',
      location: '',
      description: '',
    },
  });

  const handleSubmit = (data: IncidentFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="itemName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Item Afetado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um item" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {items.map(item => (
                        <SelectItem key={item.id} value={item.name}>
                        {item.name}
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
            name="location"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Localização</FormLabel>
                <FormControl>
                    <Input placeholder="Ex: Loja ABC" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Incidente</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva em detalhes o que aconteceu, o impacto e qualquer observação relevante."
                  className="resize-none"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
            </Button>
            <Button type="submit">Registrar</Button>
        </div>
      </form>
    </Form>
  );
}
