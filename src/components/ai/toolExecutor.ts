import { useAppStore } from "@/stores/appStore";

export type ToolName =
  | "get_app_state"
  | "list_remediation_items" | "list_events" | "list_notes" | "list_tasks"
  | "create_remediation_item" | "update_remediation_item" | "delete_remediation_item" | "filter_remediation_table"
  | "create_event" | "update_event" | "delete_event"
  | "create_note" | "update_note" | "delete_note"
  | "create_task" | "toggle_task" | "delete_task"
  | "navigate_to";

export const DESTRUCTIVE_TOOLS = new Set<ToolName>([
  "update_remediation_item", "delete_remediation_item",
  "update_event", "delete_event",
  "update_note", "delete_note",
  "delete_task",
]);

const TOOL_LABEL: Record<ToolName, string> = {
  get_app_state: "Read app state",
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
  navigate_to: "Navigate",
};

export const toolLabel = (name: string) => TOOL_LABEL[name as ToolName] ?? name;

// Filter event for remediation table — listened to by RemediationAdmin
export function emitRemediationFilter(status: string, priority: string) {
  window.dispatchEvent(new CustomEvent("ai:remediation-filter", { detail: { status, priority } }));
}

export type ToolContext = { navigate: (path: string) => void };

export async function executeTool(name: string, args: any, ctx: ToolContext): Promise<any> {
  const store = useAppStore.getState();
  switch (name as ToolName) {
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
      };
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
    default: return `${toolLabel(name)} with ${JSON.stringify(args)}`;
  }
}
