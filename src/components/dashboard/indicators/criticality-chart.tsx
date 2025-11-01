
'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface CriticalityChartProps {
  data: {
    baixa: number;
    media: number;
    alta: number;
    muito_alta: number;
  };
}

const chartConfig = {
  baixa: { label: 'Baixa', color: 'hsl(var(--chart-2))' },
  media: { label: 'Média', color: 'hsl(var(--chart-4))' },
  alta: { label: 'Alta', color: 'hsl(var(--accent))' },
  muito_alta: { label: 'Muito Alta', color: 'hsl(var(--destructive))' },
};

export function CriticalityChart({ data }: CriticalityChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: chartConfig[key as keyof typeof chartConfig].label,
    value,
    fill: chartConfig[key as keyof typeof chartConfig].color,
  }));

  const total = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Chamados por Criticidade</CardTitle>
        <CardDescription>Distribuição percentual por nível de criticidade</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full max-h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
               <Tooltip
                content={<ChartTooltipContent nameKey="name" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {chartData.map((entry, index) => (
                   <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
       <div className="flex flex-col gap-2 p-4 text-center text-sm">
        <div className="font-medium text-muted-foreground">Total de Chamados</div>
        <div className="text-2xl font-bold">{total.toLocaleString()}</div>
      </div>
    </Card>
  );
}
