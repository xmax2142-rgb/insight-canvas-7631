export type RemediationStatus = 'open' | 'in_progress' | 'pending_review' | 'closed';
export type RemediationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface RemediationItem {
  id: string;
  findingId: string;
  title: string;
  description: string;
  priority: RemediationPriority;
  status: RemediationStatus;
  assignedTo: string;
  assignedToName: string;
  createdDate: string;
  dueDate: string;
  closedDate?: string;
  category: string;
  affectedSystems: string[];
  comments: Comment[];
  attachments: Attachment[];
}

export interface Comment {
  id: string;
  author: string;
  authorRole: 'admin' | 'proponent';
  content: string;
  timestamp: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'proponent';
}

// Mock users
export const mockUsers: User[] = [
  { id: '1', name: 'Saeed', email: 'saeed@company.com', role: 'admin' },
  { id: '2', name: 'Isa Sunat', email: 'isa.sunat@company.com', role: 'admin' },
  { id: '3', name: 'Mohammed Kahtani', email: 'mohammed.kahtani@company.com', role: 'proponent' },
];

// Mock remediation items
export const mockRemediationItems: RemediationItem[] = [
  {
    id: 'REM-001',
    findingId: 'FIND-2024-0045',
    title: 'Implement Multi-Factor Authentication for Admin Access',
    description: 'Current admin portal lacks MFA, creating vulnerability for unauthorized access. Implement MFA using authenticator apps or hardware tokens.',
    priority: 'critical',
    status: 'in_progress',
    assignedTo: '3',
    assignedToName: 'Mohammed Kahtani',
    createdDate: '2024-01-15',
    dueDate: '2024-02-15',
    category: 'Access Control',
    affectedSystems: ['Admin Portal', 'Identity Management System'],
    comments: [
      {
        id: 'c1',
        author: 'Saeed',
        authorRole: 'admin',
        content: 'This is high priority. Please update with your implementation plan by end of week.',
        timestamp: '2024-01-16T10:30:00Z',
      },
      {
        id: 'c2',
        author: 'Mohammed Kahtani',
        authorRole: 'proponent',
        content: 'Evaluating MFA solutions. Will have proposal ready by Friday.',
        timestamp: '2024-01-17T14:20:00Z',
      },
    ],
    attachments: [
      {
        id: 'a1',
        name: 'mfa-implementation-plan.pdf',
        size: '245 KB',
        uploadedBy: 'Mohammed Kahtani',
        uploadedDate: '2024-01-20',
      },
    ],
  },
  {
    id: 'REM-002',
    findingId: 'FIND-2024-0052',
    title: 'Patch Outdated SSL/TLS Configuration',
    description: 'Web servers using deprecated TLS 1.0 and 1.1 protocols. Upgrade to TLS 1.2 minimum, preferably TLS 1.3.',
    priority: 'high',
    status: 'pending_review',
    assignedTo: '3',
    assignedToName: 'Mohammed Kahtani',
    createdDate: '2024-01-20',
    dueDate: '2024-02-20',
    category: 'Network Security',
    affectedSystems: ['Web Server Cluster', 'Load Balancer'],
    comments: [
      {
        id: 'c3',
        author: 'Mohammed Kahtani',
        authorRole: 'proponent',
        content: 'TLS configuration updated on all servers. Ready for review.',
        timestamp: '2024-02-10T09:15:00Z',
      },
    ],
    attachments: [
      {
        id: 'a2',
        name: 'tls-config-changes.txt',
        size: '12 KB',
        uploadedBy: 'Mohammed Kahtani',
        uploadedDate: '2024-02-10',
      },
      {
        id: 'a3',
        name: 'ssl-scan-results-after.pdf',
        size: '892 KB',
        uploadedBy: 'Mohammed Kahtani',
        uploadedDate: '2024-02-10',
      },
    ],
  },
  {
    id: 'REM-003',
    findingId: 'FIND-2024-0038',
    title: 'Update Password Policy Requirements',
    description: 'Current password policy allows weak passwords. Update to require minimum 12 characters, complexity requirements, and password history.',
    priority: 'medium',
    status: 'open',
    assignedTo: '3',
    assignedToName: 'Mohammed Kahtani',
    createdDate: '2024-01-10',
    dueDate: '2024-03-10',
    category: 'Access Control',
    affectedSystems: ['Active Directory', 'User Portal'],
    comments: [],
    attachments: [],
  },
  {
    id: 'REM-004',
    findingId: 'FIND-2024-0067',
    title: 'Enable Database Encryption at Rest',
    description: 'Production databases storing PII/PHI lack encryption at rest. Enable transparent data encryption (TDE).',
    priority: 'critical',
    status: 'open',
    assignedTo: '3',
    assignedToName: 'Mohammed Kahtani',
    createdDate: '2024-02-01',
    dueDate: '2024-03-01',
    category: 'Data Protection',
    affectedSystems: ['Customer Database', 'Financial Database'],
    comments: [
      {
        id: 'c4',
        author: 'Isa Sunat',
        authorRole: 'admin',
        content: 'This needs immediate attention due to compliance requirements.',
        timestamp: '2024-02-02T11:00:00Z',
      },
    ],
    attachments: [],
  },
  {
    id: 'REM-005',
    findingId: 'FIND-2024-0071',
    title: 'Implement Automated Security Patching Process',
    description: 'No automated patching process in place. Implement automated patch management for OS and application updates.',
    priority: 'high',
    status: 'in_progress',
    assignedTo: '3',
    assignedToName: 'Mohammed Kahtani',
    createdDate: '2024-02-05',
    dueDate: '2024-03-15',
    category: 'Vulnerability Management',
    affectedSystems: ['All Servers', 'Workstations'],
    comments: [
      {
        id: 'c5',
        author: 'Mohammed Kahtani',
        authorRole: 'proponent',
        content: 'Researching patch management solutions. Considering WSUS and third-party tools.',
        timestamp: '2024-02-08T15:45:00Z',
      },
    ],
    attachments: [],
  },
  {
    id: 'REM-006',
    findingId: 'FIND-2024-0023',
    title: 'Configure Logging and Monitoring for Critical Systems',
    description: 'Insufficient logging and monitoring on critical systems. Implement SIEM solution and configure alerting.',
    priority: 'medium',
    status: 'closed',
    assignedTo: '3',
    assignedToName: 'Mohammed Kahtani',
    createdDate: '2023-12-15',
    dueDate: '2024-01-31',
    closedDate: '2024-01-28',
    category: 'Monitoring & Logging',
    affectedSystems: ['Firewall', 'IDS/IPS', 'Database Servers'],
    comments: [
      {
        id: 'c6',
        author: 'Mohammed Kahtani',
        authorRole: 'proponent',
        content: 'SIEM deployed and configured. All critical systems now logging to central system.',
        timestamp: '2024-01-28T16:20:00Z',
      },
      {
        id: 'c7',
        author: 'Saeed',
        authorRole: 'admin',
        content: 'Verified implementation. Closing this item.',
        timestamp: '2024-01-29T09:00:00Z',
      },
    ],
    attachments: [
      {
        id: 'a4',
        name: 'siem-configuration.pdf',
        size: '1.2 MB',
        uploadedBy: 'Mohammed Kahtani',
        uploadedDate: '2024-01-28',
      },
    ],
  },
];
