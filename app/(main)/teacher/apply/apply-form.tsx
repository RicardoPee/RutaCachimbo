"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitTeacherApplication } from "@/actions/teacher-applications";

export const ApplyForm = () => {
  const [proofUrl, setProofUrl] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl.trim() || !description.trim()) return;

    if (!proofUrl.startsWith("http")) {
      toast.error("Por favor ingresa un enlace válido que empiece con http o https.");
      return;
    }

    startTransition(() => {
      submitTeacherApplication(proofUrl, description)
        .then((res) => {
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success("Solicitud enviada exitosamente.");
          }
        })
        .catch(() => toast.error("Error al enviar la solicitud."));
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-bold text-neutral-500 uppercase">Enlace de Evidencia</label>
        <p className="text-xs text-neutral-400 mb-2">Pega un link de Google Drive (con acceso público) a tu CV, título o certificado.</p>
        <Input 
          disabled={pending}
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="https://drive.google.com/file/d/..."
          required
        />
      </div>
      <div>
        <label className="text-xs font-bold text-neutral-500 uppercase">Por qué quieres ser profesor</label>
        <Input 
          disabled={pending}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Soy profesor de Razonamiento Verbal en la Academia X..."
          required
        />
      </div>
      <Button disabled={pending} type="submit" variant="secondary" className="mt-2">
        Enviar Solicitud
      </Button>
    </form>
  );
};
