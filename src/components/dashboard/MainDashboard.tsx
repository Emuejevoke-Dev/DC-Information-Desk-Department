import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  calculateBirthdayInfo,
  getNextSunday,
  getNextThursdayPrayer,
  formatDate,
} from '../../utils/dateUtils';
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
} from 'lucide-react';
import { EventFlyerCarousel } from './EventFlyerCarousel';
import { MyProfileModal } from '../members/MyProfileModal';
import { RecordFoundItemModal } from '../lost-found/RecordFoundItemModal';

interface MainDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenQuickAction?: (action: string) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onNavigate,
}) => {
  const {
    currentUser,
    canManageReports,
    canManageAttendance,
    canManageUniforms,
    isHOD,
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
    addAttendanceRecord,
  } = useData();

  const [celebratedMemberId, setCelebratedMemberId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRecordItemModalOpen, setIsRecordItemModalOpen] = useState(false);
  const [showAbsentList, setShowAbsentList] = useState(false);

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1A3B] via-[#0D2554] to-[#143A80] text-white p-5 sm:p-6 shadow-lg border border-blue-800/60 card-shimmer-border glow-blue">
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
      {todayBirthdays.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="p-3 bg-white/20 rounded-2xl text-2xl animate-bounce">
                🎂
              </div>
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-white/30 text-white">
                  DEPARTMENT BIRTHDAY CELEBRATION
                </span>
                <h3 className="text-lg sm:text-xl font-black mt-1">
                  Happy Birthday to{' '}
                  {todayBirthdays.map((b) => b.member.fullName).join(' & ')}!
                </h3>
                <p className="text-xs text-pink-100 mt-0.5">
                  May God crown your new year with glory, favor, and extraordinary grace!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {todayBirthdays.map(({ member }) => (
                <button
                  key={member.id}
                  onClick={() => triggerConfetti(member.id)}
                  className="px-4 py-2 rounded-xl bg-white text-pink-700 hover:bg-pink-50 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Celebrate {member.fullName.split(' ')[1] || member.fullName}!
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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

        {/* These Members Are Already in Church Section (with profile photos) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                These Members Are Already in Church ({presentMembersList.length})
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">Photos retrieved from member records</span>
          </div>

          {presentMembersList.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 dark:bg-[#131F38] rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No check-ins recorded yet for today's service. Members can click "Check In for Service" to sign in.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {presentMembersList.map((rec) => (
                <div
                  key={rec.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131F38] border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 hover:shadow-xs transition-shadow"
                >
                  <img
                    src={rec.photoUrl}
                    alt={rec.fullName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400/50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {rec.fullName}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium truncate">
                      {rec.clockInTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
      {/* 7. Operations Highlights: Sunday Roster & Weekly Prayer Routine           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 7A. Sunday Service Roster Preview */}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('kiosk')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Cell & Satellite Directory</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Find cells across Asaba with landmarks</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('members')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Member Directory</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Personnel profiles & assignments</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('collections')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Collection Forms</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{collections.filter((c) => c.status === 'Open').length} forms open for submission</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('handbook')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform mb-2" />
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
    </div>
  );
};
