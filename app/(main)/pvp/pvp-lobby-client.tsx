"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Swords, KeyRound } from "lucide-react";
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
      toast.success(`Sala Creada! Código: ${res.code}`);
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
    <div className="flex flex-col items-center w-full mt-10">
      <div className="bg-red-500/10 p-4 rounded-full mb-6 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
        <Swords className="w-16 h-16 text-red-500" />
      </div>
      <h1 className="text-3xl md:text-5xl font-black text-neutral-200 mb-2 font-cinzel text-center">
        ARENA PvP
      </h1>
      <p className="text-neutral-500 text-center mb-12 max-w-md text-lg">
        Desafía a tus amigos en tiempo real. Demuestra quién tiene mejor racha y roba sus puntos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        {/* Create Room */}
        <div className="bg-card border-2 border-border rounded-2xl p-6 flex flex-col items-center hover:border-red-500/50 transition-all shadow-xl group">
          <h2 className="text-xl font-bold text-white mb-4">Crear Batalla</h2>
          <p className="text-sm text-slate-400 text-center mb-6">
            Genera un código de invitación único y conviértete en el Anfitrión.
          </p>
          <button
            onClick={handleCreate}
            disabled={isCreating || isJoining}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
            Crear Sala
          </button>
        </div>

        {/* Join Room */}
        <div className="bg-card border-2 border-border rounded-2xl p-6 flex flex-col items-center hover:border-blue-500/50 transition-all shadow-xl group">
          <h2 className="text-xl font-bold text-white mb-4">Unirse a Batalla</h2>
          <p className="text-sm text-slate-400 text-center mb-6">
            ¿Tienes un código? Introdúcelo aquí para entrar a la arena de tu rival.
          </p>
          <form onSubmit={handleJoin} className="w-full flex flex-col gap-3">
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO EJ. X7Z2"
                maxLength={6}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl py-3 pl-10 pr-4 text-center font-bold text-white focus:border-blue-500 focus:outline-none transition-colors uppercase tracking-widest text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={isJoining || isCreating || code.length < 3}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar a la Arena"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
