import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { calculateBirthdayInfo, MONTH_NAMES } from '../../utils/dateUtils';
import { PrintModal } from '../common/PrintModal';
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
} from 'lucide-react';

export const BirthdayCalendarModule: React.FC = () => {
  const { members } = useData();
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Filter window: 'all', 'today', 'week', 'month', 'two_months', 'three_months'
  const [windowFilter, setWindowFilter] = useState<string>('all');

  const memberBirthdays = members.map((m) => {
    const info = calculateBirthdayInfo(m.birthDay, m.birthMonth, m.birthYear, today);
    return { member: m, info };
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-pink-50 text-pink-600">
              <Cake className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Department Birthday Calendar & Automated Reminders
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated milestone alerts: 3 months, 2 months, 1 month, 1 week, and today!
          </p>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition-colors shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print Birthday Schedule
        </button>
      </div>

      {/* Advance Window Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
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
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
            <span>Upcoming Birthday Reminders ({filteredUpcoming.length})</span>
            <span className="text-xs text-slate-400 font-normal">Calculated dynamically</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredUpcoming.map(({ member, info }) => (
              <div
                key={member.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  info.isToday
                    ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-300 shadow-md ring-2 ring-pink-400'
                    : info.isThisWeek
                    ? 'bg-pink-50/40 border-pink-200 shadow-xs'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-pink-200 shadow-xs shrink-0"
                    />
                    <div className="text-right">
                      {info.isToday ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-600 text-white animate-pulse">
                          🎉 TODAY!
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          In {info.daysUntil} day{info.daysUntil > 1 ? 's' : ''}
                        </span>
                      )}
                      <p className="text-xs font-bold text-pink-700 mt-1">
                        {member.birthDay} {MONTH_NAMES[member.birthMonth - 1]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-bold text-slate-900">{member.fullName}</h4>
                    <p className="text-xs text-slate-500">{member.departmentRole}</p>
                    <p className="text-[11px] text-pink-600 dark:text-pink-400 font-medium mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {info.isToday ? 'Celebrating today!' : `Celebration in ${info.daysUntil} day${info.daysUntil === 1 ? '' : 's'}`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {member.residentialArea}
                  </span>
                  <button
                    onClick={() => handleCelebrate(member.fullName)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Wish Birthday
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Monthly Calendar Navigator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Monthly View</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setSelectedMonth((prev) => (prev === 1 ? 12 : prev - 1))
                }
                className="p-1 rounded hover:bg-slate-100 cursor-pointer text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-blue-900 px-2">
                {MONTH_NAMES[selectedMonth - 1]}
              </span>
              <button
                onClick={() =>
                  setSelectedMonth((prev) => (prev === 12 ? 1 : prev + 1))
                }
                className="p-1 rounded hover:bg-slate-100 cursor-pointer text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Members born in <strong className="text-slate-800">{MONTH_NAMES[selectedMonth - 1]}</strong>:
          </p>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {monthMembers.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No birthdays recorded for {MONTH_NAMES[selectedMonth - 1]}.
              </p>
            ) : (
              monthMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={m.photoUrl}
                      alt={m.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{m.fullName}</p>
                      <p className="text-[10px] text-slate-400">{m.departmentRole}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-pink-600 bg-white px-2 py-1 rounded-md border border-pink-100 shadow-2xs">
                    {m.birthDay}th
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Official Print Birthday List Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="DOMINION CITY ASABA — DEPARTMENT BIRTHDAY CALENDAR"
        subtitle="Annual Member Birthday Directory and Celebration Schedule"
        documentRef={`BDAY-CAL-${new Date().getFullYear()}`}
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
    </div>
  );
};
