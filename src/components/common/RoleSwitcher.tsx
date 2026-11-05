import React, { useState } from 'react';
import { useAuth, OPERATIONAL_ROLES_INFO } from '../../context/AuthContext';
import { OperationalRoleModal } from '../auth/OperationalRoleModal';
import { ShieldCheck, ChevronDown, Crown } from 'lucide-react';

interface RoleSwitcherProps {
  onNavigateToWorkspace?: (workspaceTab: string) => void;
  onOpenModal?: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  onNavigateToWorkspace,
  onOpenModal,
}) => {
  const { activeOperationalRole, isOperationalRoleActive } = useAuth();
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  const isModalOpen = onOpenModal ? false : internalModalOpen;
  const handleOpen = () => {
    if (onOpenModal) {
      onOpenModal();
    } else {
      setInternalModalOpen(true);
    }
  };

  const activeRoleDetails = activeOperationalRole ? OPERATIONAL_ROLES_INFO[activeOperationalRole] : null;

  // Short label for mobile display
  const getMobileRoleLabel = () => {
    if (!activeOperationalRole) return 'Roles';
    switch (activeOperationalRole) {
      case 'hod':
        return 'HOD';
      case 'operations':
        return 'Ops';
      case 'finance':
        return 'Finance';
      case 'uniform':
        return 'Uniform';
      case 'bookstand':
        return 'Book Officer';
      case 'secretary':
        return 'Sec';
      case 'welfare':
        return 'Welfare';
      default:
        return 'Role';
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`h-8 px-1.5 xs:px-2 sm:px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0 ${
          isOperationalRoleActive
            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border border-amber-300/80 hover:from-amber-300 hover:to-amber-400 glow-amber'
            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-blue-400/50 glow-blue-hover'
        }`}
        title="Switch Operational Department Role (HOD, Operations, Finance, Uniform, Book Stand, Secretary)"
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
        {/* Compact label for small mobile screens */}
        <span className="sm:hidden font-black tracking-tight text-[10px] xs:text-[11px] truncate max-w-[50px] xs:max-w-[70px]">
          {getMobileRoleLabel()}
        </span>
        {/* Full label for sm and larger viewports */}
        <span className="hidden sm:inline font-bold truncate max-w-[130px] md:max-w-none">
          {activeRoleDetails ? activeRoleDetails.title : 'Switch Role'}
        </span>
        <ChevronDown
          className={`w-3 h-3 opacity-80 shrink-0 transition-transform ${
            internalModalOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {!onOpenModal && (
        <OperationalRoleModal
          isOpen={internalModalOpen}
          onClose={() => setInternalModalOpen(false)}
          onNavigateToWorkspace={onNavigateToWorkspace}
        />
      )}
    </>
  );
};
