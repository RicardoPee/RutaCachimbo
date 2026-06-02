"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const ReportChart = ({ correct, incorrect, blank }: { correct: number, incorrect: number, blank: number }) => {
  const data = [
    { name: 'Correctas', value: correct, color: '#10b981' }, // Emerald-500
    { name: 'Incorrectas', value: incorrect, color: '#f43f5e' }, // Rose-500
    { name: 'En Blanco', value: blank, color: '#94a3b8' }, // Slate-400
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">Sin datos para graficar</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '16px', border: '2px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
          itemStyle={{ fontWeight: 'bold' }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          wrapperStyle={{ fontWeight: 'bold', fontSize: '14px', paddingTop: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
