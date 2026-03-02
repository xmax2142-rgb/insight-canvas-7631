import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ShieldAlert, Undo2, Activity, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViolationKPICards } from "@/components/ViolationKPICards";
import { ViolationsTable } from "@/components/ViolationsTable";
import { ViolationDialog } from "@/components/ViolationDialog";
import { CloseViolationDialog } from "@/components/CloseViolationDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useViolations } from "@/hooks/useViolations";
import type { Violation, ActionTaken } from "@/types/violation";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const ViolationsHub = () => {
  const { violations, addViolation, updateViolation, deleteViolation, undo, canUndo, openCount, closedCount, totalCount } = useViolations();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingViolation, setEditingViolation] = useState<Violation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Violation | null>(null);
  const [closeTarget, setCloseTarget] = useState<Violation | null>(null);

  const handleAdd = () => { setEditingViolation(null); setDialogOpen(true); };
  const handleEdit = (v: Violation) => { setEditingViolation(v); setDialogOpen(true); };

  const handleSubmit = (data: Omit<Violation, "id" | "number" | "createdAt" | "updatedAt">) => {
    if (editingViolation) {
      updateViolation(editingViolation.id, data);
      toast({ title: "Violation updated", description: `"${data.name}" has been updated.` });
    } else {
      addViolation(data);
      toast({ title: "Violation added", description: `"${data.name}" has been recorded.` });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteViolation(deleteTarget.id);
      toast({ title: "Violation deleted", description: `"${deleteTarget.name}" has been removed.`, variant: "destructive" });
      setDeleteTarget(null);
    }
  };

  const handleUndo = () => {
    const type = undo();
    if (type) {
      const labels = { add: "Addition", update: "Update", delete: "Deletion" };
      toast({ title: "Action undone", description: `Last ${labels[type].toLowerCase()} has been reversed.` });
    }
  };

  const handleCloseViolation = (id: string, finalDecision: string, actionTaken: ActionTaken) => {
    updateViolation(id, { status: "closed", actionTaken, finalDecision });
    toast({ title: "Violation closed", description: "The violation has been closed with a final decision." });
  };

  const handleReopen = (v: Violation) => {
    updateViolation(v.id, { status: "open", actionTaken: "no_action", finalDecision: undefined });
    toast({ title: "Violation reopened", description: `"${v.name}" has been reopened.` });
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-foreground">
                Cybersecurity <span className="text-primary">Violations</span>
              </h1>
              <p className="text-xs font-medium text-muted-foreground">GRC Analyst Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                <Home className="h-4 w-4" /> Home
              </Button>
            </Link>
            <Button onClick={handleAdd} className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 active:scale-[0.97]">
              <Plus className="h-4 w-4" />
              Add Violation
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="relative flex-1 mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.4 }} className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Dashboard Overview</h2>
        </motion.div>

        <ViolationKPICards openCount={openCount} closedCount={closedCount} totalCount={totalCount} />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Violation Records</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <ViolationsTable violations={violations} onEdit={handleEdit} onDelete={setDeleteTarget} onClose={setCloseTarget} onReopen={handleReopen} />
      </main>

      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} GRC Violations Tracker</p>
            <p className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Operational
            </p>
          </div>
        </div>
      </footer>

      <ViolationDialog open={dialogOpen} onOpenChange={setDialogOpen} violation={editingViolation} onSubmit={handleSubmit} />
      <DeleteDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} violationName={deleteTarget?.name ?? ""} onConfirm={handleDeleteConfirm} />
      <CloseViolationDialog open={!!closeTarget} onOpenChange={(open) => !open && setCloseTarget(null)} violation={closeTarget} onConfirm={handleCloseViolation} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: canUndo ? 1 : 0.5, y: 0 }} className="fixed bottom-6 left-6 z-50">
        <Button variant="outline" size="sm" onClick={handleUndo} disabled={!canUndo} className="gap-2 rounded-xl shadow-md backdrop-blur-sm bg-card/80 border-border">
          <Undo2 className="h-4 w-4" />
          Undo
        </Button>
      </motion.div>
    </div>
  );
};

export default ViolationsHub;
