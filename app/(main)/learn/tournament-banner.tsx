import { prisma } from "@/lib/prisma";
import { TournamentBannerClient } from "./tournament-banner-client";

export const TournamentBanner = async () => {
  const allNext = await prisma.liveTournament.findMany({
    where: {
      status: { in: ['PENDING', 'ACTIVE'] },
      startTime: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    },
    orderBy: { startTime: 'asc' }
  });

  if (allNext.length === 0) {
    return null;
  }

  const firstDayStr = allNext[0].startTime.toDateString();
  const closestTournaments = allNext.filter(t => t.startTime.toDateString() === firstDayStr);

  return (
    <>
      {closestTournaments.map(t => (
         <TournamentBannerClient key={t.id} tournament={t} />
      ))}
    </>
  );
};
