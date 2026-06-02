import Link from "next/link";
import { Database, BookOpen, Layers, Swords, Target } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto">
      <nav className="flex items-center gap-2 mb-6 border-b-2 border-border pb-4 overflow-x-auto">
        <Link href="/admin/courses" className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
          <Database className="w-4 h-4" /> Cursos
        </Link>
        <Link href="/admin/units" className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
          <BookOpen className="w-4 h-4" /> Unidades
        </Link>
        <Link href="/admin/lessons" className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
          <Layers className="w-4 h-4" /> Lecciones
        </Link>
        <Link href="/admin/challenges" className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
          <Swords className="w-4 h-4" /> Retos
        </Link>
        <Link href="/admin/factions" className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
          <Target className="w-4 h-4" /> Facciones
        </Link>
        <Link href="/admin/wars" className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
          <Swords className="w-4 h-4" /> Guerras
        </Link>
        <Link href="/admin/teachers" className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
          <BookOpen className="w-4 h-4" /> Profesores
        </Link>
      </nav>
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
