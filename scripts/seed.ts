import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
// @ts-ignore
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("Limpiando y reseteando base de datos para la Tesis...");

    // 1. Limpiar todo
    await db.delete(schema.courses);
    await db.delete(schema.userProgress);
    await db.delete(schema.units);
    await db.delete(schema.lessons);
    await db.delete(schema.challenges);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.userSubscription);

    // 2. Crear Cursos (Materias Preuniversitarias)
    await db.insert(schema.courses).values([
      { id: 1, title: "Comprensión Lectora", imageSrc: "/es.svg" },
      { id: 2, title: "Filosofía", imageSrc: "/it.svg" },
      { id: 3, title: "Historia del Perú", imageSrc: "/fr.svg" },
      { id: 4, title: "Ciencias", imageSrc: "/hr.svg" },
    ]);

    // 3. Crear Unidades (Niveles de Dificultad para el Curso 1)
    await db.insert(schema.units).values([
      {
        id: 1,
        courseId: 1, // Razonamiento Verbal
        title: "Nivel Básico",
        description: "Textos Narrativos y Descriptivos",
        order: 1,
      },
      {
        id: 2,
        courseId: 1, // Razonamiento Verbal
        title: "Nivel Intermedio",
        description: "Textos Expositivos y Científicos",
        order: 2,
      },
      {
        id: 3,
        courseId: 1, // Razonamiento Verbal
        title: "Nivel Avanzado",
        description: "Textos Argumentativos y Ensayos",
        order: 3,
      }
    ]);

    // 4. Crear Lecciones (Lecturas) vacías de preguntas
    await db.insert(schema.lessons).values([
      // Unidad 1 (Básico)
      { id: 1, unitId: 1, order: 1, title: "Mitos y Leyendas" },
      { id: 2, unitId: 1, order: 2, title: "Cuentos Andinos" },
      { id: 3, unitId: 1, order: 3, title: "Biografías" },
      // Unidad 2 (Intermedio)
      { id: 4, unitId: 2, order: 1, title: "La Revolución Industrial" },
      { id: 5, unitId: 2, order: 2, title: "El Cambio Climático" },
      // Unidad 3 (Avanzado)
      { id: 6, unitId: 3, order: 1, title: "Ensayo sobre la Libertad" },
    ]);

    // NO VAMOS A INSERTAR NINGÚN RETO (CHALLENGES) NI OPCIONES
    // Esto asegurará que todas las lecciones estén vacías para que Gemini
    // genere las preguntas a partir del panel de administración.

    console.log("¡Base de datos reseteada con éxito!");
  } catch (error) {
    console.error(error);
    throw new Error("Fallo al resetear la base de datos");
  }
};

main();
