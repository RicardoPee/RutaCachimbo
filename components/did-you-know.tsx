"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const TIPS = [
  "Leer 20 minutos al día mejora tu comprensión y velocidad de lectura enormemente.",
  "La lectura crítica te permite no solo entender, sino también cuestionar y analizar los textos.",
  "Las inferencias son conclusiones lógicas basadas en la evidencia del texto. ¡Son clave en los exámenes de admisión!",
  "El amor propio y la confianza son fundamentales para el éxito académico. ¡Cree en ti!",
  "Subrayar o tomar notas breves mientras lees ayuda a retener la información importante.",
  "Identificar la idea principal en el primer párrafo te ahorrará mucho tiempo en exámenes.",
  "Los textos literarios suelen estar llenos de figuras retóricas, como metáforas y símiles.",
  "En un texto argumentativo, siempre busca la tesis principal del autor.",
];

export const DidYouKnow = () => {
  const [tip, setTip] = useState(TIPS[0]);

  useEffect(() => {
    // Escoger un tip aleatorio al montar el componente
    const randomIndex = Math.floor(Math.random() * TIPS.length);
    setTip(TIPS[randomIndex]);

    // Cambiar de tip cada 15 segundos
    const interval = setInterval(() => {
      const nextIndex = Math.floor(Math.random() * TIPS.length);
      setTip(TIPS[nextIndex]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-2 rounded-2xl border-neutral-200 p-4 space-y-4">
      <div className="flex items-center justify-between w-full space-y-2">
        <h3 className="font-bold text-lg">💡 ¿Sabías qué?</h3>
      </div>
      <div className="flex flex-col gap-y-3">
        <div className="flex items-start gap-x-3">
          <div className="w-10 h-10 shrink-0">
            <Image
              src="/mascot.svg"
              alt="Mascot"
              height={40}
              width={40}
              className="animate-float"
            />
          </div>
          <p className="text-sm text-neutral-500 font-medium leading-tight">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
};
