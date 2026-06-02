import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

import { cn } from "@/lib/utils";

import { SidebarItem } from "./sidebar-item";
import { UserProfileMenu } from "./user-profile-menu";
import { 
  BookOpen, 
  Swords,
  Target, 
  ShoppingCart, 
  Bot, 
  TrendingUp, 
  Headphones,
  LayoutDashboard,
  UploadCloud,
  Database,
  CheckSquare,
  FileText,
  Trophy,
  Shield,
  School,
  AlertCircle,
  FolderUp
} from "lucide-react";
import { FaCrown, FaDumbbell, FaUsers } from "react-icons/fa6";

type Props = {
  className?: string;
};

export const Sidebar = async ({ className }: Props) => {
  const { userId } = auth();
  const adminId = process.env.ADMIN_USER_ID;
  const isUserAdmin = userId === adminId;

  // Check if there is an active or pending tournament today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const tournamentToday = await prisma.liveTournament.findFirst({
    where: {
      startTime: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: { in: ['PENDING', 'ACTIVE'] }
    }
  });

  const hasTournamentToday = !!tournamentToday;

  return (
    <div className={cn(
      "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r border-border flex-col bg-card/80 backdrop-blur-2xl transition-colors z-50",
      className,
    )}>
      <Link href="/learn">
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3 group">
          <div className="relative animate-float">
            <Image src="/mascot.svg" height={40} width={40} alt="Mascot" className="drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          </div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400 tracking-wide group-hover:from-green-400 group-hover:to-emerald-300 transition-all">
            RutaCachimbo
          </h1>
        </div>
      </Link>
      <div className="flex flex-col gap-y-2 flex-1 overflow-y-auto custom-scrollbar pb-6 pr-2">
        <SidebarItem 
          label="Temario" 
          href="/learn"
          icon={<BookOpen className="w-6 h-6 text-sky-500" />}
        />
        <SidebarItem 
          label="Simulacros" 
          href="/simulacros"
          icon={<FaDumbbell className="w-6 h-6 text-red-500" />}
        />
        <SidebarItem 
          label="Clasificación" 
          href="/leaderboard"
          icon={<FaCrown className="w-6 h-6 text-yellow-500" />}
        />
        <SidebarItem 
          label="Misiones" 
          href="/quests"
          icon={<Target className="w-6 h-6 text-orange-500" />}
        />
        <SidebarItem 
          label="Logros" 
          href="/logros"
          icon={<Trophy className="w-6 h-6 text-yellow-400" />}
        />
        <SidebarItem 
          label="Tienda" 
          href="/shop"
          icon={<ShoppingCart className="w-6 h-6 text-emerald-500" />}
        />
        <SidebarItem 
          label="Tutor IA" 
          href="/tutor"
          icon={<Bot className="w-6 h-6 text-purple-500" />}
        />
        <SidebarItem 
          label="Duelos PvP" 
          href="/pvp"
          icon={<Swords className="w-6 h-6 text-red-500" />}
        />
        <SidebarItem 
          label="Unirse a Aula" 
          href="/classrooms/join"
          icon={<School className="w-6 h-6 text-teal-500" />}
        />
        <SidebarItem 
          label="Mis Errores" 
          href="/mistakes"
          icon={<AlertCircle className="w-6 h-6 text-rose-500" />}
        />
        <SidebarItem 
          label="Facciones" 
          href="/factions"
          icon={hasTournamentToday ? 
            <Shield className="w-6 h-6 text-amber-950 animate-bounce" /> : 
            <Shield className="w-6 h-6 text-indigo-500" />
          }
          isGolden={hasTournamentToday}
        />
        <SidebarItem 
          label="Progreso" 
          href="/progress"
          icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
        />
        <SidebarItem 
          label="Analíticas IA" 
          href="/analytics"
          icon={<Bot className="w-6 h-6 text-indigo-500" />}
        />
        <SidebarItem 
          label="Audioteca" 
          href="/audioteca"
          icon={<Headphones className="w-6 h-6 text-indigo-500" />}
        />
        {isUserAdmin && (
          <>
            <div className="my-2 border-t border-border" />
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </p>
            <SidebarItem 
              label="Dashboard" 
              href="/admin-panel"
              icon={<LayoutDashboard className="w-5 h-5 text-slate-500" />}
            />
            <SidebarItem 
              label="Subir PDF (IA)" 
              href="/admin/upload"
              icon={<UploadCloud className="w-5 h-5 text-slate-500" />}
            />
            <SidebarItem 
              label="Gestor de Archivos" 
              href="/admin/media"
              icon={<FolderUp className="w-5 h-5 text-slate-500" />}
            />
            <SidebarItem 
              label="Gestión BD" 
              href="/admin/courses"
              icon={<Database className="w-5 h-5 text-slate-500" />}
            />
            <SidebarItem 
              label="Clasificación (Admin)" 
              href="/admin-panel/leaderboard"
              icon={<FaUsers className="w-5 h-5 text-slate-500" />}
            />
            <SidebarItem 
              label="Aprobar Profesores" 
              href="/admin-panel/teachers"
              icon={<CheckSquare className="w-5 h-5 text-slate-500" />}
            />
          </>
        )}
      </div>
      <UserProfileMenu />
    </div>
  );
};
