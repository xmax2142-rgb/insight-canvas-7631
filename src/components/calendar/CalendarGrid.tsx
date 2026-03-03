import { useMemo } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, format, startOfDay,
  startOfYear, eachMonthOfInterval, endOfYear,
  addDays, isBefore, isAfter,
} from "date-fns";
import { CalendarEvent, CalendarViewType } from "@/types/calendar";
import { DraggableEventCard } from "./DraggableEventCard";
import { DroppableDay } from "./DroppableDay";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CalendarGridProps {
  currentDate: Date;
  viewType: CalendarViewType;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
  onEventMove: (eventId: string, newDate: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({ currentDate, viewType, events, onEventClick, onDayClick, onEventMove }: CalendarGridProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const eventId = active.id as string;
    const newDate = new Date(over.id as string);
    onEventMove(eventId, newDate);
  };

  if (viewType === "year") return <YearView currentDate={currentDate} events={events} onDayClick={onDayClick} />;
  if (viewType === "agenda") return <AgendaView currentDate={currentDate} events={events} onEventClick={onEventClick} />;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {viewType === "month" && <MonthView currentDate={currentDate} events={events} onEventClick={onEventClick} onDayClick={onDayClick} />}
      {viewType === "week" && <WeekView currentDate={currentDate} events={events} onEventClick={onEventClick} onDayClick={onDayClick} />}
      {viewType === "day" && <DayView currentDate={currentDate} events={events} onEventClick={onEventClick} />}
    </DndContext>
  );
}

/* ── Month View ── */
function MonthView({ currentDate, events, onEventClick, onDayClick }: Omit<CalendarGridProps, "viewType" | "onEventMove">) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
      const key = format(startOfDay(ev.startDate), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) || []), ev]);
    });
    return map;
  }, [events]);

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-px bg-border/20 rounded-xl overflow-hidden">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) || [];
          const inMonth = isSameMonth(day, currentDate);
          return (
            <DroppableDay key={key} date={day} onClick={() => onDayClick(day)}
              className={cn(
                "bg-card p-1.5 min-h-[80px] cursor-pointer transition-colors hover:bg-secondary/30",
                !inMonth && "opacity-40"
              )}>
              <div className={cn(
                "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                isToday(day) && "bg-primary text-primary-foreground",
              )}>
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <DraggableEventCard key={ev.id} event={ev} onClick={() => onEventClick(ev)} compact />
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground font-medium px-1">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </DroppableDay>
          );
        })}
      </div>
    </div>
  );
}

/* ── Week View ── */
function WeekView({ currentDate, events, onEventClick, onDayClick }: Omit<CalendarGridProps, "viewType" | "onEventMove">) {
  const days = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const getEventsForDay = (day: Date) =>
    events.filter((ev) => isSameDay(startOfDay(ev.startDate), startOfDay(day)));

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-7 gap-px bg-border/20 rounded-xl overflow-hidden min-h-[500px]">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          return (
            <DroppableDay key={day.toISOString()} date={day} onClick={() => onDayClick(day)}
              className="bg-card p-2 cursor-pointer hover:bg-secondary/30 transition-colors">
              <div className={cn(
                "text-sm font-semibold mb-1 text-center pb-2 border-b border-border/30",
                isToday(day) && "text-primary",
              )}>
                <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                <div className={cn(
                  "w-8 h-8 mx-auto flex items-center justify-center rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground",
                )}>{format(day, "d")}</div>
              </div>
              <div className="space-y-1 mt-2">
                {dayEvents.map((ev) => (
                  <DraggableEventCard key={ev.id} event={ev} onClick={() => onEventClick(ev)} compact />
                ))}
              </div>
            </DroppableDay>
          );
        })}
      </div>
    </ScrollArea>
  );
}

/* ── Day View ── */
function DayView({ currentDate, events, onEventClick }: { currentDate: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
  const dayEvents = events.filter((ev) => isSameDay(startOfDay(ev.startDate), startOfDay(currentDate)));

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className={cn("text-lg font-semibold mb-4", isToday(currentDate) && "text-primary")}>
          {format(currentDate, "EEEE, MMMM d, yyyy")}
          {isToday(currentDate) && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Today</span>}
        </div>
        {dayEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">No events scheduled</div>
        ) : (
          <div className="space-y-2">
            {dayEvents.map((ev) => (
              <DraggableEventCard key={ev.id} event={ev} onClick={() => onEventClick(ev)} />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

/* ── Year View ── */
function YearView({ currentDate, events, onDayClick }: { currentDate: Date; events: CalendarEvent[]; onDayClick: (d: Date) => void }) {
  const months = useMemo(() => eachMonthOfInterval({ start: startOfYear(currentDate), end: endOfYear(currentDate) }), [currentDate]);

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => set.add(format(startOfDay(ev.startDate), "yyyy-MM-dd")));
    return set;
  }, [events]);

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {months.map((month) => {
          const monthDays = eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) });
          return (
            <div key={month.toISOString()} className="bg-card rounded-xl p-3 border border-border/20">
              <div className="text-sm font-semibold mb-2 text-center">{format(month, "MMMM")}</div>
              <div className="grid grid-cols-7 gap-px">
                {WEEKDAYS.map((d) => <div key={d} className="text-[9px] text-muted-foreground text-center">{d[0]}</div>)}
                {monthDays.map((day) => {
                  const hasEvent = eventDates.has(format(day, "yyyy-MM-dd"));
                  const inMonth = isSameMonth(day, month);
                  return (
                    <button key={day.toISOString()} onClick={() => onDayClick(day)}
                      className={cn(
                        "text-[10px] w-full aspect-square flex items-center justify-center rounded-sm transition-colors",
                        !inMonth && "opacity-20",
                        isToday(day) && "bg-primary text-primary-foreground font-bold",
                        hasEvent && inMonth && !isToday(day) && "bg-primary/20 font-semibold",
                        inMonth && "hover:bg-secondary/50",
                      )}>
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

/* ── Agenda View ── */
function AgendaView({ currentDate, events, onEventClick }: { currentDate: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const filtered = events
    .filter((ev) => !isBefore(ev.startDate, monthStart) && !isAfter(ev.startDate, monthEnd))
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filtered.forEach((ev) => {
      const key = format(ev.startDate, "yyyy-MM-dd");
      map.set(key, [...(map.get(key) || []), ev]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {grouped.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">No events this month</div>
        ) : (
          grouped.map(([dateKey, dayEvents]) => (
            <div key={dateKey}>
              <div className={cn("text-sm font-semibold mb-2 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10", isToday(new Date(dateKey)) && "text-primary")}>
                {format(new Date(dateKey), "EEEE, MMMM d")}
                {isToday(new Date(dateKey)) && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Today</span>}
              </div>
              <div className="space-y-2 pl-4 border-l-2 border-border/30">
                {dayEvents.map((ev) => (
                  <button key={ev.id} onClick={() => onEventClick(ev)} className="w-full text-left">
                    <DraggableEventCard event={ev} onClick={() => onEventClick(ev)} />
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
