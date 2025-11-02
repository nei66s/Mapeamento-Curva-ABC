
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RncForm } from '@/components/dashboard/rncs/rnc-form';
import { mockRncs, mockSuppliers, mockIncidents } from '@/lib/mock-data';
import type { RNC, RncStatus } from '@/lib/types';
import { PlusCircle, Clock, MoreVertical, Pencil, FileWarning, Users, AlertTriangle, Workflow } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusVariantMap: Record<RncStatus, 'destructive' | 'accent' | 'success' | 'default'> = {
  Aberta: 'destructive',
  'Em Análise': 'accent',
  Concluída: 'success',
  Cancelada: 'default',
};

export default function RncPage() {
  const [rncs, setRncs] = useState<RNC[]>(mockRncs);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRnc, setSelectedRnc] = useState<RNC | null>(null);
  const { toast } = useToast();

  const suppliersMap = useMemo(() => new Map(mockSuppliers.map(s => [s.id, s.name])), []);

  const handleFormSubmit = (values: Omit<RNC, 'id' | 'createdAt' | 'status'>) => {
    if (selectedRnc) {
      const updatedRnc = { ...selectedRnc, ...values };
      setRncs(rncs.map(rnc => (rnc.id === selectedRnc.id ? updatedRnc : rnc)));
      toast({
        title: 'RNC Atualizada!',
        description: `O registro "${values.title}" foi atualizado.`,
      });
    } else {
      const newRnc: RNC = {
        ...values,
        id: `RNC-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'Aberta',
      };
      setRncs([newRnc, ...rncs]);
      toast({
        title: 'RNC Registrada!',
        description: `O registro "${values.title}" foi criado com sucesso.`,
      });
    }
    setIsFormOpen(false);
    setSelectedRnc(null);
  };

  const openEditDialog = (rnc: RNC) => {
    setSelectedRnc(rnc);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    setSelectedRnc(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Registros de Não Conformidade"
        description="Gerencie e acompanhe descumprimentos e problemas com fornecedores."
      >
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="flex gap-2">
              <PlusCircle />
              Gerar RNC
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedRnc ? 'Editar RNC' : 'Registrar Nova RNC'}</DialogTitle>
            </DialogHeader>
            <RncForm
              rnc={selectedRnc}
              suppliers={mockSuppliers}
              incidents={mockIncidents}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Registros de Não Conformidade</CardTitle>
          <CardDescription>{rncs.length} registros encontrados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rncs.map(rnc => (
              <Card key={rnc.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{rnc.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 pt-1">
                        <Users className="h-4 w-4" /> 
                        {suppliersMap.get(rnc.supplierId) || 'Fornecedor desconhecido'}
                      </CardDescription>
                    </div>
                     <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2" onClick={() => openEditDialog(rnc)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {rnc.description}
                  </p>
                  <div className='flex items-center justify-between'>
                    <Badge variant="outline" className='gap-2'>
                        <AlertTriangle className="h-4 w-4" />
                        {rnc.classification}
                    </Badge>
                     {rnc.incidentId && (
                        <Badge variant="secondary" className='gap-2'>
                            <Workflow className="h-4 w-4" />
                            {rnc.incidentId}
                        </Badge>
                     )}
                  </div>
                </CardContent>
                <CardFooter className='justify-between'>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(rnc.createdAt), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                   <Badge variant={statusVariantMap[rnc.status]}>
                        {rnc.status}
                    </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
