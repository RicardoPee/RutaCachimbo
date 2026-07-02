"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { isAdminId } from "@/lib/admin";

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
  
  if (!isAdminId(userId)) {
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
