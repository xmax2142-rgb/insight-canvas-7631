import { defineTool } from "@lovable.dev/mcp-js";

const APP_INFO = {
  name: "CyberGRC Command Center",
  description:
    "A Cybersecurity Governance, Risk & Compliance dashboard for security analysts, combining three hubs: Cyber Violations, Remediation, and Event Horizon (calendar).",
  hubs: [
    { id: "violations", name: "Cyber Violations Hub", path: "/violations", purpose: "Log, edit, close, and delete cybersecurity violations. Includes KPI donut charts and a searchable/filterable table." },
    { id: "remediation", name: "Remediation Hub", path: "/remediation", purpose: "Role-based workspace (GRC Analyst / Proponent) to track remediation items from a prior assessment, with metrics that filter the table by status and priority." },
    { id: "events", name: "Event Horizon Hub", path: "/events", purpose: "Multi-view calendar (dashboard, calendar grid, notes, tasks) for tracking cybersecurity activities. Supports drag-and-drop, ICS export, and category/priority filtering." },
  ],
  dataModels: {
    violation: ["id (uuid)", "number", "name", "description", "violatingUser", "status (open|closed)", "actionTaken (issue_violation|issue_warning|no_action)", "finalDecision", "grcComments"],
    remediationItem: ["id (REM-###)", "title", "description", "status (open|in_progress|pending_review|closed)", "priority (critical|high|medium|low)", "assignedToName", "dueDate", "category"],
    calendarEvent: ["id", "title", "category (meetings|audits|compliance|training)", "startDate", "endDate", "status", "priority"],
    task: ["id", "title", "completed", "priority", "dueDate"],
    note: ["id", "title", "content"],
  },
  note: "This app currently stores its GRC data in each browser's local storage (client-side only). MCP tools run server-side and cannot read per-browser state, so they expose app metadata and structure rather than live user data. To expose live data through MCP, the stores would need to be migrated to database tables.",
};

export default defineTool({
  name: "get_app_info",
  title: "Get app info",
  description: "Return the CyberGRC app's name, description, hubs, routes, and data models. Use this first to understand what the app does.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(APP_INFO, null, 2) }],
    structuredContent: APP_INFO,
  }),
});
