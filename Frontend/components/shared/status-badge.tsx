import { Badge } from "@/components/ui/badge";

export type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  SCHEDULED: "default",
  COMPLETED: "success",
  CANCELLED: "danger",
  CONFIRMED: "success",
  ACTIVE: "default",
  INACTIVE: "muted",
  PENDING: "warning",
  RESERVED: "warning",
  AVAILABLE: "success",
  ADMIN: "default",
  EMPLOYEE: "muted",
  USER: "muted",
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => (
  <Badge variant={statusStyles[status] ?? "muted"} className={className}>
    {status}
  </Badge>
);
