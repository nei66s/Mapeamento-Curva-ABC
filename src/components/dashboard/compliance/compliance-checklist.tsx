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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ComplianceChecklistItem, StoreComplianceData, ComplianceStatus } from '@/lib/types';
import { CheckCircle2, XCircle, CircleSlash, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ComplianceChecklistProps {
  checklistItems: ComplianceChecklistItem[];
  storeData: StoreComplianceData[];
  onStatusChange: (storeId: string, itemId: string, status: ComplianceStatus) => void;
  currentDate: Date;
  isDateView: boolean;
}

const statusIcon: Record<ComplianceStatus, React.ReactNode> = {
    completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    pending: <XCircle className="h-5 w-5 text-destructive" />,
    'not-applicable': <CircleSlash className="h-5 w-5 text-muted-foreground" />
};

const statusLabel: Record<ComplianceStatus, string> = {
  completed: "Concluído",
  pending: "Pendente",
  'not-applicable': "Não Aplicável",
};

export function ComplianceChecklist({
  checklistItems,
  storeData,
  onStatusChange,
  currentDate,
  isDateView,
}: ComplianceChecklistProps) {

  const title = isDateView ? `Lojas do dia ${format(currentDate, 'dd/MM/yyyy')}` : `Visão Geral do Mês`;
  const description = isDateView 
    ? `${storeData.length} loja(s) com visita programada.` 
    : `Resumo de todas as visitas em ${format(currentDate, 'MMMM', {locale: ptBR})}.`;

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <div className="border rounded-lg overflow-auto h-[400px]">
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
                    {storeData.length > 0 ? storeData.map(store => (
                        <TableRow key={store.storeId}>
                        <TableCell className="sticky left-0 bg-card z-10 font-medium">{store.storeName}</TableCell>
                        {checklistItems.map(checklistItem => {
                            const itemStatus = store.items.find(i => i.itemId === checklistItem.id);
                            const currentStatus = itemStatus?.status || 'pending';
                            return (
                            <TableCell key={checklistItem.id} className="text-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center justify-center w-full h-full">
                                            {statusIcon[currentStatus]}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {(Object.keys(statusLabel) as ComplianceStatus[]).map(status => (
                                             <DropdownMenuItem key={status} onSelect={() => onStatusChange(store.storeId, checklistItem.id, status)}>
                                                {statusIcon[status]}
                                                <span className="ml-2">{statusLabel[status]}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            );
                        })}
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={checklistItems.length + 1} className="h-24 text-center">
                                Nenhuma loja encontrada para o período selecionado.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
