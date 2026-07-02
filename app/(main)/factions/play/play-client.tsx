"use client";

import { useState, useEffect, useRef } from "react";
import { getTournamentState, submitTournamentAnswer, getTournamentLeaderboard, joinTournament } from "@/actions/tournament-actions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Shield, Trophy, Zap, AlertTriangle, EyeOff, CheckCircle2, XCircle, Clock } from "lucide-react";
import Image from "next/image";

export const PlayClient = ({ currentUser }: any) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameState, setGameState] = useState<any>(null);
  const tournamentId = searchParams.get("tournamentId") ? parseInt(searchParams.get("tournamentId") as string) : undefined;
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  
  // Anti-Cheat State
  const [cheatCount, setCheatCount] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  
  // Local Async State
  const [localQuestionIndex, setLocalQuestionIndex] = useState(0);

  // Polling for game state (Every 5 seconds now, since it's async)
  useEffect(() => {
    const fetchState = async () => {
      const state = await getTournamentState(tournamentId);
      if (!state) {
        toast.error("No hay torneos activos");
        router.push("/factions");
        return;
      }
      setGameState(state);
      if (state.isRegistered) {
        setIsJoined(true);
      }
      
      // Initialize local progress based on what the server knows
      if (state.userAnswers) {
        setLocalQuestionIndex(state.userAnswers.length);
      }

      if (state.phase === "FINISHED") {
        const board = await getTournamentLeaderboard(state.id);
        setLeaderboard(board);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 5000); 
    return () => clearInterval(interval);
  }, [router, tournamentId]);

  // Anti-Cheat Listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameState?.phase === "QUESTION" && localQuestionIndex < gameState?.totalQuestions) {
        setCheatCount(prev => {
          const newCount = prev + 1;
          setShowCheatWarning(true);
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [gameState, localQuestionIndex]);

  const handleJoin = async () => {
    if (!gameState) return;
    const res = await joinTournament(gameState.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      setIsJoined(true);
      toast.success("¡Te has unido al campo de batalla!");
    }
  };

  const handleAnswer = async (index: number) => {
    if (!gameState || hasAnswered) return;
    
    const currentQuestion = gameState.questions[localQuestionIndex];
    if (!currentQuestion) return;
    
    setHasAnswered(true);
    const res = await submitTournamentAnswer(gameState.id, currentQuestion.id, index, gameState.timeRemaining, cheatCount);
    
    if (res.error) {
      toast.error(res.error);
      setHasAnswered(false);
    } else {
      // Avanzar localmente de inmediato sin esperar al server
      setLocalQuestionIndex(prev => prev + 1);
      setHasAnswered(false);
      
      // Forzar una actualización de estado para recibir el fullSummary si terminamos
      if (localQuestionIndex + 1 >= gameState.totalQuestions) {
        const state = await getTournamentState(tournamentId);
        setGameState(state);
      }
    }
  };

  if (!gameState) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-white"><Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-500" /> Cargando el Campo de Batalla...</div>;
  }

  // Pantalla de advertencia Anti-Trampas (Bloqueante)
  if (showCheatWarning) {
    return (
      <div className="fixed inset-0 z-50 bg-rose-950 flex flex-col items-center justify-center p-6 text-center">
        <EyeOff className="w-32 h-32 text-rose-500 mb-8 animate-bounce" />
        <h1 className="text-5xl font-black text-white mb-4 uppercase tracking-widest">¡ALTO AHÍ!</h1>
        <p className="text-2xl text-rose-200 mb-8 max-w-2xl font-bold">
          El sistema ha detectado que has abandonado la ventana del examen.
        </p>
        
        {cheatCount < 3 ? (
          <div className="bg-rose-900/50 border-2 border-rose-500 p-6 rounded-2xl mb-8">
             <p className="text-white text-xl font-medium">Esta es la advertencia #{cheatCount}.</p>
             <p className="text-rose-300 font-bold mt-2">A la 3ra advertencia, tus respuestas valdrán 0 XP.</p>
          </div>
        ) : (
          <div className="bg-black/50 border-2 border-rose-600 p-6 rounded-2xl mb-8">
             <p className="text-rose-500 text-2xl font-black uppercase">¡HAS SIDO PENALIZADO!</p>
             <p className="text-rose-300 font-bold mt-2">Tus respuestas en esta pregunta no sumarán XP a tu facción por conducta antideportiva.</p>
          </div>
        )}

        <button 
          onClick={() => setShowCheatWarning(false)}
          className="bg-white hover:bg-rose-100 text-rose-900 font-black text-xl py-4 px-12 rounded-full uppercase tracking-widest shadow-2xl transition-all"
        >
          Entendido, volver a la guerra
        </button>
      </div>
    );
  }

  if (!isJoined) {
    if (gameState && !gameState.isRegistered) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-slate-950">
          <div className="bg-slate-900 border-2 border-red-500/30 p-8 rounded-3xl max-w-md shadow-2xl flex flex-col items-center">
            <Shield className="w-20 h-20 text-rose-500 mb-6 animate-pulse" />
            <h1 className="text-3xl font-black text-white mb-4">Acceso Denegado</h1>
            <p className="text-slate-400 mb-8 font-medium">
              No estás inscrito en este torneo. Los alumnos deben inscribirse hasta 5 minutos antes del inicio de la guerra para poder participar.
            </p>
            <button 
              onClick={() => router.push("/factions")}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-700 font-bold py-3 px-8 rounded-full transition-all"
            >
              Volver a Facciones
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Shield className="w-24 h-24 text-indigo-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-black text-white mb-4">La Gran Guerra de Universidades</h1>
        <p className="text-slate-400 max-w-md mb-8">
          Bienvenido {currentUser.firstName}. Estás representando a {currentUser.faction?.name}. 
          La puntualidad y la velocidad dictarán tu victoria.
        </p>
        <button 
          onClick={handleJoin}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl py-4 px-12 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:scale-105 transition-all"
        >
          Unirse al Pelotón
        </button>
      </div>
    );
  }

  if (gameState.phase === "WAITING") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-3xl font-black text-slate-300 mb-8 uppercase tracking-widest">El Despliegue Comienza En:</h2>
        <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-600 font-mono drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
          {Math.floor(gameState.timeRemaining / 60).toString().padStart(2, '0')}:{(gameState.timeRemaining % 60).toString().padStart(2, '0')}
        </div>
        <p className="text-slate-500 mt-8 animate-pulse text-lg">Preparando munición académica...</p>
      </div>
    );
  }

  // Determinamos si el usuario actual sigue en fase de preguntas localmente
  const isQuestionPhase = gameState.phase === "QUESTION" && localQuestionIndex < gameState.totalQuestions;

  if (isQuestionPhase) {
    const currentQuestion = gameState.questions[localQuestionIndex];
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 w-full max-w-4xl mx-auto">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="text-indigo-400 font-bold uppercase tracking-widest">
            Pregunta {localQuestionIndex + 1} de {gameState.totalQuestions}
          </div>
          <div className="text-slate-400 font-bold">
            {Math.round((localQuestionIndex / gameState.totalQuestions) * 100)}% Completado
          </div>
        </div>
        <div className="w-full bg-slate-800 h-3 rounded-full mb-6 overflow-hidden">
          <div 
            className="bg-indigo-500 h-full transition-all duration-300" 
            style={{ width: `${(localQuestionIndex / gameState.totalQuestions) * 100}%` }}
          />
        </div>

        <div className="w-full flex items-center justify-between bg-slate-800 rounded-2xl p-4 mb-6 shadow-xl border-b-4 border-slate-900">
           <div className="flex items-center gap-2 text-indigo-400 font-bold">
             <Clock className="w-6 h-6" /> Tiempo Restante Global
           </div>
           <div className="text-3xl font-mono font-black text-white">
             {Math.floor(gameState.timeRemaining / 60).toString().padStart(2, '0')}:{(gameState.timeRemaining % 60).toString().padStart(2, '0')}
           </div>
        </div>

        <div className="w-full bg-white rounded-3xl p-8 mb-6 shadow-2xl">
          <p className="text-slate-600 text-lg leading-relaxed mb-6 border-l-4 border-indigo-500 pl-4 italic">
            {currentQuestion?.readingText}
          </p>
          <h2 className="text-2xl font-black text-slate-800 mb-8">
            {currentQuestion?.questionText}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion?.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={hasAnswered}
                className={`p-6 rounded-2xl text-lg font-bold border-b-4 transition-all text-left ${
                  hasAnswered ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 hover:border-indigo-300 hover:-translate-y-1'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // FASES SUMMARY (Esperando) o FINISHED (Publicado)
  if (gameState.phase === "SUMMARY" || gameState.phase === "FINISHED") {
    const userIndex = leaderboard.findIndex(p => p.userId === currentUser.id);
    const userRank = userIndex !== -1 ? userIndex + 1 : "---";
    const userScore = userIndex !== -1 ? leaderboard[userIndex].score : 0;
    const isPublished = gameState.phase === "FINISHED";

    return (
      <div className="flex flex-col min-h-screen p-4 w-full max-w-4xl mx-auto pt-12">
        
        {!isPublished ? (
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-8 text-center mb-12 shadow-[0_0_40px_rgba(79,70,229,0.2)]">
            <Shield className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-pulse" />
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Examen Finalizado</h1>
            <p className="text-indigo-200 font-medium text-lg max-w-2xl mx-auto">
              Tus respuestas han sido aseguradas. El Alto Mando está esperando que todos los demás reclutas terminen para publicar el Leaderboard Global. ¡Revisa tu desempeño abajo mientras tanto!
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 text-center mb-12 shadow-[0_0_40px_rgba(245,158,11,0.3)] text-white">
            <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
            <h1 className="text-3xl font-black mb-2 uppercase tracking-widest">Resultados Publicados</h1>
            <p className="font-bold text-lg">
              La guerra ha concluido oficialmente. Tu puntaje final fue de {userScore} XP. 
            </p>
          </div>
        )}

        {/* Resumen de Desempeño Personal */}
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" /> Tu Resumen Personal
        </h2>
        <div className="space-y-4 mb-12">
          {gameState.fullQuestionsForSummary?.map((q: any, index: number) => {
            const userAnswer = gameState.userAnswers.find((a: any) => a.questionId === q.id);
            const isCorrect = userAnswer?.selectedIndex === q.correctIndex;
            const hasCheated = userAnswer?.cheatCount >= 3;
            
            return (
              <div key={q.id} className={`bg-slate-800 rounded-2xl p-6 border-l-4 ${isCorrect ? 'border-emerald-500' : 'border-rose-500'}`}>
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Pregunta {index + 1}</span>
                  <div className="flex items-center gap-2">
                    {hasCheated && <span className="bg-rose-950 text-rose-500 text-xs font-bold px-2 py-1 rounded border border-rose-500/50">Trampa Detectada (0 XP)</span>}
                    {isCorrect ? (
                      <span className="bg-emerald-950/50 text-emerald-400 font-black text-sm px-3 py-1 rounded-full border border-emerald-500/30">
                        + {userAnswer?.pointsEarned || 0} XP
                      </span>
                    ) : (
                      <span className="bg-rose-950/50 text-rose-400 font-black text-sm px-3 py-1 rounded-full border border-rose-500/30">
                        Fallaste
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-white font-medium text-lg mb-4">{q.questionText}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-500 block mb-1 font-bold text-xs uppercase">Tu Respuesta:</span>
                    <span className={isCorrect ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {userAnswer !== undefined ? q.options[userAnswer.selectedIndex] : "No respondiste"}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/50">
                      <span className="text-emerald-500/70 block mb-1 font-bold text-xs uppercase">Respuesta Correcta:</span>
                      <span className="text-emerald-400 font-bold">
                        {q.options[q.correctIndex]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard Global (Solo visible si isPublished) */}
        {isPublished && (
          <>
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2 mt-8">
              <Trophy className="w-6 h-6 text-yellow-500" /> Clasificación Global
            </h2>
            <div className="w-full bg-slate-800 rounded-3xl p-6 mb-24 shadow-2xl border-2 border-slate-700">
               {leaderboard.map((p: any, index: number) => (
                 <div key={p.id} className={`flex items-center justify-between p-4 mb-2 rounded-xl border-b-2 border-slate-900 ${p.userId === currentUser.id ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                   <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black ${index === 0 ? 'bg-yellow-400 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : index === 1 ? 'bg-slate-300 text-slate-800' : index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                       {index + 1}
                     </div>
                     {p.userImage && <Image src={p.userImage} alt="Avatar" width={40} height={40} className="rounded-full border-2 border-slate-500 shrink-0" />}
                     <div className="font-bold text-white">
                       {p.userName}
                       <span className="ml-2 text-xs px-2 py-1 bg-slate-800/50 rounded-full opacity-90 border border-slate-600">
                         {p.factionName}
                       </span>
                     </div>
                   </div>
                   <div className="font-black text-emerald-400">
                     {p.score} XP
                   </div>
                 </div>
               ))}
               {leaderboard.length === 0 && <div className="text-slate-500 text-center py-8">Nadie ha anotado puntos aún.</div>}
            </div>

            {/* Fixed Bottom Rank Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t-4 border-indigo-500 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                   {currentUser.imageUrl && <Image src={currentUser.imageUrl} alt="Avatar" width={48} height={48} className="rounded-full border-2 border-indigo-400" />}
                   <div>
                     <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Tu Posición Final</p>
                     <p className="text-2xl font-black text-white">#{userRank}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Tu Contribución</p>
                   <p className="text-2xl font-black text-emerald-400">+{userScore} XP</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};
