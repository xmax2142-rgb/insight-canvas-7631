import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricsCard } from "@/components/MetricsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { RemediationStatus, RemediationPriority, User } from "@/lib/mockData";
import { useAppStore } from "@/stores/appStore";
import { AlertCircle, CheckCircle2, Clock, Shield, Search, LogOut, FileText, ChevronRight, Home } from "lucide-react";

const RemediationAdmin = () => {
  const mockRemediationItems = useAppStore((s) => s.remediationItems);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RemediationStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<RemediationPriority | "all">("all");

  useEffect(() => {
    const userStr = localStorage.getItem('mockUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    const onAiFilter = (e: Event) => {
      const d = (e as CustomEvent).detail as { status: string; priority: string };
      setStatusFilter((d.status as any) ?? "all");
      setPriorityFilter((d.priority as any) ?? "all");
    };
    window.addEventListener("ai:remediation-filter", onAiFilter);
    return () => window.removeEventListener("ai:remediation-filter", onAiFilter);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mockUser');
    navigate('/remediation');
  };

  const totalItems = mockRemediationItems.length;
  const openItems = mockRemediationItems.filter(item => item.status === 'open').length;
  const inProgressItems = mockRemediationItems.filter(item => item.status === 'in_progress').length;
  const closedItems = mockRemediationItems.filter(item => item.status === 'closed').length;
  const criticalItems = mockRemediationItems.filter(item => item.priority === 'critical' && item.status !== 'closed').length;
  
  const closedItemsWithDates = mockRemediationItems.filter(item => item.closedDate);
  const avgDaysToClose = closedItemsWithDates.length > 0
    ? Math.round(
        closedItemsWithDates.reduce((sum, item) => {
          const created = new Date(item.createdDate);
          const closed = new Date(item.closedDate!);
          return sum + Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / closedItemsWithDates.length
      )
    : 0;

  const filteredItems = mockRemediationItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignedToName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">RAP System</h1>
              <p className="text-xs text-muted-foreground">GRC Analyst Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                <Home className="h-4 w-4" /> Home
              </Button>
            </Link>
            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{currentUser.name}</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Remediation Overview</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Remediation Action Plans</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard title="Total Items" value={totalItems} icon={FileText} description="All remediation items" accentColor="bg-primary" onClick={() => { setStatusFilter("all"); setPriorityFilter("all"); }} />
          <MetricsCard title="Open Items" value={openItems} icon={AlertCircle} description="Awaiting action" accentColor="bg-amber-500" onClick={() => { setStatusFilter("open"); setPriorityFilter("all"); }} />
          <MetricsCard title="In Progress" value={inProgressItems} icon={Clock} description="Currently being worked on" accentColor="bg-primary" onClick={() => { setStatusFilter("in_progress"); setPriorityFilter("all"); }} />
          <MetricsCard title="Critical Open" value={criticalItems} icon={Shield} description="Requiring immediate attention" accentColor="bg-destructive" onClick={() => { setPriorityFilter("critical"); setStatusFilter("all"); }} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MetricsCard title="Completion Rate" value={`${Math.round((closedItems / totalItems) * 100)}%`} icon={CheckCircle2} description={`${closedItems} of ${totalItems} items closed`} accentColor="bg-emerald-500" onClick={() => { setStatusFilter("closed"); setPriorityFilter("all"); }} />
          <MetricsCard title="Avg. Days to Close" value={avgDaysToClose} icon={Clock} description="Average resolution time" accentColor="bg-muted-foreground" onClick={() => { setStatusFilter("closed"); setPriorityFilter("all"); }} />
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by title, ID, or assignee..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10" />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RemediationStatus | "all")}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as RemediationPriority | "all")}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Filter by priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wide">ID</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">Title</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">Priority</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">Assigned To</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">Due Date</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item, index) => {
                const isOverdue = item.status !== 'closed' && new Date(item.dueDate) < new Date();
                return (
                  <TableRow key={item.id} className={index % 2 === 1 ? 'bg-muted/20' : ''}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.category}</div>
                    </TableCell>
                    <TableCell><PriorityBadge priority={item.priority} /></TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold">
                          {item.assignedToName.charAt(0)}
                        </div>
                        <span className="text-sm">{item.assignedToName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className={isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                      {isOverdue && <div className="text-[10px] text-destructive">Overdue</div>}
                    </TableCell>
                    <TableCell>
                      <Link to={`/remediation/item/${item.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                          View <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredItems.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No remediation items found matching your filters.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RemediationAdmin;
