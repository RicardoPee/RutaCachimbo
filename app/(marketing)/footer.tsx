import { Button } from "@/components/ui/button";
import { BookOpen, Calculator, FlaskConical, Globe2, Shapes } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
      <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full">
        <Button size="lg" variant="ghost" className="w-full text-blue-500 hover:text-blue-600 hover:bg-blue-50">
          <BookOpen className="w-6 h-6 mr-4" />
          Análisis de Textos
        </Button>
        <Button size="lg" variant="ghost" className="w-full text-green-500 hover:text-green-600 hover:bg-green-50">
          <Calculator className="w-6 h-6 mr-4 hidden" />
          <Shapes className="w-6 h-6 mr-4" />
          Razonamiento Verbal
        </Button>
        <Button size="lg" variant="ghost" className="w-full text-purple-500 hover:text-purple-600 hover:bg-purple-50">
          <FlaskConical className="w-6 h-6 mr-4 hidden" />
          <Globe2 className="w-6 h-6 mr-4" />
          Lectura Crítica
        </Button>
        <Button size="lg" variant="ghost" className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50">
          <BookOpen className="w-6 h-6 mr-4" />
          Ortografía y Gramática
        </Button>
        <Button size="lg" variant="ghost" className="w-full text-orange-500 hover:text-orange-600 hover:bg-orange-50">
          <BookOpen className="w-6 h-6 mr-4" />
          Comprensión Lectora
        </Button>
      </div>
    </footer>
  );
};
