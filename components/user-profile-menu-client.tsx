"use client";

import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Loader, Moon, Sun, Monitor, GraduationCap, ShieldAlert } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  isAdmin: boolean;
  isTeacher: boolean;
};

export const UserProfileMenuClient = ({ isAdmin, isTeacher }: Props) => {
  const { setTheme } = useTheme();

  let roleLabel = "Usuario";
  let roleIcon = null;
  let badgeColor = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  if (isAdmin) {
    roleLabel = "Administrador";
    roleIcon = <ShieldAlert className="w-3 h-3 mr-1" />;
    badgeColor = "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400";
  } else if (isTeacher) {
    roleLabel = "Profesor";
    roleIcon = <GraduationCap className="w-3 h-3 mr-1" />;
    badgeColor = "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
  }

  return (
    <div className="p-4 flex items-center justify-between border-t-2 dark:border-border">
      <div className="flex items-center gap-x-3">
        <ClerkLoading>
          <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          <UserButton afterSignOutUrl="/" />
        </ClerkLoaded>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className={`flex items-center px-2 py-1 rounded-md text-xs font-bold cursor-pointer transition-opacity hover:opacity-80 ${badgeColor}`}>
              {roleIcon}
              {roleLabel}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 dark:bg-card dark:border-border">
            <DropdownMenuLabel>Ajustes de Perfil</DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-slate-800" />
            
            <Link href="/teacher/classrooms">
              <DropdownMenuItem className="cursor-pointer dark:hover:bg-slate-800">
                <GraduationCap className="w-4 h-4 mr-2" />
                <span>Modo Profesor</span>
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator className="dark:bg-slate-800" />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Apariencia</DropdownMenuLabel>
            
            <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer dark:hover:bg-slate-800">
              <Sun className="w-4 h-4 mr-2" />
              <span>Claro</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer dark:hover:bg-slate-800">
              <Moon className="w-4 h-4 mr-2" />
              <span>Oscuro</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer dark:hover:bg-slate-800">
              <Monitor className="w-4 h-4 mr-2" />
              <span>Sistema</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
