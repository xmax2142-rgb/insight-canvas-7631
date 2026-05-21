# AI Assistant Chatbot — Implementation Plan

## Goal
A floating AI chat widget available on every page that can read, create, update, and delete data across:
- Remediation items (admin dashboard)
- Calendar events
- Notes
- Tasks

Session-only chat with localStorage backup. Destructive actions require user confirmation.

## Architecture

### 1. Backend (Lovable Cloud)
Enable Lovable Cloud to get `LOVABLE_API_KEY`. Create one edge function:
- `supabase/functions/ai-chat/index.ts` — streams responses using AI SDK + Gemini 3 Flash, declares the full tool catalog (with `inputSchema` only). Tools are **not executed server-side** — the model emits tool calls and the client runs them against local app state.

### 2. Global App State (Zustand)
Currently remediation items, events, notes, tasks live in component state with mock data. Lift them to lightweight Zustand stores so both the existing UI and the chatbot can read/mutate them:
- `src/stores/remediationStore.ts`
- `src/stores/calendarStore.ts` (wraps existing events)
- `src/stores/notesStore.ts`
- `src/stores/tasksStore.ts`

Existing components refactored minimally to source data from these stores.

### 3. Chat Widget
- `src/components/ai/ChatWidget.tsx` — floating bottom-right button → expandable panel
- `src/components/ai/ChatMessages.tsx` — renders `message.parts` (text + tool invocations)
- `src/components/ai/ToolCallCard.tsx` — collapsed accordion showing tool name, args, result
- `src/components/ai/ConfirmActionDialog.tsx` — modal for destructive ops
- Mounted globally in `App.tsx`

Uses `useChat` from `@ai-sdk/react` with `DefaultChatTransport` pointing at the edge function. Messages persisted to `localStorage` key `ai-chat-session`.

### 4. Tool Execution Flow
- AI SDK tool calls arrive client-side via `onToolCall`
- Tool registry maps tool name → handler function operating on Zustand stores
- Destructive tools (delete, close, modify) trigger `ConfirmActionDialog` before execution
- Result returned via `addToolResult` so model can continue reasoning

### 5. Tool Catalog
Remediation: `list_remediation_items`, `get_remediation_item`, `create_remediation_item`, `update_remediation_item`, `delete_remediation_item`, `filter_remediation_table`
Calendar: `list_events`, `create_event`, `update_event`, `delete_event`, `move_event`
Notes: `list_notes`, `create_note`, `update_note`, `delete_note`
Tasks: `list_tasks`, `create_task`, `update_task`, `toggle_task`, `delete_task`
Navigation: `navigate_to` (route the user to a page)

Confirmation required for: any `delete_*`, `update_*`, and item status changes.

### 6. Design
- Floating circular button with subtle pulse, primary color
- Expanded panel ~400×600px, rounded, shadow-2xl, glass-ish background
- Use AI Elements primitives (`conversation`, `message`, `prompt-input`, `tool`, `shimmer`) installed via `bunx ai-elements@latest add ...`
- Custom agent avatar (generated, not Sparkles icon)

## Order of work
1. Enable Lovable Cloud + verify `LOVABLE_API_KEY`
2. Install deps: `ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`, `zustand`
3. Install AI Elements components
4. Create Zustand stores + refactor existing screens to consume them
5. Edge function with tool schema declarations
6. Chat widget UI + tool executor + confirmation dialog
7. Mount globally, generate agent logo
8. QA: send commands like "create a critical remediation item about XSS", "delete event X", verify confirmations and live UI updates

## Notes
- Tools execute on the client because all data is client-side (mockData / component state). No DB writes.
- If you later move data to Cloud tables, tool execution can be moved server-side.
- The chat panel is hidden on auth/login pages.

Reply "go" to build, or tell me what to adjust (scope, design direction, model).