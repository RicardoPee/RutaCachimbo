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
    CREATE TABLE IF NOT EXISTS "mock_exam_results" (
      "id" SERIAL NOT NULL,
      "user_id" TEXT NOT NULL,
      "score" DOUBLE PRECISION NOT NULL,
      "correct" INTEGER NOT NULL,
      "incorrect" INTEGER NOT NULL,
      "blank" INTEGER NOT NULL,
      "time_spent" INTEGER NOT NULL,
      "ai_feedback" TEXT,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "mock_exam_results_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log("Tabla mock_exam_results inyectada con exito.");
  await client.end();
}
main().catch(console.error);
