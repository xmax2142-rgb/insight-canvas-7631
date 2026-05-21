import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useNavigate, useLocation } from "react-router-dom";
import { Bot, X, Send, ChevronDown, ChevronRight, Sparkles, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { executeTool, DESTRUCTIVE_TOOLS, toolLabel, describeAction, type ToolName } from "./toolExecutor";
import ReactMarkdown from "react-markdown";

const HIDDEN_ROUTES = ["/remediation"]; // login page

const STORAGE_KEY = "nova-ai-chat-session-v1";

interface PendingConfirm {
  toolCallId: string;
  toolName: string;
  args: any;
  resolve: (approved: boolean) => void;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load persisted messages
  const initialMessages: UIMessage[] = (() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  })();

  const transport = useRef(new DefaultChatTransport({
    api: `https://uswgibbqydgkmukzjunz.supabase.co/functions/v1/ai-chat`,
  })).current;

  const { messages, sendMessage, status, addToolResult, setMessages } = useChat({
    id: "nova-session",
    messages: initialMessages,
    transport,
    onError: (err) => {
      console.error("Chat error", err);
      toast({ title: "Chat error", description: err.message, variant: "destructive" });
    },
    onToolCall: async ({ toolCall }) => {
      const name = toolCall.toolName as ToolName;
      const args = toolCall.input as any;
      try {
        if (DESTRUCTIVE_TOOLS.has(name)) {
          const approved = await new Promise<boolean>((resolve) => {
            setPending({ toolCallId: toolCall.toolCallId, toolName: name, args, resolve });
          });
          if (!approved) {
            addToolResult({ tool: name, toolCallId: toolCall.toolCallId, output: { cancelled: true, reason: "User declined the action." } });
            return;
          }
        }
        const result = await executeTool(name, args, { navigate });
        addToolResult({ tool: name, toolCallId: toolCall.toolCallId, output: result });
      } catch (e: any) {
        addToolResult({ tool: name, toolCallId: toolCall.toolCallId, output: { error: e?.message ?? String(e) } });
      }
    },
  });

  // Persist messages
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, status]);

  // Auto-focus
  useEffect(() => { if (open) setTimeout(() => textareaRef.current?.focus(), 100); }, [open, status]);

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || status === "streaming" || status === "submitted") return;
    setInput("");
    await sendMessage({ text });
  }, [input, sendMessage, status]);

  const clearChat = () => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  if (HIDDEN_ROUTES.includes(location.pathname)) return null;

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground shadow-2xl shadow-primary/40 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open AI assistant"
        >
          <Bot className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-pulse ring-2 ring-background" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[60] w-[400px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-3rem)] flex flex-col rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-1.5">Nova <Sparkles className="h-3 w-3 text-primary" /></div>
                <div className="text-xs text-muted-foreground">AI assistant · full access</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={clearChat} title="Clear chat">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1">
            <div ref={scrollRef} className="p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto">
                    <Bot className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Hi, I'm Nova</p>
                    <p className="text-xs text-muted-foreground max-w-[260px] mx-auto">I can view, create, edit, and delete remediation items, events, notes, and tasks for you.</p>
                  </div>
                  <div className="grid gap-2 pt-2 px-2">
                    {[
                      "Show me all critical open items",
                      "Create a high priority task to patch CVE-2024-1234",
                      "Schedule a security audit next Monday at 10am",
                    ].map((s) => (
                      <button key={s} onClick={() => sendMessage({ text: s })} className="text-xs text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => <Message key={m.id} message={m} />)}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center"><Bot className="h-4 w-4 text-primary" /></div>
                  <span className="animate-pulse">Thinking…</span>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Composer */}
          <div className="p-3 border-t border-border/40 bg-background/50">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                }}
                placeholder="Ask Nova to do something…"
                rows={1}
                className="resize-none min-h-[44px] max-h-32 rounded-xl text-sm"
                disabled={isLoading}
              />
              <Button onClick={handleSubmit} disabled={!input.trim() || isLoading} size="icon" className="h-11 w-11 rounded-xl shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      <Dialog open={!!pending} onOpenChange={(o) => { if (!o && pending) { pending.resolve(false); setPending(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm action
            </DialogTitle>
            <DialogDescription>Nova wants to perform a {pending && pending.toolName.startsWith("delete") ? "destructive " : ""}action that will modify your data.</DialogDescription>
          </DialogHeader>
          {pending && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{toolLabel(pending.toolName)}</div>
              <div className="text-sm">{describeAction(pending.toolName, pending.args)}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { pending?.resolve(false); setPending(null); }}>Cancel</Button>
            <Button
              variant={pending?.toolName.startsWith("delete") ? "destructive" : "default"}
              onClick={() => { pending?.resolve(true); setPending(null); }}
            >
              {pending?.toolName.startsWith("delete") ? "Delete" : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0"><Bot className="h-4 w-4 text-primary-foreground" /></div>}
      <div className={cn("max-w-[85%] space-y-2", isUser && "flex flex-col items-end")}>
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <div key={i} className={cn(
                isUser
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm"
                  : "text-sm text-foreground prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1"
              )}>
                {isUser ? part.text : <ReactMarkdown>{part.text}</ReactMarkdown>}
              </div>
            );
          }
          if (part.type?.startsWith("tool-")) {
            return <ToolPart key={i} part={part as any} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}

function ToolPart({ part }: { part: any }) {
  const [openD, setOpenD] = useState(false);
  const name = (part.type as string).replace(/^tool-/, "");
  const state = part.state as string;
  const isError = state === "output-error" || (part.output && (part.output.error || part.output.cancelled));
  const isDone = state === "output-available";

  return (
    <div className={cn(
      "rounded-lg border text-xs overflow-hidden",
      isError ? "border-destructive/40 bg-destructive/5" : isDone ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/30"
    )}>
      <button onClick={() => setOpenD(!openD)} className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-muted/50 transition-colors">
        {openD ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="font-medium">{toolLabel(name)}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {isError ? "error" : isDone ? "done" : state}
        </span>
      </button>
      {openD && (
        <div className="px-2.5 pb-2 pt-1 space-y-1 border-t border-border/40">
          {part.input && (
            <details>
              <summary className="text-[10px] text-muted-foreground cursor-pointer">input</summary>
              <pre className="text-[10px] mt-1 overflow-x-auto">{JSON.stringify(part.input, null, 2)}</pre>
            </details>
          )}
          {part.output && (
            <details open>
              <summary className="text-[10px] text-muted-foreground cursor-pointer">output</summary>
              <pre className="text-[10px] mt-1 overflow-x-auto max-h-40">{JSON.stringify(part.output, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
