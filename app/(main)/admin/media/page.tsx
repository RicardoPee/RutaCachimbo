"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FolderUp, Copy, Check, FileAudio, FileImage, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaFile {
  url: string;
  name: string;
  isImage: boolean;
}

export default function MediaManagerPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Reset input
      e.target.value = '';
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("URL Copiada", { description: "Pega este link en tu formulario de cursos o preguntas" });
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border-2 border-border shadow-sm">
        <div className="flex items-center gap-x-4">
          <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-xl">
            <FolderUp className="w-8 h-8 text-fuchsia-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
              Gestor de Archivos
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Sube audios, banderas o imágenes para usarlos en tus cursos y lecciones.
            </p>
          </div>
        </div>
        
        <div className="relative overflow-hidden group">
          <Button disabled={isUploading} size="lg" className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white border-b-4 border-fuchsia-600 active:border-b-0 transition-all rounded-xl relative z-10 w-[180px]">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <FolderUp className="w-5 h-5 mr-2 stroke-[3]" />
            )}
            {isUploading ? "Subiendo..." : "Subir Archivo"}
          </Button>
          <input
            type="file"
            accept="image/*,audio/*"
            disabled={isUploading}
            onChange={handleUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-20"
          />
        </div>
      </div>

      <div className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-sm p-6 min-h-[400px]">
        {isLoading ? (
          <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-fuchsia-500" />
            <p className="font-bold">Cargando archivos...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-border rounded-2xl">
            <FolderUp className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">No tienes archivos subidos</h3>
            <p className="text-sm font-medium">Sube una imagen o un audio para verlos aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {files.map((file) => (
              <div key={file.name} className="flex flex-col group border-2 border-border rounded-2xl overflow-hidden hover:border-fuchsia-500 transition-colors">
                <div className="h-32 w-full bg-slate-50 dark:bg-background/50 flex items-center justify-center relative p-4">
                  {file.isImage ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-contain drop-shadow-md" />
                  ) : (
                    <FileAudio className="w-16 h-16 text-slate-300" />
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      size="sm"
                      onClick={() => copyToClipboard(file.url)}
                      className={`${copiedUrl === file.url ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600' : 'bg-fuchsia-500 hover:bg-fuchsia-600 border-fuchsia-600'} text-white border-b-4 active:border-b-0 rounded-xl font-bold`}
                    >
                      {copiedUrl === file.url ? (
                        <><Check className="w-4 h-4 mr-2 stroke-[3]" /> Copiado</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-2 stroke-[3]" /> Copiar URL</>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-card border-t-2 border-border">
                  <p className="text-xs font-bold text-foreground truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 font-bold">
                    {file.isImage ? "Imagen" : "Audio"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
