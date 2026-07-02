"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWarEvent } from "@/actions/tournament-actions";
import { toast } from "sonner";
import { Swords, Save, Loader2, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export const NewWarForm = ({ availableLessons }: { availableLessons: any[] }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    roundDuration: 180, // en segundos? El schema dice Int default 180
    toleranceMinutes: 15,
    intermissionTime: 15,
  });
  
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);

  const toggleLesson = (id: number) => {
    if (selectedLessons.includes(id)) {
      setSelectedLessons(selectedLessons.filter(l => l !== id));
    } else {
      setSelectedLessons([...selectedLessons, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime) {
      toast.error("El título y la fecha de inicio son obligatorios");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Desplegando armamento y creando la guerra...");

    const res = await createWarEvent({
      ...formData,
      startTime: new Date(formData.startTime),
      selectedLessonIds: selectedLessons.length > 0 ? selectedLessons : undefined,
    });

    if (res?.error || !res?.tournament) {
      toast.error(res?.error || "No se pudo crear la guerra", { id: toastId });
      setLoading(false);
    } else {
      toast.success("¡Guerra creada exitosamente!", { id: toastId });
      router.push(`/admin/wars/${res.tournament.id}`);
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/admin/wars" className="inline-flex items-center text-indigo-600 font-bold mb-6 hover:text-indigo-800 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Historial
      </Link>
      
      <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8 border-b-2 border-slate-100 dark:border-border pb-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
            <Swords className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">Planificar Nueva Guerra</h1>
            <p className="text-slate-500 font-medium">Configura los parámetros del torneo y selecciona las preguntas.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Título de la Guerra</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ej. Simulacro General UNMSM 2025"
                className="w-full p-4 rounded-xl border-2 border-border bg-muted focus:border-indigo-500 outline-none font-bold text-foreground"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descripción Estratégica</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Reglas o detalles para los reclutas..."
                className="w-full p-4 rounded-xl border-2 border-border bg-muted focus:border-indigo-500 outline-none font-medium min-h-[100px] text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fecha y Hora de Inicio</label>
              <input 
                type="datetime-local" 
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                className="w-full p-4 rounded-xl border-2 border-border bg-muted focus:border-indigo-500 outline-none font-bold text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tolerancia (Minutos)</label>
              <input 
                type="number" 
                value={formData.toleranceMinutes}
                onChange={e => setFormData({...formData, toleranceMinutes: parseInt(e.target.value)})}
                className="w-full p-4 rounded-xl border-2 border-border bg-muted focus:border-indigo-500 outline-none font-bold text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tiempo TOTAL del Examen (Segundos)</label>
              <input 
                type="number" 
                value={formData.roundDuration}
                onChange={e => setFormData({...formData, roundDuration: parseInt(e.target.value)})}
                className="w-full p-4 rounded-xl border-2 border-border bg-muted focus:border-indigo-500 outline-none font-bold text-foreground"
              />
              <p className="text-xs text-slate-500 font-bold">Nota: Al estar en modo asíncrono, este es el tiempo por pregunta x total de preguntas.</p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t-2 border-slate-100 dark:border-border">
            <h3 className="text-xl font-black text-foreground mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" /> Selección de Lecturas/Preguntas
            </h3>
            <p className="text-sm text-slate-500 mb-4 font-medium">Selecciona las lecciones que deseas incluir en este examen. Cada lección aportará una pregunta. (Si dejas esto vacío, el sistema elegirá al azar).</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
              {availableLessons.length === 0 ? (
                <div className="col-span-full p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300">
                  No hay lecciones con texto de referencia (Reading) en la base de datos.
                </div>
              ) : (
                availableLessons.map((lesson) => (
                  <div 
                    key={lesson.id} 
                    onClick={() => toggleLesson(lesson.id)}
                    className={`cursor-pointer border-2 p-4 rounded-xl transition-all ${
                      selectedLessons.includes(lesson.id) 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300' 
                        : 'border-border bg-card text-slate-600 dark:text-muted-foreground hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold line-clamp-1">{lesson.title}</h4>
                      {selectedLessons.includes(lesson.id) && (
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-black">
                          {selectedLessons.indexOf(lesson.id) + 1}
                        </div>
                      )}
                    </div>
                    <p className="text-xs opacity-70 line-clamp-2">{lesson.referenceText}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 active:translate-y-0"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            {loading ? "CREANDO GUERRA..." : "DECLARAR GUERRA (GUARDAR)"}
          </button>
        </form>
      </div>
    </div>
  );
};
