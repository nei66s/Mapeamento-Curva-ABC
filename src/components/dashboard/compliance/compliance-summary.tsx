'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ComplianceChecklistItem, StoreComplianceData } from "@/lib/types";

interface ComplianceSummaryProps {
    storeData: StoreComplianceData[];
    checklistItems: ComplianceChecklistItem[];
}

export function ComplianceSummary({ storeData, checklistItems }: ComplianceSummaryProps) {
  const totalPossibleItems = storeData.length * checklistItems.length;
  
  const totalCompletedItems = storeData.reduce((acc, store) => {
    return acc + store.items.filter(item => item.completed).length;
  }, 0);

  const completionPercentage = totalPossibleItems > 0
    ? Math.round((totalCompletedItems / totalPossibleItems) * 100)
    : 0;

  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Desempenho Geral</CardTitle>
        <CardDescription>
          Progresso geral da conclusão das manutenções preventivas em todas as lojas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Progresso</span>
          <span className="text-lg font-bold text-primary">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
            <span>{totalCompletedItems.toLocaleString()} itens concluídos</span>
            <span>de {totalPossibleItems.toLocaleString()} totais</span>
        </div>
      </CardContent>
    </Card>
  );
}
