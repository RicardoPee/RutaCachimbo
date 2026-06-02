"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { upsertLesson } from "@/actions/lesson-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

const formSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  unitId: z.coerce.number().min(1, "Debes seleccionar una unidad"),
  order: z.coerce.number().min(1, "El orden debe ser mayor a 0"),
  referenceText: z.string().optional(),
});

type LessonFormValues = z.infer<typeof formSchema>;

interface LessonFormProps {
  initialData?: LessonFormValues;
  units: { id: number; title: string; course: { title: string } }[];
}

export const LessonForm = ({ initialData, units }: LessonFormProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: initialData || {
      title: "",
      unitId: units[0]?.id || 0,
      order: 1,
      referenceText: "",
    },
  });

  const { register, handleSubmit, formState: { errors, isDirty } } = form;

  const onSubmit = async (data: LessonFormValues) => {
    try {
      setIsSaving(true);
      await upsertLesson({ ...data, id: initialData?.id });
      toast.success(initialData ? "Lección actualizada" : "Lección creada", {
        description: "Los cambios se guardaron correctamente.",
      });
      router.push("/admin/lessons");
    } catch (error) {
      toast.error("Ocurrió un error", {
        description: "No se pudo guardar la lección.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-6 w-full h-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <Link href="/admin/lessons">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
          {initialData ? "Editar Lección" : "Crear Nueva Lección"}
        </h1>
      </div>

      <div className="flex flex-col bg-card border-2 border-border rounded-3xl p-8 shadow-sm">
        <form id="lesson-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                Unidad Perteneciente
              </label>
              <select
                {...register("unitId")}
                className="w-full h-14 px-4 text-sm rounded-2xl bg-slate-50 dark:bg-background border-2 border-border focus:outline-none focus:border-fuchsia-500 transition-colors"
                disabled={isSaving}
              >
                <option value={0} disabled>Selecciona una unidad</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.course.title} - {u.title}
                  </option>
                ))}
              </select>
              {errors.unitId && <p className="text-rose-500 text-sm font-medium mt-1">{errors.unitId.message}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                Orden (Nro)
              </label>
              <Input
                type="number"
                {...register("order")}
                placeholder="Ej. 1"
                className="h-14 text-lg rounded-2xl bg-slate-50 dark:bg-background border-2 focus-visible:ring-0 focus-visible:border-fuchsia-500 transition-colors"
                disabled={isSaving}
              />
              {errors.order && <p className="text-rose-500 text-sm font-medium mt-1">{errors.order.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
              Título de la Lección
            </label>
            <Input
              {...register("title")}
              placeholder="Ej. Idea Principal y Secundaria"
              className="h-14 text-lg font-bold rounded-2xl bg-slate-50 dark:bg-background border-2 focus-visible:ring-0 focus-visible:border-fuchsia-500 transition-colors"
              disabled={isSaving}
            />
            {errors.title && <p className="text-rose-500 text-sm font-medium mt-1">{errors.title.message}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
              Texto de Referencia (Contenido de Lectura)
            </label>
            <Textarea
              {...register("referenceText")}
              placeholder="Ej. Lee la página 24 antes de empezar. Este texto aparecerá como guía teórica para el alumno."
              className="min-h-[250px] text-lg rounded-2xl bg-slate-50 dark:bg-background border-2 focus-visible:ring-0 focus-visible:border-fuchsia-500 transition-colors resize-y p-6"
              disabled={isSaving}
            />
          </div>
        </form>

        <div className="pt-8 mt-8 border-t-2 border-slate-100 dark:border-border flex justify-between items-center">
          <div className="flex items-center gap-4">
            {initialData?.id && (
              <Button
                type="button"
                variant="danger"
                disabled={isSaving}
                onClick={async () => {
                  if (confirm("¿Estás seguro de que deseas eliminar esta lección? Se borrarán todas las preguntas asociadas.")) {
                    try {
                      setIsSaving(true);
                      const { deleteLesson } = await import("@/actions/lesson-actions");
                      await deleteLesson(initialData.id!);
                      toast.success("Lección eliminada");
                      router.push("/admin/lessons");
                    } catch (error) {
                      toast.error("Ocurrió un error al eliminar");
                      setIsSaving(false);
                    }
                  }
                }}
                className="px-6 py-6 rounded-2xl text-lg flex items-center gap-2"
              >
                <Trash className="w-5 h-5" /> Eliminar
              </Button>
            )}
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
              {isDirty ? "Cambios sin guardar" : "Todo está guardado"}
            </div>
          </div>
          <Button
            type="submit"
            form="lesson-form"
            disabled={isSaving || !isDirty}
            className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-8 py-6 rounded-2xl font-bold border-b-4 border-fuchsia-600 active:border-b-0 transition-all text-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
};
