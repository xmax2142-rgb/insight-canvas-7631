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
  /** Total assets in this subcategory. */
  totalAssets: number;
  /** Assets that passed compliance this month. */
  passedAssets: number;
  notes?: string;
}

export interface ComplianceSystem {
  id: string;
  name: string;
  type: SystemType;
  owner: string;
  environment: "Production" | "Staging" | "Development";
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

/** Roll up passed/total assets from subcategories. */
export function rollupAssets(s: ComplianceSystem): { passed: number; total: number } {
  return (s.subcategories ?? []).reduce(
    (acc, sub) => ({
      passed: acc.passed + (sub.passedAssets || 0),
      total: acc.total + (sub.totalAssets || 0),
    }),
    { passed: 0, total: 0 },
  );
}

export function computeScore(s: ComplianceSystem): number {
  const { passed, total } = rollupAssets(s);
  if (!total) return 0;
  return Math.round((passed / total) * 100);
}

export function computeStatus(score: number): ComplianceStatus {
  if (score >= 90) return "compliant";
  if (score >= 70) return "at-risk";
  return "non-compliant";
}
