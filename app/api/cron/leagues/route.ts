import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // Check authorization to prevent abuse (Vercel passes CRON_SECRET).
  // Falla cerrado: si CRON_SECRET no está configurada, nadie puede ejecutarlo.
  const authHeader = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.userProgress.findMany({
      select: { userId: true, league: true, weeklyPoints: true },
    });

    const leagues = ["BRONCE", "PLATA", "ORO", "DIAMANTE"];
    const usersByLeague: Record<string, typeof users> = {
      BRONCE: [],
      PLATA: [],
      ORO: [],
      DIAMANTE: [],
    };

    users.forEach((u) => {
      if (usersByLeague[u.league]) {
        usersByLeague[u.league].push(u);
      }
    });

    const updates: { userId: string; newLeague: string }[] = [];

    for (let i = 0; i < leagues.length; i++) {
      const currentLeague = leagues[i];
      const leagueUsers = usersByLeague[currentLeague].sort(
        (a, b) => b.weeklyPoints - a.weeklyPoints
      );

      if (leagueUsers.length === 0) continue;

      // Calculate how many people to promote/demote (20% or at least 1 if > 3 people)
      const moveCount = Math.max(1, Math.floor(leagueUsers.length * 0.2));

      // Promotions
      if (i < leagues.length - 1) { // Not Diamond
        const nextLeague = leagues[i + 1];
        const toPromote = leagueUsers.slice(0, moveCount).filter(u => u.weeklyPoints > 0);
        toPromote.forEach((u) => {
          updates.push({ userId: u.userId, newLeague: nextLeague });
        });
      }

      // Demotions
      if (i > 0) { // Not Bronze
        const prevLeague = leagues[i - 1];
        // People with 0 points get automatically demoted, or the bottom 20%
        const zeroPoints = leagueUsers.filter((u) => u.weeklyPoints === 0);
        const bottomUsers = leagueUsers.slice(-moveCount).filter(u => u.weeklyPoints > 0);
        
        const toDemote = [...new Set([...zeroPoints, ...bottomUsers])];
        
        toDemote.forEach((u) => {
          // Avoid double queueing if something goes wrong
          if (!updates.find(up => up.userId === u.userId)) {
            updates.push({ userId: u.userId, newLeague: prevLeague });
          }
        });
      }
    }

    // Execute updates
    await prisma.$transaction(async (tx) => {
      // 1. Update leagues
      for (const update of updates) {
        await tx.userProgress.update({
          where: { userId: update.userId },
          data: { league: update.newLeague as any },
        });
      }

      // 2. Reset weekly points for EVERYONE
      await tx.userProgress.updateMany({
        data: { weeklyPoints: 0 },
      });
    });

    return NextResponse.json({
      success: true,
      promotionsDemotions: updates.length,
      usersProcessed: users.length,
    });
  } catch (error) {
    console.error("[CRON_LEAGUES_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
