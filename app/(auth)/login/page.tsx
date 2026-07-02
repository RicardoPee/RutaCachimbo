"use client"

import { SignIn, ClerkLoading } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2">Bienvenido de vuelta</h1>
          <p className="text-muted-foreground">
            Ingresa a tu cuenta para continuar tu entrenamiento.
          </p>
        </div>
        <ClerkLoading>
          <Loader className="h-8 w-8 text-muted-foreground animate-spin" />
        </ClerkLoading>
        <SignIn
          routing="hash"
          signUpUrl="/registro"
          fallbackRedirectUrl="/learn"
        />
      </motion.div>
    </div>
  );
}
