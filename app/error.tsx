"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <Image
        src="/mascot_bad.svg"
        alt="Mascota con problemas"
        width={120}
        height={120}
      />
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold">Algo salió mal</h2>
        <p className="text-muted-foreground">
          Ocurrió un error inesperado. Puedes intentarlo de nuevo; si el problema persiste, vuelve en unos minutos.
        </p>
      </div>
      <Button onClick={reset} variant="secondary" size="lg">
        Intentar de nuevo
      </Button>
    </div>
  );
}
