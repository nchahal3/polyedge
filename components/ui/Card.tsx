import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card",
        glow && "shadow-[0_0_30px_rgba(0,230,160,0.05)]",
        className
      )}
      style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}
    >
      {children}
    </div>
  );
}
