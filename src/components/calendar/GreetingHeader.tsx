import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface GreetingHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function GreetingHeader({ searchQuery, onSearchChange }: GreetingHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Cybersecurity Activity 2026
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for some activities"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64 pl-9 h-10 rounded-full bg-secondary/50 border-border/30 focus:bg-secondary focus:border-primary/50 transition-all"
          />
        </div>
        <NotificationsDropdown />
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
            <Home className="h-4 w-4" /> Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
