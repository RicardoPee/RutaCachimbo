"use client";

import { useEffect, useState } from "react";
import { ExitModal } from "./exit-modal";
import { HeartsModal } from "./hearts-modal";
import { PracticeModal } from "./practice-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <ExitModal />
      <HeartsModal />
      <PracticeModal />
    </>
  );
};
