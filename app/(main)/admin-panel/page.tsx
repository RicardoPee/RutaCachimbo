import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { AdminDashboardClient } from "./client";

const AdminPanelPage = async () => {
  if (!isAdmin()) {
    redirect("/learn");
  }

  const [allUsers, allChallengeProgress, allChallenges, allLessons, allMockResults, classrooms, allClassroomsWithRelations] = await Promise.all([
    prisma.userProgress.findMany(),
    prisma.challengeProgress.findMany(),
    prisma.challenge.findMany(),
    prisma.lesson.findMany({
      include: {
        unit: true,
        challenges: {
          include: {
            challengeOptions: true,
          },
        },
      },
    }),
    prisma.mockExamResult.findMany({
      orderBy: { createdAt: "asc" }
    }),
    prisma.classroom.findMany({
      include: {
        members: true
      }
    }),
    prisma.classroom.findMany({
      include: {
        courses: {
          include: {
            units: {
              include: {
                lessons: {
                  include: {
                    challenges: {
                      include: {
                        challengeOptions: true
                      }
                    },
                    pdfDocument: true
                  }
                }
              }
            }
          }
        },
        pdfDocuments: {
          include: {
            lessons: {
              include: {
                challenges: {
                  include: {
                    challengeOptions: true
                  }
                }
              }
            }
          }
        }
      }
    })
  ]);

  // Serializar objetos para evitar problemas de paso Server->Client
  const serializedMockResults = allMockResults.map(r => ({
    id: r.id,
    userId: r.userId,
    score: r.score,
    correct: r.correct,
    incorrect: r.incorrect,
    blank: r.blank,
    timeSpent: r.timeSpent,
    createdAt: r.createdAt.toISOString()
  }));

  const serializedClassrooms = classrooms.map(c => ({
    id: c.id,
    name: c.name,
    userIds: c.members.map(m => m.userId)
  }));

  const serializedClassroomsWithRelations = allClassroomsWithRelations.map(c => {
    const teacherUser = allUsers.find(u => u.userId === c.teacherId);
    const teacherName = teacherUser ? teacherUser.userName : `Profesor (${c.teacherId.substring(0, 6)})`;

    return {
      id: c.id,
      name: c.name,
      description: c.description,
      inviteCode: c.inviteCode,
      teacherName,
      courses: c.courses.map(course => ({
        id: course.id,
        title: course.title,
        units: course.units.map(unit => ({
          id: unit.id,
          title: unit.title,
          lessons: unit.lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            referenceText: lesson.referenceText,
            pdfName: lesson.pdfDocument?.title || null,
            pdfUrl: lesson.pdfDocument?.url || null,
            challenges: lesson.challenges.map(chall => ({
              id: chall.id,
              question: chall.question,
              options: chall.challengeOptions.map(opt => ({
                id: opt.id,
                text: opt.text,
                correct: opt.correct
              }))
            }))
          }))
        }))
      })),
      pdfDocuments: c.pdfDocuments.map(doc => ({
        id: doc.id,
        title: doc.title,
        url: doc.url,
        createdAt: doc.createdAt.toISOString(),
        lessonsCount: doc.lessons.length,
        questions: doc.lessons.flatMap(l => l.challenges.map(ch => ({
          question: ch.question,
          options: ch.challengeOptions.map(o => ({ text: o.text, correct: o.correct }))
        })))
      }))
    };
  });

  // Procesamiento para la tesis (inicial/por defecto)
  const resultsByUser: Record<string, typeof allMockResults> = {};
  allMockResults.forEach((res) => {
    if (!resultsByUser[res.userId]) {
      resultsByUser[res.userId] = [];
    }
    resultsByUser[res.userId].push(res);
  });

  let totalPreTest = 0;
  let totalPostTest = 0;
  let usersWithProgressCount = 0;
  const userProgressDetails: { userName: string; preScore: number; postScore: number; diff: number; completedChallenges: number }[] = [];

  Object.entries(resultsByUser).forEach(([userId, userResults]) => {
    if (userResults.length >= 2) {
      const preTest = userResults[0];
      const postTest = userResults[userResults.length - 1];
      const userObj = allUsers.find(u => u.userId === userId);
      const userName = userObj ? userObj.userName : "Estudiante";
      const completed = allChallengeProgress.filter(cp => cp.userId === userId && cp.completed).length;

      totalPreTest += preTest.score;
      totalPostTest += postTest.score;
      usersWithProgressCount++;

      userProgressDetails.push({
        userName,
        preScore: Number(preTest.score.toFixed(2)),
        postScore: Number(postTest.score.toFixed(2)),
        diff: Number((postTest.score - preTest.score).toFixed(2)),
        completedChallenges: completed
      });
    }
  });

  const avgPreScore = usersWithProgressCount > 0 ? Number((totalPreTest / usersWithProgressCount).toFixed(2)) : 0;
  const avgPostScore = usersWithProgressCount > 0 ? Number((totalPostTest / usersWithProgressCount).toFixed(2)) : 0;
  const learningGain = Number((avgPostScore - avgPreScore).toFixed(2));

  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalBlank = 0;
  allMockResults.forEach((res) => {
    totalCorrect += res.correct;
    totalIncorrect += res.incorrect;
    totalBlank += res.blank;
  });

  const examIndexStats: Record<number, { sumScore: number; count: number }> = {};
  allMockResults.forEach((res) => {
    const userExams = resultsByUser[res.userId];
    const index = userExams.findIndex(x => x.id === res.id) + 1;
    if (!examIndexStats[index]) {
      examIndexStats[index] = { sumScore: 0, count: 0 };
    }
    examIndexStats[index].sumScore += res.score;
    examIndexStats[index].count++;
  });

  const examTrendData = Object.entries(examIndexStats).map(([idx, stat]) => ({
    name: `Simulacro ${idx}`,
    promedio: Number((stat.sumScore / stat.count).toFixed(2)),
    cantidad: stat.count
  })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const thesisStats = {
    avgPreScore,
    avgPostScore,
    learningGain,
    usersWithProgressCount,
    userProgressDetails,
    answersDistribution: [
      { name: "Correctas", value: totalCorrect, color: "#10b981" },
      { name: "Incorrectas", value: totalIncorrect, color: "#ef4444" },
      { name: "En Blanco", value: totalBlank, color: "#6b7280" }
    ],
    examTrendData
  };

  // Construir datos de usuarios
  const users = allUsers.map((user) => {
    const userCompletions = allChallengeProgress.filter(
      (cp) => cp.userId === user.userId && cp.completed
    );
    return {
      userId: user.userId,
      userName: user.userName,
      userImageSrc: user.userImageSrc,
      points: user.points,
      hearts: user.hearts,
      completedChallenges: userCompletions.length,
      totalChallenges: allChallenges.length,
    };
  });

  // Construir datos de lecciones con preguntas y respuestas
  const lessonsWithAnswers = allLessons
    .filter((l) => l.challenges.length > 0)
    .map((l) => ({
      id: l.id,
      title: l.title,
      unitTitle: l.unit?.title || "Sin unidad",
      referenceText: l.referenceText || "",
      challenges: l.challenges.map((c) => ({
        id: c.id,
        question: c.question,
        options: c.challengeOptions.map((opt) => ({
          text: opt.text,
          correct: opt.correct,
        })),
      })),
    }));

  const stats = {
    totalUsers: allUsers.length,
    totalLessons: lessonsWithAnswers.length,
    totalChallenges: allChallenges.length,
    totalCompletions: allChallengeProgress.filter((cp) => cp.completed).length,
  };

  return (
    <AdminDashboardClient
      users={users}
      lessons={lessonsWithAnswers}
      stats={stats}
      thesisStats={thesisStats}
      rawMockResults={serializedMockResults}
      classrooms={serializedClassrooms}
      classroomsWithRelations={serializedClassroomsWithRelations}
    />
  );
};

export default AdminPanelPage;
