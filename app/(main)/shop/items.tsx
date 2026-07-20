"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { POINTS_TO_REFILL } from "@/constants";
import { refillHearts } from "@/actions/user-progress";
import { createStripeUrl } from "@/actions/user-subscription";
import { buyStreakFreeze, buyXpBooster, buyBorder, equipBorder, buyTitle, equipTitle } from "@/actions/shop-actions";
import { buyChest, openChest } from "@/actions/gacha-actions";
import { buyPowerupCard, buyMascotSkin, equipMascotSkin } from "@/actions/powerup-actions";
import { BORDERS_CATALOG, TITLES_CATALOG, getBorderStyles, getBorderDisplayName, getTitleById } from "@/lib/shop-catalog";
import { MASCOT_SKINS_CATALOG, POWERUP_CARDS_CATALOG, getMascotSkinById } from "@/lib/powerups-catalog";
import { MascotAvatar } from "@/components/mascot-avatar";
import { 
  Zap, 
  Flame, 
  Crown, 
  ShieldAlert, 
  PackageOpen, 
  Sparkles, 
  Award,
  CheckCircle2,
  Lock,
  Bot,
  Shield,
  Smile
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
  streak: number;
  streakFreeze?: boolean;
  xpBoosterEndsAt?: Date | null;
  ownedBorders?: string[];
  activeBorder?: string | null;
  userImageSrc: string;
  userName: string;
  ownedTitles?: string[];
  activeTitle?: string | null;
  cardFiftyFifty?: number;
  cardAiHint?: number;
  cardHeartShield?: number;
  activeMascotSkin?: string | null;
  ownedMascotSkins?: string[];
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
  userImageSrc,
  userName,
  ownedTitles = [],
  activeTitle,
  cardFiftyFifty = 0,
  cardAiHint = 0,
  cardHeartShield = 0,
  activeMascotSkin = "default",
  ownedMascotSkins = ["default"],
}: Props) => {
  const [pending, startTransition] = useTransition();

  // Gacha states
  const [chestOpening, setChestOpening] = useState(false);
  const [chestReward, setChestReward] = useState<{
    id: string;
    name: string;
    rarity: string;
    style: string;
  } | null>(null);
  const [chestTypeOpened, setChestTypeOpened] = useState<"COMUN" | "RARO" | "EPICO" | null>(null);

  const activeTitleObj = getTitleById(activeTitle);
  const activeSkinObj = getMascotSkinById(activeMascotSkin);

  const onRefillHearts = () => {
    if (pending || hearts === 5 || points < POINTS_TO_REFILL) return;
    startTransition(() => {
      refillHearts().catch(() => toast.error("Ocurrió un error"));
    });
  };

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
              setTimeout(() => {
                setChestReward({
                  id: openRes.rewardValue || "steel",
                  name: openRes.rewardName || "Borde Misterioso",
                  rarity: openRes.rewardRarity || "COMUN",
                  style: openRes.rewardStyle || "border-slate-400",
                });
              }, 1800);
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

  const handleBorderAction = (borderId: string, cost: number | null) => {
    if (pending) return;
    startTransition(() => {
      if (ownedBorders.includes(borderId) || borderId === "default") {
        equipBorder(borderId)
          .then(() => toast.success("¡Borde equipado!"))
          .catch((err) => toast.error(err.message || "Ocurrió un error"));
      } else {
        if (cost === null) {
          toast.error("Este borde solo se obtiene abriendo cofres en el Mercado Negro.");
          return;
        }
        if (points < cost) {
          toast.error("No tienes suficientes puntos");
          return;
        }
        buyBorder(borderId, cost)
          .then(() => toast.success("¡Borde comprado y equipado!"))
          .catch((err) => toast.error(err.message || "Ocurrió un error"));
      }
    });
  };

  const handleTitleAction = (titleId: string, cost: number) => {
    if (pending) return;
    startTransition(() => {
      if (ownedTitles.includes(titleId) || titleId === "default") {
        equipTitle(titleId)
          .then(() => toast.success("¡Título equipado!"))
          .catch((err) => toast.error(err.message || "Ocurrió un error"));
      } else {
        if (points < cost) {
          toast.error("No tienes suficientes puntos");
          return;
        }
        buyTitle(titleId)
          .then(() => toast.success("¡Título desbloqueado y equipado!"))
          .catch((err) => toast.error(err.message || "Ocurrió un error"));
      }
    });
  };

  const handleCardBuy = (cardId: "fiftyFifty" | "aiHint" | "heartShield", isPack: boolean) => {
    if (pending) return;
    startTransition(() => {
      buyPowerupCard(cardId, isPack)
        .then(() => toast.success("¡Comodín añadido a tu inventario!"))
        .catch((err) => toast.error(err.message || "Error al comprar comodín"));
    });
  };

  const handleMascotSkinAction = (skinId: string, cost: number) => {
    if (pending) return;
    startTransition(() => {
      if (ownedMascotSkins.includes(skinId)) {
        equipMascotSkin(skinId)
          .then(() => toast.success("¡Skin de mascota equipada!"))
          .catch((err) => toast.error(err.message || "Error al equipar"));
      } else {
        if (points < cost) {
          toast.error("No tienes suficientes puntos");
          return;
        }
        buyMascotSkin(skinId)
          .then(() => toast.success("¡Apariencia comprada y equipada!"))
          .catch((err) => toast.error(err.message || "Error al comprar"));
      }
    });
  };

  const isXpActive = xpBoosterEndsAt && new Date(xpBoosterEndsAt) > new Date();

  return (
    <div className="w-full flex flex-col gap-10">

      {/* Tarjeta de Previsualización Actual de Perfil & Mascota */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-slate-800">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Sparkles className="w-36 h-36" />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar className={`h-20 w-20 border-4 transition-all duration-300 ${getBorderStyles(activeBorder)}`}>
              <AvatarImage src={userImageSrc} className="object-cover" />
            </Avatar>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xl text-white">{userName}</h3>
              {hasActiveSubscription && (
                <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  PRO
                </span>
              )}
            </div>
            <p className="text-amber-400 font-extrabold text-xs flex items-center gap-1">
              <Award className="w-3.5 h-3.5 inline" />
              {activeTitleObj ? activeTitleObj.title : "Sin Título Equipado"}
            </p>
            <p className="text-slate-400 text-xs font-medium">
              Borde: <span className="text-slate-200 font-bold">{getBorderDisplayName(activeBorder)}</span>
            </p>
          </div>
        </div>

        {/* Mascota Activa */}
        <div className="flex items-center gap-3 bg-slate-800/90 px-4 py-3 rounded-2xl border border-slate-700">
          <MascotAvatar skinId={activeMascotSkin} width={50} height={50} />
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mascota Activa</span>
            <span className="font-black text-sm text-emerald-400">{activeSkinObj.name}</span>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center bg-slate-800/90 px-4 py-3 rounded-2xl border border-slate-700 shrink-0">
          <div className="flex items-center gap-1.5">
            <Image src="/points.svg" alt="Points" height={22} width={22} />
            <span className="font-black text-xl text-amber-400">{points}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Puntos Disponibles</span>
        </div>
      </div>
      
      {/* Sección Premium (PRO) */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-1 relative overflow-hidden shadow-xl animate-in fade-in duration-500">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Crown className="w-32 h-32 text-white" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 relative z-10 flex flex-col md:flex-row items-center gap-6">
          <Image src="/unlimited.svg" alt="Unlimited" height={100} width={100} className="drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500 uppercase tracking-widest mb-2">
              Ruta Cachimbo PRO
            </h2>
            <ul className="text-sm font-medium text-muted-foreground space-y-1 mb-4">
              <li>✨ Vidas infinitas para estudiar sin pausa.</li>
              <li>🤖 Evaluaciones de comprensión IA ilimitadas.</li>
              <li>👑 Borde Dorado exclusivo de liderazgo.</li>
            </ul>
          </div>
          <Button onClick={onUpgrade} disabled={pending} className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold text-base h-12 px-8 hover:scale-105 transition-transform border-b-4 border-indigo-700 flex-shrink-0">
            {hasActiveSubscription ? "Gestionar Plan" : "Mejorar Ahora"}
          </Button>
        </div>
      </div>

      {/* MECÁNICA 1: Botica de Comodines para Simulacros y Lecturas */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-amber-500 w-6 h-6" />
          <h3 className="text-2xl font-black text-foreground">Comodines de Juego (Exámenes y Lecturas)</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Compra cartas consumibles con tus puntos de experiencia y úsalas durante tus preguntas para asegurar la respuesta correcta.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Comodín 50/50 */}
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/40 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🃏</span>
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Inventario: {cardFiftyFifty}
                </span>
              </div>
              <h4 className="font-extrabold text-lg text-foreground mb-1">Comodín 50/50</h4>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Descarte automático de 2 alternativas incorrectas durante cualquier pregunta difícil.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => handleCardBuy("fiftyFifty", false)}
                disabled={pending || points < 80}
                variant="secondaryOutline"
                className="w-full h-9 font-bold text-xs"
              >
                1x Unidad (80 pts)
              </Button>
              <Button
                onClick={() => handleCardBuy("fiftyFifty", true)}
                disabled={pending || points < 200}
                className="w-full h-10 font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                📦 Pack 3x (200 pts - Ahorras 40)
              </Button>
            </div>
          </div>

          {/* Pista Tutor IA */}
          <div className="bg-white dark:bg-slate-900 border-2 border-cyan-200 dark:border-cyan-900/40 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Bot className="w-8 h-8 text-cyan-500" />
                <span className="bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Inventario: {cardAiHint}
                </span>
              </div>
              <h4 className="font-extrabold text-lg text-foreground mb-1">Pista del Tutor IA</h4>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Pide un consejo pedagógico inmediato a la IA para orientarte sobre la clave del texto.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => handleCardBuy("aiHint", false)}
                disabled={pending || points < 120}
                variant="secondaryOutline"
                className="w-full h-9 font-bold text-xs"
              >
                1x Unidad (120 pts)
              </Button>
              <Button
                onClick={() => handleCardBuy("aiHint", true)}
                disabled={pending || points < 300}
                className="w-full h-10 font-bold text-xs bg-cyan-500 hover:bg-cyan-600 text-slate-950"
              >
                📦 Pack 3x (300 pts - Ahorras 60)
              </Button>
            </div>
          </div>

          {/* Escudo de Corazón */}
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/40 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Shield className="w-8 h-8 text-rose-500" />
                <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Inventario: {cardHeartShield}
                </span>
              </div>
              <h4 className="font-extrabold text-lg text-foreground mb-1">Escudo de Corazón</h4>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Absorbe la pérdida de 1 vida si te equivocas en una pregunta durante tu lección.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => handleCardBuy("heartShield", false)}
                disabled={pending || points < 150}
                variant="secondaryOutline"
                className="w-full h-9 font-bold text-xs"
              >
                1x Unidad (150 pts)
              </Button>
              <Button
                onClick={() => handleCardBuy("heartShield", true)}
                disabled={pending || points < 380}
                className="w-full h-10 font-bold text-xs bg-rose-500 hover:bg-rose-600 text-white"
              >
                📦 Pack 3x (380 pts - Ahorras 70)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MECÁNICA 2: Armario de Skins de la Mascota Acompañante */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Smile className="text-emerald-500 w-6 h-6" />
          <h3 className="text-2xl font-black text-foreground">Armario de la Mascota Cachimbo</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Desbloquea atuendos, visores y auras doradas para personalizar la mascota que te acompaña en las lecturas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {MASCOT_SKINS_CATALOG.map((skinItem) => {
            const isOwned = ownedMascotSkins.includes(skinItem.id);
            const isActive = activeMascotSkin === skinItem.id;

            return (
              <div
                key={skinItem.id}
                className={cn(
                  "p-5 rounded-3xl border-2 flex flex-col items-center text-center justify-between transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900 shadow-sm",
                  isActive 
                    ? "border-emerald-500 ring-2 ring-emerald-500/30" 
                    : "border-border hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className="relative mb-3 py-2 flex flex-col items-center">
                  <MascotAvatar skinId={skinItem.id} width={70} height={70} />
                  <span className="mt-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    {skinItem.badge}
                  </span>
                </div>

                <div className="w-full mb-4 space-y-1">
                  <h4 className="font-extrabold text-base text-foreground">{skinItem.name}</h4>
                  <p className="text-xs text-muted-foreground leading-snug h-10 flex items-center justify-center">
                    {skinItem.description}
                  </p>
                </div>

                <Button
                  onClick={() => handleMascotSkinAction(skinItem.id, skinItem.price)}
                  disabled={pending || (!isOwned && points < skinItem.price)}
                  variant={isActive ? "default" : isOwned ? "secondary" : "primary"}
                  className="w-full h-10 font-bold text-xs"
                >
                  {isActive ? (
                    "Equipada"
                  ) : isOwned ? (
                    "Equipar Skin"
                  ) : (
                    <div className="flex items-center">
                      <Image src="/points.svg" alt="Points" height={16} width={16} className="mr-1.5" />
                      Desbloquear ({skinItem.price} pts)
                    </div>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Power-Ups Generales */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="text-amber-500" /> Power-Ups Generales
        </h3>
        <ul className="grid grid-cols-1 gap-4">
          <li className="flex items-center w-full p-4 bg-white dark:bg-slate-900 border-2 border-border rounded-2xl shadow-sm hover:shadow-md transition-all">
            <Image src="/heart.svg" alt="Heart" height={50} width={50} className="shrink-0" />
            <div className="flex-1 px-4">
              <p className="text-neutral-800 dark:text-neutral-200 text-base font-bold">Recargar Vidas</p>
              <p className="text-xs text-slate-500">Recupera toda tu energía para seguir respondiendo simulacros.</p>
            </div>
            <Button onClick={onRefillHearts} disabled={pending || hearts === 5 || points < POINTS_TO_REFILL} className="min-w-[120px]">
              {hearts === 5 ? "Lleno" : (
                <div className="flex items-center font-bold">
                  <Image src="/points.svg" alt="Points" height={18} width={18} className="mr-1.5" /> {POINTS_TO_REFILL}
                </div>
              )}
            </Button>
          </li>

          <li className="flex items-center w-full p-4 bg-white dark:bg-slate-900 border-2 border-sky-200 dark:border-sky-900/50 rounded-2xl shadow-sm hover:shadow-sky-500/10 transition-all">
            <div className="w-[50px] h-[50px] bg-sky-100 dark:bg-sky-900/40 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7 text-sky-500" />
            </div>
            <div className="flex-1 px-4">
              <p className="text-neutral-800 dark:text-neutral-200 text-base font-bold">Congelador de Racha</p>
              <p className="text-xs text-sky-600 dark:text-sky-400">Protege tu racha si un día no puedes entrar a estudiar.</p>
            </div>
            <Button onClick={onBuyStreakFreeze} disabled={pending || streakFreeze || points < 200} className="min-w-[120px] bg-sky-500 hover:bg-sky-600 text-white border-b-4 border-sky-700">
              {streakFreeze ? "Equipado" : (
                <div className="flex items-center font-bold">
                  <Image src="/points.svg" alt="Points" height={18} width={18} className="mr-1.5" /> 200
                </div>
              )}
            </Button>
          </li>

          <li className="flex items-center w-full p-4 bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl shadow-sm hover:shadow-amber-500/10 transition-all">
            <div className="w-[50px] h-[50px] bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-7 h-7 text-amber-500" />
            </div>
            <div className="flex-1 px-4">
              <p className="text-neutral-800 dark:text-neutral-200 text-base font-bold">Poción Doble XP (1 Hora)</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Duplica todos los puntos de experiencia obtenidos durante 60 minutos.</p>
            </div>
            <Button onClick={onBuyXpBooster} disabled={pending || isXpActive || points < 500} className="min-w-[120px] bg-amber-500 hover:bg-amber-600 text-white border-b-4 border-amber-700">
              {isXpActive ? "Activo" : (
                <div className="flex items-center font-bold">
                  <Image src="/points.svg" alt="Points" height={18} width={18} className="mr-1.5" /> 500
                </div>
              )}
            </Button>
          </li>
        </ul>
      </div>

      {/* Títulos Honoríficos */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Award className="text-purple-500" /> Títulos de Honor para el Perfil
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Equipa un título exclusivo que aparecerá debajo de tu nombre en la tabla de clasificación.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TITLES_CATALOG.map((titleItem) => {
            const isOwned = ownedTitles.includes(titleItem.id);
            const isActive = activeTitle === titleItem.id;

            return (
              <div 
                key={titleItem.id}
                className={cn(
                  "p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 bg-white dark:bg-slate-900",
                  isActive ? "border-purple-500 shadow-md bg-purple-50/20 dark:bg-purple-950/20" : "border-border"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-base text-foreground">{titleItem.title}</span>
                    {isActive && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                        En Uso
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{titleItem.description}</p>
                </div>

                <Button
                  onClick={() => handleTitleAction(titleItem.id, titleItem.price)}
                  disabled={pending || (!isOwned && points < titleItem.price)}
                  variant={isActive ? "default" : isOwned ? "secondary" : "primary"}
                  className="w-full h-10 font-bold text-xs"
                >
                  {isActive ? (
                    "Equipado"
                  ) : isOwned ? (
                    "Equipar Título"
                  ) : (
                    <div className="flex items-center">
                      <Image src="/points.svg" alt="Points" height={16} width={16} className="mr-1.5" />
                      Comprar por {titleItem.price} pts
                    </div>
                  )}
                </Button>
              </div>
            );
          })}

          {/* Opción de Quitar Título */}
          <div className="md:col-span-2 flex justify-center">
            <Button
              onClick={() => handleTitleAction("default", 0)}
              disabled={pending || !activeTitle}
              variant="primaryOutline"
              className="text-xs font-bold text-muted-foreground h-9"
            >
              Quitar Título Equipado
            </Button>
          </div>
        </div>
      </div>

      {/* Bordes de Avatar con Previsualización Real */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Flame className="text-rose-500" /> Bordes de Avatar Exclusivos
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Visualiza en tiempo real cómo lucirá tu avatar con cada borde en la tabla de líderes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {BORDERS_CATALOG.filter(b => b.id !== "gold").map((borderItem) => {
            const isOwned = ownedBorders.includes(borderItem.id);
            const isActive = activeBorder === borderItem.id;
            const isChestOnly = borderItem.price === null;

            return (
              <div 
                key={borderItem.id}
                className={cn(
                  "p-5 rounded-3xl border-2 flex flex-col items-center text-center justify-between transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900 shadow-sm",
                  isActive 
                    ? "border-amber-400 ring-2 ring-amber-400/30" 
                    : "border-border hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                {/* Visualización en Vivo del Avatar con el Borde */}
                <div className="relative mb-3 py-2 flex flex-col items-center">
                  <Avatar className={`h-20 w-20 border-4 transition-all duration-300 ${borderItem.borderStyle}`}>
                    <AvatarImage src={userImageSrc} className="object-cover" />
                  </Avatar>
                  <span className={cn(
                    "mt-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    borderItem.rarity === "EPICO" ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300" :
                    borderItem.rarity === "RARO" ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300" :
                    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300"
                  )}>
                    {borderItem.rarity}
                  </span>
                </div>

                <div className="w-full mb-4 space-y-1">
                  <h4 className="font-extrabold text-base text-foreground">{borderItem.name}</h4>
                  <p className="text-xs text-muted-foreground leading-snug h-10 flex items-center justify-center">
                    {borderItem.description}
                  </p>
                </div>

                {/* Botón de Acción */}
                <Button
                  onClick={() => handleBorderAction(borderItem.id, borderItem.price)}
                  disabled={pending || (!isOwned && !isChestOnly && points < (borderItem.price || 0))}
                  variant={isActive ? "default" : isOwned ? "secondary" : "primary"}
                  className="w-full h-10 font-bold text-xs"
                >
                  {isActive ? (
                    "En Uso"
                  ) : isOwned ? (
                    "Equipar"
                  ) : isChestOnly ? (
                    <span className="flex items-center text-slate-500 dark:text-slate-400 font-bold">
                      <Lock className="w-3.5 h-3.5 mr-1" /> Exclusivo de Cofre
                    </span>
                  ) : (
                    <div className="flex items-center">
                      <Image src="/points.svg" alt="Points" height={16} width={16} className="mr-1.5" />
                      Comprar ({borderItem.price} pts)
                    </div>
                  )}
                </Button>
              </div>
            );
          })}

          {/* Quitar Borde */}
          <div className="sm:col-span-2 md:col-span-3 flex justify-center pt-2">
            <Button
              onClick={() => handleBorderAction("default", 0)}
              disabled={pending || activeBorder === "default" || !activeBorder}
              variant="primaryOutline"
              className="text-xs font-bold text-muted-foreground h-9"
            >
              Quitar Borde (Predeterminado)
            </Button>
          </div>
        </div>
      </div>

      {/* Mercado Negro (Cofres Gacha) */}
      <div className="pt-6">
        <div className="flex items-center gap-3 mb-6">
          <PackageOpen className="w-9 h-9 text-indigo-500 animate-bounce" />
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Mercado Negro <span className="text-indigo-500">(Cofres Misteriosos)</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Abre cofres con tus puntos para desbloquear bordes exclusivos y raros que no se pueden comprar directamente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cofre Común */}
          <div className="flex flex-col items-center justify-between p-6 rounded-3xl border-2 border-border bg-white dark:bg-slate-900 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl border-4 border-slate-300 dark:border-slate-600 flex items-center justify-center mb-3 bg-slate-100 dark:bg-slate-800">
              <PackageOpen className="w-8 h-8 text-slate-500" />
            </div>
            <h4 className="font-black text-lg text-slate-800 dark:text-slate-200">Cofre Común</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4">
              Drops: Bordes Comunes (Roca Ancestral, Acero Pulido)
            </p>
            <Button 
              onClick={() => onBuyAndOpenChest("COMUN", 50)} 
              disabled={pending || points < 50}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold h-10"
            >
              <Image src="/points.svg" alt="Points" height={18} width={18} className="mr-1.5" /> 50 pts
            </Button>
          </div>

          {/* Cofre Místico */}
          <div className="flex flex-col items-center justify-between p-6 rounded-3xl border-2 border-purple-300 dark:border-purple-900/50 bg-purple-500/5 dark:bg-purple-950/10 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl border-4 border-purple-500 flex items-center justify-center mb-3 bg-purple-100 dark:bg-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-pulse" />
            </div>
            <h4 className="font-black text-lg text-purple-700 dark:text-purple-300">Cofre Místico</h4>
            <p className="text-[10px] text-purple-600/80 dark:text-purple-400 font-bold uppercase tracking-wider mb-4">
              Drops: Bordes Raros (Aura Mística, Azur Celestial)
            </p>
            <Button 
              onClick={() => onBuyAndOpenChest("RARO", 150)} 
              disabled={pending || points < 150}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-10"
            >
              <Image src="/points.svg" alt="Points" height={18} width={18} className="mr-1.5" /> 150 pts
            </Button>
          </div>

          {/* Cofre Épico */}
          <div className="flex flex-col items-center justify-between p-6 rounded-3xl border-2 border-amber-400 dark:border-amber-700/50 bg-amber-500/5 dark:bg-amber-950/10 shadow-md text-center">
            <div className="w-16 h-16 rounded-2xl border-4 border-amber-500 flex items-center justify-center mb-3 bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-black text-lg text-amber-700 dark:text-amber-400">Cofre Épico</h4>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mb-4">
              Drops: Bordes Épicos (Trueno Eléctrico, Galaxia Cósmica, Furia Roja)
            </p>
            <Button 
              onClick={() => onBuyAndOpenChest("EPICO", 300)} 
              disabled={pending || points < 300}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold h-10 shadow-md"
            >
              <Image src="/points.svg" alt="Points" height={18} width={18} className="mr-1.5" /> 300 pts
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay Animado de Recompensa del Cofre */}
      {chestOpening && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative flex flex-col items-center justify-center max-w-md w-full">
            {chestReward ? (
              <div className="animate-in zoom-in duration-500 flex flex-col items-center text-center p-8 bg-slate-900 border-4 border-amber-400 rounded-3xl shadow-[0_0_80px_rgba(251,191,36,0.5)] w-full">
                <Sparkles className="w-12 h-12 text-yellow-400 mb-3 animate-spin-slow" />
                <h2 className="text-3xl font-black text-white mb-1 uppercase tracking-widest">¡RECOMPENSA!</h2>
                <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-6">
                  {chestReward.rarity}
                </p>

                {/* Previsualización en vivo del Avatar con el nuevo borde desbloqueado */}
                <div className="relative mb-6">
                  <Avatar className={`h-28 w-28 border-4 transition-all duration-500 ${getBorderStyles(chestReward.id)}`}>
                    <AvatarImage src={userImageSrc} className="object-cover" />
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1.5 border-2 border-slate-900 shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 mb-2">
                  {chestReward.name}
                </p>

                <p className="text-slate-400 text-xs font-medium mb-6">
                  ¡El nuevo borde ha sido desbloqueado y equipado automáticamente en tu perfil!
                </p>

                <Button 
                  onClick={() => setChestOpening(false)}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-base h-12 rounded-xl"
                >
                  ¡Genial, Continuar!
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-6">
                <div className={cn(
                  "w-36 h-36 rounded-3xl border-4 flex items-center justify-center shadow-2xl animate-bounce",
                  chestTypeOpened === "EPICO" ? "border-amber-400 bg-gradient-to-br from-yellow-400 to-amber-600 shadow-amber-500/50" :
                  chestTypeOpened === "RARO" ? "border-purple-500 bg-purple-600 shadow-purple-500/50" :
                  "border-slate-400 bg-slate-600 shadow-slate-500/50"
                )}>
                  {chestTypeOpened === "EPICO" ? <Crown className="w-16 h-16 text-white" /> : 
                   chestTypeOpened === "RARO" ? <Sparkles className="w-16 h-16 text-white" /> : 
                   <PackageOpen className="w-16 h-16 text-white" />}
                </div>
                <p className="text-2xl font-black text-white uppercase tracking-widest animate-pulse">
                  Abriendo Cofre {chestTypeOpened}...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
