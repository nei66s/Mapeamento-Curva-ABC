import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Administração"
        description="Gerencie usuários, perfis e configurações do sistema."
      />
       <Card>
        <CardHeader>
          <CardTitle>Em Construção</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta página será o painel de administração para gerenciar usuários, perfis, e parâmetros da Curva ABC.</p>
        </CardContent>
      </Card>
    </div>
  );
}
