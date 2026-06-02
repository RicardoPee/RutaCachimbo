"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Trophy, Users, Menu, X, Rocket } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  const links = [
    { name: "Simulacros", href: "/simulacros", icon: Trophy },
    { name: "Temarios", href: "/temarios", icon: BookOpen },
    { name: "Comunidad", href: "/comunidad", icon: Users },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Ruta<span className="text-primary">Cachimbo</span>
            </span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "group flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href="/registro"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-transform hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            Empezar Gratis
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              )
            })}
            <div className="mt-4 pt-4 border-t border-border/40 flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-center text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsOpen(false)}
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="w-full rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                onClick={() => setIsOpen(false)}
              >
                Empezar Gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
