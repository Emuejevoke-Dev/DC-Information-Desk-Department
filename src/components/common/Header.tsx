import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { RoleSwitcher } from './RoleSwitcher';
import {
  Menu,
  Bell,
  Search,
  ExternalLink,
  Printer,
  Calendar,
  Sparkles,
  FolderOpen,
  Sun,
  Moon,
  LogOut,
  Send,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onNavigateToDirectory: () => void;
  onQuickPrint: () => void;
  onNavigate?: (tab: string) => void;
  onOpenRoleModal?: () => void;
  onOpenReportToHRD?: () => void;
  activeTabTitle: string;
  mobileTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onNavigateToDirectory,
  onQuickPrint,
  onNavigate,
  onOpenRoleModal,
  onOpenReportToHRD,
  activeTabTitle,
  mobileTitle,
}) => {
  const { currentUser, isVisitor, logout } = useAuth();
  const { unreadCount, setIsDrawerOpen } = useNotifications();
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 sm:h-18 px-2.5 xs:px-3.5 sm:px-6 bg-[#0B1D42] text-white border-b border-[#1A3366] shadow-sm print:hidden">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-2 xs:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 xs:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 xs:gap-2 min-w-0">
            <h1 className="text-xs xs:text-sm sm:text-base md:text-lg font-bold tracking-tight text-white truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[280px] md:max-w-none">
              <span className="sm:hidden">{mobileTitle || activeTabTitle}</span>
              <span className="hidden sm:inline">{activeTabTitle}</span>
            </h1>
            {isVisitor && (
              <span className="hidden xs:inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-400 text-slate-950 uppercase tracking-wide shrink-0">
                Desk Mode
              </span>
            )}
          </div>
          {/* Responsive Department Subtitle: Shortened on small screen phones so it is fully visible without clipping */}
          <p className="text-[10px] text-blue-200/90 truncate sm:hidden">
            DC Asaba • Info Desk
          </p>
          <p className="text-[11px] text-blue-200 hidden sm:block truncate">
            Dominion City Asaba • Information Desk Digital Office
          </p>
        </div>
      </div>

      {/* Right Action Tools - Scaled and optimized for mobile screens */}
      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0">
        {/* Fast Search Button (Responsive: icon button on mobile, label on md) */}
        <button
          onClick={onOpenSearch}
          className="h-8 px-2 sm:px-3 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white border border-white/15 hover:border-blue-400/40 glow-blue-hover flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shrink-0"
          title="Quick Search & Actions (Books, Lost Property, Cells, Satellites)"
          aria-label="Quick Search"
        >
          <Search className="w-3.5 h-3.5 text-blue-300 shrink-0" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-blue-950/70 rounded border border-blue-800/80 text-blue-200">
            Ctrl+K
          </kbd>
        </button>

        {/* Switch to Folders (xl only) */}
        <button
          onClick={onNavigateToDirectory}
          className="hidden xl:inline-flex btn-compact btn-glow-blue"
          title="Search Cell Fellowship and Satellite Church Folders across Asaba"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
          <span>Cell & Satellite Folders</span>
        </button>

        {/* Print Button (hidden on mobile, visible on sm and up) */}
        <button
          onClick={onQuickPrint}
          className="hidden sm:inline-flex p-1.5 sm:p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
          title="Print official report of current view"
          aria-label="Print view"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="relative p-1.5 xs:p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
          title="View notifications"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0B1D42] glow-dot-amber animate-pulse" />
          )}
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 xs:p-2 text-blue-200 hover:text-amber-300 hover:bg-white/10 rounded-lg transition-all cursor-pointer relative shrink-0"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode (Currently: ${theme})`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-300 transition-transform rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-blue-200 transition-transform rotate-0 hover:-rotate-12" />
          )}
        </button>

        {/* REPORT TO HRD Direct Line Button */}
        {onOpenReportToHRD && (
          <button
            onClick={onOpenReportToHRD}
            className="h-8 px-2 xs:px-2.5 sm:px-3 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-xs border border-amber-300 hover:shadow-[0_0_12px_rgba(251,191,36,0.5)] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="REPORT TO HRD: Direct incident, inquiry, or operational report to Head of Department"
            aria-label="REPORT TO HRD"
          >
            <Send className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span className="hidden md:inline font-extrabold uppercase tracking-tight text-[11px]">
              REPORT TO HRD
            </span>
            <span className="md:hidden font-extrabold text-[10px] uppercase">
              HRD
            </span>
          </button>
        )}

        {/* Operational Department Role Switcher */}
        <RoleSwitcher onNavigateToWorkspace={onNavigate} onOpenModal={onOpenRoleModal} />

        {/* Explicit Prominent Red Log Out Button - Always visible on all screens */}
        <button
          onClick={logout}
          className="h-8 px-2 xs:px-2.5 sm:px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-xs border border-red-400/40 hover:shadow-[0_0_14px_rgba(239,68,68,0.5)] transition-all flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
          title="Log Out and end session"
          aria-label="Log Out"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
};
