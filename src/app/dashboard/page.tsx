'use client';

import { PageHeader } from '@/components/shared/page-header';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { ClassificationTable } from '@/components/dashboard/classification-table';
import { ItemsByCurveChart } from '@/components/dashboard/items-by-curve-chart';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard Geral"
        description="Visão geral do status da manutenção em toda a operação."
      />
      <SummaryCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ClassificationTable />
        </div>
        <div className="lg:col-span-1">
          <ItemsByCurveChart />
        </div>
      </div>
    </div>
  );
}
