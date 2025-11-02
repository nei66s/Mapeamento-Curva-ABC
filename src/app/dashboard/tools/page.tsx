
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/page-header';
import { ToolForm } from '@/components/dashboard/tools/tool-form';
import { mockTools } from '@/lib/mock-data';
import { mockUsers } from '@/lib/users';
import type { Tool, ToolStatus } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Pencil, Wrench, User, PlayCircle, CircleOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusVariantMap: Record<ToolStatus, 'success' | 'accent' | 'destructive'> = {
  Disponível: 'success',
  'Em Uso': 'accent',
  'Em Manutenção': 'destructive',
};

const allStatuses: ToolStatus[] = ['Disponível', 'Em Uso', 'Em Manutenção'];

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>(mockTools);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const usersMap = useMemo(() => new Map(mockUsers.map(u => [u.id, u.name])), []);

  const handleFormSubmit = (values: Omit<Tool, 'id' | 'status' | 'assignedTo' | 'lastMaintenance'>) => {
    if (selectedTool) {
      const updatedTool = { ...selectedTool, ...values };
      setTools(tools.map(tool => (tool.id === selectedTool.id ? updatedTool : tool)));
      toast({
        title: 'Ferramenta Atualizada!',
        description: `A ferramenta "${values.name}" foi atualizada.`,
      });
    } else {
      const newTool: Tool = {
        ...values,
        id: `TOOL-${Date.now()}`,
        status: 'Disponível',
      };
      setTools([newTool, ...tools]);
      toast({
        title: 'Ferramenta Adicionada!',
        description: `A ferramenta "${values.name}" foi adicionada ao almoxarifado.`,
      });
    }
    setIsFormOpen(false);
    setSelectedTool(null);
  };

  const openEditDialog = (tool: Tool) => {
    setSelectedTool(tool);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    setSelectedTool(null);
    setIsFormOpen(true);
  };

  const handleStatusChange = (toolId: string, status: ToolStatus) => {
    setTools(prev =>
      prev.map(tool =>
        tool.id === toolId
          ? {
              ...tool,
              status,
              assignedTo: status !== 'Em Uso' ? undefined : tool.assignedTo,
              lastMaintenance: status === 'Em Manutenção' ? new Date().toISOString() : tool.lastMaintenance,
            }
          : tool
      )
    );
    toast({ title: 'Status Alterado', description: `O status da ferramenta foi alterado para "${status}".` });
  };
  
  const handleAssignUser = (toolId: string, userId: string) => {
    setTools(prev =>
      prev.map(tool =>
        tool.id === toolId ? { ...tool, assignedTo: userId, status: 'Em Uso' } : tool
      )
    );
    const userName = usersMap.get(userId) || 'Desconhecido';
    toast({ title: 'Ferramenta Atribuída', description: `A ferramenta foi atribuída a ${userName}.` });
  };
  
  const handleUnassignUser = (toolId: string) => {
     setTools(prev =>
      prev.map(tool =>
        tool.id === toolId ? { ...tool, assignedTo: undefined, status: 'Disponível' } : tool
      )
    );
    toast({ title: 'Ferramenta Devolvida', description: 'A ferramenta agora está disponível no almoxarifado.' });
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Almoxarifado de Ferramentas"
        description="Gerencie o inventário e a alocação de ferramentas para os técnicos."
      >
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="flex gap-2">
              <PlusCircle />
              Adicionar Ferramenta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {selectedTool ? 'Editar Ferramenta' : 'Adicionar Nova Ferramenta'}
              </DialogTitle>
            </DialogHeader>
            <ToolForm tool={selectedTool} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Inventário de Ferramentas</CardTitle>
          <CardDescription>
            Lista de todas as ferramentas cadastradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ferramenta</TableHead>
                <TableHead>Nº de Série</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Técnico Responsável</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map(tool => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-sm text-muted-foreground">{tool.category}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{tool.serialNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[tool.status]}>{tool.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tool.assignedTo ? usersMap.get(tool.assignedTo) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => openEditDialog(tool)}>
                          <Pencil className="mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Wrench className="mr-2" /> Alterar Status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {allStatuses.map(status => (
                              <DropdownMenuItem key={status} onSelect={() => handleStatusChange(tool.id, status)} disabled={tool.status === status}>
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <User className="mr-2" /> Atribuir a Técnico
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onSelect={() => handleUnassignUser(tool.id)} disabled={!tool.assignedTo}>
                                <CircleOff className="mr-2"/> Devolver ao estoque
                            </DropdownMenuItem>
                            {mockUsers.map(user => (
                              <DropdownMenuItem key={user.id} onSelect={() => handleAssignUser(tool.id, user.id)} disabled={tool.assignedTo === user.id}>
                                {user.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
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
