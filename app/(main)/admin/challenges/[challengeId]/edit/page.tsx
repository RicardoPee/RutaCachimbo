import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChallengeForm } from "@/components/admin/challenge-form";

export default async function EditChallengePage({ params }: { params: { challengeId: string } }) {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    redirect("/");
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: parseInt(params.challengeId) },
    include: { challengeOptions: true }
  });

  if (!challenge) {
    redirect("/admin/challenges");
  }

  const lessons = await prisma.lesson.findMany({ 
    include: { unit: { include: { course: true } } },
    orderBy: [{ unitId: 'asc' }, { order: 'asc' }]
  });

  return <ChallengeForm initialData={challenge as any} lessons={lessons} />;
}
