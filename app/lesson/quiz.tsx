"use client";

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useAudio, useWindowSize, useMount } from "react-use";

import { reduceHearts } from "@/actions/user-progress";
import { logMistake } from "@/actions/mistakes";
import { useHeartsModal } from "@/store/use-hearts-modal";
import type { Challenge as ChallengeModel, ChallengeOption, UserSubscription } from "@prisma/client";
import { usePracticeModal } from "@/store/use-practice-modal";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { generateQuestionsForLesson } from "@/actions/generate-questions";
import { Button } from "@/components/ui/button";

import { Header } from "./header";
import { Footer } from "./footer";
import { Challenge } from "./challenge";
import { ResultCard } from "./result-card";
import { QuestionBubble } from "./question-bubble";

type Props ={
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: (ChallengeModel & {
    completed: boolean;
    challengeOptions: ChallengeOption[];
  })[];
  userSubscription: (Partial<UserSubscription> & {
    isActive: boolean;
  }) | null;
  referenceText: string | null;
  isAdmin?: boolean;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
  referenceText,
  isAdmin,
}: Props) => {
  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();

  useMount(() => {
    if (initialPercentage === 100) {
      openPracticeModal();
    }
  });

  const { width, height } = useWindowSize();

  const router = useRouter();

  const [finishAudio] = useAudio({ src: "/finish.mp3", autoPlay: true });
  const [
    correctAudio,
    _c,
    correctControls,
  ] = useAudio({ src: "/correct.wav" });
  const [
    incorrectAudio,
    _i,
    incorrectControls,
  ] = useAudio({ src: "/incorrect.wav" });
  const [pending, startTransition] = useTransition();

  const [lessonId] = useState(initialLessonId);
  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [challenges] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex((challenge) => !challenge.completed);
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  const onNext = () => {
    setActiveIndex((current) => current + 1);
    setExplanation(null);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    setSelectedOption(id);
  };

  const triggerExplanation = async (isCorrect: boolean) => {
    setIsExplaining(true);
    setExplanation("");

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceText: referenceText || "",
          question: challenge.question,
          selectedOptionText: options.find((o) => o.id === selectedOption)?.text || "",
          isCorrect,
          hearts: isCorrect ? hearts : Math.max(hearts - 1, 0),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch explanation");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = "";

      // As soon as the connection succeeds and stream starts reading, disable loading pulse
      setIsExplaining(false);

      while (!done && reader) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkValue = decoder.decode(value);
          text += chunkValue;
          setExplanation(text);
        }
      }
    } catch (error) {
      console.error("Error fetching explanation stream:", error);
      setIsExplaining(false);
      setExplanation("Tu Tutor de IA tuvo un inconveniente al procesar la explicación. ¡Sigue esforzándote!");
    }
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      setExplanation(null);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = options.find((option) => option.correct);

    if (!correctOption) {
      return;
    }

    if (correctOption.id === selectedOption) {
      triggerExplanation(true);

      startTransition(() => {
        upsertChallengeProgress(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }

            correctControls.play();
            setStatus("correct");
            setPercentage((prev) => prev + 100 / challenges.length);

            // This is a practice
            if (initialPercentage === 100) {
              setHearts((prev) => Math.min(prev + 1, 5));
            }
          })
          .catch(() => toast.error("Ocurrió un error. Por favor, intenta de nuevo."))
      });
    } else {
      triggerExplanation(false);
      
      const wrongOptionText = options.find((o) => o.id === selectedOption)?.text || "";
      logMistake("LESSON", challenge.question, wrongOptionText, correctOption.text);

      startTransition(() => {
        reduceHearts(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }

            incorrectControls.play();
            setStatus("wrong");

            if (!response?.error) {
              setHearts((prev) => Math.max(prev - 1, 0));
            }
          })
          .catch(() => toast.error("Ocurrió un error. Por favor, intenta de nuevo."))
      });
    }
  };

  if (!challenge) {
    if (challenges.length === 0) {
      return (
        <div className="flex flex-col gap-y-4 max-w-lg mx-auto text-center items-center justify-center h-full">
          <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
            Aún no hay preguntas
          </h1>
          <p className="text-neutral-500">
            {isAdmin 
              ? "Haz clic en el botón de abajo para que Gemini analice el texto y genere preguntas automáticamente."
              : "Un administrador está preparando este material."}
          </p>
          {isAdmin && (
            <Button 
              size="lg" 
              className="mt-4"
              disabled={pending}
              onClick={() => {
                startTransition(() => {
                  generateQuestionsForLesson(lessonId)
                    .then((res) => {
                      if (res.error) toast.error(res.error);
                      else {
                        toast.success("¡Preguntas generadas con éxito!");
                        window.location.reload();
                      }
                    })
                    .catch(() => toast.error("Error crítico al contactar Gemini"));
                });
              }}
            >
              ✨ Generar Preguntas con Gemini
            </Button>
          )}
        </div>
      );
    }

    return (
      <>
        {finishAudio}
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />
        <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
          <Image
            src="/finish.svg"
            alt="Finish"
            className="hidden lg:block"
            height={100}
            width={100}
          />
          <Image
            src="/finish.svg"
            alt="Finish"
            className="block lg:hidden"
            height={50}
            width={50}
          />
          <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
            ¡Excelente trabajo! <br /> Has completado esta lectura.
          </h1>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard
              variant="points"
              value={challenges.length * 10}
            />
            <ResultCard
              variant="hearts"
              value={hearts}
            />
          </div>
        </div>
        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/learn")}
        />
      </>
    );
  }

  const title = challenge.type === "ASSIST" 
    ? "Selecciona la opción correcta"
    : challenge.question;

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="h-full flex items-center justify-center flex-1">
          <div className="w-full h-full max-w-[1400px] mx-auto px-6 lg:px-8 py-4 lg:py-8 flex flex-col lg:flex-row gap-8">
            
            {/* Texto de Lectura (Columna Izquierda) */}
            {referenceText && (
              <div className="lg:w-1/2 h-full flex flex-col bg-amber-50/30 dark:bg-card border-2 border-b-4 border-border rounded-3xl p-6 lg:p-10 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-border shrink-0">
                  <span className="text-xl">📖</span>
                  <h2 className="text-sm font-extrabold text-neutral-500 uppercase tracking-widest">
                    Texto de Referencia
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar">
                  <p className="text-foreground leading-[2] whitespace-pre-wrap text-[17px] md:text-[19px] font-serif">
                    {referenceText}
                  </p>
                </div>
              </div>
            )}

            {/* Pregunta y Opciones (Columna Derecha) */}
            <div className={`flex flex-col h-full overflow-y-auto custom-scrollbar px-2 ${referenceText ? 'lg:w-1/2' : 'lg:w-[800px] mx-auto'}`}>
              <div className="flex flex-col gap-y-8 my-auto py-8">
                <h1 className="text-xl lg:text-3xl text-center lg:text-start font-extrabold text-neutral-800 dark:text-neutral-100 mb-2">
                  {title}
                </h1>
                <div className="w-full">
                  {challenge.type === "ASSIST" && (
                    <QuestionBubble question={challenge.question} />
                  )}
                  <Challenge
                    options={options}
                    onSelect={onSelect}
                    status={status}
                    selectedOption={selectedOption}
                    disabled={pending}
                    type={challenge.type}
                    isAdmin={isAdmin}
                  />

                  {/* Explicación de la IA */}
                  {status !== "none" && (isExplaining || explanation) && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-6 mt-8 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Image src="/mascot.svg" alt="Mascot" width={32} height={32} />
                        <h2 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                          Tutor de IA
                        </h2>
                      </div>
                      {isExplaining ? (
                        <p className="text-blue-500 dark:text-blue-400 animate-pulse text-sm font-bold">Analizando la respuesta...</p>
                      ) : (
                        <p className="text-blue-800 dark:text-blue-200 text-sm lg:text-[15px] font-medium leading-relaxed">
                          {explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
      />
    </>
  );
};
