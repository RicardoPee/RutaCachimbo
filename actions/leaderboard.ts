"use server";

import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { desc, eq } from "drizzle-orm";

export const finishWeekAction = async () => {
  if (!isAdmin()) {
    return { error: "No autorizado" };
  }

  // 1. Obtener todos los usuarios ordenados por puntos semanales
  const users = await db.query.userProgress.findMany({
    orderBy: [desc(userProgress.weeklyPoints)],
  });

  const nextLeagueMap: Record<string, "BRONCE" | "PLATA" | "ORO" | "DIAMANTE"> = {
    "BRONCE": "PLATA",
    "PLATA": "ORO",
    "ORO": "DIAMANTE",
    "DIAMANTE": "DIAMANTE", // Top league
  };

  const prevLeagueMap: Record<string, "BRONCE" | "PLATA" | "ORO" | "DIAMANTE"> = {
    "BRONCE": "BRONCE",
    "PLATA": "BRONCE",
    "ORO": "PLATA",
    "DIAMANTE": "ORO",
  };

  // Lógica simple: Top 10 ascienden. Los últimos 10 (con puntos > 0) descienden.
  // Como esto es un MVP, haremos un bucle for (no es lo más óptimo para 100k usuarios, pero servirá aquí).
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    let newLeague = user.league;

    if (i < 10 && user.weeklyPoints > 0) {
      // Asciende
      newLeague = nextLeagueMap[user.league as string] || user.league;
    } else if (i >= users.length - 10 && user.weeklyPoints === 0 && user.league !== "BRONCE") {
      // Desciende si no jugó nada o quedó último
      newLeague = prevLeagueMap[user.league as string] || user.league;
    }

    // Resetear puntos semanales a 0
    await db.update(userProgress)
      .set({ 
        league: newLeague as any, 
        weeklyPoints: 0 
      })
      .where(eq(userProgress.userId, user.userId)); 
  }

  revalidatePath("/leaderboard");
  revalidatePath("/admin-panel");

  return { success: true };
};
