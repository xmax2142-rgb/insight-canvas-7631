import { Link } from "react-router-dom";
import { Home, Mail, RotateCcw, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/stores/appStore";
import { useToast } from "@/hooks/use-toast";
import { SAMPLE_VIOLATION, TEMPLATE_PLACEHOLDERS, renderTemplate } from "@/lib/emailTemplates";

const Settings = () => {
  const emailSettings = useAppStore((s) => s.emailSettings);
  const setEmailSettings = useAppStore((s) => s.setEmailSettings);
  const resetEmailSettings = useAppStore((s) => s.resetEmailSettings);
  const { toast } = useToast();

  const previewSubject = renderTemplate(emailSettings.violationSubject, SAMPLE_VIOLATION);
  const previewBody = renderTemplate(emailSettings.violationBody, SAMPLE_VIOLATION);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-foreground">Settings</h1>
              <p className="text-xs font-medium text-muted-foreground">Email templates &amp; notifications</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/"><Home className="mr-2 h-4 w-4" />Home</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-primary" /> Violation Notice Template
            </CardTitle>
            <CardDescription>
              Used when a violation is closed with "Issue Violation". The draft opens in your default mail client (Outlook).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Available placeholders</Label>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_PLACEHOLDERS.map((p) => (
                  <span key={p} className="rounded-full border border-border bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">{`{{${p}}}`}</span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={emailSettings.violationSubject} onChange={(e) => setEmailSettings({ violationSubject: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" rows={16} className="font-mono text-xs" value={emailSettings.violationBody} onChange={(e) => setEmailSettings({ violationBody: e.target.value })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="domain">Company email domain</Label>
                <Input id="domain" placeholder="company.com" value={emailSettings.companyDomain} onChange={(e) => setEmailSettings({ companyDomain: e.target.value })} />
                <p className="text-xs text-muted-foreground">Used to guess the recipient address from the violating user's name when no email is stored.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cc">Default CC</Label>
                <Input id="cc" placeholder="grc-team@company.com" value={emailSettings.ccList} onChange={(e) => setEmailSettings({ ccList: e.target.value })} />
                <p className="text-xs text-muted-foreground">Comma-separated addresses copied on every violation notice.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => { resetEmailSettings(); toast({ title: "Template reset", description: "The default violation notice template has been restored." }); }}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset to default
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>Rendered against a sample violation record.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Subject</p>
              <p className="text-sm font-semibold text-foreground">{previewSubject}</p>
            </div>
            <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-card p-4 text-sm text-foreground">{previewBody}</pre>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
