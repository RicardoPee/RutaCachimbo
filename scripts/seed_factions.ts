import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Factions...");

  const factions = [
    {
      name: "San Marcos (UNMSM)",
      description: "La Decana de América. Para los aspirantes con sed de historia y excelencia.",
      logoSrc: "/mascot.svg"
    },
    {
      name: "La Élite de la UNI",
      description: "Para los mentes brillantes de ingeniería y ciencias exactas.",
      logoSrc: "/mascot.svg"
    },
    {
      name: "Legión PUCP",
      description: "Para los futuros líderes de la Pontificia Universidad Católica del Perú.",
      logoSrc: "/mascot.svg"
    }
  ];

  for (const f of factions) {
    await prisma.faction.upsert({
      where: { name: f.name },
      update: {},
      create: f
    });
  }

  console.log("Factions seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
