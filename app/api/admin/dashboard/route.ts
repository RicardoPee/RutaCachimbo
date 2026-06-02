import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import db from "@/db/drizzle";

export const GET = async () => {
  const { userId } = auth();

  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Obtener todos los usuarios con su progreso
    const allUsers = await db.query.userProgress.findMany();

    // 2. Obtener todos los challenges y su progreso
    const allChallengeProgress = await db.query.challengeProgress.findMany();
    const allChallenges = await db.query.challenges.findMany();

    // 3. Obtener lecciones con sus unidades
    const allLessons = await db.query.lessons.findMany({
      with: {
        unit: true,
        challenges: true,
      },
    });

    // 4. Construir datos de usuarios
    const usersData = allUsers.map((user) => {
      const userCompletions = allChallengeProgress.filter(
        (cp) => cp.userId === user.userId && cp.completed
      );
      return {
        userId: user.userId,
        userName: user.userName,
        userImageSrc: user.userImageSrc,
        points: user.points,
        hearts: user.hearts,
        activeCourseId: user.activeCourseId,
        completedChallenges: userCompletions.length,
        totalChallenges: allChallenges.length,
      };
    });

    // 5. Construir datos de lecciones (solo las que tienen preguntas)
    const lessonsData = allLessons
      .filter((l) => l.challenges.length > 0)
      .map((l) => ({
        id: l.id,
        title: l.title,
        unitTitle: l.unit?.title || "Sin unidad",
        challengeCount: l.challenges.length,
      }));

    // 6. Estadísticas globales
    const stats = {
      totalUsers: allUsers.length,
      totalLessons: lessonsData.length,
      totalChallenges: allChallenges.length,
      totalCompletions: allChallengeProgress.filter((cp) => cp.completed)
        .length,
    };

    return NextResponse.json({
      users: usersData,
      lessons: lessonsData,
      stats,
    });
  } catch (error) {
    console.error("[Admin Dashboard API]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
};
