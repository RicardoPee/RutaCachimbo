import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const main = async () => {
  try {
    // 1. Ver qué lecciones existen y cuántas preguntas tiene cada una
    const allLessons = await sql`
      SELECT l.id, l.title, l.unit_id, 
             COUNT(c.id) as challenge_count
      FROM lessons l
      LEFT JOIN challenges c ON c.lesson_id = l.id
      GROUP BY l.id, l.title, l.unit_id
      ORDER BY l.unit_id, l.order;
    `;
    
    console.log("=== Estado actual de lecciones ===");
    for (const l of allLessons) {
      const status = Number(l.challenge_count) > 0 ? "✅ CON PREGUNTAS" : "❌ VACÍA";
      console.log(`  [Unit ${l.unit_id}] ${l.title} → ${l.challenge_count} preguntas ${status}`);
    }

    // 2. Eliminar lecciones que NO tienen ningún challenge (están vacías)
    const emptyLessons = allLessons.filter(l => Number(l.challenge_count) === 0);
    
    if (emptyLessons.length > 0) {
      const emptyIds = emptyLessons.map(l => l.id);
      console.log(`\nEliminando ${emptyLessons.length} lecciones vacías: ${emptyIds.join(", ")}`);
      
      await sql`DELETE FROM lessons WHERE id = ANY(${emptyIds});`;
      console.log("✅ Lecciones vacías eliminadas.");
    } else {
      console.log("\n✅ No hay lecciones vacías que eliminar.");
    }

    // 3. También eliminar el progreso de challenges huérfanos si existe
    await sql`
      DELETE FROM challenge_progress 
      WHERE challenge_id NOT IN (SELECT id FROM challenges);
    `;

    // 4. Sincronizar secuencias
    await sql`SELECT setval(pg_get_serial_sequence('lessons', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM lessons;`;
    await sql`SELECT setval(pg_get_serial_sequence('challenges', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM challenges;`;
    await sql`SELECT setval(pg_get_serial_sequence('challenge_options', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM challenge_options;`;

    // 5. Mostrar estado final
    const remaining = await sql`
      SELECT l.id, l.title, l.unit_id, u.title as unit_title,
             COUNT(c.id) as challenge_count
      FROM lessons l
      JOIN units u ON u.id = l.unit_id
      LEFT JOIN challenges c ON c.lesson_id = l.id
      GROUP BY l.id, l.title, l.unit_id, u.title
      ORDER BY l.unit_id, l.order;
    `;

    console.log("\n=== Estado final ===");
    for (const l of remaining) {
      console.log(`  [${l.unit_title}] ${l.title} → ${l.challenge_count} preguntas`);
    }
    console.log(`\nTotal: ${remaining.length} lecciones activas`);

  } catch (error) {
    console.error(error);
  }
};

main();
