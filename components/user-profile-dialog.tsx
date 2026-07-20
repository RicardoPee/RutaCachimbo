"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Star, Award } from "lucide-react";
import { getBorderStyles, getTitleById } from "@/lib/shop-catalog";

type UserProfileDialogProps = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  user: any;
};

export const UserProfileDialog = ({ isOpen, setIsOpen, user }: UserProfileDialogProps) => {
  if (!user) return null;

  const titleObj = getTitleById(user.activeTitle);

  const leagueColors: Record<string, string> = {
    "BRONCE": "text-orange-700 bg-orange-100 dark:bg-orange-950/50 dark:text-orange-300",
    "PLATA": "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    "ORO": "text-yellow-700 bg-yellow-100 dark:bg-yellow-950/50 dark:text-yellow-300",
    "DIAMANTE": "text-cyan-600 bg-cyan-100 dark:bg-cyan-950/50 dark:text-cyan-300",
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
          
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-1">{user.userName}</h2>
          
          {titleObj && (
            <p className="text-xs font-black text-amber-500 mb-3 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 inline" /> {titleObj.title}
            </p>
          )}

          <div className={`px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-6 ${leagueColor}`}>
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
