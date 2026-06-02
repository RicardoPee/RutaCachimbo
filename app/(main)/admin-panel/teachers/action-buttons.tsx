"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveApplication, rejectApplication } from "@/actions/teacher-applications";
import { Check, X, Loader2 } from "lucide-react";

type Props = {
  applicationId: number;
  userId: string;
};

export const ActionButtons = ({ applicationId, userId }: Props) => {
  const [pending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(() => {
      approveApplication(applicationId, userId)
        .then((res) => {
          if (res?.error) toast.error(res.error);
          else toast.success("Profesor aprobado exitosamente");
        })
        .catch(() => toast.error("Ocurrió un error"));
    });
  };

  const handleReject = () => {
    startTransition(() => {
      rejectApplication(applicationId)
        .then((res) => {
          if (res?.error) toast.error(res.error);
          else toast.success("Solicitud rechazada");
        })
        .catch(() => toast.error("Ocurrió un error"));
    });
  };

  return (
    <div className="flex items-center gap-2 w-full md:w-auto">
      <Button 
        disabled={pending} 
        onClick={handleReject}
        variant="dangerOutline" 
        className="flex-1 md:flex-none"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4 mr-2"/> Rechazar</>}
      </Button>
      <Button 
        disabled={pending} 
        onClick={handleApprove}
        variant="secondary" 
        className="flex-1 md:flex-none"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-2"/> Aprobar</>}
      </Button>
    </div>
  );
};
