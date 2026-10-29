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
  Compass,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onNavigateToDirectory: () => void;
  onQuickPrint: () => void;
  onNavigate?: (tab: string) => void;
  activeTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onNavigateToDirectory,
  onQuickPrint,
  onNavigate,
  activeTabTitle,
}) => {
  const { currentUser, isVisitor, logout } = useAuth();
  const { unreadCount, setIsDrawerOpen } = useNotifications();
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-3.5 sm:px-6 bg-[#0B1D42] text-white border-b border-[#1A3366] shadow-sm print:hidden">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
              {activeTabTitle}
            </h1>
            {isVisitor && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-400 text-slate-950 uppercase tracking-wide">
                Public Desk Mode
              </span>
            )}
          </div>
          <p className="text-[11px] text-blue-200 hidden sm:block">
            Dominion City Asaba • Information Desk Digital Office
          </p>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Fast Search Button (Standardized compact ~34px, 12px padding) */}
        <button
          onClick={onOpenSearch}
          className="btn-compact bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white border border-white/15 hover:border-blue-400/40 glow-blue-hover"
          title="Quick Search & Actions (Books, Lost Property, Cells, Satellites)"
        >
          <Search className="w-3.5 h-3.5 text-blue-300" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-blue-950/70 rounded border border-blue-800/80 text-blue-200">
            Ctrl+K
          </kbd>
        </button>

        {/* Switch to Directory */}
        <button
          onClick={onNavigateToDirectory}
          className="hidden xl:inline-flex btn-compact btn-glow-blue"
          title="Search Cell Fellowships and Satellite Churches across Asaba"
        >
          <Compass className="w-3.5 h-3.5 text-amber-300" />
          <span>Cell & Satellite Directory</span>
        </button>

        {/* Print Button */}
        <button
          onClick={onQuickPrint}
          className="p-1.5 sm:p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="Print official report of current view"
          aria-label="Print view"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="relative p-1.5 sm:p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
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
          className="p-1.5 sm:p-2 text-blue-200 hover:text-amber-300 hover:bg-white/10 rounded-lg transition-all cursor-pointer relative"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode (Currently: ${theme})`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-300 transition-transform rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-blue-200 transition-transform rotate-0 hover:-rotate-12" />
          )}
        </button>

        {/* Role Switcher */}
        <RoleSwitcher onNavigateToWorkspace={onNavigate} />

        {/* Explicit Clear Log Out Button */}
        <button
          onClick={logout}
          className="btn-compact bg-red-600/90 hover:bg-red-500 text-white shadow-xs border border-red-400/40 hover:shadow-[0_0_14px_rgba(239,68,68,0.5)] transition-all"
          title="Log Out and end session"
          aria-label="Log Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
};
