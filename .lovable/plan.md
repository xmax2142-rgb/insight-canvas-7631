## Update demo users in RAP System

Replace the mock users used by the Remediation Hub login and workflows with the new roster.

### New users
- Ghamdi, Saeed M — GRC analyst (admin)
- Almuhaidib, Muneera M — GRC analyst (admin)
- Shareef, Reem F — GRC analyst (admin)
- Mohammad Qhatani — proponent

### Changes
- **`src/lib/mockData.ts`**
  - Replace the three entries in `mockUsers` with the four new users above (roles: three `admin`, one `proponent`). Generate simple emails (e.g. `saeed.ghamdi@company.com`).
  - Update `assignedTo` / `assignedToName` on all `mockRemediationItems` currently assigned to "Mohammed Kahtani" → "Mohammad Qhatani" (new id).
  - Update comment authors: existing comments by "Saeed" → "Ghamdi, Saeed M"; by "Isa Sunat" → reassign to "Almuhaidib, Muneera M"; by "Mohammed Kahtani" → "Mohammad Qhatani". Uploaded-by fields on attachments updated the same way.

### Not touched
- Login page layout, role-based routing (admin → `/remediation/admin`, proponent → `/remediation/dashboard`) stay the same.
- No schema/backend changes — mock data only.