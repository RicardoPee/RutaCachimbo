"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trophy, Clock, Users, Shield, Loader2 } from "lucide-react";
import { joinFaction } from "@/actions/faction-actions";
import { registerForTournament } from "@/actions/tournament-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PublishButton } from "@/app/(main)/admin/wars/[id]/publish-button";

// Sub-componente para manejar el timer y la inscripción independiente de cada torneo
const TournamentCard = ({ 
  tournament, 
  currentUser, 
  router, 
  isRegisteredInitial 
}: { 
  tournament: any; 
  currentUser: any; 
  router: any; 
  isRegisteredInitial: boolean; 
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isRegistered, setIsRegistered] = useState(isRegisteredInitial);
  const [registering, setRegistering] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Sincronizar el estado inicial si cambia desde las props
  useEffect(() => {
    setIsRegistered(isRegisteredInitial);
  }, [isRegisteredInitial]);

  useEffect(() => {
    // Check immediately on mount to avoid initial layout flash
    const nowInitial = new Date();
    setCurrentTime(nowInitial);
    
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const targetDate = new Date(tournament.startTime);
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("En curso");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${days > 0 ? days + 'd ' : ''}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [tournament]);

  const handleRegister = async () => {
    if (registering) return;
    setRegistering(true);
    const toastId = toast.loading("Inscribiéndose en la guerra...");
    
    const res = await registerForTournament(tournament.id);
    setRegistering(false);
    
    if (res?.error) {
      toast.error(res.error, { id: toastId });
    } else {
      setIsRegistered(true);
      toast.success("¡Te has inscrito con éxito!", { id: toastId });
      router.refresh();
    }
  };

  const startTime = new Date(tournament.startTime);
  const registrationDeadline = new Date(startTime.getTime() - 5 * 60 * 1000);
  const canRegister = currentTime < registrationDeadline;
  const isActive = tournament.status === 'ACTIVE' || currentTime >= startTime;

  return (
    <div className={`border-2 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm transition-all hover:shadow-md ${isActive ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-500/50' : 'bg-muted border-slate-300 dark:border-slate-700'}`}>
      <div className="flex-1 w-full text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
          <Shield className={`w-5 h-5 ${isActive ? 'text-amber-600 animate-bounce' : 'text-slate-400'}`} />
          <h3 className={`text-xl font-black uppercase tracking-widest ${isActive ? 'text-amber-800 dark:text-amber-300' : 'text-foreground'}`}>
            {tournament.title}
          </h3>
        </div>
        <p className={`text-sm mb-4 font-bold ${isActive ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>
          {isActive ? "[ALERTA] LA GUERRA ESTÁ ACTIVA AHORA." : `[STATUS] ESPERANDO DESPLIEGUE.`}
        </p>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          {isActive ? (
            isRegistered ? (
              <button 
                onClick={() => router.push(`/factions/play?tournamentId=${tournament.id}`)} 
                className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white font-black py-3 px-8 rounded-full animate-pulse shadow-lg flex items-center justify-center gap-2"
              >
                🔥 ENTRAR AL CAMPO
              </button>
            ) : (
              <button 
                disabled 
                className="w-full md:w-auto bg-slate-300 dark:bg-slate-700 text-muted-foreground font-black py-3 px-8 rounded-full cursor-not-allowed flex items-center justify-center gap-2"
              >
                🔒 NO INSCRITO
              </button>
            )
          ) : (
            isRegistered ? (
              <button 
                disabled 
                className="w-full md:w-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-2 border-emerald-500/30 font-black py-3 px-8 rounded-full cursor-not-allowed flex items-center justify-center gap-2"
              >
                ✓ INSCRITO - ESPERANDO
              </button>
            ) : canRegister ? (
              <button 
                onClick={handleRegister} 
                disabled={registering}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-8 rounded-full shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                {registering ? <Loader2 className="w-5 h-5 animate-spin" /> : "📝 INSCRIBIRSE"}
              </button>
            ) : (
              <button 
                disabled 
                className="w-full md:w-auto bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-2 border-rose-500/30 font-black py-3 px-8 rounded-full cursor-not-allowed flex items-center justify-center gap-2"
              >
                🔒 INSCRIPCIÓN CERRADA
              </button>
            )
          )}
          
          {currentUser.isAdmin && (
            <PublishButton tournamentId={tournament.id} />
          )}

          <div className="flex flex-col items-center md:items-start text-left mt-4 md:mt-0">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Inicio Programado</span>
            <span className={`text-2xl font-mono font-black tracking-tight ${isActive ? 'text-amber-600' : 'text-muted-foreground'}`}>
              {timeLeft || "Cargando..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FactionsClient = ({ 
  currentUser, 
  factions, 
  nextTournaments = [], 
  pastTournaments = [],
  registeredTournamentIds = [] 
}: any) => {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleJoin = async (factionId: number) => {
    if (pending) return;
    setPending(true);
    const res = await joinFaction(factionId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("¡Te has unido a la facción con éxito!");
      router.refresh();
    }
    setPending(false);
  };

  return (
    <div className="w-full max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden mb-12">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <Shield className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 drop-shadow-md">
            Guerra de Universidades
          </h1>
          <p className="text-indigo-200 text-lg md:text-xl font-medium max-w-2xl">
            Toda la experiencia (XP) que ganes sumará a tu Facción. El ganador a fin de mes recibirá recompensas míticas.
          </p>
        </div>
      </div>

      {/* Leaderboard or Join Section */}
      {!currentUser.factionId && !currentUser.isAdmin ? (
        <div className="mb-12">
          <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" /> Elige tu Bandera
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {factions.map((faction: any) => (
              <div key={faction.id} className="bg-card rounded-3xl p-6 border-2 border-border hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:-translate-y-2 hover:shadow-xl group flex flex-col">
                <div className="flex-1">
                   <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4 text-4xl shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform">
                     <span className="z-10 relative">🎓</span>
                   </div>
                   <h3 className="text-xl font-black text-center text-slate-800 dark:text-slate-100 mb-2">{faction.name}</h3>
                   <p className="text-sm text-center text-muted-foreground mb-4">{faction.description}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4 font-bold">
                  <Users className="w-4 h-4" /> {faction._count.members} Reclutas
                </div>
                <button 
                  onClick={() => handleJoin(faction.id)}
                  disabled={pending}
                  className="w-full py-3 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-colors flex items-center justify-center"
                >
                  {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Unirse"}
                </button>
              </div>
            ))}
            {factions.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 font-medium">
                Las facciones aún no han sido fundadas por los administradores.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-12 flex flex-col gap-6">
           <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm mb-4">
             <h3 className="text-lg font-bold text-foreground mb-1">
               {currentUser.isAdmin ? (
                 <span className="text-indigo-600 dark:text-indigo-400 font-black">Modo Alto Mando Activo</span>
               ) : (
                 <>Has jurado lealtad a: <span className="font-black text-indigo-600 dark:text-indigo-400">{currentUser.faction?.name}</span></>
               )}
             </h3>
             <p className="text-muted-foreground text-sm">
               {currentUser.isAdmin ? "Supervisando el estatus de todas las banderas y guerras." : "Escoge a qué campo de batalla deseas desplegarte."}
             </p>
           </div>

           <div className="flex flex-col gap-4">
             {nextTournaments.length > 0 ? (
               nextTournaments.map((tournament: any) => (
                 <TournamentCard 
                   key={tournament.id} 
                   tournament={tournament} 
                   currentUser={currentUser} 
                   router={router} 
                   isRegisteredInitial={registeredTournamentIds.includes(tournament.id)}
                 />
               ))
             ) : (
               <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center">
                 <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                 <h3 className="text-xl font-bold text-muted-foreground mb-2">No hay Guerras Programadas</h3>
                 <p className="text-muted-foreground">Reúne XP para tu facción completando lecciones en la academia hasta que el Alto Mando anuncie un nuevo torneo.</p>
               </div>
             )}
           </div>

           <h2 className="text-2xl font-black text-foreground mt-8 mb-2 flex items-center gap-2">
             <Trophy className="w-6 h-6 text-yellow-500" /> Clasificación Global
           </h2>
           <div className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-sm">
             <div className="bg-muted p-4 border-b-2 border-slate-200 dark:border-slate-700 flex font-black text-muted-foreground text-sm uppercase tracking-widest">
               <div className="w-16 text-center">Rango</div>
               <div className="flex-1">Facción</div>
               <div className="w-24 text-center">Reclutas</div>
               <div className="w-32 text-right">XP Total</div>
             </div>
             {factions.map((faction: any, index: number) => {
               const isMyFaction = faction.id === currentUser.factionId;
               return (
                 <div key={faction.id} className={`flex items-center p-4 border-b border-slate-100 dark:border-border transition-colors ${isMyFaction ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                   <div className="w-16 flex justify-center">
                     {index === 0 ? <Trophy className="w-6 h-6 text-yellow-500" /> : 
                      index === 1 ? <Trophy className="w-6 h-6 text-slate-400" /> : 
                      index === 2 ? <Trophy className="w-6 h-6 text-amber-700" /> : 
                      <span className="font-bold text-slate-400">{index + 1}</span>}
                   </div>
                   <div className={`flex-1 font-bold ${isMyFaction ? 'text-indigo-600 dark:text-indigo-400' : 'text-foreground'} flex items-center gap-2`}>
                      <span className="text-xl">🎓</span>
                      {faction.name}
                   </div>
                   <div className="w-24 text-center font-bold text-slate-500 flex items-center justify-center gap-1">
                     <Users className="w-4 h-4" /> {faction._count?.members || 0}
                   </div>
                   <div className="w-32 text-right font-black text-emerald-500">
                     {faction.totalXp.toLocaleString()} XP
                   </div>
                 </div>
               );
             })}
           </div>

           {pastTournaments.length > 0 && (
             <div className="mt-12">
               <h2 className="text-2xl font-black text-foreground mb-4 flex items-center gap-2">
                 <Shield className="w-6 h-6 text-slate-400" /> Guerras Pasadas
               </h2>
               <div className="space-y-4">
                 {pastTournaments.map((t: any) => (
                   <div key={t.id} className="bg-card rounded-2xl border-2 border-border p-6 flex flex-col md:flex-row items-center justify-between shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                     <div>
                       <h3 className="text-lg font-black uppercase text-slate-700 dark:text-slate-300">{t.title}</h3>
                       <p className="text-sm font-bold text-slate-500">Finalizado el: {new Date(t.startTime).toLocaleDateString()}</p>
                     </div>
                      <div className="mt-4 md:mt-0">
                        <button 
                          onClick={() => router.push(`/factions/play?tournamentId=${t.id}`)}
                          className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold py-2 px-6 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                        >
                          Ver Resultados
                        </button>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
