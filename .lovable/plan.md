Add a Compliance Hub to the CyberGRC app. It will act as a system inventory that shows each environment component's compliance percentage based on passed vs total controls. The page will use static mock data, be reachable from the header and homepage, and add a new Compliance Score KPI card to the dashboard.

What we will build

1. New Compliance data model
- Type: `ComplianceSystem` with id, name, type, owner, environment, totalControls, passedControls, lastAssessmentDate, status, and notes.
- Compliance score = round((passedControls / totalControls) * 100).
- Status derived from score: compliant (>= 90), at-risk (70-89), non-compliant (< 70).

2. Mock data
- File: `src/data/mockComplianceSystems.ts`.
- Initial systems covering the user's examples:
  - Linux Servers
  - Windows Servers
  - Linux Workstations
  - Windows Workstations
  - Network Devices
  - Databases
- Each system has realistic total controls, passed controls, owner, and last assessment date.

3. Compliance Hub page
- File: `src/pages/ComplianceHub.tsx`.
- Header with title, subtitle, Home button, and a "Refresh/Assess" placeholder action.
- Top-level KPI cards:
  - Overall Compliance Score (average across all systems)
  - Compliant Systems count
  - At Risk Systems count
  - Non-Compliant Systems count
- System cards grid showing each system with a progress bar, percentage, status badge, passed/total controls, owner, and last assessment date.
- Clickable cards with hover feedback consistent with existing `card-hover` utility.
- Filtering chips by system type and status.
- Summary breakdown table or list for at-a-glance status.

4. Navigation and routing
- Add `/compliance` route in `src/App.tsx`.
- Add "Compliance" link to the desktop and mobile header in `src/components/Header.tsx`.
- Add a new Command Hubs shortcut card on the homepage for "Compliance Hub" with a green accent matching the compliance theme.

5. Homepage integration
- Update `src/pages/Index.tsx`:
  - Add the Compliance Hub card to the `hubs` array.
  - Add a new "Compliance Score" KPI card in `HeroSection` (or pass the data to it).
- Update `src/components/HeroSection.tsx` to accept and display the overall compliance score as a new KPI card, linking to `/compliance`.
- Update the KPI card order so the new card fits naturally with the existing six cards.

6. State integration (optional but forward-compatible)
- Store the compliance systems in `src/stores/appStore.ts` so Nova and future features can read the data.
- Mark it as read-only/static initially; later work can enable add/edit/delete.

7. Types
- File: `src/types/compliance.ts`.
- Export `ComplianceSystem`, `ComplianceStatus`, and `SystemType`.

Technical details
- Use the existing warm cream / dark card aesthetic and Tailwind tokens (`bg-card`, `border-border`, `text-muted-foreground`, etc.).
- Use `lucide-react` icons: `ShieldCheck`, `Server`, `Database`, `Network`, `Monitor`, `LayoutGrid`.
- Use `recharts` or plain CSS progress bars for the percentage visual. The project already uses `recharts`, so a simple progress-style bar or donut summary is acceptable.
- Persist nothing to localStorage for this feature unless the user later asks for edits.
- Keep the page responsive using the same grid breakpoints (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) as the homepage hubs.
- No backend changes required; mock data lives in the client.

Files to create
- `src/types/compliance.ts`
- `src/data/mockComplianceSystems.ts`
- `src/pages/ComplianceHub.tsx`

Files to modify
- `src/App.tsx` — add `/compliance` route
- `src/components/Header.tsx` — add Compliance nav link
- `src/pages/Index.tsx` — add Compliance Hub shortcut and pass data to HeroSection
- `src/components/HeroSection.tsx` — add Compliance Score KPI card
- `src/stores/appStore.ts` — add compliance systems to shared state

Verification plan
- Run the dev server and verify the homepage shows a new Compliance Score KPI card and a Compliance Hub shortcut.
- Click the Compliance Hub shortcut and verify navigation to `/compliance`.
- Confirm the Compliance Hub displays the mock systems with correct percentages and status badges.
- Click the Home button and verify navigation back to the dashboard.
- Confirm header navigation includes a Compliance link on both desktop and mobile.