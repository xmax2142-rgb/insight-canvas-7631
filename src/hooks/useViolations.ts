import { useState, useEffect, useCallback, useRef } from "react";
import type { Violation } from "@/types/violation";

const STORAGE_KEY = "grc-violations";

type HistoryEntry = {
  type: "add" | "update" | "delete";
  snapshot: Violation[];
};

function loadViolations(): Violation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveViolations(violations: Violation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(violations));
}

function nextNumber(violations: Violation[]): number {
  if (violations.length === 0) return 1;
  return Math.max(...violations.map((v) => v.number)) + 1;
}

export function useViolations() {
  const [violations, setViolations] = useState<Violation[]>(loadViolations);
  const historyRef = useRef<HistoryEntry[]>([]);

  useEffect(() => {
    saveViolations(violations);
  }, [violations]);

  const pushHistory = (type: HistoryEntry["type"]) => {
    historyRef.current.push({ type, snapshot: [...violations] });
    if (historyRef.current.length > 20) historyRef.current.shift();
  };

  const addViolation = useCallback(
    (data: Omit<Violation, "id" | "number" | "createdAt" | "updatedAt">) => {
      pushHistory("add");
      const now = new Date().toISOString();
      const violation: Violation = {
        ...data,
        id: crypto.randomUUID(),
        number: nextNumber(violations),
        createdAt: now,
        updatedAt: now,
      };
      setViolations((prev) => [...prev, violation]);
    },
    [violations],
  );

  const updateViolation = useCallback(
    (id: string, data: Partial<Omit<Violation, "id" | "number" | "createdAt">>) => {
      pushHistory("update");
      setViolations((prev) =>
        prev.map((v) => {
          if (v.id !== id) return v;
          const updated = { ...v, ...data, updatedAt: new Date().toISOString() };
          if (data.status === "closed" && !v.closedAt) {
            updated.closedAt = new Date().toISOString();
          } else if (data.status === "open") {
            updated.closedAt = undefined;
          }
          return updated;
        }),
      );
    },
    [violations],
  );

  const deleteViolation = useCallback(
    (id: string) => {
      pushHistory("delete");
      setViolations((prev) => prev.filter((v) => v.id !== id));
    },
    [violations],
  );

  const undo = useCallback(() => {
    const entry = historyRef.current.pop();
    if (entry) {
      setViolations(entry.snapshot);
      return entry.type;
    }
    return null;
  }, []);

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
