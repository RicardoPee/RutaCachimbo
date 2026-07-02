# Rules
# Reglas del Asistente de Desarrollo

## Comunicación

- Responde siempre en español.
- Utiliza lenguaje técnico pero claro.
- Explica conceptos complejos de forma sencilla.
- Si existe más de una solución, explica ventajas y desventajas.
- Si falta información, pregunta antes de asumir requisitos.
- No inventes funcionalidades que no fueron solicitadas.

## Antes de Programar

1. Analiza el requerimiento.
2. Explica brevemente el plan de implementación.
3. Identifica posibles riesgos o impactos.
4. Luego genera el código.

## Desarrollo

- Escribe código limpio y mantenible.
- Sigue principios SOLID y DRY.
- Evita duplicar lógica.
- Utiliza nombres descriptivos para variables y funciones.
- Mantén una arquitectura modular.
- No agregues dependencias innecesarias.
- Prioriza la simplicidad antes que soluciones complejas.

## Calidad

- Verifica errores potenciales.
- Considera casos límite.
- Mantén consistencia con el proyecto.
- Explica los cambios realizados.
- Sugiere mejoras cuando aporten valor real.

## Git

- Propón nombres descriptivos para ramas.
- Genera mensajes de commit claros.
- Explica los conflictos antes de resolverlos.
- Nunca elimines código importante sin justificarlo.

## Seguridad

- Nunca expongas claves o secretos.
- Utiliza variables de entorno.
- Valida toda entrada del usuario.
- Considera buenas prácticas de seguridad desde el diseño.

## Respuestas

- Sé directo y preciso.
- Evita respuestas excesivamente largas.
- Incluye ejemplos cuando sean útiles.
- Prioriza soluciones prácticas.
- Actúa como un arquitecto de software senior.
- Ayúdame a tomar decisiones técnicas.
- Señala posibles problemas de escalabilidad.
- Recomienda buenas prácticas de desarrollo.
- Mantén documentación técnica cuando sea necesario.
- Piensa en producción desde el inicio.

---

# DIAGNÓSTICO TÉCNICO DEL PROYECTO

> **Fecha de análisis:** 2026-06-10
> **Proyecto:** Ruta Cachimbo
> **Stack:** Next.js 14 + PostgreSQL + Prisma + Drizzle + Clerk + Stripe + Pusher + Google AI

---

## 🔴 CRÍTICO - Problemas que deben resolverse AHORA

### CR-001: Admin check inseguro por variable de entorno

**Ubicación:** 
- `actions/tournament-actions.ts:8`
- `actions/admin-actions.ts` (asumido)

**Problema:**
```typescript
const adminId = process.env.ADMIN_USER_ID;
if (userId !== adminId) return { error: "No autorizado" };
```

Si `ADMIN_USER_ID` no está configurada en `.env`, la variable es `undefined`. Esto significa que `undefined !== userId` siempre es `true` para cualquier usuario autenticado, permitiendo que **cualquier usuario cree guerras, gestione tournaments, y acceda a funciones de admin**.

**Impacto:** SECURITY BREACH - Cualquier usuario autenticado puede ejecutar acciones de administrador.

**Solución:**
```typescript
// Verificar que la variable existe Y que el usuario coincide
const adminId = process.env.ADMIN_USER_ID;
if (!adminId || userId !== adminId) return { error: "No autorizado" };
```

**Archivos afectados:** `tournament-actions.ts`, `admin-actions.ts`, cualquier action que use este patrón.

---

### CR-002: Rate limiting ausente en Chat AI

**Ubicación:** `app/api/chat/route.ts:50`

**Problema:**
```typescript
const result = streamText({
  model: google("gemini-1.5-flash"),
  messages: coreMessages,
});
```

No hay límite de requests por usuario/minuto. Un usuario malicioso o un bug en el frontend puede spamear requests y agotar la cuota de la API de Google rápidamente, dejando la plataforma inoperativa para todos.

**Impacto:** DOS (Denial of Service) accidental o intencional. Costo financiero descontrolado.

**Solución:**
1. Implementar rate limiting con una librería como `upstash/ratelimit`
2. Limitar a 10 requests por minuto por usuario
3. Agregar validación del tamaño del mensaje

---

### CR-003: Mezcla de dos ORMs (Prisma + Drizzle)

**Ubicación:** 
- Prisma usado en: `actions/*.ts`, `lib/prisma.ts`
- Drizzle usado en: `app/api/webhooks/stripe/route.ts`, `actions/leaderboard.ts`, `db/drizzle.ts`

**Problema:**
El proyecto usa simultáneamente dos ORMs para acceder a la misma base de datos:

```typescript
// En stripe webhook - USA DRIZZLE
import db from "@/db/drizzle";
await db.insert(userSubscription).values({...});

// En pvp-actions.ts - USA PRISMA
import { prisma } from "@/lib/prisma";
await prisma.pvpMatch.create({...});
```

**Impacto:**
- Mantenimiento confuso (¿cuál uso?)
- Queries inconsistentes
- Migraciones potencialmente conflictivas
- Mayor bundle size (dos clientes de DB)
- Transacciones distribuidas imposibles entre ORMs

**Solución:**
Estandarizar a **un solo ORM** (recomiendo Prisma por su mejor DX y ecosistema). Migrar todas las consultas de Drizzle a Prisma.

**Archivos a migrar:**
- `app/api/webhooks/stripe/route.ts`
- `actions/leaderboard.ts`
- `db/drizzle.ts` (eliminar)
- `db/schema.ts` (¿? necesita revisión)

---

### CR-004: Middleware expone rutas admin sin verificación real

**Ubicación:** `middleware.ts:10`

**Problema:**
```typescript
publicRoutes: [
  "/",
  "/api/webhooks/stripe",
  "/learn",
  "/courses",
  "/lesson(.*)",
  "/admin(.*)",  // ← Demasiado amplio
  // ...
],
```

El patrón `/admin(.*)` permite que TODAS las rutas bajo `/admin` sean públicas. Si Clerk no valida correctamente en el servidor, cualquier persona podría acceder al panel de administración.

**Impacto:** Exposición de panel de administración si la validación del lado del servidor falla.

**Solución:**
1. Remover `/admin(.*)` de publicRoutes
2. En cada página de admin, verificar roles explícitamente con Clerk
3. Crear un middleware más específico o un guard de autenticación por componente

---

## 🟠 ALTO - Problemas que afectan escalabilidad

### AL-001: Loop N+1 en finishWeekAction (Leaderboard)

**Ubicación:** `actions/leaderboard.ts:36-55`

**Problema:**
```typescript
for (let i = 0; i < users.length; i++) {
  const user = users[i];
  // ... lógica
  await db.update(userProgress)
    .set({ league: newLeague as any, weeklyPoints: 0 })
    .where(eq(userProgress.userId, user.userId));
}
```

Si hay 10,000 usuarios, se ejecutan 10,000 queries SQL individuales.

**Impacto:** 
- Tiempo de ejecución: O(n) queries
- Con 10k usuarios: ~10 segundos mínimo
- Con 100k usuarios: ~2 minutos+, timeout probable

**Solución - Query masiva:**
```typescript
// Crear una tabla temporal o usar CASE en SQL
await db.execute(sql`
  UPDATE user_progress 
  SET league = CASE 
    WHEN row_number() OVER (ORDER BY weekly_points DESC) <= 10 
    THEN next_league(league) 
    ELSE league 
  END,
  weekly_points = 0
`);
```
O usar Prisma raw query con SQL directo.

---

### AL-002: Sin paginación en Tournament Leaderboard

**Ubicación:** `actions/tournament-actions.ts:327-335`

**Problema:**
```typescript
const participants = await prisma.tournamentParticipant.findMany({
  orderBy: { score: "desc" },
  take: 30,  // ← Hardcodeado, sin skip
});
```

Solo devuelve los primeros 30 participantes. Para torneos grandes con miles de jugadores, no hay manera de ver rankings más allá del top 30.

**Impacto:** UX limitada, no sirve para competencias reales.

**Solución:**
```typescript
interface LeaderboardFilters {
  tournamentId: number;
  page?: number;
  limit?: number; // default 30, max 100
}

// En la función:
const skip = ((page ?? 1) - 1) * (limit ?? 30);
const participants = await prisma.tournamentParticipant.findMany({
  where: { tournamentId },
  orderBy: { score: "desc" },
  take: limit ?? 30,
  skip,
});
// Devolver también: totalCount para calcular páginas
```

---

### AL-003: Sin índices en tablas de alta frecuencia

**Ubicación:** `prisma/schema.prisma` (modelos: `ChallengeProgress`, `TournamentParticipant`, `UserProgress`)

**Problema:**
No hay índices en columnas que se consultan frecuentemente:

```prisma
model ChallengeProgress {
  userId      String  // ← Sin índice, queries lentas
  challengeId Int    // ← Sin índice
}

model TournamentParticipant {
  userId       String  // ← Sin índice
  tournamentId Int     // ← Sin índice
  score        Int     // ← Sin índice para ORDER BY
}

model UserProgress {
  weeklyPoints Int     // ← Sin índice para ORDER BY
  streak       Int     // ← Sin índice
  league       League  // ← Sin índice
}
```

**Impacto:** Queries que ordenan o filtran por estas columnas son O(n) en lugar de O(log n).

**Solución - Agregar en schema.prisma:**
```prisma
model ChallengeProgress {
  // ... campos existentes
  @@index([userId, challengeId], name: "idx_challenge_progress_user_challenge")
}

model TournamentParticipant {
  // ... campos existentes
  @@index([tournamentId, score], name: "idx_tournament_participant_rank")
  @@index([userId, tournamentId], name: "idx_tournament_participant_user")
}

model UserProgress {
  // ... campos existentes
  @@index([weeklyPoints], name: "idx_user_progress_weekly")
  @@index([league], name: "idx_user_progress_league")
}
```

---

### AL-004: Actualizaciones PVP sin transacción atómica

**Ubicación:** `actions/pvp-actions.ts:181-190`

**Problema:**
```typescript
await prisma.pvpMatch.update({
  where: { id: matchId },
  data: {
    player1Score: newScore1,
    player2Score: newScore2,
    currentTurnId: nextTurn,
    currentQuestionIndex: nextQIndex,
    status
  }
});
// ← Si falla a mitad, estado incoherente
```

Si el servidor se cae después de actualizar `player1Score` pero antes de `player2Score`, el estado del match queda corrupto.

**Impacto:** Partidas PVP con scores inconsistentes, pérdida de datos.

**Solución:**
```typescript
await prisma.$transaction([
  prisma.pvpMatch.update({
    where: { id: matchId },
    data: { /* todos los campos */ }
  }),
  // Otras operaciones atómicas: logMistake, etc.
]);
```

---

### AL-005: Pusher trigger sin manejo de errores robusto

**Ubicación:** `actions/pvp-actions.ts:8-16`

**Problema:**
```typescript
const triggerMatchUpdate = async (matchId: number) => {
  if (pusherServer) {
    try {
      await pusherServer.trigger(`match-${matchId}`, "match-updated", {});
    } catch (e) {
      console.error("Pusher trigger error", e);  // ← Silently fails
    }
  }
};
```

Si Pusher falla:
- El cliente queda desincronizado
- El usuario ve un estado outdated
- No hay retry mechanism
- No hay fallback (guardar en cola, polling, etc.)

**Impacto:** UX roto en tiempo real, posibles "ghost moves".

**Solución:**
1. Implementar exponential backoff retry (3 intentos)
2. Guardar eventos fallidos en una cola (Redis/BullMQ)
3. Como fallback, implementar polling cada 5 segundos si WebSocket falla
4. Monitorear fallos de Pusher

---

## 🟡 MEDIO - Problemas de arquitectura

### MD-001: Actions god-like con lógica mezclada

**Ubicación:** `actions/pvp-actions.ts:132-193`

**Problema:**
La función `submitPvPAnswer` hace TODO en una sola función:
- Validación de auth
- Validación de estado del match
- Parsing de preguntas
- Lógica de puntuación
- Update de score
- Cambio de turno
- Detección de fin de partida
- Distribución de apuesta
- Logging de errores
- Trigger de Pusher

**Impacto:** 
- Imposible testear unitariamente
- Difícil de debuggear
- No reutilizable
- Cambios riesgosos

**Solución - Separar en capas:**
```typescript
// services/pvp.service.ts
export class PvPGameService {
  static calculateAnswerResult(question, answerIndex) {...}
  static determineNextTurn(currentTurn, isCorrect, ...) {...}
  static calculateFinalScores(score1, score2, wager) {...}
}

// repositories/pvp.repository.ts
export async function updateMatchState(matchId, data) {...}

// controllers/pvp.controller.ts
export async function submitPvPAnswer(matchId, answerIndex, userId) {
  // Solo coordina: validar → servicio → repo → respuesta
}
```

---

### MD-002: Sin validación de schemas en APIs

**Ubicación:** `app/api/chat/route.ts:28`

**Problema:**
```typescript
const { messages } = await req.json();
// ← Sin Zod validation, array vacío o malformado crashea
```

**Impacto:** 
- Crashes con input inesperado
- Posible XSS o injection si no se sanitiza
- Errores 500 en producción

**Solución:**
```typescript
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(10000),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).max(100),
});

const parseResult = ChatRequestSchema.safeParse(await req.json());
if (!parseResult.success) {
  return new NextResponse("Invalid request", { status: 400 });
}
```

---

### MD-003: Webhook Stripe sin idempotency

**Ubicación:** `app/api/webhooks/stripe/route.ts:30-48`

**Problema:**
```typescript
if (event.type === "checkout.session.completed") {
  await db.insert(userSubscription).values({...});
  // ← Si el webhook se reintenta (Stripe lo hace), crea duplicates
}
```

Stripe reintenta webhooks hasta 72 horas. Si la primera llamada成功了 pero la respuesta no llegó a Stripe, se reintenta y crea un usuario con suscripción duplicada.

**Impacto:** Usuarios con múltiples registros de suscripción, posibles cobros duplicados.

**Solución:**
```typescript
// Usar upsert con conflict resolution
await db.insert(userSubscription).values({...}).onConflictDoUpdate({
  target: userSubscription.userId,
  set: { /* update fields */ }
});

// O verificar si existe antes
const existing = await db.query.userSubscription.findFirst({
  where: eq(userSubscription.stripeSubscriptionId, subscription.id)
});
if (existing) return new NextResponse("Already processed", { status: 200 });
```

---

### MD-004: Stores de Zustand sin persistencia

**Ubicación:** `store/use-exit-modal.ts`, `store/use-hearts-modal.ts`, `store/use-practice-modal.ts`

**Problema:**
```typescript
export const useExitModal = create<ExitModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
// ← Cada refresh pierde todo el estado
```

**Impacto:** 
- Si un usuario está en medio de un flow y actualiza, pierde el contexto
- Modal de "salir sin guardar" no funciona si se refrescó
- Estados de hearts se resetean

**Solución - Persist middleware:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useExitModal = create<ExitModalState>()(
  persist(
    (set) => ({
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: 'exit-modal' }
  )
);
```

---

### MD-005: Cron de leagues sin endpoint implementado

**Ubicación:** `app/api/cron/leagues/route.ts` (asumido existente)

**Problema:** Si el endpoint existe pero no está securizado o no se ejecuta, los rankings nunca se actualizan automáticamente.

**Impacto:** Leagues se quedan estáticos, usuarios no ascienden/desccienden.

**Solución:**
1. Crear un endpoint `/api/cron/finish-week` con authentication (secret header)
2. Llamar a `finishWeekAction()` desde ahí
3. Configurar en Vercel Cron o external scheduler (GitHub Actions, etc.)
4. Agregar logging para saber si se ejecutó

---

## 🟢 BAJO - Mejoras incrementales

### BN-001: Nombres de variables en español mezclados con inglés

**Ubicación:** Varios archivos, especialmente `pvp-actions.ts`

**Problema:**
```typescript
const triggerMatchUpdate = async (matchId: number) => {
  // ← función en inglés
  const isP1 = match.player1Id === userId;
  const agreedWager = isP1 ? match.p2WagerProposal : match.p1WagerProposal;
  // ← variables en inglés pero comentarios en español
  nextTurn = rivalId!; // Keeps turn! (Combo Infinito)
```

**Impacto:** Confusión, difícil mantenimiento.

**Solución:** Estandarizar a un solo idioma (recomiendo inglés para código, español para comentarios UI).

---

### BN-002: Consola.log en producción

**Ubicación:** Múltiples archivos

**Problema:**
```typescript
console.error("Pusher trigger error", e);
console.error("Error in AI Chat route:", error);
console.error("Error sync tournaments", e);
```

**Impacto:** Logs en servidor, posible leak de información sensible en producción.

**Solución:** Usar una librería de logging estructurado (Pino, Winston) con niveles y rotación.

---

### BN-003: Magic numbers sin constantes

**Ubicación:** `pvp-actions.ts`, `tournament-actions.ts`

**Problema:**
```typescript
if (elapsed > 10 * 60 * 1000) { // 10 minutos
if (cheatCount >= 3) { // 3er tab switch = 0 puntos
newScore1 += 10; // puntos por respuesta correcta
```

**Impacto:** Difícil cambiar valores globalmente, incomprensible sin comentarios.

**Solución:**
```typescript
// constants/game.ts
export const PVP_NEGOTIATION_TIMEOUT_MS = 10 * 60 * 1000;
export const POINTS_PER_CORRECT_ANSWER = 10;
export const MAX_TAB_SWITCHES_BEFORE_PENALTY = 3;
export const TAB_SWITCH_PENALTY_MULTIPLIER = 0; // 0 puntos
```

---

## 📊 RESUMEN EJECUTIVO

| Prioridad | Cantidad | Problemas |
|-----------|----------|-----------|
| 🔴 CRÍTICO | 4 | Admin check, rate limiting, dual ORM, middleware |
| 🟠 ALTO | 5 | N+1 queries, sin paginación, sin índices, transacciones, Pusher |
| 🟡 MEDIO | 5 | Arquitectura, validación, idempotency, stores, cron |
| 🟢 BAJO | 3 | Naming, logs, magic numbers |

**Total: 17 problemas identificados**

---

## 🗺️ ROADMAP DE CORRECCIÓN SUGERIDO

### Fase 1: Seguridad (Semana 1)
- [ ] CR-001: Fix admin check
- [ ] CR-004: Fix middleware admin routes
- [ ] CR-002: Agregar rate limiting al chat
- [ ] MD-002: Validación de schemas en APIs

### Fase 2: Arquitectura Base (Semana 2)
- [ ] CR-003: Migrar Drizzle → Prisma
- [ ] MD-001: Separar actions en capas
- [ ] MD-003: Idempotency en webhooks

### Fase 3: Performance (Semana 3)
- [ ] AL-001: Fix N+1 en leaderboard
- [ ] AL-002: Paginación en leaderboard
- [ ] AL-003: Agregar índices al schema
- [ ] AL-004: Transacciones atómicas en PVP

### Fase 4: Robustez (Semana 4)
- [ ] AL-005: Retry logic en Pusher
- [ ] MD-004: Persistir Zustand stores
- [ ] MD-005: Implementar cron de leagues
- [ ] BN-002: Sistema de logs estructurado

---

## 📁 ARCHIVOS REVISADOS

- `db/schema.ts` (Drizzle)
- `prisma/schema.prisma` (Prisma)
- `middleware.ts`
- `app/api/chat/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `actions/pvp-actions.ts`
- `actions/tournament-actions.ts`
- `actions/leaderboard.ts`
- `lib/pusher.ts`
- `lib/stripe.ts`
- `store/use-exit-modal.ts`
- `package.json`

---

*Documento generado automáticamente. Actualizar después de cada corrección.*