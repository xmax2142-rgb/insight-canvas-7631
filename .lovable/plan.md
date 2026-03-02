# Cybersecurity GRC Dashboard Homepage

## Overview

Transform the current blog/magazine homepage into a Cybersecurity GRC (Governance, Risk, Compliance) dashboard with a dark aesthetic, KPI cards, hub shortcuts, and a monthly activity calendar.

## Changes

### 1. Update Color Theme (src/index.css)

- keep the warm cream/beige palette as it is and do not change 

### 2. Update Header (src/components/Header.tsx)

- Replace "Perspective" branding with "CyberGRC" or similar
- Update navigation links to: Dashboard, Violations, Remediation, Events
- Change "Join Now" button to a profile/settings action

### 3. Replace HeroSection with KPI Dashboard (src/components/HeroSection.tsx)

- Remove the image-based hero entirely
- Create a grid of 4-6 modern KPI cards with placeholder values:
  - Total Violations (with alert icon, red indicator)
  - Open Remediations (with wrench icon, amber indicator)  
  - Compliance Score (with shield icon, green indicator)
  - Upcoming Events (with calendar icon, cyan indicator)
  - Critical Findings (with warning icon)
  - Assessments Completed (with check icon)
- Each card: dark card background, colored left border or icon accent, large placeholder number ("--"), label, and a subtle trend indicator

### 4. Replace IntroSection (src/components/IntroSection.tsx)

- Brief welcome/status summary text for the cybersecurity analyst
- Something like "GRC Command Center - Monitor violations, track remediation, and manage compliance activities"

### 5. Replace Article Cards Section with Hub Shortcuts (src/pages/Index.tsx)

- Replace the "Featured Articles" grid with three clickable hub cards:
  - **Cyber Violations Hub** (/violations) - Shield/alert icon, dark card with red accent
  - **Remediation Hub** (/remediation) - Wrench/tool icon, dark card with amber accent
  - **Event Horizon Hub** (/events) - Calendar/radar icon, dark card with cyan accent
- Each card: thumbnail-style with icon, title, brief description, and arrow indicator

### 6. Add Monthly Calendar Section (src/pages/Index.tsx)

- Add a calendar widget section below the hub shortcuts (before the newsletter section)
- Use the existing Calendar component (react-day-picker) from src/components/ui/calendar.tsx
- Style it to match the dark dashboard aesthetic
- Title: "Activity Calendar" with placeholder for cybersecurity events

### 7. Remove/Replace Newsletter and Footer

- Replace the newsletter section with the calendar widget
- Update footer links to match GRC context (Violations, Remediation, Events, Settings, etc.)

### 8. Add Placeholder Routes (src/App.tsx)

- Add routes for /violations, /remediation, /events
- Create simple placeholder pages for each

## Technical Details

### Files to Create

- `src/pages/Violations.tsx` - placeholder page
- `src/pages/Remediation.tsx` - placeholder page  
- `src/pages/Events.tsx` - placeholder page

### Files to Modify

- `src/index.css` - dark dashboard color theme
- `src/components/Header.tsx` - new branding and nav
- `src/components/HeroSection.tsx` - KPI cards dashboard
- `src/components/IntroSection.tsx` - GRC summary text
- `src/pages/Index.tsx` - hub shortcuts, calendar section, updated footer
- `src/App.tsx` - new routes

### Icons Used (from lucide-react)

Shield, AlertTriangle, Wrench, Calendar, Activity, CheckCircle, ArrowUpRight, TrendingUp, TrendingDown