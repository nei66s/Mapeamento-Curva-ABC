
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { MaintenanceIndicator } from "@/lib/types";

interface CallsChartProps {
    data: MaintenanceIndicator[];
}

const chartConfig = {
  abertos: {
    label: "Abertos",
    color: "hsl(var(--accent))",
  },
  solucionados: {
    label: "Solucionados",
    color: "hsl(var(--chart-2))",
  },
  backlog: {
    label: "Backlog",
    color: "hsl(var(--destructive))",
  },
};

export function CallsChart({ data }: CallsChartProps) {
  
  const chartData = data.map(item => ({
      name: new Date(`${item.mes}-02`).toLocaleString('default', { month: 'short' }),
      abertos: item.chamados_abertos,
      solucionados: item.chamados_solucionados,
      backlog: item.backlog,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chamados e Backlog</CardTitle>
        <CardDescription>Volume de chamados abertos, solucionados e backlog acumulado.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis 
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis 
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip 
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Legend />
                <Bar dataKey="abertos" fill={chartConfig.abertos.color} radius={[4, 4, 0, 0]} name={chartConfig.abertos.label} />
                <Bar dataKey="solucionados" fill={chartConfig.solucionados.color} radius={[4, 4, 0, 0]} name={chartConfig.solucionados.label} />
                <Bar dataKey="backlog" fill={chartConfig.backlog.color} radius={[4, 4, 0, 0]} name={chartConfig.backlog.label} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
