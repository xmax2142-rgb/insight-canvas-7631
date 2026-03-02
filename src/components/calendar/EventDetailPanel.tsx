import { CalendarEvent, EventCategory, EventStatus, EventPriority } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Calendar, Clock, User, Building2, Users, CheckSquare, Paperclip, FileText, ChevronDown, ChevronUp, Edit, Copy, Trash2, Download, Flame, Lock, AlertTriangle } from "lucide-react";
import { format, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { downloadICS } from "@/lib/icsExport";
import { useToast } from "@/hooks/use-toast";

interface EventDetailPanelProps { event: CalendarEvent; onClose: () => void; onEdit: () => void; onDuplicate: () => void; onDelete: () => void; isMobile?: boolean; }

const categoryLabels: Record<EventCategory, string> = { meetings: "Meeting", audits: "Audit", compliance: "Compliance", training: "Training" };
const categoryColors: Record<EventCategory, string> = { meetings: "bg-category-meetings text-category-meetings-foreground", audits: "bg-category-audits text-category-audits-foreground", compliance: "bg-category-compliance text-category-compliance-foreground", training: "bg-category-training text-category-training-foreground" };
const statusLabels: Record<EventStatus, string> = { planned: "Planned", confirmed: "Confirmed", completed: "Completed", postponed: "Postponed" };
const priorityConfig: Record<EventPriority, { label: string; className: string }> = { high: { label: "High Priority", className: "text-priority-high" }, medium: { label: "Medium Priority", className: "text-priority-medium" }, low: { label: "Low Priority", className: "text-priority-low" } };

export function EventDetailPanel({ event, onClose, onEdit, onDuplicate, onDelete, isMobile }: EventDetailPanelProps) {
  const { toast } = useToast();
  const [attendeesOpen, setAttendeesOpen] = useState(true);
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const isOverdue = isBefore(event.endDate, new Date()) && event.status !== "completed";
  const completedCount = event.checklist.filter(i => i.completed).length;
  const formatFileSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

  return (
    <div className={cn("flex flex-col bg-card/50 backdrop-blur-sm", isMobile ? "" : "max-h-[85vh]")}>
      <div className="flex items-start justify-between p-5 border-b border-border/30 bg-card/80 cursor-grab active:cursor-grabbing select-none">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge className={cn(categoryColors[event.category], "rounded-lg px-2.5 py-1 font-semibold")}>{categoryLabels[event.category]}</Badge>
            {event.isConfidential && <Badge variant="outline" className="gap-1 rounded-lg px-2.5 py-1"><Lock className="h-3 w-3" />Confidential</Badge>}
            {isOverdue && <Badge className="gap-1 rounded-lg px-2.5 py-1 bg-status-overdue text-white"><AlertTriangle className="h-3 w-3" />Overdue</Badge>}
          </div>
          <h2 className="text-xl font-bold text-foreground">{event.title}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 rounded-xl"><X className="h-4 w-4" /></Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3"><Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><div><div className="text-sm font-medium">{format(event.startDate, "EEEE, MMMM d, yyyy")}</div>{!event.allDay && <div className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{format(event.startDate, "h:mm a")} - {format(event.endDate, "h:mm a")}</div>}{event.allDay && <div className="text-sm text-muted-foreground">All day event</div>}</div></div>
          <div className="flex items-center gap-4"><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Status:</span><Badge variant="secondary">{statusLabels[event.status]}</Badge></div><div className="flex items-center gap-2">{event.priority === "high" && <Flame className="h-4 w-4 text-priority-high" />}<span className={cn("text-sm font-medium", priorityConfig[event.priority].className)}>{priorityConfig[event.priority].label}</span></div></div>
          <Separator />
          <div className="space-y-2"><div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><div><span className="text-sm text-muted-foreground">Owner: </span><span className="text-sm font-medium">{event.owner}</span></div></div><div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-muted-foreground" /><div><span className="text-sm text-muted-foreground">Department: </span><span className="text-sm font-medium">{event.department}</span></div></div></div>
          {event.description && <><Separator /><div><h3 className="text-sm font-medium mb-2">Description</h3><p className="text-sm text-muted-foreground">{event.description}</p></div></>}
          <Separator />
          {event.attendees.length > 0 && <Collapsible open={attendeesOpen} onOpenChange={setAttendeesOpen}><CollapsibleTrigger className="flex items-center justify-between w-full py-2"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Attendees ({event.attendees.length})</span></div>{attendeesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</CollapsibleTrigger><CollapsibleContent className="space-y-2 pt-2">{event.attendees.map(a => <div key={a.id} className="flex items-center gap-2 pl-6"><div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{a.name.split(" ").map(n => n[0]).join("")}</div><div className="flex-1 min-w-0"><div className="text-sm truncate">{a.name}</div>{a.role && <div className="text-xs text-muted-foreground">{a.role}</div>}</div></div>)}</CollapsibleContent></Collapsible>}
          {event.checklist.length > 0 && <Collapsible open={checklistOpen} onOpenChange={setChecklistOpen}><CollapsibleTrigger className="flex items-center justify-between w-full py-2"><div className="flex items-center gap-2"><CheckSquare className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Checklist ({completedCount}/{event.checklist.length})</span></div>{checklistOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</CollapsibleTrigger><CollapsibleContent className="space-y-2 pt-2">{event.checklist.map(i => <div key={i.id} className="flex items-center gap-2 pl-6"><Checkbox checked={i.completed} disabled /><span className={cn("text-sm", i.completed && "text-muted-foreground line-through")}>{i.text}</span></div>)}</CollapsibleContent></Collapsible>}
        </div>
      </ScrollArea>
      <div className="p-5 border-t border-border/30 bg-card/80">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="flex-1 rounded-xl" onClick={onEdit}><Edit className="h-4 w-4 mr-1.5" />Edit</Button>
          <Button variant="ghost" size="sm" className="rounded-xl bg-secondary/50" onClick={onDuplicate}><Copy className="h-4 w-4 mr-1.5" />Duplicate</Button>
          <Button variant="ghost" size="sm" className="rounded-xl bg-secondary/50" onClick={() => { downloadICS(event); toast({ title: "Event exported" }); }}><Download className="h-4 w-4 mr-1.5" />Export</Button>
          <Button size="sm" className="rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30" onClick={onDelete}><Trash2 className="h-4 w-4 mr-1.5" />Delete</Button>
        </div>
      </div>
    </div>
  );
}
