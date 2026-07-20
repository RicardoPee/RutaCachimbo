import { prisma } from "@/lib/prisma";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
};

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_blood",
    name: "Primera Sangre",
    description: "Completa tu primer desafío correctamente.",
    icon: "🩸",
    xpBonus: 50,
  },
  {
    id: "disciplined_cachimbo",
    name: "Cachimbo Disciplinado",
    description: "Alcanza una racha de 7 días de estudio.",
    icon: "🔥",
    xpBonus: 200,
  },
  {
    id: "perfect_score",
    name: "Comprensión Perfecta",
    description: "Obtén un puntaje de 100% en un simulacro o lección.",
    icon: "💯",
    xpBonus: 300,
  },
  {
    id: "fast_reader",
    name: "Lector Veloz",
    description: "Termina un simulacro o lectura en menos de 5 minutos.",
    icon: "⚡",
    xpBonus: 150,
  },
];

/**
 * Verifica si el usuario cumple con las condiciones para desbloquear logros y los otorga.
 */
export async function checkAndUnlockAchievements(
  userId: string,
  context: {
    type: "challenge" | "streak" | "exam";
    challengeCount?: number;
    streakValue?: number;
    examScore?: number;
    examTimeSpent?: number; // en segundos
  }
): Promise<string[]> {
  try {
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!userProgress) return [];

    const unlocked = new Set(userProgress.unlockedAchievements || []);
    const newlyUnlocked: string[] = [];

    // 1. Primera Sangre
    if (!unlocked.has("first_blood")) {
      if (context.type === "challenge") {
        newlyUnlocked.push("first_blood");
      } else {
        const count = await prisma.challengeProgress.count({
          where: { userId, completed: true },
        });
        if (count >= 1) {
          newlyUnlocked.push("first_blood");
        }
      }
    }

    // 2. Cachimbo Disciplinado (Racha de 7 días)
    if (!unlocked.has("disciplined_cachimbo")) {
      const activeStreak = context.streakValue ?? userProgress.streak;
      if (activeStreak >= 7) {
        newlyUnlocked.push("disciplined_cachimbo");
      }
    }

    // 3. Comprensión Perfecta (100%)
    if (!unlocked.has("perfect_score")) {
      if (context.type === "exam" && context.examScore === 100) {
        newlyUnlocked.push("perfect_score");
      }
    }

    // 4. Lector Veloz (<5 minutos = 300 segundos)
    if (!unlocked.has("fast_reader")) {
      if (context.type === "exam" && context.examTimeSpent && context.examTimeSpent < 300) {
        newlyUnlocked.push("fast_reader");
      }
    }

    if (newlyUnlocked.length > 0) {
      const updatedUnlocked = Array.from(new Set([...unlocked, ...newlyUnlocked]));
      
      // Calcular XP adicional ganado por los nuevos logros
      const addedXp = newlyUnlocked.reduce((sum, id) => {
        const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
        return sum + (achievement?.xpBonus || 0);
      }, 0);

      await prisma.userProgress.update({
        where: { userId },
        data: {
          unlockedAchievements: updatedUnlocked,
          points: userProgress.points + addedXp,
        },
      });
    }

    return newlyUnlocked;
  } catch (error) {
    console.error("[CHECK_ACHIEVEMENTS_ERROR]", error);
    return [];
  }
}
