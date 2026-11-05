import React from 'react';
import { useAuth, OPERATIONAL_ROLES_INFO } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  Search,
  Users,
  Cake,
  PackageSearch,
  Megaphone,
  MapPin,
  Building2,
  BookOpen,
  Shirt,
  CalendarCheck,
  Clock,
  FileText,
  ClipboardList,
  Wallet,
  ShoppingBag,
  Database,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  LogOut,
  ExternalLink,
  UserCheck,
  Crown,
  ShieldCheck,
  HeartHandshake,
  AlertTriangle,
  FileCheck,
  Send,
  X,
} from 'lucide-react';
import { FolderOpen } from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
  onOpenRoleModal?: () => void;
  onOpenReportToHRD?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenRoleModal,
  onOpenReportToHRD,
}) => {
  const {
    currentUser,
    isHOD,
    canAccessHRDOffice,
    canViewFinances,
    canViewBookstand,
    canManageBookstand,
    canManageUniforms,
    canManageMembers,
    canManageWelfare,
    canSuperviseAll,
    canViewConfidentialData,
    activeOperationalRole,
    isOperationalRoleActive,
    exitOperationalRole,
    logout,
  } = useAuth();
  const { members, lostItems, books, attendance } = useData();

  const activeRoleDetails = activeOperationalRole ? OPERATIONAL_ROLES_INFO[activeOperationalRole] : null;

  // Badge counts
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayBirthdaysCount = members.filter(
    (m) => m.birthMonth === today.getMonth() + 1 && m.birthDay === today.getDate()
  ).length;

  const unclaimedLostCount = lostItems.filter((i) => i.status === 'Unclaimed').length;
  const lowStockCount = books.filter((b) => b.currentStock <= b.reorderThreshold).length;
  const todayAttendanceCount = attendance.filter((a) => a.serviceDate === todayStr).length;

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge: any;
    badgeColor?: string;
    allowed: boolean;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'Central Operations',
      items: [
        {
          id: 'dashboard',
          label: 'Home',
          icon: LayoutDashboard,
          badge: null,
          allowed: true,
        },
        {
          id: 'directory',
          label: 'Cell & Satellite Folders',
          icon: FolderOpen,
          badge: 'Fast Locator',
          badgeColor: 'bg-blue-600 text-white',
          allowed: true,
        },
      ],
    },
    {
      title: 'Authorized Officer Desks',
      items: [
        {
          id: 'hrd-office',
          label: 'HOD Office',
          icon: Crown,
          badge: isHOD ? 'Executive' : 'Restricted',
          badgeColor: isHOD ? 'bg-amber-400 text-slate-950 font-black' : 'bg-amber-950/80 text-amber-300 border border-amber-700',
          allowed: true,
        },
        {
          id: 'finance-workspace',
          label: 'Financial Officer Desk',
          icon: Wallet,
          badge: 'Desk',
          badgeColor: 'bg-emerald-600 text-white',
          allowed: canViewFinances,
        },
        {
          id: 'bookstand-workspace',
          label: 'Bookstand Officer Desk',
          icon: ShoppingBag,
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : 'Desk',
          badgeColor: lowStockCount > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-purple-600 text-white',
          allowed: canManageBookstand,
        },
        {
          id: 'secretary-workspace',
          label: 'Secretary Admin Desk',
          icon: ClipboardList,
          badge: 'Desk',
          badgeColor: 'bg-teal-600 text-white',
          allowed: canManageMembers,
        },
        {
          id: 'uniform-workspace',
          label: 'Uniform Leader Desk',
          icon: Shirt,
          badge: 'Desk',
          badgeColor: 'bg-rose-600 text-white',
          allowed: canManageUniforms,
        },
        {
          id: 'welfare-workspace',
          label: 'Welfare Coordinator Desk',
          icon: HeartHandshake,
          badge: 'Desk',
          badgeColor: 'bg-pink-600 text-white',
          allowed: canManageWelfare,
        },
      ],
    },
    {
      title: 'Members & Personnel',
      items: [
        {
          id: 'members',
          label: 'Members Folder',
          icon: Users,
          badge: members.length,
          allowed: true,
        },
        {
          id: 'birthdays',
          label: 'Birthday Calendar',
          icon: Cake,
          badge: todayBirthdaysCount > 0 ? `${todayBirthdaysCount} Today!` : null,
          badgeColor: 'bg-pink-500 text-white animate-pulse',
          allowed: true,
        },
      ],
    },
    {
      title: 'Church Information',
      items: [
        {
          id: 'handbook',
          label: 'Church Info & Handbook',
          icon: BookOpen,
          badge: 'SOPs & Cells',
          allowed: true,
        },
      ],
    },
    {
      title: 'Services & Schedules',
      items: [
        {
          id: 'attendance',
          label: 'Service Attendance',
          icon: UserCheck,
          badge: todayAttendanceCount > 0 ? `${todayAttendanceCount} Present` : 'Live Clock-In',
          badgeColor: todayAttendanceCount > 0 ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white',
          allowed: true,
        },
        {
          id: 'dress-code',
          label: 'Sunday Dress Code',
          icon: Shirt,
          badge: null,
          allowed: true,
        },
        {
          id: 'roster',
          label: 'Service Roster',
          icon: CalendarCheck,
          badge: null,
          allowed: true,
        },
        {
          id: 'meetings',
          label: 'Meetings & Prayer',
          icon: Clock,
          badge: 'Thu 9PM',
          badgeColor: 'bg-amber-500 text-slate-900 font-bold',
          allowed: true,
        },
        {
          id: 'reports',
          label: 'Service Reports',
          icon: FileText,
          badge: null,
          allowed: true,
        },
      ],
    },
    {
      title: 'Desk Management & Records',
      items: [
        {
          id: 'lost-found',
          label: 'Lost & Found Log',
          icon: PackageSearch,
          badge: unclaimedLostCount > 0 ? `${unclaimedLostCount} Open` : null,
          badgeColor: 'bg-amber-600 text-white',
          allowed: true,
        },
        {
          id: 'announcements',
          label: 'News & Urgent Alerts',
          icon: Megaphone,
          badge: null,
          allowed: true,
        },
        {
          id: 'collections',
          label: 'Custom Info Forms',
          icon: ClipboardList,
          badge: 'Form Builder',
          badgeColor: 'bg-purple-600 text-white',
          allowed: true,
        },
        {
          id: 'finances',
          label: 'Financial Records',
          icon: Wallet,
          badge: 'Confidential',
          badgeColor: 'bg-emerald-700 text-white',
          allowed: true,
        },
        {
          id: 'bookstand',
          label: 'Book Stand Catalogue',
          icon: BookOpen,
          badge: 'Catalogue',
          badgeColor: 'bg-amber-400 text-slate-950 font-bold',
          allowed: true,
        },
      ],
    },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'bookstand-workspace' && !canManageBookstand) {
      setMobileOpen(false);
      if (onOpenRoleModal) onOpenRoleModal();
      return;
    }
    if (id === 'finance-workspace' && !canViewFinances) {
      setMobileOpen(false);
      if (onOpenRoleModal) onOpenRoleModal();
      return;
    }
    if (id === 'secretary-workspace' && !canManageMembers) {
      setMobileOpen(false);
      if (onOpenRoleModal) onOpenRoleModal();
      return;
    }
    if (id === 'uniform-workspace' && !canManageUniforms) {
      setMobileOpen(false);
      if (onOpenRoleModal) onOpenRoleModal();
      return;
    }
    if (id === 'welfare-workspace' && !canManageWelfare) {
      setMobileOpen(false);
      if (onOpenRoleModal) onOpenRoleModal();
      return;
    }
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#07132B] text-slate-200 border-r border-[#152B52] transition-all duration-300 print:hidden ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-18 px-4 bg-[#0A1A3B] border-b border-[#152B52]">
          <div className="flex items-center gap-2 overflow-hidden">
            <Logo size={collapsed ? 'sm' : 'md'} variant="light" showText={!collapsed} />
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <div className="lg:hidden flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="py-1 px-2.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1 touch-manipulation shadow-xs border border-red-400/50"
              title="Log Out and end session"
              aria-label="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="uppercase text-[11px]">Log Out</span>
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 touch-manipulation"
              aria-label="Close navigation sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {navGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) => item.allowed);
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {!collapsed && (
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-blue-400/80 mb-2">
                    {group.title}
                  </p>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-blue-300'
                          }`}
                        />
                        {!collapsed && (
                          <div className="flex-1 flex items-center justify-between text-left truncate">
                            <span className="truncate">{item.label}</span>
                            {item.badge !== null && item.badge !== undefined && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold tracking-tight shrink-0 ml-1.5 ${
                                  item.badgeColor || 'bg-blue-950/80 text-blue-200 border border-blue-800'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Report to HOD Prominent Action Button */}
        {onOpenReportToHRD && (
          <div className="px-3 pb-2">
            <button
              onClick={() => {
                setMobileOpen(false);
                onOpenReportToHRD();
              }}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-950/40 border border-amber-300 cursor-pointer transition-all hover:scale-[1.02] ${
                collapsed ? 'px-1' : 'px-3'
              }`}
              title="REPORT TO HOD — Direct leadership messaging, inquiries & incidents"
            >
              <Send className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              {!collapsed && <span className="tracking-wide">REPORT TO HOD</span>}
            </button>
          </div>
        )}

        {/* Footer Account Status & Prominent Mobile Log Out */}
        <div className="p-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-[#061024] border-t border-[#152B52] space-y-2">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {currentUser.name.charAt(0)}
              </div>
            )}
            {(!collapsed || mobileOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-blue-300 truncate">{currentUser.departmentRole}</p>
              </div>
            )}
          </div>

          {/* Prominent Log Out Button on Mobile & Expanded Sidebar */}
          {(!collapsed || mobileOpen) && (
            <button
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-950/60 border border-red-500/50 cursor-pointer touch-manipulation"
              title="Log Out and end session"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of System</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
