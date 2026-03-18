import { CalendarEvent, EventCategory, EventStatus, FilterState } from "@/types/calendar";
import { format, isToday, isTomorrow, isThisWeek, startOfDay, isBefore, addDays } from "date-fns";
import { Calendar, Clock, CheckCircle2, AlertTriangle, TrendingUp, Users, Flame, ArrowRight, BarChart3, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DashboardViewProps { events: CalendarEvent[]; onEventClick: (event: CalendarEvent) => void; onViewCalendar: () => void; onFilterAndView?: (filters: Partial<FilterState>) => void; }

const categoryConfig: Record<EventCategory, { label: string; color: string; bg: string }> = {
  meetings: { label: "Meetings", color: "text-category-meetings", bg: "bg-category-meetings" },
  audits: { label: "Audits", color: "text-category-audits", bg: "bg-category-audits" },
  compliance: { label: "Compliance", color: "text-category-compliance", bg: "bg-category-compliance" },
  training: { label: "Training", color: "text-category-training", bg: "bg-category-training" },
};

const statusConfig: Record<EventStatus, { label: string; color: string }> = {
  planned: { label: "Planned", color: "text-muted-foreground" },
  confirmed: { label: "Confirmed", color: "text-primary" },
  completed: { label: "Completed", color: "text-status-completed" },
  postponed: { label: "Postponed", color: "text-yellow-500" },
};

export function DashboardView({ events, onEventClick, onViewCalendar }: DashboardViewProps) {
  const now = new Date();
  const today = startOfDay(now);
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === "completed").length;
  const overdueEvents = events.filter(e => isBefore(e.endDate, now) && e.status !== "completed");
  const highPriorityEvents = events.filter(e => e.priority === "high" && e.status !== "completed");
  const todayEvents = events.filter(e => isToday(e.startDate));
  const thisWeekEvents = events.filter(e => isThisWeek(e.startDate) && e.status !== "completed");
  const eventsByCategory = Object.keys(categoryConfig).map(cat => ({ category: cat as EventCategory, count: events.filter(e => e.category === cat).length, ...categoryConfig[cat as EventCategory] }));
  const eventsByStatus = Object.keys(statusConfig).map(s => ({ status: s as EventStatus, count: events.filter(e => e.status === s).length, ...statusConfig[s as EventStatus] }));
  const upcomingDeadlines = events.filter(e => { const d = startOfDay(e.startDate); return d >= today && d <= addDays(today, 7) && e.status !== "completed"; }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()).slice(0, 5);
  const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;
  const getDateLabel = (date: Date) => { if (isToday(date)) return "Today"; if (isTomorrow(date)) return "Tomorrow"; return format(date, "EEE, MMM d"); };

  return (
    <div className="flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-foreground">Dashboard</h1><p className="text-muted-foreground text-sm">Overview of your calendar activity</p></div>
        <Button onClick={onViewCalendar} className="gap-2 rounded-xl"><Calendar className="h-4 w-4" />View Calendar</Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-6 pb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border/30 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-primary/50" onClick={onViewCalendar}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Events</p><p className="text-3xl font-bold text-foreground">{totalEvents}</p></div><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Calendar className="h-6 w-6 text-primary" /></div></div></CardContent></Card>
            <Card className="bg-card/50 border-border/30 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-primary/50" onClick={onViewCalendar}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Today</p><p className="text-3xl font-bold text-foreground">{todayEvents.length}</p></div><div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><Clock className="h-6 w-6 text-blue-500" /></div></div></CardContent></Card>
            <Card className="bg-card/50 border-border/30 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-status-completed/50" onClick={onViewCalendar}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Completed</p><p className="text-3xl font-bold text-foreground">{completedEvents}</p></div><div className="w-12 h-12 rounded-xl bg-status-completed/10 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-status-completed" /></div></div></CardContent></Card>
            <Card className="bg-card/50 border-border/30 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-status-overdue/50" onClick={onViewCalendar}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Overdue</p><p className="text-3xl font-bold text-status-overdue">{overdueEvents.length}</p></div><div className="w-12 h-12 rounded-xl bg-status-overdue/10 flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-status-overdue" /></div></div></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/30 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-primary/50" onClick={onViewCalendar}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" />Completion Rate</CardTitle></CardHeader><CardContent><div className="space-y-3"><div className="flex items-end justify-between"><span className="text-4xl font-bold text-foreground">{completionRate}%</span><span className="text-sm text-muted-foreground">{completedEvents}/{totalEvents}</span></div><Progress value={completionRate} className="h-2" /></div></CardContent></Card>
            <Card className="bg-card/50 border-border/30 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-priority-high/50" onClick={() => { if (highPriorityEvents.length > 0) onEventClick(highPriorityEvents[0]); else onViewCalendar(); }}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Flame className="h-4 w-4 text-priority-high" />High Priority</CardTitle></CardHeader><CardContent><div className="flex items-end justify-between"><span className="text-4xl font-bold text-priority-high">{highPriorityEvents.length}</span><span className="text-sm text-muted-foreground">pending</span></div></CardContent></Card>
            <Card className="bg-card/50 border-border/30 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-primary/50" onClick={onViewCalendar}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4" />This Week</CardTitle></CardHeader><CardContent><div className="flex items-end justify-between"><span className="text-4xl font-bold text-foreground">{thisWeekEvents.length}</span><span className="text-sm text-muted-foreground">upcoming</span></div></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card/50 border-border/30 backdrop-blur-sm"><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><PieChart className="h-4 w-4" />By Category</CardTitle></CardHeader><CardContent><div className="space-y-3">{eventsByCategory.map(({ category, count, label, bg }) => { const pct = totalEvents > 0 ? (count / totalEvents) * 100 : 0; return (<div key={category} className="space-y-1.5"><div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className={cn("w-3 h-3 rounded-full", bg)} /><span className="text-foreground">{label}</span></div><span className="text-muted-foreground">{count}</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className={cn("h-full rounded-full transition-all", bg)} style={{ width: `${pct}%` }} /></div></div>); })}</div></CardContent></Card>
            <Card className="bg-card/50 border-border/30 backdrop-blur-sm"><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" />Upcoming Deadlines</CardTitle></CardHeader><CardContent>{upcomingDeadlines.length === 0 ? <div className="text-center py-6 text-muted-foreground"><Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No upcoming deadlines</p></div> : <div className="space-y-3">{upcomingDeadlines.map((event) => (<button key={event.id} onClick={() => onEventClick(event)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left group"><div className={cn("w-1 h-10 rounded-full shrink-0", categoryConfig[event.category].bg)} /><div className="flex-1 min-w-0"><div className="flex items-center gap-2">{event.priority === "high" && <Flame className="h-3 w-3 text-priority-high shrink-0" />}<span className="font-medium text-sm truncate text-foreground group-hover:text-primary transition-colors">{event.title}</span></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{getDateLabel(event.startDate)}</span>{!event.allDay && <><span>•</span><span>{format(event.startDate, "h:mm a")}</span></>}</div></div><ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" /></button>))}</div>}</CardContent></Card>
          </div>
          <Card className="bg-card/50 border-border/30 backdrop-blur-sm"><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />By Status</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{eventsByStatus.map(({ status, count, label, color }) => (<div key={status} className="text-center p-4 rounded-xl bg-secondary/30"><p className={cn("text-3xl font-bold", color)}>{count}</p><p className="text-sm text-muted-foreground mt-1">{label}</p></div>))}</div></CardContent></Card>
        </div>
      </ScrollArea>
    </div>
  );
}
