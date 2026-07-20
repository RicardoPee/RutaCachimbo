"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Swords, KeyRound, Flame, Trophy, Zap, ShieldAlert, Sparkles, Users, Award } from "lucide-react";
import { createPvPLobby, joinPvPLobby } from "@/actions/pvp-actions";

export const PvpLobbyClient = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    setIsCreating(true);
    const res = await createPvPLobby("ia-dynamic");
    if (res?.error) {
      toast.error(res.error);
      setIsCreating(false);
    } else if (res?.matchId) {
      toast.success(`¡Sala Creada! Código: ${res.code}`);
      router.push(`/pvp/play/${res.matchId}`);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setIsJoining(true);
    const res = await joinPvPLobby(code.toUpperCase());
    if (res?.error) {
      toast.error(res.error);
      setIsJoining(false);
    } else if (res?.matchId) {
      toast.success("¡Te uniste a la batalla!");
      router.push(`/pvp/play/${res.matchId}`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in-50 duration-500">
      
      {/* Hero Header Banner */}
      <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-red-900 border-2 border-red-500/30 p-8 lg:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" /> ARENA EN VIVO • DUELOS 1v1 EN TIEMPO REAL
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md flex items-center justify-center md:justify-start gap-3">
              ARENA PvP <Swords className="w-9 h-9 text-amber-400 animate-bounce" />
            </h1>
            <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
              Desafía a tus compañeros en duelo directo. Demuestra tus destrezas académicas, mantén tu racha de combos y gana los puntos apostados.
            </p>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-slate-950/60 border border-red-500/30 rounded-2xl p-4 md:p-5 flex flex-col gap-3 shrink-0 shadow-xl w-full md:w-auto">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400"><Zap className="w-5 h-5" /></div>
              <div>
                <p className="text-slate-400">Regla de Combo</p>
                <p className="text-white font-extrabold text-sm">Respuesta Correcta = Mantienes Turno</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-300 border-t border-slate-800 pt-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400"><Trophy className="w-5 h-5" /></div>
              <div>
                <p className="text-slate-400">Apuesta de Puntos</p>
                <p className="text-white font-extrabold text-sm">El Ganador se lleva el Botín XP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Create Room */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/50 p-6 lg:p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:border-red-500/60 transition-all duration-300 group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flame className="w-32 h-32 text-red-500" />
          </div>
          
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-black mb-4 group-hover:scale-110 transition-transform">
              <Swords className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Crear Nueva Batalla</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
              Genera un código de acceso único. Tú serás el Anfitrión y elegirás la propuesta de apuesta inicial.
            </p>
          </div>

          <button
            onClick={handleCreate}
            disabled={isCreating || isJoining}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-2xl uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 active:scale-98 transition-all disabled:opacity-50 text-sm"
          >
            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flame className="w-5 h-5" />}
            Crear Sala de Duelo
          </button>
        </div>

        {/* Join Room */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900/50 p-6 lg:p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:border-blue-500/60 transition-all duration-300 group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <KeyRound className="w-32 h-32 text-blue-500" />
          </div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black mb-4 group-hover:scale-110 transition-transform">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Unirse con Código</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
              ¿Un amigo te dio un código de 6 caracteres? Ingrésalo aquí para unirte a su sala de combate.
            </p>
          </div>

          <form onSubmit={handleJoin} className="w-full flex flex-col gap-3">
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO (EJ. X7Z2AB)"
                maxLength={6}
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-center font-black text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none transition-colors uppercase tracking-widest text-base shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isJoining || isCreating || code.length < 3}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50 text-sm"
            >
              {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar a la Batalla"}
            </button>
          </form>
        </div>
      </div>

      {/* Rules & Tips Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-4">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 font-bold shrink-0"><Sparkles className="w-6 h-6" /></div>
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Preguntas DECO</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Evaluación de razonamiento verbal y matemático de nivel universitario.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 font-bold shrink-0"><ShieldAlert className="w-6 h-6" /></div>
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Cambio de Turno</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Si fallas una pregunta, el turno pasa inmediatamente a tu oponente.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold shrink-0"><Award className="w-6 h-6" /></div>
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Subida en Ranking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gana duelos para escalar a las ligas Diamante y Leyenda Cachimbo.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
