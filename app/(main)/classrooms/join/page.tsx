"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { School, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { joinClassroom } from "@/actions/classrooms";
import { useRouter } from "next/navigation";

export default function JoinClassroomPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      toast.error("Ingresa un código válido");
      return;
    }

    setLoading(true);
    const res = await joinClassroom(code);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("¡Te has unido al aula exitosamente!");
      router.push("/learn");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <div className="bg-white border-2 border-slate-200 p-8 rounded-3xl shadow-sm max-w-md w-full">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Unirse a un Aula</h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Si tu profesor te ha dado un código de invitación, ingrésalo aquí para acceder a sus simulacros y material privado.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Código de Invitación
            </label>
            <Input 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej. AB12CD"
              className="font-mono text-center text-2xl py-6 tracking-widest font-black uppercase border-2 focus:border-indigo-500"
              maxLength={10}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading || code.length < 4}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 text-lg"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>Ingresar al Aula <ArrowRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
