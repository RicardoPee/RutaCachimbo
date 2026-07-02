"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isAdminId } from "@/lib/admin";

export const createWarEvent = async (data: any) => {
    const { userId } = auth();
  if (!isAdminId(userId)) return { error: "No autorizado" };

  try {
    const tournament = await prisma.liveTournament.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        toleranceMinutes: data.toleranceMinutes,
        roundDuration: data.roundDuration,
        intermissionTime: data.intermissionTime,
      }
    });

    // Si recibimos un array de IDs específicos desde el Draft del Administrador, usamos esos.
    // Caso contrario, aplicamos fallback.
    let lessonsWithReadings = [];
    
    if (data.selectedLessonIds && data.selectedLessonIds.length > 0) {
      lessonsWithReadings = await prisma.lesson.findMany({
        where: { id: { in: data.selectedLessonIds } },
        include: {
          challenges: {
            where: { type: "SELECT" },
            include: { challengeOptions: true }
          }
        }
      });
      // Ordenar las lecciones en el mismo orden que el array de IDs del borrador
      lessonsWithReadings.sort((a, b) => data.selectedLessonIds.indexOf(a.id) - data.selectedLessonIds.indexOf(b.id));
    } else {
      lessonsWithReadings = await prisma.lesson.findMany({
        where: {
          referenceText: { not: null },
          challenges: { some: { type: "SELECT" } }
        },
        include: {
          challenges: {
            where: { type: "SELECT" },
            include: { challengeOptions: true }
          }
        },
        take: data.questionCount || 5
      });
    }

    const questionsData: any[] = [];
    let order = 1;

    for (const lesson of lessonsWithReadings) {
      if (lesson.challenges.length > 0) {
        // Tomar un reto aleatorio de esta lectura
        const challenge = lesson.challenges[0];
        const correctOptionIndex = challenge.challengeOptions.findIndex(opt => opt.correct);
        
        if (correctOptionIndex !== -1) {
          questionsData.push({
            tournamentId: tournament.id,
            order: order++,
            readingText: lesson.referenceText || "Lee atentamente el siguiente texto:",
            questionText: challenge.question,
            options: challenge.challengeOptions.map(opt => opt.text),
            correctIndex: correctOptionIndex,
            basePoints: 150,
          });
        }
      }
    }

    if (questionsData.length > 0) {
      await prisma.tournamentQuestion.createMany({ data: questionsData });
    } else {
      // Fallback in case the DB doesn't have referenceText lessons yet
      await prisma.tournamentQuestion.create({
        data: {
          tournamentId: tournament.id,
          order: 1,
          readingText: "[FALLBACK] El sistema no encontró lecciones con texto de referencia en la base de datos. Asegúrate de agregar lecturas.",
          questionText: "¿Entendido?",
          options: ["Sí", "No"],
          correctIndex: 0,
          basePoints: 50,
        }
      });
    }

    return { success: true, tournament };
  } catch (e) {
    return { error: "Error creando el evento." };
  }
};

export const getTournamentState = async (tournamentId?: number) => {
  const { userId } = auth();
  if (!userId) return null;

  const tournament = await prisma.liveTournament.findFirst({
    where: {
      status: { in: ["PENDING", "ACTIVE", "FINISHED"] },
      ...(tournamentId ? { id: tournamentId } : {})
    },
    orderBy: { startTime: "asc" },
    include: { questions: { orderBy: { order: "asc" } } }
  });

  if (!tournament) return null;

  const participant = await prisma.tournamentParticipant.findFirst({
    where: { userId, tournamentId: tournament.id }
  });

  const now = new Date();
  const startTime = new Date(tournament.startTime);
  const answers = participant?.answers as any[] || [];
  
  let phase = "WAITING";
  let timeRemaining = 0;
  let questionsWithoutAnswers: any[] = [];

  const totalTime = tournament.roundDuration * tournament.questions.length;

  if (tournament.status === "FINISHED") {
    phase = "FINISHED";
  } else if (now >= startTime) {
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    timeRemaining = Math.max(0, totalTime - elapsedSeconds);

    if (answers.length >= tournament.questions.length || timeRemaining <= 0) {
      phase = "SUMMARY"; // Examen finalizado para el usuario, esperando publicación
    } else {
      phase = "QUESTION";
      // Ocultar la respuesta correcta para evitar trampas en el cliente
      questionsWithoutAnswers = tournament.questions.map(q => ({
        id: q.id,
        order: q.order,
        readingText: q.readingText,
        questionText: q.questionText,
        options: q.options,
        basePoints: q.basePoints
      }));
    }
  } else {
    timeRemaining = Math.floor((startTime.getTime() - now.getTime()) / 1000);
  }

  const isToleranceActive = now >= startTime && now <= new Date(startTime.getTime() + tournament.toleranceMinutes * 60000);

  return {
    id: tournament.id,
    title: tournament.title,
    phase,
    timeRemaining,
    questions: questionsWithoutAnswers,
    totalQuestions: tournament.questions.length,
    isToleranceActive,
    startTime: tournament.startTime,
    isRegistered: !!participant,
    userAnswers: answers,
    fullQuestionsForSummary: phase === "SUMMARY" || phase === "FINISHED" ? tournament.questions : []
  };
};

export const registerForTournament = async (tournamentId: number) => {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  try {
    const user = await prisma.userProgress.findUnique({ where: { userId } });
    if (!user || !user.factionId) return { error: "No tienes facción asignada" };

    const tournament = await prisma.liveTournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) return { error: "Torneo no encontrado" };

    const now = new Date();
    const registrationDeadline = new Date(tournament.startTime.getTime() - 5 * 60 * 1000);

    if (now > registrationDeadline) {
      return { error: "La inscripción cerró 5 minutos antes del inicio del torneo." };
    }

    const participant = await prisma.tournamentParticipant.findFirst({
      where: { userId, tournamentId }
    });

    if (!participant) {
      await prisma.tournamentParticipant.create({
        data: {
          userId,
          tournamentId,
          factionId: user.factionId,
          answers: []
        }
      });
    }

    revalidatePath("/factions");
    return { success: true };
  } catch (e) {
    return { error: "Error al inscribirse en la guerra." };
  }
};

export const joinTournament = async (tournamentId: number) => {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  try {
    const user = await prisma.userProgress.findUnique({ where: { userId } });
    if (!user || !user.factionId) return { error: "No tienes facción asignada" };

    const tournament = await prisma.liveTournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) return { error: "Torneo no encontrado" };

    // Validar tiempo de tolerancia
    const now = new Date();
    const toleranceEnd = new Date(tournament.startTime.getTime() + tournament.toleranceMinutes * 60000);
    
    if (now > toleranceEnd) {
      return { error: "Las puertas del campo de batalla se han cerrado." };
    }

    const participant = await prisma.tournamentParticipant.findFirst({
      where: { userId, tournamentId }
    });

    if (!participant) {
      await prisma.tournamentParticipant.create({
        data: {
          userId,
          tournamentId,
          factionId: user.factionId,
          answers: []
        }
      });
    }

    return { success: true };
  } catch (e) {
    return { error: "Error al unirse al evento." };
  }
};

export const submitTournamentAnswer = async (tournamentId: number, questionId: number, selectedIndex: number, timeRemaining: number, cheatCount: number = 0) => {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  try {
    const participant = await prisma.tournamentParticipant.findFirst({
      where: { userId, tournamentId }
    });
    if (!participant) return { error: "No estás inscrito" };

    const tournament = await prisma.liveTournament.findUnique({ where: { id: tournamentId }, include: { questions: true } });
    const now = new Date();
    const startTime = new Date(tournament!.startTime);
    const totalTime = tournament!.roundDuration * tournament!.questions.length;
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    
    if (elapsedSeconds > totalTime + 10) { // 10 segs gracia
       return { error: "El tiempo del examen ha finalizado" };
    }

    const question = await prisma.tournamentQuestion.findUnique({ where: { id: questionId } });
    if (!question) return { error: "Pregunta inválida" };

    let pointsEarned = 0;
    if (selectedIndex === question.correctIndex) {
      pointsEarned = question.basePoints;
      // Penalización por trampa (3er tab switch = 0 puntos)
      if (cheatCount >= 3) {
        pointsEarned = 0; 
      }
    }

    const currentAnswers = participant.answers as any[] || [];
    if (currentAnswers.find(a => a.questionId === questionId)) {
       return { error: "Ya respondiste esta pregunta" };
    }

    const newAnswers = [...currentAnswers, { questionId, selectedIndex, pointsEarned, cheatCount }];

    await prisma.$transaction([
      prisma.tournamentParticipant.update({
        where: { id: participant.id },
        data: { score: { increment: pointsEarned }, answers: newAnswers }
      }),
      prisma.faction.update({
        where: { id: participant.factionId },
        data: { totalXp: { increment: pointsEarned } }
      })
    ]);

    return { success: true };
  } catch (e) {
    return { error: "Error al registrar la respuesta." };
  }
};

export const publishTournamentResults = async (tournamentId: number) => {
    const { userId } = auth();
  if (!isAdminId(userId)) return { error: "No autorizado" };

  try {
    await prisma.liveTournament.update({
      where: { id: tournamentId },
      data: { status: "FINISHED" }
    });
    revalidatePath(`/admin/wars/${tournamentId}`);
    return { success: true };
  } catch (e) {
    return { error: "Error al publicar resultados" };
  }
};

import { clerkClient } from "@clerk/nextjs/server";

export const getTournamentLeaderboard = async (tournamentId: number) => {
  const participants = await prisma.tournamentParticipant.findMany({
    where: { tournamentId },
    orderBy: { score: "desc" },
    take: 30,
    include: {
      faction: true // Traemos los datos de la Universidad a la que representa
    }
  });

  if (participants.length === 0) return [];

  // Obtener los datos reales de los usuarios desde Clerk
  const userIds = participants.map(p => p.userId);
  const { data: clerkUsers } = await clerkClient.users.getUserList({ userId: userIds });

  // Mapear los datos de Clerk con los participantes
  const enrichedParticipants = participants.map(p => {
    const clerkUser = clerkUsers.find(u => u.id === p.userId);
    return {
      ...p,
      userName: clerkUser ? `${clerkUser.firstName || "Usuario"} ${clerkUser.lastName || ""}`.trim() : "Recluta Fantasma",
      userImage: clerkUser?.imageUrl || "",
      factionName: p.faction?.name || "Mercenario"
    };
  });
  
  return enrichedParticipants;
};

export const syncTournaments = async () => {
  try {
    const activeTournaments = await prisma.liveTournament.findMany({
      where: { status: { in: ['PENDING'] } },
      include: { questions: true }
    });

    const now = new Date();

    for (const t of activeTournaments) {
      let newStatus = t.status;
      const startTime = new Date(t.startTime);
      
      if (now >= startTime) {
        newStatus = 'ACTIVE';
      }

      if (newStatus !== t.status) {
        await prisma.liveTournament.update({
          where: { id: t.id },
          data: { status: newStatus as any }
        });
      }
    }
  } catch (e) {
    console.error("Error sync tournaments", e);
  }
};
