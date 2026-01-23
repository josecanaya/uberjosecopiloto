"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, History, Home, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Hoy", icon: Home },
    { href: "/historial", label: "Historial", icon: History },
    { href: "/semana", label: "Semana", icon: Calendar },
    { href: "/turnos", label: "Turnos", icon: Clock },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg safe-area-bottom">
      <div className="mx-auto max-w-[420px] flex justify-around px-2 py-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-colors rounded-lg min-w-[70px]",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground active:text-foreground active:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
