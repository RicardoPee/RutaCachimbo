import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { PvpArenaClient } from "./pvp-arena-client";

export default async function PvpPlayPage({ params }: { params: { matchId: string } }) {
  const { userId } = auth();
  if (!userId) redirect("/learn");

  const matchId = parseInt(params.matchId);
  const match = await prisma.pvpMatch.findUnique({ where: { id: matchId } });
  
  if (!match) {
    redirect("/pvp");
  }

  const [p1Progress, p2Progress] = await Promise.all([
    prisma.userProgress.findUnique({ where: { userId: match.player1Id } }),
    match.player2Id ? prisma.userProgress.findUnique({ where: { userId: match.player2Id } }) : Promise.resolve(null)
  ]);

  return (
    <div className="w-full flex justify-center min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black pb-20">
      <PvpArenaClient 
        initialMatch={match} 
        currentUserId={userId} 
        p1Name={p1Progress?.userName || "Jugador 1"}
        p2Name={p2Progress?.userName || "Esperando rival..."}
      />
    </div>
  );
}
