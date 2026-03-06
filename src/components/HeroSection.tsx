import { Shield, AlertTriangle, Wrench, Calendar, Activity, CheckCircle, TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface KPICard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  borderColor: string;
  iconColor: string;
  trend: { direction: "up" | "down"; label: string };
  href: string;
}

interface HeroSectionProps {
  totalViolations: number;
  openViolations: number;
  openRemediations: number;
  closedRemediations: number;
  totalRemediations: number;
  criticalFindings: number;
  upcomingEvents: number;
}

const HeroSection = ({
  ...props
}: HeroSectionProps) => {
  const navigate = useNavigate();
  const {
    totalViolations, openViolations, openRemediations,
    closedRemediations, totalRemediations, criticalFindings, upcomingEvents,
  } = props;
  openViolations,
  openRemediations,
  closedRemediations,
  totalRemediations,
  criticalFindings,
  upcomingEvents,
}: HeroSectionProps) => {
  const complianceScore = totalRemediations > 0
    ? Math.round((closedRemediations / totalRemediations) * 100)
    : 0;

  const kpiCards: KPICard[] = [
    {
      label: "Total Violations",
      value: totalViolations,
      icon: AlertTriangle,
      borderColor: "border-l-red-500",
      iconColor: "text-red-500",
      trend: { direction: openViolations > 0 ? "up" : "down", label: `${openViolations} open` },
      href: "/violations",
    },
    {
      label: "Open Remediations",
      value: openRemediations,
      icon: Wrench,
      borderColor: "border-l-amber-500",
      iconColor: "text-amber-500",
      trend: { direction: openRemediations > 0 ? "up" : "down", label: `${closedRemediations} resolved` },
      href: "/remediation",
    },
    {
      label: "Compliance Score",
      value: `${complianceScore}%`,
      icon: Shield,
      borderColor: "border-l-emerald-500",
      iconColor: "text-emerald-500",
      trend: { direction: complianceScore >= 50 ? "up" : "down", label: complianceScore >= 50 ? "On track" : "Needs attention" },
      href: "/remediation",
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents,
      icon: Calendar,
      borderColor: "border-l-cyan-500",
      iconColor: "text-cyan-500",
      trend: { direction: upcomingEvents > 0 ? "up" : "down", label: upcomingEvents > 0 ? `${upcomingEvents} scheduled` : "None scheduled" },
      href: "/events",
    },
    {
      label: "Critical Findings",
      value: criticalFindings,
      icon: Activity,
      borderColor: "border-l-orange-500",
      iconColor: "text-orange-500",
      trend: { direction: criticalFindings > 0 ? "up" : "down", label: criticalFindings > 0 ? `${criticalFindings} need action` : "All clear" },
      href: "/remediation",
    },
    {
      label: "Assessments Completed",
      value: closedRemediations,
      icon: CheckCircle,
      borderColor: "border-l-green-500",
      iconColor: "text-green-500",
      trend: { direction: "up" as const, label: `${closedRemediations} closed` },
      href: "/remediation",
    },
  ];

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
