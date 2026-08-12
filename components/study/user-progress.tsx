import Link from "next/link";
import Image from "next/image";
import { InfinityIcon, Flame } from "lucide-react";

import type { Course } from "@prisma/client";
import { Button } from "@/components/ui/button";

type Props = {
  activeCourse: Course;
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
  streak?: number;
};

export const UserProgress = ({ 
  activeCourse, 
  points, 
  hearts, 
  hasActiveSubscription,
  streak = 0
}: Props) => {
  return (
    <div className="flex items-center justify-between gap-x-2 w-full">
      <Link href="/courses">
        <Button variant="ghost">
          <Image
            src={activeCourse.imageSrc}
            alt={activeCourse.title}
            className="rounded-md border"
            width={32}
            height={32}
          />
        </Button>
      </Link>
      <Link href="/shop">
        <Button variant="ghost" className="text-orange-500">
          <Image src="/points.svg" height={28} width={28} alt="Points" className="mr-2" />
          {points}
        </Button>
      </Link>
      <Link href="/shop">
        <Button variant="ghost" className={streak > 0 ? "text-amber-500 font-bold" : "text-slate-400"}>
          <Flame className={`h-5 w-5 mr-2 ${streak > 0 ? 'fill-amber-500 animate-pulse' : 'fill-slate-300'}`} />
          {streak}
        </Button>
      </Link>
      <Link href="/shop">
        <Button variant="ghost" className="text-rose-500">
          <Image src="/heart.svg" height={22} width={22} alt="Hearts" className="mr-2 animate-heartbeat" />
          {hasActiveSubscription 
            ? <InfinityIcon className="h-4 w-4 stroke-[3]" /> 
            : hearts
          }
        </Button>
      </Link>
    </div>
  );
};
