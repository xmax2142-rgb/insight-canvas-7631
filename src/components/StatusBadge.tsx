import { Badge } from "@/components/ui/badge";
import { RemediationStatus } from "@/lib/mockData";

interface StatusBadgeProps {
  status: RemediationStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    open: { label: 'Open', dotClass: 'bg-muted-foreground', badgeClass: 'bg-muted text-muted-foreground hover:bg-muted' },
    in_progress: { label: 'In Progress', dotClass: 'bg-primary', badgeClass: 'bg-primary/10 text-primary hover:bg-primary/10 border-primary/20' },
    pending_review: { label: 'Pending Review', dotClass: 'bg-amber-500', badgeClass: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 border-amber-500/20' },
    closed: { label: 'Closed', dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={`gap-1.5 font-medium ${config.badgeClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </Badge>
  );
};
