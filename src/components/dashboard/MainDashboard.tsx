import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  calculateBirthdayInfo,
  getNextSunday,
  getNextThursdayPrayer,
  formatDate,
  formatLagosDateTime,
} from '../../utils/dateUtils';
import { formatNaira } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Shirt,
  Users,
  Cake,
  PackageSearch,
  Megaphone,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  FileText,
  Sparkles,
  MapPin,
  ExternalLink,
  CheckCircle,
  CheckCircle2,
  UserCheck,
  Building2,
  UserX,
  ShieldCheck,
  Lock,
  Eye,
  Check,
  ChevronRight,
  Sparkle,
  BookOpen,
  ShoppingBag,
  BarChart3,
  Search,
  Share2,
  Edit3,
  HeartHandshake,
  FileCheck,
  Crown,
  Send,
} from 'lucide-react';
import { EventFlyerCarousel } from './EventFlyerCarousel';
import { MyProfileModal } from '../members/MyProfileModal';
import { RecordFoundItemModal } from '../lost-found/RecordFoundItemModal';
import { Book3DCover } from '../bookstand/Book3DCover';
import { BirthdayCustomizerModal, THEME_CONFIGS } from '../birthdays/BirthdayCustomizerModal';
import { ShareModal } from '../common/ShareModal';
import { BirthdayCelebration, DepartmentMember } from '../../types/models';

interface MainDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenQuickAction?: (action: string) => void;
  onOpenReportToHRD?: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onNavigate,
  onOpenReportToHRD,
}) => {
  const {
    currentUser,
    loginTimestamp,
    canManageReports,
    canManageAttendance,
    canManageUniforms,
    canManageWelfare,
    canSuperviseAll,
    isHOD,
    isOperations,
    isSecretary,
  } = useAuth();

  const {
    members,
    lostItems,
    announcements,
    dressCodes,
    rosters,
    meetings,
    reports,
    collections,
    attendance,
    books,
    birthdayCelebrations,
    departmentComplaints,
    monthlyReports,
    addAttendanceRecord,
  } = useData();

  const [celebratedMemberId, setCelebratedMemberId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRecordItemModalOpen, setIsRecordItemModalOpen] = useState(false);
  const [showAbsentList, setShowAbsentList] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [customizingCelebrant, setCustomizingCelebrant] = useState<DepartmentMember | null>(null);
  const [sharingCelebrant, setSharingCelebrant] = useState<{
    member: DepartmentMember;
    celebration?: BirthdayCelebration;
  } | null>(null);

  const today = new Date();
  const nextSunday = getNextSunday(today);
  const nextSundayStr = nextSunday.toISOString().split('T')[0];

  // -------------------------------------------------------------
  // 1. PUBLIC SUNDAY DRESS CODE (Only published schedules shown)
  // -------------------------------------------------------------
  const publishedDressCodes = dressCodes
    .filter((d) => d.status === 'Published' || !d.status)
    .sort((a, b) => new Date(a.sundayDate).getTime() - new Date(b.sundayDate).getTime());

  // Priority: 1st published upcoming Sunday, or closest upcoming published, or latest published
  const currentSundayDressCode =
    publishedDressCodes.find((d) => d.sundayDate === nextSundayStr) ||
    publishedDressCodes.find((d) => d.sundayDate >= today.toISOString().split('T')[0]) ||
    publishedDressCodes[0];

  // Optional next scheduled published dress code
  const nextScheduledDressCode = publishedDressCodes.find(
    (d) =>
      currentSundayDressCode &&
      d.id !== currentSundayDressCode.id &&
      d.sundayDate > currentSundayDressCode.sundayDate
  );

  const isRecentlyPublished =
    currentSundayDressCode && currentSundayDressCode.status === 'Published';

  // -------------------------------------------------------------
  // 2. SERVICE ATTENDANCE DASHBOARD SUMMARY (Member-linked)
  // -------------------------------------------------------------
  const todayStr = today.toISOString().split('T')[0];
  const serviceDates = Array.from(new Set(attendance.map((a) => a.serviceDate))).sort().reverse();
  const activeServiceDate = serviceDates.includes(todayStr) ? todayStr : (serviceDates[0] || todayStr);

  const currentServiceAttendance = attendance.filter((a) => a.serviceDate === activeServiceDate);
  const checkedInMemberIds = new Set(
    currentServiceAttendance.map((a) => a.memberId).filter(Boolean)
  );

  // Map present attendees with real member directory records and photos
  const presentMembersList = currentServiceAttendance.map((a) => {
    const matched = members.find((m) => m.id === a.memberId);
    return {
      ...a,
      photoUrl: matched?.photoUrl || a.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      fullName: matched?.fullName || a.memberName,
      phone: matched?.phone || a.memberPhone,
    };
  });

  const deskAAttendees = presentMembersList.filter(
    (a) => a.servingStation === 'Desk A' || (!a.servingStation && a.departmentRole?.toLowerCase().includes('lead'))
  );
  const deskBAttendees = presentMembersList.filter(
    (a) => a.servingStation === 'Desk B'
  );
  const bookstandAttendees = presentMembersList.filter(
    (a) => a.servingStation === 'Bookstand' || (!a.servingStation && a.departmentRole?.toLowerCase().includes('bookstand'))
  );

  // Department members who have not yet checked in
  const absentMembersList = members.filter((m) => !checkedInMemberIds.has(m.id));

  const totalEligible = members.length;
  const checkedInCount = currentServiceAttendance.length;
  const absentCount = Math.max(0, totalEligible - checkedInCount);
  const attendancePercent = totalEligible > 0 ? Math.round((checkedInCount / totalEligible) * 100) : 0;

  // Check if current user is already signed in
  const currentUserRecord = currentServiceAttendance.find(
    (a) => a.memberId === currentUser.id || a.memberName.toLowerCase() === currentUser.name.toLowerCase()
  );
  const isCurrentUserCheckedIn = !!currentUserRecord;

  const handleDashboardQuickCheckIn = () => {
    if (isCurrentUserCheckedIn) return;
    const clockInTimeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const matchedMember = members.find((m) => m.id === currentUser.id);

    addAttendanceRecord({
      memberId: currentUser.id,
      memberName: currentUser.name,
      memberPhone: currentUser.phone,
      departmentRole: currentUser.departmentRole,
      serviceDate: activeServiceDate,
      clockInTime: clockInTimeStr,
      serviceType: 'Sunday 1st Service',
      status: 'Present',
      verifiedLocation: true,
      distanceFromChurchMeters: 20,
      notes: 'Direct Check-In via Member Dashboard',
      markedBy: `Self Check-In (${currentUser.name})`,
      photoUrl: matchedMember?.photoUrl,
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#10B981', '#F59E0B'],
    });
  };

  // -------------------------------------------------------------
  // 3. ROSTERS & MEETINGS
  // -------------------------------------------------------------
  const currentSundayRoster =
    rosters.find((r) => r.serviceDate === nextSundayStr) || rosters[0];

  const nextThursday = getNextThursdayPrayer(today);

  const upcomingMeetings = meetings
    .filter((m) => m.status === 'Scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextMeeting = upcomingMeetings[0];

  // Urgent notice banner
  const urgentNotice = announcements.find(
    (a) => a.isUrgent && a.status === 'Published'
  );

  // Birthday calculations
  const memberBirthdays = members
    .map((m) => ({
      member: m,
      info: calculateBirthdayInfo(m.birthDay, m.birthMonth, m.birthYear, today),
    }))
    .sort((a, b) => a.info.daysUntil - b.info.daysUntil);

  const todayBirthdays = memberBirthdays.filter((b) => b.info.isToday);
  const upcomingBirthdays = memberBirthdays
    .filter((b) => !b.info.isToday && b.info.daysUntil <= 60)
    .slice(0, 4);

  // Recent Lost & Found
  const recentLostItems = lostItems.slice(0, 3);

  // Trigger celebration confetti
  const triggerConfetti = (memberId: string) => {
    setCelebratedMemberId(memberId);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1D4ED8', '#F59E0B', '#10B981', '#EC4899', '#6366F1'],
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Welcome Greeting & Department Action Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1A3B] via-[#0D2554] to-[#143A80] text-white p-5 sm:p-6 shadow-lg border border-blue-500/40 glow-blue">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Information Desk Digital Office
              </span>
              <span className="text-xs text-blue-300">Dominion City Asaba</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Welcome, {currentUser.name}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
              Serving with excellence, clarity, and kingdom hospitality. Today is{' '}
              <span className="font-semibold text-white">
                {today.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              .
            </p>

            {/* Accurate Nigerian Timezone (WAT, Africa/Lagos) Login Timestamp */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-900/80 border border-blue-400/40 text-xs font-semibold text-blue-100 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>
                  Signed In: <strong className="text-white font-bold">{loginTimestamp ? formatLagosDateTime(loginTimestamp) : formatLagosDateTime(today)}</strong>
                </span>
              </span>
              <span className="text-[11px] text-blue-300 hidden sm:inline">
                (WAT • Africa/Lagos Session)
              </span>
            </div>
          </div>

          {/* Quick Action Buttons (Compact ~34px, 12px padding, subtle glow) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Quick Check-in Button */}
            {isCurrentUserCheckedIn ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Checked In ({currentUserRecord?.clockInTime})
              </span>
            ) : (
              <button
                onClick={handleDashboardQuickCheckIn}
                className="btn-compact btn-glow-blue"
              >
                <UserCheck className="w-3.5 h-3.5 text-white" />
                Check In for Service
              </button>
            )}

            {/* Record Found Item */}
            <button
              onClick={() => setIsRecordItemModalOpen(true)}
              className="btn-compact btn-glow-amber"
            >
              <PackageSearch className="w-3.5 h-3.5" />
              Record Found Item
            </button>

            {/* Submit Service Report */}
            {canManageReports && (
              <button
                onClick={() => onNavigate('reports')}
                className="btn-compact bg-white/10 hover:bg-white/20 text-white border border-white/20 glow-blue-hover"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-300" />
                Submit Report
              </button>
            )}

            {/* Update My Profile */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="btn-compact bg-white/10 hover:bg-white/20 text-white border border-white/20 glow-blue-hover"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-300" />
              My Profile
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Executive HRD Office Gateway Banner (Strictly Exclusive to Authenticated HOD) */}
      {isHOD && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-slate-900 border-2 border-amber-400/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30 shrink-0">
              <Crown className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Exclusive Executive Workspace
                </span>
                <span className="text-xs text-amber-300 font-bold">HRD Office</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                Head of Department (HRD) Leadership &amp; Oversight Suite
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                9 executive sections: Assemblies, inbox threads, complaints triage, 6-unit reports, and archives.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('hrd-office')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-102 transition-all cursor-pointer flex items-center gap-2 shrink-0 justify-center"
          >
            <Crown className="w-4 h-4 text-slate-950" />
            <span>Enter HRD Office</span>
          </button>
        </div>
      )}

      {/* Universal Direct Line: REPORT TO HRD Card (Accessible to All Department Members & Officers) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/40 border border-blue-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
            <Send className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">Need Leadership Assistance or Have an Issue?</h4>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                Direct Line
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Submit confidential reports, observations, complaints, inquiries, or welfare requests directly to the Head of Department.
            </p>
          </div>
        </div>
        {onOpenReportToHRD && (
          <button
            onClick={onOpenReportToHRD}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 justify-center hover:scale-102"
          >
            <Send className="w-3.5 h-3.5 text-slate-950" />
            <span>REPORT TO HRD</span>
          </button>
        )}
      </div>

      {/* 2. Urgent Meeting Notice Banner (If Published) */}
      {urgentNotice && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md flex items-start justify-between gap-4 border border-red-500 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white/20 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-white text-red-700">
                  URGENT NOTICE
                </span>
                <h3 className="text-sm font-bold">{urgentNotice.title}</h3>
              </div>
              <p className="text-xs text-red-100 mt-1 leading-relaxed">
                {urgentNotice.description}
              </p>
              {urgentNotice.meetingDetails && (
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-amber-200 mt-2">
                  <span>📅 {urgentNotice.meetingDetails.date}</span>
                  <span>⏰ {urgentNotice.meetingDetails.time}</span>
                  <span>📍 {urgentNotice.meetingDetails.venue}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigate('announcements')}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-red-700 hover:bg-red-50 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Details
          </button>
        </div>
      )}

      {/* 3. Featured Event Flyer Carousel */}
      <EventFlyerCarousel
        events={announcements}
        onViewEventDetails={() => onNavigate('announcements')}
      />

      {/* 4. TODAY'S BIRTHDAY CELEBRATION HERO (If any member has birthday today) */}
      {todayBirthdays.length > 0 && (() => {
        const primaryBday = todayBirthdays[0];
        const primaryCelebrant = primaryBday.member;
        const activeCelebration = birthdayCelebrations.find((c) => c.memberId === primaryCelebrant.id);
        const heroTheme = activeCelebration ? THEME_CONFIGS[activeCelebration.theme] : null;
        const gradientClass = heroTheme ? heroTheme.gradient : 'from-pink-500 via-rose-500 to-purple-600';
        const displayPhoto = activeCelebration?.photoUrl || primaryCelebrant.photoUrl;
        const displayGreeting = activeCelebration?.greeting || `Happy Birthday to ${todayBirthdays.map((b) => b.member.fullName).join(' & ')}!`;
        const displayCaption = activeCelebration?.caption || 'May God crown your new year with glory, favor, and extraordinary grace!';
        const prayersList = activeCelebration?.prayers || [];

        return (
          <div className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-r ${gradientClass} text-white shadow-xl relative overflow-hidden transition-all border border-white/20`}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={displayPhoto}
                    alt={primaryCelebrant.fullName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-xl shadow-md text-sm">
                    🎂
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-white/30 text-white">
                      DEPARTMENT BIRTHDAY CELEBRATION
                    </span>
                    {activeCelebration && (
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-white/20 text-white border border-white/30">
                        {heroTheme?.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black break-words leading-tight">
                    {displayGreeting}
                  </h3>
                  <p className="text-xs sm:text-sm text-pink-100 font-medium mt-1">
                    {displayCaption}
                  </p>

                  {prayersList.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-white/20 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-white/80">
                        Prophetic Blessings:
                      </p>
                      <ul className="text-xs space-y-1 text-white/95">
                        {prayersList.slice(0, 2).map((pr, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                            <span>{pr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0 w-full lg:w-auto">
                <button
                  onClick={() => setCustomizingCelebrant(primaryCelebrant)}
                  className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-all border border-white/30 flex items-center gap-1.5 cursor-pointer"
                  title="Personalise greeting message, prayers, theme and photo"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Personalise</span>
                </button>

                <button
                  onClick={() => setSharingCelebrant({ member: primaryCelebrant, celebration: activeCelebration })}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  title="Share celebration writeup on WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share via WhatsApp</span>
                </button>

                {todayBirthdays.map(({ member }) => (
                  <button
                    key={member.id}
                    onClick={() => triggerConfetti(member.id)}
                    className="px-4 py-2 rounded-xl bg-white text-pink-700 hover:bg-pink-50 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Celebrate {member.fullName.split(' ')[1] || member.fullName}!</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 5. THIS SUNDAY'S DRESS CODE (Public Member Section - Prompt Section 2A)   */}
      {/* ========================================================================= */}
      <div className="rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden transition-all card-shimmer-border glow-blue">
        {/* Subtle accent glow border at top */}
        <div className="absolute top-0 left-0 right-0 gradient-accent-line" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Shirt className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  THIS SUNDAY'S DRESS CODE
                </h3>
                {currentSundayDressCode && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 glow-dot-emerald">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Published Official Schedule
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official departmental attire guidelines for Dominion City Asaba Sunday Service
              </p>
            </div>
          </div>

          {/* Right Header Status / Date */}
          <div className="flex items-center gap-2">
            {isRecentlyPublished && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 glow-dot-blue animate-pulse">
                ✨ New Sunday Dress Code Published!
              </span>
            )}
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
              {currentSundayDressCode ? formatDate(currentSundayDressCode.sundayDate) : 'Upcoming Sunday'}
            </span>
          </div>
        </div>

        {currentSundayDressCode ? (
          <div className="mt-5 space-y-5">
            {/* Theme Title & Approved Colors */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/80 dark:bg-[#131F38] border border-slate-200/60 dark:border-slate-800/80">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Service Theme & Color Palette
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentSundayDressCode.themeTitle}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {currentSundayDressCode.description}
                </p>
              </div>

              {/* Color Swatches */}
              <div className="shrink-0 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Approved Color Combination:
                </span>
                <div className="flex items-center gap-2">
                  {currentSundayDressCode.primaryColors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-200 uppercase">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Accessible Nigerian Church Outfits: Men's & Women's Showcase (with Creative Gradient Borders) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Men's Outfit Suggestion (Creative Blue Gradient Border) */}
              <div className="p-4 rounded-xl shadow-xs flex flex-col justify-between card-gradient-border glow-blue-hover transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                      👔 Men's Recommended Attire
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Nigerian Church Style</span>
                  </div>

                  <div className="aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-3">
                    <img
                      src={currentSundayDressCode.mensPhotoUrl || currentSundayDressCode.photoUrl}
                      alt="Men's church outfit example"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {currentSundayDressCode.mensOutfit ||
                      'Corporate pressed shirt, dark/navy trousers, or elegant Senator-style native attire with clean church shoes.'}
                  </p>
                </div>

                {currentSundayDressCode.footwear && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Footwear & Finish: </span>
                    {currentSundayDressCode.footwear}
                  </div>
                )}
              </div>

              {/* Women's Outfit Suggestion (Creative Pink Gradient Border) */}
              <div className="p-4 rounded-xl shadow-xs flex flex-col justify-between card-gradient-border-pink glow-pink-hover transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wide">
                      👗 Women's Recommended Attire
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Nigerian Church Style</span>
                  </div>

                  <div className="aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-3">
                    <img
                      src={currentSundayDressCode.womensPhotoUrl || currentSundayDressCode.photoUrl}
                      alt="Women's church outfit example"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {currentSundayDressCode.womensOutfit ||
                      'Modest corporate gown, skirt suit, or tasteful coordinated lace/Ankara with complementary accessories.'}
                  </p>
                </div>

                {currentSundayDressCode.accessories && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Accessories: </span>
                    {currentSundayDressCode.accessories}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section: Next scheduled preview & Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {nextScheduledDressCode ? (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Next Scheduled Sunday: </span>
                  {nextScheduledDressCode.themeTitle} on {formatDate(nextScheduledDressCode.sundayDate)}
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Dominion City Asaba • Look regal, modest, and prepared for service.
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('dress-code')}
                  className="btn-compact bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                >
                  Dress Code Guide <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* If user is Uniform Leader or HOD, show shortcut to private management workspace */}
                {(canManageUniforms || isHOD) && (
                  <button
                    onClick={() => onNavigate('uniform-workspace')}
                    className="btn-compact btn-glow-blue"
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    Uniform Leader Workspace
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center space-y-3">
            <Shirt className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              The dress code for the upcoming Sunday has not been published yet. Please check back soon.
            </p>
            {(canManageUniforms || isHOD) && (
              <button
                onClick={() => onNavigate('uniform-workspace')}
                className="btn-compact btn-glow-blue"
              >
                Open Uniform Leader Workspace to Publish
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. SERVICE ATTENDANCE DASHBOARD SUMMARY (Prompt Section 4B)               */}
      {/* ========================================================================= */}
      <div className="rounded-2xl p-5 sm:p-6 shadow-md transition-all card-gradient-border-emerald glow-emerald">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                SERVICE ATTENDANCE DASHBOARD SUMMARY
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live attendance for {activeServiceDate} • Connected to official member directory
              </p>
            </div>
          </div>

          {/* Quick Action in Header */}
          <div className="flex items-center gap-2">
            {!isCurrentUserCheckedIn && (
              <button
                onClick={handleDashboardQuickCheckIn}
                className="btn-compact btn-glow-emerald"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                Check In for Service
              </button>
            )}

            <button
              onClick={() => onNavigate('attendance')}
              className="btn-compact bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
            >
              Full Terminal <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131F38] border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Eligible Members
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalEligible}
            </p>
            <span className="text-[10px] text-slate-400">Department Roster</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
              Checked In
            </span>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {checkedInCount}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Already in Church</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
              Not Yet Checked In
            </span>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
              {absentCount}
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400">Pending arrivals</span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
              Attendance Rate
            </span>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
              {attendancePercent}%
            </p>
            <div className="w-full h-1.5 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden mt-1.5">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, attendancePercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ACTIVE SERVING STATIONS: DESK A, DESK B, BOOKSTAND (Prompt Part 3) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Today's Serving Stations Deployments ({presentMembersList.length} Clocked In)
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Service Date: <strong className="text-blue-600 dark:text-blue-400">{formatDate(activeServiceDate)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. DESK A (Left Wing) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#101B33] border border-blue-200 dark:border-blue-900/60 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center">
                      A
                    </span>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Desk A (Left Wing)
                    </h5>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    {deskAAttendees.length} Serving
                  </span>
                </div>

                <div className="mt-2.5 space-y-2">
                  {deskAAttendees.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-3 text-center">
                      No members currently clocked in at Desk A.
                    </p>
                  ) : (
                    deskAAttendees.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0E172B] border border-slate-100 dark:border-slate-800/80"
                      >
                        <img
                          src={rec.photoUrl}
                          alt={rec.fullName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-300/50 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {rec.fullName}
                          </p>
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-medium">
                            Clocked in: {rec.clockInTime}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 2. DESK B (Right Wing) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#101B33] border border-indigo-200 dark:border-indigo-900/60 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center">
                      B
                    </span>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Desk B (Right Wing)
                    </h5>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                    {deskBAttendees.length} Serving
                  </span>
                </div>

                <div className="mt-2.5 space-y-2">
                  {deskBAttendees.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-3 text-center">
                      No members currently clocked in at Desk B.
                    </p>
                  ) : (
                    deskBAttendees.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0E172B] border border-slate-100 dark:border-slate-800/80"
                      >
                        <img
                          src={rec.photoUrl}
                          alt={rec.fullName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-300/50 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {rec.fullName}
                          </p>
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-medium">
                            Clocked in: {rec.clockInTime}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 3. BOOKSTAND (Supports Multiple Attendants) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#101B33] border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                      📚
                    </span>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Bookstand
                    </h5>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                    {bookstandAttendees.length} Serving
                  </span>
                </div>

                <div className="mt-2.5 space-y-2">
                  {bookstandAttendees.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-3 text-center">
                      No members currently clocked in at Bookstand.
                    </p>
                  ) : (
                    bookstandAttendees.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0E172B] border border-slate-100 dark:border-slate-800/80"
                      >
                        <img
                          src={rec.photoUrl}
                          alt={rec.fullName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-300/50 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {rec.fullName}
                          </p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-medium">
                            Clocked in: {rec.clockInTime}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For Authorized Officers: Absent Members & Finalize Attendance */}
        {(canManageAttendance || isHOD || isSecretary) && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAbsentList(!showAbsentList)}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                {showAbsentList ? 'Hide' : 'View'} Members Not Yet Checked In ({absentMembersList.length})
              </button>

              <button
                onClick={() => onNavigate('attendance')}
                className="btn-compact btn-glow-amber"
              >
                <Lock className="w-3.5 h-3.5" />
                Close Service / Finalise Attendance
              </button>
            </div>

            {showAbsentList && (
              <div className="mt-3 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 animate-in fade-in">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-2">
                  Eligible Department Members Pending Check-In:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {absentMembersList.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-white dark:bg-[#101B33] border border-amber-200/50 dark:border-amber-900/40 text-xs"
                    >
                      <img
                        src={m.photoUrl}
                        alt={m.fullName}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <span className="text-slate-800 dark:text-slate-200 truncate font-medium">
                        {m.fullName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. TODAY'S INFORMATION DESK SERVICE REPORT (Desk A, Desk B & Combined)    */}
      {/* ========================================================================= */}
      {(() => {
        // Today's Service Reports
        const todayReports = reports.filter((r) => r.serviceDate === todayStr && r.status === 'Submitted');
        const hasReports = todayReports.length > 0;

        // Wing distinction
        const deskAReports = todayReports.filter((r) => r.reportingWing === 'Desk A — Left Wing');
        const deskBReports = todayReports.filter((r) => r.reportingWing === 'Desk B — Right Wing');

        // Service distinction
        const firstServiceReports = todayReports.filter((r) => r.serviceType === 'Sunday 1st Service');
        const secondServiceReports = todayReports.filter((r) => r.serviceType === 'Sunday 2nd Service');

        // Desk A totals
        const deskATraffic = deskAReports.reduce((acc, r) => acc + (r.deskAttendanceCount || 0), 0);
        const deskAInquiries = deskAReports.reduce((acc, r) => acc + (r.inquiriesHandled || 0), 0);
        const deskACells = deskAReports.reduce((acc, r) => acc + (r.cellConnectionsCount || 0), 0);
        const deskALost = deskAReports.reduce((acc, r) => acc + (r.lostItemsLogged || 0), 0);
        const deskATotal = deskATraffic + deskAInquiries + deskACells + deskALost;

        // Desk B totals
        const deskBTraffic = deskBReports.reduce((acc, r) => acc + (r.deskAttendanceCount || 0), 0);
        const deskBInquiries = deskBReports.reduce((acc, r) => acc + (r.inquiriesHandled || 0), 0);
        const deskBCells = deskBReports.reduce((acc, r) => acc + (r.cellConnectionsCount || 0), 0);
        const deskBLost = deskBReports.reduce((acc, r) => acc + (r.lostItemsLogged || 0), 0);
        const deskBTotal = deskBTraffic + deskBInquiries + deskBCells + deskBLost;

        // Combined Totals
        const combinedTraffic = deskATraffic + deskBTraffic;
        const combinedInquiries = deskAInquiries + deskBInquiries;
        const combinedCells = deskACells + deskBCells;
        const combinedLost = deskALost + deskBLost;
        const grandCombinedTotal = deskATotal + deskBTotal;

        const firstServiceTotal = firstServiceReports.reduce(
          (acc, r) => acc + (r.deskAttendanceCount || 0) + (r.inquiriesHandled || 0) + (r.cellConnectionsCount || 0) + (r.lostItemsLogged || 0),
          0
        );
        const secondServiceTotal = secondServiceReports.reduce(
          (acc, r) => acc + (r.deskAttendanceCount || 0) + (r.inquiriesHandled || 0) + (r.cellConnectionsCount || 0) + (r.lostItemsLogged || 0),
          0
        );

        return (
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md transition-colors relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <BarChart3 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    TODAY'S INFORMATION DESK SERVICE REPORT
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live operational metrics for Desk A (Left Wing), Desk B (Right Wing), and combined totals
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {formatDate(todayStr)}
                </span>
                {canManageReports && (
                  <button
                    onClick={() => onNavigate('reports')}
                    className="btn-compact btn-glow-blue"
                  >
                    Manage Reports
                  </button>
                )}
              </div>
            </div>

            {!hasReports ? (
              <div className="py-10 text-center bg-slate-50/70 dark:bg-[#131F38]/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 my-4 p-6">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No service report submitted yet.
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  When front desk personnel file service reports for Desk A and Desk B, verified totals and category statistics will update here automatically.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                {/* Prominent Combined Total Hero Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-700/50">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                      COMBINED DEPARTMENT TOTAL
                    </span>
                    <h4 className="text-2xl sm:text-3xl font-black mt-1">
                      {grandCombinedTotal} Total Engagements
                    </h4>
                    <p className="text-xs text-blue-200 mt-0.5">
                      Aggregated across Desk A and Desk B today
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-center">
                    <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">
                      <span className="text-[10px] font-bold text-blue-200 uppercase block">1st Service</span>
                      <span className="text-lg font-black text-white">{firstServiceTotal}</span>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">
                      <span className="text-[10px] font-bold text-blue-200 uppercase block">2nd Service</span>
                      <span className="text-lg font-black text-white">{secondServiceTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Desk A vs Desk B Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Desk A Card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <h5 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">
                        Desk A — Left Wing ({deskAReports.length} reports)
                      </h5>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {deskATotal} total
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center">
                      <div className="p-2 bg-white dark:bg-[#0E172B] rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Traffic</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{deskATraffic}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-[#0E172B] rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Inquiries</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{deskAInquiries}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-[#0E172B] rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Cells</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{deskACells}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-[#0E172B] rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Lost Items</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{deskALost}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desk B Card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <h5 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase">
                        Desk B — Right Wing ({deskBReports.length} reports)
                      </h5>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {deskBTotal} total
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center">
                      <div className="p-2 bg-white dark:bg-[#0E172B] rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Traffic</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{deskBTraffic}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-[#0E172B] rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Inquiries</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{deskBInquiries}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-[#0E172B] rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Cells</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{deskBCells}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-[#0E172B] rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Lost Items</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{deskBLost}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Categories Summary Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Report Category</th>
                        <th className="p-3 text-center">Desk A (Left Wing)</th>
                        <th className="p-3 text-center">Desk B (Right Wing)</th>
                        <th className="p-3 text-right font-black">Combined Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                      <tr>
                        <td className="p-3 font-semibold">Desk Traffic / Attendance</td>
                        <td className="p-3 text-center">{deskATraffic}</td>
                        <td className="p-3 text-center">{deskBTraffic}</td>
                        <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">{combinedTraffic}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">Inquiries Handled</td>
                        <td className="p-3 text-center">{deskAInquiries}</td>
                        <td className="p-3 text-center">{deskBInquiries}</td>
                        <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">{combinedInquiries}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">Cell Connections</td>
                        <td className="p-3 text-center">{deskACells}</td>
                        <td className="p-3 text-center">{deskBCells}</td>
                        <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">{combinedCells}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">Lost Items Logged</td>
                        <td className="p-3 text-center">{deskALost}</td>
                        <td className="p-3 text-center">{deskBLost}</td>
                        <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">{combinedLost}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 7. BOOKSTAND – AVAILABLE BOOKS (Member Inventory View - Prompt Phase 9)   */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  BOOKSTAND – AVAILABLE BOOKS
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {books.length} Titles Listed
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore recommended kingdom literature, pricing, and current stock at the Information Desk
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[140px] sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search books..."
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-purple-600 font-medium"
              />
            </div>
            <button
              onClick={() => onNavigate('bookstand')}
              className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer shrink-0"
              title="Open full Book Stand catalogue"
            >
              Full Stand →
            </button>
            <button
              onClick={() => onNavigate('bookstand-workspace')}
              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
              title="Open Bookstand Officer management desk"
            >
              Book Officer Desk →
            </button>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
          {books
            .filter((b) => {
              if (!bookSearchQuery.trim()) return true;
              const q = bookSearchQuery.toLowerCase();
              return (
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                b.category.toLowerCase().includes(q)
              );
            })
            .map((b) => (
              <div
                key={b.id}
                className="bg-slate-50/60 dark:bg-[#131F38] rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="p-3 bg-gradient-to-b from-slate-100/90 via-slate-50 to-white dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-900/40 flex justify-center items-center">
                    <div className="w-32 sm:w-36 py-1">
                      <Book3DCover
                        coverPhoto={b.coverPhoto}
                        title={b.title}
                        author={b.author}
                        category={b.category}
                        badge={
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shadow-xs ${
                              b.status === 'In Stock'
                                ? 'bg-emerald-500 text-white'
                                : b.status === 'Low Stock'
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-500 text-white'
                            }`}
                          >
                            {b.status}
                          </span>
                        }
                      />
                    </div>
                  </div>
                  <div className="p-3.5">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      {b.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 line-clamp-1" title={b.title}>
                      {b.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{b.author}</p>
                  </div>
                </div>

                <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Retail Price</span>
                    <span className="text-sm font-black text-purple-700 dark:text-purple-300">
                      {formatNaira(b.sellingPrice)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Availability</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {b.currentStock} copies
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. Operations Highlights: Sunday Roster & Weekly Prayer Routine           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 8A. Sunday Service Roster Preview */}
        <div className="rounded-2xl p-5 shadow-xs flex flex-col justify-between card-gradient-border glow-blue-hover transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Sunday Service Roster
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 glow-dot-emerald">
                {currentSundayRoster.serviceType}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Team Leader:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{currentSundayRoster.teamLeader}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Prayer Leader:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{currentSundayRoster.prayerLeader}</span>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Assigned Personnel ({currentSundayRoster.assignments.length}):
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {currentSundayRoster.assignments.slice(0, 4).map((asg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-[#131F38] border border-slate-100 dark:border-slate-800"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {asg.memberName}
                      </span>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate ml-2">
                        {asg.dutyRole}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigate('roster')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              Open Full Timetable <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400">Briefing 06:45 AM</span>
          </div>
        </div>

        {/* 7B. Meetings & Thursday 9:00 PM Prayer Schedule */}
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Prayer & Dept Meeting
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 glow-dot-amber">
                Weekly Routine
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Thursday 9:00 PM Prayer Card (Creative Amber Border & Glow) */}
              <div className="p-3.5 rounded-xl border transition-all card-gradient-border-amber glow-amber">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                    🙏 Thursday Prayer Watch
                  </span>
                  <span className="text-[11px] font-black text-amber-700 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-900/50 px-2 py-0.5 rounded">
                    9:00 PM
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 dark:text-amber-200/80 mt-1">
                  Next session: {nextThursday.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} • Online Audio Prayer Line
                </p>
              </div>

              {/* Department Meeting */}
              {nextMeeting && (
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950 dark:text-blue-200 truncate">
                      {nextMeeting.title}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 whitespace-nowrap ml-1">
                      {formatDate(nextMeeting.date)}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 dark:text-blue-200/80 mt-1">
                    Time: {nextMeeting.time} • Venue: {nextMeeting.venue}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigate('meetings')}
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              All Meeting Schedules <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400">1st & 3rd Sundays</span>
          </div>
        </div>
      </div>

      {/* 8. Dual Section: Upcoming Member Birthdays & Recent Lost & Found */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Birthdays Card (Creative Pink Gradient Border) */}
        <div className="rounded-2xl p-5 shadow-xs transition-all card-gradient-border-pink glow-pink-hover">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400">
                <Cake className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Member Birthdays</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Connected to official member directory</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('birthdays')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
            >
              Full Calendar →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingBirthdays.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No upcoming birthdays in the next 60 days.
              </p>
            ) : (
              upcomingBirthdays.map(({ member, info }) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#131F38] border border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-100 dark:ring-pink-900/60 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{member.fullName}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{member.departmentRole}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-pink-600 dark:text-pink-400 block">
                      {info.nextBirthdayDate.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      In {info.daysUntil} day{info.daysUntil > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Lost and Found Items (Safeguarded at Desk - Creative Amber Gradient Border) */}
        <div className="rounded-2xl p-5 shadow-xs transition-all card-gradient-border-amber glow-amber-hover">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <PackageSearch className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Lost & Found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Safeguarded at Information Desk</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('lost-found')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
            >
              View All Register →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {recentLostItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#131F38] transition-colors"
              >
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        item.status === 'Unclaimed'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-800/60'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-800/60'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    Found at {item.locationFound} ({formatDate(item.dateFound)})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9. Departmental Quick Navigation */}
      <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Departmental Quick Navigation
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('kiosk')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Cell & Satellite Folders</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Find cells across Asaba with landmarks</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('members')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Members Folder</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Personnel profiles & assignments</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('secretary-workspace')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Secretary Office</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Events, notices & schedules</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('welfare-workspace')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-pink-500 dark:hover:border-pink-500 hover:bg-pink-50/40 dark:hover:bg-pink-950/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <HeartHandshake className="w-5 h-5 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Welfare Desk</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Absentee outreach & care</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('collections')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Collection Forms</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{collections.filter((c) => c.status === 'Open').length} forms open for submission</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('handbook')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-amber-950/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Information Handbook</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">SOPs, emergency numbers & guides</p>
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <MyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <RecordFoundItemModal
        isOpen={isRecordItemModalOpen}
        onClose={() => setIsRecordItemModalOpen(false)}
      />

      {/* Birthday Personalisation Modal */}
      {customizingCelebrant && (
        <BirthdayCustomizerModal
          isOpen={Boolean(customizingCelebrant)}
          onClose={() => setCustomizingCelebrant(null)}
          celebrant={customizingCelebrant}
        />
      )}

      {/* Birthday WhatsApp Share Modal */}
      {sharingCelebrant && (
        <ShareModal
          isOpen={Boolean(sharingCelebrant)}
          onClose={() => setSharingCelebrant(null)}
          documentTitle={`Birthday Celebration — ${sharingCelebrant.member.fullName}`}
          documentType="Birthday Post"
          subtitle={`Dominion City Asaba Information Desk Honors ${sharingCelebrant.member.fullName}`}
          defaultRecipientName={sharingCelebrant.member.fullName}
          defaultRecipientPhone={sharingCelebrant.member.phone}
          contentLines={[
            `# Birthday Celebration: ${sharingCelebrant.member.fullName}`,
            `Department Role: ${sharingCelebrant.member.departmentRole}`,
            '',
            '## Official Department Greeting:',
            sharingCelebrant.celebration?.greeting ||
              `Happy Glorious Birthday, ${sharingCelebrant.member.fullName}! May God crown your new year with glory, favor, and extraordinary grace!`,
            '',
            '## Prophetic Prayers & Declarations:',
            ...(sharingCelebrant.celebration?.prayers?.map((p, idx) => `${idx + 1}. ${p}`) || [
              '1. May the Lord crown your new age with exceptional grace, divine honor, and supernatural wisdom.',
              '2. Lines are fallen unto you in pleasant places; you shall walk in undisputable victory and peace.',
            ]),
          ]}
          summaryNotes="Certified by Dominion City Asaba Information Desk Department."
        />
      )}
    </div>
  );
};
