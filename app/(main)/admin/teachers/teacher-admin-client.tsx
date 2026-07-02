"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { approveApplication, rejectApplication } from "@/actions/teacher-applications";
import { useRouter } from "next/navigation";

export const TeacherAdminClient = ({ applications }: { applications: any[] }) => {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleApprove = async (id: number, userId: string) => {
    if (!confirm("¿Aprobar y otorgar permisos de profesor a este usuario?")) return;
    setLoadingId(id);
    const res = await approveApplication(id, userId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Profesor aprobado exitosamente");
      router.refresh();
      setTimeout(() => window.location.reload(), 500);
    }
    setLoadingId(null);
  };

  const handleReject = async (id: number) => {
    if (!confirm("¿Rechazar esta solicitud?")) return;
    setLoadingId(id);
    const res = await rejectApplication(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Solicitud rechazada");
      router.refresh();
      setTimeout(() => window.location.reload(), 500);
    }
    setLoadingId(null);
  };

  const pendingApps = applications.filter(a => a.status === "PENDING");
  const otherApps = applications.filter(a => a.status !== "PENDING");

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden">
      <div className="p-6 border-b-2 border-slate-100 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">Solicitudes Pendientes ({pendingApps.length})</h2>
      </div>
      
      <div className="divide-y-2 divide-slate-100">
        {pendingApps.map(app => (
          <div key={app.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xl">
                {app.user?.userName?.[0] || "?"}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{app.user?.userName || "Usuario Desconocido"}</h3>
                <p className="text-sm text-slate-500 font-medium font-mono text-xs mt-1">ID: {app.userId}</p>
                <div className="mt-2">
                  <a href={app.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-bold bg-indigo-50 px-3 py-1 rounded-full">
                    <ExternalLink className="w-3 h-3 mr-1" /> Ver Prueba / CV
                  </a>
                </div>
                {app.description && (
                  <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic">
                    &ldquo;{app.description}&rdquo;
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
              <Button 
                onClick={() => handleApprove(app.id, app.userId)} 
                disabled={loadingId === app.id}
                className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {loadingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />} Aprobar
              </Button>
              <Button 
                onClick={() => handleReject(app.id)} 
                disabled={loadingId === app.id}
                variant="dangerOutline"
                className="flex-1 md:flex-none"
              >
                {loadingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />} Rechazar
              </Button>
            </div>
          </div>
        ))}
        {pendingApps.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-medium">
            No hay solicitudes pendientes en este momento.
          </div>
        )}
      </div>

      {otherApps.length > 0 && (
        <>
          <div className="p-6 border-y-2 border-slate-100 bg-slate-50 mt-8">
            <h2 className="text-xl font-bold text-slate-800">Historial Reciente</h2>
          </div>
          <div className="divide-y divide-slate-100 opacity-70">
            {otherApps.map(app => (
              <div key={app.id} className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs">
                    {app.user?.userName?.[0] || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 text-sm">{app.user?.userName}</h3>
                  </div>
                </div>
                <div>
                  <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded ${app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {app.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
