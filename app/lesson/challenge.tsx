import { cn } from "@/lib/utils";
import type { Challenge as ChallengeModel, ChallengeOption } from "@prisma/client";

import { Card } from "./card";

type Props = {
  options: ChallengeOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  disabledOptionIds?: number[];
  type: ChallengeModel["type"];
  isAdmin?: boolean;
};

export const Challenge = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  disabledOptionIds = [],
  type,
  isAdmin,
}: Props) => {
  const letters = ["A", "B", "C", "D", "E"];
  return (
    <div className={cn(
      "grid gap-3",
      type === "ASSIST" && "grid-cols-1",
      type === "SELECT" && "grid-cols-1"
    )}>
      {options.map((option, i) => (
        <Card
          key={option.id}
          id={option.id}
          text={option.text}
          imageSrc={option.imageSrc}
          shortcut={letters[i] || `${i + 1}`}
          selected={selectedOption === option.id}
          onClick={() => onSelect(option.id)}
          status={status}
          audioSrc={option.audioSrc}
          disabled={disabled}
          is5050Disabled={disabledOptionIds.includes(option.id)}
          type={type}
          isCorrect={option.correct}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};
