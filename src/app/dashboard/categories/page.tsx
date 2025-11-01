
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
import { CategoryForm } from '@/components/dashboard/categories/category-form';
import { mockCategories } from '@/lib/mock-data';
import type { Category } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = (values: Omit<Category, 'id'>) => {
    if (selectedCategory) {
      const updatedCategory = { ...selectedCategory, ...values };
      setCategories(
        categories.map(cat => (cat.id === selectedCategory.id ? updatedCategory : cat))
      );
      toast({
        title: 'Categoria Atualizada!',
        description: `A categoria "${values.name}" foi atualizada.`,
      });
    } else {
      const newCategory: Category = { ...values, id: `CAT-${Date.now()}` };
      setCategories([newCategory, ...categories]);
      toast({
        title: 'Categoria Adicionada!',
        description: `A categoria "${values.name}" foi adicionada.`,
      });
    }
    setIsFormOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const deletedCategory = categories.find(cat => cat.id === categoryId);
    setCategories(categories.filter(cat => cat.id !== categoryId));
    if (deletedCategory) {
      toast({
        variant: 'destructive',
        title: 'Categoria Excluída!',
        description: `A categoria "${deletedCategory.name}" foi excluída.`,
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Categorias de Itens"
        description="Gerencie as categorias (macro) para organização dos itens."
      >
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="flex gap-2">
              <PlusCircle />
              Adicionar Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={selectedCategory}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Todas as Categorias</CardTitle>
          <CardDescription>
            Lista completa de categorias cadastradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Nome da Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(category => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.description}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => openEditDialog(category)}>
                          <Pencil className="mr-2" /> Editar
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={e => e.preventDefault()}>
                              <Trash2 className="mr-2 text-destructive" />
                              <span className="text-destructive">Excluir</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso excluirá permanentemente a categoria
                                <span className="font-bold"> {category.name}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(category.id)}
                              >
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
