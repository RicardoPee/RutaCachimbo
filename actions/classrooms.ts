"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { classrooms, classroomMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

  const [newClassroom] = await db.insert(classrooms).values({
    name,
    description,
    teacherId: userId,
    inviteCode,
  }).returning();

  revalidatePath("/teacher/classrooms");
  return newClassroom;
};

export const joinClassroom = async (inviteCode: string) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("No estás autenticado.");
  }

  const classroom = await db.query.classrooms.findFirst({
    where: eq(classrooms.inviteCode, inviteCode.toUpperCase()),
  });

  if (!classroom) {
    return { error: "Código de aula no válido." };
  }

  // Check if already a member
  const existingMember = await db.query.classroomMembers.findFirst({
    where: and(
      eq(classroomMembers.classroomId, classroom.id),
      eq(classroomMembers.userId, userId)
    ),
  });

  if (existingMember) {
    return { error: "Ya eres miembro de esta aula." };
  }

  await db.insert(classroomMembers).values({
    classroomId: classroom.id,
    userId,
  });

  revalidatePath("/courses");
  revalidatePath("/learn");

  return { success: true, classroomName: classroom.name };
};
