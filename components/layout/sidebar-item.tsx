"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  icon: React.ReactNode;
  href: string;
  isGolden?: boolean;
};

export const SidebarItem = ({
  label,
  icon,
  href,
  isGolden,
}: Props) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Button
      variant={isGolden ? "sidebarGolden" : (active ? "sidebarOutline" : "sidebar")}
      className={cn(
        "justify-start h-[52px]",
        isGolden && "font-black tracking-wider text-amber-950 hover:text-amber-950 dark:hover:text-amber-950"
      )}
      asChild
    >
      <Link href={href}>
        <div className="mr-5 flex items-center justify-center w-8 h-8">
          {icon}
        </div>
        {label}
      </Link>
    </Button>
  );
};
