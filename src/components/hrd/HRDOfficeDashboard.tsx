import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateUtils';
import { formatNaira } from '../../utils/formatters';
import {
  DepartmentUnitType,
  HRDMessageCategory,
  HRDMessageStatus,
  HRDDepartmentalMessage,
  CentralComplaintStatus,
  MonthlyReportStatus,
  DepartmentMonthlyReport,
  LeadershipMeeting,
} from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import {
  Crown,
  LayoutDashboard,
  Users2,
  Inbox,
  AlertTriangle,
  FileCheck,
  Building,
  CheckSquare,
  Bell,
  Archive,
  Search,
  Filter,
  Plus,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Edit3,
  Printer,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  X,
  FileText,
  Lock,
  Phone,
  Mail,
  UserCheck,
  CornerDownRight,
  Sparkles,
  MapPin,
  Check,
  MessageSquare,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

interface HRDOfficeDashboardProps {
  onReturnToGeneral: () => void;
  onOpenRoleModal?: () => void;
}

const ALL_DEPARTMENT_UNITS: DepartmentUnitType[] = [
  'Secretary',
  'Welfare',
  'Bookstand',
  'Uniform',
  'Finance',
  'Attendance & Service Reporting',
];

export const HRDOfficeDashboard: React.FC<HRDOfficeDashboardProps> = ({
  onReturnToGeneral,
  onOpenRoleModal,
}) => {
  const { currentUser, isHOD, canAccessHRDOffice } = useAuth();
  const {
    hrdMessages,
    updateHRDMessageStatus,
    addHRDMessageResponse,
    assignHRDMessage,
    departmentComplaints,
    updateComplaintStatus,
    addHODComplaintComment,
    monthlyReports,
    reviewMonthlyReport,
    leadershipMeetings,
    addLeadershipMeeting,
    updateLeadershipMeeting,
    updateActionPointStatus,
    members,
    attendance,
    sales,
    bookstandExpenses,
    books,
    transactions,
    welfareCases,
    visitations,
    dressCodes,
    departmentEvents,
    announcements,
  } = useData();

  // Active Tab inside HRD Office (9 sections)
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'assemblies'
    | 'messages'
    | 'complaints'
    | 'monthly-reports'
    | 'department-overview'
    | 'pending-actions'
    | 'notifications'
    | 'historical-records'
  >('overview');

  // ==========================================================================
  // DYNAMIC STATISTICS GENERATION (FROM DATABASE)
  // ==========================================================================
  const totalUnitsCount = ALL_DEPARTMENT_UNITS.length;
  const totalMessagesCount = hrdMessages.length;
  const newMessagesCount = hrdMessages.filter((m) => m.status === 'New' || m.status === 'Unread').length;
  const awaitingResponseCount = hrdMessages.filter((m) => m.status === 'Awaiting Response' || m.status === 'Under Review').length;

  const totalComplaintsCount = departmentComplaints.length;
  const urgentComplaintsCount = departmentComplaints.filter((c) => (c.urgency === 'Critical' || c.urgency === 'High') && c.status !== 'Resolved').length;
  const complaintsUnderReviewCount = departmentComplaints.filter((c) => c.status === 'Under Review' || c.status === 'Assigned').length;
  const resolvedComplaintsCount = departmentComplaints.filter((c) => c.status === 'Resolved').length;
  const outstandingIssuesCount = departmentComplaints.filter((c) => c.status !== 'Resolved').length;

  // Selected Month for Monthly Reports
  const [selectedReportMonth, setSelectedReportMonth] = useState('2026-10');
  const reportsInMonth = useMemo(() => {
    return monthlyReports.filter((r) => r.reportingMonth === selectedReportMonth);
  }, [monthlyReports, selectedReportMonth]);

  const monthlyReportsSubmittedCount = reportsInMonth.filter((r) => r.status === 'Submitted' || r.status === 'Reviewed').length;
  const monthlyReportsAwaitingSubmissionCount = Math.max(0, totalUnitsCount - monthlyReportsSubmittedCount);
  const reportsAwaitingReviewCount = reportsInMonth.filter((r) => r.status === 'Submitted').length;

  const upcomingLeadershipActivitiesCount = leadershipMeetings.filter((m) => m.status === 'Scheduled').length;

  // Search & Filter States
  const [messageSearch, setMessageSearch] = useState('');
  const [messageDeptFilter, setMessageDeptFilter] = useState('all');
  const [messageStatusFilter, setMessageStatusFilter] = useState('all');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [hrdReplyInput, setHrdReplyInput] = useState('');
  const [hrdPrivateNoteInput, setHrdPrivateNoteInput] = useState('');
  const [mobileMessageView, setMobileMessageView] = useState<'list' | 'detail'>('list');

  // Complaints state inside HRD
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintDeptFilter, setComplaintDeptFilter] = useState('all');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [complaintDirectiveInput, setComplaintDirectiveInput] = useState('');
  const [assignedOfficerInput, setAssignedOfficerInput] = useState('');
  const [mobileComplaintView, setMobileComplaintView] = useState<'list' | 'detail'>('list');

  // Monthly Report Review Dialog
  const [reviewReportModalOpen, setReviewReportModalOpen] = useState(false);
  const [targetReportForReview, setTargetReportForReview] = useState<DepartmentMonthlyReport | null>(null);
  const [reviewStatusChoice, setReviewStatusChoice] = useState<MonthlyReportStatus>('Reviewed');
  const [reviewRemarksText, setReviewRemarksText] = useState('');

  // Schedule Meeting Modal
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);
  const [newMeetingForm, setNewMeetingForm] = useState({
    title: '',
    meetingType: 'Leadership Meeting' as LeadershipMeeting['meetingType'],
    date: new Date().toISOString().split('T')[0],
    time: '1:30 PM',
    venue: 'Seminar Room B, Main Cathedral',
    agendasText: '',
    announcementsText: '',
  });

  // Selected Detail Objects
  const selectedMessage = useMemo(() => {
    return hrdMessages.find((m) => m.id === selectedMessageId) || null;
  }, [hrdMessages, selectedMessageId]);

  const selectedComplaint = useMemo(() => {
    return departmentComplaints.find((c) => c.id === selectedComplaintId) || null;
  }, [departmentComplaints, selectedComplaintId]);

  // Filtered Messages
  const filteredMessages = useMemo(() => {
    return hrdMessages.filter((m) => {
      const matchSearch =
        m.subject.toLowerCase().includes(messageSearch.toLowerCase()) ||
        m.senderName.toLowerCase().includes(messageSearch.toLowerCase()) ||
        m.referenceNumber.toLowerCase().includes(messageSearch.toLowerCase()) ||
        m.description.toLowerCase().includes(messageSearch.toLowerCase());
      const matchDept = messageDeptFilter === 'all' || m.senderDepartment === messageDeptFilter;
      const matchStatus = messageStatusFilter === 'all' || m.status === messageStatusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [hrdMessages, messageSearch, messageDeptFilter, messageStatusFilter]);

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    return departmentComplaints.filter((c) => {
      const matchSearch =
        c.subject.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        c.submittedBy.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(complaintSearch.toLowerCase());
      const matchDept = complaintDeptFilter === 'all' || c.department === complaintDeptFilter;
      const matchStatus = complaintStatusFilter === 'all' || c.status === complaintStatusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [departmentComplaints, complaintSearch, complaintDeptFilter, complaintStatusFilter]);

  // Handlers
  const handleSendHRDReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessageId || !hrdReplyInput.trim()) return;

    addHRDMessageResponse(
      selectedMessageId,
      {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: 'Head of Department (HRD)',
        isFromHRD: true,
        message: hrdReplyInput.trim(),
      },
      'Under Review'
    );

    setHrdReplyInput('');
  };

  const handleSavePrivateNote = () => {
    if (!selectedMessageId) return;
    updateHRDMessageStatus(selectedMessageId, selectedMessage?.status || 'Under Review', hrdPrivateNoteInput.trim());
    alert('Private HRD note saved successfully.');
  };

  const handlePostComplaintDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId || !complaintDirectiveInput.trim()) return;

    addHODComplaintComment(selectedComplaintId, complaintDirectiveInput.trim(), currentUser.name);
    setComplaintDirectiveInput('');
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingForm.title.trim()) {
      alert('Please enter a meeting title');
      return;
    }

    const agendas = newMeetingForm.agendasText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const announcements = newMeetingForm.announcementsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    addLeadershipMeeting({
      title: newMeetingForm.title.trim(),
      meetingType: newMeetingForm.meetingType,
      date: newMeetingForm.date,
      time: newMeetingForm.time,
      venue: newMeetingForm.venue.trim(),
      organizer: `${currentUser.name} (HRD)`,
      agendas,
      announcements,
      attendeesCount: 0,
      attendanceList: [],
      status: 'Scheduled',
    });

    setIsAddMeetingModalOpen(false);
    setNewMeetingForm({
      title: '',
      meetingType: 'Leadership Meeting',
      date: new Date().toISOString().split('T')[0],
      time: '1:30 PM',
      venue: 'Seminar Room B, Main Cathedral',
      agendasText: '',
      announcementsText: '',
    });
  };

  // ==========================================================================
  // EXCLUSIVE SECURITY LOCKOUT SCREEN (Rendered if not authenticated as HRD)
  // ==========================================================================
  if (!isHOD || !canAccessHRDOffice) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E172B] border border-amber-500/40 shadow-2xl space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 border-2 border-amber-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
          <Lock className="w-10 h-10 text-slate-950 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Restricted Executive Sanctuary
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            HRD Office — Exclusive Leadership Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Access to this office is strictly reserved for the <strong>Head of Department (HRD)</strong>.
            Operations Managers, Departmental Officers, and general members are not authorized to view HRD communications, private notes, or leadership assemblies.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 text-left space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Strict Access Enforcement Rules:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
            <li>Authentication is verified via encrypted passcodes and role session states.</li>
            <li>Default Passcode: <code className="font-mono font-bold bg-amber-200 dark:bg-amber-900 px-1 py-0.5 rounded text-amber-950 dark:text-amber-200">HOD-2026</code>.</li>
            <li>If you are the authorized Head of Department, unlock your desk below.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onOpenRoleModal && (
            <button
              onClick={onOpenRoleModal}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>Authenticate as HRD (Enter Passcode)</span>
            </button>
          )}

          <button
            onClick={onReturnToGeneral}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            ← Return to Home Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 max-w-full overflow-hidden">
      {/* ==================================================================== */}
      {/* 1. EXECUTIVE HRD OFFICE HEADER                                       */}
      {/* ==================================================================== */}
      <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#170E28] via-[#2A1245] to-[#451C75] text-white shadow-xl border border-amber-500/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={onReturnToGeneral}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs">
                Crown Leadership Suite
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg sm:text-xl shadow-lg shrink-0">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  HRD OFFICE
                </h1>
                <p className="text-[11px] sm:text-xs text-purple-200 mt-0.5 leading-relaxed">
                  Exclusive Departmental Oversight, Inter-Unit Assemblies, Complaints Triage & Monthly Reports
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-purple-800/40">
            <span className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-purple-900/60 border border-purple-400/40 text-[11px] sm:text-xs font-bold text-purple-200 truncate max-w-full">
              Authenticated: <strong>{currentUser.name}</strong>
            </span>
            <button
              onClick={() => setIsAddMeetingModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Schedule Assembly</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ==================================================================== */}
      {/* 2. NINE NAVIGATION SECTIONS INSIDE HRD OFFICE                        */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-[#0E172B] p-1.5 sm:p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max pb-0.5">
          {[
            { id: 'overview', label: '1. HRD Overview', icon: LayoutDashboard, badge: null },
            { id: 'assemblies', label: '2. Assemblies', icon: Users2, badge: upcomingLeadershipActivitiesCount },
            { id: 'messages', label: '3. Messages', icon: Inbox, badge: newMessagesCount > 0 ? `${newMessagesCount} New` : totalMessagesCount },
            { id: 'complaints', label: '4. Complaints', icon: AlertTriangle, badge: outstandingIssuesCount > 0 ? `${outstandingIssuesCount} Open` : null },
            { id: 'monthly-reports', label: '5. Unit Reports', icon: FileCheck, badge: reportsAwaitingReviewCount > 0 ? `${reportsAwaitingReviewCount} Pending` : `${monthlyReportsSubmittedCount}/${totalUnitsCount}` },
            { id: 'department-overview', label: '6. Overview', icon: Building, badge: null },
            { id: 'pending-actions', label: '7. Pending Actions', icon: CheckSquare, badge: newMessagesCount + outstandingIssuesCount + reportsAwaitingReviewCount },
            { id: 'notifications', label: '8. Notifications', icon: Bell, badge: newMessagesCount > 0 ? `${newMessagesCount}` : null },
            { id: 'historical-records', label: '9. Archives', icon: Archive, badge: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: HRD OVERVIEW                                              */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Executive Real-Time Database Metrics (12 Summary Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* Total Active Units */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Total Active Units
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1">
                {totalUnitsCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-0.5 block truncate">
                Full Ministry Coverage
              </span>
            </div>

            {/* Total Messages Received */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Total Messages Received
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1">
                {totalMessagesCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 block truncate">
                Direct Line submissions
              </span>
            </div>

            {/* New Messages Awaiting Review */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-amber-200 dark:border-amber-900/40 shadow-xs bg-amber-50/20">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block truncate">
                New Messages Review
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-1">
                {newMessagesCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-300 font-bold mt-0.5 block truncate">
                Requires HRD read
              </span>
            </div>

            {/* Total Complaints Received */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Total Complaints
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1">
                {totalComplaintsCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 block truncate">
                Across all stations
              </span>
            </div>

            {/* Urgent Complaints */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-rose-200 dark:border-rose-900/40 shadow-xs bg-rose-50/20">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block truncate">
                Urgent Complaints
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-rose-600 dark:text-rose-400 mt-0.5 sm:mt-1">
                {urgentComplaintsCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-rose-700 dark:text-rose-300 font-bold mt-0.5 block truncate">
                High / Critical priority
              </span>
            </div>

            {/* Complaints Under Review */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Under Review
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-600 dark:text-purple-400 mt-0.5 sm:mt-1">
                {complaintsUnderReviewCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 block truncate">
                Assigned for action
              </span>
            </div>

            {/* Resolved Complaints */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-emerald-200 dark:border-emerald-900/40 shadow-xs bg-emerald-50/20">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block truncate">
                Resolved Complaints
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1">
                {resolvedComplaintsCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-300 font-bold mt-0.5 block truncate">
                Audit closed
              </span>
            </div>

            {/* Outstanding Issues */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Outstanding Issues
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-1">
                {outstandingIssuesCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 block truncate">
                Active follow-ups
              </span>
            </div>

            {/* Monthly Reports Submitted */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Reports Submitted
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1">
                {monthlyReportsSubmittedCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 block truncate">
                Out of {totalUnitsCount} active units
              </span>
            </div>

            {/* Monthly Reports Awaiting Submission */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Awaiting Submission
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-rose-600 dark:text-rose-400 mt-0.5 sm:mt-1">
                {monthlyReportsAwaitingSubmissionCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 block truncate">
                Units pending filing
              </span>
            </div>

            {/* Reports Awaiting HRD Review */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-blue-200 dark:border-blue-900/40 shadow-xs bg-blue-50/20">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block truncate">
                Awaiting HRD Review
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1">
                {reportsAwaitingReviewCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-blue-700 dark:text-blue-300 font-bold mt-0.5 block truncate">
                Requires leadership signoff
              </span>
            </div>

            {/* Upcoming Leadership Activities */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E172B] border border-amber-200 dark:border-amber-900/40 shadow-xs bg-amber-50/20">
              <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block truncate">
                Leadership Activities
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-1">
                {upcomingLeadershipActivitiesCount}
              </p>
              <span className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-300 font-bold mt-0.5 block truncate">
                Assemblies on schedule
              </span>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Messages to HRD */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-purple-600" />
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Recent Direct Messages to HRD
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('messages')}
                  className="text-xs font-bold text-purple-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  View All ({totalMessagesCount}) →
                </button>
              </div>

              <div className="space-y-3">
                {hrdMessages.slice(0, 4).map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessageId(msg.id);
                      setActiveTab('messages');
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-slate-800 hover:border-purple-300 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black text-purple-600 dark:text-purple-400">
                        {msg.referenceNumber} • {msg.senderDepartment}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          msg.status === 'New'
                            ? 'bg-amber-400 text-slate-950'
                            : msg.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {msg.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>From: <strong>{msg.senderName}</strong> ({msg.senderRole})</span>
                      <span>{new Date(msg.submissionDate).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Complaints & Operational Escalations */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Active Complaints & Escalations
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('complaints')}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  Manage All ({outstandingIssuesCount}) →
                </button>
              </div>

              <div className="space-y-3">
                {departmentComplaints.slice(0, 4).map((cmp) => (
                  <div
                    key={cmp.id}
                    onClick={() => {
                      setSelectedComplaintId(cmp.id);
                      setActiveTab('complaints');
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 hover:border-rose-300 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-rose-600">
                        {cmp.department} • {cmp.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          cmp.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cmp.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {cmp.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {cmp.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Submitted by: <strong>{cmp.submittedBy}</strong></span>
                      <span>{cmp.submissionDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: LEADERSHIP & MONTHLY ASSEMBLIES                           */}
      {/* ==================================================================== */}
      {activeTab === 'assemblies' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users2 className="w-5 h-5 text-amber-500" />
                Leadership & Monthly Assemblies
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Oversee departmental assemblies, executive meetings, decision action points, and attendance registers.
              </p>
            </div>
            <button
              onClick={() => setIsAddMeetingModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Assembly</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {leadershipMeetings.map((mtg) => (
              <div
                key={mtg.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        {mtg.meetingType}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                        {mtg.title}
                      </h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                        mtg.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {mtg.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Date & Time</span>
                      <strong className="text-slate-900 dark:text-white">{formatDate(mtg.date)} • {mtg.time}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Venue</span>
                      <strong className="text-slate-900 dark:text-white truncate block">{mtg.venue}</strong>
                    </div>
                  </div>

                  {/* Agendas */}
                  {mtg.agendas.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Meeting Agendas:
                      </span>
                      <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                        {mtg.agendas.map((ag, i) => (
                          <li key={i}>{ag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Points */}
                  {mtg.actionPoints && mtg.actionPoints.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Assigned Responsibilities & Follow-Up Deadlines:
                      </span>
                      <div className="space-y-1.5">
                        {mtg.actionPoints.map((ap) => (
                          <div
                            key={ap.id}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs flex items-center justify-between gap-3"
                          >
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{ap.action}</p>
                              <span className="text-[10px] text-slate-500">
                                Assigned to: <strong>{ap.assignedTo}</strong> • Deadline: {ap.deadline}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                updateActionPointStatus(
                                  mtg.id,
                                  ap.id,
                                  ap.status === 'Completed' ? 'Pending' : 'Completed'
                                )
                              }
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer ${
                                ap.status === 'Completed'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {ap.status}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Organizer: <strong>{mtg.organizer}</strong></span>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-purple-600 hover:underline font-bold cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Minutes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 3: DEPARTMENTAL MESSAGES (HRD PRIVATE INBOX)                 */}
      {/* ==================================================================== */}
      {activeTab === 'messages' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-purple-600" />
                Departmental Messages (HRD Private Inbox)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized inbox for direct inquiries, requests, recommendations, and concerns submitted via REPORT TO HRD.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search sender, ref, subject..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={messageDeptFilter}
                onChange={(e) => setMessageDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="all">All Departments</option>
                {ALL_DEPARTMENT_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>

              <select
                value={messageStatusFilter}
                onChange={(e) => setMessageStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="New">New</option>
                <option value="Under Review">Under Review</option>
                <option value="Awaiting Response">Awaiting Response</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Master-Detail Layout */}
          {/* Mobile view switcher tab (visible only on < lg screens) */}
          <div className="flex lg:hidden items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-3 w-full">
            <button
              onClick={() => setMobileMessageView('list')}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                mobileMessageView === 'list'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Messages List ({filteredMessages.length})
            </button>
            <button
              onClick={() => setMobileMessageView('detail')}
              disabled={!selectedMessage}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                mobileMessageView === 'detail'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Details {selectedMessage ? `(${selectedMessage.referenceNumber})` : ''}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages Master List */}
            <div className={`lg:col-span-1 space-y-2.5 max-h-[750px] overflow-y-auto pr-1 ${mobileMessageView === 'detail' ? 'hidden lg:block' : 'block'}`}>
              {filteredMessages.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  No departmental messages found matching filters.
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = msg.id === selectedMessageId;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessageId(msg.id);
                        setMobileMessageView('detail');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs space-y-2 ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-white dark:bg-[#0E172B] border-slate-200 dark:border-slate-800 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-black text-purple-600 dark:text-purple-400">
                          {msg.referenceNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            msg.status === 'New'
                              ? 'bg-amber-400 text-slate-950'
                              : msg.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {msg.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {msg.subject}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {msg.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>{msg.senderDepartment} • {msg.senderName}</span>
                        <span>{new Date(msg.submissionDate).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Detail & HRD Action Workspace */}
            <div className={`lg:col-span-2 ${mobileMessageView === 'list' ? 'hidden lg:block' : 'block'}`}>
              {!selectedMessage ? (
                <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Select a departmental message to view details and reply
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Every message submitted to the HRD preserves full conversation history, private leadership notes, and resolution actions.
                  </p>
                </div>
              ) : (
                <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                  {/* Mobile Back Button */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 lg:hidden">
                    <button
                      type="button"
                      onClick={() => setMobileMessageView('list')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Messages List
                    </button>
                    <span className="font-mono text-[10px] text-slate-400">
                      {selectedMessage.referenceNumber}
                    </span>
                  </div>

                  {/* Message Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-purple-600 dark:text-purple-400">
                          {selectedMessage.referenceNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                          {selectedMessage.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            selectedMessage.urgency === 'Urgent'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {selectedMessage.urgency}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                        {selectedMessage.subject}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sender: <strong>{selectedMessage.senderName}</strong> • {selectedMessage.senderRole} ({selectedMessage.senderDepartment})
                        {selectedMessage.senderPhone && ` • Phone: ${selectedMessage.senderPhone}`}
                      </p>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {(['Read', 'Under Review', 'Awaiting Response', 'Resolved', 'Closed'] as HRDMessageStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateHRDMessageStatus(selectedMessage.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            selectedMessage.status === st
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-3">
                    <p>{selectedMessage.description}</p>

                    {selectedMessage.attachmentUrl && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Attached Supporting Evidence:</span>
                        <img
                          src={selectedMessage.attachmentUrl}
                          alt="Attachment"
                          className="max-h-48 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  {/* Private HRD Notes (Only Visible to HRD) */}
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        Private HRD Leadership Notes (Hidden from sender)
                      </span>
                      <button
                        onClick={handleSavePrivateNote}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Add confidential leadership directives or background notes..."
                      value={hrdPrivateNoteInput || selectedMessage.privateNotes || ''}
                      onChange={(e) => setHrdPrivateNoteInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Thread Conversation History */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Thread Responses ({selectedMessage.responses.length})
                    </h4>

                    {selectedMessage.responses.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No responses posted on this thread yet.</p>
                    ) : (
                      selectedMessage.responses.map((resp) => (
                        <div
                          key={resp.id}
                          className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                            resp.isFromHRD
                              ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 ml-4'
                              : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className={resp.isFromHRD ? 'text-purple-900 dark:text-purple-300' : 'text-slate-800 dark:text-slate-200'}>
                              {resp.isFromHRD ? '👑 ' : ''}{resp.senderName} ({resp.senderRole})
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(resp.timestamp).toLocaleString('en-GB')}
                            </span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                            {resp.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* HRD Response Composer */}
                  <form onSubmit={handleSendHRDReply} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Respond to {selectedMessage.senderName} (Visible in Sender's History)
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Type your official response, instruction, or request for clarification..."
                      value={hrdReplyInput}
                      onChange={(e) => setHrdReplyInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Response to Sender</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 4: COMPLAINTS & ESCALATIONS                                  */}
      {/* ==================================================================== */}
      {activeTab === 'complaints' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Complaints & Operational Escalations Hub
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Investigate, assign, resolve, and audit departmental issues originating from Bookstand, Welfare, Uniform, Finance, and Secretariat.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={complaintDeptFilter}
                onChange={(e) => setComplaintDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="all">All Units</option>
                {ALL_DEPARTMENT_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>

              <select
                value={complaintStatusFilter}
                onChange={(e) => setComplaintStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="New">New</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="Awaiting Action">Awaiting Action</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Mobile View Switcher (Visible only on < lg screens) */}
          <div className="flex lg:hidden items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-3 w-full">
            <button
              onClick={() => setMobileComplaintView('list')}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                mobileComplaintView === 'list'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Complaints ({filteredComplaints.length})
            </button>
            <button
              onClick={() => setMobileComplaintView('detail')}
              disabled={!selectedComplaint}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                mobileComplaintView === 'detail'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Investigation Detail {selectedComplaint ? `(${selectedComplaint.department})` : ''}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Complaints List */}
            <div className={`lg:col-span-1 space-y-2.5 max-h-[750px] overflow-y-auto pr-1 ${mobileComplaintView === 'detail' ? 'hidden lg:block' : 'block'}`}>
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  No complaints found matching filters.
                </div>
              ) : (
                filteredComplaints.map((c) => {
                  const isSelected = c.id === selectedComplaintId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedComplaintId(c.id);
                        setMobileComplaintView('detail');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs space-y-2 ${
                        isSelected
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-1 ring-rose-500'
                          : 'bg-white dark:bg-[#0E172B] border-slate-200 dark:border-slate-800 hover:border-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-rose-600">
                          {c.department} • {c.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            c.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {c.subject}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {c.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>Submitted by: <strong>{c.submittedBy}</strong></span>
                        <span>{c.submissionDate}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Complaint Detail Workspace */}
            <div className={`lg:col-span-2 ${mobileComplaintView === 'list' ? 'hidden lg:block' : 'block'}`}>
              {!selectedComplaint ? (
                <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Select a complaint to review investigation notes and issue directives
                  </h4>
                </div>
              ) : (
                <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                  {/* Mobile Back Button */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 lg:hidden">
                    <button
                      type="button"
                      onClick={() => setMobileComplaintView('list')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Complaints List
                    </button>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {selectedComplaint.department}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300">
                          {selectedComplaint.department}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Urgency: {selectedComplaint.urgency}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                        {selectedComplaint.subject}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Logged by: <strong>{selectedComplaint.submittedBy}</strong> ({selectedComplaint.submittedByRole || 'Duty Officer'}) • Date: {selectedComplaint.submissionDate}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {(['Under Review', 'Assigned', 'Awaiting Action', 'Resolved', 'Closed'] as CentralComplaintStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateComplaintStatus(selectedComplaint.id, st, `Status updated to ${st} by HRD`, currentUser.name)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            selectedComplaint.status === st
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-3">
                    <p>{selectedComplaint.description}</p>
                    {selectedComplaint.supportingEvidenceUrl && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Evidence Photo:</span>
                        <img
                          src={selectedComplaint.supportingEvidenceUrl}
                          alt="Evidence"
                          className="max-h-48 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  {/* Resolution Audit History */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Leadership Actions & Permanent Resolution Audit
                    </h4>
                    <div className="space-y-1.5">
                      {selectedComplaint.resolutionHistory.map((step) => (
                        <div
                          key={step.id}
                          className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {step.actionBy} ({step.status})
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 mt-0.5">{step.notes}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{step.actionDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Post Leadership Directive */}
                  <form onSubmit={handlePostComplaintDirective} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Add HRD Leadership Directive / Comment
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Enter investigation finding, assigned officer task, or resolution directive..."
                      value={complaintDirectiveInput}
                      onChange={(e) => setComplaintDirectiveInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Directive</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 5: UNIT MONTHLY REPORTS (TABLE & REVIEW HUB)                 */}
      {/* ==================================================================== */}
      {activeTab === 'monthly-reports' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Unit Monthly Reports Review Hub
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Central oversight of monthly submissions across all 6 departmental units following the 9-part standard.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <label className="text-xs font-bold text-slate-400">Reporting Month:</label>
              <select
                value={selectedReportMonth}
                onChange={(e) => setSelectedReportMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="2026-11">November 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-09">September 2026</option>
              </select>
            </div>
          </div>

          {/* Reporting Table as Requested */}
          <div className="bg-white dark:bg-[#0E172B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="sm:hidden px-4 py-1.5 text-[10px] text-slate-400 italic bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              Swipe sideways to view all columns &rarr;
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3.5 px-4">Department Unit</th>
                    <th className="py-3.5 px-4">Month</th>
                    <th className="py-3.5 px-4">Submission Date</th>
                    <th className="py-3.5 px-4">Submission Status</th>
                    <th className="py-3.5 px-4">HRD Review Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ALL_DEPARTMENT_UNITS.map((unit) => {
                    const rep = reportsInMonth.find((r) => r.departmentUnit === unit);
                    return (
                      <tr key={unit} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {unit}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {selectedReportMonth}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {rep ? rep.submissionDate : '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              !rep || rep.status === 'Not Started'
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : rep.status === 'Draft'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {rep ? rep.status : 'Not Started'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {rep?.hodReviewNotes ? (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Reviewed by HRD
                            </span>
                          ) : rep?.status === 'Submitted' ? (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Awaiting HRD Evaluation
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Pending Unit Filing</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {rep ? (
                            <button
                              onClick={() => {
                                setTargetReportForReview(rep);
                                setReviewStatusChoice(rep.status === 'Submitted' ? 'Reviewed' : rep.status);
                                setReviewRemarksText(rep.hodReviewNotes || '');
                                setReviewReportModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                            >
                              Open & Review Report
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No submission yet</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 6: DEPARTMENTAL OVERVIEW                                     */}
      {/* ==================================================================== */}
      {activeTab === 'department-overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              Consolidated Departmental Operations Overview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live operational health across the Secretariat, Welfare, Literature Bookstand, Uniforms, Finance, and Front Desk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Secretariat */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">1. Secretariat & Documentation</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">Active</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between"><span>Scheduled Events:</span><strong>{departmentEvents.length}</strong></div>
                <div className="flex justify-between"><span>Published Notices:</span><strong>{announcements.length}</strong></div>
                <div className="flex justify-between"><span>Active Roster Slots:</span><strong>4 Services</strong></div>
              </div>
            </div>

            {/* 2. Welfare Department */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">2. Welfare & Member Care</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-800">Caring</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between"><span>Active Care Cases:</span><strong>{welfareCases.length}</strong></div>
                <div className="flex justify-between"><span>Scheduled Visitations:</span><strong>{visitations.length}</strong></div>
                <div className="flex justify-between"><span>Emergency Follow-Ups:</span><strong>100%</strong></div>
              </div>
            </div>

            {/* 3. Bookstand Literature */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">3. Bookstand Literature</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Reconciled</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between"><span>Master Titles:</span><strong>{books.length} Titles</strong></div>
                <div className="flex justify-between"><span>Standing Copies:</span><strong>{books.reduce((s, b) => s + b.currentStock, 0)} Units</strong></div>
                <div className="flex justify-between"><span>Operating Surplus:</span><strong className="text-emerald-600">Verified</strong></div>
              </div>
            </div>

            {/* 4. Uniform & Protocol */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">4. Uniform & Dress Code</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Published</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between"><span>Sundays Scheduled:</span><strong>{dressCodes.length} Sundays</strong></div>
                <div className="flex justify-between"><span>Adherence Rate:</span><strong>94%</strong></div>
                <div className="flex justify-between"><span>Lapel Pin Compliance:</span><strong className="text-emerald-600">Strict</strong></div>
              </div>
            </div>

            {/* 5. Finance & Treasury */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">5. Finance & Treasury</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Audited</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between"><span>Ledger Transactions:</span><strong>{transactions.length} Records</strong></div>
                <div className="flex justify-between"><span>Member Dues Coverage:</span><strong>88%</strong></div>
                <div className="flex justify-between"><span>Receipt Documentation:</span><strong className="text-emerald-600">100%</strong></div>
              </div>
            </div>

            {/* 6. Attendance & Service Reporting */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">6. Service Reporting & Front Desk</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Geofenced</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between"><span>Clock-in Verification:</span><strong>92% GPS Verified</strong></div>
                <div className="flex justify-between"><span>Stations Active:</span><strong>Desk A & Desk B</strong></div>
                <div className="flex justify-between"><span>Midweek Word & Communion:</span><strong>Tracked</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 7: PENDING ACTIONS QUEUE                                     */}
      {/* ==================================================================== */}
      {activeTab === 'pending-actions' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-500" />
              Consolidated HRD Pending Actions Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Actionable items requiring HRD attention: unread messages, open complaints, submitted unit monthly reports, and meeting action items.
            </p>
          </div>

          <div className="space-y-3">
            {/* Messages Awaiting HRD Action */}
            {hrdMessages
              .filter((m) => m.status === 'New' || m.status === 'Unread' || m.status === 'Awaiting Response')
              .map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessageId(msg.id);
                    setMobileMessageView('detail');
                    setActiveTab('messages');
                  }}
                  className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 hover:border-amber-400 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold shrink-0">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-black text-amber-700 dark:text-amber-400">
                        {msg.referenceNumber} • {msg.senderDepartment}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {msg.subject}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        From: {msg.senderName} ({msg.senderRole}) • Status: {msg.status}
                      </p>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto text-center shrink-0 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer">
                    Review Message
                  </button>
                </div>
              ))}

            {/* Complaints Awaiting Action */}
            {departmentComplaints
              .filter((c) => c.status !== 'Resolved')
              .map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedComplaintId(c.id);
                    setMobileComplaintView('detail');
                    setActiveTab('complaints');
                  }}
                  className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 hover:border-rose-400 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500 text-white font-bold shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-rose-600">
                        {c.department} • Urgency: {c.urgency}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {c.subject}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Reported by: {c.submittedBy} • Status: {c.status}
                      </p>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto text-center shrink-0 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer">
                    Triage Issue
                  </button>
                </div>
              ))}

            {/* Reports Awaiting Review */}
            {monthlyReports
              .filter((r) => r.status === 'Submitted')
              .map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => {
                    setTargetReportForReview(rep);
                    setReviewStatusChoice('Reviewed');
                    setReviewRemarksText(rep.hodReviewNotes || '');
                    setReviewReportModalOpen(true);
                  }}
                  className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 hover:border-blue-400 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-600 text-white font-bold shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-600">
                        Monthly Report • {rep.reportingMonth}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {rep.departmentUnit} Monthly Operating Report
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Submitted by: {rep.submittedBy} on {rep.submissionDate}
                      </p>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto text-center shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer">
                    Evaluate & Sign
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 8: NOTIFICATIONS                                             */}
      {/* ==================================================================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              HRD Real-Time Alerts & Leadership Pings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live notifications generated when departmental members or officers submit reports, escalate care cases, or file monthly reports.
            </p>
          </div>

          <div className="space-y-3">
            {hrdMessages.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Direct message from {m.senderName} ({m.senderDepartment})
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">"{m.subject}"</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(m.submissionDate).toLocaleString('en-GB')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 9: HISTORICAL RECORDS                                        */}
      {/* ==================================================================== */}
      {activeTab === 'historical-records' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-purple-600" />
              Permanent Historical Records & Archives
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Archived monthly reports, past leadership assembly minutes, and closed resolution audit histories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">Monthly Reports Archive</h4>
              <p className="text-xs text-slate-500">{monthlyReports.length} reports filed across all periods</p>
              <button
                onClick={() => setActiveTab('monthly-reports')}
                className="mt-2 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
              >
                Browse Reports →
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">Resolved Issues Archive</h4>
              <p className="text-xs text-slate-500">{resolvedComplaintsCount} cases successfully resolved & audited</p>
              <button
                onClick={() => {
                  setComplaintStatusFilter('Resolved');
                  setActiveTab('complaints');
                }}
                className="mt-2 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                View Resolved Issues →
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">Assembly Minutes Archive</h4>
              <p className="text-xs text-slate-500">{leadershipMeetings.length} leadership meeting registers logged</p>
              <button
                onClick={() => setActiveTab('assemblies')}
                className="mt-2 text-xs font-bold text-amber-600 hover:underline cursor-pointer"
              >
                Review Minutes →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: SCHEDULE NEW ASSEMBLY                                         */}
      {/* ==================================================================== */}
      {isAddMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users2 className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Schedule Leadership Meeting / Assembly
                </h3>
              </div>
              <button
                onClick={() => setIsAddMeetingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assembly / Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Departmental Officers Assembly & Strategy Council"
                  value={newMeetingForm.title}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Type *
                  </label>
                  <select
                    value={newMeetingForm.meetingType}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, meetingType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="Leadership Meeting">Leadership Meeting</option>
                    <option value="Monthly Departmental Assembly">Monthly Departmental Assembly</option>
                    <option value="Prayer & Intercession">Prayer & Intercession</option>
                    <option value="Emergency Council">Emergency Council</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMeetingForm.venue}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, venue: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newMeetingForm.date}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1:15 PM"
                    value={newMeetingForm.time}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agendas (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Opening prayer&#10;Unit monthly reports review&#10;Action items & closing"
                  value={newMeetingForm.agendasText}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, agendasText: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMeetingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                >
                  Schedule Assembly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: HRD REVIEW OF MONTHLY REPORT                                  */}
      {/* ==================================================================== */}
      {reviewReportModalOpen && targetReportForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-[#1E3A8A] text-white flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/20">
                  {targetReportForReview.departmentUnit} Unit
                </span>
                <h3 className="text-base font-black mt-1">
                  Monthly Operating Report — {targetReportForReview.reportingMonth}
                </h3>
                <p className="text-[11px] text-blue-200">
                  Submitted by {targetReportForReview.submittedBy} ({targetReportForReview.submittedByRole}) on {targetReportForReview.submissionDate}
                </p>
              </div>
              <button
                onClick={() => setReviewReportModalOpen(false)}
                className="p-1 rounded-lg text-blue-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* 9-Part Narrative Breakdown */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">1. Major Activities Carried Out</h4>
                  <p className="text-slate-900 dark:text-white leading-relaxed">{targetReportForReview.activitiesCarriedOut}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">2. Work Completed & Milestones</h4>
                  <p className="text-slate-900 dark:text-white leading-relaxed">{targetReportForReview.workCompleted}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40">
                  <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-1">3. Important Unit Statistics</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {Object.entries(targetReportForReview.importantStatistics || {}).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900">
                        <span className="text-[10px] text-slate-400 block truncate">{k}</span>
                        <strong className="text-slate-900 dark:text-white text-xs">{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">4. Operational Challenges Encountered</h4>
                  <p className="text-slate-900 dark:text-white leading-relaxed">{targetReportForReview.challengesEncountered || 'None reported.'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">5. Complaints, Observations & Issues</h4>
                  <p className="text-slate-900 dark:text-white leading-relaxed">{targetReportForReview.complaintsOrIssues || 'None.'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">6. Strategic Recommendations</h4>
                  <p className="text-slate-900 dark:text-white leading-relaxed">{targetReportForReview.recommendations || 'None.'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">7. Outstanding Responsibilities & Follow-Up</h4>
                  <p className="text-slate-900 dark:text-white leading-relaxed">{targetReportForReview.outstandingResponsibilities || 'None.'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">8. Activities Planned for Next Month</h4>
                  <p className="text-slate-900 dark:text-white leading-relaxed">{targetReportForReview.activitiesPlannedNextMonth || 'Normal duties scheduled.'}</p>
                </div>
              </div>

              {/* HRD Evaluation Action */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-3">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                  HRD Leadership Review & Evaluation
                </span>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Review Decision:</label>
                  <select
                    value={reviewStatusChoice}
                    onChange={(e) => setReviewStatusChoice(e.target.value as MonthlyReportStatus)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Reviewed">Reviewed & Approved</option>
                    <option value="Returned for Correction">Return to Unit for Correction</option>
                    <option value="Under Review">Keep Under Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    HRD Feedback / Remarks to Unit Head
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter official leadership commendation, directives, or required corrections..."
                    value={reviewRemarksText}
                    onChange={(e) => setReviewRemarksText(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReviewReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    reviewMonthlyReport(
                      targetReportForReview.id,
                      reviewStatusChoice,
                      reviewRemarksText.trim() || `Reviewed by HRD (${currentUser.name})`,
                      currentUser.name
                    );
                    setReviewReportModalOpen(false);
                    alert(`Report status updated to ${reviewStatusChoice} successfully.`);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Save Review Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
