
"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { MaintenanceIndicator } from "@/lib/types";

interface SlaTrendChartProps {
    data: MaintenanceIndicator[];
}

const chartConfig = {
  sla: {
    label: "SLA Mensal",
    color: "hsl(var(--primary))",
  },
  meta: {
    label: "Meta SLA",
    color: "hsl(var(--destructive))",
  },
};

export function SlaTrendChart({ data }: SlaTrendChartProps) {
  
  const chartData = data.map(item => ({
      name: new Date(`${item.mes}-02`).toLocaleString('default', { month: 'short' }),
      sla: item.sla_mensal,
      meta: item.meta_sla,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do SLA Mensal vs. Meta</CardTitle>
        <CardDescription>Acompanhamento do percentual de SLA alcançado em relação à meta estabelecida.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis 
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis 
                    tickFormatter={(value) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip 
                    content={<ChartTooltipContent indicator="dot" />}
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2, strokeDasharray: '3 3' }}
                />
                <Legend />
                <Line 
                    dataKey="sla"
                    type="monotone" 
                    stroke={chartConfig.sla.color}
                    strokeWidth={2}
                    dot={true}
                    name={chartConfig.sla.label}
                />
                <Line
                    dataKey="meta"
                    stroke={chartConfig.meta.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={chartConfig.meta.label}
                 />
            </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
