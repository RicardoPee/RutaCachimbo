import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Swords, 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronDown
} from "lucide-react";
import Image from "next/image";
import { PublishButton } from "./publish-button";

export default async function TournamentDetailPage({ params }: { params: { id: string } }) {
  const { userId } = auth();
  const adminId = process.env.ADMIN_USER_ID;

  if (userId !== adminId) {
    redirect("/");
  }

  const tournamentId = parseInt(params.id);
  
  if (isNaN(tournamentId)) {
    redirect("/admin/wars");
  }

  const tournament = await prisma.liveTournament.findUnique({
    where: { id: tournamentId },
    include: {
      questions: {
        orderBy: { order: "asc" }
      },
      _count: {
        select: { participants: true }
      }
    }
  });

  if (!tournament) {
    redirect("/admin/wars");
  }

  // Cargar participantes y enriquecerlos con Clerk
  const participants = await prisma.tournamentParticipant.findMany({
    where: { tournamentId },
    include: {
      faction: true
    },
    orderBy: {
      score: "desc"
    }
  });

  let enrichedParticipants: any[] = [];
  if (participants.length > 0) {
    const userIds = participants.map(p => p.userId);
    const clerkUsers = await clerkClient.users.getUserList({ userId: userIds });
    enrichedParticipants = participants.map(p => {
      const clerkUser = clerkUsers.find(u => u.id === p.userId);
      return {
        ...p,
        userName: clerkUser ? `${clerkUser.firstName || "Usuario"} ${clerkUser.lastName || ""}`.trim() : "Recluta Fantasma",
        userImage: clerkUser?.imageUrl || "",
        factionName: p.faction?.name || "Mercenario",
        userEmail: clerkUser?.emailAddresses?.[0]?.emailAddress || "Sin Correo",
      };
    });
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-12">
      {/* Header */}
      <div>
        <Link href="/admin/wars" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Historial
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <Swords className="w-8 h-8 text-indigo-500" /> {tournament.title}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">{tournament.description}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest ${
              tournament.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
              tournament.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 animate-pulse' :
              'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              Estado: {tournament.status}
            </div>
            {tournament.status !== 'FINISHED' && (
              <PublishButton tournamentId={tournament.id} />
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl border-2 border-border shadow-sm flex items-center gap-4">
          <div className="bg-indigo-100 dark:bg-indigo-950/50 p-3 rounded-xl"><Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Inicio Programado</p>
            <p className="font-bold text-slate-700 dark:text-slate-300">{new Date(tournament.startTime).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border-2 border-border shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-950/50 p-3 rounded-xl"><Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Alumnos Inscritos</p>
            <p className="font-bold text-slate-700 dark:text-slate-300">{enrichedParticipants.length} Jugadores</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border-2 border-border shadow-sm flex items-center gap-4">
          <div className="bg-rose-100 dark:bg-rose-950/50 p-3 rounded-xl"><BookOpen className="w-6 h-6 text-rose-600 dark:text-rose-400" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Preguntas</p>
            <p className="font-bold text-slate-700 dark:text-slate-300">{tournament.questions.length} Rondas</p>
          </div>
        </div>
      </div>

      {/* Section 1: Registered Students & Results */}
      <div className="space-y-6">
        <div className="border-b-2 border-slate-100 dark:border-border pb-4">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" /> Alumnos Registrados y Respuestas
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Registro de la cantidad de alumnos inscritos, sus puntajes y el desglose de preguntas acertadas/falladas.
          </p>
        </div>

        {enrichedParticipants.length === 0 ? (
          <div className="text-center p-12 bg-muted/50 rounded-2xl border-2 border-border border-dashed">
            <p className="text-muted-foreground font-bold">No hay alumnos inscritos en este torneo todavía.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enrichedParticipants.map((p, idx) => {
              const answersList = p.answers as any[] || [];
              const totalQ = tournament.questions.length;
              
              // Calcular aciertos y fallos
              let correctCount = 0;
              let incorrectCount = 0;

              answersList.forEach(ans => {
                const q = tournament.questions.find(quest => quest.id === ans.questionId);
                if (q) {
                  if (ans.selectedIndex === q.correctIndex) {
                    correctCount++;
                  } else {
                    incorrectCount++;
                  }
                }
              });

              const unansweredCount = totalQ - answersList.length;

              return (
                <div key={p.id} className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  {/* Fila de Perfil del Alumno */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0 w-12 h-12">
                        {p.userImage ? (
                          <Image src={p.userImage} alt={p.userName} fill className="rounded-full border-2 border-indigo-500 object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-700">
                            {p.userName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute -top-1 -left-1 bg-indigo-600 text-white font-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg flex flex-wrap items-center gap-2">
                          {p.userName}
                          <span className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold rounded-full border border-indigo-200 dark:border-indigo-800">
                            {p.factionName}
                          </span>
                          {unansweredCount === 0 ? (
                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-full border border-emerald-300">
                              TERMINADO
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 font-black rounded-full border border-amber-300 animate-pulse">
                              EN PROGRESO ({answersList.length}/{totalQ})
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">{p.userEmail}</p>
                        <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider mt-1">Inscrito: {new Date(p.joinedAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-border">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Puntaje</p>
                        <p className="text-2xl font-black text-emerald-500">{p.score} XP</p>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de Desempeño */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {correctCount} Correctas
                    </span>
                    <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold text-xs px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
                      <XCircle className="w-3.5 h-3.5" /> {incorrectCount} Incorrectas
                    </span>
                    {unansweredCount > 0 && (
                      <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 text-muted-foreground font-bold text-xs px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <AlertCircle className="w-3.5 h-3.5" /> {unansweredCount} Sin responder
                      </span>
                    )}
                  </div>

                  {/* Desglose de Preguntas */}
                  <details className="mt-4 border-t border-slate-100 dark:border-border pt-4 group">
                    <summary className="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline list-none flex items-center gap-1 uppercase tracking-wider">
                      Ver detalle de preguntas y respuestas
                      <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-4 space-y-3 pl-2 border-l-2 border-slate-100 dark:border-border">
                      {tournament.questions.map((q, qIdx) => {
                        const userAns = answersList.find(ans => ans.questionId === q.id);
                        
                        let statusText = "Sin responder";
                        let statusColorClass = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-muted-foreground";
                        let selectedOption = null;

                        if (userAns) {
                          selectedOption = q.options[userAns.selectedIndex];
                          if (userAns.selectedIndex === q.correctIndex) {
                            statusText = "Correcta";
                            statusColorClass = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300";
                          } else {
                            statusText = "Incorrecta (Fallo)";
                            statusColorClass = "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300";
                          }
                        }

                        return (
                          <div key={q.id} className="p-3 rounded-xl border bg-muted/50 dark:border-border text-sm">
                            <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
                              <span className="font-bold text-slate-600 dark:text-muted-foreground">Ronda {qIdx + 1}</span>
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${statusColorClass}`}>
                                {statusText} {userAns?.pointsEarned !== undefined && `(+${userAns.pointsEarned} XP)`}
                              </span>
                            </div>
                            <p className="font-semibold text-foreground mb-2">{q.questionText}</p>
                            <div className="space-y-1.5 pl-2 text-xs">
                              {selectedOption && (
                                <p className="font-medium">
                                  <span className="text-slate-400">Opción elegida: </span>
                                  <span className={userAns?.selectedIndex === q.correctIndex ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                                    {selectedOption}
                                  </span>
                                </p>
                              )}
                              <p className="font-medium text-muted-foreground">
                                <span className="text-slate-400">Opción correcta: </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  {q.options[q.correctIndex]}
                                </span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Tournament Questions */}
      <div className="space-y-6">
        <div className="border-b-2 border-slate-100 dark:border-border pb-4">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" /> Banco de Preguntas del Torneo
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Revisa las lecturas y preguntas asignadas a cada una de las rondas de este torneo.
          </p>
        </div>

        <div className="space-y-4">
          {tournament.questions.map((q, idx) => (
            <details key={q.id} className="group bg-card border-2 border-border rounded-2xl overflow-hidden shadow-sm open:shadow-md transition-all">
              <summary className="bg-slate-50 dark:bg-slate-800/50 p-6 cursor-pointer list-none flex flex-col gap-4 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="bg-indigo-600 text-white font-black px-3 py-1 rounded-lg text-sm">
                    Ronda {idx + 1}
                  </span>
                  <span className="text-muted-foreground font-bold text-sm">Haz clic para ver las preguntas ▼</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Lectura de Referencia</h4>
                  <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-3 group-open:line-clamp-none transition-all">
                    {q.readingText || "(Sin lectura de referencia)"}
                  </p>
                </div>
              </summary>
              
              <div className="p-6 border-t-2 border-slate-100 dark:border-border bg-card">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-foreground mb-4 flex items-start gap-2">
                    <span className="text-indigo-500">Q:</span> {q.questionText}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => (
                      <div 
                        key={optIdx} 
                        className={`p-3 rounded-xl border-2 font-medium ${
                          q.correctIndex === optIdx 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-card border-border text-slate-600 dark:text-muted-foreground'
                        }`}
                      >
                        {opt} {q.correctIndex === optIdx && <span className="float-right font-black">✓ Correcta</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          ))}

          {tournament.questions.length === 0 && (
            <div className="text-center p-12 bg-muted/50 rounded-2xl border-2 border-border border-dashed">
              <p className="text-muted-foreground font-bold">Este torneo no tiene preguntas registradas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
