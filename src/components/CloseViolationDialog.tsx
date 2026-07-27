import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mail, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/stores/appStore";
import { buildMailtoUrl, deriveEmail, openMailClient, renderTemplate } from "@/lib/emailTemplates";
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
  onEmailDrafted?: (mailtoUrl: string) => void;
}

export function CloseViolationDialog({ open, onOpenChange, violation, onConfirm, onEmailDrafted }: CloseViolationDialogProps) {
  const emailSettings = useAppStore((s) => s.emailSettings);
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [showBody, setShowBody] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { finalDecision: "", actionTaken: "no_action" },
  });

  const actionTaken = form.watch("actionTaken");
  const finalDecision = form.watch("finalDecision");
  const isIssueViolation = actionTaken === "issue_violation";

  useEffect(() => {
    if (open && violation) {
      form.reset({ finalDecision: "", actionTaken: "no_action" });
      setTo(violation.violatingUserEmail || deriveEmail(violation.violatingUser, emailSettings.companyDomain));
      setCc(emailSettings.ccList);
      setSendEmail(true);
      setShowBody(false);
    }
  }, [open, violation, emailSettings, form]);

  useEffect(() => {
    if (violation) {
      setSubject(renderTemplate(emailSettings.violationSubject, violation, { finalDecision, actionTaken, userEmail: to }));
    }
  }, [violation, emailSettings.violationSubject, finalDecision, actionTaken, to]);

  const body = useMemo(() => {
    if (!violation) return "";
    return renderTemplate(emailSettings.violationBody, violation, { finalDecision, actionTaken, userEmail: to });
  }, [violation, emailSettings.violationBody, finalDecision, actionTaken, to]);

  const handleSubmit = (data: FormValues) => {
    if (!violation) return;
    onConfirm(violation.id, data.finalDecision, data.actionTaken);
    if (data.actionTaken === "issue_violation" && sendEmail) {
      const url = buildMailtoUrl({ to, cc, subject, body });
      openMailClient(url);
      onEmailDrafted?.(url);
    }
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) form.reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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

            {isIssueViolation && (
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Violation notice email</span>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="send-email" checked={sendEmail} onCheckedChange={(v) => setSendEmail(v === true)} />
                  <Label htmlFor="send-email" className="text-sm font-normal cursor-pointer">Open Outlook draft after closing</Label>
                </div>

                {sendEmail && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="mail-to" className="text-xs">To</Label>
                      <Input id="mail-to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="user@company.com" />
                      {!to && (
                        <p className="text-xs text-muted-foreground">
                          No address on file. Add one here, or set a company email domain in{" "}
                          <Link to="/settings" className="underline">Settings</Link>.
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mail-cc" className="text-xs">CC</Label>
                      <Input id="mail-cc" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="grc-team@company.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mail-subject" className="text-xs">Subject</Label>
                      <Input id="mail-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                    <button type="button" onClick={() => setShowBody((s) => !s)} className="flex items-center gap-1 text-xs font-medium text-primary">
                      {showBody ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {showBody ? "Hide" : "Preview"} message body
                    </button>
                    {showBody && (
                      <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">{body}</pre>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Edit the wording anytime in <Link to="/settings" className="underline">Settings → Email Templates</Link>.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>Cancel</Button>
              <Button type="submit">{isIssueViolation && sendEmail ? "Close & Draft Email" : "Close Violation"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
