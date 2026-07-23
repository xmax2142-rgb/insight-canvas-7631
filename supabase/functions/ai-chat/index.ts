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
// (against the local Zustand stores + DOM) so the assistant can mutate UI state
// and control what the user sees on the page.
const tools = {
  // ===== READ / CONTEXT =====
  get_page_structure: tool({
    description: "Get the full app routing map and data model schema. Call this when the user asks how the app is organized, what pages exist, or before navigating somewhere new.",
    inputSchema: z.object({}),
  }),
  get_page_context: tool({
    description: "Get the CURRENT page context: route, page title, visible KPIs, active filters, and route-specific state (e.g. selected event on /events, current filter on /remediation/admin). ALWAYS call this at the start of a conversation and whenever the user references what they're 'looking at', 'this', 'here', or 'on the page'.",
    inputSchema: z.object({}),
  }),
  get_app_state: tool({
    description: "Get a compact snapshot of ALL data across modules: counts and recent items across remediation, events, notes, tasks, violations. Use for global questions.",
    inputSchema: z.object({}),
  }),
  explain_item: tool({
    description: "Look up a specific item and return a plain-English explanation of what it is, its status, and why it matters. Use when the user asks 'what is X', 'tell me about X', 'why is X red', etc.",
    inputSchema: z.object({
      type: z.enum(["remediation", "violation", "event", "note", "task"]),
      id: z.string().describe("The item id, e.g. REM-003, a violation uuid, event id, etc. Or a number like '5' for violation #5."),
    }),
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

  // ===== UI CONTROL =====
  scroll_to_element: tool({
    description: "Scroll the page to a specific element and briefly highlight it with a pulse, so the user can see what you're referring to. Use after creating something or when the user asks 'show me X'.",
    inputSchema: z.object({
      selector: z.string().describe("CSS selector or data-item-id like [data-item-id='REM-003']"),
    }),
  }),
  set_page_filter: tool({
    description: "Apply a filter to the current page's list/table view. Works on /remediation/admin (status/priority) and /events (category/status/priority).",
    inputSchema: z.object({
      status: z.string().optional(),
      priority: z.string().optional(),
      category: z.string().optional(),
      search: z.string().optional(),
    }),
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

  // ===== VIOLATIONS =====
  list_violations: tool({
    description: "List cybersecurity violations, optionally filtered by status or search query.",
    inputSchema: z.object({
      status: z.enum(["open", "closed", "all"]).optional(),
      search: z.string().optional(),
    }),
  }),
  create_violation: tool({
    description: "Create a new cybersecurity violation record.",
    inputSchema: z.object({
      name: z.string(),
      description: z.string().default(""),
      violatingUser: z.string(),
      grcComments: z.string().default(""),
      status: z.enum(["open", "closed"]).default("open"),
      actionTaken: z.enum(["issue_violation", "issue_warning", "no_action"]).default("no_action"),
      finalDecision: z.string().optional(),
    }),
  }),
  update_violation: tool({
    description: "Update a violation by id (uuid). Requires confirmation. Use to close violations, change action taken, or edit details.",
    inputSchema: z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      violatingUser: z.string().optional(),
      grcComments: z.string().optional(),
      status: z.enum(["open", "closed"]).optional(),
      actionTaken: z.enum(["issue_violation", "issue_warning", "no_action"]).optional(),
      finalDecision: z.string().optional(),
    }),
  }),
  delete_violation: tool({
    description: "Delete a violation by id. Requires confirmation.",
    inputSchema: z.object({ id: z.string() }),
  }),

  // ===== NAVIGATION =====
  navigate_to: tool({
    description: "Navigate the user to a route in the app. Call get_page_structure first if unsure which routes exist.",
    inputSchema: z.object({
      path: z.enum([
        "/", "/events", "/violations",
        "/remediation", "/remediation/admin", "/remediation/dashboard",
        "/about", "/authors", "/contact", "/style-guide", "/privacy", "/terms",
      ]),
    }),
  }),
};

const SYSTEM_PROMPT = `You are Nova, a calm, sharp cybersecurity analyst co-pilot embedded in the RAP (Remediation Action Plan) & Event Horizon Hub — a cybersecurity GRC command center. You work alongside the analyst as a trusted teammate, not a chatbot.

You have full access across the app:
- Remediation items (security findings workflow at /remediation/admin)
- Calendar events, Notes, Tasks (at /events)
- Cybersecurity Violations (at /violations)
- Navigation across every page, scrolling to specific elements, and applying UI filters

How you behave:
- Talk like a human colleague. Plain, natural English only — NO markdown (no **bold**, no headings, no bullet lists, no code blocks). Just sentences and short paragraphs.
- Be concise but warm. Confirm briefly, then act.
- ALWAYS call get_page_context at the start of a new conversation, or any time the user references "this", "here", "what I'm looking at", or the current view. Use the result to ground your reply in what's on their screen.
- When the user asks about a specific item (e.g. "REM-003", "violation 4", "the audit next week"), call explain_item to get its full details and describe it in plain language — do NOT just dump the JSON at them.
- After creating or updating something, offer to scroll_to_element it so the user can see the change.
- Use set_page_filter to filter the current view when the user asks things like "show me only the critical ones" or "just the open items".
- Before update_* or delete_*, ALWAYS look up the item first (list_* or get_app_state) so you have the real id. Remediation ids look like REM-001; violation ids are uuids.
- Destructive tools trigger a confirmation dialog automatically — don't ask the user twice, just call the tool.
- Use ISO 8601 for dates; compute relative dates ("next Friday") based on today.
- After any action, give a one-line summary of what changed and suggest one natural next step.
- If asked something outside this app's scope, say so politely.`;



Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const today = new Date().toISOString();

    // Repair history: Gemini rejects a user turn that directly follows tool
    // results without an intervening assistant text. If a previous streamed
    // turn ended after tool calls with no final assistant text, inject one so
    // the request shape stays valid.
    const modelMessages = await convertToModelMessages(messages);
    const repaired: typeof modelMessages = [];
    for (let i = 0; i < modelMessages.length; i++) {
      const msg = modelMessages[i];
      const prev = repaired[repaired.length - 1];
      if (msg.role === "user" && prev?.role === "tool") {
        repaired.push({ role: "assistant", content: "OK." } as any);
      }
      repaired.push(msg);
    }

    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system: `${SYSTEM_PROMPT}\n\nToday's date is ${today}.`,
      messages: repaired,
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
