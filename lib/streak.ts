function getPeruDateString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "America/Lima" }); // Retorna "YYYY-MM-DD"
}

export const calculateNewStreak = (currentStreak: number, lastActive: Date | null, streakFreeze: boolean) => {
  const now = new Date();
  if (!lastActive) {
    return { newStreak: 1, usedFreeze: false, newLastActive: now };
  }

  // Normalizar fechas al huso horario de Perú (America/Lima GMT-5)
  const todayStr = getPeruDateString(now);
  const lastActiveStr = getPeruDateString(new Date(lastActive));

  const todayDate = new Date(todayStr + "T00:00:00");
  const lastDate = new Date(lastActiveStr + "T00:00:00");

  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Ya estudió hoy (en horario local de Perú)
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
