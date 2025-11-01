
'use client';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { MaintenanceIndicator } from '@/lib/types';

interface EditableAgingTableProps {
    indicator: MaintenanceIndicator;
}

export function EditableAgingTable({ indicator }: EditableAgingTableProps) {
  const [agingData, setAgingData] = useState(indicator.aging);

  const handleChange = (
    field: keyof typeof agingData,
    value: string
  ) => {
    const newValue = parseInt(value, 10) || 0;
    setAgingData(prevData => ({ ...prevData, [field]: newValue }));
  };

  const agingRanges: { key: keyof typeof agingData, label: string }[] = [
    { key: 'inferior_30', label: 'Até 30 dias' },
    { key: 'entre_30_60', label: '30-60 dias' },
    { key: 'entre_60_90', label: '60-90 dias' },
    { key: 'superior_90', label: 'Acima de 90 dias' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aging do Backlog</CardTitle>
        <CardDescription>
          Preencha a distribuição dos chamados pendentes por tempo.
        </CardDescription>
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
            {agingRanges.map(item => (
              <TableRow key={item.key}>
                <TableCell className="font-medium">{item.label}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={agingData[item.key]}
                    onChange={e => handleChange(item.key, e.target.value)}
                    className="h-8 w-32 ml-auto"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
