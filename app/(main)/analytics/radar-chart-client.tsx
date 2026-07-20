"use client";

import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Bot, Activity, BrainCircuit, Loader2 } from "lucide-react";
import { generatePerformanceAnalysis } from "@/actions/analytics-actions";
import { toast } from "sonner";

const MOCK_DATA = [
  { subject: "Matemáticas", A: 85, fullMark: 100 },
  { subject: "Letras", A: 90, fullMark: 100 },
  { subject: "Ciencias", A: 65, fullMark: 100 },
  { subject: "R. Verbal", A: 75, fullMark: 100 },
  { subject: "R. Lógico", A: 80, fullMark: 100 },
];

export const RadarChartClient = ({ hasHistory }: { hasHistory: boolean }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDiagnosis = async () => {
    setIsLoading(true);
    setDiagnosis(null);
    try {
      const res = await generatePerformanceAnalysis();
      if (res.error) toast.error(res.error);
      else setDiagnosis(res.diagnosis!);
    } catch (e) {
      toast.error("Ocurrió un error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Chart Card */}
      <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/2 h-[350px]">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={hasHistory ? MOCK_DATA : MOCK_DATA.map(d => ({...d, A: 20}))}>
                <PolarGrid className="stroke-neutral-300 dark:stroke-slate-700" />
                <PolarAngleAxis dataKey="subject" className="text-xs font-bold fill-neutral-600 dark:fill-slate-400" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  itemStyle={{ color: "#3b82f6", fontWeight: "bold" }}
                />
                <Radar
                  name="Tu Nivel"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                  className="animate-pulse"
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl animate-pulse" />
          )}
        </div>
        <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
          <h2 className="text-2xl font-black text-neutral-800 dark:text-neutral-100 flex items-center justify-center md:justify-start gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            Escáner de Rendimiento
          </h2>
          <p className="text-neutral-500 font-medium">
            Este gráfico muestra tu rendimiento académico consolidado en base a tus últimos simulacros.
            Identifica áreas de mejora para potenciar tu preparación.
          </p>
        </div>
      </div>

      {/* AI Performance Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-1 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="bg-slate-950/40 backdrop-blur-xl rounded-[22px] p-8 relative z-10 text-white flex flex-col items-center">
          
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <BrainCircuit className="w-10 h-10 text-indigo-300" />
          </div>

          <h3 className="text-3xl font-extrabold mb-2 text-center">Análisis de Rendimiento Académico con IA</h3>
          <p className="text-indigo-200 mb-8 max-w-xl text-center text-base md:text-lg">
            Analiza tus resultados a profundidad. Nuestro motor de Inteligencia Artificial evaluará tu rendimiento e identificará oportunidades de mejora con un plan personalizado.
          </p>

          {!diagnosis && !isLoading && (
            <button
              onClick={handleDiagnosis}
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center gap-2"
            >
              <BrainCircuit className="w-6 h-6" />
              Generar Análisis de Rendimiento
            </button>
          )}

          {isLoading && (
            <div className="flex flex-col items-center text-indigo-300 gap-4">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-bold animate-pulse">Procesando tus estadísticas de simulacro...</p>
            </div>
          )}

          {diagnosis && (
            <div className="w-full bg-black/40 border border-indigo-500/30 rounded-2xl p-6 text-left relative mt-4">
              <Bot className="w-8 h-8 text-indigo-400 absolute top-6 right-6 opacity-50" />
              <div className="prose prose-invert prose-p:text-indigo-50 prose-p:leading-relaxed max-w-none font-medium whitespace-pre-wrap">
                {diagnosis}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
