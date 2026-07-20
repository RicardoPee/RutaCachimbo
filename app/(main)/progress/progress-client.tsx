"use client";

import { useState } from "react";
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
  ShieldAlert,
  Brain,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RadarChart } from "./radar-chart";
import { UserAchievementStatus } from "@/actions/achievement-actions";
import { getBorderStyles } from "@/lib/shop-catalog";

type DynamicQuest = {
  title: string;
  value: number;
  currentValue: number;
  isCompleted: boolean;
  progressPercentage: number;
  type: string;
};

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
  achievements: UserAchievementStatus[];
  dynamicQuests: DynamicQuest[];
};

export const ProgressClient = ({
  userProgress,
  isPro,
  completedChallengesCount,
  weeklyRank,
  achievements,
  dynamicQuests,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"skills" | "quests" | "achievements">("skills");

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
            <div className={`relative h-20 w-20 rounded-2xl overflow-hidden border-4 shadow-sm flex-shrink-0 ${getBorderStyles(userProgress.activeBorder)}`}>
              <Image 
                src={userProgress.userImageSrc} 
                alt={userProgress.userName} 
                fill 
                className="object-cover"
              />
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

        {/* Card 6: Panel de Control de Progreso (Habilidades, Misiones, Logros) */}
        <div className="lg:col-span-10 rounded-3xl border-2 border-border p-8 flex flex-col transition-all duration-300 hover:shadow-xl bg-white dark:bg-background">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-border pb-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Seguimiento de Avance</span>
              <h3 className="text-2xl font-black text-neutral-800 dark:text-white flex items-center gap-2">
                🎯 Mi Desempeño Académico
              </h3>
            </div>
            
            {/* Tabs Trigger */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800 w-full md:w-auto">
              <button
                onClick={() => setActiveTab("skills")}
                className={cn(
                  "flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-x-2",
                  activeTab === "skills"
                    ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Brain className="w-4 h-4" />
                Habilidades
              </button>
              <button
                onClick={() => setActiveTab("quests")}
                className={cn(
                  "flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-x-2",
                  activeTab === "quests"
                    ? "bg-white dark:bg-slate-800 text-yellow-500 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Zap className="w-4 h-4" />
                Misiones
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={cn(
                  "flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-x-2",
                  activeTab === "achievements"
                    ? "bg-white dark:bg-slate-800 text-violet-500 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Trophy className="w-4 h-4" />
                Logros
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 min-h-[350px]">
            {activeTab === "skills" && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-3 min-h-[300px] w-full">
                  <RadarChart 
                    data={[
                      { subject: 'Inferencia', A: 85, fullMark: 100 },
                      { subject: 'Idea Principal', A: 90, fullMark: 100 },
                      { subject: 'Vocabulario', A: 70, fullMark: 100 },
                      { subject: 'Compatibilidad', A: 60, fullMark: 100 },
                      { subject: 'Extrapolación', A: 75, fullMark: 100 },
                    ]}
                  />
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <h4 className="font-bold text-emerald-500 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Análisis de Habilidades IA
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Este gráfico de radar representa tu dominio actual sobre las competencias lectoras clave evaluadas en los exámenes de admisión. Las áreas más extendidas indican tus fortalezas, mientras que los puntos contraídos señalan temas que requieren refuerzo.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-foreground">Idea Principal (Comprensión Global)</span>
                      <span className="font-bold text-emerald-500">90% (Excelente)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-foreground">Inferencia (Lógica Textual)</span>
                      <span className="font-bold text-emerald-500">85% (Fuerte)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-foreground">Extrapolación (Hipótesis)</span>
                      <span className="font-bold text-amber-500">75% (Aceptable)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "quests" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dynamicQuests.map((quest) => {
                    return (
                      <div
                        key={quest.title}
                        className={cn(
                          "p-6 border-2 rounded-2xl flex flex-col justify-between transition-all gap-y-4",
                          quest.isCompleted
                            ? "border-green-400 bg-green-500/5 dark:bg-green-950/20"
                            : "border-border bg-card dark:bg-slate-900/10"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                            quest.isCompleted ? "bg-green-500 text-white border-green-600" : "bg-yellow-500 text-white border-yellow-600"
                          )}>
                            {quest.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                            quest.isCompleted ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          )}>
                            {quest.isCompleted ? "Completado" : "En Curso"}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground mb-1">{quest.title}</h4>
                          <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                            <span>Progreso semanal</span>
                            <span className="font-bold">{quest.currentValue} / {quest.value}</span>
                          </div>
                          <div className="relative w-full h-2.5 bg-neutral-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "absolute top-0 left-0 h-full transition-all duration-700",
                                quest.isCompleted ? "bg-green-500" : "bg-yellow-500"
                              )}
                              style={{ width: `${quest.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {achievements?.map((ach) => (
                  <div 
                    key={ach.id}
                    className={cn(
                      "p-5 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all duration-300 relative group overflow-hidden",
                      ach.unlocked 
                        ? "border-violet-500 bg-violet-500/10 text-violet-900 dark:text-violet-100 shadow-md"
                        : "border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/20 text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner transition-transform duration-500 group-hover:rotate-12",
                      ach.unlocked ? "bg-violet-500/20" : "bg-slate-200 dark:bg-slate-800 grayscale"
                    )}>
                      {ach.icon}
                    </div>
                    <h4 className={cn("font-bold text-sm mb-1", ach.unlocked ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-600")}>
                      {ach.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-normal mb-3 max-w-[150px]">
                      {ach.description}
                    </p>
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                      ach.unlocked 
                        ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                    )}>
                      {ach.unlocked ? `+${ach.xpBonus} XP` : "Bloqueado"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
