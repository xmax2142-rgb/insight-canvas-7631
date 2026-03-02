import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronDown, ChevronUp, X, Filter } from "lucide-react";
import { EventCategory, EventStatus, EventPriority, FilterState } from "@/types/calendar";
import { cn } from "@/lib/utils";

interface CalendarSidebarProps { filters: FilterState; onFiltersChange: (filters: FilterState) => void; onClose?: () => void; isMobile?: boolean; }

const categories: { value: EventCategory; label: string; colorClass: string }[] = [{ value: "meetings", label: "Meetings", colorClass: "bg-category-meetings" },{ value: "audits", label: "Audits", colorClass: "bg-category-audits" },{ value: "compliance", label: "Compliance", colorClass: "bg-category-compliance" },{ value: "training", label: "Training", colorClass: "bg-category-training" }];
const statuses: { value: EventStatus; label: string }[] = [{ value: "planned", label: "Planned" },{ value: "confirmed", label: "Confirmed" },{ value: "completed", label: "Completed" },{ value: "postponed", label: "Postponed" }];
const priorities: { value: EventPriority; label: string; colorClass: string }[] = [{ value: "high", label: "High", colorClass: "bg-priority-high" },{ value: "medium", label: "Medium", colorClass: "bg-priority-medium" },{ value: "low", label: "Low", colorClass: "bg-priority-low" }];

export function CalendarSidebar({ filters, onFiltersChange, onClose, isMobile }: CalendarSidebarProps) {
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [statusOpen, setStatusOpen] = useState(true);
  const [priorityOpen, setPriorityOpen] = useState(true);
  const toggleCategory = (c: EventCategory) => { const n = filters.categories.includes(c) ? filters.categories.filter(x => x !== c) : [...filters.categories, c]; onFiltersChange({ ...filters, categories: n }); };
  const toggleStatus = (s: EventStatus) => { const n = filters.statuses.includes(s) ? filters.statuses.filter(x => x !== s) : [...filters.statuses, s]; onFiltersChange({ ...filters, statuses: n }); };
  const togglePriority = (p: EventPriority) => { const n = filters.priorities.includes(p) ? filters.priorities.filter(x => x !== p) : [...filters.priorities, p]; onFiltersChange({ ...filters, priorities: n }); };

  return (
    <div className={cn("flex flex-col h-full", isMobile ? "p-4 bg-card" : "p-5 border-r border-border/30 bg-card/50")}>
      <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-primary/20"><Filter className="h-4 w-4 text-primary" /></div><h2 className="font-bold text-lg text-foreground">Filters</h2></div>{isMobile && onClose && <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl"><X className="h-4 w-4" /></Button>}</div>
      <div className="relative mb-5"><Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search events..." value={filters.searchQuery} onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })} className="pl-10 h-11 rounded-xl border-border/30 bg-secondary/50" /></div>
      <div className="flex-1 overflow-y-auto space-y-4">
        <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}><CollapsibleTrigger className="flex items-center justify-between w-full py-2"><span className="text-sm font-medium">Categories</span>{categoryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</CollapsibleTrigger><CollapsibleContent className="space-y-2 pt-2">{categories.map((c) => <div key={c.value} className="flex items-center space-x-2"><Checkbox id={`cat-${c.value}`} checked={filters.categories.includes(c.value)} onCheckedChange={() => toggleCategory(c.value)} /><div className={cn("w-3 h-3 rounded-full", c.colorClass)} /><Label htmlFor={`cat-${c.value}`} className="text-sm cursor-pointer">{c.label}</Label></div>)}</CollapsibleContent></Collapsible>
        <Separator />
        <Collapsible open={statusOpen} onOpenChange={setStatusOpen}><CollapsibleTrigger className="flex items-center justify-between w-full py-2"><span className="text-sm font-medium">Status</span>{statusOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</CollapsibleTrigger><CollapsibleContent className="space-y-2 pt-2">{statuses.map((s) => <div key={s.value} className="flex items-center space-x-2"><Checkbox id={`st-${s.value}`} checked={filters.statuses.includes(s.value)} onCheckedChange={() => toggleStatus(s.value)} /><Label htmlFor={`st-${s.value}`} className="text-sm cursor-pointer">{s.label}</Label></div>)}</CollapsibleContent></Collapsible>
        <Separator />
        <Collapsible open={priorityOpen} onOpenChange={setPriorityOpen}><CollapsibleTrigger className="flex items-center justify-between w-full py-2"><span className="text-sm font-medium">Priority</span>{priorityOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</CollapsibleTrigger><CollapsibleContent className="space-y-2 pt-2">{priorities.map((p) => <div key={p.value} className="flex items-center space-x-2"><Checkbox id={`pr-${p.value}`} checked={filters.priorities.includes(p.value)} onCheckedChange={() => togglePriority(p.value)} /><div className={cn("w-3 h-3 rounded-full", p.colorClass)} /><Label htmlFor={`pr-${p.value}`} className="text-sm cursor-pointer">{p.label}</Label></div>)}</CollapsibleContent></Collapsible>
      </div>
    </div>
  );
}
