import { Badge } from "@/components/ui/badge";
import { RemediationPriority } from "@/lib/mockData";

interface PriorityBadgeProps {
  priority: RemediationPriority;
}

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const priorityConfig = {
    critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10' },
    high: { label: 'High', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10' },
    medium: { label: 'Medium', className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10' },
    low: { label: 'Low', className: 'bg-muted text-muted-foreground border-border hover:bg-muted' },
  };

  const config = priorityConfig[priority];

  return <Badge variant="outline" className={`font-medium ${config.className}`}>{config.label}</Badge>;
};
