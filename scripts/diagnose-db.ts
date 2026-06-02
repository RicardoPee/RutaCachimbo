import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const main = async () => {
  try {
    // 1. Verificar unidades
    const units = await sql`SELECT id, title, course_id, "order" FROM units ORDER BY "order";`;
    console.log("\n=== UNIDADES ===");
    for (const u of units) {
      console.log(`  [ID:${u.id}] ${u.title} (course:${u.course_id}, order:${u.order})`);
    }

    // 2. Verificar lecciones con conteo de challenges
    const lessons = await sql`
      SELECT l.id, l.title, l.unit_id, l."order", 
             LENGTH(l.reference_text) as text_length,
             COUNT(c.id) as challenge_count
      FROM lessons l
      LEFT JOIN challenges c ON c.lesson_id = l.id
      GROUP BY l.id, l.title, l.unit_id, l."order", l.reference_text
      ORDER BY l.unit_id, l."order";
    `;
    console.log("\n=== LECCIONES ===");
    for (const l of lessons) {
      const hasText = Number(l.text_length || 0) > 0 ? "✅ con texto" : "❌ sin texto";
      const hasChallenges = Number(l.challenge_count) > 0 ? `✅ ${l.challenge_count} preguntas` : "❌ sin preguntas";
      console.log(`  [ID:${l.id}] ${l.title} (unit:${l.unit_id}, order:${l.order}) → ${hasText}, ${hasChallenges}`);
    }

    // 3. Verificar challenges con opciones
    const challenges = await sql`
      SELECT c.id, c.question, c.lesson_id, c."order", c.type,
             COUNT(co.id) as option_count,
             SUM(CASE WHEN co.correct THEN 1 ELSE 0 END) as correct_count
      FROM challenges c
      LEFT JOIN challenge_options co ON co.challenge_id = c.id
      GROUP BY c.id, c.question, c.lesson_id, c."order", c.type
      ORDER BY c.lesson_id, c."order";
    `;
    console.log("\n=== CHALLENGES ===");
    for (const c of challenges) {
      const optStatus = Number(c.option_count) > 0 ? `${c.option_count} opciones (${c.correct_count} correctas)` : "❌ SIN OPCIONES";
      console.log(`  [ID:${c.id}] Lesson:${c.lesson_id} → "${c.question?.substring(0,60)}..." → ${optStatus}`);
    }

    // 4. Verificar progreso
    const progress = await sql`SELECT * FROM user_progress;`;
    console.log("\n=== USER PROGRESS ===");
    for (const p of progress) {
      console.log(`  User: ${p.user_name} (${p.user_id?.substring(0,12)}...) → ${p.points}XP, ${p.hearts}❤️, course:${p.active_course_id}`);
    }

    // 5. Verificar challenge progress
    const cp = await sql`SELECT COUNT(*) as total, SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed FROM challenge_progress;`;
    console.log("\n=== CHALLENGE PROGRESS ===");
    console.log(`  Total: ${cp[0].total}, Completados: ${cp[0].completed}`);

    // 6. Verificar secuencias
    const seqs = await sql`
      SELECT 'units' as tbl, last_value FROM units_id_seq
      UNION ALL SELECT 'lessons', last_value FROM lessons_id_seq
      UNION ALL SELECT 'challenges', last_value FROM challenges_id_seq
      UNION ALL SELECT 'challenge_options', last_value FROM challenge_options_id_seq;
    `;
    console.log("\n=== SECUENCIAS ===");
    for (const s of seqs) {
      console.log(`  ${s.tbl}_id_seq → last_value: ${s.last_value}`);
    }

    console.log("\n✅ Diagnóstico completado.");
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
