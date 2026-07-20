import type { Metadata } from "next";
import { Outfit, Bebas_Neue, Cinzel } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  title: "Ruta Cachimbo | Academia Preuniversitaria Gamificada",
  description: "Prepárate para la universidad con nuestra plataforma gamificada impulsada por IA. Simulacros, batallas PvP, temarios completos y tutores inteligentes 24/7.",
  keywords: ["academia preuniversitaria", "examen de admisión", "simulacros", "preparación universitaria", "aprender jugando", "UNMSM", "UNI", "PUCP"],
  openGraph: {
    title: "Ruta Cachimbo | Preparación Universitaria Gamificada",
    description: "Sube de nivel, gana batallas académicas y asegura tu vacante universitaria. La primera academia preuniversitaria con sistema gacha y PvP.",
    url: "https://rutacachimbo.com",
    siteName: "Ruta Cachimbo",
    images: [
      {
        url: "https://rutacachimbo.com/mascot.svg",
        width: 800,
        height: 600,
        alt: "Mascota Ruta Cachimbo",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
};

import { ModalProvider } from "@/components/modals/modal-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${outfit.variable} ${bebas.variable} ${cinzel.variable} font-sans min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground flex flex-col`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ModalProvider />
            <main className="flex-1 flex flex-col">{children}</main>
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
