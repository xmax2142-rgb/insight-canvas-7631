import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Home,
  Server,
  Database,
  Network,
  Monitor,
  LayoutGrid,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/stores/appStore";
import {
  SYSTEM_TYPE_LABELS,
  computeScore,
  computeStatus,
  type ComplianceStatus,
  type ComplianceSystem,
  type SystemType,
} from "@/types/compliance";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const typeIcons: Record<SystemType, LucideIcon> = {
  "linux-server": Server,
  "windows-server": Server,
  "linux-workstation": Monitor,
  "windows-workstation": Monitor,
  "network-device": Network,
  "database": Database,
};

const statusStyles: Record<ComplianceStatus, { label: string; badge: string; bar: string; border: string }> = {
  "compliant": {
    label: "Compliant",
    badge: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    bar: "bg-emerald-500",
    border: "border-l-emerald-500",
  },
  "at-risk": {
    label: "At Risk",
    badge: "bg-amber-500/15 text-amber-600 border border-amber-500/30",
    bar: "bg-amber-500",
    border: "border-l-amber-500",
  },
  "non-compliant": {
    label: "Non-Compliant",
    badge: "bg-red-500/15 text-red-600 border border-red-500/30",
    bar: "bg-red-500",
    border: "border-l-red-500",
  },
};

const ComplianceHub = () => {
  const systems = useAppStore((s) => s.complianceSystems);
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | ComplianceStatus>("all");

  const enriched = useMemo(
    () =>
      systems.map((s) => {
        const score = computeScore(s);
        return { ...s, score, status: computeStatus(score) };
      }),
    [systems],
  );

  const overallScore = useMemo(() => {
    if (!enriched.length) return 0;
    const totalPassed = enriched.reduce((sum, s) => sum + s.passedControls, 0);
    const totalControls = enriched.reduce((sum, s) => sum + s.totalControls, 0);
    return totalControls > 0 ? Math.round((totalPassed / totalControls) * 100) : 0;
  }, [enriched]);

  const counts = useMemo(
    () => ({
      compliant: enriched.filter((s) => s.status === "compliant").length,
      atRisk: enriched.filter((s) => s.status === "at-risk").length,
      nonCompliant: enriched.filter((s) => s.status === "non-compliant").length,
    }),
    [enriched],
  );

  const visible = filter === "all" ? enriched : enriched.filter((s) => s.status === filter);

  const kpis = [
    { label: "Overall Compliance", value: `${overallScore}%`, icon: ShieldCheck, accent: "border-l-emerald-500", iconColor: "text-emerald-500", filter: "all" as const },
    { label: "Compliant Systems", value: counts.compliant, icon: ShieldCheck, accent: "border-l-emerald-500", iconColor: "text-emerald-500", filter: "compliant" as const },
    { label: "At Risk Systems", value: counts.atRisk, icon: ShieldCheck, accent: "border-l-amber-500", iconColor: "text-amber-500", filter: "at-risk" as const },
    { label: "Non-Compliant Systems", value: counts.nonCompliant, icon: ShieldCheck, accent: "border-l-red-500", iconColor: "text-red-500", filter: "non-compliant" as const },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-foreground">
                Compliance <span className="text-emerald-600">Hub</span>
              </h1>
              <p className="text-xs font-medium text-muted-foreground">System inventory & control coverage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                <Home className="h-4 w-4" /> Home
              </Button>
            </Link>
            <Button
              onClick={() => toast({ title: "Assessment queued", description: "A control assessment run has been scheduled." })}
              className="gap-2 rounded-xl"
            >
              <RefreshCcw className="h-4 w-4" />
              Run Assessment
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="relative flex-1 mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            const active = filter === k.filter;
            return (
              <button
                key={k.label}
                onClick={() => setFilter(k.filter)}
                className={`text-left rounded-2xl bg-card border border-border/50 border-l-4 ${k.accent} p-5 flex flex-col gap-3 card-hover active:scale-[0.98] transition-all animate-slide-up stagger-${Math.min(i + 1, 6)} ${active ? "ring-2 ring-primary/40" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{k.label}</span>
                  <Icon className={`w-4 h-4 ${k.iconColor}`} />
                </div>
                <div className="text-3xl font-bold tracking-tight">{k.value}</div>
              </button>
            );
          })}
        </section>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {filter === "all" ? "All Systems" : statusStyles[filter].label + " Systems"} ({visible.length})
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* System cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((s, i) => {
            const Icon = typeIcons[s.type] ?? LayoutGrid;
            const style = statusStyles[s.status];
            return (
              <div
                key={s.id}
                className={`rounded-2xl bg-card border border-border/50 border-l-4 ${style.border} p-6 flex flex-col gap-4 card-hover animate-slide-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">{SYSTEM_TYPE_LABELS[s.type]}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div className="text-4xl font-bold tracking-tight">{s.score}%</div>
                  <div className="text-xs text-muted-foreground text-right">
                    <div className="font-medium text-foreground">{s.passedControls} / {s.totalControls}</div>
                    <div>controls passed</div>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${style.bar} transition-all duration-500`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <div>
                    <div className="uppercase tracking-wider text-[10px] mb-0.5">Owner</div>
                    <div className="text-foreground font-medium">{s.owner}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider text-[10px] mb-0.5">Environment</div>
                    <div className="text-foreground font-medium">{s.environment}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="uppercase tracking-wider text-[10px] mb-0.5">Last Assessed</div>
                    <div className="text-foreground font-medium">{s.lastAssessmentDate}</div>
                  </div>
                  {s.notes && (
                    <div className="col-span-2">
                      <div className="uppercase tracking-wider text-[10px] mb-0.5">Notes</div>
                      <div className="text-muted-foreground leading-snug">{s.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {visible.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No systems match this filter.</div>
        )}
      </main>

      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} CyberGRC Compliance</p>
            <p className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Inventory synced
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComplianceHub;
