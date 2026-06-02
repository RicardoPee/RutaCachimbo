import { cache } from "react";
import { eq, or, isNull, inArray, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs";

import db from "@/db/drizzle";
import { 
  challengeProgress,
  courses, 
  lessons, 
  units, 
  userProgress,
  userSubscription,
  classroomMembers
} from "@/db/schema";

export const getUserProgress = cache(async () => {
  // BYPASS AUTH FOR LOCAL DEV:
  const { userId: clerkUserId } = auth();
  const userId = clerkUserId || process.env.ADMIN_USER_ID || "user_3DGcgViJmbQQqY2hzTueZQjcvsB";

  if (!userId) {
    return null;
  }

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });

  if (data && userId === process.env.ADMIN_USER_ID) {
    return { ...data, hearts: Infinity };
  }

  return data;
});

export const getUnits = cache(async () => {
  const { userId: clerkUserId } = await auth();
  const userId = clerkUserId || process.env.ADMIN_USER_ID || "user_3DGcgViJmbQQqY2hzTueZQjcvsB";
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) {
    return [];
  }

  const data = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(
                  challengeProgress.userId,
                  userId,
                ),
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
  const { userId: clerkUserId } = auth();
  const userId = clerkUserId || process.env.ADMIN_USER_ID || "user_3DGcgViJmbQQqY2hzTueZQjcvsB";
  
  if (!userId) {
    return await db.query.courses.findMany({
      where: isNull(courses.classroomId)
    });
  }

  const memberships = await db.query.classroomMembers.findMany({
    where: eq(classroomMembers.userId, userId)
  });
  
  const classroomIds = memberships.map(m => m.classroomId);

  if (classroomIds.length === 0) {
    return await db.query.courses.findMany({
      where: isNull(courses.classroomId)
    });
  }

  const data = await db.query.courses.findMany({
    where: or(
      isNull(courses.classroomId),
      inArray(courses.classroomId, classroomIds)
    )
  });

  return data;
});

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      },
    },
  });

  return data;
});

export const getCourseProgress = cache(async () => {
  const { userId: clerkUserId } = await auth();
  const userId = clerkUserId || process.env.ADMIN_USER_ID || "user_3DGcgViJmbQQqY2hzTueZQjcvsB";
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) {
    return null;
  }

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
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
          || challenge.challengeProgress.some((progress) => progress.completed === false)
      });
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const { userId: clerkUserId } = await auth();
  const userId = clerkUserId || process.env.ADMIN_USER_ID || "user_3DGcgViJmbQQqY2hzTueZQjcvsB";

  if (!userId) {
    return null;
  }

  const courseProgress = await getCourseProgress();

  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) {
    return null;
  }

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
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
      && challenge.challengeProgress.every((progress) => progress.completed)

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges }
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
  const { userId: clerkUserId } = await auth();
  const userId = clerkUserId || process.env.ADMIN_USER_ID || "user_3DGcgViJmbQQqY2hzTueZQjcvsB";

  if (!userId) return null;

  if (userId === process.env.ADMIN_USER_ID) {
    return { isActive: true };
  }

  const data = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.userId, userId),
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
  const { userId: clerkUserId } = await auth();
  const userId = clerkUserId || process.env.ADMIN_USER_ID || "user_3DGcgViJmbQQqY2hzTueZQjcvsB";

  if (!userId) {
    return 0;
  }

  const data = await db.query.challengeProgress.findMany({
    where: eq(challengeProgress.userId, userId),
  });

  return data.filter((progress) => progress.completed).length;
});

export const getTopTenUsers = cache(async (
  timeframe: "ALL_TIME" | "WEEKLY" = "ALL_TIME",
  classroomId?: number
) => {
  const { userId: clerkUserId } = await auth();
  const userId = clerkUserId || process.env.ADMIN_USER_ID || "user_3DGcgViJmbQQqY2hzTueZQjcvsB";

  if (!userId) {
    return [];
  }

  // Base query on userProgress
  let queryBase = db.select({
    userId: userProgress.userId,
    userName: userProgress.userName,
    userImageSrc: userProgress.userImageSrc,
    points: userProgress.points,
    weeklyPoints: userProgress.weeklyPoints,
    league: userProgress.league,
    activeBorder: userProgress.activeBorder,
  }).from(userProgress);

  // If classroomId is provided, join with classroomMembers
  if (classroomId) {
    queryBase = queryBase
      .innerJoin(classroomMembers, eq(classroomMembers.userId, userProgress.userId))
      .where(eq(classroomMembers.classroomId, classroomId)) as any;
  }

  const data = await queryBase
    .orderBy(
      timeframe === "WEEKLY" ? desc(userProgress.weeklyPoints) : desc(userProgress.points)
    )
    .limit(50);

  return data;
});
