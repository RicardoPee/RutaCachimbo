import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import db from "@/db/drizzle";
import { teacherApplications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ActionButtons } from "./action-buttons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const AdminTeachersPage = async () => {
  if (!isAdmin()) {
    redirect("/");
  }

  const applications = await db.query.teacherApplications.findMany({
    where: eq(teacherApplications.status, "PENDING"),
    with: {
      user: true,
    },
  });

  return (
    <div className="max-w-[912px] px-3 mx-auto mt-6">
      <div className="flex flex-col gap-4 mb-8">
        <Link href="/admin-panel" className="text-neutral-500 hover:text-neutral-700 flex items-center font-bold">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-neutral-700">
          Solicitudes de Profesores
        </h1>
      </div>

      {applications.length === 0 ? (
        <p className="text-neutral-500 bg-white p-6 rounded-xl border-2 border-slate-200">No hay solicitudes pendientes.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white border-2 border-slate-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-neutral-800">{app.user.userName}</h3>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-mono">{app.userId}</span>
                </div>
                <p className="text-sm text-neutral-600 mb-2">
                  <span className="font-bold">Motivo:</span> {app.description}
                </p>
                <a 
                  href={app.proofUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-500 hover:underline text-sm font-bold"
                >
                  Ver Evidencia (Drive/URL)
                </a>
              </div>
              <ActionButtons applicationId={app.id} userId={app.userId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTeachersPage;
