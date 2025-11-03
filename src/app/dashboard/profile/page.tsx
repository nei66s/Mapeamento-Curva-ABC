'use client';

import React, { useState } from 'react';
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
  avatarUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// This is a mock implementation. In a real app, you'd fetch the current user.
// For now, we'll assume the first user is the logged-in user.
const getCurrentUser = () => mockUsers.find(u => u.role === 'admin');

export default function ProfilePage() {
  const [user, setUser] = useState(getCurrentUser());
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || '',
    } : {},
  });

  const onSubmit = (data: ProfileFormData) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não encontrado.' });
        return;
    }
    
    // In a real app, this would be an API call to a database.
    // Here, we update the mock data object for session persistence.
    // NOTE: This change only persists for the current user session.
    // A page refresh will revert to the original data in `src/lib/users.ts`.
    // To make a permanent change, the file `src/lib/users.ts` must be edited.
    const userIndex = mockUsers.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
        const updatedUser = { ...mockUsers[userIndex], ...data };
        mockUsers[userIndex] = updatedUser; // Persist in the mock "DB" for this session
        setUser(updatedUser); // Update local state for immediate feedback
        
        toast({
          title: 'Perfil Atualizado!',
          description: 'Suas informações foram salvas com sucesso. Para uma alteração permanente, o arquivo fonte precisa ser modificado.',
        });
    } else {
         toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as alterações.' });
    }
  };

  if (!user) {
    return <div>Usuário não encontrado.</div>
  }

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
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-20 w-20">
                    {form.watch('avatarUrl') && (
                      <AvatarImage 
                        src={form.watch('avatarUrl')} 
                        alt={user.name} 
                        data-ai-hint="person avatar"
                      />
                    )}
                    <AvatarFallback>{form.watch('name').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (!file.type.startsWith('image/')) {
                        toast({
                          variant: 'destructive',
                          title: 'Erro',
                          description: 'Por favor, selecione apenas arquivos de imagem.',
                        });
                        return;
                      }

                      try {
                        setIsUploading(true);
                        const formData = new FormData();
                        formData.append('file', file);

                        const response = await fetch('/api/upload', {
                          method: 'POST',
                          body: formData,
                        });

                        if (!response.ok) throw new Error('Erro ao fazer upload');

                        const data = await response.json();
                        form.setValue('avatarUrl', data.imageUrl);
                        
                        toast({
                          title: 'Sucesso!',
                          description: 'Imagem enviada com sucesso.',
                        });
                      } catch (error) {
                        toast({
                          variant: 'destructive',
                          title: 'Erro',
                          description: 'Não foi possível fazer o upload da imagem.',
                        });
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                    className="w-full max-w-[200px]"
                  />
                  {isUploading && (
                    <p className="text-sm text-muted-foreground">Enviando...</p>
                  )}
                </div>
                <div className="grid gap-1">
                  <h3 className="text-lg font-semibold">{form.watch('name')}</h3>
                  <p className="text-sm text-muted-foreground">{form.watch('email')}</p>
                  <p className="text-sm font-medium text-primary capitalize">{user.role}</p>
                </div>
              </div>
              <input type="hidden" {...form.register('avatarUrl')} />

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
