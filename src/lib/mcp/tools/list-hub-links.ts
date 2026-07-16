import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const HUBS = {
  violations: { name: "Cyber Violations Hub", path: "/violations" },
  remediation: { name: "Remediation Hub", path: "/remediation" },
  events: { name: "Event Horizon Hub", path: "/events" },
  home: { name: "Home Dashboard", path: "/" },
} as const;

export default defineTool({
  name: "get_hub_link",
  title: "Get hub link",
  description: "Return the URL path for a specific hub in the CyberGRC app. Useful when guiding a user to a section.",
  inputSchema: {
    hub: z.enum(["violations", "remediation", "events", "home"]).describe("Which hub to link to."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ hub }) => {
    const target = HUBS[hub];
    return {
      content: [{ type: "text", text: `${target.name}: ${target.path}` }],
      structuredContent: target,
    };
  },
});
