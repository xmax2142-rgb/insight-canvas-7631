export type ComplianceStatus = "compliant" | "at-risk" | "non-compliant";

export type SystemType =
  | "linux-server"
  | "windows-server"
  | "linux-workstation"
  | "windows-workstation"
  | "network-device"
  | "database";

export interface ComplianceSystem {
  id: string;
  name: string;
  type: SystemType;
  owner: string;
  environment: "Production" | "Staging" | "Development";
  totalControls: number;
  passedControls: number;
  lastAssessmentDate: string; // ISO date
  notes?: string;
}

export const SYSTEM_TYPE_LABELS: Record<SystemType, string> = {
  "linux-server": "Linux Servers",
  "windows-server": "Windows Servers",
  "linux-workstation": "Linux Workstations",
  "windows-workstation": "Windows Workstations",
  "network-device": "Network Devices",
  "database": "Databases",
};

export function computeScore(s: Pick<ComplianceSystem, "passedControls" | "totalControls">): number {
  if (!s.totalControls) return 0;
  return Math.round((s.passedControls / s.totalControls) * 100);
}

export function computeStatus(score: number): ComplianceStatus {
  if (score >= 90) return "compliant";
  if (score >= 70) return "at-risk";
  return "non-compliant";
}
