
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { mockMaintenanceIndicators } from '@/lib/mock-data';
import type { MaintenanceIndicator } from '@/lib/types';
import { KpiCard } from '@/components/dashboard/indicators/kpi-card';
import { CallsChart } from '@/components/dashboard/indicators/calls-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { EditableSlaTable } from '@/components/dashboard/indicators/editable-sla-table';
import { EditableCallsTable } from '@/components/dashboard/indicators/editable-calls-table';
import { EditableAgingTable } from '@/components/dashboard/indicators/editable-aging-table';


export default function IndicatorsPage() {
  const [indicators, setIndicators] = useState<MaintenanceIndicator[]>(mockMaintenanceIndicators);
  const [selectedMonth, setSelectedMonth] = useState<string>(mockMaintenanceIndicators[mockMaintenanceIndicators.length - 1].mes);

  const selectedData = useMemo(() => {
    return indicators.find(d => d.mes === selectedMonth) || indicators[0];
  }, [selectedMonth, indicators]);

  const allMonths = useMemo(() => {
    return indicators.map(d => ({
      value: d.mes,
      label: new Date(`${d.mes}-02`).toLocaleString('default', { month: 'long', year: 'numeric' })
    })).reverse();
  }, [indicators]);

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    value={selectedData.backlog}
                    description="Chamados pendentes"
                    icon={TrendingUp}
                />
                <KpiCard
                    title="Chamados Solucionados"
                    value={selectedData.chamados_solucionados}
                    description={`${selectedData.chamados_abertos} abertos no mês`}
                    icon={selectedData.chamados_solucionados > selectedData.chamados_abertos ? ArrowUp : ArrowDown}
                    iconColor={selectedData.chamados_solucionados > selectedData.chamados_abertos ? 'text-green-500' : 'text-red-500'}
                />
            </div>
            
            <CallsChart data={indicators} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <EditableSlaTable data={indicators} setData={setIndicators} />
                <EditableCallsTable data={indicators} setData={setIndicators} />
            </div>

            <EditableAgingTable indicator={selectedData} />
        </>
      )}

    </div>
  );
}
