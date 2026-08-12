"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function generateInviteCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createClassroom = async (name: string, description?: string) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("No estás autenticado.");
  }

  const inviteCode = generateInviteCode();

  const newClassroom = await prisma.classroom.create({
    data: {
      name,
      description,
      teacherId: userId,
      inviteCode,
    },
  });

  revalidatePath("/teacher/classrooms");
  return newClassroom;
};

export const joinClassroom = async (inviteCode: string) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("No estás autenticado.");
  }

  const classroom = await prisma.classroom.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
  });

  if (!classroom) {
    return { error: "Código de aula no válido." };
  }

  const existingMember = await prisma.classroomMember.findFirst({
    where: { classroomId: classroom.id, userId },
  });

  if (existingMember) {
    return { error: "Ya eres miembro de esta aula." };
  }

  await prisma.classroomMember.create({
    data: { classroomId: classroom.id, userId },
  });

  revalidatePath("/courses");
  revalidatePath("/learn");

  return { success: true, classroomName: classroom.name };
};

export const createClassroomCourse = async (classroomId: number, title: string) => {
  const { userId } = auth();
  if (!userId) throw new Error("No estás autenticado.");

  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId }
  });

  if (!classroom || classroom.teacherId !== userId) {
    throw new Error("No tienes permisos para esta aula.");
  }

  const course = await prisma.course.create({
    data: {
      title,
      imageSrc: "/mascot.svg",
      classroomId: classroom.id
    }
  });

  revalidatePath("/teacher/classrooms");
  revalidatePath("/courses");
  return course;
};
