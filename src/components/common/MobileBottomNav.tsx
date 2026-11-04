import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderOpen,
  ShoppingBag,
  Megaphone,
  PackageSearch,
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
  const { isOperationalRoleActive, activeOperationalRole } = useAuth();
  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      action: () => onNavigate('dashboard'),
    },
    {
      id: 'directory',
      label: 'Folders',
      icon: FolderOpen,
      action: () => onNavigate('directory'),
    },
    {
      id: 'bookstand',
      label: isOperationalRoleActive && activeOperationalRole === 'bookstand' ? 'Book Desk' : 'Book Stand',
      icon: ShoppingBag,
      action: () => onNavigate(isOperationalRoleActive && activeOperationalRole === 'bookstand' ? 'bookstand-workspace' : 'bookstand'),
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
      id: 'profile',
      label: 'Profile',
      icon: User,
      action: onOpenProfile,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#07132B]/95 backdrop-blur-md border-t border-[#152B52] px-1.5 py-1 shadow-2xl print:hidden">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'bookstand' && activeTab === 'bookstand-workspace');

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-w-0 ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors relative ${
                  isActive ? 'bg-amber-400/20 text-amber-300' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.id === 'bookstand' && isOperationalRoleActive && activeOperationalRole === 'bookstand' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-400 ring-2 ring-[#07132B] animate-pulse" />
                )}
                {item.id === 'profile' && isOperationalRoleActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#07132B] animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[58px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
