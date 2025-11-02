
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { Category } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryBulkFormProps {
  onSubmit: (data: Omit<Category, 'id' | 'itemCount' | 'riskIndex'>[]) => void;
  onCancel: () => void;
}

const categorySchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres.' }),
  classification: z.enum(['A', 'B', 'C']),
  imageUrl: z.string().url({ message: 'Por favor, insira uma URL de imagem válida.' }).optional().or(z.literal('')),
});

const bulkSchema = z.object({
    categories: z.array(categorySchema)
});

type BulkFormData = z.infer<typeof bulkSchema>;

export function CategoryBulkForm({ onSubmit, onCancel }: CategoryBulkFormProps) {
  const form = useForm<BulkFormData>({
    resolver: zodResolver(bulkSchema),
    defaultValues: {
      categories: [{ name: '', description: '', classification: 'C', imageUrl: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "categories"
  });

  const handleSubmit = (data: BulkFormData) => {
    onSubmit(data.categories);
  };
  
  const addNewField = () => {
      append({ name: '', description: '', classification: 'C', imageUrl: '' });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full max-h-[80vh]">
        <ScrollArea className="flex-grow pr-6 -mr-6">
            <div className="space-y-6 py-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                        <h4 className="font-semibold text-primary">Categoria #{index + 1}</h4>
                        {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-destructive"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        <FormField
                            control={form.control}
                            name={`categories.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nome da Categoria</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Refrigeração" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`categories.${index}.description`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="Descreva o que essa categoria engloba."
                                    className="resize-none"
                                    rows={2}
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name={`categories.${index}.imageUrl`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>URL da Imagem</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://exemplo.com/imagem.png" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`categories.${index}.classification`}
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
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
        <div className="flex justify-between items-center pt-4 border-t mt-4 flex-shrink-0">
          <Button type="button" variant="outline" onClick={addNewField}>
            <PlusCircle className="mr-2" />
            Adicionar Outra Categoria
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Categorias</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
