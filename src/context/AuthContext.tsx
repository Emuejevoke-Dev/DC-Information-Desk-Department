import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DepartmentMember } from '../types/models';
import { INITIAL_USERS, INITIAL_MEMBERS } from '../data/initialData';
import {
  SupportedOfficerRole,
  verifyOfficerCredential,
  logSecurityEvent,
  updateOfficerCredential,
  isDemoModeActive,
  setDemoModeActive,
  getDemoPassword,
  setDemoPassword,
  isUserAuthorizedForRole,
  getOfficerAssignments,
  saveOfficerAssignments,
  saveRememberedCredentials,
  getRememberedCredentials,
  saveMemberPassword,
  getMemberPassword,
  RememberedCredentials,
} from '../utils/securityUtils';

// The 5 official departmental operational roles (Department Member is NOT a separate operational role)
export type OperationalRole = 'hod' | 'finance' | 'uniform' | 'bookstand' | 'secretary';

export interface NewMemberRegistration {
  fullName: string;
  email: string;
  phone: string;
  departmentRole: string;
  password: string;
  rememberPassword?: boolean;
}

export interface OperationalRoleDetails {
  id: OperationalRole;
  title: string;
  badgeLabel: string;
  badgeClass: string;
  description: string;
  iconName: string;
  workspaceTab: string;
}

export const OPERATIONAL_ROLES_INFO: Record<OperationalRole, OperationalRoleDetails> = {
  hod: {
    id: 'hod',
    title: 'Department Leader (HOD)',
    badgeLabel: 'Department Leader / HOD',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    description: 'Executive supervisory oversight across all department areas: finance, book stand, uniforms, members, rosters, reports & attendance.',
    iconName: 'Crown',
    workspaceTab: 'dashboard',
  },
  finance: {
    id: 'finance',
    title: 'Finance Officer',
    badgeLabel: 'Finance Desk',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Authorized management of financial ledger, income, expenses, bank receipts, welfare dues and debt records.',
    iconName: 'Wallet',
    workspaceTab: 'finance-workspace',
  },
  uniform: {
    id: 'uniform',
    title: 'Uniform Leader',
    badgeLabel: 'Uniform Desk',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    description: 'Private outfit management workspace: Sunday dress codes, Nigerian church attire plans, photo guides & schedule publishing.',
    iconName: 'Shirt',
    workspaceTab: 'uniform-workspace',
  },
  bookstand: {
    id: 'bookstand',
    title: 'Book Stand',
    badgeLabel: 'Book Stand Desk',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    description: 'Manages book catalogue, sales transactions, stock deliveries, damaged books and debtor balances.',
    iconName: 'ShoppingBag',
    workspaceTab: 'bookstand-workspace',
  },
  secretary: {
    id: 'secretary',
    title: 'Department Secretary',
    badgeLabel: 'Secretary Desk',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
    description: 'Departmental documentation, service attendance registers, service reports, minutes and meeting rosters.',
    iconName: 'ClipboardList',
    workspaceTab: 'secretary-workspace',
  },
};

interface AuthContextType {
  // Authentication State
  isAuthenticated: boolean;
  currentUser: User;
  allUsers: User[];
  rememberedCredentials: RememberedCredentials | null;

  // Operational Role State
  activeOperationalRole: OperationalRole | null;
  isOperationalRoleActive: boolean;

  // Demo Mode State
  isDemoMode: boolean;
  demoPassword: string;
  toggleDemoMode: (active: boolean) => void;
  updateDemoPasswordSetting: (newPass: string) => { success: boolean; message: string };

  // Authentication Actions
  login: (emailOrPhone: string, password?: string, rememberPassword?: boolean) => { success: boolean; message: string };
  register: (data: NewMemberRegistration) => { success: boolean; message: string };
  logout: () => void;
  setCurrentUser: (user: User) => void;

  // Operational Role Switching
  requestOperationalRole: (
    role: OperationalRole,
    credential?: string
  ) => Promise<{ success: boolean; message: string }>;
  exitOperationalRole: () => void;
  updateOfficerPassword: (
    role: OperationalRole,
    currentCode: string,
    newCode: string,
    confirmCode: string
  ) => Promise<{ success: boolean; message: string }>;

  // Officer assignments management
  officerAssignments: Record<OperationalRole, string[]>;
  saveAssignments: (assignments: Record<OperationalRole, string[]>) => void;

  // Granular Permission Checks
  canViewFinances: boolean;
  canManageFinances: boolean;
  canViewBookstand: boolean;
  canManageBookstand: boolean;
  canManageUniforms: boolean;
  canManageMembers: boolean;
  canManageAttendance: boolean;
  canManageReports: boolean;
  canManageHandbook: boolean;
  canManageEvents: boolean;
  canManageForms: boolean;
  canManageRosters: boolean;
  canViewConfidentialData: boolean;
  canSuperviseAll: boolean;
  isHOD: boolean;
  isFinance: boolean;
  isUniform: boolean;
  isBookstand: boolean;
  isSecretary: boolean;
  isVisitor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'dc_asaba_auth_user_v2';
const AUTH_TOKEN_KEY = 'dc_asaba_auth_session_active';
const OPERATIONAL_ROLE_KEY = 'dc_asaba_active_op_role_v3';
const USERS_STORAGE_KEY = 'dc_asaba_users_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved users', e);
    }
    return INITIAL_USERS;
  });

  // Demo Mode state
  const [isDemoMode, setIsDemoMode] = useState<boolean>(isDemoModeActive);
  const [demoPassword, setDemoPasswordState] = useState<string>(getDemoPassword);
  const [officerAssignments, setOfficerAssignmentsState] = useState<Record<OperationalRole, string[]>>(
    getOfficerAssignments
  );

  // Password memory state (stores last remembered login/signup credentials)
  const [rememberedCredentials, setRememberedCredentials] = useState<RememberedCredentials | null>(() => {
    return getRememberedCredentials();
  });

  // Authentication session state:
  // Starts directly from the Sign Up / Authentication page whenever the site is opened/clicked
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Current authenticated member
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved user', e);
    }
    return INITIAL_USERS[0];
  });

  // Active operational role (null when viewing as ordinary department member)
  const [activeOperationalRole, setActiveOperationalRole] = useState<OperationalRole | null>(() => {
    try {
      const savedRole = localStorage.getItem(OPERATIONAL_ROLE_KEY) as OperationalRole;
      if (savedRole && OPERATIONAL_ROLES_INFO[savedRole]) {
        return savedRole;
      }
    } catch (e) {
      console.error('Failed to parse operational role', e);
    }
    return null;
  });

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  };

  const toggleDemoMode = (active: boolean) => {
    setIsDemoMode(active);
    setDemoModeActive(active, currentUser.name);
  };

  const updateDemoPasswordSetting = (newPass: string) => {
    const res = setDemoPassword(newPass, currentUser.name);
    if (res.success) {
      setDemoPasswordState(newPass.trim());
    }
    return res;
  };

  const saveAssignments = (assignments: Record<OperationalRole, string[]>) => {
    setOfficerAssignmentsState(assignments);
    saveOfficerAssignments(assignments, currentUser.name);
  };

  // Helper to normalize phone numbers
  const normalizePhone = (raw?: string): string => {
    if (!raw) return '';
    let cleaned = raw.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('234') && cleaned.length > 10) {
      cleaned = '0' + cleaned.slice(3);
    }
    if (cleaned.length === 10 && (cleaned.startsWith('7') || cleaned.startsWith('8') || cleaned.startsWith('9'))) {
      cleaned = '0' + cleaned;
    }
    return cleaned;
  };

  // New Member Registration with Automatic Password Memory Retention
  const register = (data: NewMemberRegistration): { success: boolean; message: string } => {
    const fullName = data.fullName.trim();
    const email = data.email.trim();
    const phone = data.phone.trim();
    const password = data.password.trim();
    const departmentRole = data.departmentRole?.trim() || 'Information Desk Member';
    const rememberPassword = data.rememberPassword !== false;

    if (!fullName) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!email && !phone) {
      return { success: false, message: 'Please provide either a department email or phone number.' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const cleanEmail = email.toLowerCase() || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@dominioncityasaba.org`;
    const cleanPhone = normalizePhone(phone);
    const newId = `usr-${Date.now()}`;

    // 1. Save password in memory for email, phone and full name keys
    saveMemberPassword(cleanEmail, password);
    if (cleanPhone) saveMemberPassword(cleanPhone, password);
    saveMemberPassword(fullName.toLowerCase(), password);

    // 2. Remember credentials if requested
    if (rememberPassword) {
      saveRememberedCredentials(cleanEmail, password, true);
      setRememberedCredentials(getRememberedCredentials());
    }

    // 3. Create User record
    const newUser: User = {
      id: newId,
      name: fullName,
      email: cleanEmail,
      phone: phone || '',
      role: 'general_member',
      departmentRole: departmentRole,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    const updatedUsers = [newUser, ...allUsers];
    setAllUsers(updatedUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch (e) {
      console.warn('Failed to save users', e);
    }

    // 4. Save to Member Directory
    try {
      const savedMembers = localStorage.getItem('dc_asaba_members_v2');
      const directoryMembers: DepartmentMember[] = savedMembers ? JSON.parse(savedMembers) : [...INITIAL_MEMBERS];
      const newMember: DepartmentMember = {
        id: `mem-${Date.now()}`,
        fullName: fullName,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        birthDay: new Date().getDate(),
        birthMonth: new Date().getMonth() + 1,
        birthYear: 1995,
        departmentRole: departmentRole,
        occupation: 'Department Minister',
        phone: phone || '08000000000',
        email: cleanEmail,
        residentialArea: 'Asaba Central, Delta State',
        status: 'Active',
        serviceUnit: 'Information Desk',
        joinedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('dc_asaba_members_v2', JSON.stringify([newMember, ...directoryMembers]));
    } catch (e) {
      console.warn('Failed to save member to directory', e);
    }

    // 5. Authenticate user session
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setActiveOperationalRole(null);
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, 'true');
      localStorage.removeItem(OPERATIONAL_ROLE_KEY);
    } catch (e) {
      console.warn('Storage warning', e);
    }

    logSecurityEvent({
      userId: newUser.id,
      userName: newUser.name,
      action: 'Member Registered & Authenticated',
      category: 'auth',
      details: `New account registered for ${fullName} (${cleanEmail}). Password saved in local device memory.`,
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: `Welcome to Dominion City Information Desk, ${fullName}! Your account has been registered and password remembered.`,
    };
  };

  // Sign In Flow: Universal for all Department Members with Password Memory
  const login = (
    emailOrPhone: string,
    password?: string,
    rememberPassword: boolean = true
  ): { success: boolean; message: string } => {
    const rawInput = emailOrPhone ? emailOrPhone.trim() : '';
    if (!rawInput) {
      return {
        success: false,
        message: 'Please enter your department email, full name, or phone number.',
      };
    }

    const cleanInput = rawInput.toLowerCase();
    const cleanPhone = normalizePhone(rawInput);

    // 1. Check system users
    const matchedUser = allUsers.find((u) => {
      const emailMatches = u.email.toLowerCase() === cleanInput;
      const phoneMatches = Boolean(cleanPhone && normalizePhone(u.phone) === cleanPhone);
      const nameMatches = u.name.toLowerCase() === cleanInput;
      return emailMatches || phoneMatches || nameMatches;
    });

    // Check password memory
    const existingPassword = getMemberPassword(cleanInput) || (matchedUser ? getMemberPassword(matchedUser.email) : null);
    if (existingPassword && password && password.trim() && password.trim() !== existingPassword) {
      logSecurityEvent({
        userId: cleanInput,
        userName: cleanInput,
        action: 'Failed Login Attempt',
        category: 'auth',
        details: `Incorrect password entered for account (${cleanInput})`,
        status: 'FAILED',
      });
      return {
        success: false,
        message: 'Incorrect password for this account. Please verify your password or contact the Secretary.',
      };
    }

    // Helper to persist password memory & session
    const finalizeLogin = (user: User, successMsg: string) => {
      // Keep password in memory
      if (password && password.trim()) {
        saveMemberPassword(cleanInput, password.trim());
        saveMemberPassword(user.email.toLowerCase(), password.trim());
        if (cleanPhone) saveMemberPassword(cleanPhone, password.trim());
        if (rememberPassword) {
          saveRememberedCredentials(cleanInput, password.trim(), true);
          setRememberedCredentials(getRememberedCredentials());
        }
      } else if (rememberPassword && existingPassword) {
        saveRememberedCredentials(cleanInput, existingPassword, true);
        setRememberedCredentials(getRememberedCredentials());
      }

      setCurrentUser(user);
      setIsAuthenticated(true);
      setActiveOperationalRole(null);
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, 'true');
        localStorage.removeItem(OPERATIONAL_ROLE_KEY);
      } catch (e) {
        console.warn('Storage warning', e);
      }

      logSecurityEvent({
        userId: user.id,
        userName: user.name,
        action: 'Member Signed In',
        category: 'auth',
        details: `Successful sign-in as department member (${user.name}). Password memory active.`,
        status: 'SUCCESS',
      });

      return {
        success: true,
        message: successMsg,
      };
    };

    if (matchedUser) {
      return finalizeLogin(matchedUser, `Welcome back, ${matchedUser.name}. Signed in as an active department member.`);
    }

    // 2. Check Member Directory
    let directoryMembers: DepartmentMember[] = INITIAL_MEMBERS;
    try {
      const savedMembers = localStorage.getItem('dc_asaba_members_v2');
      if (savedMembers) {
        directoryMembers = JSON.parse(savedMembers);
      }
    } catch (e) {
      console.warn('Could not read saved members', e);
    }

    const matchedMember = directoryMembers.find((m) => {
      const emailMatches = Boolean(m.email && m.email.toLowerCase() === cleanInput);
      const phoneMatches = Boolean(cleanPhone && normalizePhone(m.phone) === cleanPhone);
      const nameMatches = m.fullName.toLowerCase() === cleanInput || m.fullName.toLowerCase().includes(cleanInput);
      return emailMatches || phoneMatches || nameMatches;
    });

    if (matchedMember) {
      const memberUser: User = {
        id: matchedMember.id,
        name: matchedMember.fullName,
        email: matchedMember.email || `${matchedMember.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@dominioncityasaba.org`,
        phone: matchedMember.phone,
        role: 'general_member',
        avatarUrl: matchedMember.photoUrl,
        departmentRole: matchedMember.departmentRole || 'Department Member',
      };

      return finalizeLogin(memberUser, `Welcome back, ${memberUser.name}. Signed in as an active department member.`);
    }

    // 3. Partial Name Match
    const partialMatch = allUsers.find((u) =>
      u.name.toLowerCase().includes(cleanInput) || cleanInput.includes(u.name.toLowerCase())
    );

    if (partialMatch) {
      return finalizeLogin(partialMatch, `Welcome, ${partialMatch.name}. Access granted as department member.`);
    }

    // 4. Universal Access Provisioning
    let displayName = rawInput;
    if (cleanInput.includes('@')) {
      const namePart = cleanInput.split('@')[0];
      displayName = namePart
        .split(/[._-]/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'Department Member';
    } else {
      displayName = rawInput
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: displayName,
      email: cleanInput.includes('@') ? cleanInput : `${cleanInput.replace(/[^a-z0-9]/g, '.')}@dominioncityasaba.org`,
      phone: cleanPhone ? rawInput : '',
      role: 'general_member',
      departmentRole: 'Active Department Member',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    return finalizeLogin(
      newUser,
      `Welcome to Dominion City Information Desk, ${newUser.name}! You are signed in as an active department member.`
    );
  };

  // Secure Log Out Flow
  const logout = () => {
    logSecurityEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Member Logged Out',
      category: 'auth',
      details: 'Session terminated and operational role cleared.',
      status: 'SUCCESS',
    });

    setIsAuthenticated(false);
    setActiveOperationalRole(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(OPERATIONAL_ROLE_KEY);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  };

  // Request to Switch Operational Role
  const requestOperationalRole = async (
    role: OperationalRole,
    credential?: string
  ): Promise<{ success: boolean; message: string }> => {
    const roleInfo = OPERATIONAL_ROLES_INFO[role];
    const roleTitle = roleInfo?.title || role.toUpperCase();

    // 1. Role Authorization Verification (Production & Demo Security Safeguard)
    // A user must not gain privileges simply by selecting a role and entering a password.
    // Verify that the user is authorized for the role or is the HOD.
    const isAuthorized = isUserAuthorizedForRole(role, currentUser.id, currentUser.email, currentUser.name);

    // If in demo mode and user is not explicitly assigned, in demo development we permit testing
    // if credential verifies, but we log the check and if in production mode we strictly block.
    if (!isDemoMode && !isAuthorized) {
      logSecurityEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        action: `Unauthorized Role Switch Attempt: ${role.toUpperCase()}`,
        category: 'role_switch',
        details: `Access denied. ${currentUser.name} is not assigned as ${roleTitle}.`,
        status: 'DENIED',
      });
      return {
        success: false,
        message: `Access Denied — You are not assigned to the ${roleTitle} role. Officer access must be granted by the Department Leader (HOD).`,
      };
    }

    // 2. Credential Verification (Demo Password in Demo Mode, or Individual Officer Password)
    if (!credential || !credential.trim()) {
      return {
        success: false,
        message: isDemoMode
          ? 'Please enter the temporary departmental demo password to access this dashboard.'
          : 'Please enter your authorized individual officer password.',
      };
    }

    const isVerified = await verifyOfficerCredential(role, credential);

    if (isVerified) {
      setActiveOperationalRole(role);
      localStorage.setItem(OPERATIONAL_ROLE_KEY, role);

      const message =
        role === 'hod'
          ? 'Access Granted — Welcome to the Department Leader (HOD) Dashboard.'
          : `Access Granted — Welcome to the ${roleTitle} Workspace.`;

      logSecurityEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        action: `Activated Operational Role: ${role.toUpperCase()}`,
        category: 'role_switch',
        details: `Privileged operational access granted to ${roleTitle}. Mode: ${isDemoMode ? 'Demo' : 'Production'}.`,
        status: 'SUCCESS',
      });

      return { success: true, message };
    } else {
      logSecurityEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        action: `Failed Role Activation: ${role.toUpperCase()}`,
        category: 'role_switch',
        details: 'Invalid access credential provided.',
        status: 'DENIED',
      });

      return {
        success: false,
        message: isDemoMode
          ? 'Access Denied — Incorrect demo password. In Demo Mode, use the temporary departmental demo password ("DEMO-2026").'
          : 'Access Denied — The officer password entered is incorrect. Please check your credentials or contact the HOD.',
      };
    }
  };

  // Exit current operational role back to ordinary department member
  const exitOperationalRole = () => {
    setActiveOperationalRole(null);
    localStorage.removeItem(OPERATIONAL_ROLE_KEY);
    logSecurityEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Exited Operational Role',
      category: 'role_switch',
      details: 'Returned to standard Department Member view.',
      status: 'SUCCESS',
    });
  };

  // Update officer individual password
  const updateOfficerPassword = async (
    role: OperationalRole,
    currentCode: string,
    newCode: string,
    confirmCode: string
  ) => {
    return updateOfficerCredential(role, currentCode, newCode, confirmCode, currentUser.name);
  };

  // Granular Permission Computations
  const isOperationalRoleActive = activeOperationalRole !== null;
  const isHOD = activeOperationalRole === 'hod';
  const isFinance = activeOperationalRole === 'finance';
  const isBookstand = activeOperationalRole === 'bookstand';
  const isUniform = activeOperationalRole === 'uniform';
  const isSecretary = activeOperationalRole === 'secretary';

  // HOD has supervisory access across all department areas
  const canSuperviseAll = isHOD;
  const canViewFinances = isHOD || isFinance;
  const canManageFinances = isHOD || isFinance;
  const canViewBookstand = isHOD || isBookstand;
  const canManageBookstand = isHOD || isBookstand;
  const canManageUniforms = isHOD || isUniform;
  const canManageMembers = isHOD || isSecretary;
  const canManageAttendance = isHOD || isSecretary;
  const canManageReports = isHOD || isSecretary;
  const canManageHandbook = isHOD || isSecretary;
  const canManageEvents = isHOD || isSecretary;
  const canManageForms = isHOD || isSecretary;
  const canManageRosters = isHOD || isSecretary;
  const canViewConfidentialData = isHOD || isSecretary || isFinance;
  const isVisitor = !isAuthenticated;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        allUsers,
        rememberedCredentials,
        activeOperationalRole,
        isOperationalRoleActive,
        isDemoMode,
        demoPassword,
        toggleDemoMode,
        updateDemoPasswordSetting,
        login,
        register,
        logout,
        setCurrentUser,
        requestOperationalRole,
        exitOperationalRole,
        updateOfficerPassword,
        officerAssignments,
        saveAssignments,
        canViewFinances,
        canManageFinances,
        canViewBookstand,
        canManageBookstand,
        canManageUniforms,
        canManageMembers,
        canManageAttendance,
        canManageReports,
        canManageHandbook,
        canManageEvents,
        canManageForms,
        canManageRosters,
        canViewConfidentialData,
        canSuperviseAll,
        isHOD,
        isFinance,
        isUniform,
        isBookstand,
        isSecretary,
        isVisitor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
