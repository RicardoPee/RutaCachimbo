import { cn } from "@/lib/utils";
import { challengeOptions, challenges } from "@/db/schema";

import { Card } from "./card";

type Props = {
  options: typeof challengeOptions.$inferSelect[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  type: typeof challenges.$inferSelect["type"];
  isAdmin?: boolean;
};

export const Challenge = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
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
          type={type}
          isCorrect={option.correct}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};
