"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { processPdfExam } from "@/actions/upload-pdf";
import { Loader2 } from "lucide-react";

export const UploadPdfButton = ({ classroomId }: { classroomId: number }) => {
  const [pending, startTransition] = useTransition();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("classroomId", classroomId.toString());

    startTransition(() => {
      processPdfExam(formData)
        .then((res) => {
          if (res?.error) {
            toast.error(res.error);
          } else if (res?.success) {
            toast.success("¡Material procesado con éxito!");
          }
        })
        .catch(() => toast.error("Error al procesar el PDF."));
    });
  };

  return (
    <div className="relative mt-2">
      <input 
        type="file" 
        accept="application/pdf"
        disabled={pending}
        onChange={handleUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <Button 
        size="sm" 
        variant="primaryOutline" 
        className="w-full pointer-events-none"
        disabled={pending}
      >
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analizando...</>
        ) : "Subir PDF de Material"}
      </Button>
    </div>
  );
};
