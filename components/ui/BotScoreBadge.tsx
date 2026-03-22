import { getBotBadge } from "@/lib/utils";
import { Badge } from "./Badge";

export function BotScoreBadge({ score }: { score: number }) {
  const { label, color, bg } = getBotBadge(score);
  return (
    <Badge style={{ color, backgroundColor: bg, border: `1px solid ${color}33` }}>
      {label}
    </Badge>
  );
}
