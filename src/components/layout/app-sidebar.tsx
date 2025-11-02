import Link from "next/link";
import {
  BarChart3,
  Grid3x3,
  ShieldAlert,
  Settings,
  ListCollapse,
  ClipboardCheck,
  Map,
  ClipboardList,
  Route,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const topLevelLinks = [
    { href: "/dashboard", icon: LineChart, label: "Indicadores" },
];

const mappingLinks = [
    { href: "/dashboard/categories", icon: ListCollapse, label: "Categorias" },
    { href: "/dashboard/matrix", icon: Grid3x3, label: "Matriz de Itens" },
    { href: "/dashboard/incidents", icon: ShieldAlert, label: "Incidentes" },
];

const preventiveLinks = [
    { href: "/dashboard/compliance", icon: ClipboardCheck, label: "Conformidade" },
];

export default function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card sm:flex">
      <div className="flex flex-col gap-4 px-4 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-lg font-semibold text-primary md:text-base"
        >
          <BarChart3 className="h-5 w-5 text-primary transition-all group-hover:scale-110" />
          <span className="font-bold text-xl text-primary">Manutenção</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 px-4">
             <nav className="flex flex-col gap-2">
                 {topLevelLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted font-medium"
                    )}
                    >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                    </Link>
                ))}
            </nav>
            <nav className="flex flex-col gap-2 mt-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 text-lg font-semibold tracking-tight flex items-center gap-2 text-primary">
                        <Map className="h-5 w-5" />
                        Mapeamento
                    </h2>
                </div>
                {mappingLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                    )}
                    >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                    </Link>
                ))}
            </nav>
            <nav className="flex flex-col gap-2 mt-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 text-lg font-semibold tracking-tight flex items-center gap-2 text-primary">
                        <ClipboardList className="h-5 w-5" />
                        Preventivas
                    </h2>
                </div>
                {preventiveLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                    )}
                    >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                    </Link>
                ))}
            </nav>
        </div>
      </div>
      
      <nav className="mt-auto flex flex-col items-center gap-4 px-4 sm:py-5">
         <Link
            href="/dashboard/admin"
            className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            )}
            >
            <Settings className="h-5 w-5" />
            Administração
        </Link>
      </nav>
    </aside>
  );
}
