import type { Violation } from "@/types/violation";

export interface EmailSettings {
  violationSubject: string;
  violationBody: string;
  companyDomain: string;
  ccList: string;
}

export const DEFAULT_VIOLATION_SUBJECT =
  "Security Policy Violation Notice - #{{violationNumber}}: {{violationName}}";

export const DEFAULT_VIOLATION_BODY = `Dear {{userName}},

This is a formal notice that a cybersecurity policy violation has been recorded against your account and reviewed by the GRC team.

Violation Reference: #{{violationNumber}}
Violation: {{violationName}}
Date Recorded: {{createdDate}}
Date Closed: {{closedDate}}

Description
{{description}}

GRC Review Comments
{{grcComments}}

Final Decision
{{finalDecision}}

Action Taken: {{actionTaken}}

Please review the corporate security policy and ensure this does not happen again. Repeated violations may lead to further action in line with company policy. If you believe this notice was issued in error, reply to this email within five business days.

Regards,
Governance, Risk and Compliance Team`;

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  violationSubject: DEFAULT_VIOLATION_SUBJECT,
  violationBody: DEFAULT_VIOLATION_BODY,
  companyDomain: "",
  ccList: "",
};

export const TEMPLATE_PLACEHOLDERS = [
  "violationNumber",
  "violationName",
  "userName",
  "userEmail",
  "description",
  "grcComments",
  "finalDecision",
  "actionTaken",
  "createdDate",
  "closedDate",
] as const;

const ACTION_LABELS: Record<string, string> = {
  issue_violation: "Violation Issued",
  issue_warning: "Warning Issued",
  no_action: "No Action",
};

function fmtDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

/** Derives an email address from a person's name, e.g. "Ghamdi, Saeed M" -> saeed.ghamdi@domain */
export function deriveEmail(name: string, domain: string): string {
  const cleanDomain = domain.trim().replace(/^@/, "");
  if (!cleanDomain) return "";
  const normalized = name.includes(",")
    ? name.split(",").map((p) => p.trim()).reverse().join(" ")
    : name;
  const parts = normalized
    .replace(/\([^)]*\)/g, "")
    .split(/\s+/)
    .map((p) => p.replace(/[^A-Za-z0-9-]/g, ""))
    .filter((p) => p.length > 1);
  if (parts.length === 0) return "";
  const local = (parts.length === 1 ? parts : [parts[0], parts[parts.length - 1]])
    .join(".")
    .toLowerCase();
  return `${local}@${cleanDomain}`;
}

export function renderTemplate(
  template: string,
  violation: Violation,
  extra: { finalDecision?: string; actionTaken?: string; userEmail?: string } = {},
): string {
  const values: Record<string, string> = {
    violationNumber: String(violation.number ?? ""),
    violationName: violation.name ?? "",
    userName: violation.violatingUser ?? "",
    userEmail: extra.userEmail ?? violation.violatingUserEmail ?? "",
    description: violation.description || "-",
    grcComments: violation.grcComments || "-",
    finalDecision: extra.finalDecision ?? violation.finalDecision ?? "-",
    actionTaken: ACTION_LABELS[extra.actionTaken ?? violation.actionTaken ?? "no_action"] ?? "-",
    createdDate: fmtDate(violation.createdAt),
    closedDate: fmtDate(violation.closedAt ?? new Date().toISOString()),
  };
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => (key in values ? values[key] : m));
}

const MAILTO_MAX = 1900;

export function buildMailtoUrl(opts: { to: string; cc?: string; subject: string; body: string }): string {
  const encode = (s: string) => encodeURIComponent(s.replace(/\r?\n/g, "\r\n"));
  const params: string[] = [];
  if (opts.cc?.trim()) params.push(`cc=${encode(opts.cc.trim())}`);
  params.push(`subject=${encode(opts.subject)}`);

  const base = `mailto:${encodeURIComponent(opts.to.trim())}?${params.join("&")}&body=`;
  let body = opts.body;
  let encoded = encode(body);
  if (base.length + encoded.length > MAILTO_MAX) {
    const note = "\r\n\r\n[Message truncated - see the Violations Hub record for full details.]";
    while (body.length > 0 && base.length + encode(body + note).length > MAILTO_MAX) {
      body = body.slice(0, -200);
    }
    encoded = encode(body + note);
  }
  return base + encoded;
}

export function openMailClient(url: string) {
  window.location.href = url;
}

export const SAMPLE_VIOLATION: Violation = {
  id: "sample",
  number: 42,
  name: "Unauthorized USB Device Usage",
  description: "An unapproved USB mass-storage device was connected to a managed workstation.",
  violatingUser: "Mohammad Qhatani",
  grcComments: "Confirmed via endpoint telemetry; device was blocked automatically.",
  status: "closed",
  actionTaken: "issue_violation",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  closedAt: new Date().toISOString(),
  finalDecision: "Violation confirmed. Formal notice issued and awareness training assigned.",
};
