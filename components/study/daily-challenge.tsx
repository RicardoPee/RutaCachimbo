import { getDailyChallenge } from "@/actions/game/daily-challenge-actions";
import { DailyChallengeCard } from "@/components/study/daily-challenge-card";

export async function DailyChallenge() {
  const data = await getDailyChallenge();

  // Si no hay pregunta disponible (BD vacía), no mostramos nada
  if (!data.success || !data.challenge) return null;

  return (
    <DailyChallengeCard
      challenge={data.challenge}
      alreadyClaimed={data.alreadyClaimed!}
      claimResult={data.claimResult!}
      date={data.date!}
      xpBonus={data.xpBonus!}
    />
  );
}
