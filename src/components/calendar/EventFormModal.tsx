import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarEvent, EventCategory, EventStatus, EventPriority, RecurrenceType } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const eventSchema = z.object({ title: z.string().min(1, "Title is required"), description: z.string(), category: z.enum(["meetings","audits","compliance","training"]), startDate: z.date(), startTime: z.string(), endDate: z.date(), endTime: z.string(), allDay: z.boolean(), status: z.enum(["planned","confirmed","completed","postponed"]), priority: z.enum(["high","medium","low"]), owner: z.string(), department: z.string(), isConfidential: z.boolean(), recurrence: z.enum(["none","daily","weekly","monthly","yearly"]) });
type EventFormData = z.infer<typeof eventSchema>;

interface EventFormModalProps { open: boolean; onClose: () => void; onSave: (event: Omit<CalendarEvent, "id"|"attendees"|"checklist"|"attachments"|"notes"|"reminders">) => void; event?: CalendarEvent; defaultDate?: Date; }

export function EventFormModal({ open, onClose, onSave, event, defaultDate }: EventFormModalProps) {
  const isMobile = useIsMobile();
  const form = useForm<EventFormData>({ resolver: zodResolver(eventSchema), defaultValues: { title: "", description: "", category: "meetings", startDate: defaultDate || new Date(), startTime: "09:00", endDate: defaultDate || new Date(), endTime: "10:00", allDay: false, status: "planned", priority: "medium", owner: "", department: "", isConfidential: false, recurrence: "none" } });

  useEffect(() => {
    if (event) { form.reset({ title: event.title, description: event.description, category: event.category, startDate: event.startDate, startTime: format(event.startDate, "HH:mm"), endDate: event.endDate, endTime: format(event.endDate, "HH:mm"), allDay: event.allDay, status: event.status, priority: event.priority, owner: event.owner, department: event.department, isConfidential: event.isConfidential, recurrence: event.recurrence }); }
    else if (defaultDate) { form.setValue("startDate", defaultDate); form.setValue("endDate", defaultDate); }
  }, [event, defaultDate, form]);

  const onSubmit = (data: EventFormData) => {
    const [sh, sm] = data.startTime.split(":").map(Number);
    const [eh, em] = data.endTime.split(":").map(Number);
    onSave({ title: data.title, description: data.description, category: data.category, startDate: data.allDay ? data.startDate : setMinutes(setHours(data.startDate, sh), sm), endDate: data.allDay ? data.endDate : setMinutes(setHours(data.endDate, eh), em), allDay: data.allDay, status: data.status, priority: data.priority, owner: data.owner, department: data.department, isConfidential: data.isConfidential, recurrence: data.recurrence });
    form.reset(); onClose();
  };
  const allDay = form.watch("allDay");

  const FormContent = (
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Event title" {...field} /></FormControl><FormMessage /></FormItem>} />
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="category" render={({ field }) => <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="meetings">Meeting</SelectItem><SelectItem value="audits">Audit</SelectItem><SelectItem value="compliance">Compliance</SelectItem><SelectItem value="training">Training</SelectItem></SelectContent></Select></FormItem>} />
        <FormField control={form.control} name="priority" render={({ field }) => <FormItem><FormLabel>Priority</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select></FormItem>} />
      </div>
      <FormField control={form.control} name="allDay" render={({ field }) => <FormItem className="flex items-center gap-3"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">All day event</FormLabel></FormItem>} />
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="startDate" render={({ field }) => <FormItem><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{format(field.value, "PPP")}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={(d) => d && field.onChange(d)} initialFocus className="p-3 pointer-events-auto" /></PopoverContent></Popover></FormItem>} />
        {!allDay && <FormField control={form.control} name="startTime" render={({ field }) => <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>} />}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="endDate" render={({ field }) => <FormItem><FormLabel>End Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{format(field.value, "PPP")}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={(d) => d && field.onChange(d)} initialFocus className="p-3 pointer-events-auto" /></PopoverContent></Popover></FormItem>} />
        {!allDay && <FormField control={form.control} name="endTime" render={({ field }) => <FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>} />}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="status" render={({ field }) => <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="planned">Planned</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="postponed">Postponed</SelectItem></SelectContent></Select></FormItem>} />
        <FormField control={form.control} name="recurrence" render={({ field }) => <FormItem><FormLabel>Recurrence</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></FormItem>} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="owner" render={({ field }) => <FormItem><FormLabel>Owner</FormLabel><FormControl><Input placeholder="Event owner" {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="department" render={({ field }) => <FormItem><FormLabel>Department</FormLabel><FormControl><Input placeholder="Department" {...field} /></FormControl></FormItem>} />
      </div>
      <FormField control={form.control} name="description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Event description" rows={3} {...field} /></FormControl></FormItem>} />
      <FormField control={form.control} name="isConfidential" render={({ field }) => <FormItem className="flex items-center gap-3"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">Confidential</FormLabel></FormItem>} />
      <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">{event ? "Save Changes" : "Create Event"}</Button></div>
    </form></Form>
  );

  if (isMobile) return <Drawer open={open} onOpenChange={(o) => !o && onClose()}><DrawerContent><DrawerHeader><DrawerTitle>{event ? "Edit Event" : "New Event"}</DrawerTitle></DrawerHeader><div className="px-4 pb-4 max-h-[70vh] overflow-y-auto">{FormContent}</div></DrawerContent></Drawer>;
  return <Dialog open={open} onOpenChange={(o) => !o && onClose()}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{event ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>{FormContent}</DialogContent></Dialog>;
}
