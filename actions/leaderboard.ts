"use server";

import { revalidatePath } from "next/cache";
import { League } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { PROMOTION_ZONE, DEMOTION_ZONE } from "@/constants";

const NEXT_LEAGUE: Record<League, League> = {
  BRONCE: League.PLATA,
  PLATA: League.ORO,
  ORO: League.DIAMANTE,
  DIAMANTE: League.DIAMANTE,
};

const PREV_LEAGUE: Record<League, League> = {
  BRONCE: League.BRONCE,
  PLATA: League.BRONCE,
  ORO: League.PLATA,
  DIAMANTE: League.ORO,
};

export const finishWeekAction = async () => {
  if (!isAdmin()) {
    return { error: "No autorizado" };
  }

  // Una sola query liviana para decidir ascensos/descensos,
  // y updates masivos agrupados por liga destino (sin N+1).
  const users = await prisma.userProgress.findMany({
    select: { userId: true, league: true, weeklyPoints: true },
    orderBy: { weeklyPoints: "desc" },
  });

  const moves = new Map<League, string[]>();

  users.forEach((user, i) => {
    let newLeague = user.league;

    if (i < PROMOTION_ZONE && user.weeklyPoints > 0) {
      newLeague = NEXT_LEAGUE[user.league];
    } else if (
      i >= users.length - DEMOTION_ZONE &&
      user.weeklyPoints === 0 &&
      user.league !== League.BRONCE
    ) {
      newLeague = PREV_LEAGUE[user.league];
    }

    if (newLeague !== user.league) {
      const ids = moves.get(newLeague) ?? [];
      ids.push(user.userId);
      moves.set(newLeague, ids);
    }
  });

  await prisma.$transaction([
    ...Array.from(moves.entries()).map(([league, userIds]) =>
      prisma.userProgress.updateMany({
        where: { userId: { in: userIds } },
        data: { league },
      })
    ),
    prisma.userProgress.updateMany({
      data: { weeklyPoints: 0 },
    }),
  ]);

  revalidatePath("/leaderboard");
  revalidatePath("/admin-panel");

  return { success: true };
};
