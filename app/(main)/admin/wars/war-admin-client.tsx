"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Calendar, Clock, Swords, Save, X, Sparkles, RefreshCw, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { createWarEvent } from "@/actions/tournament-actions";
import { generateTournamentDraft, getReplacementLesson } from "@/actions/ai-tournament-actions";
import { useRouter } from "next/navigation";

export const WarAdminClient = () => {
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [draftMode, setDraftMode] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("Guerra de Humanidades");
  const [description, setDescription] = useState("Lecturas intensivas sobre historia y filosofía.");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [roundDuration, setRoundDuration] = useState(60); 

  // Draft Data
  const [draftLessons, setDraftLessons] = useState<any[]>([]);
  const [aiReasoning, setAiReasoning] = useState("");
  const router = useRouter();

  const handleGenerateDraft = async () => {
    if (!title || !date || !time) {
      toast.error("Por favor completa los campos principales (Título, Fecha y Hora).");
      return;
    }

    const startTime = new Date(`${date}T${time}`);
    if (isNaN(startTime.getTime())) {
      toast.error("Formato de fecha u hora inválido.");
      return;
    }

    setLoading(true);
    toast.info("Gemini AI está analizando tu base de datos...");
    
    const res = await generateTournamentDraft(title, description, questionCount);
    
    if (res?.error) {
      toast.error(res.error);
    } else if (res?.draft) {
      setDraftLessons(res.draft);
      setAiReasoning(res.aiReasoning || "Seleccionado aleatoriamente (Fallback).");
      setDraftMode(true);
      toast.success("Borrador generado con éxito");
    }
    setLoading(false);
  };

  const handleSwapLesson = async (indexToSwap: number) => {
    setLoading(true);
    const currentIds = draftLessons.map(l => l.id);
    const replacement = await getReplacementLesson(currentIds, title, description);
    
    if (!replacement) {
      toast.error("No hay más lecturas disponibles en la base de datos para reemplazar.");
    } else {
      const newDraft = [...draftLessons];
      newDraft[indexToSwap] = replacement;
      setDraftLessons(newDraft);
      toast.success("Lectura reemplazada");
    }
    setLoading(false);
  };

  const handleRemoveLesson = (indexToRemove: number) => {
    const newDraft = draftLessons.filter((_, idx) => idx !== indexToRemove);
    setDraftLessons(newDraft);
    toast.success("Lectura eliminada del torneo");
  };

  const handleLaunch = async () => {
    if (draftLessons.length === 0) {
      toast.error("No puedes lanzar un torneo vacío.");
      return;
    }
    setLoading(true);

    const startTime = new Date(`${date}T${time}`);
    const selectedLessonIds = draftLessons.map(l => l.id);

    const res = await createWarEvent({
      title,
      description,
      startTime,
      toleranceMinutes: 15,
      roundDuration: roundDuration,
      intermissionTime: 15,
      selectedLessonIds // Pasamos los IDs al backend
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Torneo programado en Base de Datos");
      setIsCreating(false);
      setDraftMode(false);
      router.refresh();
      setTimeout(() => window.location.reload(), 500);
    }
    setLoading(false);
  };

  if (!isCreating && !draftMode) {
    return (
      <Button onClick={() => setIsCreating(true)} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6">
        <Plus className="w-5 h-5 mr-2" />
        Programar Nuevo Torneo
      </Button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-lg mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
      
      {!draftMode ? (
        <>
          <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2">
            <Swords className="w-6 h-6 text-indigo-500" /> Creador de Torneos (Paso 1: Parámetros)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Evento</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="border-2 border-slate-200 mt-1" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Contexto Temático para la IA</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} className="border-2 border-slate-200 mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha de Inicio</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border-2 border-slate-200 mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Hora de Inicio</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="border-2 border-slate-200 mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Rondas solicitadas</label>
              <Input type="number" min={1} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="border-2 border-slate-200 mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Segundos por pregunta</label>
              <Input type="number" min={10} value={roundDuration} onChange={(e) => setRoundDuration(Number(e.target.value))} className="border-2 border-slate-200 mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleGenerateDraft} disabled={loading} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold px-8">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
              Generar Temario con IA
            </Button>
            <Button onClick={() => setIsCreating(false)} variant="ghost" disabled={loading} className="text-slate-500 font-bold">
              Cancelar
            </Button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-xl font-black text-indigo-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" /> Borrador del Temario (Paso 2: Revisión)
          </h3>
          {aiReasoning && (
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mb-6">
              <p className="text-purple-800 text-sm italic font-medium">&quot;{aiReasoning}&quot; - Gemini AI</p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            {draftLessons.map((lesson, idx) => (
              <div key={`${lesson.id}-${idx}`} className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50 relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="pr-12">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2 py-1 rounded uppercase tracking-wider mr-2">Ronda {idx + 1}</span>
                    <span className="font-bold text-slate-700">{lesson.title}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                    <Button size="icon" variant="primaryOutline" onClick={() => handleSwapLesson(idx)} disabled={loading} title="Generar otra lectura">
                      <RefreshCw className="w-4 h-4 text-indigo-600" />
                    </Button>
                    <Button size="icon" variant="dangerOutline" onClick={() => handleRemoveLesson(idx)} disabled={loading} title="Eliminar ronda">
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 italic border-l-2 border-slate-300 pl-2">
                  {lesson.referenceText}
                </p>
                <div className="mt-2 text-xs font-bold text-slate-400">
                  Contiene {lesson.challenges?.length || 0} reto(s).
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleLaunch} disabled={loading || draftLessons.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              Aprobar y Lanzar Torneo
            </Button>
            <Button onClick={() => setDraftMode(false)} variant="ghost" disabled={loading} className="text-slate-500 font-bold">
              Volver a Parámetros
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
