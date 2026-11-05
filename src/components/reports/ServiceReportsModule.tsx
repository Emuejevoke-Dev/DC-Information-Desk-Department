import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ServiceReport, DepartmentMember, DepartmentMonthlyReport } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { ShareModal } from '../common/ShareModal';
import { exportToCSV } from '../../utils/exportUtils';
import { formatDate } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Check,
  Edit2,
  Trash2,
  Building,
  Sparkles,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
  Archive,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  ShoppingBag,
  BookOpen,
  Lock,
  Send,
} from 'lucide-react';
import { formatNaira } from '../../utils/formatters';

interface ServiceReportsModuleProps {
  onOpenReportToHRD?: () => void;
}

export const ServiceReportsModule: React.FC<ServiceReportsModuleProps> = ({
  onOpenReportToHRD,
}) => {
  const { currentUser, canManageReports, isHOD, isOperations, isSecretary, isFinance, isBookstand, canViewFinances } = useAuth();
  const {
    reports,
    addReport,
    updateReport,
    deleteReport,
    members,
    bookstandDutySessions,
    bookstandActivities,
    bookstandComplaints,
    sales,
    monthlyReports,
    saveMonthlyReport,
  } = useData();

  const isAuthorizedManager = canManageReports || isHOD || isOperations || isSecretary;
  const canViewBookstandFinancials = isHOD || isOperations || isFinance || isBookstand || canViewFinances;

  // -------------------------------------------------------------
  // SERVICE SCHEDULE ORGANIZATION (Sunday & Tuesday)
  // -------------------------------------------------------------
  // Service Day Filter: 'all' | 'Sunday' | 'Tuesday'
  const [serviceDayFilter, setServiceDayFilter] = useState<'all' | 'Sunday' | 'Tuesday'>('all');

  // Gather all unique service dates from existing reports
  const availableServiceDates = useMemo(() => {
    const dates = Array.from(new Set(reports.map((r) => r.serviceDate)));
    const todayStr = new Date().toISOString().split('T')[0];
    if (!dates.includes(todayStr)) {
      dates.push(todayStr);
    }
    return dates.sort().reverse();
  }, [reports]);

  // Filtered service dates by Sunday or Tuesday
  const filteredServiceDates = useMemo(() => {
    return availableServiceDates.filter((dateStr) => {
      if (serviceDayFilter === 'all') return true;
      const d = new Date(dateStr);
      const day = d.getDay();
      if (serviceDayFilter === 'Sunday') {
        return day === 0 || reports.some((r) => r.serviceDate === dateStr && r.serviceType?.startsWith('Sunday'));
      }
      if (serviceDayFilter === 'Tuesday') {
        return day === 2 || reports.some((r) => r.serviceDate === dateStr && r.serviceType?.startsWith('Tuesday'));
      }
      return true;
    });
  }, [availableServiceDates, serviceDayFilter, reports]);

  // Selected Service Date state
  const [selectedServiceDate, setSelectedServiceDate] = useState<string>(
    availableServiceDates[0] || new Date().toISOString().split('T')[0]
  );
  const selectedSunday = selectedServiceDate;

  const isTuesdayService = new Date(selectedServiceDate).getDay() === 2;

  // Active Main Tab: 'combined' | 'individual' | 'archive' | 'monthly-report'
  const [activeMainTab, setActiveMainTab] = useState<'combined' | 'individual' | 'archive' | 'monthly-report'>('combined');

  // Monthly Report State
  const [selectedReportMonth, setSelectedReportMonth] = useState('2026-10');
  const [reportActivities, setReportActivities] = useState('');
  const [reportWorkCompleted, setReportWorkCompleted] = useState('');
  const [reportChallenges, setReportChallenges] = useState('');
  const [reportComplaints, setReportComplaints] = useState('');
  const [reportRecommendations, setReportRecommendations] = useState('');
  const [reportOutstanding, setReportOutstanding] = useState('');
  const [reportNextMonth, setReportNextMonth] = useState('');
  const [reportSavedBanner, setReportSavedBanner] = useState<string | null>(null);

  const currentAttendanceReport = useMemo(() => {
    return monthlyReports.find(
      (r) => r.departmentUnit === 'Attendance & Service Reporting' && r.reportingMonth === selectedReportMonth
    );
  }, [monthlyReports, selectedReportMonth]);

  React.useEffect(() => {
    if (currentAttendanceReport) {
      setReportActivities(currentAttendanceReport.activitiesCarriedOut || '');
      setReportWorkCompleted(currentAttendanceReport.workCompleted || '');
      setReportChallenges(currentAttendanceReport.challengesEncountered || '');
      setReportComplaints(currentAttendanceReport.complaintsOrIssues || '');
      setReportRecommendations(currentAttendanceReport.recommendations || '');
      setReportOutstanding(currentAttendanceReport.outstandingResponsibilities || '');
      setReportNextMonth(currentAttendanceReport.activitiesPlannedNextMonth || '');
    } else {
      setReportActivities(
        'Maintained front desk operations across all Sunday 1st & 2nd services and Tuesday Word & Communion services. Tracked member arrival times, handled inquiries, and coordinated lost-and-found returns.'
      );
      setReportWorkCompleted(
        'Collated weekly service reports from Desk A and Desk B. Logged officiating duty assignments, finalized combined attendance digests, and shared reports with leadership.'
      );
      setReportChallenges(
        'Congestion at Desk A during 1st service dismissal; occasional delay in submitting shift handover notes.'
      );
      setReportComplaints(
        'Visitors requested physical church directory printouts at the desk.'
      );
      setReportRecommendations(
        'Introduce a digital tablet at each desk station for quicker inquiry logging and visitor registration.'
      );
      setReportOutstanding(
        'Finalize reconciliation of 3 uncollected lost-and-found items.'
      );
      setReportNextMonth(
        'Conduct a service reporting refresher for newly assigned duty officers before communion week.'
      );
    }
  }, [currentAttendanceReport, selectedReportMonth]);

  const handleSaveMonthlyReport = (submit: boolean = false) => {
    const reportPayload: Omit<DepartmentMonthlyReport, 'id' | 'createdAt' | 'updatedAt'> = {
      departmentUnit: 'Attendance & Service Reporting',
      reportingMonth: selectedReportMonth,
      submittedBy: currentUser?.name || 'Reporting Officer',
      submittedByRole: 'Head of Service Reporting',
      submissionDate: new Date().toISOString().split('T')[0],
      status: submit ? 'Submitted' : 'Draft',
      activitiesCarriedOut: reportActivities,
      workCompleted: reportWorkCompleted,
      importantStatistics: {
        'Total Services Logged': reports.length,
        'Active Duty Dates': availableServiceDates.length,
        'Desk Stations Monitored': 2,
        'Inquiries Documented': reports.filter((r) => r.inquiriesReceived).length,
        'Incident Logged': reports.filter((r) => r.issuesEncountered).length,
      },
      challengesEncountered: reportChallenges,
      complaintsOrIssues: reportComplaints,
      recommendations: reportRecommendations,
      outstandingResponsibilities: reportOutstanding,
      activitiesPlannedNextMonth: reportNextMonth,
    };

    saveMonthlyReport({
      ...(currentAttendanceReport?.id ? { id: currentAttendanceReport.id } : {}),
      ...reportPayload,
    });

    setReportSavedBanner(
      submit
        ? `✓ Attendance & Service Monthly Report for ${selectedReportMonth} submitted successfully to the HOD!`
        : `✓ Attendance & Service Monthly Report for ${selectedReportMonth} saved as Draft!`
    );
    setTimeout(() => setReportSavedBanner(null), 4000);
  };

  // Sub-filter for Individual reports view: 'all' | 'Desk A' | 'Desk B' | 'Bookstand'
  const [individualStationFilter, setIndividualStationFilter] = useState<'all' | 'Desk A' | 'Desk B' | 'Bookstand'>('all');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & detail view state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ServiceReport | null>(null);
  const [viewingReport, setViewingReport] = useState<ServiceReport | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reportToShare, setReportToShare] = useState<ServiceReport | null>(null);

  // -------------------------------------------------------------
  // FORM STATE FOR INDIVIDUAL REPORT SUBMISSION
  // -------------------------------------------------------------
  const [formMemberId, setFormMemberId] = useState<string>('');
  const [formServiceDate, setFormServiceDate] = useState<string>(selectedServiceDate);
  const [formServiceDay, setFormServiceDay] = useState<'Sunday' | 'Tuesday'>(isTuesdayService ? 'Tuesday' : 'Sunday');
  const [formStation, setFormStation] = useState<'Desk A' | 'Desk B'>('Desk A');
  const [formServiceType, setFormServiceType] = useState<ServiceReport['serviceType']>(
    isTuesdayService ? 'Tuesday Word & Communion' : 'Sunday 1st Service'
  );
  const [formPeopleAttended, setFormPeopleAttended] = useState<string>('50');
  const [formInquiries, setFormInquiries] = useState<string>('');
  const [formChallenges, setFormChallenges] = useState<string>('');
  const [formObservations, setFormObservations] = useState<string>('');
  const [formComments, setFormComments] = useState<string>('');

  // -------------------------------------------------------------
  // COMPUTED METRICS FOR THE SELECTED SERVICE DATE
  // -------------------------------------------------------------
  // All reports for this selected service date
  const currentServiceReports = useMemo(() => {
    return reports.filter((r) => r.serviceDate === selectedServiceDate);
  }, [reports, selectedServiceDate]);

  // Backward compatibility alias for current reports
  const currentSundayReports = currentServiceReports;

  // Desk A reports for this date
  const deskAReports = useMemo(() => {
    return currentServiceReports.filter(
      (r) => r.servingStation === 'Desk A' || r.reportingWing === 'Desk A — Left Wing'
    );
  }, [currentServiceReports]);

  // Desk B reports for this date
  const deskBReports = useMemo(() => {
    return currentServiceReports.filter(
      (r) => r.servingStation === 'Desk B' || r.reportingWing === 'Desk B — Right Wing'
    );
  }, [currentServiceReports]);

  // Totals for this specific date
  const deskAPeople = useMemo(() => {
    return deskAReports.reduce(
      (sum, r) => sum + (r.peopleAttendedCount ?? r.deskAttendanceCount ?? 0),
      0
    );
  }, [deskAReports]);

  const deskBPeople = useMemo(() => {
    return deskBReports.reduce(
      (sum, r) => sum + (r.peopleAttendedCount ?? r.deskAttendanceCount ?? 0),
      0
    );
  }, [deskBReports]);

  // Combined total is the sum of people attended to across both desks
  const combinedPeopleAttended = deskAPeople + deskBPeople;
  const totalReportsSubmitted = currentServiceReports.length;

  const deskAInquiriesCount = useMemo(() => {
    return deskAReports.reduce((sum, r) => sum + (r.inquiriesHandled || 0), 0);
  }, [deskAReports]);

  const deskBInquiriesCount = useMemo(() => {
    return deskBReports.reduce((sum, r) => sum + (r.inquiriesHandled || 0), 0);
  }, [deskBReports]);

  const combinedInquiriesCount = deskAInquiriesCount + deskBInquiriesCount;

  // -------------------------------------------------------------
  // BOOKSTAND METRICS FOR THE SELECTED SERVICE DATE
  // -------------------------------------------------------------
  const bookstandSessionsForDate = useMemo(() => {
    return bookstandDutySessions.filter((s) => s.serviceDate === selectedServiceDate);
  }, [bookstandDutySessions, selectedServiceDate]);

  const bookstandActivitiesForDate = useMemo(() => {
    return bookstandActivities.filter((a) => a.serviceDate === selectedServiceDate);
  }, [bookstandActivities, selectedServiceDate]);

  const bookstandComplaintsForDate = useMemo(() => {
    return bookstandComplaints.filter((c) => c.serviceDate === selectedServiceDate);
  }, [bookstandComplaints, selectedServiceDate]);

  const bookstandSalesForDate = useMemo(() => {
    return sales.filter((s) => s.saleDate === selectedServiceDate);
  }, [sales, selectedServiceDate]);

  const bookstandTotalUnitsSold = useMemo(() => {
    return bookstandSalesForDate.reduce(
      (sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0),
      0
    );
  }, [bookstandSalesForDate]);

  const bookstandTotalRevenue = useMemo(() => {
    return bookstandSalesForDate.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [bookstandSalesForDate]);

  const bookstandOfficiatingNames = useMemo(() => {
    const names = new Set<string>();
    bookstandSessionsForDate.forEach((s) => names.add(s.officiatingName));
    bookstandSalesForDate.forEach((s) => {
      if (s.recordedBy) names.add(s.recordedBy);
    });
    return Array.from(names);
  }, [bookstandSessionsForDate, bookstandSalesForDate]);

  // Filtered reports for individual tab view
  const filteredIndividualReports = useMemo(() => {
    return currentServiceReports.filter((r) => {
      const isDeskA = r.servingStation === 'Desk A' || r.reportingWing === 'Desk A — Left Wing';
      const isDeskB = r.servingStation === 'Desk B' || r.reportingWing === 'Desk B — Right Wing';

      let stationMatch = true;
      if (individualStationFilter === 'Desk A') stationMatch = isDeskA;
      if (individualStationFilter === 'Desk B') stationMatch = isDeskB;
      if (individualStationFilter === 'Bookstand') stationMatch = false;

      const searchMatch =
        !searchQuery ||
        r.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.reportingMemberName && r.reportingMemberName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.inquiriesReceived && r.inquiriesReceived.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.issuesEncountered && r.issuesEncountered.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.observations && r.observations.toLowerCase().includes(searchQuery.toLowerCase()));

      return stationMatch && searchMatch;
    });
  }, [currentServiceReports, individualStationFilter, searchQuery]);

  // Open Submit Report Modal
  const handleOpenSubmit = () => {
    setEditingReport(null);
    const matchedMember = members.find(
      (m) =>
        m.fullName.toLowerCase() === currentUser.name.toLowerCase() ||
        m.email.toLowerCase() === currentUser.email.toLowerCase()
    );

    const isTue = new Date(selectedServiceDate).getDay() === 2;
    setFormMemberId(matchedMember?.id || members[0]?.id || '');
    setFormServiceDate(selectedServiceDate);
    setFormServiceDay(isTue ? 'Tuesday' : 'Sunday');
    setFormStation('Desk A');
    setFormServiceType(isTue ? 'Tuesday Word & Communion' : 'Sunday 1st Service');
    setFormPeopleAttended('45');
    setFormInquiries('');
    setFormChallenges('');
    setFormObservations('');
    setFormComments('');
    setIsSubmitModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (report: ServiceReport) => {
    const isAuthor =
      report.submittedBy.toLowerCase() === currentUser.name.toLowerCase() ||
      report.reportingMemberId === currentUser.id;

    if (!isAuthor && !isAuthorizedManager) {
      alert('You can only edit service reports that you submitted.');
      return;
    }

    const isTue = report.serviceType?.startsWith('Tuesday') || new Date(report.serviceDate).getDay() === 2;
    setEditingReport(report);
    setFormMemberId(report.reportingMemberId || members[0]?.id || '');
    setFormServiceDate(report.serviceDate);
    setFormServiceDay(isTue ? 'Tuesday' : 'Sunday');
    setFormStation(
      report.servingStation || (report.reportingWing.includes('Desk B') ? 'Desk B' : 'Desk A')
    );
    setFormServiceType(report.serviceType);
    setFormPeopleAttended(String(report.peopleAttendedCount ?? report.deskAttendanceCount ?? 0));
    setFormInquiries(report.inquiriesReceived || '');
    setFormChallenges(report.issuesEncountered || report.challenges || '');
    setFormObservations(report.observations || '');
    setFormComments(report.additionalComments || report.activitiesCarriedOut || '');
    setIsSubmitModalOpen(true);
  };

  // Handle Form Submit
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedMember = members.find((m) => m.id === formMemberId);
    const peopleCount = parseInt(formPeopleAttended, 10) || 0;

    const reportPayload: Omit<ServiceReport, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${formStation} Service Report — ${formatDate(formServiceDate)}`,
      serviceDate: formServiceDate,
      serviceType: formServiceType,
      reportingWing: formStation === 'Desk A' ? 'Desk A — Left Wing' : 'Desk B — Right Wing',
      servingStation: formStation,
      reportingMemberId: selectedMember?.id,
      reportingMemberName: selectedMember?.fullName || currentUser.name,
      reportingMemberPhoto: selectedMember?.photoUrl,
      peopleAttendedCount: peopleCount,
      deskAttendanceCount: peopleCount,
      inquiriesReceived: formInquiries.trim(),
      inquiriesHandled: Math.max(1, Math.round(peopleCount * 0.6)),
      cellConnectionsCount: Math.round(peopleCount * 0.15),
      lostItemsLogged: 0,
      activitiesCarriedOut: formComments.trim() || `Officiated at ${formStation} for ${formServiceType}`,
      observations: formObservations.trim() || 'No unusual observations noted.',
      issuesEncountered: formChallenges.trim() || 'None',
      challenges: formChallenges.trim() || 'None',
      additionalComments: formComments.trim(),
      followUpActions: formChallenges.trim() ? 'Review with HOD and desk lead' : 'None required',
      submittedBy: selectedMember?.fullName || currentUser.name,
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
    };

    if (editingReport) {
      updateReport(editingReport.id, reportPayload);
    } else {
      addReport(reportPayload);
    }

    setSelectedServiceDate(formServiceDate);
    setIsSubmitModalOpen(false);

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#3B82F6', '#10B981'],
    });
  };

  // Delete report
  const handleDeleteReport = (id: string, reporterName: string) => {
    if (!isAuthorizedManager) {
      alert('Only department leadership can delete submitted service reports.');
      return;
    }
    if (confirm(`Are you sure you want to delete the service report submitted by ${reporterName}?`)) {
      deleteReport(id);
      if (viewingReport?.id === id) setViewingReport(null);
    }
  };

  // Export Combined CSV
  const handleExportCSV = () => {
    exportToCSV(
      currentServiceReports.map((r) => ({
        ServiceDate: r.serviceDate,
        ServiceType: r.serviceType,
        Station: r.servingStation || (r.reportingWing.includes('Desk B') ? 'Desk B' : 'Desk A'),
        ReportingMember: r.reportingMemberName || r.submittedBy,
        PeopleAttended: r.peopleAttendedCount ?? r.deskAttendanceCount ?? 0,
        InquiriesReceived: r.inquiriesReceived || 'N/A',
        ChallengesIssues: r.issuesEncountered || r.challenges || 'None',
        Observations: r.observations || 'N/A',
        SubmittedAt: r.submittedAt ? new Date(r.submittedAt).toLocaleTimeString() : 'N/A',
      })),
      `DominionCity_Asaba_ServiceReport_${selectedServiceDate}`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ----------------------------------------------------------- */}
      {/* 1. HEADER BANNER: BRAND BLUE IDENTITY & SCHEDULE SELECTION  */}
      {/* ----------------------------------------------------------- */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0B1E48] via-[#103070] to-[#1E489E] text-white shadow-xl border border-blue-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
              Dominion City Asaba • Information Desk Department
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-blue-300" />
              Service Reports — Sunday &amp; Tuesday
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
              Individual service reporting for Desk A and Desk B with Sunday consolidation, Tuesday Word &amp; Communion summaries, attendee counting, and WhatsApp report delivery.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenSubmit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Report</span>
            </button>

            {onOpenReportToHRD && (
              <button
                onClick={onOpenReportToHRD}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer border border-amber-300"
                title="Send observation, incident or message directly to HOD"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>REPORT TO HOD</span>
              </button>
            )}

            <button
              onClick={() => {
                setReportToShare(null);
                setIsShareModalOpen(true);
              }}
              disabled={currentServiceReports.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer border border-emerald-400/40 shadow-sm disabled:opacity-50"
              title="Share service report via WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Report</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              disabled={currentServiceReports.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/20 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Report</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={currentServiceReports.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/20 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* SERVICE DAY & SERVICE DATE SELECTOR (Sunday & Tuesday)     */}
        {/* ----------------------------------------------------------- */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {/* Service Day Filter Pills */}
            <div className="flex items-center gap-1 shrink-0 bg-blue-950/60 p-1 rounded-xl border border-blue-800/60">
              {(['all', 'Sunday', 'Tuesday'] as const).map((dayOpt) => (
                <button
                  key={dayOpt}
                  onClick={() => setServiceDayFilter(dayOpt)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${serviceDayFilter === dayOpt
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-blue-200 hover:text-white'
                    }`}
                >
                  {dayOpt === 'all' ? 'All Services' : dayOpt === 'Sunday' ? '☀️ Sunday' : '🔥 Tuesday'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-bold text-blue-200 shrink-0 flex items-center gap-1 mr-1">
                <Calendar className="w-3.5 h-3.5 text-blue-300" />
                Date:
              </span>

              {filteredServiceDates.map((dateStr) => {
                const isSelected = dateStr === selectedServiceDate;
                const isTue = new Date(dateStr).getDay() === 2;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedServiceDate(dateStr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${isSelected
                      ? 'bg-white text-blue-900 shadow-md ring-2 ring-blue-300'
                      : 'bg-white/10 hover:bg-white/20 text-blue-100 border border-white/10'
                      }`}
                  >
                    <span>{isTue ? '🔥 Tue' : '☀️ Sun'} {formatDate(dateStr)}</span>
                  </button>
                );
              })}

              {/* Bookstand Officiating Shift Submissions in Individual Tab */}
              {(individualStationFilter === 'all' || individualStationFilter === 'Bookstand') &&
                bookstandSessionsForDate
                  .filter((s) => !searchQuery || s.officiatingName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((session) => (
                    <div
                      key={session.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-purple-200 dark:border-purple-900/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-black flex items-center justify-center text-base shadow-xs">
                              {session.officiatingName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {session.officiatingName}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                                  Bookstand Literature
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {session.serviceType} • Phone: {session.officiatingPhone || 'On Duty'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-purple-400 block">
                              Copies Sold
                            </span>
                            <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                              {bookstandTotalUnitsSold}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                          <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                            <span className="font-bold text-purple-900 dark:text-purple-300 block mb-0.5">
                              Opening Shift Notes:
                            </span>
                            <p className="leading-relaxed italic">"{session.openingNotes || 'Table arranged and duty started'}"</p>
                          </div>

                          {session.handoverNotes && (
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                                Handover / Closing Notes:
                              </span>
                              <p className="leading-relaxed italic">"{session.handoverNotes}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          Session Status: <strong className={session.status === 'Active' ? 'text-emerald-600' : 'text-slate-600'}>{session.status}</strong>
                        </span>
                        {canViewBookstandFinancials && (
                          <span className="font-black text-purple-700 dark:text-purple-300">
                            {formatNaira(bookstandTotalRevenue)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-blue-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Session: {isTuesdayService ? 'Tuesday Word & Communion' : 'Sunday Service'} ({formatDate(selectedServiceDate)})</span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 2. NAVIGATION TABS: COMBINED | INDIVIDUAL | ARCHIVE         */}
      {/* ----------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0E172B] p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveMainTab('combined')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeMainTab === 'combined'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Combined Service Report</span>
          </button>

          <button
            onClick={() => setActiveMainTab('individual')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeMainTab === 'individual'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Individual Desk Reports ({currentServiceReports.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('archive')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeMainTab === 'archive'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Service Archive ({availableServiceDates.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('monthly-report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'monthly-report'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Monthly Unit Report</span>
          </button>
        </div>

        {activeMainTab === 'individual' && (
          <div className="flex items-center gap-2">
            <select
              value={individualStationFilter}
              onChange={(e) => setIndividualStationFilter(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Stations (Desk A, B &amp; Bookstand)</option>
              <option value="Desk A">Desk A Only ({deskAReports.length})</option>
              <option value="Desk B">Desk B Only ({deskBReports.length})</option>
              <option value="Bookstand">Bookstand Literature ({bookstandSessionsForDate.length} Shifts / {bookstandTotalUnitsSold} Sold)</option>
            </select>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------- */}
      {/* TAB 1: COMBINED SUNDAY REPORT                               */}
      {/* ----------------------------------------------------------- */}
      {activeMainTab === 'combined' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total People Attended To
              </span>
              <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {combinedPeopleAttended.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                Desk A &amp; Desk B sum
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Desk A Attended
              </span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {deskAPeople.toLocaleString()}
              </p>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5 block">
                Left Wing ({deskAReports.length} report)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Desk B Attended
              </span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {deskBPeople.toLocaleString()}
              </p>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5 block">
                Right Wing ({deskBReports.length} report)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                Bookstand Activity
              </span>
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {bookstandTotalUnitsSold} <span className="text-xs font-semibold text-slate-400">Sold</span>
              </p>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-0.5 block">
                {bookstandSessionsForDate.length > 0
                  ? `${bookstandSessionsForDate.length} Shift Session${bookstandSessionsForDate.length > 1 ? 's' : ''}`
                  : `${bookstandSalesForDate.length} Book Sale${bookstandSalesForDate.length === 1 ? '' : 's'}`}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Reports &amp; Shifts
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {totalReportsSubmitted + bookstandSessionsForDate.length}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                Desk + Stand Duty
              </span>
            </div>
          </div>

          {currentSundayReports.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-[#0E172B] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Service Reports Submitted for {formatDate(selectedSunday)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Members officiating for this Sunday service can submit their individual report for Desk A or Desk B using the button below.
              </p>
              <button
                onClick={handleOpenSubmit}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Report for this Sunday</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Three-Column Section: Desk A, Desk B, and Bookstand */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 1. Desk A Card */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-blue-200 dark:border-blue-900/50 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center text-sm shadow-xs">
                        A
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Desk A (Left Wing)
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {deskAReports.length > 0 ? `${deskAReports.length} Report Filed` : 'No report filed yet'}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      {deskAPeople} People Attended
                    </span>
                  </div>

                  {deskAReports.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4">Desk A report pending submission.</p>
                  ) : (
                    <div className="space-y-3">
                      {deskAReports.map((r) => (
                        <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  r.reportingMemberPhoto ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                                }
                                alt={r.submittedBy}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-300"
                              />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {r.reportingMemberName || r.submittedBy}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {r.submittedAt ? new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>

                          {r.inquiriesReceived && (
                            <div className="text-xs text-slate-600 dark:text-slate-300">
                              <strong className="text-slate-800 dark:text-slate-200">Inquiries: </strong>
                              {r.inquiriesReceived}
                            </div>
                          )}

                          {r.issuesEncountered && r.issuesEncountered !== 'None' && (
                            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
                              <strong>Issues: </strong> {r.issuesEncountered}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Desk B Card */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-indigo-200 dark:border-indigo-900/50 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black flex items-center justify-center text-sm shadow-xs">
                        B
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Desk B (Right Wing)
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {deskBReports.length > 0 ? `${deskBReports.length} Report Filed` : 'No report filed yet'}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {deskBPeople} People Attended
                    </span>
                  </div>

                  {deskBReports.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4">Desk B report pending submission.</p>
                  ) : (
                    <div className="space-y-3">
                      {deskBReports.map((r) => (
                        <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  r.reportingMemberPhoto ||
                                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
                                }
                                alt={r.submittedBy}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-300"
                              />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {r.reportingMemberName || r.submittedBy}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {r.submittedAt ? new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>

                          {r.inquiriesReceived && (
                            <div className="text-xs text-slate-600 dark:text-slate-300">
                              <strong className="text-slate-800 dark:text-slate-200">Inquiries: </strong>
                              {r.inquiriesReceived}
                            </div>
                          )}

                          {r.issuesEncountered && r.issuesEncountered !== 'None' && (
                            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
                              <strong>Issues: </strong> {r.issuesEncountered}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Bookstand (Literature & Stand Officiating) Card */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-purple-200 dark:border-purple-900/50 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black flex items-center justify-center text-sm shadow-xs">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Bookstand (Literature Stand)
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {bookstandSessionsForDate.length > 0
                            ? `${bookstandSessionsForDate.length} Duty Session${bookstandSessionsForDate.length > 1 ? 's' : ''}`
                            : `${bookstandSalesForDate.length} Transactions Logged`}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      {bookstandTotalUnitsSold} Copies Sold
                    </span>
                  </div>

                  {bookstandSessionsForDate.length === 0 && bookstandSalesForDate.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4">
                      No bookstand duty session or sales recorded for this service date.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {/* Officiating Members on Duty */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                          Officiating Personnel on Duty:
                        </span>
                        {bookstandSessionsForDate.length > 0 ? (
                          <div className="space-y-1.5">
                            {bookstandSessionsForDate.map((session) => (
                              <div key={session.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 flex items-center justify-center text-[10px] font-black">
                                    {session.officiatingName.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 dark:text-white block">
                                      {session.officiatingName}
                                    </span>
                                    {session.officiatingPhone && (
                                      <span className="text-[10px] text-slate-400">
                                        {session.officiatingPhone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`text-[9px] font-black px-2 py-0.5 rounded-full ${session.status === 'Active'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                  {session.status === 'Active' ? 'Active Shift' : 'Completed'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-700 dark:text-slate-300">
                            Recorded by: <strong>{bookstandOfficiatingNames.join(', ')}</strong>
                          </p>
                        )}
                      </div>

                      {/* Financials & Volume Summary */}
                      <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Publications Distributed:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{bookstandTotalUnitsSold} Copies</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Sales Revenue:</span>
                          {canViewBookstandFinancials ? (
                            <span className="font-black text-purple-700 dark:text-purple-300">
                              {formatNaira(bookstandTotalRevenue)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Confidential
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Duty Activities Logged:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {bookstandActivitiesForDate.length} recorded
                          </span>
                        </div>
                      </div>

                      {/* Stand Complaints & Discrepancies if any */}
                      {bookstandComplaintsForDate.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 text-xs space-y-1">
                          <span className="font-bold text-amber-900 dark:text-amber-300 block text-[11px]">
                            Stand Issues / Discrepancies ({bookstandComplaintsForDate.length}):
                          </span>
                          {bookstandComplaintsForDate.slice(0, 2).map((c) => (
                            <div key={c.id} className="text-[11px] text-amber-800 dark:text-amber-300">
                              • <strong>[{c.category}]</strong> {c.subject} ({c.status})
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Opening / Handover Notes */}
                      {bookstandSessionsForDate.some((s) => s.handoverNotes || s.openingNotes) && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 italic">
                          "{bookstandSessionsForDate.find((s) => s.handoverNotes)?.handoverNotes ||
                            bookstandSessionsForDate.find((s) => s.openingNotes)?.openingNotes}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Combined Inquiries and Challenges Detailed Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Combined Inquiries Received */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Combined Enquiries &amp; Information Handled
                  </h4>
                  <div className="space-y-2.5">
                    {currentSundayReports.filter((r) => r.inquiriesReceived).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No specific inquiries recorded.</p>
                    ) : (
                      currentSundayReports
                        .filter((r) => r.inquiriesReceived)
                        .map((r) => (
                          <div
                            key={r.id}
                            className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs"
                          >
                            <span className="font-bold text-blue-800 dark:text-blue-300 block mb-1">
                              {r.servingStation || r.reportingWing} ({r.reportingMemberName || r.submittedBy}):
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {r.inquiriesReceived}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Combined Issues & Challenges Reported (Desks + Bookstand) */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Combined Issues, Complaints &amp; Observations
                  </h4>
                  <div className="space-y-2.5">
                    {currentSundayReports.filter(
                      (r) => (r.issuesEncountered && r.issuesEncountered !== 'None') || r.observations
                    ).length === 0 && bookstandComplaintsForDate.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No issues or complaints reported for this service.</p>
                    ) : (
                      <>
                        {currentSundayReports.map((r) => (
                          <div
                            key={r.id}
                            className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-xs space-y-1.5"
                          >
                            <span className="font-bold text-amber-900 dark:text-amber-300 block">
                              {r.servingStation || r.reportingWing} ({r.reportingMemberName || r.submittedBy}):
                            </span>
                            {r.issuesEncountered && r.issuesEncountered !== 'None' && (
                              <p className="text-slate-700 dark:text-slate-300">
                                <strong>Challenge:</strong> {r.issuesEncountered}
                              </p>
                            )}
                            {r.observations && (
                              <p className="text-slate-600 dark:text-slate-400 italic">
                                <strong>Observation:</strong> {r.observations}
                              </p>
                            )}
                          </div>
                        ))}

                        {/* Bookstand Stand Complaints */}
                        {bookstandComplaintsForDate.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-purple-900 dark:text-purple-300">
                                Bookstand Stand ({c.submittedBy}): [{c.category}] {c.subject}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.status === 'Resolved'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}
                              >
                                {c.status}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {c.description}
                            </p>
                            {c.resolutionNotes && (
                              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                                <strong>Resolution:</strong> {c.resolutionNotes}
                              </p>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 2: INDIVIDUAL DESK REPORTS                              */}
      {/* ----------------------------------------------------------- */}
      {activeMainTab === 'individual' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0E172B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reporting member, inquiries, challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredIndividualReports.length}</strong> individual submissions for{' '}
              <strong className="text-blue-600">{formatDate(selectedSunday)}</strong>
            </div>
          </div>

          {filteredIndividualReports.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No individual reports match this filter. Click "+ Submit Individual Report" to file a report.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIndividualReports.map((report) => {
                const isDeskA =
                  report.servingStation === 'Desk A' || report.reportingWing === 'Desk A — Left Wing';
                const isAuthor =
                  report.submittedBy.toLowerCase() === currentUser.name.toLowerCase() ||
                  report.reportingMemberId === currentUser.id;
                const canEdit = isAuthor || isAuthorizedManager;

                return (
                  <div
                    key={report.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Officer & Station Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              report.reportingMemberPhoto ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                            }
                            alt={report.submittedBy}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-200 dark:ring-blue-900 shadow-xs"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {report.reportingMemberName || report.submittedBy}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isDeskA
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                  : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                                  }`}
                              >
                                {report.servingStation || report.reportingWing}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {report.serviceType} • Submitted:{' '}
                              <strong className="text-slate-700 dark:text-slate-300">
                                {report.submittedAt
                                  ? new Date(report.submittedAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                  : 'Recorded'}
                              </strong>
                            </p>
                          </div>
                        </div>

                        {/* People Attended Badge */}
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Attended To
                          </span>
                          <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                            {report.peopleAttendedCount ?? report.deskAttendanceCount ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Content Sections */}
                      <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                        {report.inquiriesReceived && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5 flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                              Inquiries Handled:
                            </span>
                            <p className="leading-relaxed">{report.inquiriesReceived}</p>
                          </div>
                        )}

                        {report.issuesEncountered && report.issuesEncountered !== 'None' && (
                          <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-amber-900 dark:text-amber-300">
                            <span className="font-bold block mb-0.5 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              Challenges &amp; Complaints:
                            </span>
                            <p className="leading-relaxed">{report.issuesEncountered}</p>
                          </div>
                        )}

                        {report.observations && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5 flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-purple-500" />
                              Observations:
                            </span>
                            <p className="leading-relaxed">{report.observations}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Date: {formatDate(report.serviceDate)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setReportToShare(report);
                            setIsShareModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer transition-colors"
                          title="Share this report via WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleOpenEdit(report)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer transition-colors"
                            title="Edit report"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAuthorizedManager && (
                          <button
                            onClick={() =>
                              handleDeleteReport(
                                report.id,
                                report.reportingMemberName || report.submittedBy
                              )
                            }
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer transition-colors"
                            title="Delete report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bookstand Officiating Shift Submissions in Individual Tab */}
              {(individualStationFilter === 'all' || individualStationFilter === 'Bookstand') &&
                bookstandSessionsForDate
                  .filter((s) => !searchQuery || s.officiatingName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((session) => (
                    <div
                      key={session.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#0E172B] border border-purple-200 dark:border-purple-900/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-black flex items-center justify-center text-base shadow-xs">
                              {session.officiatingName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {session.officiatingName}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                                  Bookstand Literature
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {session.serviceType} • Phone: {session.officiatingPhone || 'On Duty'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-purple-400 block">
                              Copies Sold
                            </span>
                            <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                              {bookstandTotalUnitsSold}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                          <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                            <span className="font-bold text-purple-900 dark:text-purple-300 block mb-0.5">
                              Opening Shift Notes:
                            </span>
                            <p className="leading-relaxed italic">"{session.openingNotes || 'Table arranged and duty started'}"</p>
                          </div>

                          {session.handoverNotes && (
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                                Handover / Closing Notes:
                              </span>
                              <p className="leading-relaxed italic">"{session.handoverNotes}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          Session Status: <strong className={session.status === 'Active' ? 'text-emerald-600' : 'text-slate-600'}>{session.status}</strong>
                        </span>
                        {canViewBookstandFinancials && (
                          <span className="font-black text-purple-700 dark:text-purple-300">
                            {formatNaira(bookstandTotalRevenue)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 3: SERVICE ARCHIVE & HISTORY (Sunday & Tuesday)         */}
      {/* ----------------------------------------------------------- */}
      {activeMainTab === 'archive' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Archive className="w-4 h-4 text-blue-600" />
              Service Reporting Archive &amp; Permanent History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any past Sunday or Tuesday service to review individual Desk A, Desk B, and official combined reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableServiceDates.map((dateStr) => {
              const serviceReps = reports.filter((r) => r.serviceDate === dateStr);
              const dAPeople = serviceReps
                .filter((r) => r.servingStation === 'Desk A' || r.reportingWing.includes('Desk A'))
                .reduce((s, r) => s + (r.peopleAttendedCount ?? r.deskAttendanceCount ?? 0), 0);
              const dBPeople = serviceReps
                .filter((r) => r.servingStation === 'Desk B' || r.reportingWing.includes('Desk B'))
                .reduce((s, r) => s + (r.peopleAttendedCount ?? r.deskAttendanceCount ?? 0), 0);
              const totalAttended = dAPeople + dBPeople;
              const isSelected = dateStr === selectedServiceDate;
              const isTue = new Date(dateStr).getDay() === 2;

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedServiceDate(dateStr);
                    setActiveMainTab('combined');
                  }}
                  className={`p-5 rounded-3xl bg-white dark:bg-[#0E172B] border transition-all cursor-pointer shadow-xs hover:shadow-md space-y-3 ${isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{isTue ? '🔥 Tue' : '☀️ Sun'}</span>
                      <span>{formatDate(dateStr)}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isTue
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      }`}>
                      {serviceReps.length} Reports
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Total Attended</span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                        {totalAttended.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Desk Breakdown</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        A: {dAPeople} • B: {dBPeople}
                      </span>
                    </div>
                  </div>

                  {/* Reporting Officers Avatars */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {serviceReps.map((r, i) => (
                        <img
                          key={r.id || i}
                          src={
                            r.reportingMemberPhoto ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          }
                          alt={r.submittedBy}
                          title={r.submittedBy}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                        />
                      ))}
                    </div>

                    <span className="text-blue-600 dark:text-blue-400 font-bold inline-flex items-center gap-1 text-xs">
                      View Report <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 4: MONTHLY ATTENDANCE & SERVICE OPERATING REPORT        */}
      {/* ----------------------------------------------------------- */}
      {activeMainTab === 'monthly-report' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Attendance & Service Reporting Monthly Operating Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official 9-part monthly attendance and service reporting coordination report submitted directly to the Head of Department (HOD).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">Reporting Month:</label>
              <select
                value={selectedReportMonth}
                onChange={(e) => setSelectedReportMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="2026-11">November 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-09">September 2026</option>
              </select>
            </div>
          </div>

          {reportSavedBanner && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              {reportSavedBanner}
            </div>
          )}

          {currentAttendanceReport && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Submission Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                    currentAttendanceReport.status === 'Submitted'
                      ? 'bg-blue-500 text-white'
                      : currentAttendanceReport.status === 'Reviewed'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {currentAttendanceReport.status}
                </span>
                {currentAttendanceReport.reviewedBy && (
                  <span className="text-slate-400">
                    • Reviewed by <strong className="text-white">{currentAttendanceReport.reviewedBy}</strong>
                  </span>
                )}
              </div>
              {currentAttendanceReport.hodReviewNotes && (
                <div className="text-amber-200 italic text-[11px] bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  HOD Remark: "{currentAttendanceReport.hodReviewNotes}"
                </div>
              )}
            </div>
          )}

          {/* Unit Statistics Summary Card */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 block">
              3. Important Unit Statistics (Auto-Calculated for {selectedReportMonth})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
              <div className="bg-white dark:bg-[#0E172B] p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <span className="text-[10px] text-slate-400 block">Service Reports Logged</span>
                <strong className="text-blue-600 dark:text-blue-400 font-black">{reports.length} Reports</strong>
              </div>
              <div className="bg-white dark:bg-[#0E172B] p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <span className="text-[10px] text-slate-400 block">Active Service Dates</span>
                <strong className="text-slate-900 dark:text-white font-black">{availableServiceDates.length} Dates</strong>
              </div>
              <div className="bg-white dark:bg-[#0E172B] p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <span className="text-[10px] text-slate-400 block">Inquiries Handled</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-black">{reports.filter((r) => r.inquiriesReceived).length} Inquiries</strong>
              </div>
              <div className="bg-white dark:bg-[#0E172B] p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <span className="text-[10px] text-slate-400 block">Incidents Documented</span>
                <strong className="text-slate-900 dark:text-white font-black">{reports.filter((r) => r.issuesEncountered).length} Incidents</strong>
              </div>
            </div>
          </div>

          {/* 9-Part Narrative Form */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Major Activities Carried Out *
                </label>
                <textarea
                  rows={3}
                  value={reportActivities}
                  onChange={(e) => setReportActivities(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Service reporting, attendance records, desk deployments..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. Work Completed & Milestones *
                </label>
                <textarea
                  rows={3}
                  value={reportWorkCompleted}
                  onChange={(e) => setReportWorkCompleted(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Desk A & B reconciliations, punctuality logs, attendance digests..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  4. Operational Challenges Encountered
                </label>
                <textarea
                  rows={3}
                  value={reportChallenges}
                  onChange={(e) => setReportChallenges(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Lobby congestion during service changes, delayed handover reports..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  5. Complaints, Observations & Issues
                </label>
                <textarea
                  rows={3}
                  value={reportComplaints}
                  onChange={(e) => setReportComplaints(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Congregation inquiries, lost-and-found claims..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  6. Strategic Recommendations
                </label>
                <textarea
                  rows={3}
                  value={reportRecommendations}
                  onChange={(e) => setReportRecommendations(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Staffing recommendations, queue management improvements..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  7. Outstanding Responsibilities & Follow-Up
                </label>
                <textarea
                  rows={3}
                  value={reportOutstanding}
                  onChange={(e) => setReportOutstanding(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Follow-ups with visitors, unreturned items..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  8. Activities Planned for Next Month
                </label>
                <textarea
                  rows={2}
                  value={reportNextMonth}
                  onChange={(e) => setReportNextMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Officer reporting refresher, new service checklist deployment..."
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Reporting Officer: <strong>{currentUser?.name || 'Reporting Officer'}</strong> • Date: {new Date().toISOString().split('T')[0]}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-compact bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMonthlyReport(false)}
                  className="btn-compact bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-900 dark:text-white font-bold h-9 px-3.5 text-xs cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMonthlyReport(true)}
                  className="btn-compact bg-blue-600 hover:bg-blue-500 text-white font-bold h-9 px-4 text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Report to HOD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 4. MODAL: SUBMIT INDIVIDUAL REPORT (STREAMLINED & MOBILE)   */}
      {/* ----------------------------------------------------------- */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 max-h-[96vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Native Mobile Pull Indicator */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {editingReport ? 'Edit Service Report' : 'Submit Service Report'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    File attendance, inquiries &amp; challenges for this service session
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors text-base font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitReport} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                {/* 1. Member Identity Confirmation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Officiating Member Name *
                  </label>
                  <select
                    value={formMemberId}
                    onChange={(e) => setFormMemberId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.departmentRole})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Auto-selected from logged-in account ({currentUser.name})
                  </span>
                </div>

                {/* 2. Service Day Toggle (Sunday vs Tuesday) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Service Day *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormServiceDay('Sunday');
                        setFormServiceType('Sunday 1st Service');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${formServiceDay === 'Sunday'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                      <span>☀️ Sunday Service</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormServiceDay('Tuesday');
                        setFormServiceType('Tuesday Word & Communion');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${formServiceDay === 'Tuesday'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                      <span>🔥 Tuesday Word &amp; Communion</span>
                    </button>
                  </div>
                </div>

                {/* 3. Service Date & Session */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Service Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formServiceDate}
                      onChange={(e) => setFormServiceDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Service Session *
                    </label>
                    <select
                      value={formServiceType}
                      onChange={(e) => setFormServiceType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
                    >
                      {formServiceDay === 'Sunday' ? (
                        <>
                          <option value="Sunday 1st Service">Sunday 1st Service</option>
                          <option value="Sunday 2nd Service">Sunday 2nd Service</option>
                          <option value="Special Programme">Special Service / Combined</option>
                        </>
                      ) : (
                        <>
                          <option value="Tuesday Word & Communion">Tuesday Word &amp; Communion</option>
                          <option value="Special Programme">Special Midweek Programme</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* 4. Serving Station Selection (Desk A vs Desk B) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Your Serving Station for this Report *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormStation('Desk A')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${formStation === 'Desk A'
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                        }`}
                    >
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          🏢 Desk A
                        </span>
                        <span className="text-[10px] text-slate-500">Left Wing Sanctuary</span>
                      </div>
                      {formStation === 'Desk A' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormStation('Desk B')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${formStation === 'Desk B'
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                        }`}
                    >
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          🏢 Desk B
                        </span>
                        <span className="text-[10px] text-slate-500">Right Wing Sanctuary</span>
                      </div>
                      {formStation === 'Desk B' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 5. Number of People Attended To */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Number of People Attended To *
                    </label>
                    <span className="text-[10px] text-slate-400">Total enquirers served</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPeopleAttended}
                    onChange={(e) => setFormPeopleAttended(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-black"
                  />
                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['25', '50', '80', '120', '150'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormPeopleAttended(preset)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${formPeopleAttended === preset
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                      >
                        {preset} People
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Inquiries Received */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Relevant Inquiries Received
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Questions on cell fellowship locations in Summit Road, water baptism registration, first-timers guide..."
                    value={formInquiries}
                    onChange={(e) => setFormInquiries(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 7. Complaints, Challenges, Issues */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Complaints, Challenges, Issues or Bottlenecks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Shortage of printed cell directory slips halfway through service, sound system volume query..."
                    value={formChallenges}
                    onChange={(e) => setFormChallenges(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 8. Observations & Comments */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Additional Comments &amp; Service Observations
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Peak crowd occurred immediately after closing prayer. Good teamwork with ushers..."
                    value={formObservations}
                    onChange={(e) => setFormObservations(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white/95 dark:bg-[#0E172B]/95 backdrop-blur-md px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md cursor-pointer transition-transform hover:scale-102 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingReport ? 'Save Changes' : 'Submit Service Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT MODAL INTEGRATION */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={`Dominion City Asaba — Service Report (${formatDate(selectedServiceDate)})`}
          subtitle={`Official Information Desk Consolidation • Total People Attended: ${combinedPeopleAttended}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold text-sm">
                <span>Total Combined Enquiries / People Attended To:</span>
                <span className="text-blue-700">{combinedPeopleAttended} People</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Desk A (Left Wing): {deskAPeople} people</span>
                <span>Desk B (Right Wing): {deskBPeople} people</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Total Reports Filed: {totalReportsSubmitted}
              </div>
            </div>

            {/* Bookstand Summary in Print Document */}
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-sm">
                <span className="text-purple-900">Bookstand (Literature Stand):</span>
                <span className="text-purple-700">{bookstandTotalUnitsSold} Copies Distributed</span>
              </div>
              <div className="flex justify-between text-purple-800">
                <span>Officiating: {bookstandOfficiatingNames.join(', ') || 'Literature Stand Duty'}</span>
                {canViewBookstandFinancials ? (
                  <span className="font-bold">Sales Revenue: {formatNaira(bookstandTotalRevenue)}</span>
                ) : (
                  <span className="text-slate-400 italic">Financials Confidential</span>
                )}
              </div>
              {bookstandComplaintsForDate.length > 0 && (
                <div className="text-amber-800 text-[11px] pt-1 border-t border-purple-200/60">
                  <strong>Stand Issues Logged:</strong> {bookstandComplaintsForDate.map(c => `[${c.category}] ${c.subject}`).join('; ')}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-bold uppercase tracking-wider text-slate-700">Individual Submissions:</h4>
              {currentServiceReports.map((r) => (
                <div key={r.id} className="p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>
                      {r.servingStation || r.reportingWing} — {r.reportingMemberName || r.submittedBy}
                    </span>
                    <span>{r.peopleAttendedCount ?? r.deskAttendanceCount} Attended</span>
                  </div>
                  {r.inquiriesReceived && (
                    <p className="text-slate-600">
                      <strong>Inquiries:</strong> {r.inquiriesReceived}
                    </p>
                  )}
                  {r.issuesEncountered && r.issuesEncountered !== 'None' && (
                    <p className="text-rose-700">
                      <strong>Issues:</strong> {r.issuesEncountered}
                    </p>
                  )}
                  {r.observations && (
                    <p className="text-slate-500">
                      <strong>Observations:</strong> {r.observations}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PrintModal>
      )}

      {/* GLOBAL SHARE VIA WHATSAPP & PDF */}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setReportToShare(null);
          }}
          documentTitle={
            reportToShare
              ? `${reportToShare.servingStation || 'Desk'} Service Report (${formatDate(reportToShare.serviceDate)})`
              : `Consolidated Service Report (${formatDate(selectedServiceDate)})`
          }
          documentType="Service Report"
          subtitle={`Dominion City Asaba • Information Desk • ${reportToShare
            ? reportToShare.serviceType
            : isTuesdayService
              ? 'Tuesday Word & Communion'
              : 'Sunday Service'
            }`}
          documentRef={reportToShare ? `REP-${reportToShare.id.slice(-6).toUpperCase()}` : `REP-CONS-${selectedServiceDate.replace(/-/g, '')}`}
          isConfidential={false}
          contentLines={
            reportToShare
              ? [
                `Service Date: ${formatDate(reportToShare.serviceDate)}`,
                `Service Type: ${reportToShare.serviceType}`,
                `Serving Station: ${reportToShare.servingStation || reportToShare.reportingWing}`,
                `Reporting Member: ${reportToShare.reportingMemberName || reportToShare.submittedBy}`,
                `People Attended To: ${reportToShare.peopleAttendedCount ?? reportToShare.deskAttendanceCount ?? 0}`,
                `Inquiries Handled: ${reportToShare.inquiriesReceived || 'None'}`,
                `Bottlenecks / Challenges: ${reportToShare.issuesEncountered || reportToShare.challenges || 'None'}`,
                `Observations: ${reportToShare.observations || 'None'}`,
              ]
              : [
                `Service Date: ${formatDate(selectedServiceDate)}`,
                `Service Session: ${isTuesdayService ? 'Tuesday Word & Communion' : 'Sunday Service'}`,
                `Total People Attended To: ${combinedPeopleAttended}`,
                `Desk A Attendants Served: ${deskAPeople}`,
                `Desk B Attendants Served: ${deskBPeople}`,
                `Bookstand Literature Distributed: ${bookstandTotalUnitsSold} copies`,
                ...(canViewBookstandFinancials ? [`Bookstand Revenue: ${formatNaira(bookstandTotalRevenue)}`] : []),
                `Bookstand Officiating: ${bookstandOfficiatingNames.join(', ') || 'Literature Stand Duty'}`,
                `Total Reports & Shifts: ${totalReportsSubmitted + bookstandSessionsForDate.length}`,
                `Total Inquiries Logged: ${combinedInquiriesCount}`,
                `Stand Issues & Discrepancies Logged: ${bookstandComplaintsForDate.length}`,
              ]
          }
          tableHeaders={
            reportToShare
              ? undefined
              : ['Station', 'Reporting Member', 'Attended', 'Service Session', 'Key Inquiries', 'Challenges']
          }
          tableRows={
            reportToShare
              ? undefined
              : [
                ...currentServiceReports.map((r) => [
                  r.servingStation || (r.reportingWing.includes('Desk B') ? 'Desk B' : 'Desk A'),
                  r.reportingMemberName || r.submittedBy,
                  String(r.peopleAttendedCount ?? r.deskAttendanceCount ?? 0),
                  r.serviceType,
                  r.inquiriesReceived || '—',
                  r.issuesEncountered || r.challenges || 'None',
                ]),
                [
                  'Bookstand',
                  bookstandOfficiatingNames.join(', ') || 'Literature Stand',
                  `${bookstandTotalUnitsSold} Sold`,
                  isTuesdayService ? 'Tuesday Word & Communion' : 'Sunday Service',
                  `${bookstandActivitiesForDate.length} Activities Logged`,
                  bookstandComplaintsForDate.length > 0 ? `${bookstandComplaintsForDate.length} Issue(s) Reported` : 'None',
                ],
              ]
          }
          summaryNotes={`Generated by ${currentUser.name} (${currentUser.role}) on ${new Date().toLocaleDateString('en-GB')}. Official Dominion City Asaba Information Desk Report.`}
        />
      )}
    </div>
  );
};
