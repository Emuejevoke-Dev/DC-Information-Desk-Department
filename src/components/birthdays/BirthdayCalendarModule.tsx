import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { calculateBirthdayInfo, MONTH_NAMES } from '../../utils/dateUtils';
import { PrintModal } from '../common/PrintModal';
import { ShareModal } from '../common/ShareModal';
import { BirthdayCustomizerModal, THEME_CONFIGS } from './BirthdayCustomizerModal';
import { DepartmentMember, BirthdayCelebration } from '../../types/models';
import confetti from 'canvas-confetti';
import {
  Cake,
  Calendar,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Gift,
  Share2,
  Edit3,
  Bookmark,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const BirthdayCalendarModule: React.FC = () => {
  const { isHOD, isOperations, isSecretary } = useAuth();
  const { members, birthdayCelebrations, birthdayTemplates } = useData();

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Customiser modal state
  const [customizingMember, setCustomizingMember] = useState<DepartmentMember | null>(null);

  // Single celebrant share state
  const [sharingMember, setSharingMember] = useState<{
    member: DepartmentMember;
    celebration?: BirthdayCelebration;
  } | null>(null);

  // Filter window: 'all', 'today', 'week', 'month', 'two_months', 'three_months'
  const [windowFilter, setWindowFilter] = useState<string>('all');

  const memberBirthdays = members.map((m) => {
    const info = calculateBirthdayInfo(m.birthDay, m.birthMonth, m.birthYear, today);
    const customCelebration = birthdayCelebrations.find((c) => c.memberId === m.id);
    return { member: m, info, customCelebration };
  });

  const sortedUpcoming = [...memberBirthdays].sort(
    (a, b) => a.info.daysUntil - b.info.daysUntil
  );

  const filteredUpcoming = sortedUpcoming.filter(({ info }) => {
    if (windowFilter === 'today') return info.isToday;
    if (windowFilter === 'week') return info.isThisWeek;
    if (windowFilter === 'month') return info.isThisMonth;
    if (windowFilter === 'two_months') return info.isTwoMonths || info.isThisMonth;
    if (windowFilter === 'three_months')
      return info.isThreeMonths || info.isTwoMonths || info.isThisMonth;
    return true;
  });

  // Month-specific members for the calendar view
  const monthMembers = members.filter((m) => m.birthMonth === selectedMonth);

  const handleCelebrate = (name: string) => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#EC4899', '#3B82F6', '#F59E0B', '#10B981'],
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0E172B] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300">
              <Cake className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Department Birthday Calendar & Personalised Celebrations
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Custom greetings, editable prophetic prayers, creative visual themes & WhatsApp dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs cursor-pointer"
            title="Share full birthday schedule via WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Schedule</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Schedule</span>
          </button>
        </div>
      </div>

      {/* Advance Window Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#0E172B] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-xs font-bold text-slate-400 mr-1">Reminder Window:</span>
        {[
          { id: 'all', label: 'All Upcoming' },
          { id: 'today', label: '🎂 Today Only' },
          { id: 'week', label: 'Next 7 Days' },
          { id: 'month', label: '1 Month (30 Days)' },
          { id: 'two_months', label: '2 Months (60 Days)' },
          { id: 'three_months', label: '3 Months (90 Days)' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setWindowFilter(chip.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              windowFilter === chip.id
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Dual Section: Live Reminder Cards + Monthly Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Celebrations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>Upcoming Celebrations ({filteredUpcoming.length})</span>
            </h3>
            <span className="text-xs text-slate-400">
              Personalise greeting & prayers for any celebrant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredUpcoming.map(({ member, info, customCelebration }) => {
              const themeConfig = customCelebration
                ? THEME_CONFIGS[customCelebration.theme]
                : THEME_CONFIGS.gold;

              const effectivePhoto = customCelebration?.photoUrl || member.photoUrl;

              return (
                <div
                  key={member.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    info.isToday
                      ? 'bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 dark:from-pink-950/40 dark:to-slate-900 border-pink-300 dark:border-pink-800 shadow-md ring-2 ring-pink-400'
                      : customCelebration
                      ? `${themeConfig.cardBg} ${themeConfig.borderColor} shadow-xs`
                      : 'bg-white dark:bg-[#0E172B] border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative">
                        <img
                          src={effectivePhoto}
                          alt={member.fullName}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-pink-200 dark:ring-pink-900 shadow-xs shrink-0"
                        />
                        {info.isToday && (
                          <span className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-pink-600 text-white text-[10px] shadow-xs">
                            🎂
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {info.isToday ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-600 text-white animate-pulse">
                            🎉 TODAY!
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            In {info.daysUntil} day{info.daysUntil > 1 ? 's' : ''}
                          </span>
                        )}
                        <p className="text-xs font-bold text-pink-700 dark:text-pink-400 mt-1">
                          {member.birthDay} {MONTH_NAMES[member.birthMonth - 1]}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white break-words">
                          {member.fullName}
                        </h4>
                        {customCelebration && (
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${themeConfig.tagBg}`}>
                            {themeConfig.name.split(' ')[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{member.departmentRole}</p>

                      {/* Custom write-up preview if published */}
                      {customCelebration ? (
                        <div className="mt-2.5 p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 text-xs">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                            "{customCelebration.greeting}"
                          </p>
                          {customCelebration.prayers && customCelebration.prayers.length > 0 && (
                            <p className="text-[11px] text-pink-600 dark:text-pink-400 font-medium mt-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate">{customCelebration.prayers[0]}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-pink-600 dark:text-pink-400 font-medium mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {info.isToday ? 'Celebrating today!' : `Celebration in ${info.daysUntil} day${info.daysUntil === 1 ? '' : 's'}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
                      {member.residentialArea}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Customise write-up & prayers button */}
                      <button
                        onClick={() => setCustomizingMember(member)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-800 dark:bg-pink-950/70 dark:text-pink-200 transition-colors cursor-pointer"
                        title="Personalise greeting message, prayers, theme and photo"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{customCelebration ? 'Edit' : 'Personalise'}</span>
                      </button>

                      {/* Celebrate Confetti */}
                      <button
                        onClick={() => handleCelebrate(member.fullName)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Wish
                      </button>

                      {/* WhatsApp share celebrant card */}
                      <button
                        onClick={() => {
                          setSharingMember({
                            member,
                            celebration: customCelebration,
                          });
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                        title="Share celebration post via WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Monthly Calendar Navigator */}
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly View</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setSelectedMonth((prev) => (prev === 1 ? 12 : prev - 1))
                }
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 px-2">
                {MONTH_NAMES[selectedMonth - 1]}
              </span>
              <button
                onClick={() =>
                  setSelectedMonth((prev) => (prev === 12 ? 1 : prev + 1))
                }
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Members born in <strong className="text-slate-800 dark:text-slate-200">{MONTH_NAMES[selectedMonth - 1]}</strong>:
          </p>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {monthMembers.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No birthdays recorded for {MONTH_NAMES[selectedMonth - 1]}.
              </p>
            ) : (
              monthMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={m.photoUrl}
                      alt={m.fullName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{m.fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{m.departmentRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-black text-pink-600 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-pink-100 dark:border-pink-900/50 shadow-2xs">
                      {m.birthDay}th
                    </span>
                    <button
                      onClick={() => setCustomizingMember(m)}
                      className="p-1 text-slate-400 hover:text-pink-600 cursor-pointer"
                      title="Customise greeting for this member"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Birthday Customizer Modal */}
      {customizingMember && (
        <BirthdayCustomizerModal
          isOpen={Boolean(customizingMember)}
          onClose={() => setCustomizingMember(null)}
          celebrant={customizingMember}
        />
      )}

      {/* Single Celebrant WhatsApp & PDF Share Modal */}
      {sharingMember && (
        <ShareModal
          isOpen={Boolean(sharingMember)}
          onClose={() => setSharingMember(null)}
          documentTitle={`Birthday Celebration — ${sharingMember.member.fullName}`}
          documentType="Birthday Post"
          subtitle={`Dominion City Asaba Information Desk Honors ${sharingMember.member.fullName}`}
          documentRef={`BDAY-${sharingMember.member.birthMonth}-${sharingMember.member.birthDay}`}
          defaultRecipientName={sharingMember.member.fullName}
          defaultRecipientPhone={sharingMember.member.phone}
          contentLines={[
            `# Birthday Celebration: ${sharingMember.member.fullName}`,
            `Department Role: ${sharingMember.member.departmentRole}`,
            `Celebration Date: ${sharingMember.member.birthDay} ${MONTH_NAMES[sharingMember.member.birthMonth - 1]}`,
            '',
            '## Official Department Greeting:',
            sharingMember.celebration?.greeting ||
              `Happy Glorious Birthday, ${sharingMember.member.fullName}! May God crown your new year with glory, favor, and extraordinary grace!`,
            '',
            '## Prophetic Prayers & Declarations:',
            ...(sharingMember.celebration?.prayers?.map((p, idx) => `${idx + 1}. ${p}`) || [
              '1. May the Lord crown your new age with exceptional grace, divine honor, and supernatural wisdom.',
              '2. Lines are fallen unto you in pleasant places; you shall walk in undisputable victory and peace.',
            ]),
          ]}
          summaryNotes="Certified by Dominion City Asaba Information Desk Department."
        />
      )}

      {/* Full Birthday Schedule Print & Share Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="DOMINION CITY ASABA — DEPARTMENT BIRTHDAY CALENDAR"
        subtitle="Annual Member Birthday Directory and Celebration Schedule"
        documentRef={`BDAY-CAL-${new Date().getFullYear()}`}
        documentType="Birthday Post"
      >
        <div className="space-y-4">
          <table className="w-full text-[11px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-pink-800 text-white font-bold">
                <th className="p-2 border border-slate-300 text-left">Month</th>
                <th className="p-2 border border-slate-300 text-left">Day</th>
                <th className="p-2 border border-slate-300 text-left">Member Full Name</th>
                <th className="p-2 border border-slate-300 text-left">Department Role</th>
                <th className="p-2 border border-slate-300 text-left">Residential Area</th>
              </tr>
            </thead>
            <tbody>
              {members
                .slice()
                .sort((a, b) => a.birthMonth - b.birthMonth || a.birthDay - b.birthDay)
                .map((m, idx) => (
                  <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 border border-slate-300 font-bold text-pink-900">
                      {MONTH_NAMES[m.birthMonth - 1]}
                    </td>
                    <td className="p-2 border border-slate-300 font-bold">{m.birthDay}</td>
                    <td className="p-2 border border-slate-300 font-bold">{m.fullName}</td>
                    <td className="p-2 border border-slate-300">{m.departmentRole}</td>
                    <td className="p-2 border border-slate-300">{m.residentialArea}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </PrintModal>

      {/* Full Schedule Global Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentTitle="Dominion City Asaba — Department Birthday Directory"
        documentType="Birthday Post"
        subtitle="Complete Member Birthday Schedule & Celebration Register"
        documentRef={`BDAY-DIR-${new Date().getFullYear()}`}
        tableHeaders={['Month', 'Day', 'Full Name', 'Department Role', 'Residential Area']}
        tableRows={members
          .slice()
          .sort((a, b) => a.birthMonth - b.birthMonth || a.birthDay - b.birthDay)
          .map((m) => [
            MONTH_NAMES[m.birthMonth - 1],
            String(m.birthDay),
            m.fullName,
            m.departmentRole,
            m.residentialArea,
          ])}
        summaryNotes="Official Department Birthday Directory — Dominion City Asaba Information Desk."
      />
    </div>
  );
};
