export type EventCategory = "meetings" | "audits" | "compliance" | "training";

export type EventStatus = "planned" | "confirmed" | "completed" | "postponed";

export type EventPriority = "high" | "medium" | "low";

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Attendee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  status: EventStatus;
  priority: EventPriority;
  owner: string;
  department: string;
  
  attendees: Attendee[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  notes: string;
  isConfidential: boolean;
  recurrence: RecurrenceType;
  reminders: number[]; // minutes before event
}

export type CalendarViewType = "year" | "month" | "week" | "day" | "agenda";

export interface FilterState {
  categories: EventCategory[];
  statuses: EventStatus[];
  priorities: EventPriority[];
  searchQuery: string;
}
