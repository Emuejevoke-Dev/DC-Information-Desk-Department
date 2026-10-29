import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, X, CheckCheck, Cake, AlertTriangle, Calendar, BookOpen, Clock, ChevronRight } from 'lucide-react';

interface NotificationDrawerProps {
  onNavigate?: (module: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onNavigate }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isDrawerOpen,
    setIsDrawerOpen,
  } = useNotifications();

  if (!isDrawerOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'birthday':
        return <Cake className="w-4 h-4 text-pink-600" />;
      case 'urgent_meeting':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'low_stock':
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      case 'dress_code':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'birthday':
        return 'bg-pink-50 border-pink-100';
      case 'urgent_meeting':
        return 'bg-red-50 border-red-100';
      case 'low_stock':
        return 'bg-amber-50 border-amber-100';
      case 'dress_code':
        return 'bg-blue-50 border-blue-100';
      default:
        return 'bg-indigo-50 border-indigo-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-navy-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-blue-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-blue-900 animate-pulse" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold">Notification Centre</h2>
                <p className="text-xs text-blue-200">
                  {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 rounded text-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Read all</span>
                </button>
              )}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
                <p className="text-sm font-medium">No current alerts</p>
                <p className="text-xs text-slate-400 mt-1">
                  You are completely caught up with departmental activities!
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    markAsRead(item.id);
                    if (item.linkUrl && onNavigate) {
                      onNavigate(item.linkUrl);
                      setIsDrawerOpen(false);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    getCategoryBg(item.category)
                  } ${
                    !item.read
                      ? 'shadow-xs border-l-4 border-l-blue-600'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-xs shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      {item.linkUrl && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800 mt-2">
                          View details <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
