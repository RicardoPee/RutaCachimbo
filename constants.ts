// ─── Modelo de IA ────────────────────────────────────────────
export const AI_MODEL = "gemini-2.5-flash";

// ─── Economía del juego ──────────────────────────────────────
export const MAX_HEARTS = 5;
export const POINTS_TO_REFILL = 10;
export const POINTS_PER_CHALLENGE = 10;
export const POINTS_PER_MOCK_EXAM = 20;

// ─── PvP ─────────────────────────────────────────────────────
export const PVP_POINTS_PER_CORRECT = 10;
export const PVP_NEGOTIATION_TIMEOUT_MS = 10 * 60 * 1000;
export const PVP_MAX_TAB_SWITCHES = 3;

// ─── Ligas semanales ─────────────────────────────────────────
export const PROMOTION_ZONE = 10; // top N ascienden
export const DEMOTION_ZONE = 10;  // últimos N con 0 puntos descienden

// ─── Simulacros (puntuación estilo UNMSM) ────────────────────
export const MOCK_EXAM_POINTS_CORRECT = 20;
export const MOCK_EXAM_PENALTY_INCORRECT = 1.125;

// ─── Misiones semanales ──────────────────────────────────────
export const quests = [
  {
    title: "Gana 100 XP esta semana",
    value: 100,
    type: "XP",
  },
  {
    title: "Gana 500 XP esta semana",
    value: 500,
    type: "XP",
  },
  {
    title: "Gana 1000 XP esta semana",
    value: 1000,
    type: "XP",
  },
  {
    title: "Gana 2000 XP esta semana",
    value: 2000,
    type: "XP",
  },
];
