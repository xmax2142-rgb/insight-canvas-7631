import { useCallback, useRef, useState, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import type { Violation } from "@/types/violation";

type HistoryEntry = { type: "add" | "update" | "delete"; snapshot: Violation[] };

export function useViolations() {
  const violations = useAppStore((s) => s.violations);
  const addV = useAppStore((s) => s.addViolation);
  const updateV = useAppStore((s) => s.updateViolation);
  const deleteV = useAppStore((s) => s.deleteViolation);

  const historyRef = useRef<HistoryEntry[]>([]);
  const [, force] = useState(0);

  const pushHistory = (type: HistoryEntry["type"]) => {
    historyRef.current.push({ type, snapshot: [...useAppStore.getState().violations] });
    if (historyRef.current.length > 20) historyRef.current.shift();
  };

  const addViolation = useCallback(
    (data: Omit<Violation, "id" | "number" | "createdAt" | "updatedAt">) => {
      pushHistory("add");
      addV(data);
    },
    [addV],
  );

  const updateViolation = useCallback(
    (id: string, data: Partial<Omit<Violation, "id" | "number" | "createdAt">>) => {
      pushHistory("update");
      updateV(id, data);
    },
    [updateV],
  );

  const deleteViolation = useCallback(
    (id: string) => {
      pushHistory("delete");
      deleteV(id);
    },
    [deleteV],
  );

  const undo = useCallback(() => {
    const entry = historyRef.current.pop();
    if (!entry) return null;
    // restore snapshot
    useAppStore.setState({ violations: entry.snapshot });
    try { localStorage.setItem("grc-violations", JSON.stringify(entry.snapshot)); } catch {}
    force((n) => n + 1);
    return entry.type;
  }, []);

  useEffect(() => {}, [violations]);

  const canUndo = historyRef.current.length > 0;
  const openCount = violations.filter((v) => v.status === "open").length;
  const closedCount = violations.filter((v) => v.status === "closed").length;

  return {
    violations,
    addViolation,
    updateViolation,
    deleteViolation,
    undo,
    canUndo,
    openCount,
    closedCount,
    totalCount: violations.length,
  };
}
