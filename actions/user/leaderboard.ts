"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { processLeagueWeek } from "@/lib/leagues";

export const finishWeekAction = async () => {
  if (!isAdmin()) {
    return { error: "No autorizado" };
  }

  try {
    const result = await processLeagueWeek();

    revalidatePath("/leaderboard");
    revalidatePath("/admin-panel");

    return { success: true, ...result };
  } catch (e) {
    console.error("[FINISH_WEEK_ACTION_ERROR]", e);
    return { error: "Error al procesar el fin de semana de ligas." };
  }
};

