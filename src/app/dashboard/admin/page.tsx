
'use client';
import { useState } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { mockUsers as initialUsers } from '@/lib/users';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, UserRole } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const currentUserRole: UserRole = 'admin'; // For demonstration purposes

const modules = [
    { id: 'indicators-tables', label: 'Tabelas Editáveis (Indicadores)' },
    { id: 'item-matrix', label: 'Matriz de Itens (Adicionar/Editar)' },
    { id: 'categories', label: 'Gerenciamento de Categorias' },
    { id: 'compliance-checklist', label: 'Gerenciamento de Checklist (Conformidade)' },
    { id: 'routing', label: 'Roteirização de Equipes' },
];

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    'indicators-tables': true,
    'item-matrix': true,
    'categories': true,
    'compliance-checklist': false,
    'routing': true,
  });
  const { toast } = useToast();

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    toast({
      title: 'Role Atualizada!',
      description: `O usuário foi atualizado para ${newRole}.`,
    });
  };

  const handlePermissionChange = (moduleId: string, newPermission: boolean) => {
    setPermissions(prev => ({ ...prev, [moduleId]: newPermission }));
     toast({
      title: 'Permissão Alterada!',
      description: `O acesso ao módulo foi ${newPermission ? 'habilitado' : 'desabilitado'}.`,
    });
  };

  if (currentUserRole !== 'admin') {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Acesso Negado"
          description="Você não tem permissão para acessar esta página."
        />
        <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Acesso Restrito</AlertTitle>
            <AlertDescription>
                Apenas administradores podem visualizar o conteúdo da página de administração.
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Administração"
        description="Gerencie usuários, perfis e configurações do sistema."
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Altere as roles dos usuários do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-right">
                    <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}>
                      <SelectTrigger className="w-32 ml-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="gestor">Gestor</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
            <CardTitle>Permissões de Módulos</CardTitle>
            <CardDescription>Habilite ou desabilite o acesso a módulos específicos para usuários não-administradores.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
            {modules.map(module => (
                <div key={module.id} className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <Label htmlFor={module.id} className="flex flex-col space-y-1">
                    <span>{module.label}</span>
                    </Label>
                    <Switch
                        id={module.id}
                        checked={permissions[module.id]}
                        onCheckedChange={(checked) => handlePermissionChange(module.id, checked)}
                    />
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
