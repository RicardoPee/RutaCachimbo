"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createWarEvent } from "@/actions/tournament-actions";
import { useRouter } from "next/navigation";

export const CreateWarButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    // Para simplificar, crearemos uno programado para empezar en el minuto actual exacto.
    // En un sistema completo, abriría un modal para elegir fechas y tolerancias.
    const startTime = new Date();
    // Añadimos 1 minuto para dar tiempo a conectarse
    startTime.setMinutes(startTime.getMinutes() + 1);

    const res = await createWarEvent({
      title: "Gran Final de Universidades",
      description: "El torneo masivo ha comenzado.",
      startTime,
      toleranceMinutes: 15,
      roundDuration: 180, // 3 mins per question
      intermissionTime: 15, // 15 secs leaderboard
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Torneo creado con éxito");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Button onClick={handleCreate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6">
      {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
      Desplegar Nuevo Torneo
    </Button>
  );
};
