import Pusher from "pusher";

// We check if keys exist to avoid crashing the app if the user hasn't set them yet
const hasPusherConfig = !!(
  process.env.PUSHER_APP_ID &&
  process.env.NEXT_PUBLIC_PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER
);

export const pusherServer = hasPusherConfig ? new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
}) : null;

export type AppNotification = {
  id: string;           // UUID para deduplicar en el cliente
  type: "pvp_invite" | "tournament_start" | "achievement" | "league_change" | "general";
  title: string;
  message: string;
  href?: string;        // Ruta a la que navegar al hacer clic
  icon?: string;        // Emoji del ícono
};

/**
 * Envía una notificación en tiempo real a un usuario específico vía Pusher.
 * El canal es público por simplicidad — el contenido no es sensible.
 * Falla silenciosamente si Pusher no está configurado.
 */
export async function triggerUserNotification(
  userId: string,
  notification: Omit<AppNotification, "id">
): Promise<void> {
  if (!pusherServer) return;

  const payload: AppNotification = {
    ...notification,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };

  try {
    await pusherServer.trigger(`user-${userId}`, "notification", payload);
  } catch (e) {
    console.error("[Pusher notification error]", e);
  }
}

