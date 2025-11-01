'use client';

import { useState } from 'react';
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
import { mockItems } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function MatrixPage() {
  const [items, setItems] = useState<Item[]>(mockItems);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

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
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? 'Editar Item' : 'Adicionar Novo Item'}
              </DialogTitle>
            </DialogHeader>
            <ItemForm
              item={selectedItem}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Todos os Itens</CardTitle>
          <CardDescription>
            Lista completa de itens cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead className="hidden md:table-cell">Plano de Contingência</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.category}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ClassificationBadge classification={item.classification} />
                  </TableCell>
                  <TableCell>{item.leadTime}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
