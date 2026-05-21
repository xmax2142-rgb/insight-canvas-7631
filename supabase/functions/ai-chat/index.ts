import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "npm:ai@6";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible@2";
import { z } from "npm:zod@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const gateway = createOpenAICompatible({
  name: "lovable",
  baseURL: "https://ai.gateway.lovable.dev/v1",
  headers: {
    "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY") ?? "",
    "X-Lovable-AIG-SDK": "vercel-ai-sdk",
  },
});

// Tools are declared with input schemas only. Execution happens on the client
// (against the local Zustand stores) so the assistant can mutate UI state.
const tools = {
  // ===== READ =====
  get_app_state: tool({
    description: "Get a compact snapshot of current data: counts and recent items across remediation, events, notes, tasks. Call this first to understand what exists.",
    inputSchema: z.object({}),
  }),
  list_remediation_items: tool({
    description: "List remediation items, optionally filtered by status or priority.",
    inputSchema: z.object({
      status: z.enum(["open", "in_progress", "pending_review", "closed", "all"]).optional(),
      priority: z.enum(["critical", "high", "medium", "low", "all"]).optional(),
      search: z.string().optional(),
    }),
  }),
  list_events: tool({
    description: "List calendar events, optionally filtered.",
    inputSchema: z.object({
      category: z.enum(["meetings", "audits", "compliance", "training"]).optional(),
      status: z.enum(["planned", "confirmed", "completed", "postponed"]).optional(),
      search: z.string().optional(),
    }),
  }),
  list_notes: tool({ description: "List all notes.", inputSchema: z.object({}) }),
  list_tasks: tool({
    description: "List tasks, optionally filter by completion.",
    inputSchema: z.object({ completed: z.boolean().optional() }),
  }),

  // ===== REMEDIATION MUTATIONS =====
  create_remediation_item: tool({
    description: "Create a new remediation item.",
    inputSchema: z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(["critical", "high", "medium", "low"]),
      status: z.enum(["open", "in_progress", "pending_review", "closed"]).default("open"),
      category: z.string().default("General"),
      dueDate: z.string().describe("ISO date, e.g. 2026-06-15"),
      assignedToName: z.string().default("Unassigned"),
    }),
  }),
  update_remediation_item: tool({
    description: "Update fields on an existing remediation item by id (e.g. REM-001). Requires user confirmation.",
    inputSchema: z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      priority: z.enum(["critical", "high", "medium", "low"]).optional(),
      status: z.enum(["open", "in_progress", "pending_review", "closed"]).optional(),
      dueDate: z.string().optional(),
    }),
  }),
  delete_remediation_item: tool({
    description: "Delete a remediation item by id. Requires user confirmation.",
    inputSchema: z.object({ id: z.string() }),
  }),
  filter_remediation_table: tool({
    description: "Apply a filter to the remediation table view (used when user is on /remediation/admin).",
    inputSchema: z.object({
      status: z.enum(["open", "in_progress", "pending_review", "closed", "all"]).default("all"),
      priority: z.enum(["critical", "high", "medium", "low", "all"]).default("all"),
    }),
  }),

  // ===== EVENTS =====
  create_event: tool({
    description: "Create a calendar event.",
    inputSchema: z.object({
      title: z.string(),
      description: z.string().default(""),
      category: z.enum(["meetings", "audits", "compliance", "training"]),
      startDate: z.string().describe("ISO datetime"),
      endDate: z.string().describe("ISO datetime"),
      status: z.enum(["planned", "confirmed", "completed", "postponed"]).default("planned"),
      priority: z.enum(["high", "medium", "low"]).default("medium"),
    }),
  }),
  update_event: tool({
    description: "Update an event by id. Requires confirmation.",
    inputSchema: z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.enum(["planned", "confirmed", "completed", "postponed"]).optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
    }),
  }),
  delete_event: tool({
    description: "Delete an event by id. Requires confirmation.",
    inputSchema: z.object({ id: z.string() }),
  }),

  // ===== NOTES =====
  create_note: tool({
    description: "Create a note.",
    inputSchema: z.object({ title: z.string(), content: z.string().default("") }),
  }),
  update_note: tool({
    description: "Update a note. Requires confirmation.",
    inputSchema: z.object({ id: z.string(), title: z.string().optional(), content: z.string().optional() }),
  }),
  delete_note: tool({
    description: "Delete a note. Requires confirmation.",
    inputSchema: z.object({ id: z.string() }),
  }),

  // ===== TASKS =====
  create_task: tool({
    description: "Create a task.",
    inputSchema: z.object({
      title: z.string(),
      priority: z.enum(["high", "medium", "low"]).default("medium"),
      dueDate: z.string().optional(),
    }),
  }),
  toggle_task: tool({
    description: "Mark task complete/incomplete.",
    inputSchema: z.object({ id: z.string() }),
  }),
  delete_task: tool({
    description: "Delete a task. Requires confirmation.",
    inputSchema: z.object({ id: z.string() }),
  }),

  // ===== NAVIGATION =====
  navigate_to: tool({
    description: "Navigate the user to a route in the app.",
    inputSchema: z.object({
      path: z.enum([
        "/", "/events", "/violations",
        "/remediation", "/remediation/admin", "/remediation/dashboard",
      ]),
    }),
  }),
};

const SYSTEM_PROMPT = `You are Nova, an in-app AI assistant for the RAP (Remediation Action Plan) & Event Horizon Hub system. You help the user view, create, modify, and delete data across:
- Remediation items (security findings workflow)
- Calendar events
- Notes
- Tasks

Behavior rules:
- Be concise. Confirm understanding briefly, then act.
- ALWAYS call get_app_state or the relevant list_* tool BEFORE updating or deleting, so you have real ids.
- Item ids look like REM-001 for remediation; events/notes/tasks use opaque ids.
- Destructive or modifying tools (update_*, delete_*) trigger a confirmation dialog on the client — that is expected, don't ask the user twice.
- Use ISO 8601 for dates. If the user says relative dates (e.g. "next Friday"), compute them based on today.
- After completing an action, give a one-line summary of what changed.
- If the user asks something outside this app's scope, say so politely.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const today = new Date().toISOString();

    const result = streamText({
      model: gateway("google/gemini-3-flash-preview"),
      system: `${SYSTEM_PROMPT}\n\nToday's date is ${today}.`,
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(50),
    });

    return result.toUIMessageStreamResponse({ headers: corsHeaders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("ai-chat error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
