"use client"

import { motion, Variants } from "framer-motion"
import { Clock, BookOpen, ChevronRight, Trophy, Star, ShieldCheck, Copy } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Datos de prueba (Mock Data) centrados ESTRICTAMENTE en admisión universitaria
const EXAMS_DATA = [
  {
    university: "IA",
    fullName: "Motor de Simulacros Dinámicos",
    color: "from-sky-600 to-sky-400",
    exams: [
      { id: "ia-dynamic", title: "Simulacro Adaptativo", area: "Basado en PDFs", questions: 20, timeMin: 45, xp: 1000, difficulty: "Dinámico" },
    ]
  },
  {
    university: "UNMSM",
    fullName: "Universidad Nacional Mayor de San Marcos",
    color: "from-red-600 to-red-400",
    exams: [
      { id: "sm-2024-1", title: "Simulacro Tipo Admisión 2024-I", area: "Área A - Ciencias de la Salud", questions: 100, timeMin: 180, xp: 500, difficulty: "Difícil" },
      { id: "sm-2023-2", title: "Examen Pasado 2023-II", area: "Área C - Ingenierías", questions: 100, timeMin: 180, xp: 450, difficulty: "Medio" },
      { id: "sm-mini-1", title: "Mini Simulacro: Habilidad Verbal", area: "Todas las áreas", questions: 15, timeMin: 20, xp: 100, difficulty: "Fácil" },
    ]
  },
  {
    university: "UNI",
    fullName: "Universidad Nacional de Ingeniería",
    color: "from-slate-800 to-slate-600",
    exams: [
      { id: "uni-2024-mat", title: "Simulacro Matemática 2024", area: "Ingeniería", questions: 40, timeMin: 180, xp: 600, difficulty: "Extremo" },
      { id: "uni-2024-fis", title: "Simulacro Física y Química", area: "Ingeniería", questions: 40, timeMin: 180, xp: 600, difficulty: "Extremo" },
    ]
  },
  {
    university: "PUCP",
    fullName: "Pontificia Universidad Católica del Perú",
    color: "from-blue-700 to-blue-500",
    exams: [
      { id: "pucp-2024-talento", title: "Primera Opción / Talento 2024", area: "Todas las áreas", questions: 120, timeMin: 150, xp: 400, difficulty: "Medio" },
      { id: "pucp-redaccion", title: "Prueba de Redacción", area: "Todas las áreas", questions: 1, timeMin: 30, xp: 150, difficulty: "Medio" },
    ]
  }
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function Simulacros() {
  return (
    <div className="min-h-screen bg-muted/20 w-full pb-24 rounded-3xl">
      {/* Header Banner */}
      <div className="bg-slate-950 border-b-2 border-white/10 py-16 px-4 sm:px-6 lg:px-8 rounded-t-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950 z-0" />
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 mb-6 text-sm font-bold uppercase tracking-widest border border-indigo-500/30">
            <ShieldCheck className="w-4 h-4" /> Evaluación Rigurosa
          </div>
          <h1 className="font-bebas text-6xl md:text-8xl text-white mb-4 tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            CENTRO DE SIMULACROS
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium">
            Mide tus conocimientos. Entrena bajo condiciones reales, evalúa tu progreso y asegura tu vacante.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {EXAMS_DATA.map((uni, idx) => (
            <div key={idx} className="space-y-6">
              {/* University Section Header */}
              <motion.div variants={itemVariants} className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${uni.color} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                  {uni.university}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{uni.university}</h2>
                  <p className="text-muted-foreground font-medium">{uni.fullName}</p>
                </div>
              </motion.div>

              {/* Exams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uni.exams.map((exam, i) => (
                  <motion.div
                    variants={itemVariants}
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="relative bg-card border border-border rounded-2xl hover:border-indigo-500 transition-all flex flex-col group cursor-pointer overflow-hidden shadow-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/10 group-hover:from-indigo-500/5 transition-colors" />
                    
                    <div className="p-6 flex-1 relative z-10 flex flex-col items-center text-center">
                      <div className="flex justify-between items-center w-full mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-950 px-3 py-1 border border-slate-800">
                          {exam.area}
                        </span>
                        <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-sm">
                          <Star className="w-4 h-4 fill-yellow-500" />
                          +{exam.xp} XP
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-500 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <BookOpen className="w-6 h-6" />
                      </div>

                      <h3 className="text-xl font-black mb-4 text-foreground group-hover:text-indigo-500 transition-colors uppercase tracking-wide">
                        {exam.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 mt-auto font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          {exam.questions} Pregs
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {exam.timeMin} min
                        </div>
                        <div className="flex items-center gap-1.5 text-indigo-500">
                          <Trophy className="w-4 h-4" />
                          {exam.difficulty}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-border bg-muted/50 flex flex-col sm:flex-row items-center justify-between gap-4 group-hover:bg-indigo-500/10 transition-colors relative z-10">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const url = `${window.location.origin}/simulacros/play?uni=${exam.id}&pvp=true`;
                          navigator.clipboard.writeText(url);
                          toast.success("¡Enlace de duelo copiado! Envíalo a un amigo.");
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Copy className="w-5 h-5" /> Retar Amigo
                      </button>
                      <Link
                        href={`/simulacros/play?uni=${exam.id}`}
                        className={`w-full sm:w-auto px-6 py-2 flex items-center justify-center gap-2 font-black uppercase tracking-widest hover:gap-3 transition-all ${exam.id === "ia-dynamic" ? "text-sky-500 bg-sky-500/10 hover:bg-sky-500/20" : "text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20"} rounded-xl`}
                      >
                        Iniciar
                        <ChevronRight className="w-6 h-6" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
