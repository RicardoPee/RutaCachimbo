import Image from "next/image";
import { getMascotSkinById } from "@/lib/powerups-catalog";
import { cn } from "@/lib/utils";

type Props = {
  skinId?: string | null;
  width?: number;
  height?: number;
  className?: string;
  showBadge?: boolean;
};

export const MascotAvatar = ({
  skinId = "default",
  width = 60,
  height = 60,
  className,
  showBadge = false,
}: Props) => {
  const skin = getMascotSkinById(skinId);

  return (
    <div className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
      {/* Container with skin aura */}
      <div 
        className={cn(
          "rounded-2xl p-1.5 border-2 transition-all duration-300 flex items-center justify-center relative overflow-hidden",
          skin.auraStyle,
          skin.bgGradient
        )}
      >
        {/* Special visual elements for specific skins */}
        {skin.id === "saiyan" && (
          <div className="absolute inset-0 bg-gradient-to-t from-amber-400/30 via-yellow-300/10 to-transparent animate-pulse pointer-events-none" />
        )}
        {skin.id === "cyber" && (
          <div className="absolute top-1 left-1 right-1 h-1 bg-cyan-400/60 blur-[1px] animate-pulse pointer-events-none" />
        )}

        <Image
          src="/mascot.svg"
          alt="Mascota Cachimbo"
          width={width}
          height={height}
          className={cn(
            "object-contain transition-transform duration-300 hover:scale-105 drop-shadow-md",
            skin.id === "cyber" && "hue-rotate-180 brightness-110",
            skin.id === "saiyan" && "brightness-125 contrast-110"
          )}
        />

        {/* Accessory icons overlaid */}
        {skin.id === "graduate" && (
          <span className="absolute -top-1 -right-1 text-base leading-none drop-shadow-md select-none">🎓</span>
        )}
        {skin.id === "cyber" && (
          <span className="absolute -top-1 -right-1 text-base leading-none drop-shadow-md select-none">🤖</span>
        )}
        {skin.id === "saiyan" && (
          <span className="absolute -top-1 -right-1 text-base leading-none drop-shadow-md select-none">🔥</span>
        )}
        {skin.id === "detective" && (
          <span className="absolute -top-1 -right-1 text-base leading-none drop-shadow-md select-none">🕵️</span>
        )}
      </div>

      {showBadge && (
        <span className="absolute -bottom-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-700 shadow-sm">
          {skin.name}
        </span>
      )}
    </div>
  );
};
