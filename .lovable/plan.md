## Goal
Make each Compliance category editable and support subcategories (e.g., Linux Servers → Oracle Servers, HPC Servers, UCMG). A category's score becomes the roll-up of its subcategories' passed/total controls.

## Data model changes (`src/types/compliance.ts`, `src/data/mockComplianceSystems.ts`)
- Add `Subcategory { id, name, passedControls, totalControls, notes? }`.
- Extend `ComplianceSystem` with `subcategories: Subcategory[]`.
- Treat category `passedControls`/`totalControls` as **derived** = sum of subcategories (fallback to direct values if no subcategories, for backward compatibility).
- Update `computeScore` to accept a system and use rolled-up totals.
- Seed Linux Servers with Oracle Servers, HPC Servers, UCMG examples; give the other five categories 1-2 starter subs so the UI is consistent.

## State (`src/stores/appStore.ts`)
Add actions:
- `addComplianceSystem(data)` / `updateComplianceSystem(id, patch)` / `deleteComplianceSystem(id)`
- `addSubcategory(systemId, sub)` / `updateSubcategory(systemId, subId, patch)` / `deleteSubcategory(systemId, subId)`
- `renameComplianceSystem` is covered by update.
- No persistence layer added (matches current in-memory compliance data); can add localStorage later if wanted.

## UI (`src/pages/ComplianceHub.tsx`)
Rework each system card to be an expandable panel:
- Header row: icon, editable name (pencil → inline input), status badge, rolled-up score, "Edit" and "Delete" menu (dropdown-menu).
- Progress bar uses rolled-up score.
- Expandable body lists subcategories as compact rows: name, `passed / total`, mini progress bar, edit/delete icons.
- "Add subcategory" button at bottom of each card opens a small dialog (name, passed, total, optional notes).
- "Edit category" dialog: name, owner, environment, notes.
- Top-right of page: "Add Category" button opens dialog (name, type, owner, environment).

Dialogs use existing shadcn `Dialog` + `Input` + `Select` components. Confirm-before-delete via `AlertDialog`.

## Score roll-up
- Category `passed = Σ sub.passed`, `total = Σ sub.total`.
- Overall page score keeps summing across all categories (unchanged formula, just reads derived totals).
- KPI filter cards continue to work off `computeStatus(score)`.

## Out of scope
- Persistence to backend / localStorage
- Nova AI tools for subcategories (can be added after)
- Historical assessments

## Files touched
- `src/types/compliance.ts` — types + roll-up helpers
- `src/data/mockComplianceSystems.ts` — seed subcategories
- `src/stores/appStore.ts` — CRUD actions
- `src/pages/ComplianceHub.tsx` — expandable cards, dialogs, edit/delete
- (new) `src/components/compliance/SubcategoryDialog.tsx`, `CategoryDialog.tsx` — form dialogs
