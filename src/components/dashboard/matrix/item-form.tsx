
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
import type { Item, Category, Classification } from '@/lib/types';
import { impactFactors } from '@/lib/impact-factors';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { ClassificationBadge } from '@/components/shared/risk-badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';

interface ItemFormProps {
  item?: Item | null;
  categories: Category[];
  onSubmit: (data: Item) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  category: z.string().min(1, { message: 'Por favor, selecione uma categoria.' }),
  storeCount: z.coerce.number().int().min(0, { message: 'A quantidade de lojas deve ser um número positivo.' }),
  impactFactors: z.array(z.string()).refine(value => value.some(item => item), {
    message: "Você deve selecionar ao menos um fator de impacto.",
  }),
  status: z.enum(['online', 'offline', 'maintenance']),
  leadTime: z.string().min(1, { message: 'O lead time é obrigatório.' }),
  contingencyPlan: z.string().min(10, { message: 'O plano de contingência deve ter pelo menos 10 caracteres.' }),
  imageUrl: z.string().url({ message: 'Por favor, insira uma URL de imagem válida.' }).optional().or(z.literal('')),
  
  valorAtivo: z.coerce.number().min(0, { message: 'O valor deve ser positivo.' }),
  dataInicioOperacao: z.date({ required_error: 'A data é obrigatória.' }),
  vidaUtilEstimada: z.coerce.number().int().min(0, 'A vida útil deve ser um número positivo.'),
  dataFimGarantia: z.date({ required_error: 'A data é obrigatória.' }),
  
  id: z.string().optional(),
});

type ItemFormData = Omit<z.infer<typeof formSchema>, 'classification'>;


const calculateClassification = (impacts: string[]): Classification => {
  if (impacts.includes('safety') || impacts.includes('sales')) {
    return 'A';
  }
  if (impacts.includes('legal') || impacts.includes('brand')) {
    return 'B';
  }
  return 'C';
};

const getDefaultValues = (item: Item | null) => ({
    name: item?.name || '',
    category: item?.category || '',
    storeCount: item?.storeCount || 0,
    impactFactors: item?.impactFactors || [],
    status: item?.status || 'online',
    leadTime: item?.leadTime || '',
    contingencyPlan: item?.contingencyPlan || '',
    imageUrl: item?.imageUrl || '',
    valorAtivo: item?.valorAtivo || 0,
    dataInicioOperacao: item?.dataInicioOperacao ? new Date(item.dataInicioOperacao) : new Date(),
    vidaUtilEstimada: item?.vidaUtilEstimada || 0,
    dataFimGarantia: item?.dataFimGarantia ? new Date(item.dataFimGarantia) : new Date(),
    id: item?.id || '',
});

export function ItemForm({ item, categories, onSubmit, onCancel }: ItemFormProps) {
  const form = useForm<ItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(item),
  });

  const watchedImpactFactors = form.watch('impactFactors', item?.impactFactors || []);
  const calculatedClassification = calculateClassification(watchedImpactFactors);

  const handleSubmit = (data: ItemFormData) => {
    const finalItem: Item = {
      ...data,
      classification: calculatedClassification,
      // @ts-ignore
      dataInicioOperacao: data.dataInicioOperacao.toISOString(),
      // @ts-ignore
      dataFimGarantia: data.dataFimGarantia.toISOString(),
    };
    onSubmit(finalItem);
  };
  
  useEffect(() => {
    form.reset(getDefaultValues(item));
  }, [item, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
       
         <FormField
          control={form.control}
          name="imageUrl"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <Separator />
        
        <div>
          <div className="mb-4">
            <FormLabel>Fatores de Impacto Operacional</FormLabel>
            <p className="text-sm text-muted-foreground">Selecione os impactos que a falha deste item pode causar.</p>
          </div>
          <FormField
            control={form.control}
            name="impactFactors"
            render={() => (
              <FormItem className="grid grid-cols-2 gap-4">
                {impactFactors.map((factor) => (
                  <FormField
                    key={factor.id}
                    control={form.control}
                    name="impactFactors"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={factor.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(factor.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, factor.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== factor.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {factor.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
                 <FormMessage className="col-span-2" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center gap-4 rounded-md border bg-muted/50 p-3">
          <h4 className="font-semibold text-sm">Classificação Automática:</h4>
          <ClassificationBadge classification={calculatedClassification} />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Dados Financeiros e Ciclo de Vida</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="valorAtivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Ativo (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vidaUtilEstimada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vida Útil Estimada (anos)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="dataInicioOperacao"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Início da Operação</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                            >
                            {field.value ? format(field.value, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                        </PopoverContent>
                    </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="dataFimGarantia"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fim da Garantia</FormLabel>
                   <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                            >
                            {field.value ? format(field.value, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                        </PopoverContent>
                    </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />
        
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
