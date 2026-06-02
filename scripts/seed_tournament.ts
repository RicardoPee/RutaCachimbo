import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creando Torneo de Prueba...");

  // Borrar anteriores para evitar colisiones
  await prisma.liveTournament.deleteMany({});

  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() + 1); // Starts in 1 minute

  const tournament = await prisma.liveTournament.create({
    data: {
      title: "Gran Guerra de Universidades - Prueba Cero",
      description: "El evento masivo ha comenzado.",
      startTime: startTime,
      toleranceMinutes: 15,
      roundDuration: 20, // 20 seconds for faster testing!
      intermissionTime: 15, // 15 seconds leaderboard
      status: "PENDING"
    }
  });

  await prisma.tournamentQuestion.createMany({
    data: [
      {
        tournamentId: tournament.id,
        order: 1,
        readingText: "La historia de la universidad más antigua de América se remonta al siglo XVI. San Marcos fue fundada mediante Real Cédula...",
        questionText: "¿En qué siglo se fundó la universidad mencionada?",
        options: ["Siglo XV", "Siglo XVI", "Siglo XVII", "Siglo XVIII"],
        correctIndex: 1,
        basePoints: 100,
      },
      {
        tournamentId: tournament.id,
        order: 2,
        readingText: "La ingeniería civil y minera en el Perú tuvo su gran impulso con la fundación de la Escuela de Ingenieros.",
        questionText: "¿Qué disciplinas se impulsaron con la Escuela de Ingenieros?",
        options: ["Civil y Minera", "Sistemas y Software", "Medicina Humana", "Derecho"],
        correctIndex: 0,
        basePoints: 100,
      },
      {
        tournamentId: tournament.id,
        order: 3,
        readingText: "El avance de las ciencias de la salud es vital para el desarrollo social y económico del país.",
        questionText: "¿Para qué es vital el avance de las ciencias de la salud?",
        options: ["Para la milicia", "Para el desarrollo social y económico", "Para el turismo", "Para la industria espacial"],
        correctIndex: 1,
        basePoints: 100,
      }
    ]
  });

  console.log("¡Torneo creado exitosamente! Iniciará a las:", startTime.toLocaleTimeString());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
