"use client";

import { useState, useEffect } from "react";
import { Shield, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export const TournamentBannerClient = ({ tournament }: { tournament: any }) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
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

      let timeStr = "";
      if (days > 0) timeStr += `${days}d `;
      timeStr += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

      setTimeLeft(timeStr);
    }, 1000);

    return () => clearInterval(timer);
  }, [tournament]);

  if (tournament.status === 'ACTIVE') {
    return (
      <div 
        onClick={() => router.push(`/factions/play?tournamentId=${tournament.id}`)} 
        className="w-full bg-gradient-to-r from-amber-600 to-rose-600 rounded-2xl p-4 mb-6 shadow-xl border-2 border-amber-300 cursor-pointer hover:scale-[1.02] transition-transform animate-pulse flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-white" />
          <div>
            <h3 className="text-white font-black uppercase tracking-wider text-lg">¡La Batalla ha Comenzado!</h3>
            <p className="text-amber-100 font-medium text-sm">El evento &apos;{tournament.title}&apos; está activo. Únete a tu facción ahora.</p>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 text-white" />
      </div>
    );
  }

  return (
    <div 
      onClick={() => router.push("/factions")} 
      className="w-full bg-gradient-to-r from-indigo-800 to-purple-800 rounded-2xl p-4 mb-6 shadow-lg border-2 border-indigo-400 cursor-pointer hover:scale-[1.02] transition-transform flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <Shield className="w-8 h-8 text-indigo-200" />
        <div>
          <h3 className="text-indigo-100 font-black uppercase tracking-wider text-sm md:text-lg">Guerra Programada: {tournament.title}</h3>
          <div className="flex items-center gap-2 mt-1">
             <Clock className="w-4 h-4 text-amber-400" />
             <span className="text-amber-400 font-mono font-bold">Faltan {timeLeft || "Calculando..."}</span>
          </div>
        </div>
      </div>
      <ArrowRight className="w-6 h-6 text-indigo-300" />
    </div>
  );
};
