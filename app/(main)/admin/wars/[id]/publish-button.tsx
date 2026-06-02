"use client";

import { useState } from "react";
import { publishTournamentResults } from "@/actions/tournament-actions";
import { toast } from "sonner";
import { Trophy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export const PublishButton = ({ tournamentId }: { tournamentId: number }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    if (!confirm("¿Estás seguro que deseas finalizar la guerra? Esto calculará los resultados finales y los publicará para todos.")) {
      return;
    }
    
    setLoading(true);
    const res = await publishTournamentResults(tournamentId);
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success("Resultados publicados con éxito");
      router.refresh();
    }
  };

  return (
    <button 
      onClick={handlePublish}
      disabled={loading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
      FINALIZAR Y PUBLICAR RESULTADOS
    </button>
  );
};
