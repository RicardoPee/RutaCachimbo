import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MistakesClient } from "./mistakes-client";

export default async function MistakesPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const mistakes = await prisma.mistakeLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return <MistakesClient mistakes={mistakes} />;
}
