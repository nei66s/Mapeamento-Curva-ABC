
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { mockMaintenanceIndicators } from '@/lib/mock-data';
import type { MaintenanceIndicator } from '@/lib/types';
import { KpiCard } from '@/components/dashboard/indicators/kpi-card';
import { SlaTrendChart } from '@/components/dashboard/indicators/sla-trend-chart';
import { CallsChart } from '@/components/dashboard/indicators/calls-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, TrendingUp, HandCoins } from 'lucide-react';
import { CriticalityChart } from '@/components/dashboard/indicators/criticality-chart';


export default function IndicatorsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(mockMaintenanceIndicators[mockMaintenanceIndicators.length - 1].mes);

  const selectedData = useMemo(() => {
    return mockMaintenanceIndicators.find(d => d.mes === selectedMonth) || mockMaintenanceIndicators[0];
  }, [selectedMonth]);

  const allMonths = useMemo(() => {
    return mockMaintenanceIndicators.map(d => ({
      value: d.mes,
      label: new Date(`${d.mes}-02`).toLocaleString('default', { month: 'long', year: 'numeric' })
    })).reverse();
  }, []);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const agingData = selectedData ? [
    { range: 'Até 30 dias', value: selectedData.aging.inferior_30 },
    { range: '30-60 dias', value: selectedData.aging.entre_30_60 },
    { range: '60-90 dias', value: selectedData.aging.entre_60_90 },
    { range: 'Acima de 90 dias', value: selectedData.aging.superior_90 },
  ] : [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Indicadores de Manutenção"
        description="Painel com os principais indicadores de desempenho operacional."
      >
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
      </PageHeader>
      
      {selectedData && (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="SLA Mensal"
                    value={`${selectedData.sla_mensal}%`}
                    change={selectedData.crescimento_mensal_sla}
                    changeType={selectedData.crescimento_mensal_sla >= 0 ? 'increase' : 'decrease'}
                    description={`Meta: ${selectedData.meta_sla}%`}
                    icon={TrendingUp}
                />
                 <KpiCard
                    title="Backlog"
                    value={selectedData.backlog.toLocaleString()}
                    description="Chamados pendentes"
                    icon={TrendingUp}
                />
                <KpiCard
                    title="Valor Mensal"
                    value={formatCurrency(selectedData.valor_mensal)}
                    change={selectedData.variacao_percentual_valor}
                    changeType={selectedData.variacao_percentual_valor >= 0 ? 'increase' : 'decrease'}
                    description="Custo total em manutenção"
                    icon={HandCoins}
                />
                 <KpiCard
                    title="Chamados Solucionados"
                    value={selectedData.chamados_solucionados.toLocaleString()}
                    description={`${selectedData.chamados_abertos} abertos no mês`}
                    icon={selectedData.chamados_solucionados > selectedData.chamados_abertos ? ArrowUp : ArrowDown}
                    iconColor={selectedData.chamados_solucionados > selectedData.chamados_abertos ? 'text-green-500' : 'text-red-500'}
                />
            </div>
            <div className="grid gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <SlaTrendChart data={mockMaintenanceIndicators} />
                </div>
                 <div className="lg:col-span-2">
                    <CallsChart data={mockMaintenanceIndicators} />
                </div>
            </div>
            <div className="grid gap-8 lg:grid-cols-5">
                 <div className="lg:col-span-2">
                    <CriticalityChart data={selectedData.criticidade} />
                 </div>
                 <div className="lg:col-span-3">
                     <Card>
                        <CardHeader>
                            <CardTitle>Aging do Backlog</CardTitle>
                            <CardDescription>Distribuição dos chamados pendentes por tempo de abertura.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Faixa de Tempo</TableHead>
                                        <TableHead className="text-right">Qtd. Chamados</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {agingData.map(item => (
                                        <TableRow key={item.range}>
                                            <TableCell className="font-medium">{item.range}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary" className="text-base">
                                                    {item.value.toLocaleString()}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                 </div>
            </div>
        </>
      )}

    </div>
  );
}
