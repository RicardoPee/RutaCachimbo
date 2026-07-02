import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <Image
        src="/mascot_sad.svg"
        alt="Mascota confundida"
        width={120}
        height={120}
        className="grayscale-[30%]"
      />
      <h1 className="font-bebas text-6xl md:text-7xl text-foreground">404</h1>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold">Página no encontrada</h2>
        <p className="text-muted-foreground">
          Parece que esta lectura no está en el temario. Vuelve al mapa y sigue avanzando hacia tu vacante.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/learn">
          <Button variant="secondary" size="lg">Ir al Temario</Button>
        </Link>
        <Link href="/">
          <Button variant="primaryOutline" size="lg">Ir al Inicio</Button>
        </Link>
      </div>
    </div>
  );
}
