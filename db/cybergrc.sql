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
  total_controls INTEGER,
  passed_controls INTEGER,
  total_assets INTEGER,
  failed_assets INTEGER
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

BEGIN TRANSACTION;
INSERT INTO users (id, name, email, role, avatar) VALUES ('1', 'Ghamdi, Saeed M', 'saeed.ghamdi@company.com', 'admin', NULL);
INSERT INTO users (id, name, email, role, avatar) VALUES ('2', 'Almuhaidib, Muneera M', 'muneera.almuhaidib@company.com', 'admin', NULL);
INSERT INTO users (id, name, email, role, avatar) VALUES ('3', 'Shareef, Reem F', 'reem.shareef@company.com', 'admin', NULL);
INSERT INTO users (id, name, email, role, avatar) VALUES ('4', 'Mohammad Qhatani', 'mohammad.qhatani@company.com', 'proponent', NULL);
INSERT INTO remediation_items (id, title, description, category, priority, status, assignee_id, created_at, updated_at, due_date, affected_systems, extra_json) VALUES ('REM-001', 'Implement Multi-Factor Authentication for Admin Access', 'Current admin portal lacks MFA, creating vulnerability for unauthorized access. Implement MFA using authenticator apps or hardware tokens.', 'Access Control', 'critical', 'in_progress', NULL, NULL, NULL, '2024-02-15', 'Admin Portal, Identity Management System', '{"id":"REM-001","findingId":"FIND-2024-0045","title":"Implement Multi-Factor Authentication for Admin Access","description":"Current admin portal lacks MFA, creating vulnerability for unauthorized access. Implement MFA using authenticator apps or hardware tokens.","priority":"critical","status":"in_progress","assignedTo":"4","assignedToName":"Mohammad Qhatani","createdDate":"2024-01-15","dueDate":"2024-02-15","category":"Access Control","affectedSystems":["Admin Portal","Identity Management System"]}');
INSERT INTO comments (id, item_id, author_id, body, created_at) VALUES ('c1', 'REM-001', NULL, 'This is high priority. Please update with your implementation plan by end of week.', NULL);
INSERT INTO comments (id, item_id, author_id, body, created_at) VALUES ('c2', 'REM-001', NULL, 'Evaluating MFA solutions. Will have proposal ready by Friday.', NULL);
INSERT INTO attachments (id, item_id, name, size, uploaded_by, uploaded_at) VALUES ('a1', 'REM-001', 'mfa-implementation-plan.pdf', '245 KB', 'Mohammad Qhatani', NULL);
INSERT INTO remediation_items (id, title, description, category, priority, status, assignee_id, created_at, updated_at, due_date, affected_systems, extra_json) VALUES ('REM-002', 'Patch Outdated SSL/TLS Configuration', 'Web servers using deprecated TLS 1.0 and 1.1 protocols. Upgrade to TLS 1.2 minimum, preferably TLS 1.3.', 'Network Security', 'high', 'pending_review', NULL, NULL, NULL, '2024-02-20', 'Web Server Cluster, Load Balancer', '{"id":"REM-002","findingId":"FIND-2024-0052","title":"Patch Outdated SSL/TLS Configuration","description":"Web servers using deprecated TLS 1.0 and 1.1 protocols. Upgrade to TLS 1.2 minimum, preferably TLS 1.3.","priority":"high","status":"pending_review","assignedTo":"4","assignedToName":"Mohammad Qhatani","createdDate":"2024-01-20","dueDate":"2024-02-20","category":"Network Security","affectedSystems":["Web Server Cluster","Load Balancer"]}');
INSERT INTO comments (id, item_id, author_id, body, created_at) VALUES ('c3', 'REM-002', NULL, 'TLS configuration updated on all servers. Ready for review.', NULL);
INSERT INTO attachments (id, item_id, name, size, uploaded_by, uploaded_at) VALUES ('a2', 'REM-002', 'tls-config-changes.txt', '12 KB', 'Mohammad Qhatani', NULL);
INSERT INTO attachments (id, item_id, name, size, uploaded_by, uploaded_at) VALUES ('a3', 'REM-002', 'ssl-scan-results-after.pdf', '892 KB', 'Mohammad Qhatani', NULL);
INSERT INTO remediation_items (id, title, description, category, priority, status, assignee_id, created_at, updated_at, due_date, affected_systems, extra_json) VALUES ('REM-003', 'Update Password Policy Requirements', 'Current password policy allows weak passwords. Update to require minimum 12 characters, complexity requirements, and password history.', 'Access Control', 'medium', 'open', NULL, NULL, NULL, '2024-03-10', 'Active Directory, User Portal', '{"id":"REM-003","findingId":"FIND-2024-0038","title":"Update Password Policy Requirements","description":"Current password policy allows weak passwords. Update to require minimum 12 characters, complexity requirements, and password history.","priority":"medium","status":"open","assignedTo":"4","assignedToName":"Mohammad Qhatani","createdDate":"2024-01-10","dueDate":"2024-03-10","category":"Access Control","affectedSystems":["Active Directory","User Portal"]}');
INSERT INTO remediation_items (id, title, description, category, priority, status, assignee_id, created_at, updated_at, due_date, affected_systems, extra_json) VALUES ('REM-004', 'Enable Database Encryption at Rest', 'Production databases storing PII/PHI lack encryption at rest. Enable transparent data encryption (TDE).', 'Data Protection', 'critical', 'open', NULL, NULL, NULL, '2024-03-01', 'Customer Database, Financial Database', '{"id":"REM-004","findingId":"FIND-2024-0067","title":"Enable Database Encryption at Rest","description":"Production databases storing PII/PHI lack encryption at rest. Enable transparent data encryption (TDE).","priority":"critical","status":"open","assignedTo":"4","assignedToName":"Mohammad Qhatani","createdDate":"2024-02-01","dueDate":"2024-03-01","category":"Data Protection","affectedSystems":["Customer Database","Financial Database"]}');
INSERT INTO comments (id, item_id, author_id, body, created_at) VALUES ('c4', 'REM-004', NULL, 'This needs immediate attention due to compliance requirements.', NULL);
INSERT INTO remediation_items (id, title, description, category, priority, status, assignee_id, created_at, updated_at, due_date, affected_systems, extra_json) VALUES ('REM-005', 'Implement Automated Security Patching Process', 'No automated patching process in place. Implement automated patch management for OS and application updates.', 'Vulnerability Management', 'high', 'in_progress', NULL, NULL, NULL, '2024-03-15', 'All Servers, Workstations', '{"id":"REM-005","findingId":"FIND-2024-0071","title":"Implement Automated Security Patching Process","description":"No automated patching process in place. Implement automated patch management for OS and application updates.","priority":"high","status":"in_progress","assignedTo":"4","assignedToName":"Mohammad Qhatani","createdDate":"2024-02-05","dueDate":"2024-03-15","category":"Vulnerability Management","affectedSystems":["All Servers","Workstations"]}');
INSERT INTO comments (id, item_id, author_id, body, created_at) VALUES ('c5', 'REM-005', NULL, 'Researching patch management solutions. Considering WSUS and third-party tools.', NULL);
INSERT INTO remediation_items (id, title, description, category, priority, status, assignee_id, created_at, updated_at, due_date, affected_systems, extra_json) VALUES ('REM-006', 'Configure Logging and Monitoring for Critical Systems', 'Insufficient logging and monitoring on critical systems. Implement SIEM solution and configure alerting.', 'Monitoring & Logging', 'medium', 'closed', NULL, NULL, NULL, '2024-01-31', 'Firewall, IDS/IPS, Database Servers', '{"id":"REM-006","findingId":"FIND-2024-0023","title":"Configure Logging and Monitoring for Critical Systems","description":"Insufficient logging and monitoring on critical systems. Implement SIEM solution and configure alerting.","priority":"medium","status":"closed","assignedTo":"4","assignedToName":"Mohammad Qhatani","createdDate":"2023-12-15","dueDate":"2024-01-31","closedDate":"2024-01-28","category":"Monitoring & Logging","affectedSystems":["Firewall","IDS/IPS","Database Servers"]}');
INSERT INTO comments (id, item_id, author_id, body, created_at) VALUES ('c6', 'REM-006', NULL, 'SIEM deployed and configured. All critical systems now logging to central system.', NULL);
INSERT INTO comments (id, item_id, author_id, body, created_at) VALUES ('c7', 'REM-006', NULL, 'Verified implementation. Closing this item.', NULL);
INSERT INTO attachments (id, item_id, name, size, uploaded_by, uploaded_at) VALUES ('a4', 'REM-006', 'siem-configuration.pdf', '1.2 MB', 'Mohammad Qhatani', NULL);
INSERT INTO compliance_systems (id, name, type, data_json) VALUES ('sys-001', 'Linux Servers', 'linux-server', '{"id":"sys-001","name":"Linux Servers","type":"linux-server","owner":"Infrastructure Team","environment":"Production","totalControls":0,"passedControls":0,"lastAssessmentDate":"2026-06-14","notes":"CIS Benchmark Level 2 applied across production fleet.","subcategories":[{"id":"sub-001a","name":"Oracle Servers","passedControls":62,"totalControls":65,"totalAssets":24,"failedAssets":2},{"id":"sub-001b","name":"HPC Servers","passedControls":54,"totalControls":60,"totalAssets":18,"failedAssets":3},{"id":"sub-001c","name":"UCMG Servers","passedControls":52,"totalControls":55,"totalAssets":12,"failedAssets":1}]}');
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-001a', 'sys-001', 'Oracle Servers', 65, 62, 24, 2);
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-001b', 'sys-001', 'HPC Servers', 60, 54, 18, 3);
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-001c', 'sys-001', 'UCMG Servers', 55, 52, 12, 1);
INSERT INTO compliance_systems (id, name, type, data_json) VALUES ('sys-002', 'Windows Servers', 'windows-server', '{"id":"sys-002","name":"Windows Servers","type":"windows-server","owner":"Infrastructure Team","environment":"Production","totalControls":0,"passedControls":0,"lastAssessmentDate":"2026-06-20","notes":"Patch compliance gap on 3 legacy domain controllers.","subcategories":[{"id":"sub-002a","name":"Domain Controllers","passedControls":55,"totalControls":70,"totalAssets":8,"failedAssets":3},{"id":"sub-002b","name":"File Servers","passedControls":60,"totalControls":70,"totalAssets":22,"failedAssets":4},{"id":"sub-002c","name":"Application Servers","passedControls":57,"totalControls":70,"totalAssets":35,"failedAssets":6}]}');
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-002a', 'sys-002', 'Domain Controllers', 70, 55, 8, 3);
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-002b', 'sys-002', 'File Servers', 70, 60, 22, 4);
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-002c', 'sys-002', 'Application Servers', 70, 57, 35, 6);
INSERT INTO compliance_systems (id, name, type, data_json) VALUES ('sys-003', 'Linux Workstations', 'linux-workstation', '{"id":"sys-003","name":"Linux Workstations","type":"linux-workstation","owner":"Endpoint Security","environment":"Production","totalControls":0,"passedControls":0,"lastAssessmentDate":"2026-07-01","subcategories":[{"id":"sub-003a","name":"Engineering Laptops","passedControls":68,"totalControls":72,"totalAssets":45,"failedAssets":2},{"id":"sub-003b","name":"Developer Desktops","passedControls":63,"totalControls":68,"totalAssets":30,"failedAssets":3}]}');
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-003a', 'sys-003', 'Engineering Laptops', 72, 68, 45, 2);
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-003b', 'sys-003', 'Developer Desktops', 68, 63, 30, 3);
INSERT INTO compliance_systems (id, name, type, data_json) VALUES ('sys-004', 'Windows Workstations', 'windows-workstation', '{"id":"sys-004","name":"Windows Workstations","type":"windows-workstation","owner":"Endpoint Security","environment":"Production","totalControls":0,"passedControls":0,"lastAssessmentDate":"2026-07-05","notes":"BitLocker enforcement rollout in progress.","subcategories":[{"id":"sub-004a","name":"Corporate Laptops","passedControls":60,"totalControls":85,"totalAssets":180,"failedAssets":22},{"id":"sub-004b","name":"Kiosk Workstations","passedControls":58,"totalControls":75,"totalAssets":40,"failedAssets":7}]}');
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-004a', 'sys-004', 'Corporate Laptops', 85, 60, 180, 22);
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-004b', 'sys-004', 'Kiosk Workstations', 75, 58, 40, 7);
INSERT INTO compliance_systems (id, name, type, data_json) VALUES ('sys-005', 'Network Devices', 'network-device', '{"id":"sys-005","name":"Network Devices","type":"network-device","owner":"Network Operations","environment":"Production","totalControls":0,"passedControls":0,"lastAssessmentDate":"2026-06-28","notes":"Firewalls, switches, and routers hardened per NIST SP 800-53.","subcategories":[{"id":"sub-005a","name":"Firewalls","passedControls":30,"totalControls":32,"totalAssets":12,"failedAssets":1},{"id":"sub-005b","name":"Switches","passedControls":32,"totalControls":33,"totalAssets":48,"failedAssets":2},{"id":"sub-005c","name":"Routers","passedControls":26,"totalControls":30,"totalAssets":20,"failedAssets":3}]}');
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-005a', 'sys-005', 'Firewalls', 32, 30, 12, 1);
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-005b', 'sys-005', 'Switches', 33, 32, 48, 2);
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-005c', 'sys-005', 'Routers', 30, 26, 20, 3);
INSERT INTO compliance_systems (id, name, type, data_json) VALUES ('sys-006', 'Databases', 'database', '{"id":"sys-006","name":"Databases","type":"database","owner":"Data Platform","environment":"Production","totalControls":0,"passedControls":0,"lastAssessmentDate":"2026-07-10","notes":"Encryption at rest missing on 2 analytics clusters.","subcategories":[{"id":"sub-006a","name":"PostgreSQL Clusters","passedControls":30,"totalControls":40,"totalAssets":14,"failedAssets":3},{"id":"sub-006b","name":"MSSQL Clusters","passedControls":26,"totalControls":40,"totalAssets":10,"failedAssets":4},{"id":"sub-006c","name":"Analytics Warehouses","passedControls":23,"totalControls":40,"totalAssets":6,"failedAssets":2}]}');
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-006a', 'sys-006', 'PostgreSQL Clusters', 40, 30, 14, 3);
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-006b', 'sys-006', 'MSSQL Clusters', 40, 26, 10, 4);
INSERT INTO compliance_subcategories (id, system_id, name, total_controls, passed_controls, total_assets, failed_assets) VALUES ('sub-006c', 'sys-006', 'Analytics Warehouses', 40, 23, 6, 2);
INSERT INTO events (id, title, start_at, end_at, category, status, priority, data_json) VALUES ('3', 'GDPR Compliance Review', '2026-07-28T14:00:15.106Z', '2026-07-28T16:30:15.106Z', 'compliance', 'confirmed', 'high', '{"id":"3","title":"GDPR Compliance Review","description":"Quarterly review of data protection practices, consent management, and data subject request handling procedures.","category":"compliance","startDate":"2026-07-28T14:00:15.106Z","endDate":"2026-07-28T16:30:15.106Z","allDay":false,"status":"confirmed","priority":"high","owner":"Lisa Anderson","department":"Legal","attendees":[{"id":"a7","name":"Lisa Anderson","email":"l.anderson@company.com","role":"DPO"},{"id":"a8","name":"Mark Stevens","email":"m.stevens@company.com","role":"Legal Counsel"}],"checklist":[{"id":"c8","text":"Review consent mechanisms","completed":true},{"id":"c9","text":"Audit data retention policies","completed":true},{"id":"c10","text":"Update privacy impact assessments","completed":false}],"attachments":[],"notes":"","isConfidential":false,"recurrence":"monthly","reminders":[1440]}');
INSERT INTO events (id, title, start_at, end_at, category, status, priority, data_json) VALUES ('4', 'Team Standup', '2026-07-26T09:30:15.106Z', '2026-07-26T09:45:15.106Z', 'meetings', 'completed', 'low', '{"id":"4","title":"Team Standup","description":"Daily engineering team synchronization meeting to discuss progress, blockers, and priorities.","category":"meetings","startDate":"2026-07-26T09:30:15.106Z","endDate":"2026-07-26T09:45:15.106Z","allDay":false,"status":"completed","priority":"low","owner":"Alex Kumar","department":"Engineering","attendees":[{"id":"a9","name":"Alex Kumar","email":"a.kumar@company.com","role":"Tech Lead"},{"id":"a10","name":"Engineering Team","email":"eng-team@company.com","role":"Team"}],"checklist":[],"attachments":[],"notes":"","isConfidential":false,"recurrence":"daily","reminders":[15]}');
INSERT INTO events (id, title, start_at, end_at, category, status, priority, data_json) VALUES ('5', 'ISO 27001 Certification Deadline', '2026-07-26T00:00:00.000Z', '2026-07-26T23:59:00.000Z', 'compliance', 'planned', 'high', '{"id":"5","title":"ISO 27001 Certification Deadline","description":"Final deadline for submitting all documentation required for ISO 27001 information security certification.","category":"compliance","startDate":"2026-07-26T00:00:00.000Z","endDate":"2026-07-26T23:59:00.000Z","allDay":true,"status":"planned","priority":"high","owner":"James Mitchell","department":"IT Security","attendees":[{"id":"a5","name":"James Mitchell","email":"j.mitchell@company.com","role":"CISO"}],"checklist":[{"id":"c11","text":"Complete risk assessment","completed":true},{"id":"c12","text":"Finalize policies documentation","completed":true},{"id":"c13","text":"Submit certification application","completed":false}],"attachments":[{"id":"f4","name":"ISO-27001-Checklist.xlsx","type":"xlsx","size":450000,"url":"#"}],"notes":"Critical deadline - no extensions possible.","isConfidential":false,"recurrence":"none","reminders":[10080,4320,1440]}');
INSERT INTO events (id, title, start_at, end_at, category, status, priority, data_json) VALUES ('6', 'Fire Safety Training', '2026-07-21T13:00:00.000Z', '2026-07-21T15:00:00.000Z', 'training', 'confirmed', 'medium', '{"id":"6","title":"Fire Safety Training","description":"Mandatory fire safety and evacuation training for all floor wardens and safety officers.","category":"training","startDate":"2026-07-21T13:00:00.000Z","endDate":"2026-07-21T15:00:00.000Z","allDay":false,"status":"confirmed","priority":"medium","owner":"Robert Garcia","department":"Facilities","attendees":[{"id":"a11","name":"Robert Garcia","email":"r.garcia@company.com","role":"Facilities Manager"},{"id":"a12","name":"Floor Wardens","email":"wardens@company.com","role":"Safety Team"}],"checklist":[{"id":"c14","text":"Confirm attendance list","completed":true},{"id":"c15","text":"Prepare training materials","completed":false},{"id":"c16","text":"Reserve training room","completed":true}],"attachments":[],"notes":"Location: Training Room B, Ground Floor","isConfidential":false,"recurrence":"yearly","reminders":[4320,60]}');
INSERT INTO events (id, title, start_at, end_at, category, status, priority, data_json) VALUES ('9', 'Client Project Kickoff', '2026-07-29T11:00:15.106Z', '2026-07-29T12:30:15.106Z', 'meetings', 'confirmed', 'high', '{"id":"9","title":"Client Project Kickoff","description":"Initial kickoff meeting with Acme Corp for the digital transformation project.","category":"meetings","startDate":"2026-07-29T11:00:15.106Z","endDate":"2026-07-29T12:30:15.106Z","allDay":false,"status":"confirmed","priority":"high","owner":"Jennifer Wu","department":"Operations","attendees":[{"id":"a3","name":"Jennifer Wu","email":"j.wu@company.com","role":"COO"},{"id":"a14","name":"Project Team","email":"project-team@company.com","role":"Team"},{"id":"a15","name":"Acme Corp Representatives","email":"contact@acme.com","role":"Client"}],"checklist":[{"id":"c23","text":"Prepare project charter","completed":true},{"id":"c24","text":"Set up project management tools","completed":true},{"id":"c25","text":"Create initial timeline","completed":false}],"attachments":[{"id":"f5","name":"Project-Charter-Acme.pdf","type":"pdf","size":890000,"url":"#"}],"notes":"Video call - link in calendar invite.","isConfidential":false,"recurrence":"none","reminders":[1440,60]}');
INSERT INTO events (id, title, start_at, end_at, category, status, priority, data_json) VALUES ('10', 'Financial Audit Preparation', '2026-07-29T09:00:00.000Z', '2026-07-29T11:00:00.000Z', 'audits', 'planned', 'medium', '{"id":"10","title":"Financial Audit Preparation","description":"Internal preparation meeting for upcoming external financial audit.","category":"audits","startDate":"2026-07-29T09:00:00.000Z","endDate":"2026-07-29T11:00:00.000Z","allDay":false,"status":"planned","priority":"medium","owner":"Michael Roberts","department":"Finance","attendees":[{"id":"a2","name":"Michael Roberts","email":"m.roberts@company.com","role":"CFO"},{"id":"a16","name":"Finance Team","email":"finance@company.com","role":"Team"}],"checklist":[{"id":"c26","text":"Organize financial records","completed":false},{"id":"c27","text":"Review internal controls","completed":false},{"id":"c28","text":"Prepare audit workspace","completed":false}],"attachments":[],"notes":"","isConfidential":true,"recurrence":"none","reminders":[4320]}');
INSERT INTO events (id, title, start_at, end_at, category, status, priority, data_json) VALUES ('11', 'New Employee Orientation', '2026-07-06T09:00:00.000Z', '2026-07-06T12:00:00.000Z', 'training', 'completed', 'medium', '{"id":"11","title":"New Employee Orientation","description":"Compliance and security orientation for new hires joining this month.","category":"training","startDate":"2026-07-06T09:00:00.000Z","endDate":"2026-07-06T12:00:00.000Z","allDay":false,"status":"completed","priority":"medium","owner":"HR Department","department":"Human Resources","attendees":[{"id":"a17","name":"HR Team","email":"hr@company.com","role":"HR"}],"checklist":[{"id":"c29","text":"Prepare welcome packets","completed":true},{"id":"c30","text":"Set up training room","completed":true},{"id":"c31","text":"Review compliance materials","completed":true}],"attachments":[],"notes":"Location: Conference Room A","isConfidential":false,"recurrence":"monthly","reminders":[1440]}');
INSERT INTO events (id, title, start_at, end_at, category, status, priority, data_json) VALUES ('12', 'Strategic Planning Session', '2026-08-06T09:00:00.000Z', '2026-08-06T17:00:00.000Z', 'meetings', 'planned', 'high', '{"id":"12","title":"Strategic Planning Session","description":"Annual strategic planning workshop to define goals and priorities for the upcoming year.","category":"meetings","startDate":"2026-08-06T09:00:00.000Z","endDate":"2026-08-06T17:00:00.000Z","allDay":true,"status":"planned","priority":"high","owner":"Sarah Chen","department":"Executive","attendees":[{"id":"a1","name":"Sarah Chen","email":"sarah.chen@company.com","role":"CEO"},{"id":"a2","name":"Michael Roberts","email":"m.roberts@company.com","role":"CFO"},{"id":"a3","name":"Jennifer Wu","email":"j.wu@company.com","role":"COO"},{"id":"a4","name":"David Thompson","email":"d.thompson@company.com","role":"CTO"}],"checklist":[],"attachments":[],"notes":"Off-site location TBD","isConfidential":true,"recurrence":"yearly","reminders":[10080,1440]}');
COMMIT;
