"use server";
import { auth } from "@clerk/nextjs/server";
import { PvpStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logMistake } from "@/actions/mistakes";
import { getMockExamQuestions } from "./mock-exam-actions";
import { pusherServer } from "@/lib/pusher";
import { PVP_POINTS_PER_CORRECT, PVP_NEGOTIATION_TIMEOUT_MS } from "@/constants";

const triggerMatchUpdate = async (matchId: number) => {
  if (pusherServer) {
    try {
      await pusherServer.trigger(`match-${matchId}`, "match-updated", {});
    } catch (e) {
      console.error("Pusher trigger error", e);
    }
  }
};

export async function createPvPLobby(universityId: string) {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const examRes = await getMockExamQuestions(universityId);
  if (examRes.error || !examRes.questions) return { error: examRes.error || "No hay preguntas disponibles para esta universidad" };

  try {
    const match = await prisma.pvpMatch.create({
      data: {
        code,
        status: "NEGOTIATING",
        player1Id: userId,
        questions: examRes.questions as any,
      }
    });
    return { success: true, matchId: match.id, code: match.code };
  } catch (e) {
    return { error: "Error creando la sala de batalla" };
  }
}

export async function joinPvPLobby(code: string) {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  const match = await prisma.pvpMatch.findUnique({ where: { code } });
  if (!match) return { error: "Sala no encontrada o código incorrecto" };
  if (match.status !== "NEGOTIATING" && match.status !== "WAITING") return { error: "La sala ya está en juego o terminó" };
  
  if (match.player1Id === userId) return { success: true, matchId: match.id };

  try {
    await prisma.pvpMatch.update({
      where: { id: match.id },
      data: {
        player2Id: userId,
        status: "NEGOTIATING"
      }
    });
    await triggerMatchUpdate(match.id);
    return { success: true, matchId: match.id };
  } catch (e) {
    return { error: "Error uniéndose a la sala" };
  }
}

export async function getMatchState(matchId: number) {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  const match = await prisma.pvpMatch.findUnique({ where: { id: matchId } });
  if (!match) return { error: "Sala no encontrada" };

  // Timer: 10 minute logic during NEGOTIATING phase
  if (match.status === "NEGOTIATING") {
    const elapsed = Date.now() - new Date(match.createdAt).getTime();
    if (elapsed > PVP_NEGOTIATION_TIMEOUT_MS) {
      await prisma.pvpMatch.update({ where: { id: matchId }, data: { status: "FINISHED" } });
      return { error: "Tiempo de negociación agotado (10 minutos). La sala se cerró para evitar bugs." };
    }
  }

  // Auto-start if both players accepted the same wager
  if (match.status === "NEGOTIATING" && match.p1Ready && match.p2Ready) {
    // If they are both ready, start the match!
    const updated = await prisma.pvpMatch.update({
      where: { id: matchId },
      data: {
        status: "PLAYING",
        currentTurnId: Math.random() > 0.5 ? match.player1Id : match.player2Id // Random starter
      }
    });
    await triggerMatchUpdate(matchId);
    return { success: true, match: updated };
  }

  return { success: true, match };
}

export async function proposeWager(matchId: number, wager: number) {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };
  const match = await prisma.pvpMatch.findUnique({ where: { id: matchId } });
  if (!match || match.status !== "NEGOTIATING") return { error: "No en fase de negociación" };

  const isP1 = match.player1Id === userId;
  await prisma.pvpMatch.update({
    where: { id: matchId },
    data: isP1 ? { p1WagerProposal: wager, p1Ready: true, p2Ready: false } : { p2WagerProposal: wager, p2Ready: true, p1Ready: false }
  });
  await triggerMatchUpdate(matchId);
  return { success: true };
}

export async function acceptWager(matchId: number) {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };
  const match = await prisma.pvpMatch.findUnique({ where: { id: matchId } });
  if (!match) return { error: "Sala no encontrada" };
  const isP1 = match.player1Id === userId;
  
  const agreedWager = isP1 ? match.p2WagerProposal : match.p1WagerProposal;
  if (agreedWager === null) return { error: "No hay propuesta rival" };

  await prisma.pvpMatch.update({
    where: { id: matchId },
    data: isP1 ? { p1WagerProposal: agreedWager, p1Ready: true, wagerPoints: agreedWager } : { p2WagerProposal: agreedWager, p2Ready: true, wagerPoints: agreedWager }
  });
  await triggerMatchUpdate(matchId);
  return { success: true };
}

export async function submitPvPAnswer(matchId: number, answerIndex: number) {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };
  const match = await prisma.pvpMatch.findUnique({ where: { id: matchId } });
  if (!match || match.status !== "PLAYING") return { error: "Partida no activa" };
  if (match.currentTurnId !== userId) return { error: "¡Hey! No es tu turno" };

  const questions = match.questions as any[];
  const currentQ = questions[match.currentQuestionIndex];
  const isCorrect = currentQ.options[answerIndex]?.isCorrect;
  
  const isP1 = match.player1Id === userId;
  const rivalId = isP1 ? match.player2Id : match.player1Id;

  let newScore1 = match.player1Score;
  let newScore2 = match.player2Score;
  let nextTurn = match.currentTurnId;
  let nextQIndex = match.currentQuestionIndex;

  if (isCorrect) {
    if (isP1) newScore1 += PVP_POINTS_PER_CORRECT; else newScore2 += PVP_POINTS_PER_CORRECT;
    nextQIndex++;
    // Keeps turn! (Combo Infinito)
  } else {
    // Fails, turn passes to rival on the SAME question
    nextTurn = rivalId!;
    const correctOpt = currentQ.options.find((o: any) => o.isCorrect);
    logMistake("PVP", currentQ.question, currentQ.options[answerIndex]?.text || "", correctOpt?.text);
  }

  const finished = nextQIndex >= questions.length;
  const status: PvpStatus = finished ? PvpStatus.FINISHED : match.status;

  // Actualización atómica: estado del match + reparto de la apuesta (si terminó)
  const operations: any[] = [
    prisma.pvpMatch.update({
      where: { id: matchId },
      data: {
        player1Score: newScore1,
        player2Score: newScore2,
        currentTurnId: nextTurn,
        currentQuestionIndex: nextQIndex,
        status,
      },
    }),
  ];

  if (finished) {
    const wager = match.wagerPoints || 0;
    const winnerId = newScore1 > newScore2 ? match.player1Id : newScore2 > newScore1 ? match.player2Id : null;
    const loserId = winnerId === match.player1Id ? match.player2Id : winnerId === match.player2Id ? match.player1Id : null;

    if (wager > 0 && winnerId && loserId) {
      operations.push(
        prisma.userProgress.updateMany({
          where: { userId: winnerId },
          data: { points: { increment: wager }, weeklyPoints: { increment: wager } },
        }),
        prisma.userProgress.updateMany({
          where: { userId: loserId },
          data: { points: { decrement: wager } },
        }),
      );
    }
  }

  await prisma.$transaction(operations);
  await triggerMatchUpdate(matchId);
  return { success: true, isCorrect, nextTurn };
}
