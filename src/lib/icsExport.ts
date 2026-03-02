import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";

export function generateICSContent(event: CalendarEvent): string {
  const formatICSDate = (date: Date, allDay: boolean): string => {
    if (allDay) return format(date, "yyyyMMdd");
    return format(date, "yyyyMMdd'T'HHmmss");
  };

  const escapeText = (text: string): string => {
    return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  };

  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CyberGRC//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
    `UID:${event.id}@cybergrc`, `DTSTAMP:${formatICSDate(new Date(), false)}`,
  ];

  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatICSDate(event.startDate, true)}`);
    lines.push(`DTEND;VALUE=DATE:${formatICSDate(event.endDate, true)}`);
  } else {
    lines.push(`DTSTART:${formatICSDate(event.startDate, false)}`);
    lines.push(`DTEND:${formatICSDate(event.endDate, false)}`);
  }

  lines.push(`SUMMARY:${escapeText(event.title)}`);
  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  lines.push(`CATEGORIES:${event.category.toUpperCase()}`);
  lines.push(`STATUS:${event.status.toUpperCase()}`);
  lines.push(`PRIORITY:${event.priority === "high" ? 1 : event.priority === "medium" ? 5 : 9}`);
  if (event.owner) lines.push(`ORGANIZER:${escapeText(event.owner)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

export function downloadICS(event: CalendarEvent): void {
  const content = generateICSContent(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
