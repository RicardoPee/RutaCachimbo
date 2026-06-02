"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

export async function upsertCourse(data: { id?: number; title: string; imageSrc: string }) {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    throw new Error("Unauthorized");
  }

  try {
    if (data.id) {
      const updated = await prisma.course.update({
        where: { id: data.id },
        data: { title: data.title, imageSrc: data.imageSrc },
      });
      revalidatePath("/admin/courses");
      revalidatePath("/learn");
      revalidatePath("/courses");
      return updated;
    } else {
      const created = await prisma.course.create({
        data: { title: data.title, imageSrc: data.imageSrc },
      });
      revalidatePath("/admin/courses");
      revalidatePath("/learn");
      revalidatePath("/courses");
      return created;
    }
  } catch (error) {
    throw new Error("Failed to save course");
  }
}

export async function deleteCourse(id: number) {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.course.delete({
      where: { id },
    });
    revalidatePath("/admin/courses");
    revalidatePath("/learn");
    revalidatePath("/courses");
  } catch (error) {
    throw new Error("Failed to delete course");
  }
}
