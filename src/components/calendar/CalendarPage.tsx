import { useState, useMemo, useRef, useCallback } from "react";
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, addYears, subYears, startOfToday, differenceInDays } from "date-fns";
import { CalendarEvent, CalendarViewType, FilterState, EventCategory, EventStatus, EventPriority } from "@/types/calendar";
import { mockEvents } from "@/data/mockEvents";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarSidebar } from "./CalendarSidebar";
import { IconSidebar } from "./IconSidebar";
import { GreetingHeader } from "./GreetingHeader";
import { ScheduledPanel } from "./ScheduledPanel";
import { EventDetailPanel } from "./EventDetailPanel";
import { EventFormModal } from "./EventFormModal";
import { DashboardView } from "./DashboardView";
import { NotesView } from "./NotesView";
import { TasksView } from "./TasksView";
import { MobileNavigation } from "./MobileNavigation";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

const allCategories: EventCategory[] = ["meetings", "audits", "compliance", "training"];
const allStatuses: EventStatus[] = ["planned", "confirmed", "completed", "postponed"];
const allPriorities: EventPriority[] = ["high", "medium", "low"];
const defaultFilters: FilterState = { categories: allCategories, statuses: allStatuses, priorities: allPriorities, searchQuery: "" };

export function CalendarPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [viewType, setViewType] = useState<CalendarViewType>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [floatingPos, setFloatingPos] = useState<{ top: number; left: number } | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [defaultFormDate, setDefaultFormDate] = useState<Date | undefined>();
  const [activeSection, setActiveSection] = useState("calendar");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [scheduledPanelOpen, setScheduledPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const hasActiveFilters = filters.categories.length !== allCategories.length || filters.statuses.length !== allStatuses.length || filters.priorities.length !== allPriorities.length || filters.searchQuery !== "";
  const handleClearFilters = () => setFilters(defaultFilters);
  const lastClickPos = useRef<{ x: number; y: number } | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (!filters.categories.includes(event.category)) return false;
      if (!filters.statuses.includes(event.status)) return false;
      if (!filters.priorities.includes(event.priority)) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!event.title.toLowerCase().includes(query) && !event.description.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [events, filters]);

  const handlePrevious = () => {
    switch (viewType) {
      case "year": setCurrentDate(subYears(currentDate, 1)); break;
      case "month": setCurrentDate(subMonths(currentDate, 1)); break;
      case "week": setCurrentDate(subWeeks(currentDate, 1)); break;
      case "day": setCurrentDate(subDays(currentDate, 1)); break;
      case "agenda": setCurrentDate(subMonths(currentDate, 1)); break;
    }
  };
  const handleNext = () => {
    switch (viewType) {
      case "year": setCurrentDate(addYears(currentDate, 1)); break;
      case "month": setCurrentDate(addMonths(currentDate, 1)); break;
      case "week": setCurrentDate(addWeeks(currentDate, 1)); break;
      case "day": setCurrentDate(addDays(currentDate, 1)); break;
      case "agenda": setCurrentDate(addMonths(currentDate, 1)); break;
    }
  };
  const handleToday = () => { setCurrentDate(startOfToday()); setSelectedDate(startOfToday()); };

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(event.startDate);
    if (isMobile) { setDetailsOpen(true); } else {
      if (lastClickPos.current) {
        const vW = window.innerWidth, vH = window.innerHeight, pW = 380, pH = Math.min(vH * 0.7, 500);
        let top = lastClickPos.current.y, left = lastClickPos.current.x + 16;
        if (top + pH > vH) top = Math.max(10, vH - pH - 10);
        if (left + pW > vW) left = left - pW - 32;
        if (left < 0) left = 10;
        setFloatingPos({ top, left });
      } else { setFloatingPos({ top: 100, left: 100 }); }
    }
  }, [isMobile]);

  const handleMainClick = useCallback((e: React.MouseEvent) => { lastClickPos.current = { x: e.clientX, y: e.clientY }; }, []);
  const handleDayClick = (date: Date) => { setSelectedDate(date); setScheduledPanelOpen(true); if (viewType === "year") { setCurrentDate(date); setViewType("month"); } };
  const handleAddEvent = () => { setEditingEvent(undefined); setDefaultFormDate(currentDate); setFormOpen(true); };
  const handleEditEvent = () => { if (selectedEvent) { setEditingEvent(selectedEvent); setFormOpen(true); } };
  const handleDuplicateEvent = () => { if (selectedEvent) { setEvents([...events, { ...selectedEvent, id: `${Date.now()}`, title: `${selectedEvent.title} (Copy)` }]); toast({ title: "Event duplicated" }); } };
  const handleDeleteEvent = () => { if (selectedEvent) { setEvents(events.filter((e) => e.id !== selectedEvent.id)); setSelectedEvent(null); setDetailsOpen(false); toast({ title: "Event deleted" }); } };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, "id" | "attendees" | "checklist" | "attachments" | "notes" | "reminders">) => {
    if (editingEvent) {
      setEvents(events.map((e) => e.id === editingEvent.id ? { ...e, ...eventData } : e));
      setSelectedEvent({ ...editingEvent, ...eventData });
      toast({ title: "Event updated" });
    } else {
      setEvents([...events, { ...eventData, id: `${Date.now()}`, attendees: [], checklist: [], attachments: [], notes: "", reminders: [60] }]);
      toast({ title: "Event created" });
    }
  };

  const handleEventMove = (eventId: string, newDate: Date) => {
    setEvents(events.map((event) => {
      if (event.id !== eventId) return event;
      const duration = differenceInDays(event.endDate, event.startDate);
      const newStart = new Date(newDate); newStart.setHours(event.startDate.getHours(), event.startDate.getMinutes());
      const newEnd = addDays(newStart, duration); newEnd.setHours(event.endDate.getHours(), event.endDate.getMinutes());
      return { ...event, startDate: newStart, endDate: newEnd };
    }));
    toast({ title: "Event moved" });
  };

  const handleCloseDetails = () => { setSelectedEvent(null); setDetailsOpen(false); setFloatingPos(null); };

  return (
    <div className="flex h-screen gradient-bg">
      <aside className="hidden lg:block shrink-0"><IconSidebar activeSection={activeSection} onSectionChange={setActiveSection} /></aside>
      <main ref={mainRef} onClick={handleMainClick} className="flex-1 flex flex-col min-w-0 overflow-hidden pb-20 lg:pb-0 relative">
        {activeSection === "dashboard" ? <DashboardView events={filteredEvents} onEventClick={handleEventClick} onViewCalendar={() => setActiveSection("calendar")} onFilterAndView={(partialFilters) => { setFilters({ ...defaultFilters, ...partialFilters, searchQuery: "" }); setActiveSection("calendar"); }} />
        : activeSection === "notes" ? <NotesView />
        : activeSection === "tasks" ? <TasksView />
        : (
          <div className="p-4 lg:p-6 flex-1 flex flex-col overflow-hidden">
            <GreetingHeader searchQuery={filters.searchQuery} onSearchChange={(query) => setFilters({ ...filters, searchQuery: query })} />
            <CalendarHeader currentDate={currentDate} viewType={viewType} onDateChange={setCurrentDate} onViewChange={setViewType} onToday={handleToday} onPrevious={handlePrevious} onNext={handleNext} onAddEvent={handleAddEvent} onToggleFilters={() => setFiltersOpen(true)} />
            <div className="flex-1 min-h-0"><CalendarGrid currentDate={currentDate} viewType={viewType} events={filteredEvents} onEventClick={handleEventClick} onDayClick={handleDayClick} onEventMove={handleEventMove} /></div>
          </div>
        )}
      </main>
      {activeSection === "calendar" && scheduledPanelOpen && !selectedEvent && (
        <aside className="hidden md:block w-80 lg:w-96 shrink-0 animate-slide-in-right">
          <ScheduledPanel events={filteredEvents} selectedDate={selectedDate} onEventClick={handleEventClick} onDateChange={setSelectedDate} onClose={() => setScheduledPanelOpen(false)} />
        </aside>
      )}
      {selectedEvent && !isMobile && floatingPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleCloseDetails} />
          <div className="fixed z-50 w-[380px] max-h-[70vh] rounded-2xl border border-border/30 bg-card shadow-2xl overflow-hidden animate-scale-in" style={{ top: floatingPos.top, left: floatingPos.left }}
            onMouseDown={(e) => { const rect = e.currentTarget.getBoundingClientRect(); if (e.clientY - rect.top > 60) return; e.preventDefault(); const sX = e.clientX, sY = e.clientY, sT = floatingPos.top, sL = floatingPos.left; const onMove = (ev: MouseEvent) => setFloatingPos({ top: sT + (ev.clientY - sY), left: sL + (ev.clientX - sX) }); const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); }; window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp); }}>
            <EventDetailPanel event={selectedEvent} onClose={handleCloseDetails} onEdit={handleEditEvent} onDuplicate={handleDuplicateEvent} onDelete={handleDeleteEvent} />
          </div>
        </>
      )}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}><SheetContent side="left" className="p-0 w-80"><CalendarSidebar filters={filters} onFiltersChange={setFilters} onClose={() => setFiltersOpen(false)} isMobile /></SheetContent></Sheet>
      <Drawer open={detailsOpen && isMobile} onOpenChange={setDetailsOpen}><DrawerContent className="max-h-[85vh]">{selectedEvent && <EventDetailPanel event={selectedEvent} onClose={handleCloseDetails} onEdit={handleEditEvent} onDuplicate={handleDuplicateEvent} onDelete={handleDeleteEvent} isMobile />}</DrawerContent></Drawer>
      <EventFormModal open={formOpen} onClose={() => { setFormOpen(false); setEditingEvent(undefined); }} onSave={handleSaveEvent} event={editingEvent} defaultDate={defaultFormDate} />
      <MobileNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}
