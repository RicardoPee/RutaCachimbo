"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClassroom } from "@/actions/classrooms";

export const CreateClassroomForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(() => {
      createClassroom(name, description)
        .then((res) => {
          toast.success("Aula creada exitosamente.");
          setName("");
          setDescription("");
        })
        .catch(() => toast.error("Error al crear el aula."));
    });
  };

  return (
    <div className="bg-slate-100 border-2 border-slate-200 rounded-xl p-4">
      <h2 className="text-lg font-bold text-neutral-700 mb-4">
        Crear Nueva Aula
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input 
          disabled={pending}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre (ej. Razonamiento Verbal - 5to A)"
          required
        />
        <Input 
          disabled={pending}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción breve (opcional)"
        />
        <Button disabled={pending} type="submit" variant="secondary">
          Generar Código y Crear
        </Button>
      </form>
    </div>
  );
};
