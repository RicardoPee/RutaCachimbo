"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinClassroom } from "@/actions/classrooms";

export const JoinClassroom = () => {
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    startTransition(() => {
      joinClassroom(code)
        .then((res) => {
          if (res.error) {
            toast.error(res.error);
          } else {
            toast.success(`¡Te uniste al aula: ${res.classroomName}!`);
            setCode("");
          }
        })
        .catch(() => toast.error("Ocurrió un error inesperado"));
    });
  };

  return (
    <div className="bg-slate-100 border-2 border-slate-200 rounded-xl p-4 mb-6">
      <h2 className="text-lg font-bold text-neutral-700 mb-2">
        ¿Tienes un código de profesor?
      </h2>
      <p className="text-neutral-500 mb-4 text-sm">
        Ingresa el código que te dio tu profesor para acceder a tareas y simulacros privados.
      </p>
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input 
          disabled={pending}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ej: PROFE2026"
          className="uppercase"
        />
        <Button disabled={pending} type="submit" variant="secondary">
          Unirme
        </Button>
      </form>
    </div>
  );
};
