'use client';
import { useState } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { mockUsers as initialUsers } from '@/lib/users';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Button } from '@/components/ui/button';
import { User, UserRole } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, PlusCircle, MoreHorizontal, KeyRound, UserPlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserForm, UserFormData } from '@/components/dashboard/admin/user-form';


const currentUserRole: UserRole = 'admin'; 

const roles: UserRole[] = ['admin', 'gestor', 'regional', 'viewer'];

const modules = [
    { id: 'indicators', label: 'Painel de Indicadores' },
    { id: 'releases', label: 'Lançamentos Mensais' },
    { id: 'incidents', label: 'Registro de Incidentes' },
    { id: 'rncs', label: 'Registros de Não Conformidade' },
    { id: 'categories', label: 'Categorias de Itens' },
    { id: 'matrix', label: 'Matriz de Itens' },
    { id: 'compliance', label: 'Cronograma de Preventivas' },
    { id: 'suppliers', label: 'Gestão de Fornecedores' },
    { id: 'warranty', label: 'Controle de Garantias' },
    { id: 'tools', label: 'Almoxarifado de Ferramentas' },
    { id: 'profile', label: 'Meu Perfil' },
    { id: 'settings', label: 'Configurações' },
    { id: 'about', label: 'Sobre a Plataforma' },
];

const initialPermissions: Record<UserRole, Record<string, boolean>> = {
  admin: Object.fromEntries(modules.map(m => [m.id, true])),
  gestor: {
    'indicators': true, 'releases': true, 'incidents': true, 'rncs': true,
    'categories': true, 'matrix': true, 'compliance': true, 'suppliers': true,
    'warranty': true, 'tools': true, 'profile': true, 'settings': true, 'about': true,
  },
  regional: {
    'indicators': true, 'releases': false, 'incidents': true, 'rncs': true,
    'categories': false, 'matrix': true, 'compliance': true, 'suppliers': false,
    'warranty': true, 'tools': true, 'profile': true, 'settings': true, 'about': true,
  },
  viewer: {
    'indicators': true, 'releases': false, 'incidents': false, 'rncs': false,
    'categories': false, 'matrix': false, 'compliance': false, 'suppliers': false,
    'warranty': false, 'tools': false, 'profile': true, 'settings': false, 'about': true,
  }
};


export default function AdminPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [permissions, setPermissions] = useState(initialPermissions);
  const { toast } = useToast();
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    toast({
      title: 'Perfil Atualizado!',
      description: `O perfil do usuário foi atualizado para ${newRole}.`,
    });
  };

  const handlePermissionChange = (role: UserRole, moduleId: string, checked: boolean) => {
    if (role === 'admin') return;

    setPermissions(prev => ({
        ...prev,
        [role]: {
            ...prev[role],
            [moduleId]: checked
        }
    }));

    toast({
      title: 'Permissão Alterada!',
      description: `O acesso do perfil ${role} ao módulo foi ${checked ? 'concedido' : 'revogado'}.`,
    });
  };

  const handleAddUser = (data: UserFormData) => {
    const newUser: User = {
        id: `user-${Date.now()}`,
        ...data,
        avatarUrl: `https://picsum.photos/seed/user${users.length + 1}/100/100`,
    };
    setUsers(prev => [newUser, ...prev]);
    setIsUserFormOpen(false);
    toast({
        title: "Usuário Criado!",
        description: `O usuário ${data.name} foi adicionado com sucesso.`
    });
  };

  const handleResetPassword = (userId: string) => {
    const newPassword = 'paguemenos';
    setUsers(users.map(u => (u.id === userId ? { ...u, password: newPassword } : u)));
    toast({
      title: 'Senha Redefinida!',
      description: `A senha do usuário foi redefinida para "${newPassword}".`,
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
        description="Gerencie usuários, perfis e permissões do sistema."
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Perfis de Acesso</CardTitle>
          <CardDescription>Defina quais módulos cada perfil de usuário pode acessar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Módulo</TableHead>
                {roles.map(role => (
                  <TableHead key={role} className="text-center capitalize">{role}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map(module => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium">{module.label}</TableCell>
                  {roles.map(role => (
                    <TableCell key={role} className="text-center">
                      <Checkbox 
                        checked={permissions[role]?.[module.id] ?? false}
                        onCheckedChange={(checked) => handlePermissionChange(role, module.id, Boolean(checked))}
                        disabled={role === 'admin'}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Gerenciamento de Usuários</CardTitle>
                    <CardDescription>Adicione, edite ou altere os perfis dos usuários do sistema.</CardDescription>
                </div>
                 <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2" />
                            Adicionar Usuário
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Novo Usuário</DialogTitle>
                        </DialogHeader>
                        <UserForm 
                            roles={roles.filter(r => r !== 'admin')}
                            onSubmit={handleAddUser}
                            onCancel={() => setIsUserFormOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[150px]">Perfil</TableHead>
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person avatar"/>}
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value as UserRole)} disabled={user.role === 'admin'}>
                      <SelectTrigger className="ml-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                             <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                   <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={user.role === 'admin'}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                <KeyRound className="mr-2" /> Redefinir Senha
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Redefinir Senha?</AlertDialogTitle>
                              <AlertDialogDescription>
                                A senha do usuário <span className="font-bold">{user.name}</span> será redefinida para a senha padrão "paguemenos". O usuário será solicitado a alterá-la no próximo login.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleResetPassword(user.id)}>
                                Redefinir
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
