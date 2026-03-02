import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Calendar, AlertTriangle, CheckCircle, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "event" | "reminder" | "alert" | "success";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: "1", type: "reminder", title: "Upcoming Event", message: "Security Audit Review starts in 1 hour", timestamp: new Date(Date.now() - 1000 * 60 * 30), read: false },
  { id: "2", type: "alert", title: "Overdue Task", message: "Compliance documentation deadline passed", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false },
  { id: "3", type: "success", title: "Task Completed", message: "Firewall update successfully completed", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), read: true },
  { id: "4", type: "event", title: "New Event Added", message: "Training session scheduled for next week", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true },
];

const typeIcons = { event: Calendar, reminder: Bell, alert: AlertTriangle, success: CheckCircle };
const typeColors = { event: "text-category-meetings", reminder: "text-primary", alert: "text-status-overdue", success: "text-status-completed" };

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative w-10 h-10 rounded-full bg-secondary/50 hover:bg-secondary">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border/30">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type];
                return (
                  <div key={notification.id} className={cn("p-3 hover:bg-secondary/30 transition-colors cursor-pointer relative", !notification.read && "bg-primary/5")} onClick={() => setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))}>
                    <div className="flex gap-3">
                      <div className={cn("shrink-0 mt-0.5", typeColors[notification.type])}><Icon className="h-4 w-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setNotifications(notifications.filter((n) => n.id !== notification.id)); }}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</p>
                      </div>
                    </div>
                    {!notification.read && <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-50" /><p className="text-sm">No notifications</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
