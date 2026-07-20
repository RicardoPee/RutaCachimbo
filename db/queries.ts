import { cache } from "react";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { isAdminId } from "@/lib/admin";
import { MAX_HEARTS } from "@/constants";

export const getUserProgress = cache(async () => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  let data = await prisma.userProgress.findUnique({
    where: { userId },
    include: {
      activeCourse: true,
    },
  });

  if (!data) return null;

  // Auto-refill pasivo diario de corazones (después de 24 horas)
  if (data.hearts < MAX_HEARTS) {
    const lastActiveTime = data.lastActive ? new Date(data.lastActive).getTime() : 0;
    const now = Date.now();
    const isNextDay = (now - lastActiveTime) >= 24 * 60 * 60 * 1000;

    if (isNextDay) {
      try {
        await prisma.userProgress.update({
          where: { userId },
          data: { hearts: MAX_HEARTS },
        });
        data.hearts = MAX_HEARTS;
      } catch (err) {
        console.error("Error auto-refilling hearts:", err);
      }
    }
  }

  // El admin tiene corazones ilimitados para poder probar contenido
  if (isAdminId(userId)) {
    return { ...data, hearts: Infinity };
  }

  return data;
});

export const getUnits = cache(async () => {
  const { userId } = auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) {
    return [];
  }

  const data = await prisma.unit.findMany({
    where: { courseId: userProgress.activeCourseId },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          challenges: {
            orderBy: { order: "asc" },
            include: {
              challengeProgress: {
                where: { userId },
              },
            },
          },
        },
      },
    },
  });

  const normalizedData = data.map((unit) => {
    // Filtrar lecciones que no tienen preguntas (no mostrarlas)
    const activeLessons = unit.lessons.filter(
      (lesson) => lesson.challenges.length > 0
    );

    const lessonsWithCompletedStatus = activeLessons.map((lesson) => {
      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return challenge.challengeProgress
          && challenge.challengeProgress.length > 0
          && challenge.challengeProgress.every((progress) => progress.completed);
      });

      return { ...lesson, completed: allCompletedChallenges };
    });

    return { ...unit, lessons: lessonsWithCompletedStatus };
  });

  // Filtrar unidades que no tienen lecciones activas
  return normalizedData.filter((unit) => unit.lessons.length > 0);
});

export const getCourses = cache(async () => {
  const { userId } = auth();

  if (!userId) {
    return await prisma.course.findMany({
      where: { classroomId: null },
      include: { classroom: true },
    });
  }

  const memberships = await prisma.classroomMember.findMany({
    where: { userId },
  });

  const classroomIds = memberships.map((m) => m.classroomId);

  if (classroomIds.length === 0) {
    return await prisma.course.findMany({
      where: { classroomId: null },
      include: { classroom: true },
    });
  }

  return await prisma.course.findMany({
    where: {
      OR: [
        { classroomId: null },
        { classroomId: { in: classroomIds } },
      ],
    },
    include: {
      classroom: true,
    },
  });
});

export const getCourseById = cache(async (courseId: number) => {
  return await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      units: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
});

export const getCourseProgress = cache(async () => {
  const { userId } = auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) {
    return null;
  }

  const unitsInActiveCourse = await prisma.unit.findMany({
    where: { courseId: userProgress.activeCourseId },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          unit: true,
          challenges: {
            include: {
              challengeProgress: {
                where: { userId },
              },
            },
          },
        },
      },
    },
  });

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      // Saltar lecciones vacías (sin preguntas) — no bloquean el avance
      if (lesson.challenges.length === 0) return false;
      return lesson.challenges.some((challenge) => {
        return !challenge.challengeProgress
          || challenge.challengeProgress.length === 0
          || challenge.challengeProgress.some((progress) => progress.completed === false);
      });
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const courseProgress = await getCourseProgress();

  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) {
    return null;
  }

  const data = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      challenges: {
        orderBy: { order: "asc" },
        include: {
          challengeOptions: true,
          challengeProgress: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!data || !data.challenges) {
    return null;
  }

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed = challenge.challengeProgress
      && challenge.challengeProgress.length > 0
      && challenge.challengeProgress.every((progress) => progress.completed);

    return { ...challenge, completed: !!completed };
  });

  return { ...data, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) {
    return 0;
  }

  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson) {
    return 0;
  }

  const completedChallenges = lesson.challenges
    .filter((challenge) => challenge.completed);
  const percentage = lesson.challenges.length === 0
    ? 0
    : Math.round(
      (completedChallenges.length / lesson.challenges.length) * 100,
    );

  return percentage;
});

const DAY_IN_MS = 86_400_000;
export const getUserSubscription = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  if (isAdminId(userId)) {
    return { isActive: true };
  }

  const data = await prisma.userSubscription.findUnique({
    where: { userId },
  });

  if (!data) return null;

  const isActive =
    data.stripePriceId &&
    data.stripeCurrentPeriodEnd &&
    data.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now();

  return {
    ...data,
    isActive: !!isActive,
  };
});

export const getCompletedChallengesCount = cache(async () => {
  const { userId } = auth();

  if (!userId) {
    return 0;
  }

  return await prisma.challengeProgress.count({
    where: { userId, completed: true },
  });
});

export const getTopTenUsers = cache(async (
  timeframe: "ALL_TIME" | "WEEKLY" = "ALL_TIME",
  classroomId?: number
) => {
  const { userId } = auth();

  if (!userId) {
    return [];
  }

  let memberIds: string[] | undefined;
  if (classroomId) {
    const members = await prisma.classroomMember.findMany({
      where: { classroomId },
      select: { userId: true },
    });
    memberIds = members.map((m) => m.userId);
  }

  return await prisma.userProgress.findMany({
    where: memberIds ? { userId: { in: memberIds } } : undefined,
    select: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
      weeklyPoints: true,
      league: true,
      activeBorder: true,
      activeTitle: true,
    },
    orderBy: timeframe === "WEEKLY"
      ? { weeklyPoints: "desc" }
      : { points: "desc" },
    take: 50,
  });
});

export const getDynamicQuests = cache(async () => {
  const { userId } = auth();
  if (!userId) return [];

  const userProgress = await prisma.userProgress.findUnique({
    where: { userId },
  });

  if (!userProgress) return [];

  // Calcular inicio de la semana (Lunes a las 00:00:00)
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  // Misión 2: Conteo de simulacros resueltos esta semana
  const weeklyExamsCount = await prisma.mockExamResult.count({
    where: {
      userId,
      createdAt: { gte: startOfWeek }
    }
  });

  // Misión 4: Conteo de respuestas correctas esta semana
  const weeklyCorrectChallengesCount = await prisma.challengeProgress.count({
    where: {
      userId,
      completed: true,
      updatedAt: { gte: startOfWeek }
    }
  });

  const weeklyPoints = userProgress.weeklyPoints;
  const streak = userProgress.streak ?? 0;

  const dynamicQuestsList = [
    {
      title: "Gana 200 XP esta semana",
      value: 200,
      currentValue: weeklyPoints,
      isCompleted: weeklyPoints >= 200,
      progressPercentage: Math.min((weeklyPoints / 200) * 100, 100),
      type: "XP"
    },
    {
      title: "Realiza 2 simulacros esta semana",
      value: 2,
      currentValue: weeklyExamsCount,
      isCompleted: weeklyExamsCount >= 2,
      progressPercentage: Math.min((weeklyExamsCount / 2) * 100, 100),
      type: "EXAMS"
    },
    {
      title: "Consigue una racha de 3 días",
      value: 3,
      currentValue: streak,
      isCompleted: streak >= 3,
      progressPercentage: Math.min((streak / 3) * 100, 100),
      type: "STREAK"
    },
    {
      title: "Responde 15 preguntas correctas esta semana",
      value: 15,
      currentValue: weeklyCorrectChallengesCount,
      isCompleted: weeklyCorrectChallengesCount >= 15,
      progressPercentage: Math.min((weeklyCorrectChallengesCount / 15) * 100, 100),
      type: "CHALLENGES"
    }
  ];

  return dynamicQuestsList;
});
