export const calculateNewStreak = (currentStreak: number, lastActive: Date | null, streakFreeze: boolean) => {
  const now = new Date();
  if (!lastActive) {
    return { newStreak: 1, usedFreeze: false, newLastActive: now };
  }

  const lastDate = new Date(lastActive);
  lastDate.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Ya estudió hoy, no suma racha extra
    return { newStreak: currentStreak, usedFreeze: false, newLastActive: now };
  } else if (diffDays === 1) {
    // Estudió días consecutivos
    return { newStreak: currentStreak + 1, usedFreeze: false, newLastActive: now };
  } else {
    // Faltó un día o más
    if (streakFreeze) {
      return { newStreak: currentStreak + 1, usedFreeze: true, newLastActive: now };
    } else {
      return { newStreak: 1, usedFreeze: false, newLastActive: now };
    }
  }
};
