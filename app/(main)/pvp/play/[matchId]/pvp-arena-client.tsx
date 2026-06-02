"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMatchState, proposeWager, acceptWager, submitPvPAnswer } from "@/actions/pvp-actions";
import { Loader2, Swords, MessageCircle, Clock, Trophy } from "lucide-react";
import { Challenge } from "@/app/lesson/challenge";
import { toast } from "sonner";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

export const PvpArenaClient = ({ initialMatch, currentUserId, p1Name, p2Name }: any) => {
  const [match, setMatch] = useState(initialMatch);
  const [timeLeft, setTimeLeft] = useState("");
  const [proposedWager, setProposedWager] = useState(10);

  const router = useRouter();
  const { width, height } = useWindowSize();
  const isP1 = currentUserId === match.player1Id;

  useEffect(() => {
    if (match.status === "FINISHED") return;

    const fetchMatch = async () => {
      const res = await getMatchState(match.id);
      if (res?.match) setMatch(res.match);
      if (res?.error) {
         toast.error(res.error);
         router.push("/pvp");
      }
    };

    if (process.env.NEXT_PUBLIC_PUSHER_KEY) {
      import("@/lib/pusher-client").then(({ pusherClient }) => {
        if (!pusherClient) return;
        const channel = pusherClient.subscribe(`match-${match.id}`);
        channel.bind("match-updated", fetchMatch);
      });

      return () => {
        import("@/lib/pusher-client").then(({ pusherClient }) => {
          if (pusherClient) pusherClient.unsubscribe(`match-${match.id}`);
        });
      };
    } else {
      const interval = setInterval(fetchMatch, 2500);
      return () => clearInterval(interval);
    }
  }, [match.id, match.status, router]);

  useEffect(() => {
    if (match.status !== "NEGOTIATING") return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(match.createdAt).getTime();
      const remaining = Math.max(0, 10 * 60 * 1000 - elapsed);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [match.status, match.createdAt]);

  const handleProposeWager = async () => {
    await proposeWager(match.id, proposedWager);
  };

  const handleAcceptWager = async () => {
    await acceptWager(match.id);
    toast.success("¡Apuesta aceptada! La batalla comienza.");
  };

  const onSelectOption = async (optionId: number) => {
    if (match.currentTurnId !== currentUserId) return;
    const qIndex = match.currentQuestionIndex;
    const questions = match.questions as any[];
    const answerIndex = (questions[qIndex].challengeOptions || questions[qIndex].options).findIndex((o:any) => o.id === optionId);
    
    const res = await submitPvPAnswer(match.id, answerIndex);
    if (res?.error) toast.error(res.error);
    else if (res?.isCorrect) toast.success("¡Combo! Mantienes el turno.");
    else toast.error("¡Fallaste! El turno pasa al rival.");
  };


  if (match.status === "NEGOTIATING" || !match.player2Id) {
    return (
      <div className="flex flex-col items-center mt-10 w-full max-w-4xl px-4">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 font-cinzel text-center flex items-center justify-center gap-4 mb-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
          <Clock className="w-8 h-8 text-yellow-500 animate-pulse" /> {timeLeft}
        </h1>
        <p className="text-slate-400 mt-2 mb-8 text-center text-lg">
          Código de Sala: <span className="font-mono text-white font-bold bg-slate-800 px-4 py-2 rounded-xl text-xl ml-2">{match.code}</span>
        </p>

        {!match.player2Id ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-3xl w-full">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Esperando al rival...</h2>
            <p className="text-slate-500">Mándale el código por WhatsApp y destrózalo en el examen.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-4">
            {/* Player 1 Card */}
            <div className={`p-8 rounded-3xl border-4 ${isP1 ? "border-blue-500 bg-blue-950/40 shadow-[0_0_60px_rgba(59,130,246,0.6)] hover:scale-[1.02]" : "border-slate-800 bg-slate-900 shadow-none"} relative transition-all duration-500`}>
              <h2 className="text-2xl font-black text-white text-center mb-6 uppercase tracking-widest">{p1Name}</h2>
              {match.p1WagerProposal !== null && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black font-black px-6 py-3 rounded-full flex items-center gap-2 shadow-xl animate-bounce whitespace-nowrap z-10 border-4 border-slate-950">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  Propone: {match.p1WagerProposal} pts
                </div>
              )}
              {isP1 && (
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 bg-slate-950 rounded-xl p-2 border border-blue-500/30">
                    <Trophy className="w-6 h-6 text-yellow-500 ml-2" />
                    <input type="number" min={0} value={proposedWager} onChange={e => setProposedWager(parseInt(e.target.value))} className="w-full bg-transparent text-white font-black text-2xl text-center focus:outline-none" />
                  </div>
                  <button onClick={handleProposeWager} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all">Proponer Apuesta</button>
                  {match.p2WagerProposal !== null && !match.p1Ready && (
                     <button onClick={handleAcceptWager} className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-xl mt-2 animate-pulse shadow-lg active:scale-95 transition-all">Aceptar {match.p2WagerProposal} pts del Rival</button>
                  )}
                </div>
              )}
              {match.p1Ready && <div className="mt-8 bg-green-500/20 text-green-400 border border-green-500/50 font-black text-center py-4 rounded-xl uppercase tracking-widest">¡LISTO PARA PELEAR!</div>}
            </div>

            {/* Player 2 Card */}
            <div className={`p-8 rounded-3xl border-4 ${!isP1 ? "border-red-500 bg-red-950/40 shadow-[0_0_60px_rgba(239,68,68,0.6)] hover:scale-[1.02]" : "border-slate-800 bg-slate-900 shadow-none"} relative transition-all duration-500`}>
              <h2 className="text-2xl font-black text-white text-center mb-6 uppercase tracking-widest">{p2Name}</h2>
              {match.p2WagerProposal !== null && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black font-black px-6 py-3 rounded-full flex items-center gap-2 shadow-xl animate-bounce whitespace-nowrap z-10 border-4 border-slate-950">
                  <MessageCircle className="w-5 h-5 text-red-500" />
                  Propone: {match.p2WagerProposal} pts
                </div>
              )}
              {!isP1 && (
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 bg-slate-950 rounded-xl p-2 border border-red-500/30">
                    <Trophy className="w-6 h-6 text-yellow-500 ml-2" />
                    <input type="number" min={0} value={proposedWager} onChange={e => setProposedWager(parseInt(e.target.value))} className="w-full bg-transparent text-white font-black text-2xl text-center focus:outline-none" />
                  </div>
                  <button onClick={handleProposeWager} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all">Proponer Apuesta</button>
                  {match.p1WagerProposal !== null && !match.p2Ready && (
                     <button onClick={handleAcceptWager} className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-xl mt-2 animate-pulse shadow-lg active:scale-95 transition-all">Aceptar {match.p1WagerProposal} pts del Rival</button>
                  )}
                </div>
              )}
              {match.p2Ready && <div className="mt-8 bg-green-500/20 text-green-400 border border-green-500/50 font-black text-center py-4 rounded-xl uppercase tracking-widest">¡LISTO PARA PELEAR!</div>}
            </div>
          </div>
        )}
      </div>
    );
  }

  const questions = match.questions as any[];
  const isFinished = match.status === "FINISHED" || match.currentQuestionIndex >= questions.length;
  const isMyTurn = match.currentTurnId === currentUserId;

  if (isFinished) {
     const p1Won = match.player1Score > match.player2Score;
     const p2Won = match.player2Score > match.player1Score;
     const iWon = (isP1 && p1Won) || (!isP1 && p2Won);
     const isDraw = match.player1Score === match.player2Score;

     return (
       <div className="flex flex-col items-center justify-center w-full min-h-[70vh]">
         {iWon && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
         
         <div className={`p-10 rounded-3xl border-4 ${iWon ? "border-yellow-500 bg-yellow-950/20 shadow-[0_0_100px_rgba(234,179,8,0.2)]" : isDraw ? "border-slate-500 bg-slate-900" : "border-red-500 bg-red-950/20 shadow-[0_0_100px_rgba(239,68,68,0.2)]"} flex flex-col items-center max-w-2xl w-full`}>
           <Trophy className={`w-32 h-32 mb-8 ${iWon ? "text-yellow-400 animate-bounce" : isDraw ? "text-slate-400" : "text-red-500"}`} />
           <h1 className="text-5xl md:text-7xl font-black text-white mb-4 font-cinzel text-center">
             {iWon ? "¡VICTORIA!" : isDraw ? "EMPATE" : "DERROTA"}
           </h1>
           <p className="text-2xl text-slate-400 mb-10 text-center font-bold">
             {iWon ? `Has robado ${match.wagerPoints} puntos` : isDraw ? "Nadie pierde puntos" : `Has perdido ${match.wagerPoints} puntos`}
           </p>
           
           <div className="flex items-center justify-between w-full bg-slate-950/50 rounded-2xl p-6 border border-slate-800">
             <div className="flex flex-col items-center w-1/3">
               <span className="text-blue-400 font-black text-xl truncate w-full text-center mb-2 uppercase">{p1Name}</span>
               <span className={`text-5xl font-black ${p1Won ? "text-yellow-400" : "text-white"}`}>{match.player1Score}</span>
             </div>
             <div className="text-4xl font-black text-slate-600 w-1/3 text-center">VS</div>
             <div className="flex flex-col items-center w-1/3">
               <span className="text-red-400 font-black text-xl truncate w-full text-center mb-2 uppercase">{p2Name}</span>
               <span className={`text-5xl font-black ${p2Won ? "text-yellow-400" : "text-white"}`}>{match.player2Score}</span>
             </div>
           </div>
           
           <button onClick={() => router.push("/pvp")} className="mt-10 px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest w-full shadow-xl">
             Volver al Lobby
           </button>
         </div>
       </div>
     );
  }

  const currentQ = questions[match.currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl flex flex-col items-center mt-6 px-4">
      {/* HUD Header */}
      <div className="w-full bg-card border-2 border-border rounded-3xl p-6 flex justify-between items-center mb-8 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1/2 h-1 bg-blue-500"></div>
         <div className="absolute top-0 right-0 w-1/2 h-1 bg-red-500"></div>
         
         <div className="flex flex-col items-center w-[30%]">
           <span className="text-blue-400 font-black text-sm md:text-lg truncate w-full text-center uppercase tracking-wider mb-2">
             {p1Name} {isP1 ? "(Tú)" : "(Rival)"}
           </span>
           <span className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-widest">{isP1 ? "Tus Puntos" : "Puntos del Rival"}</span>
           <span className="text-4xl md:text-5xl font-black text-white bg-slate-950 px-6 py-2 rounded-xl border border-blue-500/20">{match.player1Score}</span>
         </div>
         <div className="flex flex-col items-center w-[40%] border-x border-slate-700/50 px-2 md:px-6">
           <span className="text-slate-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-2 text-center">Apuesta en Juego</span>
           <span className="text-2xl md:text-3xl font-black text-yellow-400 flex items-center gap-2"><Trophy className="w-5 h-5 md:w-6 md:h-6"/> {match.wagerPoints}</span>
           <div className="mt-4 bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800">
             <span className="text-slate-400 font-bold text-xs md:text-sm">Pregunta {match.currentQuestionIndex + 1} de {questions.length}</span>
           </div>
         </div>
         <div className="flex flex-col items-center w-[30%]">
           <span className="text-red-400 font-black text-sm md:text-lg truncate w-full text-center uppercase tracking-wider mb-2">
             {p2Name} {!isP1 ? "(Tú)" : "(Rival)"}
           </span>
           <span className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-widest">{!isP1 ? "Tus Puntos" : "Puntos del Rival"}</span>
           <span className="text-4xl md:text-5xl font-black text-white bg-slate-950 px-6 py-2 rounded-xl border border-red-500/20">{match.player2Score}</span>
         </div>
      </div>

      {/* Turn Indicator */}
      <div className={`w-full py-4 text-center font-black uppercase tracking-[0.2em] rounded-2xl mb-12 transition-all duration-500 ${isMyTurn ? "bg-green-500 text-white shadow-[0_0_50px_rgba(34,197,94,0.4)] animate-bounce text-xl" : "bg-slate-800 text-slate-400 border border-slate-700 text-lg opacity-80"}`}>
        {isMyTurn ? (
          <span className="flex items-center justify-center gap-3"><Swords className="w-6 h-6" /> ¡TU TURNO! (COMBO ACTIVO)</span>
        ) : (
          <span className="flex items-center justify-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /> EL RIVAL ESTÁ ATACANDO...</span>
        )}
      </div>

      {/* Arena Content */}
      <div className="w-full flex flex-col items-center">
        {currentQ.referenceText && (
          <div className="w-full max-w-4xl bg-slate-800/80 p-6 md:p-8 rounded-3xl border-2 border-slate-700 mb-8 text-lg md:text-xl text-slate-200 leading-relaxed text-justify shadow-xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
             <div className="whitespace-pre-wrap">
               {currentQ.referenceText}
             </div>
          </div>
        )}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-neutral-100 mb-10 text-center leading-tight max-w-4xl">
          {currentQ.question}
        </h1>
        <div className={`w-full bg-card border-2 border-border p-6 rounded-3xl shadow-xl relative z-20 transition-all duration-700 ${!isMyTurn ? "opacity-30 blur-[3px] pointer-events-none scale-[0.98] grayscale" : ""}`}>
          <Challenge 
            options={currentQ.challengeOptions || currentQ.options} 
            onSelect={onSelectOption} 
            status="none"
            selectedOption={undefined}
            disabled={!isMyTurn}
            type="SELECT"
          />
        </div>
      </div>
    </div>
  );
}
