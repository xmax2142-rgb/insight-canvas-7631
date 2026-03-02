export type ActionTaken = "issue_violation" | "issue_warning" | "no_action";

export interface Violation {
  id: string;
  number: number;
  name: string;
  description: string;
  violatingUser: string;
  grcComments: string;
  status: "open" | "closed";
  actionTaken: ActionTaken;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  finalDecision?: string;
}
