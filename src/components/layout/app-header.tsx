
import Link from "next/link";
import {
  PanelLeft,
  Search,
  Grid3x3,
  ShieldAlert,
  Settings,
  BarChart3,
  ListCollapse,
  ClipboardCheck,
  Map,
  ClipboardList,
  Route,
  LineChart,
  Wrench,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/layout/user-nav";
import { Separator } from "../ui/separator";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <BarChart3 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Manutenção</span>
            </Link>
            
            <Separator />
            
            <Link
              href="/dashboard/indicators"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <LineChart className="h-5 w-5" />
              Indicadores
            </Link>

            <div>
              <h2 className="mb-2 flex items-center gap-2 px-2.5 text-lg font-semibold tracking-tight text-primary">
                <Map className="h-5 w-5" />
                Mapeamento
              </h2>
               <div className="grid gap-2">
                 
                <Link
                  href="/dashboard/categories"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <ListCollapse className="h-5 w-5" />
                  Categorias
                </Link>
                <Link
                  href="/dashboard/matrix"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Grid3x3 className="h-5 w-5" />
                  Matriz de Itens
                </Link>
                <Link
                  href="/dashboard/incidents"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Wrench className="h-5 w-5" />
                  Ordens de Serviço
                </Link>
               </div>
            </div>

            <Separator />
            
             <div>
              <h2 className="mb-2 flex items-center gap-2 px-2.5 text-lg font-semibold tracking-tight text-primary">
                <ClipboardList className="h-5 w-5" />
                Preventivas
              </h2>
               <div className="grid gap-2">
                 <Link
                  href="/dashboard/compliance"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <ClipboardCheck className="h-5 w-5" />
                  Conformidade
                </Link>
               </div>
            </div>
            
            <Separator />
            
            <Link
              href="/dashboard/admin"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
              Administração
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
      </div>
      <UserNav />
    </header>
  );
}
