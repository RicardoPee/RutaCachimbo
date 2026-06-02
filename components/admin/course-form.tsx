"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { upsertCourse } from "@/actions/course-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

const formSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  imageSrc: z.string().min(1, "La URL de la imagen es obligatoria"),
});

type CourseFormValues = z.infer<typeof formSchema>;

interface CourseFormProps {
  initialData?: CourseFormValues;
}

export const CourseForm = ({ initialData }: CourseFormProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      imageSrc: "",
    },
  });

  const { register, handleSubmit, watch, formState: { errors, isDirty } } = form;
  const currentTitle = watch("title");
  const currentImageSrc = watch("imageSrc");

  const onSubmit = async (data: CourseFormValues) => {
    try {
      setIsSaving(true);
      await upsertCourse({ ...data, id: initialData?.id });
      toast.success(initialData ? "Curso actualizado" : "Curso creado", {
        description: "Los cambios han sido guardados exitosamente.",
      });
      router.push("/admin/courses");
    } catch (error) {
      toast.error("Ocurrió un error", {
        description: "No se pudo guardar el curso. Inténtalo de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-6 w-full h-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <Link href="/admin/courses">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
          {initialData ? "Editar Curso" : "Crear Nuevo Curso"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start">
        {/* Panel Izquierdo: Formulario */}
        <div className="flex flex-col bg-card border-2 border-border rounded-3xl p-8 shadow-sm">
          <form id="course-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                Título del Curso
              </label>
              <Input
                {...register("title")}
                placeholder="Ej. Comprensión Lectora, Razonamiento Verbal..."
                className="h-14 text-lg rounded-2xl bg-slate-50 dark:bg-background border-2 focus-visible:ring-0 focus-visible:border-sky-500 transition-colors"
                disabled={isSaving}
              />
              {errors.title && (
                <p className="text-rose-500 text-sm font-medium mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">
                URL de la Imagen (SVG/PNG)
              </label>
              <Input
                {...register("imageSrc")}
                placeholder="Ej. /book.svg"
                className="h-14 text-lg rounded-2xl bg-slate-50 dark:bg-background border-2 focus-visible:ring-0 focus-visible:border-sky-500 transition-colors"
                disabled={isSaving}
              />
              {errors.imageSrc && (
                <p className="text-rose-500 text-sm font-medium mt-1">{errors.imageSrc.message}</p>
              )}
              <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                Pega la ruta de un SVG público de tu carpeta (ej. <span className="text-sky-500">/math.svg</span>) o un link externo válido.
              </p>
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
                    if (confirm("¿Estás seguro de que deseas eliminar este curso? Esto borrará todas las unidades, lecciones y preguntas asociadas.")) {
                      try {
                        setIsSaving(true);
                        const { deleteCourse } = await import("@/actions/course-actions");
                        await deleteCourse(initialData.id!);
                        toast.success("Curso eliminado");
                        router.push("/admin/courses");
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
              form="course-form"
              disabled={isSaving || !isDirty}
              className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-6 rounded-2xl font-bold border-b-4 border-sky-600 active:border-b-0 transition-all text-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        {/* Panel Derecho: Live Preview */}
        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-background/50 border-2 border-dashed border-slate-300 dark:border-border rounded-3xl p-8 relative overflow-hidden h-full min-h-[400px]">
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest shadow-sm">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            Live Preview
          </div>
          
          <div className="w-full max-w-[280px] bg-card border-2 border-border rounded-2xl flex flex-col items-center justify-between p-6 pb-8 h-[340px] hover:border-sky-500 hover:shadow-xl hover:shadow-sky-500/10 transition-all cursor-default">
            <div className="w-full flex-1 flex items-center justify-center relative">
              {currentImageSrc ? (
                <div className="relative w-[120px] h-[120px] hover:-translate-y-2 transition-transform duration-300">
                  <img
                    src={currentImageSrc}
                    alt={currentTitle || "Preview"}
                    className="object-contain drop-shadow-lg w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = 'block';
                    }}
                  />
                </div>
              ) : (
                <div className="w-[120px] h-[120px] bg-muted rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <ImageIcon className="w-10 h-10 text-slate-400" />
                </div>
              )}
            </div>
            <p className="text-foreground text-center font-extrabold text-2xl mt-8 w-full truncate px-2">
              {currentTitle || "Título del Curso"}
            </p>
          </div>
          <p className="absolute bottom-6 text-sm font-medium text-slate-400 text-center max-w-[80%]">
            Así es como los estudiantes verán el curso en su panel principal.
          </p>
        </div>
      </div>
    </div>
  );
};
