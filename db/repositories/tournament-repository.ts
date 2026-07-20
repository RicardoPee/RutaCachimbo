import { prisma } from "@/lib/prisma";

export const TournamentRepository = {
  create: async (data: any) => {
    return await prisma.liveTournament.create({ data });
  },

  findById: async (id: number) => {
    return await prisma.liveTournament.findUnique({ 
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } }
    });
  },

  findActiveOrPending: async (id?: number) => {
    return await prisma.liveTournament.findFirst({
      where: {
        status: { in: ["PENDING", "ACTIVE", "FINISHED"] },
        ...(id ? { id } : {})
      },
      orderBy: { startTime: "asc" },
      include: { questions: { orderBy: { order: "asc" } } }
    });
  },

  updateStatus: async (id: number, status: any) => {
    return await prisma.liveTournament.update({
      where: { id },
      data: { status }
    });
  },

  createQuestions: async (questions: any[]) => {
    return await prisma.tournamentQuestion.createMany({ data: questions });
  },
  
  findParticipant: async (userId: string, tournamentId: number) => {
    return await prisma.tournamentParticipant.findFirst({
      where: { userId, tournamentId }
    });
  },

  createParticipant: async (data: any) => {
    return await prisma.tournamentParticipant.create({ data });
  },

  updateParticipantScore: async (participantId: number, factionId: number, pointsEarned: number, newAnswers: any[]) => {
    return await prisma.$transaction([
      prisma.tournamentParticipant.update({
        where: { id: participantId },
        data: { score: { increment: pointsEarned }, answers: newAnswers }
      }),
      prisma.faction.update({
        where: { id: factionId },
        data: { totalXp: { increment: pointsEarned } }
      })
    ]);
  },

  getLeaderboard: async (tournamentId: number, skip: number, limit: number) => {
    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      orderBy: { score: "desc" },
      take: limit,
      skip,
      include: { faction: true }
    });
    const totalCount = await prisma.tournamentParticipant.count({
      where: { tournamentId }
    });
    return { participants, totalCount };
  }
};
