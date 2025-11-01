import Link from "next/link";
import {
  BarChart3,
  LayoutDashboard,
  Grid3x3,
  ShieldAlert,
  Settings,
  ListCollapse,
  ClipboardCheck,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/categories", icon: ListCollapse, label: "Categorias" },
    { href: "/dashboard/matrix", icon: Grid3x3, label: "Matriz de Itens" },
    { href: "/dashboard/incidents", icon: ShieldAlert, label: "Incidentes" },
    { href: "/dashboard/compliance", icon: ClipboardCheck, label: "Conformidade" },
    { href: "/dashboard/indicators", icon: Gauge, label: "Indicadores" },
];

export default function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card sm:flex">
      <nav className="flex flex-col gap-4 px-4 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-lg font-semibold text-primary md:text-base"
        >
          <BarChart3 className="h-5 w-5 text-primary transition-all group-hover:scale-110" />
          <span className="font-bold text-xl text-primary">Curva ABC Pro</span>
        </Link>
        {navLinks.map((link) => (
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
