import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log("Iniciando alteración segura de la base de datos...");
    await pool.query(`ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS streak integer NOT NULL DEFAULT 0;`);
    await pool.query(`ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_active timestamp;`);
    await pool.query(`ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS unlocked_achievements text[] NOT NULL DEFAULT '{}';`);
    console.log("¡Columnas añadidas exitosamente!");
  } catch (error) {
    console.error("Error al alterar la base de datos:", error);
  } finally {
    await pool.end();
  }
}

main();
