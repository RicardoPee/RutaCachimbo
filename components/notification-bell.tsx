"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, X, Trophy, Swords, Star, TrendingUp, Info } from "lucide-react";
import { useRouter } from "next/navigation";

import { pusherClient } from "@/lib/pusher-client";
import type { AppNotification } from "@/lib/pusher";

type Props = {
  userId: string;
};

const TYPE_CONFIG: Record<
  AppNotification["type"],
  { icon: React.ReactNode; color: string }
> = {
  pvp_invite:      { icon: <Swords className="w-3.5 h-3.5" />, color: "text-rose-500" },
  tournament_start:{ icon: <Trophy className="w-3.5 h-3.5" />, color: "text-amber-500" },
  achievement:     { icon: <Star className="w-3.5 h-3.5" />, color: "text-yellow-400" },
  league_change:   { icon: <TrendingUp className="w-3.5 h-3.5" />, color: "text-emerald-500" },
  general:         { icon: <Info className="w-3.5 h-3.5" />, color: "text-primary" },
};

export function NotificationBell({ userId }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Suscribirse al canal personal del usuario vía Pusher
  useEffect(() => {
    if (!pusherClient || !userId) return;

    const channel = pusherClient.subscribe(`user-${userId}`);

    channel.bind("notification", (data: AppNotification) => {
      setNotifications((prev) => {
        // Evitar duplicados por id
        if (prev.some((n) => n.id === data.id)) return prev;
        return [data, ...prev].slice(0, 20); // max 20 notificaciones
      });
      setUnreadCount((c) => c + 1);
    });

    return () => {
      channel.unbind_all();
      pusherClient?.unsubscribe(`user-${userId}`);
    };
  }, [userId]);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = () => {
    setOpen((o) => !o);
    if (!open) setUnreadCount(0); // marcar como leídas al abrir
  };

  const handleClick = (n: AppNotification) => {
    setOpen(false);
    if (n.href) router.push(n.href);
  };

  const dismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón campana */}
      <button
        onClick={handleToggle}
        aria-label="Notificaciones"
        className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted/60 transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {open && (
        <div className="absolute right-0 top-11 w-80 rounded-2xl border border-border bg-background/95 backdrop-blur shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-bold">Notificaciones</span>
            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpiar todo
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Bell className="w-8 h-8 opacity-30" />
                <p className="text-xs">Sin notificaciones por ahora</p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`relative flex gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${n.href ? "cursor-pointer" : ""}`}
                  >
                    {/* Ícono */}
                    <div className={`mt-0.5 shrink-0 ${config.color}`}>
                      {n.icon ? (
                        <span className="text-base leading-none">{n.icon}</span>
                      ) : (
                        config.icon
                      )}
                    </div>
                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground leading-snug line-clamp-2 mt-0.5">{n.message}</p>
                    </div>
                    {/* Cerrar */}
                    <button
                      onClick={(e) => dismiss(e, n.id)}
                      className="shrink-0 mt-0.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
