import { create } from "zustand";
import { mockRemediationItems, type RemediationItem, type RemediationStatus, type RemediationPriority } from "@/lib/mockData";
import { mockEvents } from "@/data/mockEvents";
import type { CalendarEvent } from "@/types/calendar";
import type { Violation, ActionTaken } from "@/types/violation";
import type { ComplianceSystem } from "@/types/compliance";
import { mockComplianceSystems } from "@/data/mockComplianceSystems";

export interface Note { id: string; title: string; content: string; date: Date; createdAt: Date; }
export type TaskPriority = "high" | "medium" | "low";
export interface Task { id: string; title: string; completed: boolean; priority: TaskPriority; dueDate: Date | null; createdAt: Date; }

const VIOLATIONS_STORAGE_KEY = "grc-violations";
function loadViolations(): Violation[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(VIOLATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function persistViolations(v: Violation[]) {
  try { localStorage.setItem(VIOLATIONS_STORAGE_KEY, JSON.stringify(v)); } catch {}
}
function nextViolationNumber(v: Violation[]) {
  return v.length === 0 ? 1 : Math.max(...v.map((x) => x.number)) + 1;
}

const initialNotes: Note[] = [
  { id: "n1", title: "Security Audit Findings", content: "Key findings from the Q1 security audit.", date: new Date(2026, 0, 15), createdAt: new Date(2026, 0, 15, 10, 30) },
  { id: "n2", title: "Compliance Meeting Notes", content: "Discussion about GDPR requirements.", date: new Date(2026, 0, 20), createdAt: new Date(2026, 0, 20, 14, 0) },
];
const initialTasks: Task[] = [
  { id: "t1", title: "Review security audit report", completed: false, priority: "high", dueDate: new Date(2026, 0, 20), createdAt: new Date(2026, 0, 10) },
  { id: "t2", title: "Update firewall rules", completed: true, priority: "high", dueDate: new Date(2026, 0, 15), createdAt: new Date(2026, 0, 5) },
  { id: "t3", title: "Schedule compliance training", completed: false, priority: "medium", dueDate: new Date(2026, 1, 1), createdAt: new Date(2026, 0, 12) },
];

interface AppState {
  // Remediation
  remediationItems: RemediationItem[];
  addRemediationItem: (item: Partial<RemediationItem> & { title: string; priority: RemediationPriority }) => RemediationItem;
  updateRemediationItem: (id: string, patch: Partial<RemediationItem>) => RemediationItem | null;
  deleteRemediationItem: (id: string) => boolean;

  // Events
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (e: Partial<CalendarEvent> & { title: string; startDate: Date; endDate: Date }) => CalendarEvent;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => CalendarEvent | null;
  deleteEvent: (id: string) => boolean;

  // Notes
  notes: Note[];
  setNotes: (n: Note[]) => void;
  addNote: (n: { title: string; content?: string }) => Note;
  updateNote: (id: string, patch: Partial<Note>) => Note | null;
  deleteNote: (id: string) => boolean;

  // Tasks
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  addTask: (t: { title: string; priority?: TaskPriority; dueDate?: Date | null }) => Task;
  toggleTask: (id: string) => Task | null;
  deleteTask: (id: string) => boolean;

  // Violations (persisted to localStorage)
  violations: Violation[];
  addViolation: (data: Omit<Violation, "id" | "number" | "createdAt" | "updatedAt">) => Violation;
  updateViolation: (id: string, data: Partial<Omit<Violation, "id" | "number" | "createdAt">>) => Violation | null;
  deleteViolation: (id: string) => boolean;
}

const nextRemId = (items: RemediationItem[]) => {
  const max = items
    .map((i) => parseInt(i.id.replace("REM-", ""), 10))
    .filter((n) => !isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return `REM-${String(max + 1).padStart(3, "0")}`;
};

export const useAppStore = create<AppState>((set, get) => ({
  remediationItems: mockRemediationItems,
  addRemediationItem: (input) => {
    const item: RemediationItem = {
      id: nextRemId(get().remediationItems),
      findingId: input.findingId ?? `FIND-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      title: input.title,
      description: input.description ?? "",
      priority: input.priority,
      status: input.status ?? "open",
      assignedTo: input.assignedTo ?? "3",
      assignedToName: input.assignedToName ?? "Unassigned",
      createdDate: input.createdDate ?? new Date().toISOString().slice(0, 10),
      dueDate: input.dueDate ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      closedDate: input.closedDate,
      category: input.category ?? "General",
      affectedSystems: input.affectedSystems ?? [],
      comments: input.comments ?? [],
      attachments: input.attachments ?? [],
    };
    set({ remediationItems: [item, ...get().remediationItems] });
    return item;
  },
  updateRemediationItem: (id, patch) => {
    const existing = get().remediationItems.find((i) => i.id === id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    if (patch.status === "closed" && !existing.closedDate) updated.closedDate = new Date().toISOString().slice(0, 10);
    set({ remediationItems: get().remediationItems.map((i) => (i.id === id ? updated : i)) });
    return updated;
  },
  deleteRemediationItem: (id) => {
    const before = get().remediationItems.length;
    set({ remediationItems: get().remediationItems.filter((i) => i.id !== id) });
    return get().remediationItems.length < before;
  },

  events: mockEvents,
  setEvents: (events) => set({ events }),
  addEvent: (input) => {
    const event: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: input.title,
      description: input.description ?? "",
      category: input.category ?? "meetings",
      startDate: input.startDate,
      endDate: input.endDate,
      allDay: input.allDay ?? false,
      status: input.status ?? "planned",
      priority: input.priority ?? "medium",
      owner: input.owner ?? "Assistant",
      department: input.department ?? "General",
      attendees: input.attendees ?? [],
      checklist: input.checklist ?? [],
      attachments: input.attachments ?? [],
      notes: input.notes ?? "",
      isConfidential: input.isConfidential ?? false,
      recurrence: input.recurrence ?? "none",
      reminders: input.reminders ?? [60],
    };
    set({ events: [...get().events, event] });
    return event;
  },
  updateEvent: (id, patch) => {
    const existing = get().events.find((e) => e.id === id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    set({ events: get().events.map((e) => (e.id === id ? updated : e)) });
    return updated;
  },
  deleteEvent: (id) => {
    const before = get().events.length;
    set({ events: get().events.filter((e) => e.id !== id) });
    return get().events.length < before;
  },

  notes: initialNotes,
  setNotes: (notes) => set({ notes }),
  addNote: (input) => {
    const note: Note = { id: `note-${Date.now()}`, title: input.title, content: input.content ?? "", date: new Date(), createdAt: new Date() };
    set({ notes: [note, ...get().notes] });
    return note;
  },
  updateNote: (id, patch) => {
    const existing = get().notes.find((n) => n.id === id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    set({ notes: get().notes.map((n) => (n.id === id ? updated : n)) });
    return updated;
  },
  deleteNote: (id) => {
    const before = get().notes.length;
    set({ notes: get().notes.filter((n) => n.id !== id) });
    return get().notes.length < before;
  },

  tasks: initialTasks,
  setTasks: (tasks) => set({ tasks }),
  addTask: (input) => {
    const task: Task = { id: `task-${Date.now()}`, title: input.title, completed: false, priority: input.priority ?? "medium", dueDate: input.dueDate ?? null, createdAt: new Date() };
    set({ tasks: [task, ...get().tasks] });
    return task;
  },
  toggleTask: (id) => {
    const existing = get().tasks.find((t) => t.id === id);
    if (!existing) return null;
    const updated = { ...existing, completed: !existing.completed };
    set({ tasks: get().tasks.map((t) => (t.id === id ? updated : t)) });
    return updated;
  },
  deleteTask: (id) => {
    const before = get().tasks.length;
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
    return get().tasks.length < before;
  },

  violations: loadViolations(),
  addViolation: (data) => {
    const now = new Date().toISOString();
    const v: Violation = {
      ...data,
      id: crypto.randomUUID(),
      number: nextViolationNumber(get().violations),
      createdAt: now,
      updatedAt: now,
    };
    const next = [...get().violations, v];
    set({ violations: next });
    persistViolations(next);
    return v;
  },
  updateViolation: (id, data) => {
    const existing = get().violations.find((v) => v.id === id);
    if (!existing) return null;
    const updated: Violation = { ...existing, ...data, updatedAt: new Date().toISOString() };
    if (data.status === "closed" && !existing.closedAt) updated.closedAt = new Date().toISOString();
    else if (data.status === "open") updated.closedAt = undefined;
    const next = get().violations.map((v) => (v.id === id ? updated : v));
    set({ violations: next });
    persistViolations(next);
    return updated;
  },
  deleteViolation: (id) => {
    const before = get().violations.length;
    const next = get().violations.filter((v) => v.id !== id);
    set({ violations: next });
    persistViolations(next);
    return next.length < before;
  },
}));

// Re-export types for convenience
export type { RemediationItem, RemediationStatus, RemediationPriority, CalendarEvent };
