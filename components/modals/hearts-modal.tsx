"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHeartsModal } from "@/store/use-hearts-modal";

export const HeartsModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useHeartsModal();

  useEffect(() => setIsClient(true), []);

  const onClick = () => {
    close();
    router.push("/shop");
  };

  const onNoThanks = () => {
    close();
    router.push("/learn");
  };

  if (!isClient) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onNoThanks}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image
              src="/mascot_bad.svg"
              alt="Mascot"
              height={80}
              width={80}
            />
          </div>
          <DialogTitle className="text-center font-bold text-2xl">
            ¡Te quedaste sin vidas!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Obtén Pro para tener vidas ilimitadas, o cómpralas en la tienda.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button 
              variant="primary" 
              className="w-full" 
              size="lg" 
              onClick={onClick}
            >
              Obtener vidas ilimitadas
            </Button>
            <Button
              variant="primaryOutline" 
              className="w-full" 
              size="lg" 
              onClick={onNoThanks}
            >
              No, gracias
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
