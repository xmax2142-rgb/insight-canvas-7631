import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
}

export const MetricsCard = ({ title, value, icon: Icon, description, trend, accentColor = "bg-primary" }: MetricsCardProps) => {
  return (
    <Card className="relative overflow-hidden transition-all duration-200 ease-in-out hover:shadow-md">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />
      <CardContent className="p-5 pl-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <p className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-destructive'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-muted p-2.5">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
