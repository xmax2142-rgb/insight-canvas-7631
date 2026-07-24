export type ComplianceStatus = "compliant" | "at-risk" | "non-compliant";

export type SystemType =
  | "linux-server"
  | "windows-server"
  | "linux-workstation"
  | "windows-workstation"
  | "network-device"
  | "database";

export interface Subcategory {
  id: string;
  name: string;
  passedControls: number;
  totalControls: number;
  notes?: string;
}

export interface ComplianceSystem {
  id: string;
  name: string;
  type: SystemType;
  owner: string;
  environment: "Production" | "Staging" | "Development";
  /** Direct control counts used only when subcategories is empty (legacy). */
  passedControls: number;
  totalControls: number;
  lastAssessmentDate: string; // ISO date
  notes?: string;
  subcategories: Subcategory[];
}

export const SYSTEM_TYPE_LABELS: Record<SystemType, string> = {
  "linux-server": "Linux Servers",
  "windows-server": "Windows Servers",
  "linux-workstation": "Linux Workstations",
  "windows-workstation": "Windows Workstations",
  "network-device": "Network Devices",
  "database": "Databases",
};

/** Roll up passed/total from subcategories, falling back to direct fields. */
export function rollupControls(s: ComplianceSystem): { passed: number; total: number } {
  if (s.subcategories && s.subcategories.length > 0) {
    return s.subcategories.reduce(
      (acc, sub) => ({
        passed: acc.passed + (sub.passedControls || 0),
        total: acc.total + (sub.totalControls || 0),
      }),
      { passed: 0, total: 0 },
    );
  }
  return { passed: s.passedControls || 0, total: s.totalControls || 0 };
}

export function computeScore(s: ComplianceSystem): number {
  const { passed, total } = rollupControls(s);
  if (!total) return 0;
  return Math.round((passed / total) * 100);
}

export function computeStatus(score: number): ComplianceStatus {
  if (score >= 90) return "compliant";
  if (score >= 70) return "at-risk";
  return "non-compliant";
}
