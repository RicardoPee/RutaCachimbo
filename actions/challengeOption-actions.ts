"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

export async function upsertChallengeOption(data: { 
  id?: number; 
  challengeId: number; 
  text: string; 
  correct: boolean; 
  imageSrc?: string | null; 
  audioSrc?: string | null; 
  explanation?: string | null 
}) {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    throw new Error("Unauthorized");
  }

  try {
    if (data.id) {
      const updated = await prisma.challengeOption.update({
        where: { id: data.id },
        data: { 
          challengeId: data.challengeId, 
          text: data.text, 
          correct: data.correct, 
          imageSrc: data.imageSrc || null, 
          audioSrc: data.audioSrc || null, 
          explanation: data.explanation || null 
        },
      });
      revalidatePath("/admin/challengeOptions");
      revalidatePath("/learn");
      return updated;
    } else {
      const created = await prisma.challengeOption.create({
        data: { 
          challengeId: data.challengeId, 
          text: data.text, 
          correct: data.correct, 
          imageSrc: data.imageSrc || null, 
          audioSrc: data.audioSrc || null, 
          explanation: data.explanation || null 
        },
      });
      revalidatePath("/admin/challengeOptions");
      revalidatePath("/learn");
      return created;
    }
  } catch (error) {
    throw new Error("Failed to save challenge option");
  }
}
