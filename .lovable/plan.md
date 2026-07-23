# Improve Nova AI Assistant

Your app already has a floating AI assistant named **Nova** (bottom-right widget). It can read, create, edit, and delete data across Violations, Remediation, Events, Notes, and Tasks, and it can navigate pages. This plan upgrades it to feel more like a human co-pilot: it will understand which page you are looking at, explain visible items on demand, and interact with the UI directly (scroll, highlight, filter) rather than only mutating data.

## Goals
1. **Page awareness**: Nova knows the current route and visible data without being told.
2. **Explain anything on the page**: User can ask "What is this card?", "Tell me about REM-003", or "Why is this red?" and Nova gives a clear, contextual answer.
3. **Act on the UI like a human**: Nova can scroll to an item, highlight it, apply table filters, or open a detail view for the user.
4. **More natural, human-like conversation**: Proactive greetings, context-aware suggestions, and warmer copy.
5. **Better chat UI**: Rebuild the widget on top of AI Elements (conversation, message, prompt-input, tool, shimmer) instead of the current hand-rolled transcript.
6. **Distinctive identity**: Replace the generic Sparkles icon with a generated CyberGRC avatar/logo.

## Detailed plan

### 1. Rebuild the chat widget with AI Elements
Install AI Elements primitives:
```text
bun x ai-elements@latest add conversation message prompt-input shimmer tool
```
Replace the custom transcript, bubbles, composer, loading state, and tool accordion in `src/components/ai/ChatWidget.tsx` with:
- `Conversation` + `ConversationContent` + `ConversationScrollButton` for the transcript and auto-scroll behavior.
- `Message` + `MessageContent` + `MessageResponse` for assistant/user layout and streamed markdown.
- `PromptInput` + `PromptInputTextarea` + `PromptInputFooter` + `PromptInputSubmit` for the composer.
- `Tool` + `ToolHeader` + `ToolContent` + `ToolInput` + `ToolOutput` for tool invocation display, collapsed by default.
- `Shimmer` for the "Thinking..." loading state.

Keep the floating panel shell, the header, the clear-chat button, and the confirmation dialog; only the message/composer surfaces change.

### 2. Give Nova a visual identity
Generate a small avatar/logo for Nova (a cyber shield / AI agent mark) and save it to `src/assets/nova-avatar.png`. Use it in the chat header and floating button. Remove the generic `Sparkles` usage from the primary identity.

### 3. Add page-context tools to the client executor
Extend `src/components/ai/toolExecutor.ts` with new client-side tools:
- `get_page_context`: returns current route, page title, visible KPIs, and any route-specific context (e.g., the active table filter on `/remediation/admin`, the selected event on `/events`, the violation in focus on `/violations`).
- `explain_item`: accepts an item id or type (e.g., `REM-003`, `violation-5`, `event-audit-01`) and returns a human-readable summary of that item, its status, and why it matters.
- `scroll_to_element`: accepts a target selector/id and scrolls the page to it, briefly highlighting it with a ring/pulse animation so the user can follow along.
- `set_page_filter`: accepts a generic `filter` object (e.g., `{ status: "open", priority: "critical" }`) and emits the appropriate CustomEvent for the current page so Nova can filter tables or calendars for the user.

Register these tools in the edge function `supabase/functions/ai-chat/index.ts` as well, so Nova knows they exist and can call them.

### 4. Make Nova automatically aware of context
Update `ChatWidget.tsx` to append a lightweight `page_context` message to the first user turn of each conversation, or add a system prompt injection that includes current route and visible counts. The `get_page_context` tool will be available for Nova to call whenever it needs more detail.

### 5. Rewrite the system prompt for a human-like voice
Update the `SYSTEM_PROMPT` in `supabase/functions/ai-chat/index.ts`:
- Keep the plain-English rule (no markdown).
- Add a persona: Nova is a calm, concise cybersecurity analyst co-pilot.
- Instruct Nova to greet based on the current page (e.g., "I see you're on the Remediation dashboard...").
- Tell Nova to offer one or two proactive next steps after every action (e.g., "Want me to scroll to the new item?").
- Remind Nova to explain items in plain language, not just dump JSON.

### 6. Fix hardcoded backend URL
The chat transport currently uses a hardcoded Supabase functions URL. Replace it with:
```text
${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat
```
so local and published builds both work without code changes.

### 7. Keep the destructive-action confirmation
Preserve the existing confirmation dialog for destructive tools (update/delete across all hubs). The new tools that mutate data still require confirmation; the new read-only/explanation tools do not.

### 8. Update the edge function tool list
In `supabase/functions/ai-chat/index.ts`, add tool definitions for the new client-side tools (`get_page_context`, `explain_item`, `scroll_to_element`, `set_page_filter`) with clear descriptions so the model uses them correctly. Upgrade the model to the project default `google/gemini-3.6-flash` for better reasoning.

### 9. Update TypeScript types
Add the new tool names to the `ToolName` union in `src/components/ai/toolExecutor.ts` and mark only the mutating ones as `DESTRUCTIVE_TOOLS`.

### 10. Verify across pages
After the changes, verify Nova on:
- Home page: asks about KPIs, can explain cards and navigate to hubs.
- Violations Hub: explains violation records, scrolls to a specific row, filters the table.
- Remediation Hub: explains remediation items, filters by status/priority.
- Events Hub: explains events, scrolls to a date, applies calendar filters.
- Confirm destructive actions still show the confirmation dialog and that the UI updates after Nova completes an action.

## Files to change
- `src/components/ai/ChatWidget.tsx` — rebuild on AI Elements, add context injection, use env URL.
- `src/components/ai/toolExecutor.ts` — add new page-context and interaction tools.
- `supabase/functions/ai-chat/index.ts` — update system prompt and register new tools, switch model.
- `src/assets/nova-avatar.png` — generated avatar.
- `package.json` / `bun.lockb` — add AI Elements dependencies.

## Outcome
Nova will still be the floating widget in the bottom-right, but it will behave like a human co-pilot: it knows where you are, can explain anything visible on the page, can point your attention to the right element, and can continue taking actions on your behalf after confirming destructive changes.