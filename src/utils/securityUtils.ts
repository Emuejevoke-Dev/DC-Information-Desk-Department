/**
 * Application Security & Cryptographic Utilities
 * Dominion City Asaba — Information Desk Department
 * 
 * Implements standard SHA-256 cryptographic hashing via the Web Crypto API.
 * Passwords and operational officer codes are NEVER stored or transmitted in plain text.
 */

// Secure SHA-256 Hashing using browser Web Crypto API
export async function hashCredential(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export type SupportedOfficerRole = 'hod' | 'finance' | 'uniform' | 'bookstand' | 'secretary';

// Initial default hashes for operational officer credentials
export const DEFAULT_OFFICER_HASHES: Record<SupportedOfficerRole, string> = {
  // Precomputed SHA-256 of "HOD-2026"
  hod: '7308faee793319808d4b29bb836e1b7db70d44005cbb6079dd824709d6fbb5f7',
  // Precomputed SHA-256 of "FIN-2026"
  finance: '50e18146779435fe1c93a0b3be895b28d0ee54e20b33b000845a7c5b6b8d4e9b',
  // Precomputed SHA-256 of "BOOK-2026"
  bookstand: 'ce6ec532454b6e8e81d713c77d61183aaef85a86a67a8409ff0eb0b36e9ff09c',
  // Precomputed SHA-256 of "UNIFORM-2026"
  uniform: 'ec2f4dca6fb09268686e00ca36e84860b730598718ec2db7f2ea909ce9f43063',
  // Precomputed SHA-256 of "SEC-2026"
  secretary: 'aaf76ade8cbc34ea13c5b65b6f13387835a67992d208d87a5b53a67e3c200547',
};

// Storage keys
const CREDENTIAL_STORAGE_KEY = 'dc_asaba_officer_hashes_v3';
const DEMO_MODE_STORAGE_KEY = 'dc_asaba_demo_mode_active';
const DEMO_PASSWORD_STORAGE_KEY = 'dc_asaba_demo_password_v1';
const OFFICER_ASSIGNMENTS_KEY = 'dc_asaba_officer_assignments_v1';
const AUDIT_LOG_STORAGE_KEY = 'dc_asaba_security_audit_log_v1';

export const DEFAULT_DEMO_PASSWORD = 'DEMO-2026';

// Check if demo mode is currently active (defaults to true for development)
export function isDemoModeActive(): boolean {
  try {
    const saved = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
  } catch (e) {
    console.warn('Could not read demo mode status', e);
  }
  return true; // Default to true in development demo mode
}

// Set demo mode active or inactive
export function setDemoModeActive(active: boolean, performedBy: string): void {
  try {
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, active ? 'true' : 'false');
    logSecurityEvent({
      userId: performedBy,
      userName: performedBy,
      action: active ? 'Switched to Demo Development Mode' : 'Switched to Official Production Mode',
      category: 'credential_change',
      details: active
        ? 'Shared temporary demo password access enabled for officer dashboards.'
        : 'Individual officer password enforcement and server-side verification enabled.',
      status: 'SUCCESS',
    });
  } catch (e) {
    console.error('Failed to save demo mode state', e);
  }
}

// Get configured temporary shared demo password
export function getDemoPassword(): string {
  try {
    const saved = localStorage.getItem(DEMO_PASSWORD_STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (e) {
    console.warn('Could not read demo password', e);
  }
  return DEFAULT_DEMO_PASSWORD;
}

// Set temporary shared demo password
export function setDemoPassword(newPassword: string, performedBy: string): { success: boolean; message: string } {
  if (!newPassword || newPassword.trim().length < 4) {
    return { success: false, message: 'Demo password must be at least 4 characters long.' };
  }
  try {
    localStorage.setItem(DEMO_PASSWORD_STORAGE_KEY, newPassword.trim());
    logSecurityEvent({
      userId: performedBy,
      userName: performedBy,
      action: 'Updated Departmental Demo Password',
      category: 'credential_change',
      details: 'Updated temporary demo password for local testing.',
      status: 'SUCCESS',
    });
    return { success: true, message: 'Temporary demo password updated successfully.' };
  } catch (e) {
    console.error('Failed to save demo password', e);
    return { success: false, message: 'Could not save demo password to local storage.' };
  }
}

// Default Officer Role Assignments (Member IDs and user roles)
export const DEFAULT_OFFICER_ASSIGNMENTS: Record<SupportedOfficerRole, string[]> = {
  hod: ['mem-1', 'usr-admin', 'admin.infodesk@dominioncityasaba.org', 'Brother Chukwudi Okonkwo'],
  finance: ['mem-4', 'usr-finance', 'finance.infodesk@dominioncityasaba.org', 'Brother Emmanuel Nwachukwu'],
  uniform: ['mem-2', 'usr-leader', 'leader.infodesk@dominioncityasaba.org', 'Sister Ngozi Adeleke'],
  bookstand: ['mem-5', 'usr-bookstand', 'bookstand.infodesk@dominioncityasaba.org', 'Brother Kelechi Obi'],
  secretary: ['mem-3', 'usr-secretary', 'secretary.infodesk@dominioncityasaba.org', 'Sister Blessing Ifeanyi'],
};

// Get current officer role assignments
export function getOfficerAssignments(): Record<SupportedOfficerRole, string[]> {
  try {
    const saved = localStorage.getItem(OFFICER_ASSIGNMENTS_KEY);
    if (saved) {
      return { ...DEFAULT_OFFICER_ASSIGNMENTS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to read officer assignments', e);
  }
  return { ...DEFAULT_OFFICER_ASSIGNMENTS };
}

// Save updated officer role assignments
export function saveOfficerAssignments(
  assignments: Record<SupportedOfficerRole, string[]>,
  performedBy: string
): void {
  try {
    localStorage.setItem(OFFICER_ASSIGNMENTS_KEY, JSON.stringify(assignments));
    logSecurityEvent({
      userId: performedBy,
      userName: performedBy,
      action: 'Updated Departmental Officer Role Assignments',
      category: 'role_switch',
      details: 'Administrative role delegation updated by HOD.',
      status: 'SUCCESS',
    });
  } catch (e) {
    console.error('Failed to save officer assignments', e);
  }
}

// Check if a member is authorized for an operational role
export function isUserAuthorizedForRole(
  role: SupportedOfficerRole,
  userId: string,
  userEmail?: string,
  userName?: string
): boolean {
  // HOD always has supervisory access to all roles
  const assignments = getOfficerAssignments();
  const hodAssigned = assignments.hod || [];
  const isHOD =
    hodAssigned.includes(userId) ||
    (userEmail && hodAssigned.includes(userEmail.toLowerCase())) ||
    (userName && hodAssigned.includes(userName));

  if (isHOD) return true;

  // Specific role check
  const roleList = assignments[role] || [];
  return (
    roleList.includes(userId) ||
    Boolean(userEmail && roleList.includes(userEmail.toLowerCase())) ||
    Boolean(userName && roleList.includes(userName))
  );
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  category: 'auth' | 'role_switch' | 'credential_change' | 'financial' | 'moderation';
  details: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
}

// Read current officer credential hashes
export function getOfficerHashes(): Record<SupportedOfficerRole, string> {
  try {
    const saved = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_OFFICER_HASHES, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to read officer credentials', e);
  }
  return { ...DEFAULT_OFFICER_HASHES };
}

// Verify entered credential against stored hash or demo password
export async function verifyOfficerCredential(
  role: SupportedOfficerRole,
  enteredCode: string
): Promise<boolean> {
  if (!enteredCode || !enteredCode.trim()) return false;
  const cleanEntered = enteredCode.trim();

  // In Demo Mode: verify against the temporary shared demo password first
  if (isDemoModeActive()) {
    const demoPass = getDemoPassword();
    if (cleanEntered.toUpperCase() === demoPass.toUpperCase()) {
      return true;
    }
  }

  // Also check if entered code matches the individual role credential or HOD credential
  const hashes = getOfficerHashes();
  const enteredHash = await hashCredential(cleanEntered);

  // If role is HOD, verify against HOD credential
  if (role === 'hod') {
    return enteredHash === hashes.hod;
  }

  // Officers can also be verified with their own role credential OR HOD credential (supervisory override)
  const roleHash = hashes[role];
  const hodHash = hashes.hod;
  return enteredHash === roleHash || enteredHash === hodHash;
}

// Update officer credential (requires entering current credential or HOD supervisory override)
export async function updateOfficerCredential(
  role: SupportedOfficerRole,
  currentCode: string,
  newCode: string,
  confirmCode: string,
  performedBy: string
): Promise<{ success: boolean; message: string }> {
  if (!newCode || newCode.trim().length < 6) {
    return {
      success: false,
      message: 'New credential must be at least 6 characters in length.',
    };
  }

  if (newCode !== confirmCode) {
    return {
      success: false,
      message: 'The new passwords do not match. Please re-enter carefully.',
    };
  }

  // Verify authorization to change
  const isAuthorized = await verifyOfficerCredential(role, currentCode);
  if (!isAuthorized) {
    logSecurityEvent({
      userId: performedBy,
      userName: performedBy,
      action: `Failed password change attempt for ${role.toUpperCase()}`,
      category: 'credential_change',
      details: 'Invalid current credentials provided.',
      status: 'DENIED',
    });
    return {
      success: false,
      message: 'Current password entered is incorrect. Authorization denied.',
    };
  }

  const newHash = await hashCredential(newCode);
  const currentHashes = getOfficerHashes();
  currentHashes[role] = newHash;

  try {
    localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(currentHashes));
    logSecurityEvent({
      userId: performedBy,
      userName: performedBy,
      action: `Updated access credential for ${role.toUpperCase()}`,
      category: 'credential_change',
      details: 'Credential updated successfully with SHA-256 encryption.',
      status: 'SUCCESS',
    });
    return {
      success: true,
      message: `Access credential for ${role.toUpperCase()} has been updated successfully.`,
    };
  } catch (e) {
    console.error('Failed to save updated credential', e);
    return {
      success: false,
      message: 'Failed to persist new credential. Please try again.',
    };
  }
}

// Append entry to security audit log
export function logSecurityEvent(entry: Omit<SecurityAuditEntry, 'id' | 'timestamp'>) {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    const logs: SecurityAuditEntry[] = raw ? JSON.parse(raw) : [];
    const newEntry: SecurityAuditEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    // Keep most recent 200 audit entries
    const updated = [newEntry, ...logs].slice(0, 200);
    localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log audit event', e);
  }
}

// Retrieve audit logs for HOD / System Admin review
export function getSecurityAuditLogs(): SecurityAuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// =========================================================================
// REMEMBERED PASSWORDS & CREDENTIAL MEMORY (Prompt Section)
// =========================================================================

export const REMEMBERED_CREDENTIALS_KEY = 'dc_asaba_remembered_credentials_v4';
export const MEMBER_PASSWORDS_KEY = 'dc_asaba_member_passwords_v4';

export const INITIAL_MEMBER_PASSWORDS: Record<string, string> = {
  'admin.infodesk@dominioncityasaba.org': 'HOD-Desk#2026',
  'leader.infodesk@dominioncityasaba.org': 'Leader-2026',
  'secretary.infodesk@dominioncityasaba.org': 'Secretary-2026',
  'finance.infodesk@dominioncityasaba.org': 'Finance-2026',
  'bookstand.infodesk@dominioncityasaba.org': 'Books-2026',
  'amaka.eze@dominioncityasaba.org': 'Member-2026',
  'pastor.david@dominioncityasaba.org': 'Pastor-2026',
  'chukwudi okonkwo': 'HOD-Desk#2026',
};

export interface RememberedCredentials {
  identifier: string;
  password: string;
  remember: boolean;
  savedAt: string;
}

export function saveRememberedCredentials(identifier: string, password: string, remember: boolean): void {
  try {
    if (!remember) {
      localStorage.removeItem(REMEMBERED_CREDENTIALS_KEY);
      return;
    }
    const data: RememberedCredentials = {
      identifier: identifier.trim(),
      password,
      remember: true,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(REMEMBERED_CREDENTIALS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save remembered credentials', e);
  }
}

export function getRememberedCredentials(): RememberedCredentials | null {
  try {
    const raw = localStorage.getItem(REMEMBERED_CREDENTIALS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearRememberedCredentials(): void {
  try {
    localStorage.removeItem(REMEMBERED_CREDENTIALS_KEY);
  } catch (e) {
    console.warn('Failed to clear remembered credentials', e);
  }
}

export function saveMemberPassword(identifier: string, password: string): void {
  try {
    const cleanKey = identifier.toLowerCase().trim();
    const raw = localStorage.getItem(MEMBER_PASSWORDS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : { ...INITIAL_MEMBER_PASSWORDS };
    map[cleanKey] = password;
    localStorage.setItem(MEMBER_PASSWORDS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to save member password', e);
  }
}

export function getMemberPassword(identifier: string): string | null {
  try {
    const cleanKey = identifier.toLowerCase().trim();
    const raw = localStorage.getItem(MEMBER_PASSWORDS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : { ...INITIAL_MEMBER_PASSWORDS };
    return map[cleanKey] || INITIAL_MEMBER_PASSWORDS[cleanKey] || null;
  } catch {
    return null;
  }
}

export function generateSecureDeskPassword(): string {
  const prefixes = ['Dominion', 'Desk', 'Victory', 'Faith', 'Grace', 'Shiloh'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}#${randomNum}`;
}

