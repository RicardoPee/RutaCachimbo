import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Bot, Sparkles, BookOpen, FileText, ExternalLink } from "lucide-react";
import { AdminUploadPdfButton } from "./admin-upload-btn";
import { prisma } from "@/lib/prisma";

export default async function AdminUploadPage() {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    redirect("/");
  }

  const files = await prisma.pdfDocument.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full h-full animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border-2 border-border shadow-sm">
        <div className="flex items-center gap-x-4">
          <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-xl relative">
            <Bot className="w-8 h-8 text-fuchsia-500" />
            <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
              Gemini AI: Ingesta de PDF
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Sube exámenes de admisión en PDF y la IA generará automáticamente el curso.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Lado Izquierdo: Subida */}
        <div className="flex flex-col items-center justify-center bg-card rounded-3xl border-2 border-border p-8 shadow-sm">
          <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/20 rounded-full flex items-center justify-center mb-6 border-4 border-sky-200 dark:border-sky-800 border-dashed">
            <BookOpen className="w-10 h-10 text-sky-500" />
          </div>
          
          <h2 className="text-2xl font-extrabold text-neutral-800 dark:text-neutral-100 mb-4 text-center">
            Creador Inteligente
          </h2>
          
          <p className="text-slate-500 text-center max-w-md font-medium leading-relaxed mb-6 text-sm">
            La Inteligencia Artificial analizará todos los textos de comprensión lectora, detectará las preguntas, identificará la respuesta correcta y empaquetará todo en el sistema.
          </p>

          <AdminUploadPdfButton />

          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-xl w-full">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-500 text-center">
              ⚠️ Nota: No cierres la ventana tras seleccionar el archivo.
            </p>
          </div>
        </div>

        {/* Lado Derecho: Drive */}
        <div className="flex flex-col bg-card rounded-3xl border-2 border-border p-8 shadow-sm max-h-[600px] overflow-y-auto">
          <div className="flex items-center gap-3 mb-6 sticky top-0 bg-card pt-2 pb-4 z-10 border-b-2 border-slate-100 dark:border-border">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground">
              Archivos (Drive)
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {files.map((f) => (
              <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-background/50 border-2 border-border rounded-2xl p-4 hover:border-sky-500 dark:hover:border-sky-500 hover:-translate-y-1 transition-all cursor-pointer">
                  <div className="bg-rose-100 dark:bg-rose-900/30 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-neutral-700 dark:text-neutral-300 truncate group-hover:text-sky-500 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors shrink-0" />
                </div>
              </a>
            ))}

            {files.length === 0 && (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-3">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <p className="text-sm">No has subido ningún PDF aún.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
