"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { 
  FolderUp, Copy, Check, FileAudio, FileImage, FileText, Loader2, 
  Sparkles, UploadCloud, CheckCircle2, XCircle, Trash2, CheckSquare, 
  HelpCircle, ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { parsePdfWithAI, saveReviewedContent } from "@/actions/upload-pdf";

interface MediaFile {
  url: string;
  name: string;
  isImage: boolean;
  type?: string;
}

export default function UnifiedMediaManagerPage() {
  const [activeTab, setActiveTab] = useState<"library" | "ai">("library");
  
  // Library State
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // AI Ingestor State
  const [pending, startTransition] = useTransition();
  const [parsedData, setParsedData] = useState<any>(null);

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/media/list");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error("Failed to load files", error);
    } finally {
      setIsLibraryLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Upload to Cloudinary Library
  const handleLibraryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      toast.success("Archivo subido con éxito", {
        description: data.url
      });
      fetchFiles(); // Refresh list
    } catch (error) {
      toast.error("Error", { description: "No se pudo subir el archivo" });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("URL Copiada", { description: "Link de recurso copiado al portapapeles" });
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Trigger Gemini AI parsing from local file upload
  const handleAiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    triggerGeminiParsing(formData);
  };

  // Helper to trigger Gemini parsing
  const triggerGeminiParsing = (formData: FormData) => {
    startTransition(() => {
      toast.info("Iniciando análisis inteligente con Gemini AI...", { duration: 3000 });
      parsePdfWithAI(formData)
        .then((res) => {
          if (res?.error) {
            toast.error(res.error, { duration: 6000 });
          } else if (res?.success && res.data) {
            setParsedData(res.data);
            toast.success("PDF procesado por la IA. Revisa e ingresa el material.", { duration: 4000 });
          }
        })
        .catch(() => toast.error("Error crítico al procesar el PDF."));
    });
  };

  // Download a PDF from the library and send it to Gemini
  const handleProcessExistingPdf = async (url: string, name: string) => {
    try {
      toast.info("Descargando PDF de la biblioteca para procesamiento con IA...", { duration: 3000 });
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], name, { type: "application/pdf" });
      
      const formData = new FormData();
      formData.append("pdf", file);
      
      setActiveTab("ai");
      triggerGeminiParsing(formData);
    } catch (error) {
      console.error(error);
      toast.error("Error al descargar el PDF de la biblioteca.");
    }
  };

  const togglePassage = (pIndex: number) => {
    const newData = { ...parsedData };
    const p = newData.passages[pIndex];
    p.included = !p.included;
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
            setParsedData(null); // Reset
            setActiveTab("library");
            fetchFiles(); // Refresh list to see the drive entry
          }
        })
        .catch(() => toast.error("Error al guardar en la base de datos."));
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full h-full animate-in fade-in zoom-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-6 rounded-2xl border-2 border-border shadow-sm gap-4">
        <div className="flex items-center gap-x-4">
          <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-xl">
            <FolderUp className="w-8 h-8 text-fuchsia-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
              Biblioteca y Contenido IA
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Sube tus recursos multimedia o procesa exámenes en PDF con Inteligencia Artificial.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "library" ? "bg-white dark:bg-slate-900 shadow text-neutral-800 dark:text-neutral-100" : "text-neutral-500 hover:text-neutral-700"}`}
          >
            📁 Biblioteca
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "ai" ? "bg-white dark:bg-slate-900 shadow text-neutral-800 dark:text-neutral-100" : "text-neutral-500 hover:text-neutral-700"}`}
          >
            🤖 Ingesta IA {parsedData && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "library" ? (
        <div className="space-y-6">
          {/* Upload Area for Library */}
          <div className="flex flex-col items-center justify-center bg-card rounded-3xl border-2 border-dashed border-border p-8 shadow-sm">
            <div className="w-16 h-16 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-full flex items-center justify-center mb-4 border border-fuchsia-200 dark:border-fuchsia-800">
              <FolderUp className="w-8 h-8 text-fuchsia-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-1">Cargar Nuevos Recursos</h2>
            <p className="text-sm text-neutral-400 mb-4 text-center max-w-sm">Sube imágenes para los cursos, audios para las lecturas o exámenes en PDF.</p>
            
            <div className="relative overflow-hidden group">
              <Button disabled={isUploading} size="lg" className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white border-b-4 border-fuchsia-600 active:border-b-0 transition-all rounded-xl relative z-10 w-[200px]">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <FolderUp className="w-5 h-5 mr-2 stroke-[3]" />
                )}
                {isUploading ? "Subiendo..." : "Subir Archivo"}
              </Button>
              <input
                type="file"
                accept="image/*,audio/*,application/pdf"
                disabled={isUploading}
                onChange={handleLibraryUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
            </div>
          </div>

          {/* Media Grid */}
          <div className="bg-card rounded-3xl border-2 border-border shadow-sm p-6 min-h-[300px]">
            {isLibraryLoading ? (
              <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-fuchsia-500" />
                <p className="font-bold">Cargando biblioteca...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400">
                <FolderUp className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="font-bold text-lg mb-2">No tienes archivos en tu biblioteca</h3>
                <p className="text-sm font-medium">Sube una imagen, audio o PDF para listarlos aquí.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {files.map((file) => {
                  const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "documento";
                  return (
                    <div key={file.name} className="flex flex-col group border-2 border-border rounded-2xl overflow-hidden hover:border-fuchsia-500 transition-colors bg-slate-50/20 dark:bg-background/20">
                      <div className="h-32 w-full bg-slate-50 dark:bg-background/40 flex items-center justify-center relative p-4">
                        {file.isImage ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-contain drop-shadow-md" />
                        ) : isPdf ? (
                          <FileText className="w-16 h-16 text-rose-400" />
                        ) : (
                          <FileAudio className="w-16 h-16 text-blue-400" />
                        )}
                        
                        {/* Overlays */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <Button 
                            size="sm"
                            onClick={() => copyToClipboard(file.url)}
                            className={`w-full ${copiedUrl === file.url ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600' : 'bg-fuchsia-500 hover:bg-fuchsia-600 border-fuchsia-600'} text-white border-b-4 active:border-b-0 rounded-xl font-bold text-xs`}
                          >
                            {copiedUrl === file.url ? (
                              <><Check className="w-3.5 h-3.5 mr-1.5 stroke-[3]" /> Copiado</>
                            ) : (
                              <><Copy className="w-3.5 h-3.5 mr-1.5 stroke-[3]" /> Copiar URL</>
                            )}
                          </Button>

                          {isPdf && (
                            <Button 
                              size="sm"
                              variant="secondary"
                              onClick={() => handleProcessExistingPdf(file.url, file.name)}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-b-4 border-indigo-700 active:border-b-0 rounded-xl font-bold text-xs flex items-center justify-center"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" /> Procesar IA
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="p-3 bg-card border-t-2 border-border">
                        <p className="text-xs font-bold text-foreground truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 font-bold">
                          {file.isImage ? "Imagen" : isPdf ? "PDF Documento" : "Audio"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gemini AI PDF Processor Area */}
          {parsedData ? (
            <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
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
                    
                    {/* Header */}
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

                    {/* Questions Grid */}
                    {passage.included && (
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-background/20">
                        {passage.questions.map((q: any, qIndex: number) => (
                          <div key={qIndex} className={`flex flex-col bg-card border-2 rounded-2xl p-5 relative transition-all ${q.included ? 'border-sky-200 dark:border-sky-900 shadow-sm' : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10'}`}>
                            
                            {/* Floating Checkbox */}
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
          ) : (
            <div className="flex flex-col items-center justify-center bg-card rounded-3xl border-2 border-border p-8 shadow-sm max-w-2xl mx-auto w-full">
              <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/20 rounded-full flex items-center justify-center mb-6 border-4 border-sky-200 dark:border-sky-800 border-dashed animate-pulse">
                <Sparkles className="w-10 h-10 text-sky-500" />
              </div>
              
              <h2 className="text-2xl font-extrabold text-neutral-800 dark:text-neutral-100 mb-2 text-center">
                Generador de Lecciones Inteligente
              </h2>
              
              <p className="text-slate-500 text-center max-w-md font-medium leading-relaxed mb-8 text-sm">
                La IA de Gemini analizará los textos en el PDF, detectará preguntas, clasificará alternativas y creará las lecciones del curso de forma automática.
              </p>

              <div className="relative w-full max-w-sm">
                <input 
                  type="file" 
                  accept="application/pdf"
                  disabled={pending}
                  onChange={handleAiUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button 
                  size="lg" 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white border-b-4 border-sky-600 active:border-b-0 transition-all rounded-2xl h-16 text-lg font-bold"
                  disabled={pending}
                >
                  {pending ? (
                    <><Loader2 className="h-6 w-6 animate-spin mr-3" /> Analizando PDF...</>
                  ) : (
                    <><UploadCloud className="h-6 w-6 mr-3 stroke-[3]" /> Seleccionar PDF Local</>
                  )}
                </Button>
              </div>

              <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-xl w-full text-xs text-amber-700 dark:text-amber-500 font-bold flex gap-2 items-center justify-center">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Nota: El procesamiento puede demorar hasta 30 segundos debido al análisis lector.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
