import { cn } from "@/lib/utils";
import { LayoutGrid, Calendar, FileText, CheckSquare, Settings, Moon, Sun, Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { SettingsPanel } from "./SettingsPanel";
import { ProfileDropdown } from "./ProfileDropdown";
import { Link } from "react-router-dom";

interface IconSidebarProps { activeSection?: string; onSectionChange?: (section: string) => void; }

const topNavItems = [
  { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "notes", icon: FileText, label: "Notes" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
];

export function IconSidebar({ activeSection = "calendar", onSectionChange }: IconSidebarProps) {
  const { toast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => typeof window !== "undefined" ? document.documentElement.classList.contains("dark") : true);

  useEffect(() => { if (isDark) document.documentElement.classList.add("dark"); else document.documentElement.classList.remove("dark"); }, [isDark]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col h-full w-16 bg-card/30 border-r border-border/20 py-4 items-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center"><Shield className="h-5 w-5 text-primary-foreground" /></div>
        </div>
        <nav className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3 bg-secondary/40 rounded-2xl p-2">
            {topNavItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onSectionChange?.(item.id)} className={cn("w-11 h-11 rounded-full transition-all duration-200", isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50")}>
                      <item.icon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-card border-border/50">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </nav>
        <div className="flex flex-col items-center gap-2 px-2 mt-auto">
          <Tooltip><TooltipTrigger asChild><Link to="/"><Button variant="ghost" size="icon" className="w-11 h-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50"><Home className="h-5 w-5" /></Button></Link></TooltipTrigger><TooltipContent side="right" className="bg-card border-border/50">Home</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} className="w-11 h-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50"><Settings className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent side="right" className="bg-card border-border/50">Settings</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => { setIsDark(!isDark); toast({ title: isDark ? "Light Mode" : "Dark Mode" }); }} className="w-11 h-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50">{isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button></TooltipTrigger><TooltipContent side="right" className="bg-card border-border/50">{isDark ? "Light Mode" : "Dark Mode"}</TooltipContent></Tooltip>
          <div className="mt-2"><ProfileDropdown onOpenSettings={() => setSettingsOpen(true)} /></div>
        </div>
      </div>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </TooltipProvider>
  );
}
