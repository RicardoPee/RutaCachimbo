"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { parsePdfWithAI, saveReviewedContent } from "@/actions/upload-pdf";
import { Loader2, UploadCloud, CheckCircle2, XCircle, Trash2, CheckSquare, Sparkles } from "lucide-react";

export const AdminUploadPdfButton = () => {
  const [pending, startTransition] = useTransition();
  const [parsedData, setParsedData] = useState<any>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    startTransition(() => {
      toast.info("Iniciando análisis con Gemini AI...", { duration: 3000 });
      parsePdfWithAI(formData)
        .then((res) => {
          if (res?.error) {
            toast.error(res.error, { duration: 6000 });
          } else if (res?.success && res.data) {
            setParsedData(res.data);
            toast.success("PDF procesado. Por favor revisa el contenido.", { duration: 4000 });
          }
        })
        .catch(() => toast.error("Error crítico al procesar el PDF."));
    });
  };

  const togglePassage = (pIndex: number) => {
    const newData = { ...parsedData };
    const p = newData.passages[pIndex];
    p.included = !p.included;
    // Cascade toggle to questions
    p.questions.forEach((q: any) => q.included = p.included);
    setParsedData(newData);
  };

  const toggleQuestion = (pIndex: number, qIndex: number) => {
    const newData = { ...parsedData };
    newData.passages[pIndex].questions[qIndex].included = !newData.passages[pIndex].questions[qIndex].included;
    setParsedData(newData);
  };

  const handleSave = () => {
    startTransition(() => {
      saveReviewedContent({ classroomIdStr: null, result: parsedData })
        .then((res) => {
          if (res?.error) {
            toast.error(res.error);
          } else if (res?.success) {
            toast.success(res.message);
            setParsedData(null); // Reset after saving to allow another upload
          }
        })
        .catch(() => toast.error("Error al guardar en la base de datos."));
    });
  };

  if (parsedData) {
    return (
      <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in duration-500 mt-8">
        <div className="bg-sky-50 dark:bg-sky-950/30 p-6 rounded-2xl border-2 border-sky-200 dark:border-sky-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-sky-800 dark:text-sky-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Modo Revisión: {parsedData.examTitle || "Examen Analizado"}
            </h3>
            <p className="text-sm text-sky-600 dark:text-sky-400 font-medium">Revisa las lecturas y preguntas. Desmarca lo que no desees guardar.</p>
          </div>
          <Button onClick={handleSave} disabled={pending} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 h-12 rounded-xl flex-shrink-0">
            {pending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            Aceptar y Guardar Todo
          </Button>
        </div>

        <div className="space-y-8">
          {parsedData.passages.map((passage: any, pIndex: number) => (
            <div key={pIndex} className={`bg-card rounded-3xl border-2 transition-all overflow-hidden shadow-sm ${passage.included ? 'border-border' : 'border-rose-200 dark:border-rose-900/50 opacity-60'}`}>
              
              {/* Cabecera de la Lectura */}
              <div className="p-6 border-b-2 border-slate-100 dark:border-border flex flex-col md:flex-row items-start justify-between bg-slate-50 dark:bg-background/30 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {passage.difficulty || "BÁSICO"}
                    </span>
                    <h4 className="font-extrabold text-lg text-foreground">{passage.passageTitle || `Lectura ${pIndex + 1}`}</h4>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-3">{passage.fullText}</p>
                </div>
                <Button 
                  variant={passage.included ? "danger" : "primaryOutline"} 
                  onClick={() => togglePassage(pIndex)}
                  className={`flex-shrink-0 ${passage.included ? "bg-rose-500 hover:bg-rose-600" : "border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950"}`}
                >
                  {passage.included ? <><Trash2 className="w-4 h-4 mr-2" /> Descartar Toda la Lectura</> : <><CheckSquare className="w-4 h-4 mr-2" /> Restaurar Lectura</>}
                </Button>
              </div>

              {/* Grid de Preguntas */}
              {passage.included && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-background/20">
                  {passage.questions.map((q: any, qIndex: number) => (
                    <div key={qIndex} className={`flex flex-col bg-card border-2 rounded-2xl p-5 relative transition-all ${q.included ? 'border-sky-200 dark:border-sky-900 shadow-sm' : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10'}`}>
                      
                      {/* Botón Flotante para Descartar Pregunta */}
                      <button 
                        onClick={() => toggleQuestion(pIndex, qIndex)}
                        className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm transition-all ${q.included ? 'bg-rose-100 border-rose-300 text-rose-600 hover:bg-rose-500 hover:text-white' : 'bg-emerald-100 border-emerald-300 text-emerald-600 hover:bg-emerald-500 hover:text-white'}`}
                        title={q.included ? "Descartar pregunta" : "Incluir pregunta"}
                      >
                        {q.included ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </button>

                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{q.questionType}</span>
                      <p className={`font-bold text-sm mb-4 flex-1 ${q.included ? 'text-neutral-700 dark:text-neutral-300' : 'text-slate-400 line-through'}`}>{q.questionText}</p>
                      
                      <div className="space-y-2 mt-auto">
                        {q.options?.map((opt: any, oIndex: number) => (
                          <div key={oIndex} className={`text-xs p-2 rounded-lg flex items-start gap-2 ${opt.isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-100'}`}>
                            {opt.isCorrect && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                            <span className="truncate whitespace-normal">{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Upload UI
  return (
    <div className="relative mt-8 w-full max-w-sm mx-auto">
      <input 
        type="file" 
        accept="application/pdf"
        disabled={pending}
        onChange={handleUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <Button 
        size="lg" 
        className="w-full bg-sky-500 hover:bg-sky-600 text-white border-b-4 border-sky-600 active:border-b-0 transition-all rounded-2xl h-16 text-lg font-bold"
        disabled={pending}
      >
        {pending ? (
          <><Loader2 className="h-6 w-6 animate-spin mr-3" /> Leyendo y Analizando...</>
        ) : (
          <><UploadCloud className="h-6 w-6 mr-3 stroke-[3]" /> Seleccionar Examen PDF</>
        )}
      </Button>
    </div>
  );
};
