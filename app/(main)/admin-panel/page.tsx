import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

import db from "@/db/drizzle";
import { AdminDashboardClient } from "./client";

const AdminPanelPage = async () => {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    redirect("/learn");
  }

  // Cargar datos directamente desde el server component (sin API)
  const allUsers = await db.query.userProgress.findMany();
  const allChallengeProgress = await db.query.challengeProgress.findMany();
  const allChallenges = await db.query.challenges.findMany();
  const allLessons = await db.query.lessons.findMany({
    with: {
      unit: true,
      challenges: {
        with: {
          challengeOptions: true,
        },
      },
    },
  });

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
