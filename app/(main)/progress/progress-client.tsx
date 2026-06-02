"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Trophy, 
  Star, 
  Heart, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap, 
  ShieldAlert 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  userProgress: {
    userId: string;
    userName: string;
    userImageSrc: string;
    hearts: number;
    points: number;
    league: string;
    weeklyPoints: number;
    isTeacher: boolean;
    activeBorder: string | null;
  };
  isPro: boolean;
  completedChallengesCount: number;
  weeklyRank: number | null;
};

export const ProgressClient = ({
  userProgress,
  isPro,
  completedChallengesCount,
  weeklyRank,
}: Props) => {

  const leagueGradients: Record<string, string> = {
    "BRONCE": "from-orange-500/10 via-orange-500/5 to-transparent border-orange-200 dark:border-orange-900/30",
    "PLATA": "from-slate-400/10 via-slate-400/5 to-transparent border-border",
    "ORO": "from-yellow-500/15 via-yellow-500/5 to-transparent border-yellow-200 dark:border-yellow-900/30",
    "DIAMANTE": "from-cyan-500/20 via-cyan-500/5 to-transparent border-cyan-200 dark:border-cyan-900/30",
  };

  const leagueTextColors: Record<string, string> = {
    "BRONCE": "text-orange-700 dark:text-orange-400",
    "PLATA": "text-slate-600 dark:text-muted-foreground",
    "ORO": "text-yellow-600 dark:text-yellow-400",
    "DIAMANTE": "text-cyan-600 dark:text-cyan-400",
  };

  const activeLeagueGradient = leagueGradients[userProgress.league] || leagueGradients["BRONCE"];
  const activeLeagueColor = leagueTextColors[userProgress.league] || leagueTextColors["BRONCE"];

  return (
    <div className="max-w-[1056px] mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-800 dark:text-white">Mi Progreso</h1>
        <p className="text-muted-foreground text-sm">Visualiza tus logros académicos y estadísticas en RutaCachimbo.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6 auto-rows-[14rem]">
        
        {/* Card 1: User Profile Card (lg:col-span-6, row-span-1) */}
        <div className={cn(
          "lg:col-span-6 row-span-1 relative overflow-hidden rounded-3xl border-2 p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md bg-white dark:bg-background dark:border-border",
          activeLeagueGradient
        )}>
          <div className="flex items-center gap-x-4">
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-4 border-slate-100 dark:border-border shadow-sm flex-shrink-0">
              <Image 
                src={userProgress.userImageSrc} 
                alt={userProgress.userName} 
                fill 
                className="object-cover"
              />
              {userProgress.activeBorder === "gold" && (
                <div className="absolute inset-0 border-4 border-yellow-400 rounded-2xl animate-pulse" />
              )}
            </div>
            <div className="space-y-1">
              <span className={cn("text-xs font-black tracking-widest uppercase", activeLeagueColor)}>
                Liga {userProgress.league}
              </span>
              <h2 className="text-2xl font-black text-neutral-800 dark:text-white truncate max-w-[280px] sm:max-w-xs">
                {userProgress.userName}
              </h2>
              <div className="flex items-center gap-x-2">
                {userProgress.isTeacher ? (
                  <span className="flex items-center gap-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <GraduationCap className="h-3 w-3" />
                    Profesor
                  </span>
                ) : (
                  <span className="flex items-center gap-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <Sparkles className="h-3 w-3" />
                    Estudiante
                  </span>
                )}
                {isPro && (
                  <span className="flex items-center gap-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 animate-pulse">
                    SUPER
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-900 pt-3">
            <span>RutaCachimbo ID: <span className="font-mono font-bold">{userProgress.userId.slice(0, 10)}...</span></span>
            <span className="font-bold text-green-500">Cuenta Activa</span>
          </div>
        </div>

        {/* Card 2: Leaderboard Rank Card (lg:col-span-4, row-span-1) */}
        <div className="lg:col-span-4 row-span-1 rounded-3xl border-2 border-border p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md bg-white dark:bg-background">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Liga Semanal</span>
              <h3 className="text-lg font-black text-neutral-800 dark:text-white">Posición en Ranking</h3>
            </div>
            <div className="h-10 w-10 bg-yellow-50 dark:bg-yellow-950/40 rounded-2xl flex items-center justify-center border border-yellow-200 dark:border-yellow-900/30">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <div className="my-auto py-2">
            {weeklyRank !== null ? (
              <p className="text-3xl font-black text-neutral-800 dark:text-white">
                Puesto <span className="text-yellow-500 font-black">#{weeklyRank}</span>
              </p>
            ) : (
              <p className="text-sm font-bold text-muted-foreground">
                Aún no has acumulado puntos semanales en la liga. ¡Completa lecciones para ingresar al ranking!
              </p>
            )}
          </div>
          <Link href="/leaderboard">
            <div className="flex items-center text-xs font-bold text-green-500 hover:text-green-600 transition-colors group cursor-pointer">
              Ver tabla de clasificación completa
              <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        {/* Card 3: Learning Stats Card (lg:col-span-4, row-span-2) */}
        <div className="lg:col-span-4 row-span-2 rounded-3xl border-2 border-border p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md bg-white dark:bg-background">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Academia</span>
            <h3 className="text-lg font-black text-neutral-800 dark:text-white">Estadísticas Clave</h3>
          </div>
          <div className="space-y-4 my-auto">
            {/* Stat: Hearts */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/30">
              <div className="flex items-center gap-x-2.5">
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Vidas Restantes</span>
              </div>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">{userProgress.hearts} / 5</span>
            </div>
            {/* Stat: Points (XP) */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/20">
              <div className="flex items-center gap-x-2.5">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">Puntos Totales (XP)</span>
              </div>
              <span className="text-xl font-black text-yellow-600 dark:text-yellow-400">{userProgress.points} XP</span>
            </div>
            {/* Stat: Completed Challenges */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-950/30">
              <div className="flex items-center gap-x-2.5">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-xs font-bold text-green-700 dark:text-green-400">Desafíos Resueltos</span>
              </div>
              <span className="text-xl font-black text-green-600 dark:text-green-400">{completedChallengesCount}</span>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground text-center border-t border-slate-100 dark:border-slate-900 pt-3">
            ¡Sigue así! Tu constancia asegura tu ingreso.
          </div>
        </div>

        {/* Card 4: Stripe Subscription Card (lg:col-span-6, row-span-1) */}
        <div className={cn(
          "lg:col-span-6 row-span-1 rounded-3xl border-2 p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md bg-white dark:bg-background dark:border-border",
          isPro 
            ? "from-yellow-400/10 via-yellow-400/5 to-transparent border-yellow-200 dark:border-yellow-900/30"
            : "from-slate-100 via-transparent to-transparent"
        )}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Membresía</span>
              <h3 className="text-lg font-black text-neutral-800 dark:text-white">Estado de Suscripción</h3>
            </div>
            <div className="h-10 w-10 bg-muted rounded-2xl flex items-center justify-center border dark:border-border">
              <Image src="/unlimited.svg" alt="Unlimited" height={22} width={22} />
            </div>
          </div>
          <div className="my-auto py-2">
            {isPro ? (
              <div className="flex items-center gap-x-2 text-yellow-600 dark:text-yellow-400">
                <Sparkles className="h-5 w-5 animate-spin" />
                <span className="text-xl font-black">Plan Super Cachimbo Activo</span>
              </div>
            ) : (
              <div>
                <p className="text-xl font-black text-neutral-800 dark:text-white">Plan Básico Gratuito</p>
                <p className="text-xs text-muted-foreground">Vidas limitadas a 5 corazones diarios.</p>
              </div>
            )}
          </div>
          <div>
            {!isPro ? (
              <Link href="/shop">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-green-500 hover:text-green-600 p-0 hover:bg-transparent">
                  Mejorar a Super Cachimbo (Vidas ilimitadas)
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            ) : (
              <div className="text-xs font-bold text-green-500">
                ¡Gracias por tu apoyo! Tienes vidas ilimitadas y soporte IA exclusivo.
              </div>
            )}
          </div>
        </div>

        {/* Card 5: Tutor IA Shortcut (lg:col-span-6, row-span-1) */}
        <div className="lg:col-span-6 row-span-1 rounded-3xl border-2 border-border p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md bg-white dark:bg-background">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-x-3">
              <div className="h-10 w-10 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Image src="/robot.svg" alt="Robot Mascot" height={24} width={24} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-neutral-800 dark:text-white flex items-center gap-x-1">
                  ¿Tienes dudas de comprensión?
                  <Sparkles className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                </h4>
                <p className="text-xs text-muted-foreground">Tu Tutor Socrático está listo para ayudarte</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed my-auto pr-6">
            Entabla una conversación guiada en tiempo real. Resuelve ejercicios de lectura crítica y comprende conceptos de textos complejos paso a paso.
          </p>
          <Link href="/tutor">
            <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 active:border-b-0 border-b-4 border-green-600 text-white font-bold rounded-2xl text-xs py-4 flex items-center justify-center gap-x-1 transition-all">
              Conversar con el Tutor IA
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};
