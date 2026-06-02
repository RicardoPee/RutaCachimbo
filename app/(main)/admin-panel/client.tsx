"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type UserData = {
  userId: string;
  userName: string;
  userImageSrc: string;
  points: number;
  hearts: number;
  completedChallenges: number;
  totalChallenges: number;
};

type ChallengeOption = {
  text: string;
  correct: boolean;
};

type ChallengeData = {
  id: number;
  question: string;
  options: ChallengeOption[];
};

type LessonData = {
  id: number;
  title: string;
  unitTitle: string;
  referenceText: string;
  challenges: ChallengeData[];
};

type StatsData = {
  totalUsers: number;
  totalLessons: number;
  totalChallenges: number;
  totalCompletions: number;
};

type Props = {
  users: UserData[];
  lessons: LessonData[];
  stats: StatsData;
};

export const AdminDashboardClient = ({ users, lessons, stats }: Props) => {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "answers" | "readings">("overview");
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl border-2 border-b-4 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 flex items-center justify-center">
          <Image src="/mascot.svg" width={32} height={32} alt="Admin" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-neutral-100">
            Panel de Administración
          </h1>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm">
            RutaCachimbo — Gestión del Sistema
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard iconSrc="/leaderboard.svg" label="Estudiantes" value={stats.totalUsers} color="bg-blue-50 border-blue-200 text-blue-700" />
        <StatCard iconSrc="/learn.svg" label="Lecturas" value={stats.totalLessons} color="bg-green-50 border-green-200 text-green-700" />
        <StatCard iconSrc="/quests.svg" label="Preguntas" value={stats.totalChallenges} color="bg-purple-50 border-purple-200 text-purple-700" />
        <StatCard iconSrc="/shop.svg" label="Completadas" value={stats.totalCompletions} color="bg-amber-50 border-amber-200 text-amber-700" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {([
          ["overview", "Resumen"],
          ["users", "Estudiantes"],
          ["readings", "Lecturas (Textos)"],
          ["answers", "Preguntas y Respuestas"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === key
                ? "bg-card text-green-700 dark:text-green-400 shadow-sm"
                : "text-muted-foreground hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-card rounded-2xl border-2 border-b-4 border-border p-6">
        {activeTab === "overview" && (
          <OverviewTab users={users} lessons={lessons} />
        )}
        {activeTab === "users" && (
          <UsersTab users={users} />
        )}
        {activeTab === "readings" && (
          <ReadingsTab
            lessons={lessons}
            expandedLesson={expandedLesson}
            onToggle={(id) => setExpandedLesson(expandedLesson === id ? null : id)}
          />
        )}
        {activeTab === "answers" && (
          <AnswersTab
            lessons={lessons}
            expandedLesson={expandedLesson}
            onToggle={(id) => setExpandedLesson(expandedLesson === id ? null : id)}
          />
        )}
      </div>
    </div>
  );
};

// ─── Stat Card ──────────────────────────────────────────────────

const StatCard = ({ iconSrc, label, value, color }: {
  iconSrc: string; label: string; value: number; color: string;
}) => (
  <div className={`${color} border-2 border-b-4 rounded-2xl p-4 flex items-center gap-4 dark:bg-card/50 dark:border-border dark:text-neutral-200`}>
    <Image src={iconSrc} width={32} height={32} alt="Icon" />
    <div>
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-xs font-medium opacity-70">{label}</p>
    </div>
  </div>
);

// ─── Overview Tab ───────────────────────────────────────────────

const OverviewTab = ({ users, lessons }: { users: UserData[]; lessons: LessonData[] }) => {
  const topUsers = [...users].sort((a, b) => b.points - a.points).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Top Estudiantes</h3>
        {topUsers.length === 0 ? (
          <p className="text-neutral-400 py-4">No hay estudiantes registrados.</p>
        ) : (
          <div className="space-y-2">
            {topUsers.map((user, i) => (
              <div key={user.userId} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-slate-800">
                <span className="text-lg font-bold text-neutral-300 dark:text-neutral-500 w-6 text-center">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                </span>
                <img
                  src={user.userImageSrc}
                  height={32}
                  width={32}
                  alt={user.userName}
                  className="rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-700 truncate">{user.userName}</p>
                </div>
                <span className="font-bold text-green-600 text-sm">{user.points} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Lecturas Activas</h3>
        {lessons.length === 0 ? (
          <p className="text-neutral-400 py-4">No hay lecturas creadas.</p>
        ) : (
          <div className="space-y-2">
            {lessons.map((l) => (
              <div key={l.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-slate-800 flex justify-between items-center">
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">{l.title}</p>
                  <p className="text-xs text-neutral-400">{l.unitTitle}</p>
                </div>
                <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-bold shrink-0">
                  {l.challenges.length} preg.
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Users Tab ──────────────────────────────────────────────────

const UsersTab = ({ users }: { users: UserData[] }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-foreground">
        Estudiantes ({users.length})
      </h3>
      <a
        href="https://dashboard.clerk.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-500 hover:underline"
      >
        💡 Gestionar contraseñas en Clerk →
      </a>
    </div>

    {users.length === 0 ? (
      <p className="text-neutral-400 text-center py-8">No hay estudiantes registrados.</p>
    ) : (
      <div className="space-y-2">
        {users.map((user) => {
          const progress = user.totalChallenges > 0
            ? Math.round((user.completedChallenges / user.totalChallenges) * 100)
            : 0;

          return (
            <div key={user.userId} className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-slate-800 hover:bg-neutral-100 dark:hover:bg-slate-700 transition">
              <img
                src={user.userImageSrc}
                height={40}
                width={40}
                alt={user.userName}
                className="rounded-full shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">{user.userName}</p>
                <p className="text-xs text-neutral-400 truncate">{user.userId}</p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-center">
                  <p className="text-red-400 font-bold text-sm">❤️ {user.hearts}</p>
                </div>
                <div className="text-center">
                  <p className="text-amber-500 font-bold text-sm">⚡ {user.points}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-neutral-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground w-8">{progress}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ─── Readings Tab ────────────────────────────────────────────────

import { simplifyAndSaveReferenceText } from "@/actions/admin-actions";
import { toast } from "sonner";
import { Loader2, Wand2 } from "lucide-react";

const ReadingsTab = ({
  lessons,
  expandedLesson,
  onToggle,
}: {
  lessons: LessonData[];
  expandedLesson: number | null;
  onToggle: (id: number) => void;
}) => {
  const [isSimplifying, setIsSimplifying] = useState<number | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);

  const handleSimplify = async (lessonId: number, currentText: string) => {
    setIsSimplifying(lessonId);
    const res = await simplifyAndSaveReferenceText(lessonId, currentText);
    if (res?.success) {
      toast.success("¡Texto limpiado y guardado en la base de datos!");
    } else {
      toast.error(res?.error || "Error al limpiar el texto");
    }
    setIsSimplifying(null);
  };

  const handleSimplifyAll = async () => {
    const lessonsToClean = lessons.filter(l => 
      l.referenceText && 
      l.referenceText.length > 20 &&
      !l.title.toLowerCase().includes("practica rapida") &&
      !l.title.toLowerCase().includes("práctica rápida") &&
      !l.referenceText.includes("\n\n") // Si ya tiene doble salto de línea, asumimos que fue limpiado por la IA
    );
    
    if (lessonsToClean.length === 0) {
      toast.info("No hay lecturas pendientes por limpiar (o todas son Prácticas Rápidas).");
      return;
    }
    
    setBulkProgress({ current: 0, total: lessonsToClean.length });
    
    for (let i = 0; i < lessonsToClean.length; i++) {
      const lesson = lessonsToClean[i];
      setBulkProgress({ current: i + 1, total: lessonsToClean.length });
      setIsSimplifying(lesson.id);
      
      const res = await simplifyAndSaveReferenceText(lesson.id, lesson.referenceText);
      if (res?.error && res.error.includes("superó el límite gratuito")) {
        toast.error("Se detuvo la limpieza masiva: límite de Google agotado por hoy o por minuto.");
        break;
      }
      
      // Wait 5.5 seconds between requests to be extra safe with Gemini's 15 RPM Rate Limit
      if (i < lessonsToClean.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5500));
      }
    }
    
    setIsSimplifying(null);
    setBulkProgress(null);
    toast.success("¡Todos los textos han sido limpiados con éxito!");
  };

  return (
  <div>
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
      <h3 className="text-lg font-bold text-foreground">
        Lecturas (Textos Base)
      </h3>
      {lessons.some(l => l.referenceText && l.referenceText.length > 20 && !l.referenceText.includes("\n\n") && !l.title.toLowerCase().includes("practica")) && (
        <button
          onClick={handleSimplifyAll}
          disabled={bulkProgress !== null}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {bulkProgress !== null ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Limpiando {bulkProgress.current} de {bulkProgress.total}...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              ✨ Limpiar TODOS los textos
            </>
          )}
        </button>
      )}
    </div>

    {lessons.length === 0 ? (
      <p className="text-neutral-400 text-center py-8">
        No hay lecturas disponibles. Sube un PDF primero.
      </p>
    ) : (
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="border border-border rounded-xl overflow-hidden">
            {/* Header de la lectura - clickeable */}
            <button
              onClick={() => onToggle(lesson.id)}
              className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-slate-800 hover:bg-neutral-100 dark:hover:bg-slate-700 transition text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {expandedLesson === lesson.id ? "📖" : "📕"}
                </span>
                <div>
                  <p className="font-bold text-foreground">{lesson.title}</p>
                  <p className="text-xs text-neutral-400">
                    {lesson.unitTitle}
                  </p>
                </div>
              </div>
              <span className="text-neutral-400 text-lg">
                {expandedLesson === lesson.id ? "▲" : "▼"}
              </span>
            </button>

            {/* Contenido expandido */}
            {expandedLesson === lesson.id && (
              <div className="p-4 space-y-4 border-t border-border bg-card">
                
                {lesson.referenceText ? (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-widest">Texto Base (Lectura)</h4>
                      <button 
                        onClick={() => handleSimplify(lesson.id, lesson.referenceText)}
                        disabled={isSimplifying === lesson.id}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSimplifying === lesson.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        Limpiar con IA
                      </button>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto pr-2">
                      {lesson.referenceText}
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-400 italic text-sm p-4">No hay texto base en esta lectura.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
  );
};

// ─── Answers Tab ────────────────────────────────────────────────

const AnswersTab = ({
  lessons,
  expandedLesson,
  onToggle,
}: {
  lessons: LessonData[];
  expandedLesson: number | null;
  onToggle: (id: number) => void;
}) => (
  <div>
    <h3 className="text-lg font-bold text-foreground mb-4">
      Preguntas y Respuestas ({lessons.reduce((sum, l) => sum + l.challenges.length, 0)} preguntas)
    </h3>

    {lessons.length === 0 ? (
      <p className="text-neutral-400 text-center py-8">
        No hay lecturas con preguntas. Sube un PDF primero.
      </p>
    ) : (
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="border border-border rounded-xl overflow-hidden">
            {/* Header de la lectura - clickeable */}
            <button
              onClick={() => onToggle(lesson.id)}
              className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-slate-800 hover:bg-neutral-100 dark:hover:bg-slate-700 transition text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {expandedLesson === lesson.id ? "📖" : "📕"}
                </span>
                <div>
                  <p className="font-bold text-foreground">{lesson.title}</p>
                  <p className="text-xs text-neutral-400">
                    {lesson.unitTitle} · {lesson.challenges.length} preguntas
                  </p>
                </div>
              </div>
              <span className="text-neutral-400 text-lg">
                {expandedLesson === lesson.id ? "▲" : "▼"}
              </span>
            </button>

            {/* Contenido expandido */}
            {expandedLesson === lesson.id && (
              <div className="p-4 space-y-4 border-t border-border bg-card">
                {lesson.challenges.map((challenge, qi) => (
                  <div key={challenge.id} className="p-4 bg-neutral-50 dark:bg-slate-800 rounded-xl">
                    {/* Pregunta */}
                    <p className="font-bold text-foreground mb-3">
                      <span className="text-neutral-400 mr-2">P{qi + 1}.</span>
                      {challenge.question}
                    </p>
                    {/* Opciones */}
                    <div className="space-y-1.5 ml-6">
                      {challenge.options.map((opt, oi) => {
                        const letter = ["A", "B", "C", "D", "E"][oi] || `${oi + 1}`;
                        return (
                          <div
                            key={oi}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                              opt.correct
                                ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 text-green-800 dark:text-green-400 font-bold"
                                : "bg-card border border-neutral-200 dark:border-slate-700 text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            <span className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold shrink-0 ${
                              opt.correct
                                ? "bg-green-500 text-white"
                                : "bg-neutral-200 text-neutral-500"
                            }`}>
                              {letter}
                            </span>
                            <span>{opt.text}</span>
                            {opt.correct && (
                              <span className="ml-auto text-green-600">✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
