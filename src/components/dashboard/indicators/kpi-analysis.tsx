'use client';
import { useState, useCallback, useEffect } from 'react';
import { summarizeKpi } from '@/ai/flows/summarize-kpi-flow';
import type { MaintenanceIndicator } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface KpiAnalysisProps {
  indicator: MaintenanceIndicator;
}

export function KpiAnalysis({ indicator }: KpiAnalysisProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await summarizeKpi({
        mes: indicator.mes,
        sla_mensal: indicator.sla_mensal,
        meta_sla: indicator.meta_sla,
        crescimento_mensal_sla: indicator.crescimento_mensal_sla,
        chamados_abertos: indicator.chamados_abertos,
        chamados_solucionados: indicator.chamados_solucionados,
        backlog: indicator.backlog,
        valor_mensal: indicator.valor_mensal,
        variacao_percentual_valor: indicator.variacao_percentual_valor,
      });
      setSummary(response.summary);
    } catch (e) {
      console.error(e);
      setError('Ocorreu um erro ao buscar a análise da IA.');
    } finally {
      setLoading(false);
    }
  }, [indicator]);

  useEffect(() => {
    // Reset state when the selected month (indicator) changes
    setSummary(null);
    setError(null);
    setLoading(false);
  }, [indicator]);


  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[75%]" />
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    if (summary) {
      return (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap mt-4 border bg-muted/30 p-4 rounded-lg">
            {summary}
        </div>
      );
    }
    return (
        <div className="text-sm text-muted-foreground text-center py-10">
            Clique no botão para gerar uma análise de desempenho com IA.
        </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Análise de Desempenho
          </CardTitle>
          <CardDescription>
            Resumo executivo dos KPIs do mês.
          </CardDescription>
        </div>
        <Button onClick={fetchAnalysis} disabled={loading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? 'Analisando...' : 'Analisar Mês'}
        </Button>
      </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
    </Card>
  );
}
