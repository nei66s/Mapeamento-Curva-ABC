
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { PageHeader } from '@/components/shared/page-header';
import { ClassificationBadge } from '@/components/shared/risk-badge';
import { ItemForm } from '@/components/dashboard/matrix/item-form';
import { mockItems, mockCategories } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Image as ImageIcon, ListFilter, X, Shield, ShoppingCart, Scale, Landmark, Wrench } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { impactFactors, ImpactFactor } from '@/lib/impact-factors';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const factorIconMap: Record<ImpactFactor['id'], React.ElementType> = {
  safety: Shield,
  sales: ShoppingCart,
  legal: Scale,
  brand: Landmark,
  cost: Wrench,
};


export default function MatrixPage() {
  const [items, setItems] = useState<Item[]>(mockItems);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!categoryFilter) {
      return items;
    }
    return items.filter(item => item.category === categoryFilter);
  }, [items, categoryFilter]);

  const handleFormSubmit = (values: Item) => {
    if (selectedItem) {
      // Edit
      setItems(
        items.map(item => (item.id === selectedItem.id ? values : item))
      );
      toast({
        title: 'Item Atualizado!',
        description: `O item "${values.name}" foi atualizado com sucesso.`,
      });
    } else {
      // Add
      const newItem = { ...values, id: `ITM-${Date.now()}` };
      setItems([newItem, ...items]);
       toast({
        title: 'Item Adicionado!',
        description: `O item "${values.name}" foi adicionado com sucesso.`,
      });
    }
    setIsFormOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    const deletedItem = items.find(item => item.id === itemId);
    setItems(items.filter(item => item.id !== itemId));
    if (deletedItem) {
      toast({
        variant: 'destructive',
        title: 'Item Excluído!',
        description: `O item "${deletedItem.name}" foi excluído.`,
      });
    }
  };

  const openEditDialog = (item: Item) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };
  
  const openNewDialog = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  }

  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter(prev => (prev === category ? null : category));
  };
  
  const clearFilter = () => setCategoryFilter(null);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Matriz de Itens"
        description="Gerencie todos os itens e suas classificações."
      >
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="flex gap-2">
              <PlusCircle />
              Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? 'Editar Item' : 'Adicionar Novo Item'}
              </DialogTitle>
            </DialogHeader>
            <ItemForm
              item={selectedItem}
              categories={mockCategories}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todos os Itens</CardTitle>
              <CardDescription>
                {filteredItems.length} de {items.length} itens exibidos.
              </CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                      <ListFilter className="h-4 w-4" />
                      Filtrar por Categoria
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Selecione uma categoria</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {mockCategories.map(cat => (
                       <DropdownMenuCheckboxItem
                        key={cat.id}
                        checked={categoryFilter === cat.name}
                        onSelect={e => e.preventDefault()}
                        onCheckedChange={() => handleCategoryFilterChange(cat.name)}
                      >
                        {cat.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {categoryFilter && (
                   <Button variant="ghost" size="icon" onClick={clearFilter} className="text-muted-foreground">
                      <X className="h-4 w-4" />
                   </Button>
                )}
             </div>
           </div>
        </CardHeader>
        <CardContent>
           <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead>Fatores de Impacto</TableHead>
                    <TableHead className="hidden md:table-cell">Lead Time</TableHead>
                    <TableHead className="hidden md:table-cell">Plano de Contingência</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {item.imageUrl ? (
                              <AvatarImage src={item.imageUrl} alt={item.name} data-ai-hint="item image"/>
                            ) : (
                              <AvatarFallback>
                                <ImageIcon className="text-muted-foreground" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.category}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ClassificationBadge classification={item.classification} />
                      </TableCell>
                       <TableCell>
                        <div className="flex items-center gap-1.5">
                          {item.impactFactors.map(factorId => {
                            const factorInfo = impactFactors.find(f => f.id === factorId);
                            if (!factorInfo) return null;
                            const Icon = factorIconMap[factorId];
                            return (
                               <Tooltip key={factorId}>
                                  <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="p-1.5"><Icon className="h-4 w-4" /></Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{factorInfo.label}</p>
                                  </TooltipContent>
                                </Tooltip>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{item.leadTime}</TableCell>
                      <TableCell className="hidden md:table-cell">{item.contingencyPlan}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => openEditDialog(item)}>
                              <Pencil className="mr-2" /> Editar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 text-destructive" /> 
                                  <span className="text-destructive">Excluir</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o item
                                    <span className="font-bold"> {item.name}</span>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
