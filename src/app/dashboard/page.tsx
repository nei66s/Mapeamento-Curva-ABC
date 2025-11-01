import { PageHeader } from "@/components/shared/page-header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ClassificationTable } from "@/components/dashboard/classification-table";
import { ItemsByCurveChart } from "@/components/dashboard/items-by-curve-chart";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral da classificação de itens e incidentes."
      />
      
      <SummaryCards />
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClassificationTable />
        </div>
        <div className="flex flex-col gap-8">
          <ItemsByCurveChart />
        </div>
      </div>
    </div>
  );
}
