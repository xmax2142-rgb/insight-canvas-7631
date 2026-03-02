import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Trash2, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Note { id: string; title: string; content: string; date: Date; createdAt: Date; }

const mockNotes: Note[] = [
  { id: "1", title: "Security Audit Findings", content: "Key findings from the Q1 security audit.", date: new Date(2026, 0, 15), createdAt: new Date(2026, 0, 15, 10, 30) },
  { id: "2", title: "Compliance Meeting Notes", content: "Discussion about GDPR requirements.", date: new Date(2026, 0, 20), createdAt: new Date(2026, 0, 20, 14, 0) },
];

export function NotesView() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-6 overflow-hidden">
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 rounded-xl bg-secondary/50 border-border/30" /></div>
          <Button onClick={() => { setIsCreating(true); setSelectedNote(null); }} size="icon" className="h-10 w-10 rounded-xl"><Plus className="h-4 w-4" /></Button>
        </div>
        <ScrollArea className="flex-1"><div className="space-y-2 pr-2">{filteredNotes.map(n => <Card key={n.id} className={cn("cursor-pointer transition-all hover:bg-secondary/50", selectedNote?.id === n.id && "ring-2 ring-primary bg-secondary/50")} onClick={() => { setSelectedNote(n); setIsCreating(false); }}><CardContent className="p-3"><div className="flex items-start justify-between gap-2"><div className="flex-1 min-w-0"><h3 className="font-medium text-sm truncate">{n.title}</h3><p className="text-xs text-muted-foreground line-clamp-2 mt-1">{n.content}</p><div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{format(n.date, "MMM d, yyyy")}</div></div><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setNotes(notes.filter(x => x.id !== n.id)); if (selectedNote?.id === n.id) setSelectedNote(null); toast({ title: "Note deleted" }); }}><Trash2 className="h-3.5 w-3.5" /></Button></div></CardContent></Card>)}{filteredNotes.length === 0 && <div className="text-center py-8 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No notes found</p></div>}</div></ScrollArea>
      </div>
      <Card className="flex-1 flex flex-col min-h-0">
        {isCreating ? <><CardHeader className="border-b border-border/30 pb-4"><CardTitle className="text-lg">New Note</CardTitle></CardHeader><CardContent className="flex-1 flex flex-col gap-4 p-4"><Input placeholder="Note title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="h-11 rounded-xl" /><Textarea placeholder="Write your note..." value={newContent} onChange={(e) => setNewContent(e.target.value)} className="flex-1 min-h-[200px] rounded-xl resize-none" /><div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => { setIsCreating(false); setNewTitle(""); setNewContent(""); }} className="rounded-xl">Cancel</Button><Button onClick={() => { if (!newTitle.trim()) return; const n: Note = { id: Date.now().toString(), title: newTitle, content: newContent, date: new Date(), createdAt: new Date() }; setNotes([n, ...notes]); setNewTitle(""); setNewContent(""); setIsCreating(false); setSelectedNote(n); toast({ title: "Note created" }); }} className="rounded-xl">Save Note</Button></div></CardContent></>
        : selectedNote ? <><CardHeader className="border-b border-border/30 pb-4"><Input value={selectedNote.title} onChange={(e) => { const u = { ...selectedNote, title: e.target.value }; setNotes(notes.map(n => n.id === u.id ? u : n)); setSelectedNote(u); }} className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0" /><p className="text-xs text-muted-foreground mt-1">Created {format(selectedNote.createdAt, "MMM d, yyyy 'at' h:mm a")}</p></CardHeader><CardContent className="flex-1 p-4"><Textarea value={selectedNote.content} onChange={(e) => { const u = { ...selectedNote, content: e.target.value }; setNotes(notes.map(n => n.id === u.id ? u : n)); setSelectedNote(u); }} className="h-full min-h-[200px] rounded-xl resize-none" /></CardContent></>
        : <div className="flex-1 flex items-center justify-center text-muted-foreground"><div className="text-center"><FileText className="h-16 w-16 mx-auto mb-4 opacity-50" /><p className="text-lg font-medium">Select a note</p></div></div>}
      </Card>
    </div>
  );
}
