import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ServiceRoster, RosterDuty } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { formatDate } from '../../utils/dateUtils';
import {
  CalendarCheck,
  Plus,
  Printer,
  Copy,
  Edit2,
  Trash2,
  X,
  Users,
  CheckCircle2,
  Shirt,
  Sparkles,
  Calendar,
  Clock,
  Sun,
  Flame,
  ArrowRight,
  ShieldCheck,
  Filter,
} from 'lucide-react';

interface RosterModuleProps {
  onNavigateToDressCode?: () => void;
}

function getUpcomingSunday(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (7 - day) % 7 === 0 ? 0 : 7 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

function getUpcomingTuesday(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  // Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6
  const diff = (2 - day + 7) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

export const RosterModule: React.FC<RosterModuleProps> = ({ onNavigateToDressCode }) => {
  const { canManageRosters, isHOD, isOperations, isSecretary } = useAuth();
  const { rosters, members, dressCodes, addRoster, updateRoster, deleteRoster } = useData();

  const isAuthorized = canManageRosters || isHOD || isOperations || isSecretary;

  const todayStr = new Date().toISOString().split('T')[0];
  const nextSundayStr = getUpcomingSunday();
  const nextTuesdayStr = getUpcomingTuesday();

  // Filter Tabs
  const [filterTab, setFilterTab] = useState<'all' | 'sunday' | 'tuesday' | 'upcoming' | 'past'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoster, setEditingRoster] = useState<ServiceRoster | null>(null);
  const [selectedRosterForPrint, setSelectedRosterForPrint] = useState<ServiceRoster | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [rosterToCopy, setRosterToCopy] = useState<ServiceRoster | null>(null);
  const [copyTargetDate, setCopyTargetDate] = useState<string>(nextSundayStr);

  const [formData, setFormData] = useState<{
    serviceDate: string;
    serviceType: 'Sunday 1st Service' | 'Sunday 2nd Service' | 'Tuesday Word & Communion' | 'Special Meeting';
    teamLeader: string;
    prayerLeader: string;
    assignments: RosterDuty[];
    notes: string;
  }>({
    serviceDate: nextSundayStr,
    serviceType: 'Sunday 1st Service',
    teamLeader: members[0]?.fullName || 'Brother Chukwudi Okonkwo',
    prayerLeader: members[1]?.fullName || 'Sister Ngozi Adeleke',
    assignments: [
      { memberId: members[0]?.id || '1', memberName: members[0]?.fullName || '', dutyRole: 'Desk Lead & VIP Inquiries' },
      { memberId: members[1]?.id || '2', memberName: members[1]?.fullName || '', dutyRole: 'Cell Placements & Registrations' },
      { memberId: members[2]?.id || '3', memberName: members[2]?.fullName || '', dutyRole: 'First Timers Welcome & Hospitality' },
    ],
    notes: 'Please arrive by 06:45 AM for pre-service prayer and briefing.',
  });

  // Filtered Rosters List
  const filteredRosters = rosters.filter((roster) => {
    if (filterTab === 'sunday') {
      return roster.serviceType.toLowerCase().includes('sunday');
    }
    if (filterTab === 'tuesday') {
      return roster.serviceType.toLowerCase().includes('tuesday');
    }
    if (filterTab === 'upcoming') {
      return roster.serviceDate >= todayStr;
    }
    if (filterTab === 'past') {
      return roster.serviceDate < todayStr;
    }
    return true;
  });

  const handleOpenAddModal = (defaultType: 'Sunday 1st Service' | 'Tuesday Word & Communion' = 'Sunday 1st Service') => {
    setEditingRoster(null);
    const targetDate = defaultType.includes('Tuesday') ? nextTuesdayStr : nextSundayStr;
    const activeMembers = members.filter((m) => m.status === 'Active');

    setFormData({
      serviceDate: targetDate,
      serviceType: defaultType,
      teamLeader: activeMembers[0]?.fullName || 'Brother Chukwudi Okonkwo',
      prayerLeader: activeMembers[1]?.fullName || 'Sister Ngozi Adeleke',
      assignments: [
        { memberId: activeMembers[0]?.id || '1', memberName: activeMembers[0]?.fullName || '', dutyRole: 'Desk Lead & VIP Inquiries' },
        { memberId: activeMembers[1]?.id || '2', memberName: activeMembers[1]?.fullName || '', dutyRole: 'Visitor Enquiries & Hospitality' },
        { memberId: activeMembers[2]?.id || '3', memberName: activeMembers[2]?.fullName || '', dutyRole: 'First Timers Welcome Desk' },
      ],
      notes: defaultType.includes('Tuesday')
        ? 'Midweek Word & Communion Service. Station briefing at 05:00 PM.'
        : 'Sunday Service. Pre-service prayer and station briefing at 06:45 AM.',
    });
    setIsAddModalOpen(true);
  };

  // Smart Auto-Generate Roster for upcoming service
  const handleAutoGenerateRoster = (targetService: 'Sunday' | 'Tuesday') => {
    const activeMembers = members.filter((m) => m.status === 'Active');
    if (activeMembers.length < 3) {
      alert('At least 3 active department members are required to auto-generate a balanced duty roster.');
      return;
    }

    // Shuffle active members to ensure fair rotation without duplicates
    const shuffled = [...activeMembers].sort(() => Math.random() - 0.5);

    const leader = shuffled[0];
    const prayer = shuffled[1];

    const dutyRoles = [
      'Desk Lead & Executive Inquiries',
      'First Timers Hospitality & Welcome',
      'Cell Placements & Satellite Enquiries',
      'Visitor Enquiries & Directional Support',
      'Bookstand & Literature Desk Liaison',
      'Lost & Found Custodial Logging',
    ];

    // Pick unique remaining members for assignments
    const availableAssignees = shuffled.slice(2);
    const generatedAssignments: RosterDuty[] = [];

    availableAssignees.slice(0, Math.min(dutyRoles.length, availableAssignees.length)).forEach((member, idx) => {
      generatedAssignments.push({
        memberId: member.id,
        memberName: member.fullName,
        dutyRole: dutyRoles[idx % dutyRoles.length],
      });
    });

    const isSunday = targetService === 'Sunday';
    const targetDate = isSunday ? nextSundayStr : nextTuesdayStr;
    const targetType = isSunday ? 'Sunday 1st Service' : 'Tuesday Word & Communion';

    setEditingRoster(null);
    setFormData({
      serviceDate: targetDate,
      serviceType: targetType,
      teamLeader: leader.fullName,
      prayerLeader: prayer.fullName,
      assignments: generatedAssignments,
      notes: isSunday
        ? 'Auto-generated Sunday Duty Roster. Pre-service prayer starts at 06:45 AM in the Information Desk Office.'
        : 'Auto-generated Tuesday Word & Communion Roster. Desk briefing commences at 05:00 PM.',
    });

    setIsAddModalOpen(true);
  };

  const handleAddAssignment = () => {
    const activeMembers = members.filter((m) => m.status === 'Active');
    const existingIds = new Set(formData.assignments.map((a) => a.memberId));
    const nextAvailable = activeMembers.find((m) => !existingIds.has(m.id)) || activeMembers[0] || members[0];

    if (nextAvailable) {
      setFormData({
        ...formData,
        assignments: [
          ...formData.assignments,
          {
            memberId: nextAvailable.id,
            memberName: nextAvailable.fullName,
            dutyRole: 'Visitor Hospitality & Enquiries',
          },
        ],
      });
    }
  };

  const handleRemoveAssignment = (index: number) => {
    setFormData({
      ...formData,
      assignments: formData.assignments.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceDate) {
      alert('Please select a service date.');
      return;
    }

    if (editingRoster) {
      updateRoster(editingRoster.id, {
        ...formData,
        status: 'Scheduled',
      });
      setEditingRoster(null);
    } else {
      addRoster({
        ...formData,
        status: 'Scheduled',
      });
    }

    setIsAddModalOpen(false);
  };

  const handleEditClick = (r: ServiceRoster) => {
    setEditingRoster(r);
    setFormData({
      serviceDate: r.serviceDate,
      serviceType: r.serviceType,
      teamLeader: r.teamLeader,
      prayerLeader: r.prayerLeader,
      assignments: r.assignments,
      notes: r.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenCopyModal = (r: ServiceRoster) => {
    setRosterToCopy(r);
    // Suggest the next appropriate date
    const isTuesday = r.serviceType.toLowerCase().includes('tuesday');
    setCopyTargetDate(isTuesday ? nextTuesdayStr : nextSundayStr);
    setIsCopyModalOpen(true);
  };

  const handleExecuteCopy = () => {
    if (!rosterToCopy || !copyTargetDate) return;

    addRoster({
      serviceDate: copyTargetDate,
      serviceType: rosterToCopy.serviceType,
      teamLeader: rosterToCopy.teamLeader,
      prayerLeader: rosterToCopy.prayerLeader,
      assignments: rosterToCopy.assignments.map((a) => ({ ...a })),
      notes: rosterToCopy.notes ? `Copied from ${formatDate(rosterToCopy.serviceDate)}: ${rosterToCopy.notes}` : '',
      status: 'Scheduled',
    });

    setIsCopyModalOpen(false);
    setRosterToCopy(null);
    alert(`Service Roster successfully duplicated for ${formatDate(copyTargetDate)} without altering the original record.`);
  };

  const handleDeleteWithConfirmation = (roster: ServiceRoster) => {
    const confirmationText = `Are you sure you want to delete the ${roster.serviceType} roster for ${formatDate(roster.serviceDate)}?\n\nNOTE: Deleting this roster will NOT delete member profiles or historical attendance records.`;
    if (confirm(confirmationText)) {
      deleteRoster(roster.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0E172B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 shadow-2xs">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Service Roster Management
              </h2>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 ml-2">
                Sunday & Midweek Rotations
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sunday & Tuesday service duty allocations, officer assignments, and station coverage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAuthorized && (
            <>
              {/* Auto Generate Sunday Button */}
              <button
                onClick={() => handleAutoGenerateRoster('Sunday')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xs cursor-pointer"
                title="Auto-rotate active members for upcoming Sunday service"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Generate Sunday
              </button>

              {/* Auto Generate Tuesday Button */}
              <button
                onClick={() => handleAutoGenerateRoster('Tuesday')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer"
                title="Auto-rotate active members for upcoming Tuesday Word & Communion service"
              >
                <Flame className="w-3.5 h-3.5" />
                Auto-Generate Tuesday
              </button>

              {/* Create Manual Roster */}
              <button
                onClick={() => handleOpenAddModal('Sunday 1st Service')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Roster
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0E172B] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-blue-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Rosters ({rosters.length})
          </button>
          <button
            onClick={() => setFilterTab('sunday')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterTab === 'sunday'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Sunday Services
          </button>
          <button
            onClick={() => setFilterTab('tuesday')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterTab === 'tuesday'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Tuesday Communion
          </button>
          <button
            onClick={() => setFilterTab('upcoming')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterTab === 'upcoming'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Upcoming
          </button>
          <button
            onClick={() => setFilterTab('past')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterTab === 'past'
                ? 'bg-slate-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Past Archives
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
          Showing <strong>{filteredRosters.length}</strong> roster records
        </div>
      </div>

      {/* Empty State */}
      {filteredRosters.length === 0 && (
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center shadow-xs">
          <CalendarCheck className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No service rosters found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No rosters match the current filter. Click "Auto-Generate" or "New Roster" above to create one.
          </p>
        </div>
      )}

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRosters.map((roster) => {
          const isSunday = roster.serviceType.toLowerCase().includes('sunday');
          const isTuesday = roster.serviceType.toLowerCase().includes('tuesday');
          const isApproaching = roster.serviceDate === nextSundayStr || roster.serviceDate === nextTuesdayStr;
          const matchingDressCode = dressCodes.find((d) => d.sundayDate === roster.serviceDate);

          return (
            <div
              key={roster.id}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                isApproaching
                  ? isTuesday
                    ? 'bg-gradient-to-b from-purple-50/70 to-white dark:from-purple-950/30 dark:to-[#0E172B] border-purple-400 dark:border-purple-800 shadow-md ring-2 ring-purple-500/20'
                    : 'bg-gradient-to-b from-emerald-50/70 to-white dark:from-emerald-950/30 dark:to-[#0E172B] border-emerald-400 dark:border-emerald-800 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-[#0E172B] border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    {isApproaching && (
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white mb-1.5 shadow-2xs ${
                          isTuesday ? 'bg-purple-600' : 'bg-emerald-600'
                        }`}
                      >
                        {isTuesday ? 'UPCOMING TUESDAY COMMUNION' : 'THIS UPCOMING SUNDAY'}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {isTuesday ? <Flame className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {roster.serviceType}
                      </h3>
                    </div>
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-400 mt-1">
                      📅 {formatDate(roster.serviceDate)}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {roster.status}
                  </span>
                </div>

                {/* Linked Dress code banner if present */}
                {matchingDressCode && (
                  <div className="my-3 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-blue-950 dark:text-blue-200 font-bold truncate">
                        Attire Theme: {matchingDressCode.themeTitle}
                      </span>
                    </div>
                    {onNavigateToDressCode && (
                      <button
                        onClick={onNavigateToDressCode}
                        className="text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                      >
                        View Attire →
                      </button>
                    )}
                  </div>
                )}

                {/* Leaders */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                      Team Leader
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{roster.teamLeader}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                      Pre-Service Prayer
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{roster.prayerLeader}</span>
                  </div>
                </div>

                {/* Assigned Personnel */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Assigned Personnel ({roster.assignments.length})
                    </h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Station Verified
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {roster.assignments.map((asg, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">{asg.memberName}</span>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                          {asg.dutyRole}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {roster.notes && (
                  <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <strong>Briefing:</strong> {roster.notes}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedRosterForPrint(roster)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Duty Sheet
                </button>

                {isAuthorized && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenCopyModal(roster)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded cursor-pointer"
                      title="Copy / Duplicate Roster to new date"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditClick(roster)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded cursor-pointer"
                      title="Edit roster"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWithConfirmation(roster)}
                      className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded cursor-pointer"
                      title="Delete roster safely"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Copy / Duplicate Modal */}
      {isCopyModalOpen && rosterToCopy && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Duplicate Service Roster
                </h3>
              </div>
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                You are copying the assignments from <strong>{rosterToCopy.serviceType}</strong> ({formatDate(rosterToCopy.serviceDate)}) to a new date. The original roster will remain untouched.
              </p>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Service Date for New Roster *
                </label>
                <input
                  type="date"
                  required
                  value={copyTargetDate}
                  onChange={(e) => setCopyTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-blue-900 dark:text-blue-300 text-[11px]">
                <strong>Included Personnel:</strong> {rosterToCopy.assignments.length} assigned members, team leader ({rosterToCopy.teamLeader}), and prayer leader ({rosterToCopy.prayerLeader}).
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCopyModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCopy}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Confirm & Create Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Roster Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingRoster ? 'Edit Service Roster' : 'Create / Review Service Roster'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Service Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Service Type *
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600 cursor-pointer"
                  >
                    <option value="Sunday 1st Service">Sunday 1st Service</option>
                    <option value="Sunday 2nd Service">Sunday 2nd Service</option>
                    <option value="Tuesday Word & Communion">Tuesday Word & Communion</option>
                    <option value="Special Meeting">Special Meeting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Team Leader *
                  </label>
                  <select
                    value={formData.teamLeader}
                    onChange={(e) => setFormData({ ...formData, teamLeader: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600 cursor-pointer"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.fullName}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Pre-Service Prayer Leader *
                  </label>
                  <select
                    value={formData.prayerLeader}
                    onChange={(e) => setFormData({ ...formData, prayerLeader: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600 cursor-pointer"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.fullName}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignments Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Station Personnel Assignments ({formData.assignments.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAssignment}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    + Add Station Assignee
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {formData.assignments.map((asg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <select
                        value={asg.memberName}
                        onChange={(e) => {
                          const updated = [...formData.assignments];
                          const selected = members.find((m) => m.fullName === e.target.value);
                          updated[idx].memberName = e.target.value;
                          if (selected) updated[idx].memberId = selected.id;
                          setFormData({ ...formData, assignments: updated });
                        }}
                        className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs cursor-pointer"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.fullName}>
                            {m.fullName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={asg.dutyRole}
                        onChange={(e) => {
                          const updated = [...formData.assignments];
                          updated[idx].dutyRole = e.target.value;
                          setFormData({ ...formData, assignments: updated });
                        }}
                        placeholder="Duty station / responsibility..."
                        className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(idx)}
                        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 px-1 font-bold text-sm cursor-pointer"
                        title="Remove assignee"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Arrival & Pre-Service Briefing Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Arrival time, briefing guidelines, dress expectations..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {editingRoster ? 'Update Roster' : 'Publish Service Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print Duty Sheet Modal */}
      {selectedRosterForPrint && (
        <PrintModal
          isOpen={true}
          onClose={() => setSelectedRosterForPrint(null)}
          title={`DOMINION CITY ASABA — SERVICE DUTY ROSTER`}
          subtitle={`${selectedRosterForPrint.serviceType} • Date: ${formatDate(selectedRosterForPrint.serviceDate)}`}
          documentRef={`RST-${selectedRosterForPrint.id}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Designated Team Leader:
                </span>
                <span className="font-black text-slate-900 text-sm">
                  {selectedRosterForPrint.teamLeader}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Pre-Service Prayer Leader:
                </span>
                <span className="font-black text-slate-900 text-sm">
                  {selectedRosterForPrint.prayerLeader}
                </span>
              </div>
            </div>

            <table className="w-full text-[11px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-emerald-800 text-white font-bold">
                  <th className="p-2 border border-slate-300 text-center w-12">S/N</th>
                  <th className="p-2 border border-slate-300 text-left">Assigned Officer / Member</th>
                  <th className="p-2 border border-slate-300 text-left">Specific Responsibility</th>
                  <th className="p-2 border border-slate-300 text-center w-28">Signature</th>
                </tr>
              </thead>
              <tbody>
                {selectedRosterForPrint.assignments.map((asg, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2.5 border border-slate-300 text-center font-bold">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 border border-slate-300 font-bold text-slate-900">
                      {asg.memberName}
                    </td>
                    <td className="p-2.5 border border-slate-300 font-medium text-slate-700">
                      {asg.dutyRole}
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center">
                      <div className="h-6 border-b border-dashed border-slate-400 mx-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedRosterForPrint.notes && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                <strong>Special Instructions:</strong> {selectedRosterForPrint.notes}
              </div>
            )}
          </div>
        </PrintModal>
      )}
    </div>
  );
};
