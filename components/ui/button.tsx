import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide active:scale-95 duration-200",
  {
    variants: {
      variant: {
        locked: "bg-neutral-200 text-primary-foreground hover:bg-neutral-200/90 border-neutral-400 border-b-4 active:border-b-0",
        default: "bg-card text-foreground border-border border-2 border-b-4 active:border-b-2 hover:bg-muted text-muted-foreground",
        primary: "bg-emerald-500 text-primary-foreground hover:bg-emerald-500/90 border-emerald-600 border-b-4 active:border-b-0 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]",
        primaryOutline: "bg-background text-emerald-600 hover:bg-muted",
        secondary: "bg-sky-400 text-primary-foreground hover:bg-sky-400/90 border-sky-500 border-b-4 active:border-b-0 hover:shadow-[0_0_20px_rgba(56,189,248,0.5)]",
        secondaryOutline: "bg-background text-sky-500 hover:bg-muted",
        danger: "bg-rose-500 text-primary-foreground hover:bg-rose-500/90 border-rose-600 border-b-4 active:border-b-0 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]",
        dangerOutline: "bg-background text-rose-500 hover:bg-muted",
        super: "bg-indigo-500 text-primary-foreground hover:bg-indigo-500/90 border-indigo-600 border-b-4 active:border-b-0 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]",
        superOutline: "bg-background text-indigo-500 hover:bg-muted",
        ghost: "bg-transparent text-muted-foreground border-transparent border-0 hover:bg-muted",
        sidebar: "bg-transparent text-muted-foreground border-2 border-transparent hover:bg-muted transition-all",
        sidebarOutline: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 border-2 hover:bg-emerald-500/20 transition-all",
        sidebarGolden: "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 border-amber-600 border-2 shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:shadow-[0_0_25px_rgba(245,158,11,0.85)] hover:brightness-105 transition-all"
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
