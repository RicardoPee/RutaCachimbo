import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { PlayClient } from "./play-client";
import { prisma } from "@/lib/prisma";

export default async function TournamentPlayPage() {
  const { userId } = auth();
  if (!userId) redirect("/learn");

  const user = await prisma.userProgress.findUnique({
    where: { userId },
    include: { faction: true }
  });

  if (!user || !user.factionId) {
    redirect("/factions");
  }

  // Find user data to pass to the client
  const clerkUser = await clerkClient.users.getUser(userId);

  return (
    <div className="w-full flex justify-center min-h-screen bg-slate-900 pb-20">
      <PlayClient 
        currentUser={{
           id: userId,
           firstName: clerkUser.firstName,
           imageUrl: clerkUser.imageUrl,
           faction: user.faction
        }} 
      />
    </div>
  );
}
