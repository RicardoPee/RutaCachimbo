import { prisma } from "@/lib/prisma";

const LEAGUE_ORDER = ["BRONCE", "PLATA", "ORO", "DIAMANTE"] as const;
type League = (typeof LEAGUE_ORDER)[number];

/**
 * Procesa el fin de semana de ligas:
 * - Agrupa usuarios por liga.
 * - Promueve el 20% superior (con puntos > 0) a la liga siguiente.
 * - Desciende a quienes tienen 0 puntos + el 20% inferior (con puntos > 0).
 * - Resetea weekly_points de todos a 0.
 *
 * Es la única fuente de verdad: tanto el cron de Vercel
 * como el botón manual del admin la invocan.
 */
export async function processLeagueWeek(): Promise<{
  promotionsDemotions: number;
  usersProcessed: number;
}> {
  const users = await prisma.userProgress.findMany({
    select: { userId: true, league: true, weeklyPoints: true },
  });

  // Agrupar por liga
  const byLeague: Record<League, typeof users> = {
    BRONCE: [],
    PLATA: [],
    ORO: [],
    DIAMANTE: [],
  };

  for (const u of users) {
    const league = u.league as League;
    if (byLeague[league]) byLeague[league].push(u);
  }

  const updates: { userId: string; newLeague: League }[] = [];

  for (let i = 0; i < LEAGUE_ORDER.length; i++) {
    const currentLeague = LEAGUE_ORDER[i];
    const leagueUsers = [...byLeague[currentLeague]].sort(
      (a, b) => b.weeklyPoints - a.weeklyPoints
    );

    if (leagueUsers.length === 0) continue;

    // Al menos 1, máximo 20% del grupo
    const moveCount = Math.max(1, Math.floor(leagueUsers.length * 0.2));

    // Promociones (todos menos Diamante)
    if (i < LEAGUE_ORDER.length - 1) {
      const nextLeague = LEAGUE_ORDER[i + 1];
      const toPromote = leagueUsers
        .slice(0, moveCount)
        .filter((u) => u.weeklyPoints > 0);
      for (const u of toPromote) {
        updates.push({ userId: u.userId, newLeague: nextLeague });
      }
    }

    // Descensos (todos menos Bronce)
    if (i > 0) {
      const prevLeague = LEAGUE_ORDER[i - 1];
      const zeroPoints = leagueUsers.filter((u) => u.weeklyPoints === 0);
      const bottom = leagueUsers
        .slice(-moveCount)
        .filter((u) => u.weeklyPoints > 0);

      // Evitar duplicados
      const alreadyQueued = new Set(updates.map((u) => u.userId));
      const toDemote = [...new Set([...zeroPoints, ...bottom])].filter(
        (u) => !alreadyQueued.has(u.userId)
      );

      for (const u of toDemote) {
        updates.push({ userId: u.userId, newLeague: prevLeague });
      }
    }
  }

  // Ejecutar en una sola transacción
  await prisma.$transaction(async (tx) => {
    for (const update of updates) {
      await tx.userProgress.update({
        where: { userId: update.userId },
        data: { league: update.newLeague },
      });
    }
    // Resetear puntos semanales de TODOS
    await tx.userProgress.updateMany({ data: { weeklyPoints: 0 } });
  });

  return {
    promotionsDemotions: updates.length,
    usersProcessed: users.length,
  };
}
