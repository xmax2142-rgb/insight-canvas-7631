import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Violation, ActionTaken } from "@/types/violation";

const schema = z.object({
  finalDecision: z.string().min(1, "Final decision is required"),
  actionTaken: z.enum(["issue_violation", "issue_warning", "no_action"]),
});

type FormValues = z.infer<typeof schema>;

interface CloseViolationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  violation: Violation | null;
  onConfirm: (id: string, finalDecision: string, actionTaken: ActionTaken) => void;
}

export function CloseViolationDialog({ open, onOpenChange, violation, onConfirm }: CloseViolationDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { finalDecision: "", actionTaken: "no_action" },
  });

  const handleSubmit = (data: FormValues) => {
    if (violation) {
      onConfirm(violation.id, data.finalDecision, data.actionTaken);
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) form.reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Close Violation</DialogTitle>
          <DialogDescription>
            Write up the final decision for <span className="font-semibold text-foreground">{violation?.name}</span> and select the action taken.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="finalDecision" render={({ field }) => (<FormItem><FormLabel>Final Decision</FormLabel><FormControl><Textarea placeholder="Describe the resolution and final decision..." rows={4} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="actionTaken" render={({ field }) => (<FormItem><FormLabel>Action Taken</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="issue_violation">Issue Violation</SelectItem><SelectItem value="issue_warning">Issue Warning</SelectItem><SelectItem value="no_action">No Action</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>Cancel</Button>
              <Button type="submit">Close Violation</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
