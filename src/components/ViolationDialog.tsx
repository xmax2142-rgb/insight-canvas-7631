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
import type { Violation } from "@/types/violation";

const schema = z.object({
  name: z.string().min(1, "Violation name is required"),
  description: z.string().min(1, "Description is required"),
  violatingUser: z.string().min(1, "Violating user is required"),
  grcComments: z.string(),
  status: z.enum(["open", "closed"]),
  actionTaken: z.enum(["issue_violation", "issue_warning", "no_action"]),
});

type FormValues = z.infer<typeof schema>;

interface ViolationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  violation?: Violation | null;
  onSubmit: (data: FormValues) => void;
}

export function ViolationDialog({ open, onOpenChange, violation, onSubmit }: ViolationDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", violatingUser: "", grcComments: "", status: "open", actionTaken: "no_action" },
  });

  useEffect(() => {
    if (open) {
      if (violation) {
        form.reset({ name: violation.name, description: violation.description, violatingUser: violation.violatingUser, grcComments: violation.grcComments, status: violation.status, actionTaken: violation.actionTaken ?? "no_action" });
      } else {
        form.reset({ name: "", description: "", violatingUser: "", grcComments: "", status: "open", actionTaken: "no_action" });
      }
    }
  }, [open, violation, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{violation ? "Edit Violation" : "Add Violation"}</DialogTitle>
          <DialogDescription>{violation ? "Update the violation details below." : "Fill in the details to record a new violation."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Violation Name</FormLabel><FormControl><Input placeholder="e.g. Unauthorized Access" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the violation..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="violatingUser" render={({ field }) => (<FormItem><FormLabel>Violating User</FormLabel><FormControl><Input placeholder="User name or ID" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="grcComments" render={({ field }) => (<FormItem><FormLabel>GRC Comments</FormLabel><FormControl><Textarea placeholder="Analyst comments..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="actionTaken" render={({ field }) => (<FormItem><FormLabel>Action Taken</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="issue_violation">Issue Violation</SelectItem><SelectItem value="issue_warning">Issue Warning</SelectItem><SelectItem value="no_action">No Action</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{violation ? "Save Changes" : "Add Violation"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
