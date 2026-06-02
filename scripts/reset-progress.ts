import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const main = async () => {
  try {
    // Resetear TODO el progreso de challenges de todos los usuarios
    // para que empiecen desde cero con las lecciones reales
    const deleted = await sql`DELETE FROM challenge_progress RETURNING id;`;
    console.log(`✅ Se reseteó el progreso: ${deleted.length} registros eliminados.`);
    console.log("Los usuarios ahora empezarán desde la primera lección con contenido.");
  } catch (error) {
    console.error(error);
  }
};

main();
