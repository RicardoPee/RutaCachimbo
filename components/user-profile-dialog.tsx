"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Heart, Star } from "lucide-react";

type UserProfileDialogProps = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  user: any;
};

export const UserProfileDialog = ({ isOpen, setIsOpen, user }: UserProfileDialogProps) => {
  const getBorderStyles = (borderName?: string) => {
    if (borderName === "fire") return "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)] dark:bg-rose-950 bg-rose-50";
    if (borderName === "ice") return "border-cyan-500 shadow-[0_0_20px_rgba(6,182,214,0.8)] dark:bg-cyan-950 bg-cyan-50";
    if (borderName === "gold") return "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)] dark:bg-yellow-950 bg-yellow-50";
    return "border-slate-200 dark:border-slate-700 bg-muted";
  };
  if (!user) return null;

  const leagueColors: Record<string, string> = {
    "BRONCE": "text-orange-700 bg-orange-100",
    "PLATA": "text-slate-500 bg-slate-100",
    "ORO": "text-yellow-600 bg-yellow-100",
    "DIAMANTE": "text-cyan-500 bg-cyan-100",
  };

  const leagueColor = leagueColors[user.league as string] || leagueColors["BRONCE"];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Perfil del Jugador</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          <Avatar className={`h-24 w-24 border-4 mb-4 relative transition-all ${getBorderStyles(user.activeBorder)}`}>
            <AvatarImage src={user.userImageSrc} className="object-cover" />
          </Avatar>
          
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">{user.userName}</h2>
          
          <div className={`px-4 py-1 rounded-full text-sm font-bold mb-6 ${leagueColor}`}>
            Liga {user.league}
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-center p-4 bg-muted rounded-xl border-2 border-slate-100 dark:border-border">
              <Star className="h-8 w-8 text-yellow-400 mb-2" />
              <p className="text-sm text-neutral-500 font-bold">Puntos Históricos</p>
              <p className="text-lg font-black text-neutral-800 dark:text-white">{user.points}</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted rounded-xl border-2 border-slate-100 dark:border-border">
              <Trophy className="h-8 w-8 text-blue-400 mb-2" />
              <p className="text-sm text-neutral-500 font-bold">Puntos Semanales</p>
              <p className="text-lg font-black text-neutral-800 dark:text-white">{user.weeklyPoints}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
