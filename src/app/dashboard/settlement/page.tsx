'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SettlementForm } from '@/components/dashboard/settlement/settlement-form';
import { mockSettlementLetters, mockSuppliers } from '@/lib/mock-data';
import type { SettlementLetter, SettlementStatus } from '@/lib/types';
import { PlusCircle, Clock, Check, Download, Handshake } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SettlementPdfDocument } from '@/components/dashboard/settlement/settlement-pdf-document';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusVariantMap: Record<SettlementStatus, 'success' | 'accent'> = {
  Recebida: 'success',
  Pendente: 'accent',
};

export default function SettlementPage() {
  const [letters, setLetters] = useState<SettlementLetter[]>(mockSettlementLetters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [letterToPrint, setLetterToPrint] = useState<SettlementLetter | null>(null);
  const { toast } = useToast();

  const suppliersMap = useMemo(() => new Map(mockSuppliers.map(s => [s.id, s.name])), []);
  
  const pendingLetters = useMemo(() => letters.filter(l => l.status === 'Pendente').sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()), [letters]);
  const receivedLetters = useMemo(() => letters.filter(l => l.status === 'Recebida').sort((a,b) => new Date(b.receivedDate!).getTime() - new Date(a.receivedDate!).getTime()), [letters]);

  const handleFormSubmit = (values: Omit<SettlementLetter, 'id' | 'requestDate' | 'status'>) => {
    const newLetter: SettlementLetter = {
      ...values,
      id: `SET-${Date.now()}`,
      requestDate: new Date().toISOString(),
      status: 'Pendente',
    };
    setLetters([newLetter, ...letters]);
    toast({
      title: 'Solicitação Registrada!',
      description: `A solicitação de quitação para o contrato "${values.contractId}" foi criada.`,
    });
    setIsFormOpen(false);
  };
  
  const handleMarkAsReceived = (letterId: string) => {
      setLetters(prev => prev.map(l => l.id === letterId ? { ...l, status: 'Recebida', receivedDate: new Date().toISOString() } : l));
      toast({
          title: 'Carta Recebida!',
          description: 'O status da carta de quitação foi atualizado.',
      });
  };

  const handleDownloadPdf = async (letter: SettlementLetter) => {
    setLetterToPrint(letter);

    setTimeout(async () => {
      const input = document.getElementById(`pdf-content-${letter.id}`);
      if (input) {
        try {
          const canvas = await html2canvas(input, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`CartaQuitacao-${letter.contractId}.pdf`);
          toast({
            title: 'PDF Gerado!',
            description: `O download do modelo de quitação para ${letter.contractId} foi iniciado.`,
          });
        } catch (error) {
          console.error("Error generating PDF:", error);
          toast({
            variant: 'destructive',
            title: 'Erro ao Gerar PDF',
            description: 'Não foi possível gerar o arquivo PDF.',
          });
        }
      }
       setLetterToPrint(null);
    }, 100);
  };

  const renderLetterCard = (letter: SettlementLetter) => (
     <Card key={letter.id} className="flex flex-col">
        <CardHeader>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <CardTitle className="text-lg">{letter.contractId}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1">
                        <Handshake className="h-4 w-4" /> 
                        {suppliersMap.get(letter.supplierId) || 'Fornecedor desconhecido'}
                    </CardDescription>
                </div>
                <Badge variant={statusVariantMap[letter.status]}>
                    {letter.status}
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
                {letter.description}
            </p>
            <div className='flex items-center justify-between'>
                <Button variant="outline" size="sm" onClick={() => handleDownloadPdf(letter)}>
                    <Download className="mr-2 h-4 w-4" />
                    Imprimir Modelo
                </Button>
                {letter.status === 'Pendente' && (
                    <Button size="sm" onClick={() => handleMarkAsReceived(letter.id)}>
                        <Check className="mr-2 h-4 w-4" />
                        Marcar como Recebido
                    </Button>
                )}
            </div>
        </CardContent>
        <CardFooter className='justify-between text-xs text-muted-foreground'>
            <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                <span>Solicitada em: {format(new Date(letter.requestDate), 'dd/MM/yyyy')}</span>
            </div>
            {letter.receivedDate && (
                <div className="flex items-center">
                    <span>Recebida em: {format(new Date(letter.receivedDate), 'dd/MM/yyyy')}</span>
                </div>
            )}
        </CardFooter>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Cartas de Quitação"
        description="Gerencie e controle o recebimento de cartas de quitação de fornecedores."
      >
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsFormOpen(true)} className="flex gap-2">
              <PlusCircle />
              Registrar Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Registrar Nova Solicitação de Quitação</DialogTitle>
            </DialogHeader>
            <SettlementForm
              suppliers={mockSuppliers}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

        <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="received">Recebidas</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                    {pendingLetters.length > 0 ? pendingLetters.map(renderLetterCard) : <p className="text-muted-foreground col-span-3 text-center">Nenhuma carta de quitação pendente.</p>}
                </div>
            </TabsContent>
            <TabsContent value="received">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                     {receivedLetters.length > 0 ? receivedLetters.map(renderLetterCard) : <p className="text-muted-foreground col-span-3 text-center">Nenhuma carta de quitação recebida ainda.</p>}
                </div>
            </TabsContent>
        </Tabs>
      
      {letterToPrint && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <SettlementPdfDocument 
            letter={letterToPrint} 
            supplier={mockSuppliers.find(s => s.id === letterToPrint.supplierId)}
          />
        </div>
      )}
    </div>
  );
}
