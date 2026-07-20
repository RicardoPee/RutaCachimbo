export interface MascotSkin {
  id: string;
  name: string;
  description: string;
  price: number;
  badge: string;
  auraStyle: string;
  bgGradient: string;
}

export interface PowerupCard {
  id: "fiftyFifty" | "aiHint" | "heartShield";
  name: string;
  description: string;
  singlePrice: number;
  packPrice: number;
  packQuantity: number;
  badge: string;
}

export const MASCOT_SKINS_CATALOG: MascotSkin[] = [
  {
    id: "default",
    name: "Mascota Cachimbo",
    description: "El simpático y fiel compañero clásico de estudio.",
    price: 0,
    badge: "Predeterminado",
    auraStyle: "border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
    bgGradient: "bg-emerald-50 dark:bg-emerald-950/30"
  },
  {
    id: "graduate",
    name: "🎓 Cachimbo Universitario",
    description: "Ataviado con toga y birrete, listo para el primer puesto.",
    price: 400,
    badge: "Académico",
    auraStyle: "border-indigo-500 ring-2 ring-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse",
    bgGradient: "bg-indigo-50 dark:bg-indigo-950/40"
  },
  {
    id: "cyber",
    name: "🤖 Cyber-Bot 3000",
    description: "Mascota futurista con visor de neón y respuestas hiperrápidas.",
    price: 700,
    badge: "Futurista",
    auraStyle: "border-cyan-400 ring-4 ring-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.8)]",
    bgGradient: "bg-cyan-50 dark:bg-cyan-950/40"
  },
  {
    id: "saiyan",
    name: "🔥 Sayayín de Lectura",
    description: "Rodeado de un aura legendaria de energía dorada para exámenes difíciles.",
    price: 1200,
    badge: "Legendario",
    auraStyle: "border-amber-400 ring-4 ring-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.9)] animate-pulse",
    bgGradient: "bg-amber-100 dark:bg-amber-950/50"
  },
  {
    id: "detective",
    name: "🕵️ Detective de Lectura",
    description: "Encuentra pistas e inferencias ocultas en cualquier texto.",
    price: 550,
    badge: "Analista",
    auraStyle: "border-slate-700 ring-2 ring-slate-400 shadow-[0_0_15px_rgba(51,65,85,0.7)]",
    bgGradient: "bg-slate-100 dark:bg-slate-900/50"
  }
];

export const POWERUP_CARDS_CATALOG: PowerupCard[] = [
  {
    id: "fiftyFifty",
    name: "🃏 Comodín 50/50",
    description: "Desgrana la pregunta descartando 2 alternativas incorrectas de golpe.",
    singlePrice: 80,
    packPrice: 200,
    packQuantity: 3,
    badge: "Estrategia"
  },
  {
    id: "aiHint",
    name: "🤖 Pista del Tutor IA",
    description: "Recibe un consejo pedagógico directo generado por IA durante la pregunta.",
    singlePrice: 120,
    packPrice: 300,
    packQuantity: 3,
    badge: "Inteligencia"
  },
  {
    id: "heartShield",
    name: "🛡️ Escudo de Corazón",
    description: "Evita perder una vida si te equivocas en una pregunta de la lección.",
    singlePrice: 150,
    packPrice: 380,
    packQuantity: 3,
    badge: "Protección"
  }
];

export function getMascotSkinById(skinId?: string | null): MascotSkin {
  if (!skinId) return MASCOT_SKINS_CATALOG[0];
  return MASCOT_SKINS_CATALOG.find(s => s.id === skinId) || MASCOT_SKINS_CATALOG[0];
}

export function getPowerupCardById(cardId: string): PowerupCard | undefined {
  return POWERUP_CARDS_CATALOG.find(c => c.id === cardId);
}
