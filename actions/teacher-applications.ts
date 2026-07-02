"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const submitTeacherApplication = async (proofUrl: string, description: string) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("No estás autenticado.");
  }

  const existingApplication = await prisma.teacherApplication.findFirst({
    where: { userId },
  });

  if (existingApplication && existingApplication.status === "PENDING") {
    return { error: "Ya tienes una solicitud en revisión." };
  }

  if (existingApplication && existingApplication.status === "APPROVED") {
    return { error: "Ya eres profesor." };
  }

  if (existingApplication && existingApplication.status === "REJECTED") {
    // Si fue rechazada, puede volver a intentar actualizando la URL
    await prisma.teacherApplication.update({
      where: { id: existingApplication.id },
      data: { proofUrl, description, status: "PENDING" },
    });
  } else {
    await prisma.teacherApplication.create({
      data: { userId, proofUrl, description },
    });
  }

  revalidatePath("/teacher/apply");
  return { success: true };
};

export const approveApplication = async (applicationId: number, userId: string) => {
  if (!isAdmin()) {
    return { error: "No autorizado" };
  }

  await prisma.$transaction([
    prisma.teacherApplication.update({
      where: { id: applicationId },
      data: { status: "APPROVED" },
    }),
    prisma.userProgress.update({
      where: { userId },
      data: { isTeacher: true },
    }),
  ]);

  revalidatePath("/admin-panel/teachers");
  return { success: true };
};

export const rejectApplication = async (applicationId: number) => {
  if (!isAdmin()) {
    return { error: "No autorizado" };
  }

  await prisma.teacherApplication.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin-panel/teachers");
  return { success: true };
};
