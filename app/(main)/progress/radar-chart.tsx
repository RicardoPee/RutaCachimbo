"use client";

import { useState, useEffect } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadarChart, ResponsiveContainer, Tooltip } from "recharts";

type RadarChartProps = {
  data: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
};

export const RadarChart = ({ data }: RadarChartProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[250px] bg-slate-50 dark:bg-slate-900/50 border border-border dark:border-slate-800 rounded-3xl animate-pulse" />
    );
  }

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
          <Radar
            name="Habilidades"
            dataKey="A"
            stroke="#10b981"
            fill="#34d399"
            fillOpacity={0.5}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};
