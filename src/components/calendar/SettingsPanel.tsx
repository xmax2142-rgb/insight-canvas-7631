import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SettingsPanelProps { open: boolean; onClose: () => void; }

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState({ weekStartDay: "sunday", defaultView: "month", showWeekNumbers: false, enableNotifications: true, reminderTime: "60", compactMode: false });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Settings</DialogTitle></DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Calendar Display</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="weekStart" className="text-sm">Week starts on</Label>
              <Select value={settings.weekStartDay} onValueChange={(v) => setSettings({ ...settings, weekStartDay: v })}>
                <SelectTrigger id="weekStart" className="w-32 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="defaultView" className="text-sm">Default view</Label>
              <Select value={settings.defaultView} onValueChange={(v) => setSettings({ ...settings, defaultView: v })}>
                <SelectTrigger id="defaultView" className="w-32 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="compactMode" className="text-sm">Compact mode</Label>
              <Switch id="compactMode" checked={settings.compactMode} onCheckedChange={(v) => setSettings({ ...settings, compactMode: v })} />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Notifications</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm">Enable notifications</Label>
              <Switch id="notifications" checked={settings.enableNotifications} onCheckedChange={(v) => setSettings({ ...settings, enableNotifications: v })} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button onClick={() => { toast({ title: "Settings saved", description: "Your preferences have been updated." }); onClose(); }} className="rounded-xl">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
