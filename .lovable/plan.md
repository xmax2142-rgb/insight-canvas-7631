## Goal
Admins (GRC analysts) can create new entries directly in the Remediation Action Plans page, matching the add-entry capability the other hubs already have.

## Current state
- The shared store already exposes `addRemediationItem` (auto-generates `REM-###` and a finding ID), but no page calls it — only the AI assistant can create items today.
- Violations Hub, Event Horizon Hub, and Compliance Hub each already have their own add dialogs, so no new creation flow is needed there.

## What to build

**1. New `RemediationDialog` component** (`src/components/RemediationDialog.tsx`)
- Modal form with fields: Title (required), Description, Category, Priority (critical/high/medium/low), Status (defaults to Open), Assigned To (dropdown of users from mock data), Due Date, Affected Systems (comma-separated).
- Zod validation: title required and length-capped, due date required, text fields trimmed and max-length limited.
- Reused for both create and edit modes so the same form can back an admin edit action later.

**2. Remediation Admin page** (`src/pages/RemediationAdmin.tsx`)
- Add a "New Item" button in the page header row next to the "Remediation Action Plans" heading, visible only when the logged-in user's role is `admin`.
- On submit, call `addRemediationItem` and show a success toast; the metrics cards and table update automatically since they read from the store.

**3. Consistency pass on the other hubs**
- Verify the Violations, Events, and Compliance add buttons are present and reachable from the page header; add a visible add affordance only where one is missing (no logic changes).

## Notes
- Styling follows the existing cream/dark card theme and shadcn dialog patterns already used by `ViolationDialog` and `CategoryDialog`.
- Data stays in the existing in-memory store, consistent with the rest of the app.
