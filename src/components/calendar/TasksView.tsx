import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Trash2, CheckSquare, Calendar, Flame } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type TaskPriority = "high" | "medium" | "low";
interface Task { id: string; title: string; completed: boolean; priority: TaskPriority; dueDate: Date | null; createdAt: Date; }

const mockTasks: Task[] = [
  { id: "1", title: "Review security audit report", completed: false, priority: "high", dueDate: new Date(2026, 0, 20), createdAt: new Date(2026, 0, 10) },
  { id: "2", title: "Update firewall rules", completed: true, priority: "high", dueDate: new Date(2026, 0, 15), createdAt: new Date(2026, 0, 5) },
  { id: "3", title: "Schedule compliance training", completed: false, priority: "medium", dueDate: new Date(2026, 1, 1), createdAt: new Date(2026, 0, 12) },
];

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  high: { label: "High", className: "bg-priority-high/20 text-priority-high border-priority-high/30" },
  medium: { label: "Medium", className: "bg-priority-medium/20 text-priority-medium border-priority-medium/30" },
  low: { label: "Low", className: "bg-priority-low/20 text-priority-low border-priority-low/30" },
};

export function TasksView() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [filter, setFilter] = useState<"all"|"pending"|"completed">("all");
  const filteredTasks = tasks.filter(t => { if (filter === "pending") return !t.completed; if (filter === "completed") return t.completed; return true; }).filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-foreground">Tasks</h1><p className="text-muted-foreground text-sm">{pendingCount} pending, {completedCount} completed</p></div>
        <div className="flex items-center gap-2 w-full sm:w-auto"><div className="relative flex-1 sm:w-64"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 rounded-xl bg-secondary/50 border-border/30" /></div></div>
      </div>
      <div className="flex gap-2 mb-6"><Input placeholder="Add a new task..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && newTaskTitle.trim() && (setTasks([{ id: Date.now().toString(), title: newTaskTitle, completed: false, priority: "medium", dueDate: null, createdAt: new Date() }, ...tasks]), setNewTaskTitle(""), toast({ title: "Task added" }))} className="h-11 rounded-xl" /><Button onClick={() => { if (!newTaskTitle.trim()) return; setTasks([{ id: Date.now().toString(), title: newTaskTitle, completed: false, priority: "medium", dueDate: null, createdAt: new Date() }, ...tasks]); setNewTaskTitle(""); toast({ title: "Task added" }); }} className="h-11 px-4 rounded-xl gap-2"><Plus className="h-4 w-4" />Add</Button></div>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-fit mb-4 rounded-xl bg-secondary/50"><TabsTrigger value="all" className="rounded-lg">All ({tasks.length})</TabsTrigger><TabsTrigger value="pending" className="rounded-lg">Pending ({pendingCount})</TabsTrigger><TabsTrigger value="completed" className="rounded-lg">Completed ({completedCount})</TabsTrigger></TabsList>
        <TabsContent value={filter} className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full"><div className="space-y-2 pr-2">{filteredTasks.map(task => { const due = task.dueDate ? (isToday(task.dueDate) ? "today" : isPast(task.dueDate) ? "overdue" : "upcoming") : null; return (
            <Card key={task.id} className={cn("transition-all hover:bg-secondary/30", task.completed && "opacity-60")}><CardContent className="p-3 flex items-center gap-3"><Checkbox checked={task.completed} onCheckedChange={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))} className="h-5 w-5" /><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.title}</span>{task.priority === "high" && !task.completed && <Flame className="h-4 w-4 text-priority-high shrink-0" />}</div>{task.dueDate && <div className={cn("flex items-center gap-1 text-xs mt-1", due === "overdue" && !task.completed ? "text-status-overdue" : "text-muted-foreground")}><Calendar className="h-3 w-3" />{due === "today" ? "Due today" : due === "overdue" && !task.completed ? `Overdue: ${format(task.dueDate, "MMM d")}` : format(task.dueDate, "MMM d, yyyy")}</div>}</div><Badge variant="outline" className={cn("cursor-pointer transition-colors shrink-0", priorityConfig[task.priority].className)} onClick={() => setTasks(tasks.map(t => { if (t.id !== task.id) return t; const ps: TaskPriority[] = ["low","medium","high"]; return { ...t, priority: ps[(ps.indexOf(t.priority)+1)%3] }; }))}>{priorityConfig[task.priority].label}</Badge><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => { setTasks(tasks.filter(t => t.id !== task.id)); toast({ title: "Task deleted" }); }}><Trash2 className="h-4 w-4" /></Button></CardContent></Card>
          ); })}{filteredTasks.length === 0 && <div className="text-center py-12 text-muted-foreground"><CheckSquare className="h-16 w-16 mx-auto mb-4 opacity-50" /><p className="text-lg font-medium">No tasks found</p></div>}</div></ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
