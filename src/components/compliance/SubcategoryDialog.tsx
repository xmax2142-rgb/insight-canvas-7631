import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Subcategory } from "@/types/compliance";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Subcategory | null;
  onSave: (data: Omit<Subcategory, "id">) => void;
  title?: string;
}

export function SubcategoryDialog({ open, onOpenChange, initial, onSave, title }: Props) {
  const [name, setName] = useState("");
  const [passed, setPassed] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [failedAssets, setFailedAssets] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setPassed(initial?.passedControls ?? 0);
      setTotal(initial?.totalControls ?? 0);
      setTotalAssets(initial?.totalAssets ?? 0);
      setFailedAssets(initial?.failedAssets ?? 0);
      setNotes(initial?.notes ?? "");
    }
  }, [open, initial]);

  const submit = () => {
    if (!name.trim() || total < 0 || passed < 0 || passed > total) return;
    if (totalAssets < 0 || failedAssets < 0 || failedAssets > totalAssets) return;
    onSave({
      name: name.trim(),
      passedControls: passed,
      totalControls: total,
      totalAssets,
      failedAssets,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? (initial ? "Edit Subcategory" : "Add Subcategory")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Oracle Servers" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Passed Controls</Label>
              <Input type="number" min={0} value={passed} onChange={(e) => setPassed(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Total Controls</Label>
              <Input type="number" min={0} value={total} onChange={(e) => setTotal(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Total Assets</Label>
              <Input type="number" min={0} value={totalAssets} onChange={(e) => setTotalAssets(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Failed Assets</Label>
              <Input type="number" min={0} value={failedAssets} onChange={(e) => setFailedAssets(parseInt(e.target.value) || 0)} />
            </div>
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
