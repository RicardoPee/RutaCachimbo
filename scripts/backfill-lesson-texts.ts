import { prisma } from "../lib/prisma";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { AI_MODEL } from "../constants";

const GREEK_PHILOSOPHY_TEXT = `Hace más de 2500 años, en las costas del mar Egeo, surgió en la antigua Grecia una nueva forma de interrogar la realidad que cambiaría el destino de la humanidad. Los primeros pensadores griegos, conocidos como los filósofos presocráticos, buscaban explicaciones lógicas y naturales para los fenómenos del mundo que los rodeaba, distanciándose progresivamente de los relatos míticos y las explicaciones divinas predominantes en la época.

En lugar de atribuir los rayos a la furia de Zeus o los maremotos a la cólera de Poseidón, estos sabios intentaron encontrar el "arché" o principio fundamental de la naturaleza a través de la observación y el razonamiento sistemático. Este tránsito decisivo del "mythos" (el mito sagrado) al "logos" (la razón demostrativa) sentó las bases de la filosofía occidental y del método científico moderno.

Con el tiempo, las escuelas filosóficas de Atenas, lideradas por figuras inmortales como Sócrates, Platón y Aristóteles, ampliaron este campo de indagación desde la naturaleza física hacia la ética, la política, la lógica y el conocimiento humano, dejando un legado conceptual que sigue vigente hasta nuestros días.`;

const SCIENCE_TECH_TEXT = `En el siglo XXI, la convergencia entre la inteligencia artificial, la biotecnología y la robótica está transformando radicalmente las estructuras económicas y sociales a escala global. Herramientas de procesamiento de lenguaje natural y modelos generativos permiten ahora automatizar tareas cognitivas complejas que antes se consideraban exclusivas del intelecto humano.

Sin embargo, este acelerado desarrollo tecnológico plantea profundos dilemas éticos. Los sesgos en los algoritmos de aprendizaje automático, el impacto en el empleo tradicional y la privacidad de los datos personales son desafíos urgentes que requieren una regulación adecuada por parte de los Estados y organismos internacionales.

La educación moderna enfrenta así el reto imperativo de formar ciudadanos críticos capaces de navegar en la era de la información masiva, fomentando habilidades analíticas, pensamiento divergente y comprensión lectora profunda que no puedan ser sustituidas por sistemas automatizados.`;

const LITERARY_CRITICISM_TEXT = `La literatura no es únicamente un reflejo pasivo de la realidad social, sino un agente activo que moldea la conciencia cultural de las épocas. A través de la metáfora, la alegoría y la narrativa ficticia, los grandes autores logran explorar las tensiones universales de la condición humana: la justicia, el amor, el poder y la finitud.

El análisis de la comprensión lectora en el ámbito académico exige ir más allá de la mera decodificación literal de las palabras. Requiere una lectura inferencial y crítica capaz de desentrañar los subtextos, la intención comunicativa del autor y la estructura argumentativa de la obra.

El lector activo no consume pasivamente el texto; interactúa dialécticamente con él, cuestiona sus premisas, contrasta sus hipótesis con su propio bagaje de conocimientos y construye significados renovados que enriquecen su visión del mundo.`;

async function main() {
  console.log("🔍 Buscando lecciones sin texto de referencia...");

  const emptyLessons = await prisma.lesson.findMany({
    where: {
      OR: [
        { referenceText: null },
        { referenceText: "" },
      ],
    },
    include: {
      challenges: {
        include: {
          challengeOptions: true,
        },
      },
    },
  });

  console.log(`📌 Se encontraron ${emptyLessons.length} lecciones sin texto de referencia.`);

  let updatedCount = 0;

  for (const lesson of emptyLessons) {
    const questionsText = lesson.challenges.map(c => c.question).join(" ");
    let selectedText = SCIENCE_TECH_TEXT;

    if (questionsText.includes("griegos") || questionsText.includes("filosofía") || questionsText.includes("mundo")) {
      selectedText = GREEK_PHILOSOPHY_TEXT;
    } else if (questionsText.includes("literatura") || questionsText.includes("autor") || questionsText.includes("texto")) {
      selectedText = LITERARY_CRITICISM_TEXT;
    } else {
      // Intentar generar un texto personalizado usando la IA si hay preguntas
      if (process.env.GOOGLE_GENERATIVE_AI_API_KEY && lesson.challenges.length > 0) {
        try {
          const prompt = `Genera un texto corto de comprensión lectora (aproximadamente 250 palabras) en español que sirva de lectura de referencia para estas preguntas:
${lesson.challenges.map((c, i) => `${i + 1}. ${c.question}`).join("\n")}`;

          const { text } = await generateText({
            model: google(AI_MODEL),
            prompt,
          });

          if (text && text.trim().length > 50) {
            selectedText = text.trim();
          }
        } catch (err) {
          console.warn(`Generación por IA falló para lección ${lesson.id}, usando texto predeterminado.`);
        }
      }
    }

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { referenceText: selectedText },
    });

    updatedCount++;
    console.log(`✅ Lección ID ${lesson.id} (${lesson.title}) actualizada con texto de referencia (${selectedText.length} caracteres).`);
  }

  console.log(`🎉 ¡Proceso completado! ${updatedCount} lecciones fueron pobladas con textos de lectura.`);
}

main().catch(console.error);
