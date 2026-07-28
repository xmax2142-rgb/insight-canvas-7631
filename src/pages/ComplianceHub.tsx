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
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import {
  SYSTEM_TYPE_LABELS,
  computeScore,
  computeStatus,
  rollupAssets,
  type ComplianceStatus,
  type SystemType,
  type Subcategory,
  type ComplianceSystem,
} from "@/types/compliance";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SubcategoryDialog } from "@/components/compliance/SubcategoryDialog";
import { CategoryDialog } from "@/components/compliance/CategoryDialog";

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

type DeleteTarget =
  | { kind: "category"; systemId: string; label: string }
  | { kind: "subcategory"; systemId: string; subId: string; label: string }
  | null;

const ComplianceHub = () => {
  const systems = useAppStore((s) => s.complianceSystems);
  const addComplianceSystem = useAppStore((s) => s.addComplianceSystem);
  const updateComplianceSystem = useAppStore((s) => s.updateComplianceSystem);
  const deleteComplianceSystem = useAppStore((s) => s.deleteComplianceSystem);
  const addSubcategory = useAppStore((s) => s.addSubcategory);
  const updateSubcategory = useAppStore((s) => s.updateSubcategory);
  const deleteSubcategory = useAppStore((s) => s.deleteSubcategory);

  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | ComplianceStatus>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; editing: ComplianceSystem | null }>({
    open: false,
    editing: null,
  });
  const [subDialog, setSubDialog] = useState<{ open: boolean; systemId: string | null; editing: Subcategory | null }>({
    open: false,
    systemId: null,
    editing: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const enriched = useMemo(
    () =>
      systems.map((s) => {
        const { passed, total } = rollupAssets(s);
        const score = computeScore(s);
        return { ...s, rolledPassed: passed, rolledTotal: total, score, status: computeStatus(score) };
      }),
    [systems],
  );

  const overallScore = useMemo(() => {
    if (!enriched.length) return 0;
    const totalPassed = enriched.reduce((sum, s) => sum + s.rolledPassed, 0);
    const totalAssets = enriched.reduce((sum, s) => sum + s.rolledTotal, 0);
    return totalAssets > 0 ? Math.round((totalPassed / totalAssets) * 100) : 0;
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

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "category") {
      deleteComplianceSystem(deleteTarget.systemId);
      toast({ title: "Category deleted", description: deleteTarget.label });
    } else {
      deleteSubcategory(deleteTarget.systemId, deleteTarget.subId);
      toast({ title: "Subcategory deleted", description: deleteTarget.label });
    }
    setDeleteTarget(null);
  };

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
              variant="outline"
              onClick={() => setCategoryDialog({ open: true, editing: null })}
              className="gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
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
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visible.map((s, i) => {
            const Icon = typeIcons[s.type] ?? LayoutGrid;
            const style = statusStyles[s.status];
            const isOpen = expanded[s.id] ?? true;
            return (
              <div
                key={s.id}
                className={`rounded-2xl bg-card border border-border/50 border-l-4 ${style.border} p-6 flex flex-col gap-4 card-hover animate-slide-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base leading-tight truncate">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">{SYSTEM_TYPE_LABELS[s.type]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${style.badge}`}>
                      {style.label}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setCategoryDialog({ open: true, editing: s })}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeleteTarget({ kind: "category", systemId: s.id, label: s.name })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div className="text-4xl font-bold tracking-tight">{s.score}%</div>
                  <div className="text-xs text-muted-foreground text-right">
                    <div className="font-medium text-foreground">{s.rolledPassed} / {s.rolledTotal}</div>
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

                {/* Subcategories */}
                <div className="pt-2 border-t border-border/50">
                  <button
                    onClick={() => setExpanded((prev) => ({ ...prev, [s.id]: !isOpen }))}
                    className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      Subcategories ({s.subcategories.length})
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-3 space-y-2">
                      {s.subcategories.length === 0 && (
                        <div className="text-xs text-muted-foreground italic py-2">No subcategories yet.</div>
                      )}
                      {s.subcategories.map((sub) => {
                        const subScore = sub.totalAssets > 0 ? Math.round((sub.passedAssets / sub.totalAssets) * 100) : 0;
                        const failed = Math.max(sub.totalAssets - sub.passedAssets, 0);
                        const subStatus = computeStatus(subScore);
                        const subStyle = statusStyles[subStatus];
                        return (
                          <div
                            key={sub.id}
                            className="rounded-lg bg-muted/40 border border-border/40 px-3 py-2.5 flex items-center gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium truncate">{sub.name}</span>
                                <span className="text-xs font-semibold tabular-nums">{subScore}%</span>
                              </div>
                              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className={`h-full ${subStyle.bar}`} style={{ width: `${subScore}%` }} />
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span>
                                    Passed: <span className="text-foreground font-medium tabular-nums">{sub.passedAssets} / {sub.totalAssets}</span> assets
                                  </span>
                                  <span className={failed > 0 ? "text-red-600 font-medium" : ""}>
                                    Failed: <span className="tabular-nums">{failed}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setSubDialog({ open: true, systemId: s.id, editing: sub })}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-600 hover:text-red-700"
                                onClick={() =>
                                  setDeleteTarget({
                                    kind: "subcategory",
                                    systemId: s.id,
                                    subId: sub.id,
                                    label: sub.name,
                                  })
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 mt-2"
                        onClick={() => setSubDialog({ open: true, systemId: s.id, editing: null })}
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Subcategory
                      </Button>
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

      <CategoryDialog
        open={categoryDialog.open}
        onOpenChange={(v) => setCategoryDialog((prev) => ({ ...prev, open: v }))}
        initial={categoryDialog.editing}
        onSave={(data) => {
          if (categoryDialog.editing) {
            updateComplianceSystem(categoryDialog.editing.id, data);
            toast({ title: "Category updated", description: data.name });
          } else {
            addComplianceSystem({
              ...data,
              lastAssessmentDate: new Date().toISOString().slice(0, 10),
            });
            toast({ title: "Category added", description: data.name });
          }
        }}
      />

      <SubcategoryDialog
        open={subDialog.open}
        onOpenChange={(v) => setSubDialog((prev) => ({ ...prev, open: v }))}
        initial={subDialog.editing}
        onSave={(data) => {
          if (!subDialog.systemId) return;
          if (subDialog.editing) {
            updateSubcategory(subDialog.systemId, subDialog.editing.id, data);
            toast({ title: "Subcategory updated", description: data.name });
          } else {
            addSubcategory(subDialog.systemId, data);
            toast({ title: "Subcategory added", description: data.name });
          }
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.kind === "category" ? "category" : "subcategory"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-semibold">{deleteTarget?.label}</span>
              {deleteTarget?.kind === "category" ? " and all its subcategories" : ""}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ComplianceHub;
