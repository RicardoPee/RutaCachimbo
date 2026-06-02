import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Fixing null values in database for legacy users...");
  
  await prisma.$executeRawUnsafe(`UPDATE user_progress SET last_active = NOW() WHERE last_active IS NULL;`);
  await prisma.$executeRawUnsafe(`UPDATE user_progress SET streak = 0 WHERE streak IS NULL;`);
  
  try {
     await prisma.$executeRawUnsafe(`UPDATE user_progress SET unlocked_achievements = '{}' WHERE unlocked_achievements IS NULL;`);
  } catch(e) {
     console.log("Error silencioso en achievements array:", e);
  }
  
  console.log("Database patched successfully!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
