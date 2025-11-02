
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, AlertTriangle, Archive, DollarSign } from "lucide-react";
import { mockItems, mockIncidents } from "@/lib/mock-data";

export function SummaryCards() {
  const totalItems = mockItems.length;
  const criticalItems = mockItems.filter(e => e.classification === 'A').length;
  const openIncidents = mockIncidents.filter(i => i.status === 'Aberto' || i.status === 'Em Andamento').length;

  const summaryData = [
    {
      title: "Itens Totais",
      value: totalItems,
      icon: Archive,
      color: "text-primary",
    },
    {
      title: "Itens Curva A",
      value: criticalItems,
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      title: "Incidentes Abertos",
      value: openIncidents,
      icon: Activity,
      color: "text-accent",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {summaryData.map((item, index) => (
        <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
