"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { finishWeekAction } from "@/actions/leaderboard";
import { Loader2, CalendarCheck } from "lucide-react";

export const FinishWeekButton = () => {
  const [pending, startTransition] = useTransition();

  const handleFinishWeek = () => {
    if (!confirm("¿Estás seguro? Esto reseteará los puntos semanales de todos los usuarios.")) {
      return;
    }
    
    startTransition(() => {
      finishWeekAction()
        .then((res) => {
          if (res?.error) toast.error(res.error);
          else toast.success("Semana finalizada y ligas actualizadas.");
        })
        .catch(() => toast.error("Ocurrió un error"));
    });
  };

  return (
    <Button 
      disabled={pending} 
      onClick={handleFinishWeek}
      variant="danger" 
      size="lg"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CalendarCheck className="h-5 w-5 mr-2"/>}
      Finalizar Semana Oficialmente
    </Button>
  );
};
