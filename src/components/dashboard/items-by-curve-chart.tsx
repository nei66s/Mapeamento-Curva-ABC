
"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { mockItems } from "@/lib/mock-data";

const COLORS = {
    A: "hsl(var(--destructive))",
    B: "hsl(var(--accent))",
    C: "hsl(var(--chart-2))",
};

export function ItemsByCurveChart() {
  const data = [
    { name: "Curva A", value: mockItems.filter(e => e.classification === 'A').length, fill: COLORS.A },
    { name: "Curva B", value: mockItems.filter(e => e.classification === 'B').length, fill: COLORS.B },
    { name: "Curva C", value: mockItems.filter(e => e.classification === 'C').length, fill: COLORS.C },
  ];

  const chartConfig = {
    value: {
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


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Itens por Curva ABC</CardTitle>
        <CardDescription>Distribuição dos itens por classificação.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ChartContainer config={chartConfig}>
            <PieChart>
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = 25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="hsl(var(--foreground))"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        className="text-sm font-medium"
                      >
                        {data[index].name} ({value})
                      </text>
                    );
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
