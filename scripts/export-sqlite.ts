/**
 * Exports all in-app mock/seed data to a SQLite-compatible .sql file.
 *
 * Usage:
 *   bun run scripts/export-sqlite.ts            # writes db/cybergrc.sql
 *   sqlite3 db/cybergrc.db < db/cybergrc.sql    # build the actual SQLite 3 file
 *
 * Optional: export your live browser data first.
 * In the app, open devtools console and run:
 *   copy(localStorage.getItem('cybergrc_violations'))
 * then save it as db/violations.json before running this script.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { mockUsers, mockRemediationItems } from "../src/lib/mockData";
import { mockComplianceSystems } from "../src/data/mockComplianceSystems";
import { mockEvents } from "../src/data/mockEvents";

const q = (v: unknown) => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

const rows: string[] = [];
const insert = (table: string, cols: string[], values: unknown[][]) => {
  for (const v of values) {
    rows.push(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${v.map(q).join(", ")});`);
  }
};

const schema = `
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS remediation_items;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS violations;
DROP TABLE IF EXISTS compliance_subcategories;
DROP TABLE IF EXISTS compliance_systems;
DROP TABLE IF EXISTS events;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  avatar TEXT
);

CREATE TABLE remediation_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT,
  status TEXT,
  assignee_id TEXT REFERENCES users(id),
  created_at TEXT,
  updated_at TEXT,
  due_date TEXT,
  affected_systems TEXT,
  extra_json TEXT
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  item_id TEXT REFERENCES remediation_items(id),
  author_id TEXT,
  body TEXT,
  created_at TEXT
);

CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  item_id TEXT REFERENCES remediation_items(id),
  name TEXT,
  size TEXT,
  uploaded_by TEXT,
  uploaded_at TEXT
);

CREATE TABLE violations (
  id TEXT PRIMARY KEY,
  data_json TEXT NOT NULL
);

CREATE TABLE compliance_systems (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  data_json TEXT
);

CREATE TABLE compliance_subcategories (
  id TEXT PRIMARY KEY,
  system_id TEXT REFERENCES compliance_systems(id),
  name TEXT,
  total_assets INTEGER,
  passed_assets INTEGER
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT,
  start_at TEXT,
  end_at TEXT,
  category TEXT,
  status TEXT,
  priority TEXT,
  data_json TEXT
);
`.trim();

// users
insert(
  "users",
  ["id", "name", "email", "role", "avatar"],
  mockUsers.map((u: any) => [u.id, u.name, u.email ?? null, u.role ?? null, u.avatar ?? null]),
);

// remediation items (+ nested comments / attachments)
for (const item of mockRemediationItems as any[]) {
  const { comments = [], attachments = [], ...rest } = item;
  insert(
    "remediation_items",
    [
      "id", "title", "description", "category", "priority", "status",
      "assignee_id", "created_at", "updated_at", "due_date", "affected_systems", "extra_json",
    ],
    [[
      rest.id, rest.title, rest.description ?? null, rest.category ?? null,
      rest.priority ?? null, rest.status ?? null,
      rest.assigneeId ?? rest.assignee_id ?? null,
      rest.createdAt ?? null, rest.updatedAt ?? null, rest.dueDate ?? null,
      Array.isArray(rest.affectedSystems) ? rest.affectedSystems.join(", ") : rest.affectedSystems ?? null,
      rest,
    ]],
  );
  insert(
    "comments",
    ["id", "item_id", "author_id", "body", "created_at"],
    comments.map((c: any) => [c.id, item.id, c.authorId ?? c.userId ?? null, c.content ?? c.body ?? null, c.createdAt ?? null]),
  );
  insert(
    "attachments",
    ["id", "item_id", "name", "size", "uploaded_by", "uploaded_at"],
    attachments.map((a: any) => [a.id, item.id, a.name ?? null, String(a.size ?? ""), a.uploadedBy ?? null, a.uploadedAt ?? null]),
  );
}

// violations (from exported localStorage snapshot if present)
const violationsFile = "db/violations.json";
if (existsSync(violationsFile)) {
  const list = JSON.parse(readFileSync(violationsFile, "utf8")) as any[];
  insert("violations", ["id", "data_json"], list.map((v) => [v.id, v]));
}

// compliance
for (const sys of mockComplianceSystems as any[]) {
  insert("compliance_systems", ["id", "name", "type", "data_json"], [[sys.id, sys.name, sys.type ?? null, sys]]);
  insert(
    "compliance_subcategories",
    ["id", "system_id", "name", "total_assets", "passed_assets"],
    (sys.subcategories ?? []).map((s: any) => [
      s.id, sys.id, s.name, s.totalAssets ?? 0, s.passedAssets ?? 0,
    ]),
  );
}

// events
insert(
  "events",
  ["id", "title", "start_at", "end_at", "category", "status", "priority", "data_json"],
  (mockEvents as any[]).map((e) => [
    e.id, e.title,
    e.start instanceof Date ? e.start.toISOString() : e.start ?? e.startDate ?? null,
    e.end instanceof Date ? e.end.toISOString() : e.end ?? e.endDate ?? null,
    e.category ?? null, e.status ?? null, e.priority ?? null, e,
  ]),
);

mkdirSync("db", { recursive: true });
const sql = `${schema}\n\nBEGIN TRANSACTION;\n${rows.join("\n")}\nCOMMIT;\n`;
writeFileSync("db/cybergrc.sql", sql);
console.log(`Wrote db/cybergrc.sql (${rows.length} rows)`);
