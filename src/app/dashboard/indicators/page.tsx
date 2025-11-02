
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { mockMaintenanceIndicators, mockIncidents, mockItems } from '@/lib/mock-data';
import type { MaintenanceIndicator } from '@/lib/types';
import { KpiCard } from '@/components/dashboard/indicators/kpi-card';
import { CallsChart } from '@/components/dashboard/indicators/calls-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown, TrendingUp, PlusCircle, BrainCircuit, BarChart3, LineChart } from 'lucide-react';
import { EditableSlaTable } from '@/components/dashboard/indicators/editable-sla-table';
import { EditableCallsTable } from '@/components/dashboard/indicators/editable-calls-table';
import { SlaChart } from '@/components/dashboard/indicators/sla-chart';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddMonthForm } from '@/components/dashboard/indicators/add-month-form';
import { useToast } from '@/hooks/use-toast';
import { EditableAgingTableByCriticism } from '@/components/dashboard/indicators/editable-aging-table-by-criticism';
import { AgingChart } from '@/components/dashboard/indicators/aging-chart';
import { KpiAnalysis } from '@/components/dashboard/indicators/kpi-analysis';
import { ParetoAnalysis } from '@/components/dashboard/indicators/pareto-analysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { ClassificationTable } from '@/components/dashboard/classification-table';
import { ItemsByCurveChart } from '@/components/dashboard/items-by-curve-chart';
import { Separator } from '@/components/ui/separator';

export default function IndicatorsPage() {
  const [indicators, setIndicators] = useState<MaintenanceIndicator[]>(mockMaintenanceIndicators);
  const [selectedMonth, setSelectedMonth] = useState<string>(mockMaintenanceIndicators[mockMaintenanceIndicators.length - 1].mes);
  const [annualSlaGoal, setAnnualSlaGoal] = useState<number>(80);
  const [isAddMonthOpen, setIsAddMonthOpen] = useState(false);
  const { toast } = useToast();

  const selectedData = useMemo(() => {
    return indicators.find(d => d.mes === selectedMonth) || indicators[0];
  }, [selectedMonth, indicators]);

  const allMonths = useMemo(() => {
    return indicators.map(d => ({
      value: d.mes,
      label: new Date(`${d.mes}-02`).toLocaleString('default', { month: 'long', year: 'numeric' })
    })).sort((a,b) => new Date(b.value).getTime() - new Date(a.value).getTime());
  }, [indicators]);

  const indicatorsWithGoal = useMemo(() => {
    return indicators.map(indicator => ({
      ...indicator,
      meta_sla: annualSlaGoal,
    }));
  }, [indicators, annualSlaGoal]);
  
  const incidentsForMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    return mockIncidents.filter(incident => {
        const incidentDate = new Date(incident.openedAt);
        return incidentDate.getFullYear() === parseInt(year) && incidentDate.getMonth() === parseInt(month) - 1;
    });
  }, [selectedMonth]);


  const handleAddNewMonth = (year: number, month: number) => {
    const monthString = `${year}-${String(month).padStart(2, '0')}`;
    if (indicators.some(ind => ind.mes === monthString)) {
        toast({
            variant: 'destructive',
            title: 'Mês já existe',
            description: 'Este mês já foi adicionado à lista de indicadores.',
        });
        return;
    }

    const newIndicator: MaintenanceIndicator = {
        id: String(indicators.length + 1),
        mes: monthString,
        sla_mensal: 0,
        meta_sla: annualSlaGoal,
        crescimento_mensal_sla: 0,
        r2_tendencia: 0,
        chamados_abertos: 0,
        chamados_solucionados: 0,
        backlog: indicators[indicators.length - 1]?.backlog || 0,
        valor_mensal: 0,
        variacao_percentual_valor: 0,
        aging: {
            inferior_30: { baixa: 0, media: 0, alta: 0, muito_alta: 0 },
            entre_30_60: { baixa: 0, media: 0, alta: 0, muito_alta: 0 },
            entre_60_90: { baixa: 0, media: 0, alta: 0, muito_alta: 0 },
            superior_90: { baixa: 0, media: 0, alta: 0, muito_alta: 0 },
        },
        criticidade: { baixa: 0, media: 0, alta: 0, muito_alta: 0 },
        prioridade: { baixa: 0, media: 0, alta: 0, muito_alta: 0 },
    };

    setIndicators(prev => [...prev, newIndicator].sort((a, b) => new Date(a.mes).getTime() - new Date(b.mes).getTime()));
    setIsAddMonthOpen(false);
    toast({
        title: 'Mês Adicionado!',
        description: `O mês ${new Date(monthString + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })} foi adicionado.`,
    });
  };
  
  const handleAgingUpdate = (updatedAging: MaintenanceIndicator['aging']) => {
    setIndicators(prevIndicators => prevIndicators.map(indicator => 
        indicator.mes === selectedMonth 
        ? { ...indicator, aging: updatedAging } 
        : indicator
    ));
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Painel de Indicadores"
        description="Análise consolidada dos principais indicadores de desempenho da manutenção."
      >
        <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                    {allMonths.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                            {month.label.charAt(0).toUpperCase() + month.label.slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Dialog open={isAddMonthOpen} onOpenChange={setIsAddMonthOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Mês
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adicionar Novo Mês</DialogTitle>
                    </DialogHeader>
                    <AddMonthForm 
                        onSubmit={handleAddNewMonth}
                        onCancel={() => setIsAddMonthOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
      </PageHeader>
      
      <section>
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2 mb-4">
            <BarChart3 />
            Indicadores Gerais
        </h2>
        <SummaryCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
                <ClassificationTable />
            </div>
            <div className="lg:col-span-1">
                <ItemsByCurveChart />
            </div>
        </div>
      </section>

      <Separator />

      {selectedData && (
        <section>
             <h2 className="text-2xl font-bold text-primary flex items-center gap-2 mb-4">
                <LineChart />
                Indicadores Operacionais do Mês
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <KpiCard
                    title="SLA Mensal"
                    value={`${selectedData.sla_mensal}%`}
                    change={selectedData.crescimento_mensal_sla}
                    changeType={selectedData.crescimento_mensal_sla >= 0 ? 'increase' : 'decrease'}
                    description={`Meta: ${annualSlaGoal}%`}
                    icon={TrendingUp}
                />
                 <KpiCard
                    title="Backlog"
                    value={selectedData.backlog}
                    description="O.S. pendentes"
                    icon={TrendingUp}
                />
                <KpiCard
                    title="O.S. Solucionadas"
                    value={selectedData.chamados_solucionados}
                    description={`${selectedData.chamados_abertos} abertas no mês`}
                    icon={selectedData.chamados_solucionados > selectedData.chamados_abertos ? ArrowUp : ArrowDown}
                    iconColor={selectedData.chamados_solucionados > selectedData.chamados_abertos ? 'text-green-500' : 'text-red-500'}
                />
            </div>
            
            <Card className="border-primary border-2 mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <BrainCircuit className="h-6 w-6" />
                        Central de Análises com IA
                    </CardTitle>
                    <CardDescription>
                        Utilize inteligência artificial para obter insights sobre seus dados de manutenção.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <KpiAnalysis indicator={selectedData} />
                    <ParetoAnalysis incidents={incidentsForMonth} />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
              <CallsChart data={indicators} />
              <SlaChart data={indicatorsWithGoal} />
            </div>

            <div className='mt-8'>
              <AgingChart data={selectedData.aging} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <EditableSlaTable 
                  data={indicators} 
                  setData={setIndicators} 
                  annualSlaGoal={annualSlaGoal}
                  setAnnualSlaGoal={setAnnualSlaGoal}
                />
                <EditableCallsTable data={indicators} setData={setIndicators} />
            </div>
            <div className='mt-8'>
                <EditableAgingTableByCriticism indicator={selectedData} onUpdate={handleAgingUpdate} />
            </div>
        </section>
      )}

    </div>
  );
}
