import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { mockRemediationItems, User, RemediationStatus } from "@/lib/mockData";
import { ArrowLeft, Calendar, FileText, MessageSquare, Upload, User as UserIcon, Clock, AlertCircle, Shield, ChevronRight, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RemediationItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<RemediationStatus>("open");

  const item = mockRemediationItems.find(i => i.id === id);

  useEffect(() => {
    const userStr = localStorage.getItem('mockUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (item) {
      setSelectedStatus(item.status);
    }
  }, [item]);

  if (!item || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Item not found</p>
          <Link to={currentUser?.role === 'admin' ? '/remediation/admin' : '/remediation/dashboard'}>
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const isAssignedToUser = item.assignedTo === currentUser.id;
  const canEdit = isAdmin || isAssignedToUser;

  const handleBack = () => {
    navigate(isAdmin ? '/remediation/admin' : '/remediation/dashboard');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    toast({ title: "Comment added", description: "Your comment has been saved (mock data)" });
    setNewComment("");
  };

  const handleStatusChange = (status: RemediationStatus) => {
    setSelectedStatus(status);
    toast({ title: "Status updated", description: `Status changed to ${status} (mock data)` });
  };

  const handleFileUpload = () => {
    toast({ title: "File upload", description: "File upload requires backend integration" });
  };

  const daysUntilDue = Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0 && item.status !== 'closed';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
              <p className="text-xs text-muted-foreground">Item Detail</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                <Home className="h-4 w-4" /> Home
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Dashboard</span>
              <ChevronRight className="h-3 w-3" />
              <span>Remediation Items</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{item.id}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">{item.id}</Badge>
                  <Badge variant="outline" className="font-mono text-xs">{item.findingId}</Badge>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <PriorityBadge priority={item.priority} />
                <StatusBadge status={selectedStatus} />
              </div>
            </div>

            {isOverdue && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium text-sm">This item is overdue by {Math.abs(daysUntilDue)} days</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span>{item.assignedToName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Created: {new Date(item.createdDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{item.category}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Affected Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.affectedSystems.map((system) => (
                      <Badge key={system} variant="secondary" className="font-normal">
                        {system}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Comments</span>
                    <Badge variant="secondary" className="text-xs">{item.comments.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.comments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                  )}
                  {item.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                        comment.authorRole === 'admin' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {getInitials(comment.author)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.author}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {comment.authorRole === 'admin' ? 'GRC Analyst' : 'Proponent'}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {canEdit && (
                    <div className="space-y-3 pt-4 border-t">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm">
                        Add Comment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {canEdit && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Update Status</CardTitle>
                    <CardDescription className="text-xs">Change the remediation status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select value={selectedStatus} onValueChange={handleStatusChange}>
                      <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                        {isAdmin && <SelectItem value="closed">Closed</SelectItem>}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? 'As an admin, you can close items after review' : 'Submit for review when complete'}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Attachments</span>
                    <Badge variant="secondary" className="text-xs">{item.attachments.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {item.attachments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No attachments</p>
                  )}
                  {item.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-start gap-2 text-sm p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-all">
                      <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {attachment.size} · {attachment.uploadedBy}
                        </p>
                      </div>
                    </div>
                  ))}

                  {canEdit && (
                    <Button onClick={handleFileUpload} variant="outline" className="w-full" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{new Date(item.createdDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  {item.closedDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Closed</span>
                      <span className="font-medium">{new Date(item.closedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Days {isOverdue ? 'Overdue' : 'Remaining'}</span>
                    <span className={isOverdue ? 'text-destructive' : 'text-emerald-500'}>
                      {Math.abs(daysUntilDue)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RemediationItemDetail;
