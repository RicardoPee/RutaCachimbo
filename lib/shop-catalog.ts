export type BorderRarity = "COMUN" | "RARO" | "EPICO";

export interface BorderItem {
  id: string;
  name: string;
  rarity: BorderRarity;
  price: number | null; // null if chest exclusive
  borderStyle: string;
  description: string;
}

export interface TitleItem {
  id: string;
  title: string;
  price: number;
  description: string;
}

export const BORDERS_CATALOG: BorderItem[] = [
  {
    id: "fire",
    name: "Fuego Ardiente",
    rarity: "EPICO",
    price: 500,
    borderStyle: "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.85)] bg-rose-50 dark:bg-rose-950/40",
    description: "Destaca en la tabla de líderes con un halo flamígero constante."
  },
  {
    id: "ice",
    name: "Hielo Polar",
    rarity: "RARO",
    price: 1000,
    borderStyle: "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.85)] bg-cyan-50 dark:bg-cyan-950/40",
    description: "Luce un estilo frío, impecable y profesional en tus batallas."
  },
  {
    id: "shadow",
    name: "Sombra Sombría",
    rarity: "RARO",
    price: 800,
    borderStyle: "border-slate-900 dark:border-slate-100 shadow-[0_0_15px_rgba(15,23,42,0.9)] bg-slate-900/10",
    description: "Para los estudiantes misteriosos que dominan las lecturas en silencio."
  },
  {
    id: "thunder",
    name: "Trueno Eléctrico",
    rarity: "EPICO",
    price: null, // Chest exclusive
    borderStyle: "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)] bg-amber-100 dark:bg-amber-950/40",
    description: "Aura electrizante otorgada solo a los afortunados del Cofre Épico."
  },
  {
    id: "galaxy",
    name: "Galaxia Cósmica",
    rarity: "EPICO",
    price: null, // Chest exclusive
    borderStyle: "border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.9)] bg-fuchsia-950/30",
    description: "El poder del cosmos rodea tu perfil de Cachimbo."
  },
  {
    id: "red_dragon",
    name: "Furia Roja",
    rarity: "EPICO",
    price: null, // Chest exclusive
    borderStyle: "border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.9)] bg-red-950/40",
    description: "Aura legendaria de dragón para los alumnos más feroces."
  },
  {
    id: "aura_mystic",
    name: "Aura Mística",
    rarity: "RARO",
    price: null, // Chest exclusive
    borderStyle: "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.85)] bg-purple-950/40",
    description: "Energía mística para sabios y estudiosos dedicados."
  },
  {
    id: "azur",
    name: "Azur Celestial",
    rarity: "RARO",
    price: null, // Chest exclusive
    borderStyle: "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.85)] bg-blue-950/40",
    description: "Borde cristalino inspirado en los mares de la sabiduría."
  },
  {
    id: "stone",
    name: "Roca Ancestral",
    rarity: "COMUN",
    price: null, // Chest exclusive
    borderStyle: "border-stone-500 shadow-[0_0_8px_rgba(120,113,108,0.5)] bg-stone-100 dark:bg-stone-900/40",
    description: "Solidez indestructible para tus sesiones de estudio."
  },
  {
    id: "steel",
    name: "Acero Pulido",
    rarity: "COMUN",
    price: null, // Chest exclusive
    borderStyle: "border-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.5)] bg-slate-100 dark:bg-slate-800/40",
    description: "Un borde metálico clásico y resistente."
  },
  {
    id: "gold",
    name: "Dorado Real",
    rarity: "EPICO",
    price: null, // PRO / Leaderboard exclusive
    borderStyle: "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.85)] bg-yellow-50 dark:bg-yellow-950/40",
    description: "Exclusivo para los suscriptores RutaCachimbo PRO o campeones."
  }
];

export const TITLES_CATALOG: TitleItem[] = [
  {
    id: "raton_biblioteca",
    title: "📚 Ratón de Biblioteca",
    price: 300,
    description: "Para quienes devoran lecturas y temarios sin descanso."
  },
  {
    id: "mente_maestra",
    title: "🧠 Mente Maestra",
    price: 500,
    description: "Demuestra tu agilidad mental en simulacros y lecturas."
  },
  {
    id: "velocista_lectura",
    title: "⚡ Velocista de Lectura",
    price: 600,
    description: "Responde preguntas a la velocidad de la luz."
  },
  {
    id: "guerrero_pvp",
    title: "⚔️ Guerrero PVP",
    price: 750,
    description: "Imbatible en los duelos 1v1 contra otros postulantes."
  },
  {
    id: "futuro_cachimbo",
    title: "🎓 Futuro Cachimbo",
    price: 1000,
    description: "El título de honor para quienes darán todo por ingresar a la universidad."
  }
];

// Helper legacy mapping to avoid broken borders for existing DB records
const LEGACY_MAP: Record<string, string> = {
  "border-slate-400": "steel",
  "border-stone-500": "stone",
  "border-blue-500": "azur",
  "border-purple-500": "aura_mystic",
  "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]": "thunder",
  "border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]": "red_dragon"
};

export function getBorderById(borderId?: string | null): BorderItem | undefined {
  if (!borderId) return undefined;
  
  // Check direct ID match
  const direct = BORDERS_CATALOG.find(b => b.id === borderId);
  if (direct) return direct;

  // Check legacy string
  const legacyMappedId = LEGACY_MAP[borderId];
  if (legacyMappedId) {
    return BORDERS_CATALOG.find(b => b.id === legacyMappedId);
  }

  return undefined;
}

export function getBorderStyles(borderId?: string | null): string {
  if (!borderId || borderId === "default") {
    return "border-slate-300 dark:border-slate-600 bg-muted";
  }

  const border = getBorderById(borderId);
  if (border) {
    return border.borderStyle;
  }

  // If raw CSS was passed directly
  if (borderId.startsWith("border-")) {
    return borderId;
  }

  return "border-slate-300 dark:border-slate-600 bg-muted";
}

export function getBorderDisplayName(borderId?: string | null): string {
  if (!borderId || borderId === "default") return "Sin Borde";
  const border = getBorderById(borderId);
  return border ? border.name : borderId;
}

export function getRandomBorderByRarity(chestType: "COMUN" | "RARO" | "EPICO"): BorderItem {
  const rand = Math.random();

  if (chestType === "COMUN") {
    const pool = BORDERS_CATALOG.filter(b => b.rarity === "COMUN");
    return pool[Math.floor(rand * pool.length)] || BORDERS_CATALOG[0];
  } else if (chestType === "RARO") {
    const pool = BORDERS_CATALOG.filter(b => b.rarity === "RARO");
    return pool[Math.floor(rand * pool.length)] || BORDERS_CATALOG[1];
  } else {
    // EPICO
    const pool = BORDERS_CATALOG.filter(b => b.rarity === "EPICO" && b.id !== "gold");
    return pool[Math.floor(rand * pool.length)] || BORDERS_CATALOG[0];
  }
}

export function getTitleById(titleId?: string | null): TitleItem | undefined {
  if (!titleId) return undefined;
  return TITLES_CATALOG.find(t => t.id === titleId);
}
