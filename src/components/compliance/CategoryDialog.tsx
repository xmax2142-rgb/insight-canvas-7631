import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SYSTEM_TYPE_LABELS, type ComplianceSystem, type SystemType } from "@/types/compliance";

type Env = ComplianceSystem["environment"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: ComplianceSystem | null;
  onSave: (data: {
    name: string;
    type: SystemType;
    owner: string;
    environment: Env;
    notes?: string;
  }) => void;
}

export function CategoryDialog({ open, onOpenChange, initial, onSave }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<SystemType>("linux-server");
  const [owner, setOwner] = useState("");
  const [environment, setEnvironment] = useState<Env>("Production");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setType(initial?.type ?? "linux-server");
      setOwner(initial?.owner ?? "");
      setEnvironment(initial?.environment ?? "Production");
      setNotes(initial?.notes ?? "");
    }
  }, [open, initial]);

  const submit = () => {
    if (!name.trim() || !owner.trim()) return;
    onSave({ name: name.trim(), type, owner: owner.trim(), environment, notes: notes.trim() || undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Linux Servers" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as SystemType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SYSTEM_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Environment</Label>
              <Select value={environment} onValueChange={(v) => setEnvironment(v as Env)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Staging">Staging</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Owner</Label>
            <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g. Infrastructure Team" />
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
