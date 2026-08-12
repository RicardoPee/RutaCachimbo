import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getVocabulary } from "@/actions/vocab-actions";
import { getUserProgress } from "@/db/queries";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { VocabClient } from "./vocab-client";

type Props = {
  params: {
    lessonId: string;
  };
};

export default async function VocabPage({ params }: Props) {
  const parsedLessonId = parseInt(params.lessonId);
  if (isNaN(parsedLessonId)) {
    redirect("/learn");
  }

  const userProgressData = getUserProgress();
  const vocabData = getVocabulary(parsedLessonId);

  const [userProgress, vocab] = await Promise.all([
    userProgressData,
    vocabData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

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
              <h1 className="text-xl font-black text-slate-800 dark:text-white">Estudiar Vocabulario</h1>
              <p className="text-xs text-muted-foreground">Palabras clave y términos avanzados de la lectura</p>
            </div>
          </div>

          {vocab.error || !vocab.words ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <p className="text-sm font-semibold text-rose-500">{vocab.error || "No se pudo cargar el vocabulario."}</p>
              <Link href="/learn" className="inline-block text-xs font-bold text-primary hover:underline">
                Volver al Temario
              </Link>
            </div>
          ) : (
            <VocabClient words={vocab.words} lessonTitle={userProgress.activeCourse.title} />
          )}
        </div>
      </FeedWrapper>
    </div>
  );
}
