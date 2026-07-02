import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { AdminDashboardClient } from "./client";

const AdminPanelPage = async () => {
  if (!isAdmin()) {
    redirect("/learn");
  }

  // Cargar datos directamente desde el server component (sin API)
  const [allUsers, allChallengeProgress, allChallenges, allLessons] = await Promise.all([
    prisma.userProgress.findMany(),
    prisma.challengeProgress.findMany(),
    prisma.challenge.findMany(),
    prisma.lesson.findMany({
      include: {
        unit: true,
        challenges: {
          include: {
            challengeOptions: true,
          },
        },
      },
    }),
  ]);

  // Construir datos de usuarios
  const users = allUsers.map((user) => {
    const userCompletions = allChallengeProgress.filter(
      (cp) => cp.userId === user.userId && cp.completed
    );
    return {
      userId: user.userId,
      userName: user.userName,
      userImageSrc: user.userImageSrc,
      points: user.points,
      hearts: user.hearts,
      completedChallenges: userCompletions.length,
      totalChallenges: allChallenges.length,
    };
  });

  // Construir datos de lecciones con preguntas y respuestas
  const lessonsWithAnswers = allLessons
    .filter((l) => l.challenges.length > 0)
    .map((l) => ({
      id: l.id,
      title: l.title,
      unitTitle: l.unit?.title || "Sin unidad",
      referenceText: l.referenceText || "",
      challenges: l.challenges.map((c) => ({
        id: c.id,
        question: c.question,
        options: c.challengeOptions.map((opt) => ({
          text: opt.text,
          correct: opt.correct,
        })),
      })),
    }));

  const stats = {
    totalUsers: allUsers.length,
    totalLessons: lessonsWithAnswers.length,
    totalChallenges: allChallenges.length,
    totalCompletions: allChallengeProgress.filter((cp) => cp.completed).length,
  };

  return (
    <AdminDashboardClient
      users={users}
      lessons={lessonsWithAnswers}
      stats={stats}
    />
  );
};

export default AdminPanelPage;
