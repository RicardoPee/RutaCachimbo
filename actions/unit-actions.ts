"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

export async function upsertUnit(data: { id?: number; title: string; description: string; courseId: number; order: number }) {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    throw new Error("Unauthorized");
  }

  try {
    if (data.id) {
      const updated = await prisma.unit.update({
        where: { id: data.id },
        data: { 
          title: data.title, 
          description: data.description, 
          courseId: data.courseId, 
          order: data.order 
        },
      });
      revalidatePath("/admin/units");
      revalidatePath("/learn");
      return updated;
    } else {
      const created = await prisma.unit.create({
        data: { 
          title: data.title, 
          description: data.description, 
          courseId: data.courseId, 
          order: data.order 
        },
      });
      revalidatePath("/admin/units");
      revalidatePath("/learn");
      return created;
    }
  } catch (error) {
    throw new Error("Failed to save unit");
  }
}

export async function deleteUnit(id: number) {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.unit.delete({
      where: { id },
    });
    revalidatePath("/admin/units");
    revalidatePath("/learn");
  } catch (error) {
    throw new Error("Failed to delete unit");
  }
}
