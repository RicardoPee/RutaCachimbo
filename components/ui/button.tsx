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
        default: "bg-card text-foreground border-border border-2 border-b-4 active:border-b-2 hover:bg-muted/50 text-muted-foreground shadow-sm",
        primary: "bg-gradient-to-b from-emerald-400 to-emerald-500 text-white hover:from-emerald-400 hover:to-emerald-400 border-emerald-600 border-b-4 active:border-b-0 hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:brightness-105",
        primaryOutline: "bg-background text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800",
        secondary: "bg-gradient-to-b from-sky-400 to-sky-500 text-white hover:from-sky-400 hover:to-sky-400 border-sky-600 border-b-4 active:border-b-0 hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] hover:brightness-105",
        secondaryOutline: "bg-background text-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 border-2 border-sky-200 dark:border-sky-800",
        danger: "bg-gradient-to-b from-rose-500 to-rose-600 text-white hover:from-rose-500 hover:to-rose-500 border-rose-700 border-b-4 active:border-b-0 hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] hover:brightness-105",
        dangerOutline: "bg-background text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-800",
        super: "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white hover:from-indigo-500 hover:to-indigo-500 border-indigo-700 border-b-4 active:border-b-0 hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:brightness-105",
        superOutline: "bg-background text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800",
        ghost: "bg-transparent text-muted-foreground border-transparent border-0 hover:bg-muted/50",
        sidebar: "bg-transparent text-muted-foreground border-2 border-transparent hover:bg-muted/50 transition-all",
        sidebarOutline: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 border-2 hover:bg-emerald-500/20 transition-all shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]",
        sidebarGolden: "bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-amber-950 border-amber-600 border-2 border-b-4 active:border-b-0 shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:shadow-[0_0_35px_rgba(245,158,11,0.9)] hover:brightness-110 transition-all"
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
