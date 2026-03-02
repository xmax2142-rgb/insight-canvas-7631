import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, LogOut, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileDropdownProps {
  onOpenSettings: () => void;
}

export function ProfileDropdown({ onOpenSettings }: ProfileDropdownProps) {
  const { toast } = useToast();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="w-10 h-10 ring-2 ring-border/30 cursor-pointer hover:ring-primary/50 transition-all">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">SG</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">GRC Analyst</p>
            <p className="text-xs text-muted-foreground">analyst@cybergrc.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer"><User className="mr-2 h-4 w-4" /><span>Profile</span></DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenSettings} className="cursor-pointer"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Help Center", description: "Help documentation coming soon." })} className="cursor-pointer"><HelpCircle className="mr-2 h-4 w-4" /><span>Help</span></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast({ title: "Signed out", description: "You have been signed out." })} className="cursor-pointer text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" /><span>Sign out</span></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
