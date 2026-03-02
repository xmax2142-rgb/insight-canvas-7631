import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricsCard } from "@/components/MetricsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { mockRemediationItems, User, RemediationStatus } from "@/lib/mockData";
import { AlertCircle, CheckCircle2, Clock, Search, LogOut, User as UserIcon, Shield, ChevronRight, Home } from "lucide-react";

const RemediationDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RemediationStatus | "all">("all");

  useEffect(() => {
    const userStr = localStorage.getItem('mockUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mockUser');
    navigate('/remediation');
  };

  if (!currentUser) {
    return null;
  }

  const myItems = mockRemediationItems.filter(item => item.assignedTo === currentUser.id);
  
  const totalItems = myItems.length;
  const openItems = myItems.filter(item => item.status === 'open').length;
  const inProgressItems = myItems.filter(item => item.status === 'in_progress').length;
  const closedItems = myItems.filter(item => item.status === 'closed').length;
  const overdueItems = myItems.filter(item => {
    if (item.status === 'closed') return false;
    return new Date(item.dueDate) < new Date();
  }).length;

  const filteredItems = myItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
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
              <p className="text-xs text-muted-foreground">Proponent Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                <Home className="h-4 w-4" /> Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{currentUser.name}</span>
            </div>
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
            <span className="text-foreground">My Remediation Items</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">My Remediation Items</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard title="Total Assigned" value={totalItems} icon={UserIcon} description="Items assigned to you" accentColor="bg-primary" />
          <MetricsCard title="Open" value={openItems} icon={AlertCircle} description="Awaiting your action" accentColor="bg-amber-500" />
          <MetricsCard title="In Progress" value={inProgressItems} icon={Clock} description="Currently working on" accentColor="bg-primary" />
          <MetricsCard title="Completed" value={closedItems} icon={CheckCircle2} description="Successfully closed" accentColor="bg-emerald-500" />
        </div>

        {overdueItems > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium text-sm">
                You have {overdueItems} overdue item{overdueItems > 1 ? 's' : ''} requiring immediate attention
              </p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by title or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10" />
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
            <div className="text-center py-16 text-muted-foreground">
              <div className="space-y-2">
                <CheckCircle2 className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <p className="text-sm">No remediation items found matching your filters.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RemediationDashboard;
