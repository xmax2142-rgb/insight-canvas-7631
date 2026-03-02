import { CalendarEvent, EventCategory } from "@/types/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Clock, Flame, AlertTriangle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventListModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  variant?: "default" | "overdue" | "critical";
}

const categoryColors: Record<EventCategory, string> = {
  meetings: "bg-category-meetings text-category-meetings-foreground",
  audits: "bg-category-audits text-category-audits-foreground",
  compliance: "bg-category-compliance text-category-compliance-foreground",
  training: "bg-category-training text-category-training-foreground",
};

const categoryLabels: Record<EventCategory, string> = { meetings: "Meeting", audits: "Audit", compliance: "Compliance", training: "Training" };

export function EventListModal({ open, onClose, title, events, onEventClick, variant = "default" }: EventListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border/30 rounded-2xl">
        <DialogHeader>
          <DialogTitle className={cn("text-xl font-bold", variant === "overdue" && "text-status-overdue", variant === "critical" && "text-accent")}>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No events found</div>
          ) : (
            <div className="space-y-3 pr-4">
              {events.map((event) => (
                <button key={event.id} onClick={() => { onEventClick(event); onClose(); }} className="w-full text-left p-4 rounded-xl bg-secondary/50 border border-border/30 hover:bg-secondary hover:border-primary/50 transition-all duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={cn(categoryColors[event.category], "rounded-lg text-xs")}>{categoryLabels[event.category]}</Badge>
                        {event.priority === "high" && <Flame className="h-4 w-4 text-priority-high" />}
                        {event.isConfidential && <Lock className="h-4 w-4 text-muted-foreground" />}
                        {variant === "overdue" && <AlertTriangle className="h-4 w-4 text-status-overdue" />}
                      </div>
                      <h4 className="font-semibold text-foreground mb-1 truncate">{event.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(event.startDate, "MMM d, yyyy")}</span>
                        {!event.allDay && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(event.startDate, "h:mm a")}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
