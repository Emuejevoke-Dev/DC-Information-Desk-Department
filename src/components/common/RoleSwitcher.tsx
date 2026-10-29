import React, { useState } from 'react';
import { useAuth, OPERATIONAL_ROLES_INFO } from '../../context/AuthContext';
import { OperationalRoleModal } from '../auth/OperationalRoleModal';
import { ShieldCheck, ChevronDown, Crown } from 'lucide-react';

interface RoleSwitcherProps {
  onNavigateToWorkspace?: (workspaceTab: string) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onNavigateToWorkspace }) => {
  const { activeOperationalRole, isOperationalRoleActive } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeRoleDetails = activeOperationalRole ? OPERATIONAL_ROLES_INFO[activeOperationalRole] : null;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`btn-compact transition-all cursor-pointer ${
          isOperationalRoleActive
            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border border-amber-300/80 hover:from-amber-300 hover:to-amber-400 glow-amber'
            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-blue-400/50 glow-blue-hover'
        }`}
        title="Switch Operational Role (HOD, Finance, Uniform Leader, Book Stand, Department Secretary)"
        aria-label="Switch Operational Role"
      >
        {activeOperationalRole === 'hod' ? (
          <Crown className="w-3.5 h-3.5 text-slate-950 shrink-0" />
        ) : (
          <ShieldCheck
            className={`w-3.5 h-3.5 shrink-0 ${
              isOperationalRoleActive ? 'text-slate-950' : 'text-amber-400'
            }`}
          />
        )}
        <span className="font-bold truncate max-w-[140px] sm:max-w-none">
          {activeRoleDetails ? activeRoleDetails.title : 'Switch Operational Role'}
        </span>
        <ChevronDown
          className={`w-3 h-3 opacity-80 shrink-0 transition-transform ${
            isModalOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <OperationalRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToWorkspace={onNavigateToWorkspace}
      />
    </>
  );
};
