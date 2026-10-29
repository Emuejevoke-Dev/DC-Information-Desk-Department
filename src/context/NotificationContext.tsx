import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SystemNotification } from '../types/models';
import { useData } from './DataContext';
import { calculateBirthdayInfo, getNextSunday, formatDate } from '../utils/dateUtils';

interface NotificationContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { members, books, announcements, dressCodes } = useData();
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dc_read_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Compute live notifications from persistent system records
  const notifications: SystemNotification[] = useMemo(() => {
    const list: SystemNotification[] = [];
    const today = new Date();

    // 1. Birthday alerts
    members.forEach((m) => {
      const bInfo = calculateBirthdayInfo(m.birthDay, m.birthMonth, m.birthYear, today);
      if (bInfo.isToday) {
        list.push({
          id: `notif-bday-today-${m.id}`,
          title: `🎉 Today is ${m.fullName}'s Birthday!`,
          message: `Join in wishing ${m.fullName} (${m.departmentRole}) a blessed and fruitful birthday celebration!`,
          category: 'birthday',
          timestamp: today.toISOString(),
          read: readIds.includes(`notif-bday-today-${m.id}`),
          linkUrl: 'members',
        });
      } else if (bInfo.isThisWeek) {
        list.push({
          id: `notif-bday-week-${m.id}`,
          title: `Upcoming Birthday: ${m.fullName}`,
          message: `${m.fullName}'s birthday is in ${bInfo.daysUntil} day${bInfo.daysUntil > 1 ? 's' : ''} (${bInfo.nextBirthdayDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}).`,
          category: 'birthday',
          timestamp: today.toISOString(),
          read: readIds.includes(`notif-bday-week-${m.id}`),
          linkUrl: 'birthdays',
        });
      }
    });

    // 2. Urgent Meeting announcements
    announcements.filter((a) => a.isUrgent && a.status === 'Published').forEach((a) => {
      list.push({
        id: `notif-urgent-${a.id}`,
        title: `🚨 Urgent Meeting: ${a.title}`,
        message: a.description,
        category: 'urgent_meeting',
        timestamp: a.createdAt,
        read: readIds.includes(`notif-urgent-${a.id}`),
        linkUrl: 'announcements',
      });
    });

    // 3. Low Book Stock Alert
    books.filter((b) => b.currentStock <= b.reorderThreshold).forEach((b) => {
      list.push({
        id: `notif-stock-${b.id}`,
        title: `⚠️ Low Stock Alert: "${b.title}"`,
        message: `Only ${b.currentStock} copies remaining (Threshold is ${b.reorderThreshold}). Restock requested.`,
        category: 'low_stock',
        timestamp: today.toISOString(),
        read: readIds.includes(`notif-stock-${b.id}`),
        linkUrl: 'bookstand',
      });
    });

    // 4. Upcoming Sunday Dress Code reminder
    const nextSunday = getNextSunday(today);
    const nextSundayStr = nextSunday.toISOString().split('T')[0];
    const sundayDC = dressCodes.find((d) => d.sundayDate === nextSundayStr);
    if (sundayDC) {
      list.push({
        id: `notif-dc-${sundayDC.id}`,
        title: `👔 This Sunday Dress Code: ${sundayDC.themeTitle}`,
        message: sundayDC.description,
        category: 'dress_code',
        timestamp: today.toISOString(),
        read: readIds.includes(`notif-dc-${sundayDC.id}`),
        linkUrl: 'dress-code',
      });
    }

    // 5. Thursday 9 PM Prayer Meeting
    list.push({
      id: 'notif-prayer-thursday',
      title: '🙏 Thursday Prayer Meeting at 9:00 PM',
      message: 'Weekly Departmental Prayer Watch holds every Thursday from 9:00 PM to 9:45 PM online.',
      category: 'prayer_meeting',
      timestamp: today.toISOString(),
      read: readIds.includes('notif-prayer-thursday'),
      linkUrl: 'meetings',
    });

    return list;
  }, [members, books, announcements, dressCodes, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem('dc_read_notifs', JSON.stringify(updated));
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    localStorage.setItem('dc_read_notifs', JSON.stringify(allIds));
  };

  const clearNotification = (id: string) => {
    markAsRead(id);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
