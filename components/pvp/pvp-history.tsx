import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Swords, Trophy, ShieldX, Coins, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

export async function PvpHistory() {
  const { userId } = auth();
  if (!userId) return null;

  // Buscar las últimas 10 partidas PvP completadas por el usuario
  const matches = await prisma.pvpMatch.findMany({
    where: {
      status: "FINISHED",
      OR: [
        { player1Id: userId },
        { player2Id: userId },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  if (matches.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
        <Swords className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">Sin historial de duelos</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Aún no has completado batallas 1v1. ¡Crea o únete a una sala para comenzar tu legado en la Arena!
        </p>
      </div>
    );
  }

  // Obtener los datos de perfil de todos los oponentes y del usuario
  const playerIds = Array.from(
    new Set(
      matches.flatMap((m) => [m.player1Id, m.player2Id].filter(Boolean) as string[])
    )
  );

  const players = await prisma.userProgress.findMany({
    where: {
      userId: { in: playerIds },
    },
    select: {
      userId: true,
      userName: true,
      userImageSrc: true,
      activeBorder: true,
      activeTitle: true,
    },
  });

  const playersMap = new Map(players.map((p) => [p.userId, p]));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-500" /> Historial de Batallas
        </h2>
        <span className="text-xs text-muted-foreground font-semibold">Últimos 10 combates</span>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
        {matches.map((match) => {
          const isPlayer1 = match.player1Id === userId;
          const userScore = isPlayer1 ? match.player1Score : match.player2Score;
          const oppId = isPlayer1 ? match.player2Id : match.player1Id;
          const opp = oppId ? playersMap.get(oppId) : null;
          const oppScore = isPlayer1 ? match.player2Score : match.player1Score;

          // Determinar resultado
          let outcome: "WIN" | "LOSS" | "DRAW" = "DRAW";
          if (userScore > oppScore) outcome = "WIN";
          else if (oppScore > userScore) outcome = "LOSS";

          const wager = match.wagerPoints;
          const xpDiff = outcome === "WIN" ? wager : outcome === "LOSS" ? -Math.min(wager, 50) : 0; // deducción máxima de 50 o el wager real

          const formattedDate = new Date(match.createdAt).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={match.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
            >
              {/* Oponente Info */}
              <div className="flex items-center gap-3">
                {/* Resultado Badge */}
                {outcome === "WIN" && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                )}
                {outcome === "LOSS" && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0">
                    <ShieldX className="w-5 h-5" />
                  </div>
                )}
                {outcome === "DRAW" && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                    <Swords className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                      vs {opp ? opp.userName : "Contrincante"}
                    </span>
                    {opp && (
                      <Link
                        href={`/perfil/${opp.userId}`}
                        className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
                      >
                        Perfil <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {opp && (
                      <div className="relative w-5 h-5 rounded-full overflow-hidden border border-border shrink-0">
                        <Image
                          src={opp.userImageSrc}
                          alt={opp.userName}
                          fill
                          sizes="20px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
                      {outcome === "WIN" && "Victoria"}
                      {outcome === "LOSS" && "Derrota"}
                      {outcome === "DRAW" && "Empate"}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Marcador */}
              <div className="flex items-center gap-4 sm:justify-end">
                {/* Score */}
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 sm:justify-end">
                    <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                  </p>
                  <p className="text-base font-black text-slate-800 dark:text-white mt-0.5">
                    {userScore} <span className="text-slate-400 font-medium text-sm">a</span> {oppScore}
                  </p>
                </div>

                {/* XP Recompensa */}
                <div className="flex items-center justify-center min-w-[80px]">
                  {xpDiff > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                      +{xpDiff} XP
                    </span>
                  ) : xpDiff < 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-black">
                      {xpDiff} XP
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black">
                      0 XP
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
