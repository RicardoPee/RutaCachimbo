"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { POINTS_TO_REFILL } from "@/constants";
import { refillHearts } from "@/actions/user-progress";
import { createStripeUrl } from "@/actions/user-subscription";
import { buyStreakFreeze, buyXpBooster, buyBorder, equipBorder } from "@/actions/shop-actions";
import { buyChest, openChest } from "@/actions/gacha-actions";
import { Snowflake, Zap, Flame, Crown, ShieldAlert, PackageOpen, Sparkles } from "lucide-react";

type Props = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
  streak: number;
  streakFreeze?: boolean;
  xpBoosterEndsAt?: Date | null;
  ownedBorders?: string[];
  activeBorder?: string | null;
};

export const Items = ({
  hearts,
  points,
  hasActiveSubscription,
  streak,
  streakFreeze,
  xpBoosterEndsAt,
  ownedBorders = [],
  activeBorder,
}: Props) => {
  const [pending, startTransition] = useTransition();

  const onRefillHearts = () => {
    if (pending || hearts === 5 || points < POINTS_TO_REFILL) return;
    startTransition(() => {
      refillHearts().catch(() => toast.error("Ocurrió un error"));
    });
  };

  const [chestOpening, setChestOpening] = useState(false);
  const [chestReward, setChestReward] = useState<string | null>(null);
  const [chestTypeOpened, setChestTypeOpened] = useState<"COMUN" | "RARO" | "EPICO" | null>(null);

  const onBuyAndOpenChest = (type: "COMUN" | "RARO" | "EPICO", price: number) => {
    if (pending || points < price) {
      toast.error("No tienes puntos suficientes para este cofre.");
      return;
    }
    setChestTypeOpened(type);
    setChestOpening(true);
    setChestReward(null);

    startTransition(() => {
      buyChest(type).then((res) => {
        if (res.error) {
          toast.error(res.error);
          setChestOpening(false);
        } else if (res.chestId) {
           openChest(res.chestId).then((openRes) => {
             if (openRes.error) {
                toast.error(openRes.error);
                setChestOpening(false);
             } else {
                // Wait for animation to finish before showing reward
                setTimeout(() => {
                  setChestReward(openRes.rewardValue || "Nada");
                  // Force a hard refresh to get the new borders applied
                  setTimeout(() => window.location.reload(), 3000);
                }, 2000);
             }
           });
        }
      });
    });
  };

  const onUpgrade = () => {
    startTransition(() => {
      createStripeUrl()
        .then((response) => {
          if (response.data) window.location.href = response.data;
        })
        .catch(() => toast.error("Ocurrió un error"));
    });
  };

  const onBuyStreakFreeze = () => {
    if (pending || points < 200 || streakFreeze) return;
    startTransition(() => {
      buyStreakFreeze()
        .then(() => toast.success("¡Racha protegida!"))
        .catch((err) => toast.error(err.message || "Ocurrió un error"));
    });
  };

  const onBuyXpBooster = () => {
    if (pending || points < 500) return;
    startTransition(() => {
      buyXpBooster()
        .then(() => toast.success("¡Poción activada por 1 hora!"))
        .catch((err) => toast.error(err.message || "Ocurrió un error"));
    });
  };

  const handleBorderAction = (borderName: string, cost: number) => {
    if (pending) return;
    startTransition(() => {
      if (ownedBorders.includes(borderName) || borderName === "default") {
        equipBorder(borderName)
          .then(() => toast.success("¡Borde equipado!"))
          .catch((err) => toast.error(err.message || "Ocurrió un error"));
      } else {
        if (points < cost) {
          toast.error("No tienes suficientes puntos");
          return;
        }
        buyBorder(borderName, cost)
          .then(() => toast.success("¡Borde comprado y equipado!"))
          .catch((err) => toast.error(err.message || "Ocurrió un error"));
      }
    });
  };

  const isXpActive = xpBoosterEndsAt && new Date(xpBoosterEndsAt) > new Date();

  return (
    <div className="w-full flex flex-col gap-10">
      
      {/* Sección Premium (PRO) */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-1 relative overflow-hidden shadow-xl animate-in fade-in zoom-in duration-700">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Crown className="w-32 h-32 text-white" />
        </div>
        <div className="bg-white dark:bg-background/80 rounded-[22px] p-6 relative z-10 flex flex-col md:flex-row items-center gap-6">
          <Image src="/unlimited.svg" alt="Unlimited" height={100} width={100} className="drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500 uppercase tracking-widest mb-2">
              Ruta Cachimbo PRO
            </h2>
            <ul className="text-sm font-medium text-muted-foreground space-y-1 mb-4">
              <li>✨ Vidas infinitas para no detenerte.</li>
              <li>🤖 Evaluaciones IA ilimitadas.</li>
              <li>👑 Borde Dorado exclusivo en la liga.</li>
            </ul>
          </div>
          <Button onClick={onUpgrade} disabled={pending} className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold text-lg h-14 px-8 hover:scale-105 transition-transform border-b-4 border-indigo-700 flex-shrink-0">
            {hasActiveSubscription ? "Gestionar Plan" : "Mejorar Ahora"}
          </Button>
        </div>
      </div>

      {/* Utilidades y Power-Ups */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="text-amber-500" /> Power-Ups
        </h3>
        <ul className="grid grid-cols-1 gap-4">
          <li className="flex items-center w-full p-4 bg-white/80 dark:bg-card/80 backdrop-blur-md border-2 border-border rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
            <Image src="/heart.svg" alt="Heart" height={60} width={60} />
            <div className="flex-1 px-4">
              <p className="text-neutral-700 dark:text-neutral-300 text-base lg:text-xl font-bold">Recargar vidas</p>
              <p className="text-xs text-slate-500 hidden md:block">Recupera toda tu energía para seguir estudiando.</p>
            </div>
            <Button onClick={onRefillHearts} disabled={pending || hearts === 5 || points < POINTS_TO_REFILL} className="min-w-[120px]">
              {hearts === 5 ? "Lleno" : (
                <div className="flex items-center font-bold">
                  <Image src="/points.svg" alt="Points" height={20} width={20} className="mr-2" /> {POINTS_TO_REFILL}
                </div>
              )}
            </Button>
          </li>

          <li className="flex items-center w-full p-4 bg-white/80 dark:bg-card/80 backdrop-blur-md border-2 border-sky-200 dark:border-sky-900/50 rounded-2xl shadow-sm hover:shadow-sky-500/20 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-[60px] h-[60px] bg-sky-100 dark:bg-sky-900/40 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-8 h-8 text-sky-500" />
            </div>
            <div className="flex-1 px-4">
              <p className="text-neutral-700 dark:text-neutral-300 text-base lg:text-xl font-bold">Congelador de Racha</p>
              <p className="text-xs text-sky-600 dark:text-sky-400 hidden md:block">Protege tu racha si un día no puedes estudiar.</p>
            </div>
            <Button onClick={onBuyStreakFreeze} disabled={pending || streakFreeze || points < 200} className="min-w-[120px] bg-sky-500 hover:bg-sky-600 text-white border-b-4 border-sky-700 active:border-b-0">
              {streakFreeze ? "Equipado" : (
                <div className="flex items-center font-bold">
                  <Image src="/points.svg" alt="Points" height={20} width={20} className="mr-2" /> 200
                </div>
              )}
            </Button>
          </li>

          <li className="flex items-center w-full p-4 bg-white/80 dark:bg-card/80 backdrop-blur-md border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl shadow-sm hover:shadow-amber-500/20 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-[60px] h-[60px] bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-8 h-8 text-amber-500" />
            </div>
            <div className="flex-1 px-4">
              <p className="text-neutral-700 dark:text-neutral-300 text-base lg:text-xl font-bold">Poción Doble XP</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 hidden md:block">Duplica los puntos que ganes por 1 hora.</p>
            </div>
            <Button onClick={onBuyXpBooster} disabled={pending || isXpActive || points < 500} className="min-w-[120px] bg-amber-500 hover:bg-amber-600 text-white border-b-4 border-amber-700 active:border-b-0">
              {isXpActive ? "Activo" : (
                <div className="flex items-center font-bold">
                  <Image src="/points.svg" alt="Points" height={20} width={20} className="mr-2" /> 500
                </div>
              )}
            </Button>
          </li>
        </ul>
      </div>

      {/* Cosméticos */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Flame className="text-rose-500" /> Bordes de Avatar Exclusivos
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <li className="flex flex-col items-center justify-center p-6 bg-white/80 dark:bg-card/80 backdrop-blur-md border-2 border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-sm hover:shadow-rose-500/20 hover:shadow-xl transition-all hover:-translate-y-1 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-rose-500 flex items-center justify-center mb-4 bg-rose-100 dark:bg-rose-950">
              <Flame className="w-8 h-8 text-rose-500" />
            </div>
            <p className="font-bold text-lg text-rose-600 dark:text-rose-400">Fuego Ardiente</p>
            <p className="text-xs text-slate-500 mb-4 h-8">Destaca en la tabla de líderes.</p>
            <Button 
              onClick={() => handleBorderAction("fire", 500)} 
              disabled={pending || (!ownedBorders.includes("fire") && points < 500)}
              variant={activeBorder === "fire" ? "default" : "secondary"}
              className="w-full"
            >
              {activeBorder === "fire" ? "En uso" : ownedBorders.includes("fire") ? "Equipar" : (
                <div className="flex items-center font-bold">
                  <Image src="/points.svg" alt="Points" height={20} width={20} className="mr-2" /> 500
                </div>
              )}
            </Button>
          </li>

          <li className="flex flex-col items-center justify-center p-6 bg-white/80 dark:bg-card/80 backdrop-blur-md border-2 border-cyan-200 dark:border-cyan-900/50 rounded-2xl shadow-sm hover:shadow-cyan-500/20 hover:shadow-xl transition-all hover:-translate-y-1 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500 flex items-center justify-center mb-4 bg-cyan-100 dark:bg-cyan-950">
              <Snowflake className="w-8 h-8 text-cyan-500" />
            </div>
            <p className="font-bold text-lg text-cyan-600 dark:text-cyan-400">Hielo Polar</p>
            <p className="text-xs text-slate-500 mb-4 h-8">Estilo frío y elegante.</p>
            <Button 
              onClick={() => handleBorderAction("ice", 1000)} 
              disabled={pending || (!ownedBorders.includes("ice") && points < 1000)}
              variant={activeBorder === "ice" ? "default" : "secondary"}
              className="w-full"
            >
              {activeBorder === "ice" ? "En uso" : ownedBorders.includes("ice") ? "Equipar" : (
                <div className="flex items-center font-bold">
                  <Image src="/points.svg" alt="Points" height={20} width={20} className="mr-2" /> 1000
                </div>
              )}
            </Button>
          </li>
          
          <li className="md:col-span-2 flex flex-col items-center justify-center p-4 bg-muted rounded-2xl border-2 border-slate-200 dark:border-slate-700">
            <Button 
              onClick={() => handleBorderAction("default", 0)}
              disabled={pending || activeBorder === "default" || !activeBorder}
              variant="primaryOutline"
              className="w-full max-w-sm"
            >
              Quitar Borde (Predeterminado)
            </Button>
          </li>
        </ul>
      </div>

      <div className="pt-12">
        <div className="flex items-center gap-4 mb-8">
          <PackageOpen className="w-10 h-10 text-indigo-500 animate-bounce" />
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            Mercado Negro <span className="text-indigo-500">(Cofres Gacha)</span>
          </h2>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cofre Común */}
          <li className="flex flex-col items-center justify-center p-6 bg-muted border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-2 text-center">
            <div className="w-16 h-16 rounded-2xl border-4 border-slate-400 flex items-center justify-center mb-4 bg-slate-200 dark:bg-slate-800">
              <PackageOpen className="w-8 h-8 text-slate-500" />
            </div>
            <p className="font-black text-xl text-slate-700 dark:text-slate-300">Cofre Común</p>
            <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-widest">Drops: Bordes Grises/Rocosos</p>
            <Button 
              onClick={() => onBuyAndOpenChest("COMUN", 50)} 
              disabled={pending || points < 50}
              className="w-full bg-slate-500 hover:bg-slate-600 border-slate-600"
            >
              <Image src="/points.svg" alt="Points" height={20} width={20} className="mr-2" /> 50
            </Button>
          </li>

          {/* Cofre Raro */}
          <li className="flex flex-col items-center justify-center p-6 bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-300 dark:border-purple-800 rounded-2xl shadow-md hover:shadow-purple-500/30 transition-all hover:-translate-y-2 text-center">
            <div className="w-20 h-20 rounded-2xl border-4 border-purple-500 flex items-center justify-center mb-4 bg-purple-200 dark:bg-purple-900 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-pulse" />
            </div>
            <p className="font-black text-xl text-purple-700 dark:text-purple-400">Cofre Místico</p>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mb-6 font-bold uppercase tracking-widest">Drops: Bordes de Neón/Aura</p>
            <Button 
              onClick={() => onBuyAndOpenChest("RARO", 150)} 
              disabled={pending || points < 150}
              className="w-full bg-purple-600 hover:bg-purple-700 border-purple-800 text-white"
            >
              <Image src="/points.svg" alt="Points" height={20} width={20} className="mr-2" /> 150
            </Button>
          </li>

          {/* Cofre Épico */}
          <li className="flex flex-col items-center justify-center p-6 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-700 rounded-2xl shadow-lg hover:shadow-amber-500/40 transition-all hover:-translate-y-2 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20"></div>
            <div className="relative z-10 w-24 h-24 rounded-2xl border-[6px] border-amber-500 flex items-center justify-center mb-4 bg-gradient-to-br from-yellow-300 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-bounce">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <p className="relative z-10 font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500 dark:from-yellow-400 dark:to-amber-300">Cofre Épico</p>
            <p className="relative z-10 text-xs text-amber-700 dark:text-amber-400 mb-6 font-bold uppercase tracking-widest">Drops: Bordes de Fuego/Rayo</p>
            <Button 
              onClick={() => onBuyAndOpenChest("EPICO", 300)} 
              disabled={pending || points < 300}
              className="relative z-10 w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 border-amber-600 text-white shadow-xl"
            >
              <Image src="/points.svg" alt="Points" height={20} width={20} className="mr-2" /> 300
            </Button>
          </li>
        </ul>
      </div>

      {/* Fullscreen Chest Animation Overlay */}
      {chestOpening && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="relative flex flex-col items-center justify-center">
            {chestReward ? (
              <div className="animate-in zoom-in duration-500 flex flex-col items-center text-center p-8 bg-card rounded-3xl border-4 border-amber-400 shadow-[0_0_100px_rgba(251,191,36,0.6)]">
                <Sparkles className="w-16 h-16 text-yellow-500 mb-4 animate-spin-slow" />
                <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-widest">¡RECOMPENSA!</h2>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                  Has desbloqueado: {chestReward}
                </p>
                <p className="mt-4 text-slate-500 text-sm font-bold animate-pulse">Equipando automáticamente... recargando en 3s</p>
              </div>
            ) : (
              <div className="animate-bounce-custom flex flex-col items-center">
                <div className={`w-40 h-40 rounded-3xl border-[6px] flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.2)] ${
                  chestTypeOpened === "EPICO" ? "border-amber-500 bg-gradient-to-br from-yellow-300 to-amber-600 shadow-[0_0_80px_rgba(245,158,11,0.8)]" :
                  chestTypeOpened === "RARO" ? "border-purple-500 bg-purple-600 shadow-[0_0_80px_rgba(168,85,247,0.8)]" :
                  "border-slate-400 bg-slate-500"
                }`}>
                  {chestTypeOpened === "EPICO" ? <Crown className="w-20 h-20 text-white" /> : 
                   chestTypeOpened === "RARO" ? <Sparkles className="w-20 h-20 text-white" /> : 
                   <PackageOpen className="w-20 h-20 text-white" />}
                </div>
                <p className="mt-8 text-2xl font-black text-white uppercase tracking-widest animate-pulse">Abriendo Cofre...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
