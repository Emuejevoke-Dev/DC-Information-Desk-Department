import React from 'react';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';
import { Compass } from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const {
    currentUser,
    canViewFinances,
    canViewBookstand,
    canManageUniforms,
    canManageMembers,
    canViewConfidentialData,
    logout,
  } = useAuth();
  const { members, lostItems, books, attendance } = useData();

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
          label: 'Cell & Satellite Directory',
          icon: Compass,
          badge: 'Fast Locator',
          badgeColor: 'bg-blue-600 text-white',
          allowed: true,
        },
      ],
    },
    {
      title: 'Officer Workspaces',
      items: [
        {
          id: 'finance-workspace',
          label: 'Financial Officer Desk',
          icon: Wallet,
          badge: 'Audited',
          badgeColor: 'bg-emerald-600 text-white',
          allowed: canViewFinances,
        },
        {
          id: 'bookstand-workspace',
          label: 'Bookstand Officer Desk',
          icon: ShoppingBag,
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : 'Active',
          badgeColor: lowStockCount > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-purple-600 text-white',
          allowed: canViewBookstand,
        },
        {
          id: 'secretary-workspace',
          label: 'Secretary Admin Desk',
          icon: ClipboardList,
          badge: 'Admin',
          badgeColor: 'bg-teal-600 text-white',
          allowed: canManageMembers,
        },
        {
          id: 'uniform-workspace',
          label: 'Uniform Leader Desk',
          icon: Shirt,
          badge: 'Outfits',
          badgeColor: 'bg-rose-600 text-white',
          allowed: canManageUniforms,
        },
      ],
    },
    {
      title: 'Members & Personnel',
      items: [
        {
          id: 'members',
          label: 'Member Directory',
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
          label: 'Book Stand',
          icon: ShoppingBag,
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
          badgeColor: 'bg-rose-600 text-white animate-pulse',
          allowed: canViewBookstand,
        },
      ],
    },
  ];

  const handleNavClick = (id: string) => {
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
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
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

        {/* Footer Account Status */}
        <div className="p-3 bg-[#061024] border-t border-[#152B52]">
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
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-blue-300 truncate">{currentUser.departmentRole}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2 py-1 text-slate-300 hover:text-white hover:bg-red-600/80 rounded-lg text-xs font-bold transition-all cursor-pointer"
                title="Log Out and end session"
                aria-label="Log Out"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px]">Log Out</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
