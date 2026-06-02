import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { FactionsClient } from "./factions-client";
import { syncTournaments } from "@/actions/tournament-actions";

export default async function FactionsPage() {
  const { userId } = auth();
  if (!userId) redirect("/learn");

  await syncTournaments();

  const [user, factions, nextTournaments, pastTournaments, userRegistrations] = await Promise.all([
    prisma.userProgress.findUnique({
      where: { userId },
      include: { faction: true }
    }),
    prisma.faction.findMany({
      orderBy: { totalXp: "desc" },
      include: {
        _count: {
          select: { members: true }
        }
      }
    }),
    prisma.liveTournament.findMany({
      where: {
        status: { in: ['PENDING', 'ACTIVE'] }
      },
      orderBy: { startTime: "asc" }
    }),
    prisma.liveTournament.findMany({
      where: { status: 'FINISHED' },
      orderBy: { startTime: 'desc' },
      take: 5 // Mostrar últimos 5 torneos
    }),
    prisma.tournamentParticipant.findMany({
      where: { userId },
      select: { tournamentId: true }
    })
  ]);

  const registeredTournamentIds = userRegistrations.map(r => r.tournamentId);

  const adminId = process.env.ADMIN_USER_ID;
  const isAdmin = userId === adminId;

  return (
    <div className="w-full flex justify-center min-h-screen bg-slate-50 dark:bg-background pb-20">
      <FactionsClient 
        currentUser={{...user, isAdmin}} 
        factions={factions} 
        nextTournaments={nextTournaments}
        pastTournaments={pastTournaments}
        registeredTournamentIds={registeredTournamentIds}
      />
    </div>
  );
}
