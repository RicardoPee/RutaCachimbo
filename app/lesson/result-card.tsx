import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  value: number | string;
  variant: "points" | "hearts";
};

export const ResultCard = ({ value, variant }: Props) => {
  const imageSrc = variant === "hearts" ? "/heart.svg" : "/points.svg"; 

  return (
    <div className={cn(
      "rounded-3xl border-2 w-full shadow-lg overflow-hidden transition-all hover:scale-105",
      variant === "points" && "bg-amber-500 border-amber-400 dark:border-amber-600",
      variant === "hearts" && "bg-rose-500 border-rose-400 dark:border-rose-600",
    )}>
      <div className={cn(
        "p-2 text-white font-extrabold text-center uppercase text-xs tracking-wider",
        variant === "hearts" && "bg-rose-600",
        variant === "points" && "bg-amber-600"
      )}>
        {variant === "hearts" ? "Vidas Restantes" : "Puntos XP"}
      </div>
      <div className={cn(
        "bg-white dark:bg-slate-900 items-center flex justify-center p-6 font-black text-2xl lg:text-3xl",
        variant === "hearts" && "text-rose-500 dark:text-rose-400",
        variant === "points" && "text-amber-500 dark:text-amber-400"
      )}>
        <Image
          alt="Icon"
          src={imageSrc}
          height={36}
          width={36}
          className="mr-2 animate-pulse"
        />
        {value}
      </div>
    </div>
  );
};
