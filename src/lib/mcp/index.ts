import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import getAppInfoTool from "./tools/get-app-info";
import getHubLinkTool from "./tools/list-hub-links";

export default defineMcp({
  name: "cybergrc-mcp",
  title: "CyberGRC Command Center",
  version: "0.1.0",
  instructions:
    "Tools for the CyberGRC Command Center app. Call get_app_info first to learn what the app does, its three hubs (Violations, Remediation, Event Horizon), routes, and data models. Use get_hub_link to point users at a specific section. Use echo to verify connectivity. Live per-user data is not exposed through this MCP because the app currently stores it client-side.",
  tools: [getAppInfoTool, getHubLinkTool, echoTool],
});
