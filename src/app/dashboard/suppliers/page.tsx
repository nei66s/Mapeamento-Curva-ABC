
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
import { SupplierForm } from '@/components/dashboard/suppliers/supplier-form';
import { mockSuppliers } from '@/lib/mock-data';
import type { Supplier } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';


export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = (values: Omit<Supplier, 'id'>) => {
    if (selectedSupplier) {
      const updatedSupplier = { ...selectedSupplier, ...values };
      setSuppliers(
        suppliers.map(sup => (sup.id === selectedSupplier.id ? updatedSupplier : sup))
      );
      toast({
        title: 'Fornecedor Atualizado!',
        description: `O fornecedor "${values.name}" foi atualizado.`,
      });
    } else {
      const newSupplier: Supplier = { 
        ...values, 
        id: `SUP-${Date.now()}`,
      };
      setSuppliers([newSupplier, ...suppliers]);
      toast({
        title: 'Fornecedor Adicionado!',
        description: `O fornecedor "${values.name}" foi adicionado.`,
      });
    }
    setIsFormOpen(false);
    setSelectedSupplier(null);
  };

  const handleDelete = (supplierId: string) => {
    const deleted = suppliers.find(sup => sup.id === supplierId);
    setSuppliers(suppliers.filter(sup => sup.id !== supplierId));
    if (deleted) {
      toast({
        variant: 'destructive',
        title: 'Fornecedor Excluído!',
        description: `O fornecedor "${deleted.name}" foi excluído.`,
      });
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    setSelectedSupplier(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Fornecedores"
        description="Gerencie fornecedores e prestadores de serviço."
      >
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="flex gap-2">
              <PlusCircle />
              Adicionar Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {selectedSupplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}
              </DialogTitle>
            </DialogHeader>
            <SupplierForm
              supplier={selectedSupplier}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Todos os Fornecedores</CardTitle>
          <CardDescription>
            Lista de fornecedores e prestadores de serviço cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map(supplier => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell><Badge variant="secondary">{supplier.specialty}</Badge></TableCell>
                   <TableCell>
                     <div className="flex flex-col">
                        <span className="font-medium">{supplier.contactName}</span>
                        <span className="text-sm text-muted-foreground">{supplier.contactEmail}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{supplier.cnpj}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => openEditDialog(supplier)}>
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
                                Essa ação não pode ser desfeita. Isso excluirá permanentemente o fornecedor
                                <span className="font-bold"> {supplier.name}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(supplier.id)}
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
