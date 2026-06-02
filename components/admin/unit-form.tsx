"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { upsertUnit } from "@/actions/unit-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, BookOpen, Notebook, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

const formSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(5, "La descripción es obligatoria"),
  courseId: z.coerce.number().min(1, "Debes seleccionar un curso"),
  order: z.coerce.number().min(1, "El orden debe ser mayor a 0"),
});

type UnitFormValues = z.infer<typeof formSchema>;

interface UnitFormProps {
  initialData?: UnitFormValues;
  courses: { id: number; title: string }[];
}

export const UnitForm = ({ initialData, courses }: UnitFormProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: initialData || {
      title: "",
      description: "",
      courseId: courses[0]?.id || 0,
      order: 1,
    },
  });

  const { register, handleSubmit, watch, formState: { errors, isDirty } } = form;
  const currentTitle = watch("title");
  const currentDesc = watch("description");
  const currentCourseId = watch("courseId");
  const currentOrder = watch("order");

  const selectedCourse = courses.find(c => c.id === Number(currentCourseId));

  const onSubmit = async (data: UnitFormValues) => {
    try {
      setIsSaving(true);
      await upsertUnit({ ...data, id: initialData?.id });
      toast.success(initialData ? "Unidad actualizada" : "Unidad creada", {
        description: "Los cambios se guardaron correctamente.",
      });
      router.push("/admin/units");
    } catch (error) {
      toast.error("Ocurrió un error", {
        description: "No se pudo guardar la unidad.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-6 w-full h-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <Link href="/admin/units">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
          {initialData ? "Editar Unidad" : "Crear Nueva Unidad"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start">
        {/* Panel Izquierdo: Formulario */}
        <div className="flex flex-col bg-card border-2 border-border rounded-3xl p-8 shadow-sm">
          <form id="unit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                  Curso Perteneciente
                </label>
                <select
                  {...register("courseId")}
                  className="w-full h-14 px-4 text-lg rounded-2xl bg-slate-50 dark:bg-background border-2 border-border focus:outline-none focus:border-indigo-500 transition-colors"
                  disabled={isSaving}
                >
                  <option value={0} disabled>Selecciona un curso</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                {errors.courseId && <p className="text-rose-500 text-sm font-medium mt-1">{errors.courseId.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                  Orden (Nro)
                </label>
                <Input
                  type="number"
                  {...register("order")}
                  placeholder="Ej. 1"
                  className="h-14 text-lg rounded-2xl bg-slate-50 dark:bg-background border-2 focus-visible:ring-0 focus-visible:border-indigo-500 transition-colors"
                  disabled={isSaving}
                />
                {errors.order && <p className="text-rose-500 text-sm font-medium mt-1">{errors.order.message}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                Título de la Unidad
              </label>
              <Input
                {...register("title")}
                placeholder="Ej. Niveles de Comprensión"
                className="h-14 text-lg rounded-2xl bg-slate-50 dark:bg-background border-2 focus-visible:ring-0 focus-visible:border-indigo-500 transition-colors"
                disabled={isSaving}
              />
              {errors.title && <p className="text-rose-500 text-sm font-medium mt-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                Descripción
              </label>
              <Textarea
                {...register("description")}
                placeholder="Ej. Aprende las estrategias para el nivel inferencial..."
                className="h-28 text-lg rounded-2xl bg-slate-50 dark:bg-background border-2 focus-visible:ring-0 focus-visible:border-indigo-500 transition-colors resize-none"
                disabled={isSaving}
              />
              {errors.description && <p className="text-rose-500 text-sm font-medium mt-1">{errors.description.message}</p>}
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
                    if (confirm("¿Estás seguro de que deseas eliminar esta unidad? Se borrarán todas las lecciones asociadas.")) {
                      try {
                        setIsSaving(true);
                        const { deleteUnit } = await import("@/actions/unit-actions");
                        await deleteUnit(initialData.id!);
                        toast.success("Unidad eliminada");
                        router.push("/admin/units");
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
              form="unit-form"
              disabled={isSaving || !isDirty}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-6 rounded-2xl font-bold border-b-4 border-indigo-600 active:border-b-0 transition-all text-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        {/* Panel Derecho: Live Preview */}
        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-background/50 border-2 border-dashed border-slate-300 dark:border-border rounded-3xl p-8 relative overflow-hidden h-full min-h-[400px]">
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest shadow-sm">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Live Preview
          </div>
          
          <div className="w-full max-w-sm bg-green-500 rounded-3xl p-6 flex flex-col items-start justify-between shadow-lg shadow-green-500/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Notebook className="w-24 h-24" />
            </div>
            <div className="relative z-10 w-full">
              <div className="flex items-center justify-between font-bold text-green-100 uppercase tracking-widest text-sm mb-4">
                <span>Unidad {currentOrder || "1"}</span>
                <span className="bg-black/20 px-3 py-1 rounded-full text-xs">
                  {selectedCourse?.title || "Curso"}
                </span>
              </div>
              <h3 className="font-extrabold text-2xl mb-2 leading-tight">
                {currentTitle || "Título de la Unidad"}
              </h3>
              <p className="text-green-50 font-medium line-clamp-2">
                {currentDesc || "La descripción de la unidad aparecerá aquí, explicando de qué trata."}
              </p>
            </div>
            <Button size="lg" variant="secondary" className="mt-8 w-full font-bold text-green-600 border-b-4 border-green-200 active:border-b-0 rounded-2xl relative z-10 bg-white hover:bg-slate-50">
              <BookOpen className="w-5 h-5 mr-2" />
              Continuar
            </Button>
          </div>
          <p className="absolute bottom-6 text-sm font-medium text-slate-400 text-center max-w-[80%]">
            Así es como los estudiantes verán el bloque de la unidad en su ruta de aprendizaje.
          </p>
        </div>
      </div>
    </div>
  );
};
