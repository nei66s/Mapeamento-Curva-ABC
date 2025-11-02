
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Bell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    incidents: true,
    compliance: false,
    reports: true,
  });

  const { toast } = useToast();

  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    // In a real app, you'd also apply this to the documentElement
    document.documentElement.classList.toggle('dark', isDark);
    toast({
      title: 'Tema Alterado!',
      description: `O tema foi alterado para ${isDark ? 'Escuro' : 'Claro'}.`,
    });
  };

  const handleNotificationChange = (id: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Configurações"
        description="Ajuste as preferências do aplicativo."
      />

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Sun className="h-5 w-5 transition-all" />
              <Label htmlFor="theme-switch">Tema Claro / Escuro</Label>
              <Moon className="h-5 w-5 transition-all" />
            </div>
            <Switch
              id="theme-switch"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeChange}
            />
          </div>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>Escolha quais notificações por e-mail você deseja receber.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <Label htmlFor="incidents-notification" className="flex items-center gap-3">
              <Bell />
              <span>Novos incidentes críticos (Curva A)</span>
            </Label>
            <Switch
              id="incidents-notification"
              checked={notifications.incidents}
              onCheckedChange={(checked) => handleNotificationChange('incidents', checked)}
            />
          </div>
           <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <Label htmlFor="compliance-notification" className="flex items-center gap-3">
              <Bell />
              <span>Lembretes de checklist de conformidade</span>
            </Label>
            <Switch
              id="compliance-notification"
              checked={notifications.compliance}
              onCheckedChange={(checked) => handleNotificationChange('compliance', checked)}
            />
          </div>
           <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <Label htmlFor="reports-notification" className="flex items-center gap-3">
              <Bell />
              <span>Relatórios mensais de desempenho</span>
            </Label>
            <Switch
              id="reports-notification"
              checked={notifications.reports}
              onCheckedChange={(checked) => handleNotificationChange('reports', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
