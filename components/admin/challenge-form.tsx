"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { upsertChallenge } from "@/actions/challenge-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, Plus, Trash2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const optionSchema = z.object({
  text: z.string().min(1, "Texto obligatorio"),
  correct: z.boolean().default(false),
  imageSrc: z.string().optional(),
  audioSrc: z.string().optional(),
});

const formSchema = z.object({
  id: z.number().optional(),
  question: z.string().min(3, "La pregunta debe tener al menos 3 caracteres"),
  lessonId: z.coerce.number().min(1, "Debes seleccionar una lección"),
  order: z.coerce.number().min(1, "El orden debe ser mayor a 0"),
  type: z.enum(["SELECT", "ASSIST"]),
  challengeOptions: z.array(optionSchema).optional(),
});

type ChallengeFormValues = z.infer<typeof formSchema>;

interface ChallengeFormProps {
  initialData?: ChallengeFormValues;
  lessons: { id: number; title: string; unit: { title: string, order: number, course: { title: string } } }[];
}

export const ChallengeForm = ({ initialData, lessons }: ChallengeFormProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: initialData || {
      question: "",
      lessonId: lessons[0]?.id || 0,
      order: 1,
      type: "SELECT",
      challengeOptions: [],
    },
  });

  const { register, control, handleSubmit, watch, formState: { errors, isDirty } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "challengeOptions",
  });

  const onSubmit = async (data: ChallengeFormValues) => {
    try {
      setIsSaving(true);
      await upsertChallenge({ ...data, id: initialData?.id });
      toast.success(initialData ? "Reto actualizado" : "Reto creado", {
        description: "Pregunta y opciones guardadas correctamente.",
      });
      router.push("/admin/challenges");
    } catch (error) {
      toast.error("Ocurrió un error", {
        description: "No se pudo guardar el reto.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentType = watch("type");

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-6 w-full h-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <Link href="/admin/challenges">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
          {initialData ? "Editar Reto y Opciones" : "Crear Nuevo Reto"}
        </h1>
      </div>

      <div className="flex flex-col bg-card border-2 border-border rounded-3xl p-8 shadow-sm">
        <form id="challenge-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                Lección Perteneciente
              </label>
              <select
                {...register("lessonId")}
                className="w-full h-14 px-4 text-sm rounded-2xl bg-slate-50 dark:bg-background border-2 border-border focus:outline-none focus:border-rose-500 transition-colors"
                disabled={isSaving}
              >
                <option value={0} disabled>Selecciona una lección</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.unit.course.title} - Ud.{l.unit.order} - {l.title}
                  </option>
                ))}
              </select>
              {errors.lessonId && <p className="text-rose-500 text-sm font-medium mt-1">{errors.lessonId.message}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                Tipo de Reto
              </label>
              <select
                {...register("type")}
                className="w-full h-14 px-4 text-sm font-bold rounded-2xl bg-slate-50 dark:bg-background border-2 border-border focus:outline-none focus:border-rose-500 transition-colors"
                disabled={isSaving}
              >
                <option value="SELECT">SELECT (Múltiple con Imágenes)</option>
                <option value="ASSIST">ASSIST (Asistencia de Audio)</option>
              </select>
              {errors.type && <p className="text-rose-500 text-sm font-medium mt-1">{errors.type.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                Pregunta Principal
              </label>
              <Input
                {...register("question")}
                placeholder="Ej. ¿Cuál es el tema central del texto?"
                className="h-14 text-lg font-bold rounded-2xl bg-slate-50 dark:bg-background border-2 focus-visible:ring-0 focus-visible:border-rose-500 transition-colors"
                disabled={isSaving}
              />
              {errors.question && <p className="text-rose-500 text-sm font-medium mt-1">{errors.question.message}</p>}
            </div>

            <div className="space-y-3 md:col-span-1">
              <label className="text-sm font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                Orden (Nro)
              </label>
              <Input
                type="number"
                {...register("order")}
                placeholder="Ej. 1"
                className="h-14 text-lg rounded-2xl bg-slate-50 dark:bg-background border-2 focus-visible:ring-0 focus-visible:border-rose-500 transition-colors"
                disabled={isSaving}
              />
              {errors.order && <p className="text-rose-500 text-sm font-medium mt-1">{errors.order.message}</p>}
            </div>
          </div>

          {/* Opciones Group */}
          <div className="pt-8 border-t-2 border-slate-100 dark:border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-foreground">
                  Opciones de Respuesta
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Agrega las opciones aquí mismo.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => append({ text: "", correct: false, imageSrc: "", audioSrc: "" })}
                className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl border-b-4 border-sky-600 active:border-b-0 font-bold"
              >
                <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                Agregar Opción
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {fields.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl text-slate-400 font-medium">
                  No has agregado ninguna opción de respuesta aún.
                </div>
              )}
              
              {fields.map((field, index) => {
                const isOptionCorrect = watch(`challengeOptions.${index}.correct`);

                return (
                  <div 
                    key={field.id} 
                    className={`flex flex-col gap-4 p-6 rounded-2xl border-2 transition-colors ${isOptionCorrect ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-background/50 border-border'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="bg-slate-200 dark:bg-slate-800 text-muted-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            {...register(`challengeOptions.${index}.correct`)}
                            className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 transition-all cursor-pointer"
                            disabled={isSaving}
                          />
                          <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${isOptionCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 group-hover:text-emerald-500'}`}>
                            Es la Correcta
                          </span>
                        </label>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Texto</label>
                        <Input
                          {...register(`challengeOptions.${index}.text`)}
                          placeholder="Texto de respuesta..."
                          className="bg-card border-2"
                        />
                      </div>
                      
                      {currentType === "SELECT" && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">URL Imagen</label>
                          <Input
                            {...register(`challengeOptions.${index}.imageSrc`)}
                            placeholder="/text.svg"
                            className="bg-card border-2"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">URL Audio</label>
                        <Input
                          {...register(`challengeOptions.${index}.audioSrc`)}
                          placeholder="/apple.mp3"
                          className="bg-card border-2"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
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
                  if (confirm("¿Estás seguro de que deseas eliminar este reto/pregunta?")) {
                    try {
                      setIsSaving(true);
                      const { deleteChallenge } = await import("@/actions/challenge-actions");
                      await deleteChallenge(initialData.id!);
                      toast.success("Reto eliminado");
                      router.push("/admin/challenges");
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
            form="challenge-form"
            disabled={isSaving || !isDirty}
            className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 rounded-2xl font-bold border-b-4 border-rose-600 active:border-b-0 transition-all text-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
};
