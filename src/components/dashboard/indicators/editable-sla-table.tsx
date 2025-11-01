
'use client';
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
import type { MaintenanceIndicator } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditableSlaTableProps {
  data: MaintenanceIndicator[];
  setData: React.Dispatch<React.SetStateAction<MaintenanceIndicator[]>>;
}

export function EditableSlaTable({ data, setData }: EditableSlaTableProps) {
  const handleChange = (
    id: string,
    field: keyof Pick<MaintenanceIndicator, 'sla_mensal' | 'meta_sla'>,
    value: string
  ) => {
    const newValue = parseFloat(value) || 0;
    setData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, [field]: newValue } : item
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução SLA vs. Meta</CardTitle>
        <CardDescription>
          Preencha os valores de SLA alcançado e a meta para cada mês.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>SLA (%)</TableHead>
                <TableHead>Meta (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {new Date(`${item.mes}-02`).toLocaleString('default', {
                      month: 'short',
                      year: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.sla_mensal}
                      onChange={e => handleChange(item.id, 'sla_mensal', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.meta_sla}
                      onChange={e => handleChange(item.id, 'meta_sla', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
