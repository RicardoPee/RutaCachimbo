"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

type ChallengeOptionInput = {
  text: string;
  correct: boolean;
  imageSrc?: string | null;
  audioSrc?: string | null;
  explanation?: string | null;
};

export async function upsertChallenge(data: { 
  id?: number; 
  lessonId: number; 
  type: "SELECT" | "ASSIST"; 
  question: string; 
  order: number;
  challengeOptions?: ChallengeOptionInput[];
}) {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    throw new Error("Unauthorized");
  }

  try {
    if (data.id) {
      const updated = await prisma.challenge.update({
        where: { id: data.id },
        data: { 
          lessonId: data.lessonId, 
          type: data.type, 
          question: data.question,
          order: data.order
        },
      });

      if (data.challengeOptions) {
        await prisma.challengeOption.deleteMany({ where: { challengeId: data.id } });
        if (data.challengeOptions.length > 0) {
          await prisma.challengeOption.createMany({
            data: data.challengeOptions.map(opt => ({
              challengeId: data.id as number,
              text: opt.text,
              correct: opt.correct,
              imageSrc: opt.imageSrc || null,
              audioSrc: opt.audioSrc || null,
              explanation: opt.explanation || null
            }))
          });
        }
      }

      revalidatePath("/admin/challenges");
      revalidatePath("/learn");
      return updated;
    } else {
      const created = await prisma.challenge.create({
        data: { 
          lessonId: data.lessonId, 
          type: data.type, 
          question: data.question,
          order: data.order,
          challengeOptions: data.challengeOptions ? {
            create: data.challengeOptions.map(opt => ({
              text: opt.text,
              correct: opt.correct,
              imageSrc: opt.imageSrc || null,
              audioSrc: opt.audioSrc || null,
              explanation: opt.explanation || null
            }))
          } : undefined
        },
      });
      revalidatePath("/admin/challenges");
      revalidatePath("/learn");
      return created;
    }
  } catch (error) {
    throw new Error("Failed to save challenge");
  }
}

export async function deleteChallenge(id: number) {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.challenge.delete({
      where: { id },
    });
    revalidatePath("/admin/challenges");
    revalidatePath("/learn");
  } catch (error) {
    throw new Error("Failed to delete challenge");
  }
}
