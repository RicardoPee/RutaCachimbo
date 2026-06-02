import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { WarAdminClient } from "./war-admin-client";

export default async function AdminWarsPage() {
  const { userId } = auth();
  const adminId = process.env.ADMIN_USER_ID;

  if (userId !== adminId) {
    redirect("/");
  }

  const tournaments = await prisma.liveTournament.findMany({
    orderBy: { startTime: "desc" },
    include: {
      _count: {
        select: { participants: true, questions: true }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Centro de Mando: Guerras</h1>
          <p className="text-slate-500">Administra los eventos multijugador masivos.</p>
        </div>
        <WarAdminClient />
      </div>

      <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 border-b-2 border-slate-200 text-slate-500 font-bold uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4">Torneo</th>
              <th className="p-4">Inicio Programado</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Preguntas</th>
              <th className="p-4">Jugadores (Top)</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tournaments.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-800">{t.title}</td>
                <td className="p-4 text-slate-600">
                  {new Date(t.startTime).toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                    t.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    t.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-4 text-slate-600 font-medium">{t._count.questions}</td>
                <td className="p-4 text-slate-600 font-medium">{t._count.participants}</td>
                <td className="p-4">
                  <a href={`/admin/wars/${t.id}`} className="text-indigo-600 hover:text-indigo-800 font-bold">
                    Editar Preguntas
                  </a>
                </td>
              </tr>
            ))}
            {tournaments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                  No hay torneos programados. Crea uno nuevo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
