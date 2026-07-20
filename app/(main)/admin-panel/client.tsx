"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  GraduationCap, ChevronDown, ChevronUp, BookOpen, FileText, 
  ExternalLink, CheckCircle2, User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter 
} from "recharts";

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

type ThesisStats = {
  avgPreScore: number;
  avgPostScore: number;
  learningGain: number;
  usersWithProgressCount: number;
  userProgressDetails: { userName: string; preScore: number; postScore: number; diff: number; completedChallenges: number }[];
  answersDistribution: { name: string; value: number; color: string }[];
  examTrendData: { name: string; promedio: number; cantidad: number }[];
};

type RawMockResult = {
  id: number;
  userId: string;
  score: number;
  correct: number;
  incorrect: number;
  blank: number;
  timeSpent: number;
  createdAt: string;
};

type ClassroomInfo = {
  id: number;
  name: string;
  userIds: string[];
};

type Props = {
  users: UserData[];
  lessons: LessonData[];
  stats: StatsData;
  thesisStats: ThesisStats;
  rawMockResults: RawMockResult[];
  classrooms: ClassroomInfo[];
  classroomsWithRelations: any[];
};

export const AdminDashboardClient = ({ users, lessons, stats, thesisStats, rawMockResults, classrooms, classroomsWithRelations }: Props) => {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "answers" | "readings" | "thesis" | "classrooms">("overview");
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
      <div className="flex gap-1 mb-6 bg-neutral-100 dark:bg-slate-800 p-1 rounded-xl w-fit flex-wrap">
        {([
          ["overview", "Resumen"],
          ["users", "Estudiantes"],
          ["readings", "Lecturas (Textos)"],
          ["answers", "Preguntas y Respuestas"],
          ["classrooms", "🏫 Aulas y Colegios"],
          ["thesis", "📊 Métricas de Tesis"],
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
        {activeTab === "classrooms" && (
          <ClassroomsGroupedTab classrooms={classroomsWithRelations} />
        )}
        {activeTab === "thesis" && (
          <ThesisTab 
            thesisStats={thesisStats} 
            rawMockResults={rawMockResults} 
            classrooms={classrooms} 
            users={users} 
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

// ─── Thesis Tab ──────────────────────────────────────────────────

type ThesisTabProps = {
  thesisStats: ThesisStats;
  rawMockResults: RawMockResult[];
  classrooms: ClassroomInfo[];
  users: UserData[];
};

const ThesisTab = ({ thesisStats, rawMockResults, classrooms, users }: ThesisTabProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("all");
  const [simulationMode, setSimulationMode] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Generación de datos o filtrado de datos reales
  const getProcessedData = () => {
    if (simulationMode) {
      // Generar 35 alumnos sintéticos con distribución normal
      const syntheticUsersList: { userName: string; preScore: number; postScore: number; diff: number; completedChallenges: number; timeSpentPre: number; timeSpentPost: number }[] = [];
      const syntheticAnswersDistribution = [
        { name: "Correctas", value: 480, color: "#10b981" },
        { name: "Incorrectas", value: 180, color: "#ef4444" },
        { name: "En Blanco", value: 40, color: "#6b7280" }
      ];

      // Generar datos sintéticos correlacionados
      for (let i = 1; i <= 35; i++) {
        // Pre-test: media 45, sd 10
        const preScore = Math.max(10, Math.min(100, Math.round(45 + (Math.random() - 0.5) * 20)));
        // Retos resueltos: entre 15 y 90
        const completed = Math.round(15 + Math.random() * 75);
        // Ganancia de aprendizaje correlacionada con los retos: ganancia promedio de 15 pts + completed * 0.2
        const gain = Math.max(2, Math.round(8 + completed * 0.15 + (Math.random() - 0.4) * 8));
        const postScore = Math.min(100, preScore + gain);
        
        // Tiempos (segundos)
        const timeSpentPre = Math.round(1800 - (preScore * 10) + (Math.random() - 0.5) * 300);
        const timeSpentPost = Math.round(1500 - (postScore * 10) + (Math.random() - 0.5) * 200);

        syntheticUsersList.push({
          userName: `Estudiante Muestra ${i}`,
          preScore,
          postScore,
          diff: postScore - preScore,
          completedChallenges: completed,
          timeSpentPre,
          timeSpentPost
        });
      }

      // Calcular medias
      const n = syntheticUsersList.length;
      const sumPre = syntheticUsersList.reduce((acc, u) => acc + u.preScore, 0);
      const sumPost = syntheticUsersList.reduce((acc, u) => acc + u.postScore, 0);
      const avgPreScore = Number((sumPre / n).toFixed(2));
      const avgPostScore = Number((sumPost / n).toFixed(2));
      const learningGain = Number((avgPostScore - avgPreScore).toFixed(2));

      // Tendencia de simulacros simulada
      const examTrendData = [
        { name: "Simulacro 1", promedio: 44.5, cantidad: 35 },
        { name: "Simulacro 2", promedio: 48.2, cantidad: 35 },
        { name: "Simulacro 3", promedio: 53.8, cantidad: 35 },
        { name: "Simulacro 4", promedio: 58.1, cantidad: 35 },
        { name: "Simulacro 5", promedio: 64.6, cantidad: 35 }
      ];

      return {
        usersWithProgressCount: n,
        avgPreScore,
        avgPostScore,
        learningGain,
        userProgressDetails: syntheticUsersList,
        answersDistribution: syntheticAnswersDistribution,
        examTrendData,
        rawResultsForScatter: syntheticUsersList.flatMap(u => [
          { score: u.preScore, timeSpent: u.timeSpentPre, type: "Pre-Test" },
          { score: u.postScore, timeSpent: u.timeSpentPost, type: "Post-Test" }
        ])
      };
    }

    // DATOS REALES
    // Filtrar usuarios de acuerdo al aula seleccionada
    let filteredUserIds: string[] | null = null;
    if (selectedClassroom !== "all") {
      const classroom = classrooms.find(c => c.id.toString() === selectedClassroom);
      if (classroom) {
        filteredUserIds = classroom.userIds;
      }
    }

    const filteredMockResults = filteredUserIds 
      ? rawMockResults.filter(r => filteredUserIds!.includes(r.userId))
      : rawMockResults;

    const resultsByUser: Record<string, typeof rawMockResults> = {};
    filteredMockResults.forEach((res) => {
      if (!resultsByUser[res.userId]) {
        resultsByUser[res.userId] = [];
      }
      resultsByUser[res.userId].push(res);
    });

    let totalPreTest = 0;
    let totalPostTest = 0;
    let usersWithProgressCount = 0;
    const userProgressDetails: { userName: string; preScore: number; postScore: number; diff: number; completedChallenges: number }[] = [];

    Object.entries(resultsByUser).forEach(([userId, userResults]) => {
      if (userResults.length >= 2) {
        const preTest = userResults[0];
        const postTest = userResults[userResults.length - 1];
        const userObj = users.find(u => u.userId === userId);
        const userName = userObj ? userObj.userName : "Estudiante";
        const completed = userObj ? userObj.completedChallenges : 0;

        totalPreTest += preTest.score;
        totalPostTest += postTest.score;
        usersWithProgressCount++;

        userProgressDetails.push({
          userName,
          preScore: Number(preTest.score.toFixed(2)),
          postScore: Number(postTest.score.toFixed(2)),
          diff: Number((postTest.score - preTest.score).toFixed(2)),
          completedChallenges: completed
        });
      }
    });

    const avgPreScore = usersWithProgressCount > 0 ? Number((totalPreTest / usersWithProgressCount).toFixed(2)) : 0;
    const avgPostScore = usersWithProgressCount > 0 ? Number((totalPostTest / usersWithProgressCount).toFixed(2)) : 0;
    const learningGain = Number((avgPostScore - avgPreScore).toFixed(2));

    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalBlank = 0;
    filteredMockResults.forEach((res) => {
      totalCorrect += res.correct;
      totalIncorrect += res.incorrect;
      totalBlank += res.blank;
    });

    const examIndexStats: Record<number, { sumScore: number; count: number }> = {};
    filteredMockResults.forEach((res) => {
      const userExams = resultsByUser[res.userId];
      const index = userExams.findIndex(x => x.id === res.id) + 1;
      if (!examIndexStats[index]) {
        examIndexStats[index] = { sumScore: 0, count: 0 };
      }
      examIndexStats[index].sumScore += res.score;
      examIndexStats[index].count++;
    });

    const examTrendData = Object.entries(examIndexStats).map(([idx, stat]) => ({
      name: `Simulacro ${idx}`,
      promedio: Number((stat.sumScore / stat.count).toFixed(2)),
      cantidad: stat.count
    })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    const rawResultsForScatter = filteredMockResults.map(r => ({
      score: r.score,
      timeSpent: r.timeSpent,
      type: "Simulacro"
    }));

    return {
      usersWithProgressCount,
      avgPreScore,
      avgPostScore,
      learningGain,
      userProgressDetails,
      answersDistribution: [
        { name: "Correctas", value: totalCorrect, color: "#10b981" },
        { name: "Incorrectas", value: totalIncorrect, color: "#ef4444" },
        { name: "En Blanco", value: totalBlank, color: "#6b7280" }
      ],
      examTrendData,
      rawResultsForScatter
    };
  };

  const currentStats = getProcessedData();

  // 2. Fórmulas Estadísticas Inferenciales (t-Student y Pearson)
  const calculateStatisticalInference = () => {
    const list = currentStats.userProgressDetails;
    const n = list.length;
    
    if (n < 2) {
      return {
        tStat: 0,
        pValue: 1,
        df: 0,
        cohenD: 0,
        effectSizeLabel: "N/A",
        pearsonR: 0,
        verdict: "Muestra insuficiente para realizar análisis inferencial (Se requieren al menos 2 estudiantes)."
      };
    }

    // t-Student
    const diffs = list.map(u => u.postScore - u.preScore);
    const meanDiff = diffs.reduce((a, b) => a + b, 0) / n;
    const sumSqDiff = diffs.reduce((a, b) => a + Math.pow(b - meanDiff, 2), 0);
    const variance = sumSqDiff / (n - 1);
    const stdDev = Math.sqrt(variance);
    const stdErr = stdDev / Math.sqrt(n);
    const tStat = stdErr === 0 ? 0 : meanDiff / stdErr;
    const df = n - 1;

    // Aprox de p-valor
    const x = Math.abs(tStat);
    const z = x * (1 - 1 / (4 * df));
    const pNormal = 1 / (1 + Math.exp(-z * (1.5976 + 0.070566 * z * z)));
    const pValue = Math.max(0.0001, Math.min(0.9999, 2 * (1 - pNormal)));

    // d de Cohen para muestras pareadas
    const cohenD = stdDev === 0 ? 0 : meanDiff / stdDev;
    let effectSizeLabel = "Bajo";
    if (Math.abs(cohenD) >= 0.8) effectSizeLabel = "Alto";
    else if (Math.abs(cohenD) >= 0.5) effectSizeLabel = "Medio";
    else if (Math.abs(cohenD) < 0.2) effectSizeLabel = "Despreciable";

    // Correlación de Pearson entre Retos Completados y Ganancia de Aprendizaje
    const sumX = list.reduce((a, b) => a + b.completedChallenges, 0);
    const sumY = list.reduce((a, b) => a + b.diff, 0);
    const sumXY = list.reduce((a, b) => a + (b.completedChallenges * b.diff), 0);
    const sumX2 = list.reduce((a, b) => a + Math.pow(b.completedChallenges, 2), 0);
    const sumY2 = list.reduce((a, b) => a + Math.pow(b.diff, 2), 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - Math.pow(sumX, 2)) * ((n * sumY2) - Math.pow(sumY, 2)));
    const pearsonR = denominator === 0 ? 0 : numerator / denominator;

    let verdict = "";
    if (pValue < 0.05) {
      verdict = `Existe una diferencia altamente significativa (p < 0.05) entre el Pre-test y el Post-test. Se rechaza la hipótesis nula (H₀). El software educativo RutaCachimbo influye positivamente en el rendimiento académico de los alumnos.`;
    } else {
      verdict = `No se hallaron diferencias estadísticamente significativas (p >= 0.05). No se puede rechazar la hipótesis nula (H₀). El tamaño de la muestra o la consistencia interna podrían estar influyendo.`;
    }

    return {
      tStat: Number(tStat.toFixed(3)),
      pValue: pValue < 0.001 ? "p < 0.001" : `p = ${pValue.toFixed(4)}`,
      df,
      cohenD: Number(cohenD.toFixed(3)),
      effectSizeLabel,
      pearsonR: Number(pearsonR.toFixed(3)),
      verdict
    };
  };

  const infStats = calculateStatisticalInference();

  // 3. Distribución del Nivel de Logro (Inicio, Proceso, Logrado)
  const getLevelsDistributionData = () => {
    const list = currentStats.userProgressDetails;
    let preInicio = 0, preProceso = 0, preLogrado = 0;
    let postInicio = 0, postProceso = 0, postLogrado = 0;

    list.forEach(u => {
      if (u.preScore <= 50) preInicio++;
      else if (u.preScore <= 75) preProceso++;
      else preLogrado++;

      if (u.postScore <= 50) postInicio++;
      else if (u.postScore <= 75) postProceso++;
      else postLogrado++;
    });

    return [
      { name: "Inicio (0-50 pts)", "Pre-Test": preInicio, "Post-Test": postInicio },
      { name: "Proceso (51-75 pts)", "Pre-Test": preProceso, "Post-Test": postProceso },
      { name: "Logrado (76-100 pts)", "Pre-Test": preLogrado, "Post-Test": postLogrado }
    ];
  };

  const levelsDistribution = getLevelsDistributionData();

  const prePostData = [
    { name: "Pre-Test (Antes)", Puntaje: currentStats.avgPreScore, color: "#3b82f6" },
    { name: "Post-Test (Después)", Puntaje: currentStats.avgPostScore, color: "#10b981" }
  ];

  const handleCopyCSV = () => {
    const csvContent = "Estudiante,Pre-Test,Post-Test,Ganancia (Delta),Retos Completados\n" +
      currentStats.userProgressDetails.map(d => `"${d.userName.replace(/"/g, '""')}",${d.preScore},${d.postScore},${d.diff},${d.completedChallenges}`).join("\n");
    navigator.clipboard.writeText(csvContent);
    toast.success("¡Datos en formato CSV copiados al portapapeles!");
  };

  return (
    <div className="space-y-8">
      {/* Controles de Tesis */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-border p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-500">Filtrar por Aula Experimental</label>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="bg-card border border-border dark:border-slate-700 px-3 py-2 rounded-xl text-sm font-semibold outline-none text-foreground"
              disabled={simulationMode}
            >
              <option value="all">Todas las aulas</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Simulador Switch */}
        <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 p-3 rounded-2xl w-full md:w-auto justify-between md:justify-start">
          <div className="text-left">
            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Modo Simulación / Datos Tesis</p>
            <p className="text-[10px] text-indigo-500 dark:text-indigo-300">Genera 35 estudiantes para ensayos</p>
          </div>
          <button
            onClick={() => setSimulationMode(!simulationMode)}
            className={`w-12 h-6 rounded-full p-1 transition-all ${simulationMode ? "bg-indigo-600" : "bg-neutral-300 dark:bg-slate-700"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${simulationMode ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Resumen Académico */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-foreground">Estadísticas de Validación para Tesis</h3>
          {simulationMode && (
            <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold rounded-full animate-pulse border border-indigo-200 dark:border-indigo-800">
              Datos Simulados Activos
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800 border-2 border-border rounded-2xl p-5">
            <p className="text-sm font-semibold text-neutral-500">Muestra Activa (N)</p>
            <p className="text-3xl font-black text-neutral-800 dark:text-neutral-100 mt-1">{currentStats.usersWithProgressCount}</p>
            <p className="text-xs text-neutral-400 mt-1">Estudiantes en evaluación</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 border-2 border-border rounded-2xl p-5">
            <p className="text-sm font-semibold text-neutral-500">Pre-Test Promedio</p>
            <p className="text-3xl font-black text-blue-600 mt-1">{currentStats.avgPreScore} pts</p>
            <p className="text-xs text-neutral-400 mt-1">Línea base (Inicio)</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 border-2 border-border rounded-2xl p-5">
            <p className="text-sm font-semibold text-neutral-500">Post-Test Promedio</p>
            <p className="text-3xl font-black text-green-600 mt-1">{currentStats.avgPostScore} pts</p>
            <p className="text-xs text-neutral-400 mt-1">Salida (Actual)</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 border-2 border-border rounded-2xl p-5">
            <p className="text-sm font-semibold text-neutral-500">Ganancia Cognitiva (Δ)</p>
            <p className={`text-3xl font-black mt-1 ${currentStats.learningGain >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {currentStats.learningGain >= 0 ? `+${currentStats.learningGain}` : currentStats.learningGain} pts
            </p>
            <p className="text-xs text-neutral-400 mt-1">Diferencia de aprendizaje</p>
          </div>
        </div>
      </div>

      {/* Contraste de Hipótesis y Estadísticas Inferenciales */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900/60 dark:to-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-950 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute right-4 top-4 text-6xl opacity-10 pointer-events-none select-none font-bold">SPSS</div>
        <h4 className="font-extrabold text-indigo-900 dark:text-indigo-400 mb-3 text-lg">Resultados de Pruebas de Hipótesis Científica</h4>
        
        {currentStats.usersWithProgressCount < 2 ? (
          <p className="text-sm text-neutral-500 italic">No hay suficientes estudiantes en la muestra para calcular pruebas inferenciales.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900">
                  <p className="text-xs text-neutral-400 font-bold">t de Student calculada</p>
                  <p className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-1">t = {infStats.tStat}</p>
                  <p className="text-[10px] text-neutral-400">gl = {infStats.df}</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900">
                  <p className="text-xs text-neutral-400 font-bold">Nivel de Significancia (p)</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{infStats.pValue}</p>
                  <p className="text-[10px] text-neutral-400">Umbral Alpha = 0.05</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900">
                  <p className="text-xs text-neutral-400 font-bold">Tamaño del Efecto (d)</p>
                  <p className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-1">d = {infStats.cohenD}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">Efecto: {infStats.effectSizeLabel}</p>
                </div>
              </div>

              <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs">
                <p className="font-bold text-neutral-600 dark:text-neutral-300">Correlación de Pearson (r):</p>
                <p className="text-lg font-black text-indigo-700 dark:text-indigo-300 mt-0.5">r = {infStats.pearsonR}</p>
                <p className="text-[10px] text-neutral-400">
                  Mide la correlación entre cantidad de retos resueltos y ganancia de puntaje. Un valor positivo fuerte prueba que a mayor práctica, mayor es la mejora académica.
                </p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Interpretación del Contraste</p>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-2 leading-relaxed font-medium">
                  {infStats.verdict}
                </p>
              </div>
              <p className="text-[10px] text-neutral-400 mt-3 italic">
                * Generado en tiempo real con algoritmos de estadística paramétrica y análisis correlacional.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Gráficos */}
      {isMounted ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico 1: Comparativa de Medias Pre-Post */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-border p-6 rounded-2xl">
            <h4 className="font-bold text-neutral-700 dark:text-neutral-300 mb-4 text-center">Comparativa Pre-Test vs Post-Test Global</h4>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prePostData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Bar dataKey="Puntaje" radius={[8, 8, 0, 0]}>
                    {prePostData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-neutral-400 mt-3">
              Muestra el cambio de promedio del grupo experimental. Un incremento demuestra la efectividad de la plataforma.
            </p>
          </div>

          {/* Gráfico 2: Evolución de Calificaciones de Simulacros */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-border p-6 rounded-2xl">
            <h4 className="font-bold text-neutral-700 dark:text-neutral-300 mb-4 text-center">Curva de Aprendizaje por N° de Simulacro</h4>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentStats.examTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="promedio" stroke="#8884d8" activeDot={{ r: 8 }} name="Puntaje Promedio" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-neutral-400 mt-3">
              Representa la progresión de puntaje medio conforme los alumnos resuelven más simulacros secuencialmente.
            </p>
          </div>

          {/* Gráfico 3: Distribución de Nivel de Logro */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-border p-6 rounded-2xl">
            <h4 className="font-bold text-neutral-700 dark:text-neutral-300 mb-4 text-center">Distribución de Estudiantes por Nivel de Logro</h4>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelsDistribution} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Pre-Test" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Post-Test" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-neutral-400 mt-3">
              Muestra cuántos estudiantes pasaron del nivel de Inicio al nivel Logrado tras interactuar con la plataforma.
            </p>
          </div>

          {/* Gráfico 4: Dispersión Tiempo vs. Rendimiento */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-border p-6 rounded-2xl">
            <h4 className="font-bold text-neutral-700 dark:text-neutral-300 mb-4 text-center">Eficiencia: Tiempo de Resolución vs Calificación</h4>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="timeSpent" name="Tiempo" unit=" s" domain={[600, 2400]} />
                  <YAxis type="number" dataKey="score" name="Puntaje" unit=" pts" domain={[0, 100]} />
                  <RechartsTooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter name="Simulacros" data={currentStats.rawResultsForScatter} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-neutral-400 mt-3">
              Cruza el puntaje obtenido con el tiempo invertido en segundos. Se busca comprobar si resuelven más rápido y con mayor precisión.
            </p>
          </div>

          {/* Gráfico 5: Distribución de Respuestas */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-border p-6 rounded-2xl">
            <h4 className="font-bold text-neutral-700 dark:text-neutral-300 mb-4 text-center">Distribución Total de Respuestas en Simulacros</h4>
            <div className="h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentStats.answersDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {currentStats.answersDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-neutral-400 mt-3">
              Muestra la proporción acumulada de respuestas correctas, incorrectas y omitidas por el total de alumnos.
            </p>
          </div>

          {/* Tabla de Detalle para Tesis (SPSS/Excel) */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-border p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-neutral-700 dark:text-neutral-300">Base de Datos Experimental</h4>
                <button
                  onClick={handleCopyCSV}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 animate-bounce hover:animate-none"
                >
                  📥 Copiar CSV para Excel / SPSS
                </button>
              </div>
              <div className="max-h-[220px] overflow-y-auto border border-neutral-200 dark:border-slate-700 rounded-lg text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 dark:bg-slate-700 border-b border-neutral-200 dark:border-slate-600 font-bold text-neutral-600 dark:text-neutral-300">
                      <th className="p-2">Estudiante</th>
                      <th className="p-2">Pre-Test</th>
                      <th className="p-2">Post-Test</th>
                      <th className="p-2">Ganancia (Δ)</th>
                      <th className="p-2">Retos Completados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStats.userProgressDetails.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-neutral-400">
                          Se necesitan alumnos con al menos 2 simulacros para poblar la muestra.
                        </td>
                      </tr>
                    ) : (
                      currentStats.userProgressDetails.map((detail, idx) => (
                        <tr key={idx} className="border-b border-neutral-100 dark:border-slate-800 text-foreground">
                          <td className="p-2 truncate max-w-[120px] font-medium">{detail.userName}</td>
                          <td className="p-2 font-semibold text-blue-500">{detail.preScore}</td>
                          <td className="p-2 font-semibold text-green-500">{detail.postScore}</td>
                          <td className={`p-2 font-bold ${detail.diff >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                            {detail.diff >= 0 ? `+${detail.diff}` : detail.diff}
                          </td>
                          <td className="p-2 text-center text-purple-600 font-bold">{detail.completedChallenges}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-4 leading-relaxed">
              * Nota: Puedes copiar los datos consolidados en formato CSV directamente y pegarlos en Excel o SPSS para realizar pruebas estadísticas de contraste (como t-Student para muestras pareadas o Wilcoxon).
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[300px] w-full bg-slate-50 dark:bg-slate-900 border rounded-2xl animate-pulse" />
      )}
    </div>
  );
};

type ClassroomsGroupedTabProps = {
  classrooms: any[];
};

const ClassroomsGroupedTab = ({ classrooms }: ClassroomsGroupedTabProps) => {
  const [expandedClassroom, setExpandedClassroom] = useState<number | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Jerarquía Escolar: Colegios, Profesores y Cursos
        </h3>
        <p className="text-sm text-neutral-400 mt-1">
          Visualiza de forma agrupada la estructura escolar completa, incluyendo los documentos subidos al drive por curso y las preguntas asociadas.
        </p>
      </div>

      {classrooms.length === 0 ? (
        <p className="text-neutral-500 italic text-sm">No hay aulas activas en el sistema.</p>
      ) : (
        <div className="space-y-4">
          {classrooms.map((cls) => {
            const isClsExpanded = expandedClassroom === cls.id;
            return (
              <div key={cls.id} className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-card">
                {/* Cabecera Colegio */}
                <div 
                  onClick={() => setExpandedClassroom(isClsExpanded ? null : cls.id)}
                  className="p-4 bg-slate-50 dark:bg-slate-900/40 flex justify-between items-center cursor-pointer hover:bg-slate-100/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-teal-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-base text-neutral-700 dark:text-neutral-300">{cls.name}</h4>
                      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        Profesor: <span className="font-bold text-neutral-500">{cls.teacherName}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 px-2.5 py-1 rounded-full uppercase">
                      Colegio
                    </span>
                    {isClsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Contenido Colegio */}
                {isClsExpanded && (
                  <div className="p-4 border-t-2 border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-300">
                    {cls.courses.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic">Este profesor aún no ha creado materias en este colegio.</p>
                    ) : (
                      cls.courses.map((course: any) => {
                        const isCourseExpanded = expandedCourse === course.id;
                        // Obtener los documentos PDF asociados a este curso
                        const coursePdfs = cls.pdfDocuments.filter((doc: any) => 
                          doc.classroomId === cls.id && 
                          course.units.some((u: any) => 
                            u.lessons.some((l: any) => l.pdfDocumentId === doc.id)
                          )
                        );

                        return (
                          <div key={course.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/30">
                            {/* Cabecera Curso */}
                            <div 
                              onClick={() => setExpandedCourse(isCourseExpanded ? null : course.id)}
                              className="p-3 bg-slate-100/40 dark:bg-slate-900/20 flex justify-between items-center cursor-pointer hover:bg-slate-100/70 transition"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-500 shrink-0" />
                                <span className="font-bold text-sm text-neutral-700 dark:text-neutral-300">{course.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded">
                                  {coursePdfs.length} PDFs
                                </span>
                                {isCourseExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>

                            {/* Contenido Curso */}
                            {isCourseExpanded && (
                              <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                                <div>
                                  <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Drive de Archivos del Curso</h5>
                                  
                                  {coursePdfs.length === 0 ? (
                                    <p className="text-xs text-neutral-400 italic">No hay archivos PDF en el drive de este curso.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {coursePdfs.map((doc: any) => {
                                        const isViewing = viewingDocId === doc.id;
                                        return (
                                          <div key={doc.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-card space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex items-center gap-2 min-w-0">
                                                <FileText className="w-8 h-8 text-rose-500 shrink-0" />
                                                <div className="min-w-0">
                                                  <p className="font-bold text-xs text-neutral-700 truncate" title={doc.title}>{doc.title}</p>
                                                  <p className="text-[9px] text-neutral-400">Subido: {new Date(doc.createdAt).toLocaleDateString()}</p>
                                                </div>
                                              </div>
                                              <a href={doc.url} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-neutral-600 shrink-0">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                              </a>
                                            </div>

                                            <div className="flex gap-2 pt-1 border-t border-slate-100">
                                              <Button 
                                                size="sm" 
                                                variant="secondaryOutline"
                                                className="w-full text-[9px] py-1 h-7 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
                                                onClick={() => setViewingDocId(isViewing ? null : doc.id)}
                                              >
                                                {isViewing ? "Ocultar Preguntas" : `Ver Preguntas IA (${doc.questions.length})`}
                                              </Button>
                                            </div>

                                            {/* Listado de preguntas del PDF */}
                                            {isViewing && (
                                              <div className="pt-2 border-t border-slate-100 space-y-3 max-h-[250px] overflow-y-auto animate-in slide-in-from-top-1 duration-200">
                                                {doc.questions.map((q: any, qIdx: number) => (
                                                  <div key={qIdx} className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-border text-[10px] space-y-1">
                                                    <p className="font-bold text-neutral-600">{qIdx + 1}. {q.question}</p>
                                                    <div className="grid grid-cols-1 gap-1 pl-2">
                                                      {q.options.map((o: any, oIdx: number) => (
                                                        <div key={oIdx} className={`flex items-center gap-1 ${o.correct ? 'text-emerald-600 font-bold' : 'text-neutral-400'}`}>
                                                          {o.correct && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                                                          <span>{o.text}</span>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

