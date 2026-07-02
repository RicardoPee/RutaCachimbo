import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Solo la landing, autenticación, webhooks y crons son públicos.
// Todo lo demás (app, admin, APIs) requiere sesión iniciada.
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/registro(.*)",
  "/comunidad",
  "/temarios",
  "/api/webhooks/stripe",
  "/api/cron/(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
