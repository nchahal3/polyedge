import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Badge({ children, style, className }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold tracking-wide", className)}
      style={style}
    >
      {children}
    </span>
  );
}
