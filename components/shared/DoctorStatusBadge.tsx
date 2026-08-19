import { Badge } from "@/components/ui/Badge";
import { getDoctorStatusConfig } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DoctorStatusBadgeProps {
  status: string;
  showDot?: boolean;
  className?: string;
}

export function DoctorStatusBadge({
  status,
  showDot = true,
  className,
}: DoctorStatusBadgeProps) {
  const config = getDoctorStatusConfig(status);

  const variantMap: Record<string, "success" | "info" | "warning" | "danger" | "muted"> = {
    available: "success",
    consulting: "info",
    delayed: "warning",
    on_rounds: "warning",
    emergency_duty: "danger",
    unavailable: "muted",
    break: "warning",
  };

  return (
    <Badge
      variant={variantMap[status] ?? "muted"}
      dot={showDot}
      className={className}
    >
      {config.label}
    </Badge>
  );
}
