'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import type { Item, Classification } from '@/lib/types';

interface ItemFormProps {
  item?: Item | null;
  onSubmit: (data: Item) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  category: z.string().min(3, { message: 'A categoria deve ter pelo menos 3 caracteres.' }),
  storeCount: z.coerce.number().int().min(0, { message: 'A quantidade de lojas deve ser um número positivo.' }),
  generalIndex: z.coerce.number().int().min(1, 'O índice deve ser no mínimo 1.').max(10, 'O índice deve ser no máximo 10.'),
  classification: z.enum(['A', 'B', 'C']),
  status: z.enum(['online', 'offline', 'maintenance']),
  leadTime: z.string().min(1, { message: 'O lead time é obrigatório.' }),
  contingencyPlan: z.string().min(10, { message: 'O plano de contingência deve ter pelo menos 10 caracteres.' }),
  id: z.string().optional(),
});

type ItemFormData = z.infer<typeof formSchema>;

export function ItemForm({ item, onSubmit, onCancel }: ItemFormProps) {
  const form = useForm<ItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || '',
      category: item?.category || '',
      storeCount: item?.storeCount || 0,
      generalIndex: item?.generalIndex || 5,
      classification: item?.classification || 'C',
      status: item?.status || 'online',
      leadTime: item?.leadTime || '',
      contingencyPlan: item?.contingencyPlan || '',
      id: item?.id || '',
    },
  });

  const handleSubmit = (data: ItemFormData) => {
    onSubmit(data as Item);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Item</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Ar Condicionado Central" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Refrigeração" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="storeCount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Qtd. Lojas</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="generalIndex"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Índice Geral</FormLabel>
                <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="classification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classificação</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a classificação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A">A - Mais Valiosos</SelectItem>
                    <SelectItem value="B">B - Valor Intermediário</SelectItem>
                    <SelectItem value="C">C - Menos Valiosos</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leadTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Time</FormLabel>
                <FormControl>
                  <Input placeholder="Imediato, 2 horas..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contingencyPlan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plano de Contingência</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o plano de ação em caso de falha."
                  className="resize-none"
                  rows={3}
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
            <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
}
