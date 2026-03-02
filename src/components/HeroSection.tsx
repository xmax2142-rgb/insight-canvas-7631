import { Shield, AlertTriangle, Wrench, Calendar, Activity, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";

const kpiCards = [
  {
    label: "Total Violations",
    value: "--",
    icon: AlertTriangle,
    borderColor: "border-l-red-500",
    iconColor: "text-red-500",
    trend: { direction: "up" as const, label: "+3 this week" },
  },
  {
    label: "Open Remediations",
    value: "--",
    icon: Wrench,
    borderColor: "border-l-amber-500",
    iconColor: "text-amber-500",
    trend: { direction: "down" as const, label: "-2 resolved" },
  },
  {
    label: "Compliance Score",
    value: "--%",
    icon: Shield,
    borderColor: "border-l-emerald-500",
    iconColor: "text-emerald-500",
    trend: { direction: "up" as const, label: "+5% improvement" },
  },
  {
    label: "Upcoming Events",
    value: "--",
    icon: Calendar,
    borderColor: "border-l-cyan-500",
    iconColor: "text-cyan-500",
    trend: { direction: "up" as const, label: "Next: TBD" },
  },
  {
    label: "Critical Findings",
    value: "--",
    icon: Activity,
    borderColor: "border-l-orange-500",
    iconColor: "text-orange-500",
    trend: { direction: "down" as const, label: "-1 mitigated" },
  },
  {
    label: "Assessments Completed",
    value: "--",
    icon: CheckCircle,
    borderColor: "border-l-green-500",
    iconColor: "text-green-500",
    trend: { direction: "up" as const, label: "+2 this month" },
  },
];

const HeroSection = () => {
  return (
    <section className="py-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trend.direction === "up" ? TrendingUp : TrendingDown;
          return (
            <div
              key={card.label}
              className={`rounded-2xl bg-card border border-border/50 border-l-4 ${card.borderColor} p-5 md:p-6 flex flex-col gap-4 card-hover animate-slide-up stagger-${Math.min(index + 1, 6)}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div className="text-3xl md:text-4xl font-bold tracking-tight">{card.value}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendIcon className={`w-3.5 h-3.5 ${card.trend.direction === "up" ? "text-emerald-500" : "text-red-400"}`} />
                <span>{card.trend.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HeroSection;
