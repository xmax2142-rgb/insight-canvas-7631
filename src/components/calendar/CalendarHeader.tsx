import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Filter, X } from "lucide-react";
import { format, setMonth, setYear } from "date-fns";
import { CalendarViewType } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarHeaderProps { currentDate: Date; viewType: CalendarViewType; onDateChange: (date: Date) => void; onViewChange: (view: CalendarViewType) => void; onToday: () => void; onPrevious: () => void; onNext: () => void; onAddEvent: () => void; onToggleFilters?: () => void; hasActiveFilters?: boolean; onClearFilters?: () => void; }

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const years = Array.from({ length: 10 }, (_, i) => 2024 + i);
const viewOptions: { value: CalendarViewType; label: string }[] = [{ value: "year", label: "Year" },{ value: "month", label: "Month" },{ value: "week", label: "Week" },{ value: "day", label: "Day" },{ value: "agenda", label: "Agenda" }];

export function CalendarHeader({ currentDate, viewType, onDateChange, onViewChange, onToday, onPrevious, onNext, onAddEvent, onToggleFilters, hasActiveFilters, onClearFilters }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        {onToggleFilters && <Button variant="ghost" size="icon" onClick={onToggleFilters} className={cn("h-10 w-10 rounded-xl border border-border/30 hover:bg-secondary/50", hasActiveFilters && "border-primary/50 bg-primary/10")}><Filter className="h-4 w-4" /></Button>}
        {hasActiveFilters && onClearFilters && <Button variant="outline" size="sm" onClick={onClearFilters} className="gap-1.5 rounded-xl text-xs border-primary/30 text-primary hover:bg-primary/10"><X className="h-3 w-3" />Clear Filters</Button>}
        <Popover><PopoverTrigger asChild><Button variant="ghost" className="gap-1 text-xl font-semibold hover:bg-transparent hover:text-primary px-2">{format(currentDate, "MMMM")}<ChevronDown className="h-4 w-4 text-muted-foreground" /></Button></PopoverTrigger><PopoverContent className="w-48 p-2 bg-card border-border/30" align="start"><div className="grid grid-cols-2 gap-1">{months.map((m) => <Button key={m} variant={format(currentDate, "MMMM") === m ? "default" : "ghost"} size="sm" className="justify-start text-sm" onClick={() => onDateChange(setMonth(currentDate, months.indexOf(m)))}>{m.slice(0,3)}</Button>)}</div></PopoverContent></Popover>
        <Popover><PopoverTrigger asChild><Button variant="ghost" className="gap-1 text-xl font-semibold hover:bg-transparent hover:text-primary px-2">{format(currentDate, "yyyy")}<ChevronDown className="h-4 w-4 text-muted-foreground" /></Button></PopoverTrigger><PopoverContent className="w-32 p-2 bg-card border-border/30" align="start"><div className="space-y-1 max-h-48 overflow-y-auto">{years.map((y) => <Button key={y} variant={currentDate.getFullYear() === y ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => onDateChange(setYear(currentDate, y))}>{y}</Button>)}</div></PopoverContent></Popover>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 bg-secondary/30 p-1.5 rounded-xl">{viewOptions.map((o) => <Button key={o.value} variant={viewType === o.value ? "default" : "ghost"} size="default" onClick={() => onViewChange(o.value)} className={cn("text-sm rounded-lg px-5 py-2 font-medium", viewType === o.value && "bg-primary text-primary-foreground shadow-sm")}>{o.label}</Button>)}</div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 border border-border/30 rounded-xl p-1"><Button variant="ghost" size="icon" onClick={onPrevious} className="h-8 w-8 rounded-lg hover:bg-secondary/50"><ChevronLeft className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={onNext} className="h-8 w-8 rounded-lg hover:bg-secondary/50"><ChevronRight className="h-4 w-4" /></Button></div>
        <Button onClick={onAddEvent} size="sm" className="gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Add Event</span></Button>
      </div>
    </div>
  );
}
