## Goal

When a violation is closed with **Action Taken = Issue Violation**, the app opens the user's default mail client (Outlook) with a pre-filled violation notice addressed to the violating user, using a template you can edit in a new Settings page.

## How it works

1. Analyst closes a violation and picks "Issue Violation".
2. The app renders the saved template (subject + body), substituting values from the violation.
3. It builds a `mailto:` URL and triggers it — Outlook opens a new draft, pre-filled, ready to review and send.
4. A toast confirms "Violation closed — Outlook draft opened", with a "Reopen draft" action in case the popup didn't fire.

Nothing is sent automatically; the analyst always reviews in Outlook before sending.

## Recipient address

Violations currently store the violating user as a **name only**, so there's no address to mail to. Two additions:

- Add an optional **Email** field to the violation record (in the Add/Edit Violation dialog). If set, it's used as the To: address.
- In Settings, an optional **company email domain** (e.g. `company.com`). If a violation has no email, the address is derived from the name (`Saeed M Ghamdi` → `saeed.ghamdi@company.com`) and shown in the confirmation step so it can be corrected.
- Settings also holds optional **CC** addresses (e.g. the GRC mailbox) applied to every notice.

## Settings page (`/settings`, Email Templates section)

- Subject line input and body textarea for the "Violation Issued" template.
- Placeholder reference chips: `{{violationNumber}}`, `{{violationName}}`, `{{userName}}`, `{{userEmail}}`, `{{description}}`, `{{grcComments}}`, `{{finalDecision}}`, `{{actionTaken}}`, `{{createdDate}}`, `{{closedDate}}`.
- Live preview rendered against a sample violation.
- "Reset to default" button. A sensible default template ships built-in, so this works before you customize anything.
- Saved in the app store and persisted to localStorage, alongside CC list and company domain.

## Close dialog change

When "Issue Violation" is selected, the dialog reveals a small email panel: To (editable, pre-filled), CC, subject, and a collapsed body preview, plus a checkbox "Open Outlook draft after closing" (on by default). Choosing Issue Warning or No Action keeps the dialog exactly as it is today.

## Technical notes

- New `src/lib/emailTemplates.ts`: default templates, `{{placeholder}}` renderer, name→email derivation, and `buildMailtoUrl()` with correct percent-encoding (CRLF line breaks, encoded subject/body/cc).
- `mailto:` is plain text only and Windows caps the URL around ~2000 characters; the builder truncates the body with a note if a template ever exceeds that, so the draft still opens.
- Template settings live in `appStore.ts` (Zustand, localStorage-persisted) so Nova can also read/update them later if wanted.
- `Violation` type gains an optional `violatingUserEmail` field; existing stored violations remain valid.
- Files touched: `src/types/violation.ts`, `src/components/CloseViolationDialog.tsx`, `src/components/ViolationDialog.tsx`, `src/stores/appStore.ts`, `src/App.tsx` (route), new `src/pages/Settings.tsx` and `src/lib/emailTemplates.ts`, plus a Settings link in the header.

## Open item

You didn't provide the template text, so I'll ship a professional default notice (subject: `Security Policy Violation Notice — #{{violationNumber}}: {{violationName}}`) that you can paste your real wording over in Settings at any time.
