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
  const [totalAssets, setTotalAssets] = useState(0);
  const [passedAssets, setPassedAssets] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setTotalAssets(initial?.totalAssets ?? 0);
      setPassedAssets(initial?.passedAssets ?? 0);
      setNotes(initial?.notes ?? "");
    }
  }, [open, initial]);

  const invalid = !name.trim() || totalAssets < 0 || passedAssets < 0 || passedAssets > totalAssets;

  const submit = () => {
    if (invalid) return;
    onSave({
      name: name.trim(),
      totalAssets,
      passedAssets,
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
              <Label>Total Assets</Label>
              <Input type="number" min={0} value={totalAssets} onChange={(e) => setTotalAssets(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Passed Assets (this month)</Label>
              <Input type="number" min={0} value={passedAssets} onChange={(e) => setPassedAssets(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          {passedAssets > totalAssets && (
            <p className="text-xs text-destructive">Passed assets cannot exceed total assets.</p>
          )}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={invalid}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
