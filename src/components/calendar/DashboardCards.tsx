import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarEvent, EventCategory } from "@/types/calendar";
import { CalendarDays, AlertTriangle, PieChart, Clock } from "lucide-react";
import { isThisMonth, isBefore, differenceInDays, differenceInHours } from "date-fns";
import { cn } from "@/lib/utils";
import { EventListModal } from "./EventListModal";

interface DashboardCardsProps { events: CalendarEvent[]; onEventClick: (event: CalendarEvent) => void; }

const categoryColors: Record<EventCategory, string> = { meetings: "bg-category-meetings", audits: "bg-category-audits", compliance: "bg-category-compliance", training: "bg-category-training" };
const categoryLabels: Record<EventCategory, string> = { meetings: "Meetings", audits: "Audits", compliance: "Compliance", training: "Training" };
type ModalType = "upcoming" | "overdue" | "category" | "critical" | null;

export function DashboardCards({ events, onEventClick }: DashboardCardsProps) {
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const now = new Date();
  const upcomingThisMonthEvents = events.filter((e) => isThisMonth(e.startDate) && e.startDate >= now);
  const overdueEvents = events.filter((e) => isBefore(e.endDate, now) && e.status !== "completed");
  const byCategory = events.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {} as Record<EventCategory, number>);
  const criticalDeadlineEvents = events.filter((e) => e.priority === "high" && e.startDate >= now && differenceInDays(e.startDate, now) <= 7 && e.status !== "completed").sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const formatCountdown = (date: Date) => { const h = differenceInHours(date, now); const d = Math.floor(h / 24); if (d > 0) return `${d}d ${h % 24}h`; return `${h}h`; };
  const getModalEvents = () => { switch (modalOpen) { case "upcoming": return upcomingThisMonthEvents; case "overdue": return overdueEvents; case "category": return selectedCategory ? events.filter(e => e.category === selectedCategory) : []; case "critical": return criticalDeadlineEvents; default: return []; } };
  const getModalTitle = () => { switch (modalOpen) { case "upcoming": return "Upcoming This Month"; case "overdue": return "Overdue Items"; case "category": return selectedCategory ? categoryLabels[selectedCategory] : ""; case "critical": return "Critical Deadlines"; default: return ""; } };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="glass border-border/30 hover:border-primary/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer" onClick={() => setModalOpen("upcoming")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Upcoming This Month</CardTitle><div className="p-2.5 rounded-xl bg-primary/20"><CalendarDays className="h-4 w-4 text-primary" /></div></CardHeader>
          <CardContent><div className="text-3xl font-bold text-foreground">{upcomingThisMonthEvents.length}</div><p className="text-xs text-muted-foreground mt-1">events scheduled</p></CardContent>
        </Card>
        <Card className={cn("glass border-border/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer", overdueEvents.length > 0 && "border-status-overdue/50")} onClick={() => setModalOpen("overdue")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Overdue Items</CardTitle><div className={cn("p-2.5 rounded-xl", overdueEvents.length > 0 ? "bg-status-overdue/20" : "bg-muted")}><AlertTriangle className={cn("h-4 w-4", overdueEvents.length > 0 ? "text-status-overdue" : "text-muted-foreground")} /></div></CardHeader>
          <CardContent><div className={cn("text-3xl font-bold", overdueEvents.length > 0 ? "text-status-overdue" : "text-foreground")}>{overdueEvents.length}</div><p className="text-xs text-muted-foreground mt-1">require attention</p></CardContent>
        </Card>
        <Card className="glass border-border/30 hover:border-category-training/50 transition-all duration-300 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">By Category</CardTitle><div className="p-2.5 rounded-xl bg-category-training/20"><PieChart className="h-4 w-4 text-category-training" /></div></CardHeader>
          <CardContent><div className="grid grid-cols-2 gap-2">{(Object.keys(categoryColors) as EventCategory[]).map((cat) => (<button key={cat} onClick={() => { setSelectedCategory(cat); setModalOpen("category"); }} className="flex items-center gap-2 p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer text-left"><div className={cn("w-2.5 h-2.5 rounded-full", categoryColors[cat])} /><span className="text-xs font-semibold text-foreground">{byCategory[cat] || 0}</span><span className="text-xs text-muted-foreground truncate">{categoryLabels[cat]}</span></button>))}</div></CardContent>
        </Card>
        <Card className="glass border-border/30 hover:border-accent/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer" onClick={() => setModalOpen("critical")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Critical Deadlines</CardTitle><div className="p-2.5 rounded-xl bg-accent/20"><Clock className="h-4 w-4 text-accent" /></div></CardHeader>
          <CardContent>{criticalDeadlineEvents.length > 0 ? <div className="space-y-2">{criticalDeadlineEvents.slice(0, 3).map((e) => (<div key={e.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-secondary/50"><span className="truncate max-w-[100px] font-medium text-foreground">{e.title}</span><span className="text-priority-high font-bold bg-priority-high/20 px-2 py-0.5 rounded-full">{formatCountdown(e.startDate)}</span></div>))}</div> : <p className="text-sm text-muted-foreground">No critical deadlines</p>}</CardContent>
        </Card>
      </div>
      <EventListModal open={modalOpen !== null} onClose={() => { setModalOpen(null); setSelectedCategory(null); }} title={getModalTitle()} events={getModalEvents()} onEventClick={onEventClick} variant={modalOpen === "overdue" ? "overdue" : modalOpen === "critical" ? "critical" : "default"} />
    </>
  );
}
