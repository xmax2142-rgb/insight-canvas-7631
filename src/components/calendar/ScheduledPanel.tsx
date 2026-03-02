import { CalendarEvent } from "@/types/calendar";
import { format, isToday, startOfDay } from "date-fns";
import { Clock, ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ScheduledPanelProps { events: CalendarEvent[]; selectedDate: Date; onEventClick: (event: CalendarEvent) => void; onDateChange: (date: Date) => void; onClose?: () => void; }

const categoryColors: Record<string, string> = { meetings: "bg-category-meetings", audits: "bg-category-audits", compliance: "bg-category-compliance", training: "bg-category-training" };

export function ScheduledPanel({ events, selectedDate, onEventClick, onDateChange, onClose }: ScheduledPanelProps) {
  const dayEvents = events.filter((e) => { const es = startOfDay(e.startDate); const ee = startOfDay(e.endDate); const ds = startOfDay(selectedDate); return ds >= es && ds <= ee; }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const eventsByHour = dayEvents.reduce((acc, e) => { const h = format(e.startDate, "HH:mm"); if (!acc[h]) acc[h] = []; acc[h].push(e); return acc; }, {} as Record<string, CalendarEvent[]>);
  const hours = Object.keys(eventsByHour).sort();
  const getDuration = (e: CalendarEvent) => { const m = Math.floor((e.endDate.getTime() - e.startDate.getTime()) / 60000); if (m < 60) return `${m} min`; const h = Math.floor(m / 60); return h + (m % 60 ? `h ${m % 60}m` : ` hour${h > 1 ? 's' : ''}`); };

  return (
    <div className="flex flex-col h-full bg-card/30 border-l border-border/20">
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-lg text-foreground">Scheduled</h2>
          <div className="flex items-center gap-1">
            {onClose && <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg"><X className="h-4 w-4" /></Button>}
            <Button variant="ghost" size="icon" onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); onDateChange(d); }} className="h-8 w-8 rounded-lg"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); onDateChange(d); }} className="h-8 w-8 rounded-lg"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{isToday(selectedDate) ? "Today, " : ""}{format(selectedDate, "d MMMM, yyyy")}</p>
      </div>
      <ScrollArea className="flex-1 p-4">
        {hours.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-center py-12"><Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" /><p className="text-muted-foreground">No events scheduled</p></div>
        : <div className="space-y-6">{hours.map((hour) => <div key={hour}><div className="text-sm text-muted-foreground mb-3">{hour}</div><div className="space-y-4">{eventsByHour[hour].map((e) => <div key={e.id} onClick={() => onEventClick(e)} className="group cursor-pointer"><div className={cn("h-1.5 w-full rounded-full mb-3", categoryColors[e.category] || "bg-primary")} /><div className="space-y-2"><h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{e.title}</h3><div className="flex items-center justify-between"><div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" /><span>{format(e.startDate, "HH:mm")} – {format(e.endDate, "HH:mm")}</span></div><span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">{getDuration(e)}</span></div>{e.attendees.length > 0 && <div className="flex items-center gap-2 mt-2"><div className="flex -space-x-2">{e.attendees.slice(0,4).map((a) => <Avatar key={a.id} className="w-6 h-6 border-2 border-card"><AvatarFallback className="text-[10px] bg-primary text-primary-foreground">{a.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>)}</div><span className="text-xs text-muted-foreground">{e.attendees[0]?.name?.split(' ')[0]}{e.attendees.length > 1 && `, ${e.attendees[1]?.name?.split(' ')[0]}`}{e.attendees.length > 2 && <span className="text-muted-foreground/70"> +{e.attendees.length - 2} more</span>}</span></div>}</div></div>)}</div></div>)}</div>}
      </ScrollArea>
    </div>
  );
}
