
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/users';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const profileSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  avatarUrl: z.string().url({ message: 'Por favor, insira uma URL de imagem válida.' }).optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [user, setUser] = useState(mockUsers[0]);
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    // In a real app, this would be an API call.
    // Here, we update the local state and the mock data object for session persistence.
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

    // Update the mock data source
    const userIndex = mockUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        mockUsers[userIndex] = updatedUser;
    }
    
    toast({
      title: 'Perfil Atualizado!',
      description: 'Suas informações foram salvas com sucesso.',
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Meu Perfil"
        description="Visualize e edite suas informações pessoais."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Mantenha seus dados sempre atualizados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm font-medium text-primary capitalize">{user.role}</p>
                  </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                   <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Nome</Label>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Email</Label>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
              </div>
               <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <Label>URL da Imagem do Avatar</Label>
                      <FormControl>
                        <Input placeholder="https://exemplo.com/sua-imagem.png" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
             <CardFooter>
                <Button type="submit">Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
