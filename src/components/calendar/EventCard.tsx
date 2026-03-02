import { CalendarEvent, EventCategory } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { Flame, Check, AlertTriangle, Lock } from "lucide-react";
import { format, isBefore } from "date-fns";

interface EventCardProps {
  event: CalendarEvent;
  onClick: () => void;
  compact?: boolean;
}

const categoryStyles: Record<EventCategory, { bg: string; text: string; border: string }> = {
  meetings: { bg: "bg-category-meetings/20", text: "text-category-meetings", border: "border-l-category-meetings" },
  audits: { bg: "bg-category-audits/20", text: "text-category-audits", border: "border-l-category-audits" },
  compliance: { bg: "bg-category-compliance/20", text: "text-category-compliance", border: "border-l-category-compliance" },
  training: { bg: "bg-category-training/20", text: "text-category-training", border: "border-l-category-training" },
};

export function EventCard({ event, onClick, compact = false }: EventCardProps) {
  const styles = categoryStyles[event.category];
  const now = new Date();
  const isOverdue = isBefore(event.endDate, now) && event.status !== "completed";
  const isCompleted = event.status === "completed";

  if (compact) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={cn("w-full text-left px-2 py-1 rounded-lg text-xs truncate border-l-[3px] transition-all duration-200 hover:shadow-md hover:scale-[1.02]", styles.bg, styles.border, isOverdue && "opacity-80", isCompleted && "opacity-50")}
        title={event.title}
      >
        <span className="flex items-center gap-1">
          {event.priority === "high" && <Flame className="h-3 w-3 text-priority-high shrink-0 animate-pulse" />}
          {isCompleted && <Check className="h-3 w-3 text-status-completed shrink-0" />}
          {isOverdue && <AlertTriangle className="h-3 w-3 text-status-overdue shrink-0" />}
          {event.isConfidential && <Lock className="h-3 w-3 shrink-0" />}
          <span className={cn("truncate font-medium", isCompleted && "line-through")}>{event.title}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn("w-full text-left p-3 rounded-xl border-l-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] bg-card", styles.bg, styles.border, isOverdue && "ring-2 ring-status-overdue/50", isCompleted && "opacity-60")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            {event.priority === "high" && <Flame className="h-4 w-4 text-priority-high shrink-0 animate-pulse" />}
            {isCompleted && <Check className="h-4 w-4 text-status-completed shrink-0" />}
            {isOverdue && <AlertTriangle className="h-4 w-4 text-status-overdue shrink-0" />}
            {event.isConfidential && <Lock className="h-4 w-4 shrink-0" />}
            <span className={cn("font-semibold text-sm truncate", isCompleted && "line-through")}>{event.title}</span>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {event.allDay ? (
              <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">All day</span>
            ) : (
              <span>{format(event.startDate, "h:mm a")} - {format(event.endDate, "h:mm a")}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
