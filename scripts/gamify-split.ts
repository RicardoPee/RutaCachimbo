import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando Gamify-Split: Fragmentador de Lecciones...");

  const units = await prisma.unit.findMany({
    include: {
      lessons: {
        include: {
          challenges: {
            orderBy: { order: 'asc' },
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  for (const unit of units) {
    let orderCounter = 1;
    
    // 1. Reorder and split existing lessons
    for (const lesson of unit.lessons) {
      const challenges = lesson.challenges;
      const CHUNK_SIZE = 4;
      
      if (challenges.length <= CHUNK_SIZE) {
        await prisma.lesson.update({ where: { id: lesson.id }, data: { order: orderCounter++ } });
        continue;
      }

      // Keep first chunk in original lesson
      const firstChunk = challenges.slice(0, CHUNK_SIZE);
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { title: `${lesson.title} (1)`, order: orderCounter++ }
      });

      // Move remaining chunks to new lessons
      for (let i = CHUNK_SIZE; i < challenges.length; i += CHUNK_SIZE) {
        const chunk = challenges.slice(i, i + CHUNK_SIZE);
        
        const newLesson = await prisma.lesson.create({
          data: {
            unitId: unit.id,
            title: `${lesson.title} (${Math.floor(i / CHUNK_SIZE) + 1})`,
            order: orderCounter++,
            referenceText: lesson.referenceText
          }
        });

        // Update challenges to point to new lesson
        for (const challenge of chunk) {
          await prisma.challenge.update({
            where: { id: challenge.id },
            data: { lessonId: newLesson.id }
          });
        }
      }
    }

    // 2. Pad to at least 15 lessons to make the "Snake" look good
    const currentLessonsCount = orderCounter - 1;
    if (currentLessonsCount > 0 && currentLessonsCount < 15) {
      console.log(`Unidad [${unit.title}] tiene ${currentLessonsCount} nodos. Generando nodos de relleno hasta 15...`);
      
      // We take the last lesson as template to clone
      const templateLesson = await prisma.lesson.findFirst({
        where: { unitId: unit.id },
        include: { challenges: { include: { challengeOptions: true } } }
      });

      if (templateLesson && templateLesson.challenges.length > 0) {
        for (let i = currentLessonsCount + 1; i <= 15; i++) {
          const paddedLesson = await prisma.lesson.create({
            data: {
              unitId: unit.id,
              title: `Práctica Rápida ${i}`,
              order: orderCounter++,
              referenceText: ""
            }
          });

          for (let j = 0; j < templateLesson.challenges.length; j++) {
            const tc = templateLesson.challenges[j];
            const newC = await prisma.challenge.create({
              data: {
                lessonId: paddedLesson.id,
                type: tc.type,
                question: tc.question,
                order: j + 1
              }
            });

            const options = tc.challengeOptions.map((opt: any) => ({
              challengeId: newC.id,
              text: opt.text,
              correct: opt.correct,
              imageSrc: opt.imageSrc,
              audioSrc: opt.audioSrc
            }));
            
            if(options.length > 0) {
                await prisma.challengeOption.createMany({ data: options });
            }
          }
        }
      }
    }
  }

  console.log("Proceso Gamify-Split terminado. ¡La serpiente ha crecido!");
}

main().catch(console.error);
