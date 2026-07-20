"use client";

import { useState, useEffect } from "react";
import { SignUp, ClerkLoading } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

export default function Registro() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const clerkTheme = mounted && theme === "dark" ? dark : undefined;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2">Crea tu cuenta</h1>
          <p className="text-muted-foreground">
            Empieza gratis tu camino hacia la vacante universitaria.
          </p>
        </div>
        <ClerkLoading>
          <Loader className="h-8 w-8 text-muted-foreground animate-spin" />
        </ClerkLoading>
        <SignUp
          routing="hash"
          signInUrl="/login"
          fallbackRedirectUrl="/learn"
          appearance={{
            baseTheme: clerkTheme,
          }}
        />
      </motion.div>
    </div>
  );
}
