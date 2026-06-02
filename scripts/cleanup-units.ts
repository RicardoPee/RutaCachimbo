import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const main = async () => {
  try {
    // Eliminar unidades que NO sean las 3 originales (id 1, 2, 3)
    const result = await sql`DELETE FROM units WHERE id > 3 RETURNING id, title;`;
    console.log("Unidades eliminadas:", result);

    // Sincronizar secuencias
    await sql`SELECT setval(pg_get_serial_sequence('units', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM units;`;
    await sql`SELECT setval(pg_get_serial_sequence('lessons', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM lessons;`;
    await sql`SELECT setval(pg_get_serial_sequence('challenges', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM challenges;`;
    await sql`SELECT setval(pg_get_serial_sequence('challenge_options', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM challenge_options;`;

    console.log("✅ Limpieza completada. Solo quedan las unidades Básico, Intermedio y Avanzado.");
  } catch (error) {
    console.error(error);
  }
};

main();
