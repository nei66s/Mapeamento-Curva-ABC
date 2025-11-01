import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockItems } from "@/lib/mock-data";
import { ClassificationBadge } from "@/components/shared/risk-badge";
import { Progress } from "@/components/ui/progress";

export function ClassificationTable() {
    const sortedItems = [...mockItems].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Ranking de Itens</CardTitle>
        <CardDescription>
          Lista de todos os itens cadastrados e sua classificação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="hidden sm:table-cell text-center">Qtd. Lojas</TableHead>
              <TableHead className="hidden md:table-cell">Índice Geral</TableHead>
              <TableHead className="text-right">Classificação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.slice(0, 7).map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.category}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-center">{item.storeCount}</TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                        <Progress value={item.generalIndex * 10} className="h-2" />
                        <span className="font-medium">{item.generalIndex}/10</span>
                    </div>
                </TableCell>
                <TableCell className="text-right">
                  <ClassificationBadge classification={item.classification} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
