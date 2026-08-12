"use client";

import { useState, useTransition } from "react";
import { Swords, Loader2 } from "lucide-react";
import { challengeUserPvp } from "@/actions/game/pvp-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  targetUserId: string;
  targetUserName: string;
};

export function ChallengeButton({ targetUserId, targetUserName }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChallenge = () => {
    startTransition(async () => {
      const res = await challengeUserPvp(targetUserId);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      if (res?.success && res.matchId) {
        toast.success(`⚔️ Desafío enviado a ${targetUserName}. ¡Entrando a la sala!`);
        router.push(`/pvp/play/${res.matchId}`);
      }
    });
  };

  return (
    <Button
      onClick={handleChallenge}
      disabled={isPending}
      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold px-6 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-red-500/25 transition-all text-sm shrink-0 uppercase tracking-wider"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> Desafiando...
        </>
      ) : (
        <>
          <Swords className="w-4 h-4" /> Retar a Duelo 1v1
        </>
      )}
    </Button>
  );
}
