import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Violation } from "@/types/violation";
import { Pencil, Trash2, CheckCircle2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface ViolationsTableProps {
  violations: Violation[];
  onEdit: (violation: Violation) => void;
  onDelete: (violation: Violation) => void;
  onClose: (violation: Violation) => void;
  onReopen: (violation: Violation) => void;
}

type StatusFilter = "all" | "open" | "closed";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: 0.35 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease } },
};

const rowContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.5 } },
};

const ACTION_LABELS: Record<string, { label: string; className: string }> = {
  issue_violation: { label: "Violation Issued", className: "border-destructive bg-destructive/10 text-destructive" },
  issue_warning: { label: "Warning Issued", className: "border-amber-500 bg-amber-500/10 text-amber-600" },
  no_action: { label: "No Action", className: "border-border bg-muted text-muted-foreground" },
};

function getDaysCount(v: Violation): string {
  const start = new Date(v.createdAt);
  const end = v.closedAt ? new Date(v.closedAt) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  return `${days}d`;
}

export function ViolationsTable({ violations, onEdit, onDelete, onClose, onReopen }: ViolationsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = violations.filter((v) => {
    const matchesSearch = search === "" || v.name.toLowerCase().includes(search.toLowerCase()) || v.description.toLowerCase().includes(search.toLowerCase()) || v.violatingUser.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search violations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["all", "open", "closed"] as StatusFilter[]).map((s) => (
            <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="capitalize rounded-xl">
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-20 text-xs font-semibold uppercase tracking-wide">#</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Violation Name</TableHead>
              <TableHead className="hidden md:table-cell text-xs font-semibold uppercase tracking-wide">Description</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Violating User</TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wide">GRC Comments</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Action</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-center">Days</TableHead>
              <TableHead className="w-24 text-right text-xs font-semibold uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody variants={rowContainer} initial="hidden" animate="visible">
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  {violations.length === 0 ? 'No violations recorded yet. Click "Add Violation" to get started.' : "No violations match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => {
                const action = ACTION_LABELS[v.actionTaken ?? "no_action"];
                return (
                  <motion.tr key={v.id} variants={rowVariants} className="border-b transition-colors hover:bg-muted/30">
                    <TableCell className="font-semibold text-muted-foreground">{v.number}</TableCell>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell className="hidden max-w-[200px] truncate md:table-cell text-muted-foreground">{v.description}</TableCell>
                    <TableCell>{v.violatingUser}</TableCell>
                    <TableCell className="hidden max-w-[200px] truncate lg:table-cell text-muted-foreground">{v.grcComments}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={v.status === "open" ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-emerald-500 bg-emerald-500/10 text-emerald-600"}>
                        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${v.status === "open" ? "bg-amber-500" : "bg-emerald-500"}`} />
                        {v.status === "open" ? "Open" : "Closed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={action.className}>{action.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-sm font-semibold tabular-nums ${v.status === "closed" ? "text-emerald-500" : "text-amber-500"}`}>{getDaysCount(v)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {v.status === "open" ? (
                          <Button size="icon" variant="ghost" onClick={() => onClose(v)} className="text-emerald-600 hover:text-emerald-700" title="Close violation">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="icon" variant="ghost" onClick={() => onReopen(v)} className="text-amber-600 hover:text-amber-700" title="Reopen violation">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => onEdit(v)} className="hover:text-primary">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(v)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </motion.tbody>
        </Table>
      </div>
    </motion.div>
  );
}
