import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const main = async () => {
  try {
    // 1. Corregir el order de las lecciones para que sea secuencial dentro de cada unidad
    const units = await sql`SELECT DISTINCT unit_id FROM lessons ORDER BY unit_id;`;
    
    for (const u of units) {
      const lessonsInUnit = await sql`
        SELECT id, title, "order" FROM lessons 
        WHERE unit_id = ${u.unit_id} 
        ORDER BY "order";
      `;
      
      for (let i = 0; i < lessonsInUnit.length; i++) {
        const newOrder = i + 1;
        if (lessonsInUnit[i].order !== newOrder) {
          await sql`UPDATE lessons SET "order" = ${newOrder} WHERE id = ${lessonsInUnit[i].id};`;
          console.log(`  Corregido: "${lessonsInUnit[i].title}" order ${lessonsInUnit[i].order} → ${newOrder}`);
        }
      }
    }

    // 2. Sincronizar secuencias
    await sql`SELECT setval(pg_get_serial_sequence('units', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM units;`;
    await sql`SELECT setval(pg_get_serial_sequence('lessons', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM lessons;`;
    await sql`SELECT setval(pg_get_serial_sequence('challenges', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM challenges;`;
    await sql`SELECT setval(pg_get_serial_sequence('challenge_options', 'id'), coalesce(max(id)::bigint, 1::bigint)) FROM challenge_options;`;

    console.log("\n✅ Correcciones aplicadas.");

    // 3. Mostrar estado final
    const finalLessons = await sql`
      SELECT l.id, l.title, l.unit_id, l."order", u.title as unit_title
      FROM lessons l
      JOIN units u ON u.id = l.unit_id
      ORDER BY l.unit_id, l."order";
    `;
    console.log("\n=== Estado final de lecciones ===");
    for (const l of finalLessons) {
      console.log(`  [${l.unit_title}] order:${l.order} → "${l.title}" (ID:${l.id})`);
    }

  } catch (error) {
    console.error(error);
  }
};

main();
