
'use client';
import { useState, useCallback } from 'react';
import { analyzeIncidentsForPareto } from '@/ai/flows/pareto-analysis-flow';
import type { WorkOrder } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ParetoChart } from './pareto-chart';

interface ParetoAnalysisProps {
  incidents: WorkOrder[];
}

type ParetoData = {
    category: string;
    count: number;
}[];

export function ParetoAnalysis({ incidents }: ParetoAnalysisProps) {
  const [analysis, setAnalysis] = useState<ParetoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const incidentDescriptions = incidents.map(inc => `${inc.itemName}: ${inc.description}`);
      const response = await analyzeIncidentsForPareto({ incidents: incidentDescriptions });
      setAnalysis(response.analysis);
    } catch (e) {
      console.error(e);
      setError('Ocorreu um erro ao gerar a análise de Pareto.');
    } finally {
      setLoading(false);
    }
  }, [incidents]);

  const renderContent = () => {
    if (loading) {
      return <Skeleton className="h-80 w-full mt-4" />;
    }
    if (error) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Erro na Análise</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    if (analysis) {
       if (analysis.length === 0) {
         return <p className="text-sm text-muted-foreground mt-4 text-center py-10">Não há dados de O.S. suficientes no mês selecionado para gerar uma análise.</p>
       }
      return <ParetoChart data={analysis} />;
    }
    return (
        <div className="text-sm text-muted-foreground text-center py-10">
            Clique no botão para gerar uma análise de Pareto das causas raiz.
        </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Análise de Pareto (Causa Raiz)
          </CardTitle>
          <CardDescription>
            Identifique as causas mais frequentes.
          </CardDescription>
        </div>
        <Button onClick={fetchAnalysis} disabled={loading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? 'Analisando...' : 'Gerar Pareto'}
        </Button>
      </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
    </Card>
  );
}
