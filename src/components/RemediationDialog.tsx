import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { mockUsers, type RemediationItem } from "@/lib/mockData";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150, "Title must be under 150 characters"),
  description: z.string().trim().max(1000, "Description must be under 1000 characters"),
  category: z.string().trim().max(80, "Category must be under 80 characters"),
  priority: z.enum(["critical", "high", "medium", "low"]),
  status: z.enum(["open", "in_progress", "pending_review", "closed"]),
  assignedTo: z.string().min(1, "Assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
  affectedSystems: z.string().trim().max(300, "Keep this under 300 characters"),
});

export type RemediationFormValues = z.infer<typeof schema>;

interface RemediationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: RemediationItem | null;
  onSubmit: (data: RemediationFormValues) => void;
}

const defaultDue = () => new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

const emptyValues = (): RemediationFormValues => ({
  title: "",
  description: "",
  category: "",
  priority: "medium",
  status: "open",
  assignedTo: mockUsers[0]?.id ?? "1",
  dueDate: defaultDue(),
  affectedSystems: "",
});

export function RemediationDialog({ open, onOpenChange, item, onSubmit }: RemediationDialogProps) {
  const form = useForm<RemediationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    if (item) {
      form.reset({
        title: item.title,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        assignedTo: item.assignedTo,
        dueDate: item.dueDate,
        affectedSystems: item.affectedSystems.join(", "),
      });
    } else {
      form.reset(emptyValues());
    }
  }, [open, item, form]);

  const handleSubmit = (data: RemediationFormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Remediation Item" : "New Remediation Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update the remediation action plan details." : "Fill in the details to create a new remediation action plan."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="e.g. Enable MFA for admin access" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="Describe the finding and expected remediation" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input placeholder="e.g. Access Control" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an assignee" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {mockUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="affectedSystems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affected Systems</FormLabel>
                  <FormControl><Input placeholder="Comma separated, e.g. Admin Portal, Firewall" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{item ? "Save Changes" : "Create Item"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
