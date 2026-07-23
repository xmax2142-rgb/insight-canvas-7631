import { useAppStore } from "@/stores/appStore";

export type ToolName =
  | "get_app_state" | "get_page_structure" | "get_page_context" | "explain_item"
  | "list_remediation_items" | "list_events" | "list_notes" | "list_tasks" | "list_violations"
  | "create_remediation_item" | "update_remediation_item" | "delete_remediation_item" | "filter_remediation_table"
  | "create_event" | "update_event" | "delete_event"
  | "create_note" | "update_note" | "delete_note"
  | "create_task" | "toggle_task" | "delete_task"
  | "create_violation" | "update_violation" | "delete_violation"
  | "scroll_to_element" | "set_page_filter"
  | "navigate_to";

export const DESTRUCTIVE_TOOLS = new Set<ToolName>([
  "update_remediation_item", "delete_remediation_item",
  "update_event", "delete_event",
  "update_note", "delete_note",
  "delete_task",
  "update_violation", "delete_violation",
]);

const TOOL_LABEL: Record<ToolName, string> = {
  get_app_state: "Read app state",
  get_page_structure: "Inspect page structure",
  get_page_context: "Read current page",
  explain_item: "Look up item",
  list_violations: "List violations",
  create_violation: "Create violation",
  update_violation: "Update violation",
  delete_violation: "Delete violation",
  list_remediation_items: "List remediation items",
  list_events: "List events",
  list_notes: "List notes",
  list_tasks: "List tasks",
  create_remediation_item: "Create remediation item",
  update_remediation_item: "Update remediation item",
  delete_remediation_item: "Delete remediation item",
  filter_remediation_table: "Filter remediation table",
  create_event: "Create event",
  update_event: "Update event",
  delete_event: "Delete event",
  create_note: "Create note",
  update_note: "Update note",
  delete_note: "Delete note",
  create_task: "Create task",
  toggle_task: "Toggle task",
  delete_task: "Delete task",
  scroll_to_element: "Highlight on page",
  set_page_filter: "Apply filter",
  navigate_to: "Navigate",
};

export const toolLabel = (name: string) => TOOL_LABEL[name as ToolName] ?? name;

// Filter event for remediation table — listened to by RemediationAdmin
export function emitRemediationFilter(status: string, priority: string) {
  window.dispatchEvent(new CustomEvent("ai:remediation-filter", { detail: { status, priority } }));
}
export function emitCalendarFilter(detail: Record<string, string | undefined>) {
  window.dispatchEvent(new CustomEvent("ai:calendar-filter", { detail }));
}

function pageTitle(path: string): string {
  if (path === "/") return "Home — CyberGRC Command Center";
  if (path === "/violations") return "Cyber Violations Hub";
  if (path.startsWith("/remediation/admin")) return "Remediation Admin";
  if (path.startsWith("/remediation/dashboard")) return "Remediation Dashboard";
  if (path.startsWith("/remediation/item")) return "Remediation Item Detail";
  if (path === "/remediation") return "Remediation Login";
  if (path === "/events") return "Event Horizon (Calendar)";
  return path;
}

function currentPageContext() {
  const store = useAppStore.getState();
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const base: any = {
    path,
    pageTitle: pageTitle(path),
    counts: {
      violations: { total: store.violations.length, open: store.violations.filter(v => v.status === "open").length },
      remediation: { total: store.remediationItems.length, open: store.remediationItems.filter(i => i.status === "open" || i.status === "in_progress").length, critical: store.remediationItems.filter(i => i.priority === "critical" && i.status !== "closed").length },
      events: { total: store.events.length, upcoming: store.events.filter(e => e.startDate >= new Date()).length },
      tasks: { total: store.tasks.length, pending: store.tasks.filter(t => !t.completed).length },
      notes: store.notes.length,
    },
  };
  if (path === "/") {
    base.visibleKPIs = ["Total Violations", "Open Remediations", "Compliance Score", "Upcoming Events", "Critical Findings", "Assessments Completed"];
    base.hubs = ["/violations", "/remediation", "/events"];
  }
  if (path.startsWith("/remediation/admin")) {
    base.recentItems = store.remediationItems.slice(0, 8).map(i => ({ id: i.id, title: i.title, status: i.status, priority: i.priority }));
  }
  if (path === "/violations") {
    base.recentItems = store.violations.slice(-8).map(v => ({ id: v.id, number: v.number, name: v.name, status: v.status }));
  }
  if (path === "/events") {
    base.upcomingEvents = store.events
      .filter(e => e.startDate >= new Date())
      .slice(0, 8)
      .map(e => ({ id: e.id, title: e.title, category: e.category, startDate: e.startDate.toISOString(), status: e.status }));
  }
  return base;
}

function findItem(type: string, id: string) {
  const store = useAppStore.getState();
  const norm = String(id).trim();
  switch (type) {
    case "remediation": return store.remediationItems.find(i => i.id.toLowerCase() === norm.toLowerCase()) ?? null;
    case "violation": {
      const asNum = Number(norm);
      return store.violations.find(v => v.id === norm || (!isNaN(asNum) && v.number === asNum) || v.name.toLowerCase() === norm.toLowerCase()) ?? null;
    }
    case "event": return store.events.find(e => e.id === norm || e.title.toLowerCase() === norm.toLowerCase()) ?? null;
    case "note": return store.notes.find(n => n.id === norm || n.title.toLowerCase() === norm.toLowerCase()) ?? null;
    case "task": return store.tasks.find(t => t.id === norm || t.title.toLowerCase() === norm.toLowerCase()) ?? null;
  }
  return null;
}

function serializeItem(type: string, item: any) {
  if (!item) return null;
  if (type === "event") return { ...item, startDate: item.startDate?.toISOString?.() ?? item.startDate, endDate: item.endDate?.toISOString?.() ?? item.endDate };
  if (type === "task") return { ...item, dueDate: item.dueDate?.toISOString?.() ?? item.dueDate, createdAt: item.createdAt?.toISOString?.() ?? item.createdAt };
  if (type === "note") return { ...item, date: item.date?.toISOString?.() ?? item.date, createdAt: item.createdAt?.toISOString?.() ?? item.createdAt };
  return item;
}

function scrollAndHighlight(selector: string): boolean {
  if (typeof document === "undefined") return false;
  let el: Element | null = null;
  try { el = document.querySelector(selector); } catch { return false; }
  if (!el) {
    // try data-item-id fallback
    try { el = document.querySelector(`[data-item-id="${selector}"]`); } catch {}
  }
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  const target = el as HTMLElement;
  const prev = target.style.boxShadow;
  const prevTransition = target.style.transition;
  target.style.transition = "box-shadow 0.4s ease";
  target.style.boxShadow = "0 0 0 3px hsl(var(--primary)), 0 0 30px hsl(var(--primary) / 0.4)";
  setTimeout(() => {
    target.style.boxShadow = prev;
    setTimeout(() => { target.style.transition = prevTransition; }, 500);
  }, 1800);
  return true;
}

export type ToolContext = { navigate: (path: string) => void };

export async function executeTool(name: string, args: any, ctx: ToolContext): Promise<any> {
  const store = useAppStore.getState();
  switch (name as ToolName) {
    case "get_page_context": return currentPageContext();
    case "get_app_state": {
      return {
        remediation: {
          total: store.remediationItems.length,
          byStatus: groupCount(store.remediationItems, "status"),
          byPriority: groupCount(store.remediationItems, "priority"),
          recent: store.remediationItems.slice(0, 5).map((i) => ({ id: i.id, title: i.title, status: i.status, priority: i.priority })),
        },
        events: {
          total: store.events.length,
          upcoming: store.events
            .filter((e) => e.startDate >= new Date())
            .slice(0, 5)
            .map((e) => ({ id: e.id, title: e.title, startDate: e.startDate.toISOString(), status: e.status })),
        },
        notes: { total: store.notes.length, recent: store.notes.slice(0, 5).map((n) => ({ id: n.id, title: n.title })) },
        tasks: {
          total: store.tasks.length,
          pending: store.tasks.filter((t) => !t.completed).length,
          recent: store.tasks.slice(0, 5).map((t) => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority })),
        },
        violations: {
          total: store.violations.length,
          open: store.violations.filter((v) => v.status === "open").length,
          closed: store.violations.filter((v) => v.status === "closed").length,
          recent: store.violations.slice(-5).map((v) => ({ id: v.id, number: v.number, name: v.name, status: v.status })),
        },
        currentPath: typeof window !== "undefined" ? window.location.pathname : "/",
      };
    }
    case "get_page_structure": {
      return {
        appName: "RAP & Event Horizon Hub",
        description: "Cybersecurity GRC command center with three main hubs: Violations, Remediation, Event Horizon.",
        routes: [
          { path: "/", name: "Home / Command Center", purpose: "Landing page with KPIs, hub shortcuts, activity calendar" },
          { path: "/violations", name: "Violations Hub", purpose: "GRC analyst workspace: log, edit, close, delete cybersecurity violations" },
          { path: "/remediation", name: "Remediation Login", purpose: "Role selection (admin/analyst) entry" },
          { path: "/remediation/admin", name: "Remediation Admin", purpose: "Admin table of remediation items with status/priority filters and CRUD" },
          { path: "/remediation/dashboard", name: "Remediation Dashboard", purpose: "Analyst metrics dashboard for remediation items" },
          { path: "/remediation/item/:id", name: "Remediation Item Detail", purpose: "Single remediation item with comments and attachments" },
          { path: "/events", name: "Event Horizon (Calendar)", purpose: "Calendar dashboard with events, notes, and tasks views" },
        ],
        dataModels: {
          remediationItem: ["id (REM-###)", "title", "description", "status (open|in_progress|pending_review|closed)", "priority (critical|high|medium|low)", "assignedToName", "dueDate", "category"],
          calendarEvent: ["id", "title", "category (meetings|audits|compliance|training)", "startDate", "endDate", "status", "priority"],
          note: ["id", "title", "content"],
          task: ["id", "title", "completed", "priority", "dueDate"],
          violation: ["id (uuid)", "number", "name", "description", "violatingUser", "status (open|closed)", "actionTaken (issue_violation|issue_warning|no_action)", "finalDecision", "grcComments"],
        },
      };
    }
    case "explain_item": {
      const item = findItem(args.type, args.id);
      if (!item) return { found: false, message: `No ${args.type} matching "${args.id}"` };
      return { found: true, type: args.type, item: serializeItem(args.type, item) };
    }
    case "list_remediation_items": {
      let items = store.remediationItems;
      if (args.status && args.status !== "all") items = items.filter((i) => i.status === args.status);
      if (args.priority && args.priority !== "all") items = items.filter((i) => i.priority === args.priority);
      if (args.search) {
        const q = String(args.search).toLowerCase();
        items = items.filter((i) => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
      }
      return items.map((i) => ({ id: i.id, title: i.title, status: i.status, priority: i.priority, dueDate: i.dueDate, assignedToName: i.assignedToName }));
    }
    case "list_events": {
      let items = store.events;
      if (args.category) items = items.filter((e) => e.category === args.category);
      if (args.status) items = items.filter((e) => e.status === args.status);
      if (args.search) {
        const q = String(args.search).toLowerCase();
        items = items.filter((e) => e.title.toLowerCase().includes(q));
      }
      return items.slice(0, 50).map((e) => ({ id: e.id, title: e.title, startDate: e.startDate.toISOString(), endDate: e.endDate.toISOString(), category: e.category, status: e.status, priority: e.priority }));
    }
    case "list_notes": return store.notes.map((n) => ({ id: n.id, title: n.title, content: n.content }));
    case "list_tasks": {
      let items = store.tasks;
      if (typeof args.completed === "boolean") items = items.filter((t) => t.completed === args.completed);
      return items.map((t) => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority, dueDate: t.dueDate?.toISOString() ?? null }));
    }

    case "create_remediation_item": {
      const item = store.addRemediationItem(args);
      return { success: true, id: item.id, title: item.title };
    }
    case "update_remediation_item": {
      const { id, ...patch } = args;
      const updated = store.updateRemediationItem(id, patch);
      return updated ? { success: true, id, updated: patch } : { success: false, error: `No item ${id}` };
    }
    case "delete_remediation_item": {
      const ok = store.deleteRemediationItem(args.id);
      return ok ? { success: true } : { success: false, error: `No item ${args.id}` };
    }
    case "filter_remediation_table": {
      emitRemediationFilter(args.status ?? "all", args.priority ?? "all");
      ctx.navigate("/remediation/admin");
      return { success: true, applied: { status: args.status, priority: args.priority } };
    }
    case "set_page_filter": {
      const path = typeof window !== "undefined" ? window.location.pathname : "/";
      if (path.startsWith("/remediation/admin")) {
        emitRemediationFilter(args.status ?? "all", args.priority ?? "all");
        return { success: true, applied: { status: args.status, priority: args.priority }, target: "remediation" };
      }
      if (path === "/events") {
        emitCalendarFilter(args);
        return { success: true, applied: args, target: "calendar" };
      }
      return { success: false, error: `No filterable list on ${path}` };
    }
    case "scroll_to_element": {
      const ok = scrollAndHighlight(args.selector);
      return ok ? { success: true } : { success: false, error: `No element matching "${args.selector}"` };
    }

    case "create_event": {
      const e = store.addEvent({ ...args, startDate: new Date(args.startDate), endDate: new Date(args.endDate) });
      return { success: true, id: e.id, title: e.title };
    }
    case "update_event": {
      const { id, ...patch } = args;
      const p: any = { ...patch };
      if (patch.startDate) p.startDate = new Date(patch.startDate);
      if (patch.endDate) p.endDate = new Date(patch.endDate);
      const updated = store.updateEvent(id, p);
      return updated ? { success: true, id } : { success: false, error: `No event ${id}` };
    }
    case "delete_event": {
      const ok = store.deleteEvent(args.id);
      return ok ? { success: true } : { success: false, error: `No event ${args.id}` };
    }

    case "create_note": {
      const n = store.addNote(args);
      return { success: true, id: n.id };
    }
    case "update_note": {
      const { id, ...patch } = args;
      const updated = store.updateNote(id, patch);
      return updated ? { success: true } : { success: false, error: `No note ${id}` };
    }
    case "delete_note": {
      const ok = store.deleteNote(args.id);
      return ok ? { success: true } : { success: false, error: `No note ${args.id}` };
    }

    case "create_task": {
      const t = store.addTask({ ...args, dueDate: args.dueDate ? new Date(args.dueDate) : null });
      return { success: true, id: t.id };
    }
    case "toggle_task": {
      const t = store.toggleTask(args.id);
      return t ? { success: true, completed: t.completed } : { success: false, error: `No task ${args.id}` };
    }
    case "delete_task": {
      const ok = store.deleteTask(args.id);
      return ok ? { success: true } : { success: false, error: `No task ${args.id}` };
    }

    case "list_violations": {
      let items = store.violations;
      if (args.status && args.status !== "all") items = items.filter((v) => v.status === args.status);
      if (args.search) {
        const q = String(args.search).toLowerCase();
        items = items.filter((v) => v.name.toLowerCase().includes(q) || v.violatingUser.toLowerCase().includes(q));
      }
      return items.map((v) => ({ id: v.id, number: v.number, name: v.name, violatingUser: v.violatingUser, status: v.status, actionTaken: v.actionTaken, createdAt: v.createdAt }));
    }
    case "create_violation": {
      const v = store.addViolation({
        name: args.name,
        description: args.description ?? "",
        violatingUser: args.violatingUser ?? "Unknown",
        grcComments: args.grcComments ?? "",
        status: args.status ?? "open",
        actionTaken: args.actionTaken ?? "no_action",
        finalDecision: args.finalDecision,
      });
      return { success: true, id: v.id, number: v.number };
    }
    case "update_violation": {
      const { id, ...patch } = args;
      const updated = store.updateViolation(id, patch);
      return updated ? { success: true, id } : { success: false, error: `No violation ${id}` };
    }
    case "delete_violation": {
      const ok = store.deleteViolation(args.id);
      return ok ? { success: true } : { success: false, error: `No violation ${args.id}` };
    }

    case "navigate_to": {
      ctx.navigate(args.path);
      return { success: true, path: args.path };
    }
  }
  return { error: `Unknown tool: ${name}` };
}

function groupCount<T>(arr: T[], key: keyof T): Record<string, number> {
  const out: Record<string, number> = {};
  for (const x of arr) {
    const k = String(x[key]);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export function describeAction(name: string, args: any): string {
  switch (name) {
    case "update_remediation_item": return `Update remediation item ${args.id}: ${Object.entries(args).filter(([k]) => k !== "id").map(([k, v]) => `${k} → ${v}`).join(", ")}`;
    case "delete_remediation_item": return `Permanently delete remediation item ${args.id}`;
    case "update_event": return `Update event ${args.id}`;
    case "delete_event": return `Delete event ${args.id}`;
    case "update_note": return `Update note ${args.id}`;
    case "delete_note": return `Delete note ${args.id}`;
    case "delete_task": return `Delete task ${args.id}`;
    case "update_violation": return `Update violation ${args.id}`;
    case "delete_violation": return `Permanently delete violation ${args.id}`;
    default: return `${toolLabel(name)} with ${JSON.stringify(args)}`;
  }
}
