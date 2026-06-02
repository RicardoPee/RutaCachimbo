import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Creating pvp_matches table safely via Raw SQL...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS pvp_matches (
      id SERIAL PRIMARY KEY,
      code VARCHAR(10) UNIQUE NOT NULL,
      status VARCHAR(20) DEFAULT 'NEGOTIATING',
      player1_id VARCHAR(255) NOT NULL,
      player2_id VARCHAR(255),
      current_turn_id VARCHAR(255),
      current_question_index INT DEFAULT 0,
      questions JSONB,
      player1_score INT DEFAULT 0,
      player2_score INT DEFAULT 0,
      wager_points INT DEFAULT 0,
      p1_wager_proposal INT,
      p2_wager_proposal INT,
      p1_ready BOOLEAN DEFAULT false,
      p2_ready BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("pvp_matches table injected successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
