import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Swords } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getUserProgress } from "@/db/queries";
import { FeedWrapper } from "@/components/layout/feed-wrapper";
import { StickyWrapper } from "@/components/layout/sticky-wrapper";
import { UserProgress } from "@/components/study/user-progress";
import { RepasoClient } from "./repaso-client";

export default async function RepasoPage() {
  const userProgress = await getUserProgress();

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  // 1. Obtener los IDs de las preguntas completadas por el usuario
  const completedProgress = await prisma.challengeProgress.findMany({
    where: {
      userId: userProgress.userId,
      completed: true,
    },
    select: {
      challengeId: true,
    },
  });

  const completedIds = completedProgress.map((cp) => cp.challengeId);

  if (completedIds.length === 0) {
    return (
      <div className="flex flex-row-reverse gap-[48px] px-6">
        <StickyWrapper>
          <UserProgress
            activeCourse={userProgress.activeCourse}
            hearts={userProgress.hearts}
            points={userProgress.points}
            hasActiveSubscription={false}
            streak={userProgress.streak}
          />
        </StickyWrapper>

        <FeedWrapper>
          <div className="w-full max-w-2xl mx-auto space-y-6 pt-10 text-center">
            <Swords className="w-16 h-16 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">Sin lecciones completadas</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Debes completar al menos una pregunta del temario antes de poder iniciar una sesión de repaso rápido.
            </p>
            <Link href="/learn" className="inline-block mt-4">
              <span className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-3 rounded-2xl">
                Ir al Temario
              </span>
            </Link>
          </div>
        </FeedWrapper>
      </div>
    );
  }

  // 2. Cargar las preguntas completadas junto con sus opciones y datos de la lección
  const completedChallenges = await prisma.challenge.findMany({
    where: {
      id: { in: completedIds },
    },
    include: {
      challengeOptions: true,
      lesson: {
        select: {
          title: true,
          referenceText: true,
        },
      },
    },
  });

  // 3. Mezclar aleatoriamente y seleccionar hasta 10 preguntas para repasar
  const shuffled = [...completedChallenges].sort(() => 0.5 - Math.random());
  const selectedChallenges = shuffled.slice(0, 10).map((c) => ({
    id: c.id,
    question: c.question,
    type: c.type,
    lessonTitle: c.lesson.title,
    referenceText: c.lesson.referenceText,
    challengeOptions: c.challengeOptions.map((o) => ({
      id: o.id,
      text: o.text,
      correct: o.correct,
    })),
  }));

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={false}
          streak={userProgress.streak}
        />
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/learn"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white">Repaso Rápido</h1>
              <p className="text-xs text-muted-foreground">Preguntas aleatorias de tus lecciones completadas</p>
            </div>
          </div>

          <RepasoClient challenges={selectedChallenges} />
        </div>
      </FeedWrapper>
    </div>
  );
}
