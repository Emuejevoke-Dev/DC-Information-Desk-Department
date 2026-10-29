import React, { useState } from 'react';
import {
  useAuth,
  OperationalRole,
  OPERATIONAL_ROLES_INFO,
} from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowLeft,
  Wallet,
  ShoppingBag,
  Shirt,
  ClipboardList,
  Crown,
  KeyRound,
  Sliders,
  Settings2,
  Users,
  LogOut,
  FileCheck,
} from 'lucide-react';
import { getSecurityAuditLogs } from '../../utils/securityUtils';

interface OperationalRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToWorkspace?: (workspaceTab: string) => void;
}

export const OperationalRoleModal: React.FC<OperationalRoleModalProps> = ({
  isOpen,
  onClose,
  onNavigateToWorkspace,
}) => {
  const {
    currentUser,
    activeOperationalRole,
    isOperationalRoleActive,
    isDemoMode,
    demoPassword,
    toggleDemoMode,
    updateDemoPasswordSetting,
    requestOperationalRole,
    exitOperationalRole,
    updateOfficerPassword,
    officerAssignments,
    saveAssignments,
    allUsers,
  } = useAuth();

  // Modal Views: 'roles' | 'password' | 'admin-settings'
  const [currentView, setCurrentView] = useState<'roles' | 'password' | 'admin-settings'>('roles');
  const [selectedRole, setSelectedRole] = useState<OperationalRole | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Admin settings state
  const [adminTab, setAdminTab] = useState<'demo' | 'assignments' | 'passwords' | 'audit'>('demo');
  const [newDemoPassInput, setNewDemoPassInput] = useState(demoPassword);
  const [adminFeedback, setAdminFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Individual officer password change state
  const [targetPasswordRole, setTargetPasswordRole] = useState<OperationalRole>('hod');
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (!isOpen) return null;

  // The 5 official operational roles
  const rolesList: OperationalRole[] = ['hod', 'finance', 'uniform', 'bookstand', 'secretary'];

  const getRoleIcon = (roleId: OperationalRole) => {
    switch (roleId) {
      case 'hod':
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 'finance':
        return <Wallet className="w-5 h-5 text-emerald-500" />;
      case 'uniform':
        return <Shirt className="w-5 h-5 text-rose-500" />;
      case 'bookstand':
        return <ShoppingBag className="w-5 h-5 text-purple-500" />;
      case 'secretary':
        return <ClipboardList className="w-5 h-5 text-teal-500" />;
    }
  };

  const handleSelectRole = (role: OperationalRole) => {
    setSelectedRole(role);
    setPasswordInput('');
    setFeedback(null);
    setCurrentView('password');
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setIsVerifying(true);
    setFeedback(null);

    const result = await requestOperationalRole(selectedRole, passwordInput);
    setIsVerifying(false);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      const targetWorkspace = OPERATIONAL_ROLES_INFO[selectedRole].workspaceTab;
      setTimeout(() => {
        onClose();
        if (onNavigateToWorkspace) {
          onNavigateToWorkspace(targetWorkspace);
        }
      }, 700);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleExitRole = () => {
    exitOperationalRole();
    setFeedback({
      type: 'success',
      message: 'Returned to standard Department Member view.',
    });
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleSaveDemoPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateDemoPasswordSetting(newDemoPassInput);
    if (res.success) {
      setAdminFeedback({ type: 'success', message: res.message });
    } else {
      setAdminFeedback({ type: 'error', message: res.message });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode !== confirmCode) {
      setAdminFeedback({ type: 'error', message: 'New passwords do not match. Please re-enter.' });
      return;
    }
    if (newCode.length < 6) {
      setAdminFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsUpdatingPassword(true);
    setAdminFeedback(null);
    const res = await updateOfficerPassword(targetPasswordRole, currentCode, newCode, confirmCode);
    setIsUpdatingPassword(false);

    if (res.success) {
      setAdminFeedback({ type: 'success', message: res.message });
      setCurrentCode('');
      setNewCode('');
      setConfirmCode('');
    } else {
      setAdminFeedback({ type: 'error', message: res.message });
    }
  };

  const auditLogs = getSecurityAuditLogs().slice(0, 30);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all card-gradient-border glow-blue">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#0A1A3B] to-[#122A5E] text-white border-b border-blue-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-amber-300 ring-1 ring-blue-400/30 glow-amber">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Switch Operational Role</h2>
              <p className="text-[11px] text-blue-200">
                Departmental Role-Based Access Control • Dominion City Asaba
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Session Identity & Active Operational Role Strip */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#070F1E] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">Member:</span>
            <span className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOperationalRoleActive && activeOperationalRole ? (
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border glow-dot-amber ${OPERATIONAL_ROLES_INFO[activeOperationalRole].badgeClass}`}>
                  Active: {OPERATIONAL_ROLES_INFO[activeOperationalRole].title}
                </span>
                <button
                  onClick={handleExitRole}
                  className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 text-[10px] font-bold transition-colors cursor-pointer"
                  title="Return to general member view"
                >
                  Exit Role
                </button>
              </div>
            ) : (
              <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                Department Member View
              </span>
            )}

            {isDemoMode && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/40 glow-dot-amber">
                Demo Mode
              </span>
            )}
          </div>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`mx-5 mt-4 p-3 rounded-xl border flex items-start gap-2 text-xs font-medium animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 glow-emerald'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">{feedback.message}</div>
          </div>
        )}

        {/* MODAL VIEW 1: Role Selection Grid (The 5 Departmental Roles) */}
        {currentView === 'roles' && (
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Departmental Operational Role
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Choose your assigned operational workspace to access management tools.
                </p>
              </div>

              {/* HOD / System Admin configuration button */}
              {(activeOperationalRole === 'hod' || currentUser.role === 'system_admin' || currentUser.name.includes('Chukwudi')) && (
                <button
                  onClick={() => {
                    setAdminFeedback(null);
                    setCurrentView('admin-settings');
                  }}
                  className="btn-compact bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  title="Configure Demo Mode, Passwords, and Officer Assignments"
                >
                  <Settings2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>HOD Setup</span>
                </button>
              )}
            </div>

            {/* The 5 Clean Cards with Creative Borders & Hover Glow */}
            <div className="grid grid-cols-1 gap-2.5">
              {rolesList.map((roleKey) => {
                const role = OPERATIONAL_ROLES_INFO[roleKey];
                const isCurrent = activeOperationalRole === roleKey;

                return (
                  <div
                    key={roleKey}
                    className={`p-3.5 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'card-gradient-border-amber glow-amber shadow-xs'
                        : 'card-gradient-border glow-blue-hover'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                        {getRoleIcon(roleKey)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {role.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${role.badgeClass}`}>
                            {role.badgeLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 px-3 py-1.5 bg-amber-100/60 dark:bg-amber-950/60 rounded-lg border border-amber-300/40 glow-dot-amber">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectRole(roleKey)}
                          className="btn-compact btn-glow-blue"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Access Dashboard</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Help text */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-2">
              All department members have unrestricted access to the member portal, Sunday dress code, directory, and announcements.
            </p>
          </div>
        )}

        {/* MODAL VIEW 2: Password Verification Screen */}
        {currentView === 'password' && selectedRole && (
          <form onSubmit={handleVerifyPassword} className="p-5 space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('roles');
                  setFeedback(null);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Roles</span>
              </button>
              <div className="flex items-center gap-1.5">
                {getRoleIcon(selectedRole)}
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {OPERATIONAL_ROLES_INFO[selectedRole].title}
                </span>
              </div>
            </div>

            {/* DEMO ACCESS Notice Banner */}
            {isDemoMode ? (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-100">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>DEMO ACCESS</span>
                </div>
                <p>
                  Enter the temporary departmental demo password to access this dashboard. Individual officer passwords will be configured before the official launch.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">Current Demo Password:</span>
                  <button
                    type="button"
                    onClick={() => setPasswordInput(demoPassword)}
                    className="font-mono font-bold px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 text-amber-950 dark:text-amber-200 transition-colors cursor-pointer border border-amber-300 dark:border-amber-700"
                    title="Click to auto-fill demo password"
                  >
                    {demoPassword} (Click to fill)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>AUTHORIZED OFFICER ACCESS</span>
                </div>
                <p className="mt-1">
                  Enter your assigned officer password to open the {OPERATIONAL_ROLES_INFO[selectedRole].title} workspace.
                </p>
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {isDemoMode ? 'Departmental Demo Password' : 'Enter Officer Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={isDemoMode ? `Enter "${demoPassword}"...` : 'Enter password...'}
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono tracking-wider pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('roles');
                  setFeedback(null);
                }}
                className="btn-compact text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying || !passwordInput.trim()}
                className="btn-compact btn-glow-blue disabled:opacity-50"
              >
                {isVerifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Access Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* MODAL VIEW 3: HOD Administrative Setup */}
        {currentView === 'admin-settings' && (
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('roles');
                  setAdminFeedback(null);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Role Switcher</span>
              </button>
              <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                <Crown className="w-4 h-4" />
                <span>HOD Administrative Controls</span>
              </div>
            </div>

            {adminFeedback && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2 text-xs font-medium ${
                  adminFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                {adminFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{adminFeedback.message}</span>
              </div>
            )}

            {/* Admin Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => {
                  setAdminFeedback(null);
                  setAdminTab('demo');
                }}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  adminTab === 'demo' ? 'bg-white dark:bg-[#07132B] text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Demo Password
              </button>
              <button
                onClick={() => {
                  setAdminFeedback(null);
                  setAdminTab('assignments');
                }}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  adminTab === 'assignments' ? 'bg-white dark:bg-[#07132B] text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Officer Roles
              </button>
              <button
                onClick={() => {
                  setAdminFeedback(null);
                  setAdminTab('passwords');
                }}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  adminTab === 'passwords' ? 'bg-white dark:bg-[#07132B] text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Officer Passwords
              </button>
              <button
                onClick={() => {
                  setAdminFeedback(null);
                  setAdminTab('audit');
                }}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  adminTab === 'audit' ? 'bg-white dark:bg-[#07132B] text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Audit Log
              </button>
            </div>

            {/* TAB 1: Demo Password Configuration & Mode Toggle */}
            {adminTab === 'demo' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#07132B] flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      System Operational Mode
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isDemoMode
                        ? 'DEMO DEVELOPMENT MODE: Shared temporary demo password is active.'
                        : 'PRODUCTION MODE: Individual officer passwords strictly enforced.'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleDemoMode(!isDemoMode)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                      isDemoMode
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isDemoMode ? 'Demo Mode Active' : 'Production Mode'}
                  </button>
                </div>

                <form onSubmit={handleSaveDemoPassword} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      General Department Demo Password
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                      Used by all 5 operational roles during demo testing.
                    </p>
                    <input
                      type="text"
                      value={newDemoPassInput}
                      onChange={(e) => setNewDemoPassInput(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                  >
                    Save Demo Password
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Officer Role Assignments */}
            {adminTab === 'assignments' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Assign authorized department members to operational roles. Ordinary members cannot access operational dashboards without HOD role delegation.
                </p>

                <div className="space-y-2">
                  {rolesList.map((r) => {
                    const roleInfo = OPERATIONAL_ROLES_INFO[r];
                    const assignedList = officerAssignments[r] || [];

                    return (
                      <div
                        key={r}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#07132B] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {getRoleIcon(r)}
                            {roleInfo.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {assignedList.length} assigned
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {assignedList.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Individual Officer Passwords */}
            {adminTab === 'passwords' && (
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Update individual passwords using secure SHA-256 cryptographic hashing. Passwords are never stored in plain text.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Target Role
                    </label>
                    <select
                      value={targetPasswordRole}
                      onChange={(e) => setTargetPasswordRole(e.target.value as OperationalRole)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      {rolesList.map((r) => (
                        <option key={r} value={r}>
                          {OPERATIONAL_ROLES_INFO[r].title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Current Password or HOD Code
                    </label>
                    <input
                      type="password"
                      value={currentCode}
                      onChange={(e) => setCurrentCode(e.target.value)}
                      placeholder="Current password..."
                      required
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      New Officer Password
                    </label>
                    <input
                      type="password"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="Min 6 characters..."
                      required
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmCode}
                      onChange={(e) => setConfirmCode(e.target.value)}
                      placeholder="Re-enter new password..."
                      required
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
                >
                  {isUpdatingPassword ? 'Hashing & Saving...' : 'Update Officer Password'}
                </button>
              </form>
            )}

            {/* TAB 4: Security Audit Log */}
            {adminTab === 'audit' && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No audit logs recorded yet.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-[#07132B] border border-slate-200 dark:border-slate-800 text-[11px] flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px]">{log.details}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
