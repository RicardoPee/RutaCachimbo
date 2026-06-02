import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!); 
// @ts-ignore
const db = drizzle(sql);

const main = async () => {
  try {
    console.log("Sincronizando secuencias de PostgreSQL...");

    await sql`SELECT setval(pg_get_serial_sequence('courses', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM courses;`;
    await sql`SELECT setval(pg_get_serial_sequence('units', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM units;`;
    await sql`SELECT setval(pg_get_serial_sequence('lessons', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM lessons;`;
    await sql`SELECT setval(pg_get_serial_sequence('challenges', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM challenges;`;
    await sql`SELECT setval(pg_get_serial_sequence('challenge_options', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM challenge_options;`;

    console.log("Secuencias sincronizadas con éxito.");
  } catch (error) {
    console.error(error);
  }
};

main();
