import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Flame, Trophy, Award, Shield, Swords, Calendar, Lock } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getUserProgress } from "@/db/queries";
import { FeedWrapper } from "@/components/layout/feed-wrapper";
import { StickyWrapper } from "@/components/layout/sticky-wrapper";
import { UserProgress } from "@/components/study/user-progress";
import { ChallengeButton } from "@/components/pvp/challenge-button";
import { getBorderStyles, getTitleById } from "@/lib/shop-catalog";
import { ALL_ACHIEVEMENTS } from "@/lib/achievements";

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const { userId: currentUserId } = auth();
  if (!currentUserId) redirect("/learn");

  const [currentUserProgress, targetUserProgress] = await Promise.all([
    getUserProgress(),
    prisma.userProgress.findUnique({
      where: { userId: params.userId },
      include: {
        faction: true,
        activeCourse: true,
      },
    }),
  ]);

  if (!currentUserProgress || !currentUserProgress.activeCourse) {
    redirect("/courses");
  }

  if (!targetUserProgress) {
    notFound();
  }

  const isSelf = currentUserId === targetUserProgress.userId;
  const borderStyles = getBorderStyles(targetUserProgress.activeBorder);
  const activeTitle = getTitleById(targetUserProgress.activeTitle);

  // Contar estadísticas PvP adicionales del usuario
  const pvpStats = await prisma.pvpMatch.aggregate({
    where: {
      status: "FINISHED",
      OR: [
        { player1Id: targetUserProgress.userId },
        { player2Id: targetUserProgress.userId },
      ],
    },
    _count: {
      id: true,
    },
  });

  const joinedDate = targetUserProgress.factionJoinedAt
    ? new Date(targetUserProgress.factionJoinedAt).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      {/* Sidebar de Progreso */}
      <StickyWrapper>
        <UserProgress
          activeCourse={currentUserProgress.activeCourse}
          hearts={currentUserProgress.hearts}
          points={currentUserProgress.points}
          hasActiveSubscription={false}
          streak={currentUserProgress.streak}
        />
      </StickyWrapper>

      {/* Flujo Principal */}
      <FeedWrapper>
        <div className="w-full space-y-8 pb-12 animate-in fade-in-50 duration-500">
          {/* Header de retorno */}
          <div className="flex items-center gap-4">
            <Link
              href="/leaderboard"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white">Perfil de Cachimbo</h1>
              <p className="text-xs text-muted-foreground">Detalles del estudiante y logros</p>
            </div>
          </div>

          {/* Tarjeta de Perfil Principal */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-xl">
            {/* Fondo de banner decorativo dependiente de la facción o racha */}
            <div className="h-32 w-full bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-indigo-500/20 dark:from-emerald-950/40 dark:via-slate-950 dark:to-indigo-950/40 relative">
              {targetUserProgress.faction && (
                <div className="absolute top-4 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-950/80 backdrop-blur border border-border dark:border-slate-800 text-xs font-bold shadow-sm">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>Facción: {targetUserProgress.faction.name}</span>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-12">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
                {/* Avatar con Borde Dinámico */}
                <div className={`relative w-24 h-24 rounded-full overflow-hidden border-4 flex items-center justify-center bg-card shadow-lg ${borderStyles}`}>
                  <Image
                    src={targetUserProgress.userImageSrc}
                    alt={targetUserProgress.userName}
                    width={80}
                    height={80}
                    className="object-cover rounded-full"
                  />
                </div>

                <div className="space-y-1">
                  {activeTitle && (
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                      {activeTitle.title}
                    </span>
                  )}
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                    {targetUserProgress.userName}
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Estudiante de {targetUserProgress.activeCourse?.title || "Ruta Cachimbo"}
                  </p>
                </div>
              </div>

              {/* Botón de Desafío (solo si no es el perfil propio) */}
              {!isSelf && (
                <ChallengeButton
                  targetUserId={targetUserProgress.userId}
                  targetUserName={targetUserProgress.userName}
                />
              )}
            </div>
          </div>

          {/* Grid de Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {/* Puntos totales */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500"><Trophy className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Puntos Totales</p>
                <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{targetUserProgress.points} XP</p>
              </div>
            </div>

            {/* Racha */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500"><Flame className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Racha Activa</p>
                <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{targetUserProgress.streak} días</p>
              </div>
            </div>

            {/* Duelos PvP */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500"><Swords className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Duelos PvP</p>
                <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{pvpStats._count.id} combates</p>
              </div>
            </div>

            {/* Liga actual */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><Award className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Liga Actual</p>
                <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5 uppercase tracking-wide">{targetUserProgress.league}</p>
              </div>
            </div>
          </div>

          {/* Sección de Logros */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Logros Obtenidos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {ALL_ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = targetUserProgress.unlockedAchievements.includes(achievement.id);

                return (
                  <div
                    key={achievement.id}
                    className={`relative overflow-hidden border rounded-2xl p-4 flex gap-4 transition-all duration-300 ${
                      isUnlocked
                        ? "bg-white dark:bg-slate-900 border-emerald-500/30 shadow-sm"
                        : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-850 opacity-60"
                    }`}
                  >
                    {/* Icono del Logro */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                      isUnlocked
                        ? "bg-emerald-500/10"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}>
                      {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-slate-400" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
                          {achievement.name}
                        </h4>
                        {isUnlocked && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                            Desbloqueado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">
                        {achievement.description}
                      </p>
                      {isUnlocked && (
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          Recompensa: +{achievement.xpBonus} XP
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Información Adicional de Facción */}
          {targetUserProgress.faction && (
            <div className="bg-gradient-to-r from-indigo-900/10 to-purple-900/10 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-900/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Shield className="w-7 h-7 text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 dark:text-white text-base">
                    Facción: {targetUserProgress.faction.name}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md mt-0.5">
                    {targetUserProgress.faction.description}
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right shrink-0">
                <p className="text-xs text-muted-foreground font-semibold">Miembro desde</p>
                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{joinedDate}</p>
              </div>
            </div>
          )}
        </div>
      </FeedWrapper>
    </div>
  );
}
