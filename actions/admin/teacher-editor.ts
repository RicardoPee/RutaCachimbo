"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isAdminId } from "@/lib/admin";

// Validar que el usuario es el creador del aula que contiene el curso/lección/pregunta
async function validateTeacherPermission(id: number, type: "lesson" | "challenge") {
  const { userId } = auth();
  if (!userId) throw new Error("No estás autenticado.");
  if (isAdminId(userId)) return true; // Administrador global

  if (type === "lesson") {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            course: {
              include: {
                classroom: true
              }
            }
          }
        }
      }
    });
    if (!lesson) throw new Error("Lección no encontrada.");
    
    // Si es un curso global, solo el admin puede editarlo
    if (!lesson.unit.course.classroomId) {
      throw new Error("No tienes permisos para editar cursos globales.");
    }

    if (lesson.unit.course.classroom?.teacherId !== userId) {
      throw new Error("No tienes permisos para modificar el contenido de esta aula.");
    }
  } else if (type === "challenge") {
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            unit: {
              include: {
                course: {
                  include: {
                    classroom: true
                  }
                }
              }
            }
          }
        }
      }
    });
    if (!challenge) throw new Error("Pregunta no encontrada.");
    
    if (!challenge.lesson.unit.course.classroomId) {
      throw new Error("No tienes permisos para editar cursos globales.");
    }

    if (challenge.lesson.unit.course.classroom?.teacherId !== userId) {
      throw new Error("No tienes permisos para modificar el contenido de esta aula.");
    }
  }

  return true;
}

export const updateLessonTitle = async (id: number, title: string, referenceText?: string) => {
  await validateTeacherPermission(id, "lesson");

  const updated = await prisma.lesson.update({
    where: { id },
    data: {
      title,
      referenceText: referenceText ?? null
    }
  });

  revalidatePath("/teacher/classrooms");
  revalidatePath("/learn");
  return { success: true, updated };
};

export const deleteLesson = async (id: number) => {
  await validateTeacherPermission(id, "lesson");

  await prisma.lesson.delete({
    where: { id }
  });

  revalidatePath("/teacher/classrooms");
  revalidatePath("/learn");
  return { success: true };
};

export const updateChallengeText = async (id: number, question: string) => {
  await validateTeacherPermission(id, "challenge");

  const updated = await prisma.challenge.update({
    where: { id },
    data: { question }
  });

  revalidatePath("/teacher/classrooms");
  revalidatePath("/learn");
  return { success: true, updated };
};

export const deleteChallenge = async (id: number) => {
  await validateTeacherPermission(id, "challenge");

  await prisma.challenge.delete({
    where: { id }
  });

  revalidatePath("/teacher/classrooms");
  revalidatePath("/learn");
  return { success: true };
};

export const updateChallengeOptions = async (
  challengeId: number, 
  options: { id?: number; text: string; correct: boolean }[]
) => {
  await validateTeacherPermission(challengeId, "challenge");

  // Eliminar todas las opciones previas y recrearlas para mayor robustez
  await prisma.challengeOption.deleteMany({
    where: { challengeId }
  });

  await prisma.challengeOption.createMany({
    data: options.map(opt => ({
      challengeId,
      text: opt.text,
      correct: opt.correct
    }))
  });

  revalidatePath("/teacher/classrooms");
  revalidatePath("/learn");
  return { success: true };
};
