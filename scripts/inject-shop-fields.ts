import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  await client.query(`
    ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS streak_freeze BOOLEAN DEFAULT false;
    ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS xp_booster_ends_at TIMESTAMP;
    ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS owned_borders TEXT[] DEFAULT '{}';
  `);
  console.log("Campos de tienda inyectados correctamente.");
  await client.end();
}
main().catch(console.error);
