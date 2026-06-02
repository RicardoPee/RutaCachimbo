import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { NewWarForm } from "./new-war-form";

export default async function NewWarPage() {
  const { userId } = auth();
  const adminId = process.env.ADMIN_USER_ID;

  if (userId !== adminId) {
    redirect("/");
  }

  // Fetch lessons that have reference text and SELECT challenges
  const availableLessons = await prisma.lesson.findMany({
    where: {
      referenceText: { not: null },
      challenges: { some: { type: "SELECT" } }
    },
    select: {
      id: true,
      title: true,
      referenceText: true
    },
    orderBy: { order: 'asc' }
  });

  return <NewWarForm availableLessons={availableLessons} />;
}
