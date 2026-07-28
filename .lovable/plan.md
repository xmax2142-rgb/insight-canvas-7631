## Goal

Drop control counts from the Compliance Hub entirely. Each subcategory tracks only **Total Assets** and **Passed Assets (this month)**, and every score rolls up from assets.

## Data model (`src/types/compliance.ts`)

- `Subcategory`: keep `id`, `name`, `notes`; replace `passedControls`/`totalControls`/`failedAssets` with:
  - `totalAssets: number`
  - `passedAssets: number` (assets that passed this month)
- `ComplianceSystem`: remove legacy `passedControls`/`totalControls` fields.
- Rename `rollupControls` → `rollupAssets`, returning `{ passed, total }` summed across subcategories.
- `computeScore` = round(passedAssets / totalAssets × 100); status thresholds unchanged (≥90 compliant, ≥70 at risk, else non-compliant).
- Failed assets is no longer stored — where useful it's shown as a derived `total - passed`.

## Seed data (`src/data/mockComplianceSystems.ts`)

Rewrite each subcategory with `totalAssets` and `passedAssets` derived from the existing numbers (e.g. Oracle Servers: 24 total, 22 passed). Remove control fields from systems.

## UI

**`SubcategoryDialog.tsx`** — two numeric fields only: Total Assets and Passed Assets (this month), validated so passed ≤ total. Control inputs removed.

**`ComplianceHub.tsx`**
- Card header: big score % with subtext `X / Y assets passed` instead of controls.
- Subcategory rows: score bar plus `Passed: X / Y` and a red `Failed: Y-X` when non-zero.
- KPI "Overall Compliance" computed from summed assets across all systems.
- Subheading text "System inventory & control coverage" → "Asset inventory & monthly pass rate".

**`Index.tsx`** — homepage Compliance Score KPI uses `rollupAssets`; hub card description updated to mention monthly asset pass rate.

**`scripts/export-sqlite.ts`** — `compliance_subcategories` columns become `total_assets` / `passed_assets`; drop the control columns.

## Notes

Existing subcategories in the store are seeded fresh from mock data, so no migration is needed. If you later want month-over-month history, that's a separate change (per-month snapshots); this plan keeps a single current-month figure.
