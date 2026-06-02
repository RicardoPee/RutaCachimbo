"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { teacherApplications, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";

export const submitTeacherApplication = async (proofUrl: string, description: string) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("No estás autenticado.");
  }

  const existingApplication = await db.query.teacherApplications.findFirst({
    where: eq(teacherApplications.userId, userId),
  });

  if (existingApplication && existingApplication.status === "PENDING") {
    return { error: "Ya tienes una solicitud en revisión." };
  }

  if (existingApplication && existingApplication.status === "APPROVED") {
    return { error: "Ya eres profesor." };
  }

  if (existingApplication && existingApplication.status === "REJECTED") {
    // Si fue rechazada, puede volver a intentar actualizando la URL
    await db.update(teacherApplications).set({
      proofUrl,
      description,
      status: "PENDING",
    }).where(eq(teacherApplications.id, existingApplication.id));
  } else {
    await db.insert(teacherApplications).values({
      userId,
      proofUrl,
      description,
    });
  }

  revalidatePath("/teacher/apply");
  return { success: true };
};

export const approveApplication = async (applicationId: number, userId: string) => {
  if (!isAdmin()) {
    return { error: "No autorizado" };
  }

  await db.update(teacherApplications)
    .set({ status: "APPROVED" })
    .where(eq(teacherApplications.id, applicationId));

  await db.update(userProgress)
    .set({ isTeacher: true })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/admin-panel/teachers");
  return { success: true };
};

export const rejectApplication = async (applicationId: number) => {
  if (!isAdmin()) {
    return { error: "No autorizado" };
  }

  await db.update(teacherApplications)
    .set({ status: "REJECTED" })
    .where(eq(teacherApplications.id, applicationId));

  revalidatePath("/admin-panel/teachers");
  return { success: true };
};
