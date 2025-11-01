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
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ComplianceChecklistItem, StoreComplianceData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';


interface ComplianceChecklistProps {
  checklistItems: ComplianceChecklistItem[];
  storeData: StoreComplianceData[];
  onStatusChange: (storeId: string, itemId: string, completed: boolean) => void;
}

export function ComplianceChecklist({
  checklistItems,
  storeData,
  onStatusChange,
}: ComplianceChecklistProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist de Lojas</CardTitle>
        <CardDescription>
          Marque os itens de manutenção preventiva concluídos para cada loja.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <div className="border rounded-lg overflow-auto">
                <Table>
                    <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="sticky left-0 bg-muted/50 z-10 font-semibold text-foreground">Loja</TableHead>
                        {checklistItems.map(item => (
                        <TableHead key={item.id} className="text-center min-w-[150px]">
                             <Tooltip>
                                <TooltipTrigger className="cursor-help">
                                    <span className="border-b border-dashed border-muted-foreground">{item.name}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{item.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TableHead>
                        ))}
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {storeData.map(store => (
                        <TableRow key={store.storeId}>
                        <TableCell className="sticky left-0 bg-card z-10 font-medium">{store.storeName}</TableCell>
                        {checklistItems.map(checklistItem => {
                            const status = store.items.find(i => i.itemId === checklistItem.id);
                            return (
                            <TableCell key={checklistItem.id} className="text-center">
                                <Checkbox
                                id={`${store.storeId}-${checklistItem.id}`}
                                checked={status?.completed || false}
                                onCheckedChange={checked => {
                                    onStatusChange(store.storeId, checklistItem.id, !!checked);
                                }}
                                className="h-5 w-5"
                                />
                            </TableCell>
                            );
                        })}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
