# PRODUCT BACKLOG - Ruta Cachimbo

> **Versión:** 1.0
> **Fecha:** 2026-06-10
> **Visión:** Plataforma de comprensión lectora gamificada con LLM para estudiantes 14-18 años

---

## 🎯 HISTORIAS DE USUARIO

### ÉPICA 1: Sistema de Contenido (PDFs y Lecturas)

---

#### HU-001: Subir PDF como profesor
**Como:** Profesor
**Quiero:** Subir archivos PDF con exámenes o lecturas
**Para:** Que el sistema pueda procesarlos y generar preguntas

**Criterios de aceptación:**
- [ ] Puedo subir PDFs hasta 50MB
- [ ] El sistema muestra progreso de subida
- [ ] Si el PDF tiene error, recibo mensaje claro
- [ ] El PDF se guarda en R2/S3 (no en DB)
- [ ] El contenido se extrae y guarda como texto

**Tasks técnicos:**
- [ ] Integrar AWS S3 o Cloudflare R2 para storage
- [ ] Implementar upload con chunked streaming para PDFs grandes
- [ ] Extraer texto con pdf-parse o pdf.js
- [ ] Guardar metadata en PostgreSQL (url, nombre, tamaño, fecha)
- [ ] Crear tabla `documents` en schema

**Prioridad:** MUST HAVE
**Estimación:** 5 puntos de historia

---

#### HU-002: Procesar PDF con LLM (generación de preguntas)
**Como:** Sistema
**Quiero:** Que el LLM lea el PDF y genere preguntas
**Para:** Que los alumnos puedan practicar con el contenido

**Criterios de aceptación:**
- [ ] El procesamiento es ASÍNCRONO (no bloquea al profesor)
- [ ] Se genera un job en cola
- [ ] El profesor recibe notificación cuando está listo
- [ ] Las preguntas se guardan asociadas al documento
- [ ] Se generan mínimo 10 preguntas por documento

**Tasks técnicos:**
- [ ] Crear sistema de job queue (BullMQ o Inngest)
- [ ] Crear worker que llama al LLM con el texto del PDF
- [ ] Generar preguntas con templating (misma base, variantes)
- [ ] Guardar preguntas en tabla `generated_questions`
- [ ] Notificar via Pusher cuando termine

**Prioridad:** MUST HAVE
**Estimación:** 8 puntos de historia

---

#### HU-003: Banco de preguntas manual
**Como:** Profesor
**Quiero:** Crear preguntas manualmente y asignarlas a un curso
**Para:** Tener control total sobre el contenido

**Criterios de aceptación:**
- [ ] Puedo crear preguntas de tipo selección múltiple
- [ ] Puedo agregar explicaciones a cada opción
- [ ] Puedo marcar cuál es la correcta
- [ ] Puedo asignar dificultad (fácil, medio, difícil)
- [ ] Puedo editar/eliminar preguntas

**Tasks técnicos:**
- [ ] Reutilizar modelo `Challenge` y `ChallengeOption` actual
- [ ] Crear UI de CRUD para preguntas
- [ ] Agregar campo `difficulty` enum [EASY, MEDIUM, HARD]
- [ ] Validación de que existe al menos una opción correcta

**Prioridad:** MUST HAVE
**Estimación:** 3 puntos de historia

---

#### HU-004: Asignar preguntas a cursos/lecciones
**Como:** Profesor
**Quiero:** Asociar preguntas (generadas o manuales) a lecciones
**Para:** Organizar el contenido del curso

**Criterios de aceptación:**
- [ ] Puedo seleccionar múltiples preguntas
- [ ] Puedo arrastrar para reordenar
- [ ] Los cambios se guardan automáticamente

**Tasks técnicos:**
- [ ] Crear tabla intermedia `lesson_questions`
- [ ] Agregar campo `order` para secuencia
- [ ] UI de drag & drop para ordenar

**Prioridad:** SHOULD HAVE
**Estimación:** 2 puntos de historia

---

### ÉPICA 2: Sistema de Exámenes y Preguntas

---

#### HU-005: Examen con preguntas similares (no idénticas)
**Como:** Alumno
**Quiero:** Tomar un examen con preguntas basadas en el mismo contenido
**Para:** Que no pueda simplemente memorizar respuestas de compañeros

**Criterios de aceptación:**
- [ ] Dos alumnos ven preguntas con redacción DIFERENTE
- [ ] Pero el nivel de dificultad y concepto es el mismo
- [ ] Las opciones también son variadas pero equivalentes
- [ ] La respuesta correcta es conceptualmente la misma

**Ejemplo:**
```
Alumno A: "¿Cuál es la idea principal?" → opciones: [A, B, C, D]
Alumno B: "¿Qué quiso expresar el autor?" → opciones: [A', B', C', D']
(Ambas miden "identificar idea principal", distintas palabras)
```

**Tasks técnicos:**
- [ ] Sistema de templates de pregunta
- [ ] Variables de substitución: {sinónimo_de_idea_principal}
- [ ] Shuffle de opciones
- [ ] Seed random por usuario para reproducibilidad

**Prioridad:** MUST HAVE
**Estimación:** 8 puntos de historia

---

#### HU-006: Feedback personalizado por error
**Como:** Alumno
**Quiero:** Recibir una explicación cuando fallo una pregunta
**Para:** Entender por qué me equivoqué y aprender

**Criterios de aceptación:**
- [ ] Al fallar, veo por qué la correcta era correcta
- [ ] La explicación es personalizada según mi error
- [ ] Si fallé en "inferencia", el feedback explica inferencia
- [ ] Si fallé en "vocabulario", explica el significado
- [ ] El feedback es generado por LLM, no hardcodeado

**Tasks técnicos:**
- [ ] Clasificar errores: [INFERENCE, VOCABULARY, MAIN_IDEA, CONTEXT, etc.]
- [ ] Prompt templates por tipo de error
- [ ] LLM genera feedback con contexto del texto original
- [ ] Cachear feedback para no regenerar (mismo error = mismo feedback)

**Prioridad:** MUST HAVE
**Estimación:** 5 puntos de historia

---

#### HU-007: Simulador/Examen timed
**Como:** Alumno
**Quiero:** Tomar exámenes con tiempo limitado
**Para:** Prepararme para exámenes reales de admisión

**Criterios de aceptación:**
- [ ] Puedo seleccionar tipo de examen (UNMSM, Villarreal, etc.)
- [ ] El examen tiene tiempo límite
- [ ] Veo contador de tiempo restante
- [ ] Se envía automáticamente al agotar tiempo
- [ ] Puedo saltear preguntas y volver después
- [ ] Al finalizar, veo score inmediato

**Tasks técnicos:**
- [ ] Reutilizar modelo `MockExamResult`
- [ ] Agregar tiempo por pregunta o total
- [ ] Timer en frontend con sync de server (anti-cheat)
- [ ] Tabla `exam_attempts` con timestamps

**Prioridad:** MUST HAVE
**Estimación:** 5 puntos de historia

---

### ÉPICA 3: Sistema de Gamificación

---

#### HU-008: Sistema de XP y Niveles
**Como:** Alumno
**Quiero:** Acumular XP y subir de nivel
**Para:** Sentir progreso y motivación

**Criterios de aceptación:**
- [ ] Respondo bien → gano XP base (10)
- [ ] Streak de días → bonus multiplicador
- [ ] Subir de nivel requiere más XP (curva exponencial)
- [ ] Veo barra de progreso al siguiente nivel
- [ ] Notificación al subir de nivel

**Fórmula sugerida:**
```
XP para nivel N = 100 × N²

Nivel 1 → 100 XP
Nivel 5 → 2,500 XP
Nivel 10 → 10,000 XP
```

**Tasks técnicos:**
- [ ] Función `calculateLevel(xp)` en lib/gamification.ts
- [ ] Actualizar XP después de cada respuesta
- [ ] Trigger de "level up" event
- [ ] Frontend: progress bar y badge

**Prioridad:** MUST HAVE
**Estimación:** 3 puntos de historia

---

#### HU-009: Sistema de Corazones (Vidas)
**Como:** Alumno
**Quiero:** Tener corazones que se gastan al fallar
**Para:** Crear tensión y stakes en el juego

**Criterios de aceptación:**
- [ ] Empiezo con 5 corazones
- [ ] Fallar una pregunta = -1 corazón
- [ ] Corazones se recargan con el tiempo (1 cada 30 min)
- [ ] Si pierdo todos → no puedo jugar hasta recarga o compra
- [ ] Puedo comprar corazones en la tienda

**Tasks técnicos:**
- [ ] Reutilizar `hearts` de UserProgress
- [ ] Cron job para recargar corazones
- [ ] Lógica de "comprar corazones" via shop
- [ ] Modal de "sin corazones" con opciones

**Prioridad:** SHOULD HAVE
**Estimación:** 3 puntos de historia

---

#### HU-010: Sistema de Streaks (Racha)
**Como:** Alumno
**Quiero:** Mantener una racha de días consecutivos
**Para:** Sentirme orgulloso de mi disciplina

**Criterios de aceptación:**
- [ ] Un día jugando = +1 a racha
- [ ] Si no juego un día, racha se rompe
- [ ] Mantener racha da bonus de XP
- [ ] Streak freeze = puedo no jugar 1 día sin perder racha

**Tasks técnicos:**
- [ ] `lastActive` ya existe en schema
- [ ] Calcular días desde lastActive
- [ ] Bonus XP por streak: `streak × 2` XP extra
- [ ] Item "streak freeze" en shop

**Prioridad:** SHOULD HAVE
**Estimación:** 2 puntos de historia

---

#### HU-011: Torneos/Battle Royales entre factions
**Como:** Alumno
**Quiero:** Competir en torneos grupales
**Para:** Representar mi faction y ganar premios

**Criterios de aceptación:**
- [ ] Torneos tienen fecha/hora de inicio
- [ ] Los jugadores de una faction se unen
- [ ] El torneo tiene varias rondas
- [ ] Puntos de faction = suma de puntos de members
- [ ] La faction ganadora obtiene recompensas

**Tasks técnicos:**
- [ ] Reutilizar `LiveTournament` y `TournamentParticipant`
- [ ] Sistema de brackets si hay muchas factions
- [ ] XP shared pool para faction
- [ ] Reward distribution al terminar

**Prioridad:** COULD HAVE (ya existe en parte)
**Estimación:** 5 puntos de historia

---

#### HU-012: PvP 1v1 (Duelo)
**Como:** Alumno
**Quiero:** Retar a otro alumno a un duelo
**Para:** Demostrar quién sabe más

**Criterios de aceptación:**
- [ ] Creo sala con código único
- [ ] Mi rival se une con el código
- [ ] Apostamos puntos (wager)
- [ ] Quien gana, gana los puntos apostados
- [ ] Quien pierde, pierde los puntos

**Tasks técnicos:**
- [ ] Reutilizar `PvpMatch` existente
- [ ] Matchmaking por rango/nivel similar
- [ ] Sistema de wager points
- [ ] Ronda rápida: mejor de 5 preguntas

**Prioridad:** COULD HAVE (ya existe en parte)
**Estimación:** 5 puntos de historia

---

### ÉPICA 4: Sistema de Roles (Alumno/Profesor/Admin)

---

#### HU-013: Rol de Profesor
**Como:** Alumno que quiere ser profesor
**Quiero:** Aplicar para ser profesor
**Para:** Subir contenido y ayudar a otros

**Criterios de aceptación:**
- [ ] Puedo enviar solicitud con credenciales
- [ ] Adjunto comprobante (certificado, diploma, etc.)
- [ ] Admin recibe notificación de nueva solicitud
- [ ] Admin approve/reject con理由
- [ ] Si approve → tengo permisos de profesor

**Tasks técnicos:**
- [ ] Reutilizar `TeacherApplication` existente
- [ ] Agregar `reviewedAt`, `reviewerId`, `reviewNote`
- [ ] Email notification al applicant
- [ ] Permissions: `isTeacher` en UserProgress

**Prioridad:** SHOULD HAVE
**Estimación:** 3 puntos de historia

---

#### HU-014: Panel de Profesor
**Como:** Profesor
**Quiero:** Ver estadísticas de mis cursos
**Para:** Saber cómo van mis alumnos

**Criterios de aceptación:**
- [ ] Veo lista de mis cursos
- [ ] Veo % de completion por alumno
- [ ] Veo preguntas más falladas
- [ ] Puedo导出 datos a Excel/CSV

**Tasks técnicos:**
- [ ] Crear página `/teacher/dashboard`
- [ ] Queries agregadas de progreso
- [ ] Gráficos con Recharts
- [ ] Export functionality

**Prioridad:** COULD HAVE
**Estimación:** 5 puntos de historia

---

#### HU-015: Rol Arbitro (Profesor que juga)
**Como:** Profesor
**Quiero:** Participar en tournaments como juez
**Para:** Ver de cerca cómo juegan mis alumnos

**Criterios de aceptación:**
- [ ] Los profesores pueden unirse a tournaments
- [ ] Su score NO cuenta para rankings de alumnos
- [ ] Veo todas las respuestas de los alumnos
- [ ] Puedo reportar cheating (flaggear usuario)

**Tasks técnicos:**
- [ ] Nuevo enum `role` en User o campo `isReferee`
- [ ] Query exclude referees de leaderboards
- [ ] UI de monitoreo en tiempo real
- [ ] Botón de report/flag

**Prioridad:** NICE TO HAVE
**Estimación:** 8 puntos de historia

---

### ÉPICA 5: Sistema de Recompensas

---

#### HU-016: Tienda Virtual
**Como:** Alumno
**Quiero:** Canjear puntos por items virtuales
**Para:** Personalizar mi perfil y mostrar logros

**Criterios de aceptación:**
- [ ] Veo catálogo de items (avatares, borders, badges)
- [ ] Cada item tiene precio en puntos
- [ ] Puedo comprar si tengo puntos suficientes
- [ ] Los items se aplican a mi perfil
- [ ] El descuento de puntos es inmediato

**Items sugeridos:**
- Avatares especiales: 500 XP
- Borders/frames: 1000 XP
- Badges: 300 XP
- Streak freeze: 200 XP

**Tasks técnicos:**
- [ ] Tabla `shop_items` (type, name, price, imageUrl)
- [ ] Tabla `user_purchases`
- [ ] Lógica de compra: restar puntos + guardar item
- [ ] UI del shop con categorías

**Prioridad:** SHOULD HAVE
**Estimación:** 5 puntos de historia

---

#### HU-017: Sistema de Logros (Achievements)
**Como:** Alumno
**Quiero:** Desbloquear logros por metas específicas
**Para:** Sentirme reconocido por mis logros

**Criterios de aceptación:**
- [ ] Hay logros ocultos y visibles
- [ ] Al cumplir condición → desbloqueado
- [ ] Recibo notificación de logro nuevo
- [ ] Los logros dan XP bonus

**Logros sugeridos:**
- "Primera sangre" - Primera respuesta correcta
- "Racha de 7 días" - Streak de una semana
- "Perfect Score" - 100% en un examen
- "Lectura rápida" - Terminar lectura en <5 min
- "Maestro de vocabulario" - 50 palabras aprendidas

**Tasks técnicos:**
- [ ] Tabla `achievements` con condiciones
- [ ] Tabla `user_achievements`
- [ ] Función `checkAndUnlockAchievements(userId)`
- [ ] Call after cada acción significativa

**Prioridad:** COULD HAVE
**Estimación:** 3 puntos de historia

---

#### HU-018: Recompensas Reales (Pagos)
**Como:** Alumno
**Quiero:** Canjear puntos por recompensas reales
**Para:** Obtener beneficios tangibles

**Criterios de aceptación:**
- [ ] Veo catálogo de recompensas reales (descuentos, tutorías)
- [ ] Los puntos se intercambian por cupones
- [ ] Admin valida el canje
- [ ] Se envía código/cupon al email

**Items reales sugeridos:**
- Descuento 10% en curso: 5000 XP
- Sesión tutoring 1hr: 15000 XP
- Libro físico: 20000 XP

**Tasks técnicos:**
- [ ] Tabla `physical_rewards`
- [ ] Integración Stripe para purchase
- [ ] Sistema de cupones/códigos
- [ ] Email integration (Resend, SendGrid)

**Prioridad:** NICE TO HAVE
**Estimación:** 8 puntos de historia

---

### ÉPICA 6: Sistema de Analíticas

---

#### HU-019: Dashboard de Analíticas para Admin
**Como:** Admin
**Quiero:** Ver métricas del sistema
**Para:** Tomar decisiones basadas en datos

**Métricas:**
- Usuarios activos por día/semana/mes
- Tasa de completado de cursos
- Preguntas más falladas (global)
- Tiempo promedio por lección
- Retención de usuarios (dropoff)
- Revenue (si hay pagos)

**Tasks técnicos:**
- [ ] Tabla de eventos/analytics (ó usar Plausible/Posthog)
- [ ] Dashboard con gráficos (Recharts)
- [ ] Filtros por fecha, curso, rango
- [ ] Export a CSV/PDF

**Prioridad:** COULD HAVE
**Estimación:** 5 puntos de historia

---

#### HU-020: Radar Chart de Habilidades
**Como:** Alumno
**Quiero:** Ver mi perfil de habilidades
**Para:** Saber en qué soy bueno y qué mejorar

**Habilidades a medir:**
- Identificar idea principal
- Inferencia
- Vocabulario en contexto
- Compatibilidad de afirmaciones
- Análisis crítico

**Tasks técnicos:**
- [ ] Cada tipo de pregunta = habilidad
- [ ] Calcular % de acierto por habilidad
- [ ] Mostrar como radar chart
- [ ] Comparar con promedio de la clase

**Prioridad:** SHOULD HAVE
**Estimación:** 3 puntos de historia

---

## 📊 MATRIZ DE PRIORIZACIÓN

| ID | Historia | Prioridad | Estimación | ROI |
|----|----------|-----------|------------|-----|
| HU-001 | Subir PDF | MUST | 5 | Alto |
| HU-002 | Procesar con LLM | MUST | 8 | Alto |
| HU-003 | Banco manual | MUST | 3 | Alto |
| HU-005 | Preguntas similares | MUST | 8 | Alto |
| HU-006 | Feedback personalizado | MUST | 5 | Alto |
| HU-007 | Examen timed | MUST | 5 | Alto |
| HU-008 | XP y Niveles | MUST | 3 | Medio |
| HU-013 | Rol Profesor | SHOULD | 3 | Medio |
| HU-016 | Tienda Virtual | SHOULD | 5 | Medio |
| HU-009 | Corazones | SHOULD | 3 | Bajo |
| HU-010 | Streaks | SHOULD | 2 | Bajo |
| HU-011 | Torneos | COULD | 5 | Bajo |
| HU-012 | PvP | COULD | 5 | Bajo |
| HU-014 | Panel Profesor | COULD | 5 | Bajo |
| HU-015 | Arbitro | NICE | 8 | Bajo |
| HU-017 | Logros | COULD | 3 | Bajo |
| HU-018 | Recompensas Reales | NICE | 8 | Bajo |
| HU-019 | Dashboard Admin | COULD | 5 | Medio |
| HU-004 | Asignar preguntas | SHOULD | 2 | Medio |
| HU-020 | Radar Habilidades | SHOULD | 3 | Medio |

---

## 🗓️ SPRINTS SUGERIDOS

### Sprint 1: Core de Exámenes (Semanas 1-2)
**Objetivo:** Alumno puede tomar exámenes con feedback

- [ ] HU-001: Subir PDF
- [ ] HU-002: Procesar con LLM
- [ ] HU-003: Banco manual
- [ ] HU-005: Preguntas similares
- [ ] HU-006: Feedback personalizado

**Puntos:** 24

### Sprint 2: Exámenes Timed + Gamificación básica (Semanas 3-4)
**Objetivo:** Alumno puede tomar exams timed y siente progreso

- [ ] HU-007: Examen timed
- [ ] HU-008: XP y Niveles
- [ ] HU-004: Asignar preguntas a lecciones

**Puntos:** 10

### Sprint 3: Sistema de Profesores (Semanas 5-6)
**Objetivo:** Profesores pueden subir y gestionar contenido

- [ ] HU-013: Rol Profesor
- [ ] HU-014: Panel Profesor

**Puntos:** 6

### Sprint 4: Gamificación Avanzada (Semanas 7-8)
**Objetivo:** Mantener usuarios engajados

- [ ] HU-009: Corazones
- [ ] HU-010: Streaks
- [ ] HU-016: Tienda Virtual
- [ ] HU-020: Radar de Habilidades

**Puntos:** 11

### Sprint 5: Competición (Semanas 9-10)
**Objetivo:** Generar competencia entre usuarios

- [ ] HU-011: Torneos
- [ ] HU-012: PvP

**Puntos:** 10

### Sprint 6: polish y Extras (Semanas 11-12)
**Objetivo:** polish y features de bajo prioridad

- [ ] HU-015: Arbitro
- [ ] HU-017: Logros
- [ ] HU-018: Recompensas Reales
- [ ] HU-019: Dashboard Admin

**Puntos:** 24 (muchos NICE TO HAVE)

---

## 🔧 TECHNICAL DEBT (Del LUFER.md)

| ID | Tarea | Épica | Prioridad |
|----|-------|-------|-----------|
| TD-001 | CR-001: Fix admin check | Seguridad | 🔴 CRÍTICO |
| TD-002 | CR-002: Rate limiting AI | Seguridad | 🔴 CRÍTICO |
| TD-003 | CR-003: Migrate Drizzle → Prisma | Arquitectura | 🔴 CRÍTICO |
| TD-004 | CR-004: Fix middleware admin | Seguridad | 🔴 CRÍTICO |
| TD-005 | AL-001: Fix N+1 leaderboard | Performance | 🟠 ALTO |
| TD-006 | AL-002: Paginación leaderboard | UX | 🟠 ALTO |
| TD-007 | AL-003: Agregar índices | Performance | 🟠 ALTO |
| TD-008 | AL-004: Transacciones PVP | Integridad | 🟠 ALTO |
| TD-009 | AL-005: Retry Pusher | Robustez | 🟠 ALTO |
| TD-010 | MD-001: Separar actions en capas | Arquitectura | 🟡 MEDIO |
| TD-011 | MD-002: Validación Zod APIs | Seguridad | 🟡 MEDIO |
| TD-012 | MD-003: Idempotency Stripe | Robustez | 🟡 MEDIO |
| TD-013 | MD-004: Zustand persist | UX | 🟡 MEDIO |
| TD-014 | MD-005: Cron leagues | Funcionalidad | 🟡 MEDIO |

---

## 📝 NOTAS

### Sobre la generación de preguntas similares:

El sistema debe поддерживать two modes:

1. **Mode A - Banco de plantillas:**
   - Un humano escribe 1 pregunta con variables
   - El sistema genera 5 variantes automáticamente
   - LLM valida que sean equivalentes

2. **Mode B - Generación dinámica:**
   - Alumno pide練習
   - LLM genera pregunta "nueva" basada en el texto
   - Se cachea para otros alumnos (no generar 2 veces lo mismo)

### Sobre el feedback:

El feedback NO debe ser genérico. Debe usar:
- El texto original del alumno's error
- La categoría del error (inferencia, vocabulario, etc.)
- El nivel del alumno (¿es principiante o avanzado?)

---

*Documento vivo - Actualizar después de cada sprint.*