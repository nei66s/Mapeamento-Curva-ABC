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
import { mockCategories } from "@/lib/mock-data";
import { ClassificationBadge } from "@/components/shared/risk-badge";
import { Progress } from "@/components/ui/progress";

export function ClassificationTable() {
    const sortedCategories = [...mockCategories].sort((a, b) => {
        if (a.classification !== b.classification) {
            return a.classification.localeCompare(b.classification);
        }
        return b.riskIndex - a.riskIndex;
    });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Ranking de Categorias</CardTitle>
        <CardDescription>
          Lista de todas as categorias e sua classificação de criticidade.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead className="hidden sm:table-cell text-center">Qtd. Itens</TableHead>
              <TableHead className="hidden md:table-cell">Criticidade Média</TableHead>
              <TableHead className="text-right">Classificação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCategories.slice(0, 7).map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">{category.description}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-center">{category.itemCount}</TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                        <Progress value={category.riskIndex * 10} className="h-2" />
                        <span className="font-medium">{category.riskIndex}/10</span>
                    </div>
                </TableCell>
                <TableCell className="text-right">
                  <ClassificationBadge classification={category.classification} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
