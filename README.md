# 🎓 Ruta Cachimbo

Plataforma de preparación preuniversitaria **gamificada** enfocada en comprensión lectora, impulsada por IA (Google Gemini). Los estudiantes avanzan por un temario tipo Duolingo, rinden simulacros estilo UNMSM, batallan en duelos PvP en tiempo real y compiten por facciones.

## ✨ Funcionalidades

- **Temario gamificado** — unidades y lecciones con corazones, XP, rachas y ligas semanales (Bronce → Diamante).
- **Simulacros IA** — exámenes cronometrados con puntuación estilo UNMSM y feedback personalizado generado por IA.
- **Tutor IA 24/7** — chat socrático que conoce tu progreso y tu historial de errores.
- **Subida de PDFs (admin/profesores)** — Gemini extrae los textos de comprensión lectora y genera las preguntas automáticamente; los archivos se almacenan en Cloudinary.
- **Duelos PvP** — batallas 1v1 con apuestas de puntos en tiempo real (Pusher).
- **Guerras de Facciones** — torneos en vivo por equipos.
- **Aulas para profesores** — clases privadas con código de invitación y contenido propio.
- **Tienda, logros, misiones y analíticas** con radar de habilidades.

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router, Server Actions) |
| Base de datos | PostgreSQL (Neon) + Prisma |
| Autenticación | Clerk |
| IA | Google Gemini vía Vercel AI SDK (`@ai-sdk/google`) |
| Tiempo real | Pusher |
| Media | Cloudinary |
| Pagos | Stripe (integrado, actualmente solo visual) |
| UI | Tailwind CSS + Radix UI + Framer Motion |

## 🚀 Desarrollo local

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Copia `.env.example` a `.env` y completa las variables (base de datos, Clerk, Gemini, etc.).
3. Sincroniza el esquema con la base de datos:
   ```bash
   npm run db:push
   ```
4. Arranca el servidor:
   ```bash
   npm run dev
   ```

## 📜 Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Linter |
| `npm run db:push` | Sincroniza `prisma/schema.prisma` con la BD |
| `npm run db:studio` | UI para explorar la BD |
| `npm run db:migrate` | Crea una migración de Prisma |

## 🔐 Notas de seguridad

- El admin se define con `ADMIN_USER_ID` (ID de usuario de Clerk). Sin esa variable, **nadie** tiene acceso de admin.
- El cron semanal de ligas (`/api/cron/leagues`, domingos 00:00 vía Vercel Cron) requiere `CRON_SECRET`.
- Las APIs de IA tienen rate limiting por usuario y validación de entrada con Zod.

## ☁️ Despliegue

Pensado para Vercel. Configura todas las variables de `.env.example` en el proyecto y asegúrate de que `vercel.json` mantenga el cron de ligas. `postinstall` ejecuta `prisma generate` automáticamente.
