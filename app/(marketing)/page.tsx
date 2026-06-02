"use client"

import { motion, Variants } from "framer-motion"
import { ArrowRight, Brain, Target, Trophy, Sparkles, BookOpen, Clock, Users, Loader } from "lucide-react"
import Link from "next/link"
import { 
  ClerkLoaded, 
  ClerkLoading, 
  SignInButton, 
  SignUpButton, 
  SignedIn, 
  SignedOut
} from "@clerk/nextjs";
import { Countdown } from "@/components/countdown";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <div className="flex flex-col items-center justify-center w-full relative overflow-hidden flex-1">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-500/30 dark:bg-green-500/20 blur-[120px] -z-10 animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/30 dark:bg-blue-500/20 blur-[120px] -z-10 animate-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/30 dark:bg-purple-500/20 blur-[100px] -z-10 animate-blob" style={{ animationDelay: '4s' }} />

      {/* Hero Section */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 mb-8">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-foreground">La nueva forma de prepararte para la universidad</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-bebas text-6xl md:text-8xl tracking-tight mb-2 text-neutral-800 dark:text-neutral-100 uppercase">
            Ingresar a la <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 animate-gradient-x bg-[length:200%_auto]">Universidad</span>
            <br />nunca fue tan épico
          </motion.h1>

          <motion.div variants={itemVariants} className="my-8 w-full max-w-xl mx-auto p-6 rounded-3xl glass border border-white/10 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
             <h3 className="font-bebas text-xl md:text-2xl mb-4 text-yellow-500/80 tracking-widest uppercase">Próximo Examen de Admisión</h3>
             {/* Target date set to 1.5 years approximately for demo */}
             <Countdown targetDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1, new Date().getMonth() + 6))} />
          </motion.div>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl font-bold">
            Ruta Cachimbo transforma tu preparación en el evento del año. Realiza simulacros, completa misiones, sube de nivel y asegura tu vacante.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <ClerkLoading>
              <div className="flex justify-center w-full sm:w-auto px-8 py-4">
                <Loader className="h-6 w-6 text-neutral-400 animate-spin" />
              </div>
            </ClerkLoading>
            
            <ClerkLoaded>
              <SignedOut>
                <SignUpButton
                  mode="modal"
                  afterSignInUrl="/learn"
                  afterSignUpUrl="/learn"
                >
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white bg-green-500 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)]">
                    Comenzar mi Entrenamiento
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/learn"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white bg-green-500 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)]"
                >
                  Ir al Panel de Estudiante
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </SignedIn>
            </ClerkLoaded>

            <Link
              href="/simulacros"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-foreground bg-card border-2 border-neutral-200 dark:border-slate-700 rounded-full transition-all hover:border-green-500/50 hover:bg-neutral-50 dark:hover:bg-slate-800"
            >
              Ver Simulacros Gratis
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats/Gamification Teaser */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-y border-border bg-neutral-50/50 dark:bg-slate-800/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "+10k", label: "Preguntas tipo Admisión" },
            { value: "50+", label: "Simulacros Reales" },
            { value: "100%", label: "Temarios Actualizados" },
            { value: "Lvl UP", label: "Sistema de Niveles" },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="flex flex-col gap-2"
            >
              <h3 className="text-4xl font-black text-neutral-800 dark:text-neutral-100">{stat.value}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center">
        <div className="text-center mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-neutral-800 dark:text-neutral-100">Todo lo que necesitas para tu ingreso</h2>
          <p className="text-muted-foreground text-lg">Tu preparación guiada paso a paso. Deja de estudiar a ciegas y empieza a dominar los temas que realmente vienen en el examen.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full">
          {[
            {
              title: "Simulacros con Tiempo",
              description: "Entrena bajo presión con nuestro reloj interactivo. Exámenes pasados de UNMSM, UNI, PUCP y más.",
              icon: Clock,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20"
            },
            {
              title: "Rutas de Aprendizaje",
              description: "Temarios desbloqueables. Empieza por lo básico y avanza hasta nivel Dios en cada curso.",
              icon: Target,
              color: "text-green-500",
              bg: "bg-green-500/10",
              border: "border-green-500/20"
            },
            {
              title: "Analíticas y Estadísticas",
              description: "Descubre tus puntos débiles. Te decimos exactamente qué temas repasar antes del gran día.",
              icon: Brain,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
              border: "border-orange-500/20"
            },
            {
              title: "Sube de Nivel (XP)",
              description: "Gana experiencia por cada pregunta correcta. Compite en el ranking global de cachimbos.",
              icon: Trophy,
              color: "text-yellow-500",
              bg: "bg-yellow-500/10",
              border: "border-yellow-500/20"
            },
            {
              title: "Flashcards Interactivas",
              description: "Memoriza fórmulas y fechas históricas de forma rápida con nuestro sistema de repetición espaciada.",
              icon: BookOpen,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20"
            },
            {
              title: "Comunidad de Apoyo",
              description: "No estás solo. Resuelve dudas difíciles junto a miles de postulantes en todo el país.",
              icon: Users,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
              border: "border-purple-500/20"
            }
          ].map((feature, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.2, delay: i * 0.1 }}
              key={i}
              className={`p-6 rounded-3xl border ${feature.border} glass-card hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] transition-all flex flex-col items-start gap-4 group relative overflow-hidden`}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className={`p-4 rounded-2xl ${feature.bg}`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full py-8 border-t border-border mt-auto text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Ruta Cachimbo. Todos los derechos reservados para los futuros universitarios.</p>
      </footer>
    </div>
  )
}
