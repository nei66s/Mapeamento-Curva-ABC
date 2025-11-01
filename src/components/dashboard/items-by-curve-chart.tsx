
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { mockItems } from "@/lib/mock-data";

const chartConfig = {
  items: {
    label: "Itens",
  },
  A: {
    label: "Curva A",
    color: "hsl(var(--destructive))",
  },
  B: {
    label: "Curva B",
    color: "hsl(var(--accent))",
  },
  C: {
    label: "Curva C",
    color: "hsl(var(--chart-2))",
  },
};

export function ItemsByCurveChart() {
  const data = [
    { curve: "A", items: mockItems.filter(e => e.classification === 'A').length, fill: chartConfig.A.color },
    { curve: "B", items: mockItems.filter(e => e.classification === 'B').length, fill: chartConfig.B.color },
    { curve: "C", items: mockItems.filter(e => e.classification === 'C').length, fill: chartConfig.C.color },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Itens por Curva ABC</CardTitle>
        <CardDescription>Distribuição dos itens por classificação.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ChartContainer config={chartConfig}>
            <BarChart 
                data={data}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="curve"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `Curva ${value}`}
                className="text-xs"
              />
              <YAxis 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar 
                dataKey="items" 
                radius={[4, 4, 0, 0]}
                label={{ position: "top", offset: 4, className: "fill-foreground font-medium text-sm" }}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
