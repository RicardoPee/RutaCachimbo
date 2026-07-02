import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewWarForm } from "./new-war-form";
import { isAdminId } from "@/lib/admin";

export default async function NewWarPage() {
  const { userId } = auth();
    if (!isAdminId(userId)) {
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
