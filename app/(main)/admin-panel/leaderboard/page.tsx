import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { FinishWeekButton } from "./finish-week-btn";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const AdminLeaderboardPage = async () => {
  if (!isAdmin()) {
    redirect("/");
  }

  return (
    <div className="max-w-[912px] px-3 mx-auto mt-6">
      <div className="flex flex-col gap-4 mb-8">
        <Link href="/admin-panel" className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center font-bold">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-neutral-700 dark:text-neutral-200">
          Gestión de Clasificación
        </h1>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
        <h2 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 mb-2">Finalizar Semana</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
          Al presionar este botón, se evaluarán los puntos semanales de todos los usuarios.
          Los 10 mejores ascenderán a la siguiente liga, y los últimos 10 descenderán.
          Después, todos los puntos semanales volverán a cero.
        </p>
        <FinishWeekButton />
      </div>
    </div>
  );
};

export default AdminLeaderboardPage;
