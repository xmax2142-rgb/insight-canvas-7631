import { LayoutGrid, Calendar, FileText, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps { activeSection: string; onSectionChange: (section: string) => void; }

const navItems = [
  { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "notes", icon: FileText, label: "Notes" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
];

export function MobileNavigation({ activeSection, onSectionChange }: MobileNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/30 lg:hidden">
      <div className="flex items-center justify-around py-2 px-4 safe-area-pb">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button key={item.id} onClick={() => onSectionChange(item.id)} className={cn("flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <div className={cn("p-2 rounded-xl transition-all", isActive && "bg-primary/20")}><item.icon className="h-5 w-5" /></div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
