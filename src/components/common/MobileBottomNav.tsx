import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Megaphone,
  PackageSearch,
  FileText,
  User,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigate,
  onOpenProfile,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      action: () => onNavigate('dashboard'),
    },
    {
      id: 'directory',
      label: 'Directory',
      icon: Compass,
      action: () => onNavigate('directory'),
    },
    {
      id: 'announcements',
      label: 'Events',
      icon: Megaphone,
      action: () => onNavigate('announcements'),
    },
    {
      id: 'lost-found',
      label: 'Lost/Found',
      icon: PackageSearch,
      action: () => onNavigate('lost-found'),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      action: () => onNavigate('reports'),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      action: onOpenProfile,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#07132B]/95 backdrop-blur-md border-t border-[#152B52] px-2 py-1.5 shadow-2xl print:hidden">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[52px] ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-amber-400/20 text-amber-300' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
