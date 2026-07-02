import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChallengeForm } from "@/components/admin/challenge-form";
import { isAdminId } from "@/lib/admin";

export default async function NewChallengePage() {
  const { userId } = auth();
  
  if (!isAdminId(userId)) {
    redirect("/");
  }

  const lessons = await prisma.lesson.findMany({ 
    include: { unit: { include: { course: true } } },
    orderBy: [{ unitId: 'asc' }, { order: 'asc' }]
  });

  if (lessons.length === 0) {
    // Se requiere al menos una lección para crear un reto
    redirect("/admin/lessons");
  }

  return <ChallengeForm lessons={lessons} />;
}
