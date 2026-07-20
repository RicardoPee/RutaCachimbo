"use client";

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useAudio, useWindowSize, useMount } from "react-use";

import { reduceHearts } from "@/actions/user-progress";
import { logMistake } from "@/actions/mistakes";
import { useHeartsModal } from "@/store/use-hearts-modal";
import type { Challenge as ChallengeModel, ChallengeOption, UserSubscription } from "@prisma/client";
import { usePracticeModal } from "@/store/use-practice-modal";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { generateQuestionsForLesson } from "@/actions/generate-questions";
import { consumePowerupCard } from "@/actions/powerup-actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Bot, BookOpen, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

import { Header } from "./header";
import { Footer } from "./footer";
import { Challenge } from "./challenge";
import { ResultCard } from "./result-card";
import { QuestionBubble } from "./question-bubble";
import { MascotAvatar } from "@/components/mascot-avatar";
import { TutorChat } from "@/components/features/tutor-chat";
import { ReadingPassageReader } from "@/components/reading-passage-reader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
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
  userProgress?: any;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
  referenceText,
  isAdmin,
  userProgress,
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

  const [finishAudio, _f, finishControls] = useAudio({ src: "/finish.mp3" });
  const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, _i, incorrectControls] = useAudio({ src: "/incorrect.wav" });
  const [pending, startTransition] = useTransition();

  const [lessonId] = useState(initialLessonId);
  const [currentReferenceText, setCurrentReferenceText] = useState<string | null>(referenceText);
  const [hearts, setHearts] = useState(initialHearts);

  useEffect(() => {
    if (!currentReferenceText || currentReferenceText.trim().length < 20) {
      fetch("/api/ai/synthesize-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: initialLessonId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.referenceText) {
            setCurrentReferenceText(data.referenceText);
          }
        })
        .catch(() => {});
    }
  }, [initialLessonId, currentReferenceText]);
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
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isMobileTextExpanded, setIsMobileTextExpanded] = useState(true); // Abierto por defecto en móvil

  // Inventario de Comodines
  const [cardCounts, setCardCounts] = useState({
    fiftyFifty: userProgress?.cardFiftyFifty || 0,
    aiHint: userProgress?.cardAiHint || 0,
    heartShield: userProgress?.cardHeartShield || 0,
  });

  // Estados de Comodines activos en la pregunta
  const [disabledOptionIds, setDisabledOptionIds] = useState<number[]>([]);
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [aiHintModalOpen, setAiHintModalOpen] = useState(false);
  const [aiHintText, setAiHintText] = useState<string | null>(null);
  const [isAiHintLoading, setIsAiHintLoading] = useState(false);

  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  useEffect(() => {
    if (!challenge && challenges.length > 0) {
      finishControls.play();
    }
  }, [challenge, challenges.length, finishControls]);

  const onNext = () => {
    setActiveIndex((current) => current + 1);
    setExplanation(null);
    setIsTutorOpen(false);
    setDisabledOptionIds([]);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;
    setSelectedOption(id);
  };

  // Usar Comodín 50/50
  const handleUse5050 = async () => {
    if (cardCounts.fiftyFifty <= 0) {
      toast.error("No tienes comodines 50/50. ¡Cómpralos en la Tienda!");
      return;
    }
    if (disabledOptionIds.length > 0) {
      toast.info("Ya utilizaste el 50/50 en esta pregunta.");
      return;
    }

    try {
      await consumePowerupCard("fiftyFifty");
      setCardCounts((prev) => ({ ...prev, fiftyFifty: Math.max(0, prev.fiftyFifty - 1) }));

      const wrongOptions = options.filter((o) => !o.correct);
      const shuffledWrong = [...wrongOptions].sort(() => Math.random() - 0.5);
      const toDisable = shuffledWrong.slice(0, 2).map((o) => o.id);

      setDisabledOptionIds(toDisable);
      toast.success("🃏 ¡Comodín 50/50 activado! 2 alternativas eliminadas.");
    } catch (err: any) {
      toast.error(err.message || "Error al usar comodín");
    }
  };

  // Usar Comodín Pista del Tutor IA
  const handleUseAiHint = async () => {
    if (cardCounts.aiHint <= 0) {
      toast.error("No tienes Pistas de Tutor IA. ¡Cómpralas en la Tienda!");
      return;
    }

    setAiHintModalOpen(true);

    if (aiHintText) return; // Ya generado

    setIsAiHintLoading(true);
    try {
      await consumePowerupCard("aiHint");
      setCardCounts((prev) => ({ ...prev, aiHint: Math.max(0, prev.aiHint - 1) }));

      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceText: referenceText || "",
          question: challenge.question,
          selectedOptionText: "Dame una pista pedagógica para esta pregunta sin decirme la respuesta directa.",
          isCorrect: true,
          hearts: 5,
        }),
      });

      if (res.ok) {
        const text = await res.text();
        setAiHintText(text || "Analiza detenidamente las palabras clave del texto de referencia.");
      } else {
        setAiHintText("Pista: Lee atentamente los primeros párrafos del texto.");
      }
    } catch (err) {
      setAiHintText("Pista: Fíjate en los conectores lógicos del texto de lectura.");
    } finally {
      setIsAiHintLoading(false);
    }
  };

  // Usar Comodín Escudo de Corazón
  const handleUseHeartShield = async () => {
    if (cardCounts.heartShield <= 0) {
      toast.error("No tienes Escudos de Corazón. ¡Cómpralos en la Tienda!");
      return;
    }
    if (isShieldActive) {
      toast.info("El Escudo ya está activo para esta lección.");
      return;
    }

    try {
      await consumePowerupCard("heartShield");
      setCardCounts((prev) => ({ ...prev, heartShield: Math.max(0, prev.heartShield - 1) }));
      setIsShieldActive(true);
      toast.success("🛡️ ¡Escudo de Corazón activado! Absorberá tu próximo error.");
    } catch (err: any) {
      toast.error(err.message || "Error al usar escudo");
    }
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
          optionId: selectedOption,
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
      setIsTutorOpen(false);
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
      // Explicación en demanda para respuestas correctas (NIVEL 2: Ahorro de Tokens)
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

      if (isShieldActive) {
        setIsShieldActive(false);
        toast.success("🛡️ ¡Escudo activado! Ha protegido tu vida.");
        incorrectControls.play();
        setStatus("wrong");
        return;
      }

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
        <>
          {finishAudio}
          {correctAudio}
          {incorrectAudio}
          <div className="flex flex-col gap-y-4 max-w-lg mx-auto text-center items-center justify-center h-full">
            <h1 className="text-xl lg:text-3xl font-bold text-neutral-700 dark:text-white">
              Aún no hay preguntas
            </h1>
            <p className="text-neutral-500 dark:text-slate-400">
              {isAdmin 
                ? "Haz clic en el botón de abajo para que la Inteligencia Artificial analice el texto y genere preguntas automáticamente."
                : "Un administrador está preparando este material."}
            </p>
            {isAdmin && (
              <Button 
                onClick={() => {
                  startTransition(() => {
                    generateQuestionsForLesson(lessonId).then(() => {
                      toast.success("¡Preguntas generadas con éxito!");
                      router.refresh();
                    }).catch(() => toast.error("Ocurrió un error al generar preguntas."));
                  });
                }}
                disabled={pending}
                className="bg-emerald-500 hover:bg-emerald-600 font-bold text-white"
              >
                {pending ? "Generando preguntas..." : "Generar Preguntas con IA"}
              </Button>
            )}
          </div>
        </>
      );
    }

    return (
      <div className="flex flex-col h-full w-full bg-slate-50/50 dark:bg-slate-950/50 relative overflow-hidden items-center justify-center p-4">
        {finishAudio}
        {correctAudio}
        {incorrectAudio}
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={600}
          tweenDuration={10000}
        />

        <div className="max-w-lg w-full bg-white dark:bg-slate-900 border-4 border-emerald-400 dark:border-emerald-600 rounded-3xl p-6 lg:p-8 shadow-2xl flex flex-col items-center text-center gap-y-6 animate-in zoom-in-95 duration-500 relative z-10">
          
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 text-white text-xs font-black uppercase tracking-widest shadow-md">
            <Sparkles className="w-4 h-4 fill-white" /> ¡Lección Completada!
          </div>

          {/* Mascot & Celebration Avatar */}
          <div className="relative my-2">
            <div className="absolute -inset-4 rounded-full bg-amber-400/20 dark:bg-amber-400/10 blur-xl animate-pulse" />
            <MascotAvatar skinId={userProgress?.activeMascotSkin} width={100} height={100} className="relative z-10 animate-bounce" />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              ¡Excelente Trabajo! 🎓
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Has demostrado dominio completo en esta lectura.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex items-center gap-4 w-full my-1">
            <ResultCard
              variant="points"
              value={challenges.length * 10}
            />
            <ResultCard
              variant="hearts"
              value={userSubscription?.isActive ? "∞" : hearts}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-3 w-full pt-2">
            <Button
              variant="default"
              size="lg"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base h-12 shadow-lg shadow-emerald-500/20 rounded-2xl flex items-center justify-center gap-2"
              onClick={() => router.push("/learn")}
            >
              Continuar al Mapa <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full font-bold border-2 h-11 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => window.location.href = `/lesson/${lessonId}`}
            >
              Practicar de nuevo
            </Button>
          </div>

        </div>
      </div>
    );
  }

  const title = challenge.type === "ASSIST" 
    ? "Selecciona el significado correcto"
    : challenge.question;

  const hasReferenceText = !!currentReferenceText && currentReferenceText.trim().length > 0;

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {finishAudio}
        {correctAudio}
        {incorrectAudio}
        <Header
          hearts={hearts}
          percentage={percentage}
          hasActiveSubscription={!!userSubscription?.isActive}
        />

        <div className="flex-1 py-4">
          <div className="h-full flex justify-center">
            
            {/* Split Screen Container (2 Columnas en Desktop cuando hay texto de lectura) */}
            <div className={cn(
              "w-full px-4 lg:px-6 grid gap-6 items-start max-w-[1280px] mx-auto",
              hasReferenceText ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1 lg:w-[600px]"
            )}>
              
              {/* PANEL IZQUIERDO: Texto de Lectura en Desktop (Pantallas Grandes lg:col-span-6) */}
              {hasReferenceText && (
                <div className="hidden lg:block lg:col-span-6 h-[calc(100vh-230px)] sticky top-2">
                  <ReadingPassageReader text={currentReferenceText!} />
                </div>
              )}

              {/* PANEL DERECHO / PRINCIPAL: Texto Móvil + Pregunta + Comodines */}
              <div className={cn(
                "flex flex-col gap-y-4",
                hasReferenceText ? "col-span-1 lg:col-span-6" : "w-full"
              )}>

                {/* TEXTO DE LECTURA DIRECTO EN MÓVIL / PANTALLAS PEQUEÑAS (DESPLEGABLE DIRECTAMENTE EN PANTALLA) */}
                {hasReferenceText && (
                  <div className="block lg:hidden w-full bg-white dark:bg-slate-900 border-2 border-indigo-400 dark:border-indigo-700 rounded-3xl overflow-hidden shadow-md">
                    <button
                      type="button"
                      onClick={() => setIsMobileTextExpanded(!isMobileTextExpanded)}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold flex items-center justify-between p-3.5 px-4 text-sm transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-200" />
                        <span>Texto de Lectura de Referencia</span>
                      </span>
                      <span className="flex items-center gap-1 bg-indigo-700 text-indigo-100 text-xs px-2.5 py-1 rounded-xl font-bold">
                        {isMobileTextExpanded ? (
                          <><span>Ocultar</span> <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <><span>Leer Texto</span> <ChevronDown className="w-4 h-4" /></>
                        )}
                      </span>
                    </button>

                    {isMobileTextExpanded && (
                      <div className="h-[260px] border-t border-indigo-200 dark:border-indigo-800">
                        <ReadingPassageReader text={currentReferenceText!} className="border-0 rounded-none h-full" />
                      </div>
                    )}
                  </div>
                )}

                {/* AVISO SI LA LECCIÓN AÚN NO TIENE TEXTO EN BASE DE DATOS */}
                {!hasReferenceText && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-3 px-4 rounded-2xl text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Esta lección es de práctica directa. Si necesitas ayuda con el contexto, usa la <strong>Pista IA</strong> 🤖</span>
                  </div>
                )}
                
                {/* Barra Flotante de Comodines */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-2.5 px-4 rounded-2xl shadow-sm mb-1 text-slate-800 dark:text-white">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Comodines
                  </span>

                  <div className="flex items-center gap-2">
                    {/* 50/50 */}
                    <button
                      onClick={handleUse5050}
                      disabled={status !== "none" || cardCounts.fiftyFifty <= 0 || disabledOptionIds.length > 0}
                      className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-extrabold text-amber-700 dark:text-amber-300 disabled:opacity-40 transition-all active:scale-95 shadow-sm"
                      title="Elimina 2 opciones incorrectas"
                    >
                      <span>🃏 50/50</span>
                      <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-md font-black text-[10px]">
                        {cardCounts.fiftyFifty}
                      </span>
                    </button>

                    {/* Pista IA */}
                    <button
                      onClick={handleUseAiHint}
                      disabled={status !== "none" || cardCounts.aiHint <= 0}
                      className="flex items-center gap-1.5 px-3 py-1 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-300 dark:border-cyan-700 rounded-xl text-xs font-extrabold text-cyan-700 dark:text-cyan-300 disabled:opacity-40 transition-all active:scale-95 shadow-sm"
                      title="Pista del Tutor IA"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Pista IA</span>
                      <span className="bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded-md font-black text-[10px]">
                        {cardCounts.aiHint}
                      </span>
                    </button>

                    {/* Escudo */}
                    <button
                      onClick={handleUseHeartShield}
                      disabled={status !== "none" || cardCounts.heartShield <= 0 || isShieldActive}
                      className={`flex items-center gap-1.5 px-3 py-1 border rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-sm ${
                        isShieldActive 
                          ? "bg-green-100 dark:bg-green-950 border-green-400 text-green-700 dark:text-green-300 animate-pulse" 
                          : "bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 disabled:opacity-40"
                      }`}
                      title="Protege tu vida de un error"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>{isShieldActive ? "Activo" : "Escudo"}</span>
                      <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-md font-black text-[10px]">
                        {cardCounts.heartShield}
                      </span>
                    </button>
                  </div>
                </div>

                <h1 className="text-lg lg:text-2xl text-center lg:text-start font-bold text-neutral-700 dark:text-white leading-tight">
                  {title}
                </h1>

                <div>
                  {challenge.type === "ASSIST" && (
                    <QuestionBubble 
                      question={challenge.question} 
                      activeMascotSkin={userProgress?.activeMascotSkin} 
                    />
                  )}
                  <Challenge
                    options={options}
                    onSelect={onSelect}
                    status={status}
                    selectedOption={selectedOption}
                    disabled={pending}
                    disabledOptionIds={disabledOptionIds}
                    type={challenge.type}
                    isAdmin={isAdmin}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Footer con Retroalimentación Streaming de la IA */}
        <Footer
          disabled={pending || !selectedOption}
          status={status}
          onCheck={onContinue}
          explanation={explanation}
          isExplaining={isExplaining}
          onOpenTutor={() => setIsTutorOpen(true)}
          onRequestExplanation={() => triggerExplanation(true)}
        />
      </div>

      {/* Slide-over Side Drawer del Tutor IA Conversacional */}
      {isTutorOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] z-[100] shadow-2xl animate-in slide-in-from-right duration-300">
          <TutorChat
            question={challenge.question}
            selectedOption={options.find((o) => o.id === selectedOption)?.text || ""}
            correctOption={options.find((o) => o.correct)?.text || ""}
            referenceText={currentReferenceText || ""}
            onClose={() => setIsTutorOpen(false)}
          />
        </div>
      )}

      {/* Modal Pista del Tutor IA */}
      <Dialog open={aiHintModalOpen} onOpenChange={setAiHintModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-2 border-cyan-500 text-foreground rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-xl">
              <Bot className="w-6 h-6" /> Pista del Tutor IA
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm font-medium leading-relaxed">
            {isAiHintLoading ? (
              <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
                <Sparkles className="w-8 h-8 text-cyan-500 animate-spin" />
                <span>Generando pista pedagógica...</span>
              </div>
            ) : (
              <p className="bg-cyan-50 dark:bg-slate-800 p-4 rounded-2xl border border-cyan-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                {aiHintText}
              </p>
            )}
          </div>
          <Button onClick={() => setAiHintModalOpen(false)} className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold">
            Entendido, gracias
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
