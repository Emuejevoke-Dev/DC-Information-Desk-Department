import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateUtils';
import { Logo } from '../common/Logo';
import {
  HeartHandshake,
  ArrowLeft,
  Users,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserX,
  FileText,
  Printer,
  Download,
  Send,
  Sparkles,
  Pin,
  MapPin,
  Shield,
  Activity,
  Heart,
  UserPlus,
  Trash2,
  Edit3,
  X,
  Check,
  FileCheck,
} from 'lucide-react';
import {
  WelfareTeamMember,
  WelfareFollowUpLog,
  WelfareFollowUpStatus,
  WelfareCase,
  WelfareCaseCategory,
  WelfareCaseUrgency,
  WelfareCaseStatus,
  VisitationSchedule,
  ServiceType,
  DepartmentMonthlyReport,
} from '../../types/models';

interface WelfareDashboardProps {
  onReturnToGeneral: () => void;
  onNavigateToMembers?: () => void;
  onOpenReportToHRD?: () => void;
}

type WelfareTab =
  | 'overview'
  | 'absentees'
  | 'team'
  | 'cases'
  | 'visitations'
  | 'support'
  | 'monthly-report';

export const WelfareDashboard: React.FC<WelfareDashboardProps> = ({
  onReturnToGeneral,
  onNavigateToMembers,
  onOpenReportToHRD,
}) => {
  const { currentUser, isHOD, isOperations, isWelfare, canManageWelfare } = useAuth();
  const {
    members,
    attendance,
    welfareTeam,
    addWelfareTeamMember,
    updateWelfareTeamMember,
    removeWelfareTeamMember,
    welfareFollowUps,
    recordWelfareFollowUp,
    welfareCases,
    addWelfareCase,
    updateWelfareCase,
    escalateWelfareCaseToHOD,
    visitations,
    addVisitationSchedule,
    updateVisitationSchedule,
    completeVisitation,
    monthlyReports,
    saveMonthlyReport,
  } = useData();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<WelfareTab>('overview');

  // Service Selection for Absentee Follow-up
  const [selectedServiceDate, setSelectedServiceDate] = useState<string>(() => {
    if (attendance.length > 0) {
      // Find latest date in attendance
      const sorted = [...attendance].sort((a, b) => b.serviceDate.localeCompare(a.serviceDate));
      return sorted[0].serviceDate;
    }
    return new Date().toISOString().split('T')[0];
  });

  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>('Sunday 1st Service');
  const [absenteeSearch, setAbsenteeSearch] = useState('');
  const [absenteeStatusFilter, setAbsenteeStatusFilter] = useState<string>('all');

  // ==========================================================================
  // MODAL STATES
  // ==========================================================================

  // Follow-Up Modal State
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [activeFollowUpTarget, setActiveFollowUpTarget] = useState<{
    memberId: string;
    memberName: string;
    memberPhone: string;
    photoUrl?: string;
    serviceDate: string;
    serviceType: ServiceType;
    cellOrSatellite?: string;
  } | null>(null);

  const [fuContactMethod, setFuContactMethod] = useState<'Phone Call' | 'WhatsApp' | 'SMS' | 'Physical Visit'>('Phone Call');
  const [fuResponded, setFuResponded] = useState(true);
  const [fuReason, setFuReason] = useState('');
  const [fuConcerns, setFuConcerns] = useState('');
  const [fuAction, setFuAction] = useState('Keep in prayer & confirm attendance for upcoming service.');
  const [fuStatus, setFuStatus] = useState<WelfareFollowUpStatus>('Follow-up Completed');
  const [fuNotes, setFuNotes] = useState('');
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState('');

  // Add Welfare Team Member Modal
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedMemberIdForTeam, setSelectedMemberIdForTeam] = useState('');
  const [teamResponsibilities, setTeamResponsibilities] = useState<string[]>(['Sunday Absentees']);

  // Welfare Case Modal
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<WelfareCase | null>(null);
  const [caseMemberId, setCaseMemberId] = useState('');
  const [caseCategory, setCaseCategory] = useState<WelfareCaseCategory>('Illness');
  const [caseDescription, setCaseDescription] = useState('');
  const [caseUrgency, setCaseUrgency] = useState<WelfareCaseUrgency>('Medium');
  const [caseAction, setCaseAction] = useState('');
  const [caseFollowUpDate, setCaseFollowUpDate] = useState('');
  const [caseStatus, setCaseStatus] = useState<WelfareCaseStatus>('New');

  // Escalate to HOD Modal
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [targetCaseForEscalation, setTargetCaseForEscalation] = useState<WelfareCase | null>(null);
  const [escalationReportNotes, setEscalationReportNotes] = useState('');

  // Visitation Modal
  const [isVisitationModalOpen, setIsVisitationModalOpen] = useState(false);
  const [visMemberId, setVisMemberId] = useState('');
  const [visReason, setVisReason] = useState('');
  const [visDate, setVisDate] = useState('');
  const [visTime, setVisTime] = useState('04:30 PM');
  const [visAddress, setVisAddress] = useState('');
  const [visInstructions, setVisInstructions] = useState('');
  const [visAssignedTeamIds, setVisAssignedTeamIds] = useState<string[]>([]);
  const [visPinDays, setVisPinDays] = useState(3);

  // Complete Visitation Modal
  const [isCompleteVisModalOpen, setIsCompleteVisModalOpen] = useState(false);
  const [targetVisitation, setTargetVisitation] = useState<VisitationSchedule | null>(null);
  const [visOutcomeNotes, setVisOutcomeNotes] = useState('');
  const [visFollowUpNeeded, setVisFollowUpNeeded] = useState(false);
  const [visNextVisitDate, setVisNextVisitDate] = useState('');

  // Monthly Report State
  const [welfareReportMonth, setWelfareReportMonth] = useState('2026-11');
  const [wrepObservations, setWrepObservations] = useState('');
  const [wrepChallenges, setWrepChallenges] = useState('');
  const [wrepRecommendations, setWrepRecommendations] = useState('');
  const [wrepPlannedNextMonth, setWrepPlannedNextMonth] = useState('');
  const [reportFeedbackBanner, setReportFeedbackBanner] = useState<string | null>(null);

  // ==========================================================================
  // ABSENTEE COMPUTATION (INTEGRATED WITH ATTENDANCE ENGINE)
  // ==========================================================================

  // List of members who clocked in / present for selected service
  const presentMemberIdsForService = useMemo(() => {
    return new Set(
      attendance
        .filter(
          (a) =>
            a.serviceDate === selectedServiceDate &&
            (a.serviceType === selectedServiceType || (!a.serviceType && selectedServiceType.includes('Sunday')))
        )
        .map((a) => a.memberId)
        .filter(Boolean) as string[]
    );
  }, [attendance, selectedServiceDate, selectedServiceType]);

  // Absent members = active members who are NOT in present list
  const absentMembersList = useMemo(() => {
    const absentees = members.filter(
      (m) => m.status === 'Active' && !presentMemberIdsForService.has(m.id)
    );

    return absentees.map((m) => {
      // Find latest follow up record for this member and service
      const latestFollowUp = welfareFollowUps.find(
        (f) =>
          f.memberId === m.id &&
          f.serviceDate === selectedServiceDate &&
          f.serviceType === selectedServiceType
      );

      // Or latest general follow up
      const generalFollowUp = welfareFollowUps.find((f) => f.memberId === m.id);

      return {
        ...m,
        currentFollowUpStatus: latestFollowUp ? latestFollowUp.status : ('Not Contacted' as WelfareFollowUpStatus),
        latestLog: latestFollowUp || generalFollowUp,
      };
    });
  }, [members, presentMemberIdsForService, welfareFollowUps, selectedServiceDate, selectedServiceType]);

  // Filtered absentees for display
  const filteredAbsentees = useMemo(() => {
    return absentMembersList.filter((m) => {
      const matchSearch =
        m.fullName.toLowerCase().includes(absenteeSearch.toLowerCase()) ||
        (m.phone && m.phone.includes(absenteeSearch)) ||
        (m.cell && m.cell.toLowerCase().includes(absenteeSearch.toLowerCase())) ||
        (m.satelliteChurch && m.satelliteChurch.toLowerCase().includes(absenteeSearch.toLowerCase()));

      const matchStatus =
        absenteeStatusFilter === 'all' || m.currentFollowUpStatus === absenteeStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [absentMembersList, absenteeSearch, absenteeStatusFilter]);

  // ==========================================================================
  // KPI METRICS
  // ==========================================================================

  const pendingFollowUpCount = useMemo(() => {
    return absentMembersList.filter(
      (a) => a.currentFollowUpStatus === 'Not Contacted' || a.currentFollowUpStatus === 'Contact Attempted'
    ).length;
  }, [absentMembersList]);

  const activeCasesCount = useMemo(() => {
    return welfareCases.filter((c) => c.status !== 'Resolved').length;
  }, [welfareCases]);

  const upcomingVisitationsCount = useMemo(() => {
    return visitations.filter((v) => v.status === 'Scheduled').length;
  }, [visitations]);

  const membersNeedingVisitationCount = useMemo(() => {
    return (
      absentMembersList.filter((a) => a.currentFollowUpStatus === 'Visitation Recommended').length +
      welfareCases.filter((c) => c.status === 'Visitation Recommended').length
    );
  }, [absentMembersList, welfareCases]);

  // Existing monthly report for Welfare
  const existingWelfareReport = useMemo(() => {
    return monthlyReports.find(
      (r) => r.departmentUnit === 'Welfare' && r.reportingMonth === welfareReportMonth
    );
  }, [monthlyReports, welfareReportMonth]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  // Initiate Call
  const handleInitiateCall = (phone: string, memberName: string) => {
    if (!phone) {
      alert(`No phone number registered for ${memberName}. Please update in Members Folder.`);
      return;
    }
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  // Initiate WhatsApp with friendly pre-filled customizable message
  const handleOpenWhatsApp = (target: (typeof absentMembersList)[0]) => {
    if (!target.phone) {
      alert(`No phone number registered for ${target.fullName}.`);
      return;
    }
    const cleanPhone = target.phone.replace(/[^\d]/g, '');
    const defaultMsg = `Hello ${target.fullName}, we noticed you were not available at church today and wanted to check how you are doing. We hope everything is fine. We would love to hear from you. God bless you.`;
    const encoded = encodeURIComponent(defaultMsg);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  // Open Follow-up Record Modal
  const handleOpenRecordFollowUp = (target: (typeof absentMembersList)[0]) => {
    setActiveFollowUpTarget({
      memberId: target.id,
      memberName: target.fullName,
      memberPhone: target.phone,
      photoUrl: target.photoUrl,
      serviceDate: selectedServiceDate,
      serviceType: selectedServiceType,
      cellOrSatellite: target.cell || target.satelliteChurch,
    });
    setFuContactMethod('Phone Call');
    setFuResponded(true);
    setFuReason('');
    setFuConcerns('');
    setFuAction('Keep in prayer & confirm attendance for upcoming service.');
    setFuStatus('Follow-up Completed');
    setFuNotes('');
    setCustomWhatsAppMsg(
      `Hello ${target.fullName}, we noticed you were not available at church today and wanted to check how you are doing. We hope everything is fine. We would love to hear from you. God bless you.`
    );
    setIsFollowUpModalOpen(true);
  };

  // Submit Follow-up Record
  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFollowUpTarget) return;

    recordWelfareFollowUp({
      memberId: activeFollowUpTarget.memberId,
      memberName: activeFollowUpTarget.memberName,
      memberPhone: activeFollowUpTarget.memberPhone,
      photoUrl: activeFollowUpTarget.photoUrl,
      serviceDate: activeFollowUpTarget.serviceDate,
      serviceType: activeFollowUpTarget.serviceType,
      cellOrSatellite: activeFollowUpTarget.cellOrSatellite,
      contactDate: new Date().toISOString().split('T')[0],
      contactTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contactMethod: fuContactMethod,
      responded: fuResponded,
      reasonForAbsence: fuReason.trim(),
      concernsRaised: fuConcerns.trim(),
      recommendedAction: fuAction.trim(),
      officerName: currentUser?.name || 'Welfare Officer',
      status: fuStatus,
      notes: fuNotes.trim(),
    });

    // If visitation was recommended or scheduled, optionally prompt or link
    if (fuStatus === 'Visitation Recommended') {
      alert(`Follow-up recorded! ${activeFollowUpTarget.memberName} has been marked for Visitation Recommended.`);
    }

    setIsFollowUpModalOpen(false);
  };

  // Add Welfare Team Member
  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find((m) => m.id === selectedMemberIdForTeam);
    if (!targetMember) return;

    // Prevent duplicate team membership
    if (welfareTeam.some((t) => t.memberId === targetMember.id)) {
      alert(`${targetMember.fullName} is already a member of the Welfare Team.`);
      return;
    }

    addWelfareTeamMember({
      memberId: targetMember.id,
      fullName: targetMember.fullName,
      phone: targetMember.phone,
      email: targetMember.email,
      photoUrl: targetMember.photoUrl,
      assignedResponsibilities: teamResponsibilities,
      status: 'Active',
    });

    setIsTeamModalOpen(false);
    setSelectedMemberIdForTeam('');
  };

  // Open Add Welfare Case Modal
  const handleOpenAddCase = () => {
    setEditingCase(null);
    setCaseMemberId('');
    setCaseCategory('Illness');
    setCaseDescription('');
    setCaseUrgency('Medium');
    setCaseAction('Follow-up via Welfare team and schedule care visit.');
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 5);
    setCaseFollowUpDate(nextWeek.toISOString().split('T')[0]);
    setCaseStatus('New');
    setIsCaseModalOpen(true);
  };

  // Save Welfare Case
  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find((m) => m.id === caseMemberId);
    if (!targetMember) {
      alert('Please select a valid member.');
      return;
    }

    if (editingCase) {
      updateWelfareCase(editingCase.id, {
        category: caseCategory,
        description: caseDescription.trim(),
        urgency: caseUrgency,
        recommendedAction: caseAction.trim(),
        followUpDate: caseFollowUpDate,
        status: caseStatus,
      });
    } else {
      addWelfareCase({
        memberId: targetMember.id,
        memberName: targetMember.fullName,
        memberPhone: targetMember.phone,
        photoUrl: targetMember.photoUrl,
        category: caseCategory,
        description: caseDescription.trim(),
        urgency: caseUrgency,
        recommendedAction: caseAction.trim(),
        handlingOfficer: currentUser?.name || 'Sister Chioma Okoro',
        followUpDate: caseFollowUpDate,
        status: caseStatus,
        isEscalatedToHOD: false,
      });
    }

    setIsCaseModalOpen(false);
  };

  // Open Escalate to HOD Modal
  const handleOpenEscalateToHOD = (wcase: WelfareCase) => {
    setTargetCaseForEscalation(wcase);
    setEscalationReportNotes(
      `Escalation regarding ${wcase.memberName} (${wcase.category}). Urgent leadership intervention and pastoral support requested.\n\nRecommended Action: ${wcase.recommendedAction}`
    );
    setIsEscalateModalOpen(true);
  };

  // Confirm Escalation to HOD
  const handleConfirmEscalate = () => {
    if (!targetCaseForEscalation) return;
    escalateWelfareCaseToHOD(
      targetCaseForEscalation.id,
      escalationReportNotes.trim(),
      currentUser?.name || 'Sister Chioma Okoro'
    );
    setIsEscalateModalOpen(false);
    alert(`Case for ${targetCaseForEscalation.memberName} has been formally escalated to the HOD's dashboard.`);
  };

  // Open Schedule Visitation Modal
  const handleOpenScheduleVisitation = (memberId?: string) => {
    setVisMemberId(memberId || '');
    const target = members.find((m) => m.id === memberId);
    setVisAddress(target ? `${target.residentialArea}, Asaba` : '');
    setVisReason('Care check-in and recovery prayers.');
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 2);
    setVisDate(tmrw.toISOString().split('T')[0]);
    setVisTime('04:30 PM');
    setVisInstructions('Bring the department prayer guide and fruit care package.');
    setVisAssignedTeamIds(welfareTeam.slice(0, 2).map((t) => t.id));
    setVisPinDays(3);
    setIsVisitationModalOpen(true);
  };

  // Save Scheduled Visitation
  const handleSaveVisitation = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find((m) => m.id === visMemberId);
    if (!targetMember) {
      alert('Please select a member for visitation.');
      return;
    }

    const assignedNames = welfareTeam
      .filter((t) => visAssignedTeamIds.includes(t.id))
      .map((t) => t.fullName);

    const pinExp = new Date();
    pinExp.setDate(pinExp.getDate() + visPinDays);

    addVisitationSchedule({
      memberId: targetMember.id,
      memberName: targetMember.fullName,
      memberAddress: visAddress.trim() || targetMember.residentialArea,
      memberPhone: targetMember.phone,
      photoUrl: targetMember.photoUrl,
      reason: visReason.trim(),
      assignedTeamMemberIds: visAssignedTeamIds,
      assignedTeamMemberNames: assignedNames,
      visitDate: visDate,
      visitTime: visTime,
      instructions: visInstructions.trim(),
      isPinned: true,
      pinnedExpiryDays: visPinDays,
      pinnedExpiryDate: pinExp.toISOString().split('T')[0],
      followUpVisitNeeded: false,
      status: 'Scheduled',
    });

    setIsVisitationModalOpen(false);
  };

  // Complete Visitation
  const handleCompleteVisitationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVisitation) return;

    completeVisitation(
      targetVisitation.id,
      visOutcomeNotes.trim(),
      currentUser?.name || 'Welfare Officer',
      visFollowUpNeeded ? visNextVisitDate : undefined
    );

    setIsCompleteVisModalOpen(false);
  };

  // Save / Submit Welfare Monthly Report
  const handleSaveWelfareMonthlyReport = (submit: boolean = false) => {
    const absenteesTotal = absentMembersList.length;
    const contactedTotal = welfareFollowUps.filter((f) => f.status === 'Follow-up Completed').length;
    const respondedTotal = welfareFollowUps.filter((f) => f.responded).length;
    const visitationsTotal = visitations.length;
    const visitationsDone = visitations.filter((v) => v.status === 'Completed').length;
    const illnessCount = welfareCases.filter((c) => c.category === 'Illness').length;
    const bereavementCount = welfareCases.filter((c) => c.category === 'Bereavement').length;
    const assistanceCount = welfareCases.filter((c) => c.category === 'Financial Assistance Request').length;
    const escalatedCount = welfareCases.filter((c) => c.isEscalatedToHOD).length;
    const resolvedCount = welfareCases.filter((c) => c.status === 'Resolved').length;

    saveMonthlyReport({
      ...(existingWelfareReport?.id ? { id: existingWelfareReport.id } : {}),
      departmentUnit: 'Welfare',
      reportingMonth: welfareReportMonth,
      submittedBy: currentUser?.name || 'Sister Chioma Okoro',
      submittedByRole: 'Welfare Coordinator',
      submissionDate: new Date().toISOString().split('T')[0],
      status: submit ? 'Submitted' : 'Draft',
      activitiesCarriedOut: `Post-service absentee follow-up across Sunday and Midweek services, home/hospital visitations, welfare support case review, and HOD escalations for ${welfareReportMonth}.`,
      workCompleted: `Conducted follow-ups on absent members, completed ${visitationsDone} physical visitations, and managed ${welfareCases.length} active welfare cases.`,
      importantStatistics: {
        'Absentees Identified': absenteesTotal,
        'Successful Contacts': contactedTotal,
        'Members Responded': respondedTotal,
        'Total Visitations Scheduled': visitationsTotal,
        'Visitations Completed': visitationsDone,
        'Illness Cases': illnessCount,
        'Bereavement Support Cases': bereavementCount,
        'Assistance Requests': assistanceCount,
        'Cases Escalated to HOD': escalatedCount,
        'Cases Resolved': resolvedCount,
        'Welfare Team Strength': welfareTeam.length,
      },
      challengesEncountered: wrepChallenges.trim() || 'Logistics reimbursement for out-of-town hospital visits in satellite zones.',
      complaintsOrIssues: 'Occasional outdated contact phone numbers in member profiles.',
      recommendations: wrepRecommendations.trim() || 'Coordinate with cell leaders for bi-weekly member phone number revalidation.',
      outstandingResponsibilities: 'Follow up on Sister Chisom recovery and Sister Amaka bereavement support.',
      activitiesPlannedNextMonth: wrepPlannedNextMonth.trim() || 'Welfare month outreach and preparation of celebratory hampers for new parents.',
    });

    setReportFeedbackBanner(
      submit
        ? `✓ Welfare Monthly Report for ${welfareReportMonth} submitted to HOD successfully!`
        : `✓ Welfare Monthly Report for ${welfareReportMonth} saved as Draft!`
    );
    setTimeout(() => setReportFeedbackBanner(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ==================================================================== */}
      {/* WELFARE HEADER BANNER (WARM CARE BRANDING) */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#2A0845] via-[#6441A5] to-[#B83B5E] text-white shadow-xl border border-pink-500/30 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="relative z-10">
          <button
            onClick={onReturnToGeneral}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-pink-200 hover:text-white text-xs font-bold mb-3 transition-colors cursor-pointer border border-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Return to General Dashboard</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-pink-300" />
              <span>Welfare & Member Care Department</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-pink-400 text-slate-950 glow-amber">
              Dedicated Ministry
            </span>
          </div>
          <p className="text-xs text-pink-100 mt-1 max-w-2xl leading-relaxed">
            Member care, absentee follow-up via Call/WhatsApp, home & hospital visitation scheduling, welfare support case management, and compassionate member retention.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={() => setActiveTab('absentees')}
            className="btn-compact bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md h-10 px-4 cursor-pointer flex items-center gap-1.5"
          >
            <UserX className="w-4 h-4 text-slate-950" />
            <span>Follow-Up Absentees</span>
          </button>
          <button
            onClick={handleOpenAddCase}
            className="btn-compact bg-pink-500 hover:bg-pink-400 text-white font-bold shadow-md h-10 px-4 cursor-pointer flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 text-white" />
            <span>Log Care Case</span>
          </button>
          <button
            onClick={() => handleOpenScheduleVisitation()}
            className="btn-compact bg-white/15 hover:bg-white/25 text-white font-semibold border border-white/25 h-10 px-4 cursor-pointer flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-pink-300" />
            <span>Schedule Visit</span>
          </button>
          {onOpenReportToHRD && (
            <button
              onClick={onOpenReportToHRD}
              className="btn-compact bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-md border border-amber-300 h-10 px-4 cursor-pointer flex items-center gap-1.5"
              title="Escalate critical welfare emergency or confidential report directly to HOD"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>REPORT TO HOD</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ACCESS & CONFIDENTIALITY SAFEGUARD */}
      {/* ==================================================================== */}
      <div className="p-3.5 rounded-xl bg-pink-950/30 border border-pink-800/40 text-xs flex items-center justify-between gap-3 text-pink-200">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-pink-400 shrink-0" />
          <span>
            <strong className="text-white">Confidentiality & Care Boundary:</strong> Health conditions, family bereavements, and assistance requests are protected records. Financial assistance is escalated to HOD for pastoral approval; actual fund disbursement remains strictly governed by the Finance Desk.
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300 px-2 py-0.5 rounded-md bg-pink-950/60 border border-pink-700 shrink-0">
          Care Protocol
        </span>
      </div>

      {/* ==================================================================== */}
      {/* SUB-TABS NAVIGATION */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Welfare Dashboard', icon: HeartHandshake, badge: null },
          { id: 'absentees', label: 'Absentee Follow-Up', icon: Phone, badge: pendingFollowUpCount },
          { id: 'team', label: 'Welfare Team Members', icon: Users, badge: welfareTeam.length },
          { id: 'cases', label: 'Care Cases & HOD Escalation', icon: Heart, badge: activeCasesCount },
          { id: 'visitations', label: 'Home & Hospital Visitations', icon: MapPin, badge: upcomingVisitationsCount },
          { id: 'support', label: 'Assistance Tracking', icon: Sparkles, badge: null },
          { id: 'monthly-report', label: 'Welfare Monthly Report', icon: FileCheck, badge: 'New' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WelfareTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white text-pink-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: WELFARE DASHBOARD OVERVIEW */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('team')}
              className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-pink-500 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Welfare Team</span>
                <Users className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-mono">{welfareTeam.length}</p>
              <p className="text-[11px] text-pink-600 dark:text-pink-400 mt-1 font-medium">Assigned Care Ministers</p>
            </div>

            <div
              onClick={() => setActiveTab('absentees')}
              className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Absent From Latest Service</span>
                <UserX className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5 font-mono">{absentMembersList.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">{pendingFollowUpCount} Pending Follow-Ups</p>
            </div>

            <div
              onClick={() => setActiveTab('cases')}
              className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-500 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Active Care Cases</span>
                <Heart className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1.5 font-mono">{activeCasesCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">Illness, Bereavement & Care</p>
            </div>

            <div
              onClick={() => setActiveTab('visitations')}
              className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-500 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Scheduled Visitations</span>
                <MapPin className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5 font-mono">{upcomingVisitationsCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">{membersNeedingVisitationCount} Recommended</p>
            </div>
          </div>

          {/* Two-Column Grid: Urgent Absentees & Active Cases */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Urgent Absentee Check-Ins */}
            <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                  <Phone className="w-4 h-4 text-amber-500" />
                  <span>Latest Absentee Check-Ins ({selectedServiceType})</span>
                </div>
                <button
                  onClick={() => setActiveTab('absentees')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  View all ({absentMembersList.length}) →
                </button>
              </div>

              <div className="space-y-3">
                {absentMembersList.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={m.fullName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{m.fullName}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{m.phone} • {m.cell || 'Main Sanctuary'}</p>
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase mt-1 ${
                            m.currentFollowUpStatus === 'Follow-up Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : m.currentFollowUpStatus === 'Visitation Recommended'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {m.currentFollowUpStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleInitiateCall(m.phone, m.fullName)}
                        className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer shadow-xs"
                        title="Voice Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenWhatsApp(m)}
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs"
                        title="WhatsApp Check-In"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenRecordFollowUp(m)}
                        className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs text-[11px] font-bold"
                        title="Record Follow-Up"
                      >
                        Log
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Care Cases & Escalation Tracker */}
            <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span>Active Welfare Cases & Pastoral Referrals</span>
                </div>
                <button
                  onClick={() => setActiveTab('cases')}
                  className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline cursor-pointer"
                >
                  Manage cases →
                </button>
              </div>

              <div className="space-y-3">
                {welfareCases.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            c.urgency === 'High' || c.urgency === 'Emergency'
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {c.urgency} Urgency
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{c.memberName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{c.category}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                      <span className="text-slate-500">
                        Status: <strong className="text-slate-700 dark:text-slate-200">{c.status}</strong>
                      </span>
                      {c.isEscalatedToHOD ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Escalated to HOD
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenEscalateToHOD(c)}
                          className="text-rose-500 hover:text-rose-400 font-bold cursor-pointer"
                        >
                          Escalate to HOD →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ABSENTEE FOLLOW-UP MANAGEMENT */}
      {/* ==================================================================== */}
      {activeTab === 'absentees' && (
        <div className="space-y-5">
          {/* Service Selector & Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Service Attendance Absentee Engine</h3>
                <p className="text-xs text-slate-500">
                  Select a church service date to review members absent from the live attendance register and initiate follow-ups.
                </p>
              </div>

              {/* Service Date & Type Pickers */}
              <div className="flex flex-wrap items-center gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Service Date</label>
                  <input
                    type="date"
                    value={selectedServiceDate}
                    onChange={(e) => setSelectedServiceDate(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Service Type</label>
                  <select
                    value={selectedServiceType}
                    onChange={(e) => setSelectedServiceType(e.target.value as ServiceType)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Sunday 1st Service">Sunday 1st Service</option>
                    <option value="Sunday 2nd Service">Sunday 2nd Service</option>
                    <option value="Tuesday Word & Communion">Tuesday Word & Communion</option>
                    <option value="Special Meeting">Special Meeting</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search & Status Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search absentee by name, phone, cell fellowship, or satellite church..."
                  value={absenteeSearch}
                  onChange={(e) => setAbsenteeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <select
                  value={absenteeStatusFilter}
                  onChange={(e) => setAbsenteeStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="all">All Follow-Up Statuses</option>
                  <option value="Not Contacted">Not Contacted</option>
                  <option value="Contact Attempted">Contact Attempted</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Awaiting Response">Awaiting Response</option>
                  <option value="Reason Received">Reason Received</option>
                  <option value="Visitation Recommended">Visitation Recommended</option>
                  <option value="Follow-up Completed">Follow-up Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Absentee Member Cards List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing {filteredAbsentees.length} absent members for {selectedServiceDate} ({selectedServiceType})</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{pendingFollowUpCount} Pending Outreach</span>
            </div>

            {filteredAbsentees.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <img
                    src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={m.fullName}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-slate-200 dark:border-slate-700 shadow-xs"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.fullName}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          m.currentFollowUpStatus === 'Follow-up Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : m.currentFollowUpStatus === 'Visitation Recommended'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : m.currentFollowUpStatus === 'Awaiting Response'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {m.currentFollowUpStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Phone: <strong className="text-slate-700 dark:text-slate-300">{m.phone}</strong></span>
                      {m.cell && <span>Cell: {m.cell}</span>}
                      {m.satelliteChurch && <span>Satellite: {m.satelliteChurch}</span>}
                    </p>

                    {m.latestLog && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-0.5">
                        Latest check-in: "{m.latestLog.reasonForAbsence || m.latestLog.recommendedAction}" — by {m.latestLog.officerName} ({formatDate(m.latestLog.contactDate)})
                      </p>
                    )}
                  </div>
                </div>

                {/* Follow-up Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleInitiateCall(m.phone, m.fullName)}
                    className="btn-compact bg-emerald-500 hover:bg-emerald-400 text-white font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>
                  <button
                    onClick={() => handleOpenWhatsApp(m)}
                    className="btn-compact bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleOpenRecordFollowUp(m)}
                    className="btn-compact bg-blue-600 hover:bg-blue-500 text-white font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Record Follow-Up</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredAbsentees.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800">
                No absent members found matching the selected service or search criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: WELFARE TEAM MEMBERS */}
      {/* ==================================================================== */}
      {activeTab === 'team' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Welfare Team Roster & Responsibilities</h3>
              <p className="text-xs text-slate-500">
                Active ministers assigned to absentee phone calls, WhatsApp check-ins, and hospital/home visitations.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedMemberIdForTeam('');
                setTeamResponsibilities(['Sunday Absentees']);
                setIsTeamModalOpen(true);
              }}
              className="btn-compact bg-pink-600 hover:bg-pink-500 text-white font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Team Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {welfareTeam.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={t.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={t.fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-pink-400 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.fullName}</h4>
                      <p className="text-xs text-slate-500">{t.phone}</p>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mt-1">
                        {t.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Responsibilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {t.assignedResponsibilities.map((resp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/40"
                        >
                          {resp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleInitiateCall(t.phone, t.fullName)}
                    className="text-emerald-600 hover:text-emerald-500 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Contact Officer</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${t.fullName} from Welfare Team?`)) removeWelfareTeamMember(t.id);
                    }}
                    className="text-rose-500 hover:text-rose-400 font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: WELFARE CASE MANAGEMENT & HOD ESCALATION */}
      {/* ==================================================================== */}
      {activeTab === 'cases' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Welfare Case Management</h3>
              <p className="text-xs text-slate-500">
                Member illness, bereavement, assistance requests, and urgent escalations to the HOD.
              </p>
            </div>
            <button
              onClick={handleOpenAddCase}
              className="btn-compact bg-pink-600 hover:bg-pink-500 text-white font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Care Case</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {welfareCases.map((wcase) => (
              <div
                key={wcase.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={wcase.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={wcase.memberName}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{wcase.memberName}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            wcase.urgency === 'High' || wcase.urgency === 'Emergency'
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {wcase.urgency} Urgency
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Category: <strong>{wcase.category}</strong> • Follow-Up Due: {formatDate(wcase.followUpDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                        wcase.status === 'Resolved'
                          ? 'bg-emerald-500 text-white'
                          : wcase.status === 'Referred to HOD'
                          ? 'bg-purple-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {wcase.status}
                    </span>
                    {!wcase.isEscalatedToHOD && (
                      <button
                        onClick={() => handleOpenEscalateToHOD(wcase)}
                        className="btn-compact bg-rose-600 hover:bg-rose-500 text-white font-bold h-8 px-3 text-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Escalate to HOD</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#07132B] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {wcase.description}
                </p>

                {wcase.escalationNotes && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>HOD Escalation Record</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{wcase.escalationNotes}</p>
                    {wcase.hodNotes && (
                      <p className="text-emerald-700 dark:text-emerald-300 font-semibold pt-1 border-t border-purple-200 dark:border-purple-900/50">
                        HOD Feedback: "{wcase.hodNotes}"
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                  <span className="text-slate-500">
                    Officer in Charge: <strong>{wcase.handlingOfficer}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenScheduleVisitation(wcase.memberId)}
                      className="text-pink-600 dark:text-pink-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Schedule Visit</span>
                    </button>
                    <button
                      onClick={() =>
                        updateWelfareCase(wcase.id, {
                          status: wcase.status === 'Resolved' ? 'Under Review' : 'Resolved',
                          resolutionNotes:
                            wcase.status === 'Resolved'
                              ? undefined
                              : `Case reviewed and closed by ${currentUser?.name || 'Welfare Officer'}`,
                        })
                      }
                      className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 font-bold cursor-pointer"
                    >
                      {wcase.status === 'Resolved' ? 'Reopen Case' : 'Mark Resolved'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: HOME & HOSPITAL VISITATIONS */}
      {/* ==================================================================== */}
      {activeTab === 'visitations' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Visitation Planning & Scheduling</h3>
              <p className="text-xs text-slate-500">
                Organize home, hospital, or congratulatory visits with assigned team delegates and pinned reminders.
              </p>
            </div>
            <button
              onClick={() => handleOpenScheduleVisitation()}
              className="btn-compact bg-pink-600 hover:bg-pink-500 text-white font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Schedule New Visit</span>
            </button>
          </div>

          <div className="space-y-3">
            {visitations.map((vis) => (
              <div
                key={vis.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={vis.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={vis.memberName}
                      className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{vis.memberName}</h4>
                        {vis.isPinned && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Pinned ({vis.pinnedExpiryDays}d)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Date: <strong className="text-slate-800 dark:text-slate-200">{formatDate(vis.visitDate)} at {vis.visitTime}</strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase self-start sm:self-center ${
                      vis.status === 'Completed'
                        ? 'bg-emerald-500 text-white'
                        : vis.status === 'Overdue'
                        ? 'bg-rose-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {vis.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-[#07132B] p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Address / Location:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{vis.memberAddress}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Welfare Ministers:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{vis.assignedTeamMemberNames.join(', ')}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Purpose:</strong> {vis.reason} {vis.instructions && `• Instructions: ${vis.instructions}`}
                </p>

                {vis.outcome && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300">
                    <strong>Visit Outcome:</strong> {vis.outcome}
                  </div>
                )}

                {vis.status === 'Scheduled' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <button
                      onClick={() => {
                        setTargetVisitation(vis);
                        setVisOutcomeNotes('');
                        setVisFollowUpNeeded(false);
                        setVisNextVisitDate('');
                        setIsCompleteVisModalOpen(true);
                      }}
                      className="btn-compact bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-8 px-3 text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Record Visit Outcome</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: WELFARE SUPPORT & ASSISTANCE TRACKING */}
      {/* ==================================================================== */}
      {activeTab === 'support' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Welfare Support & Assistance Coordination</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track compassionate support requests for bereaved members, medical emergencies, and family welfare needs.
              All actual disbursements are processed exclusively by the Finance Desk upon HOD authorization.
            </p>
          </div>

          <div className="space-y-3">
            {welfareCases
              .filter((c) => c.supportAssistanceDetails || c.category === 'Financial Assistance Request' || c.category === 'Bereavement')
              .map((scase) => (
                <div
                  key={scase.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{scase.memberName}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-300">
                        {scase.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                      {scase.description}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Recommendation: <strong>{scase.recommendedAction}</strong>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                        scase.status === 'Resolved'
                          ? 'bg-emerald-500 text-white'
                          : scase.isEscalatedToHOD
                          ? 'bg-purple-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {scase.status === 'Referred to HOD' ? 'Awaiting Leadership Approval' : scase.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Logged on {formatDate(scase.createdAt)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: WELFARE MONTHLY REPORT */}
      {/* ==================================================================== */}
      {activeTab === 'monthly-report' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Welfare Department Monthly Operating Report</h3>
              <p className="text-xs text-slate-500">
                At the end of each month, generate a consolidated member care report with real statistics, observations, and submit to HOD.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">Reporting Month:</label>
              <select
                value={welfareReportMonth}
                onChange={(e) => setWelfareReportMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="2026-11">November 2026</option>
                <option value="2026-10">October 2026</option>
              </select>
            </div>
          </div>

          {reportFeedbackBanner && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              {reportFeedbackBanner}
            </div>
          )}

          {/* Real-time Computed Welfare Statistics Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verified Monthly Statistics ({welfareReportMonth})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#07132B]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Absentees Handled</span>
                <strong className="text-lg font-black text-slate-900 dark:text-white font-mono">{absentMembersList.length}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#07132B]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Successful Contacts</span>
                <strong className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {welfareFollowUps.filter((f) => f.status === 'Follow-up Completed').length}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#07132B]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Visitations Done</span>
                <strong className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                  {visitations.filter((v) => v.status === 'Completed').length}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#07132B]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Escalated to HOD</span>
                <strong className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                  {welfareCases.filter((c) => c.isEscalatedToHOD).length}
                </strong>
              </div>
            </div>
          </div>

          {/* Form Fields for Written Observations */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Written Observations & Care Highlights
              </label>
              <textarea
                rows={3}
                value={wrepObservations}
                onChange={(e) => setWrepObservations(e.target.value)}
                placeholder="Highlight notable testimonies, member recoveries, response rates..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Key Challenges & Bottlenecks
                </label>
                <textarea
                  rows={2}
                  value={wrepChallenges}
                  onChange={(e) => setWrepChallenges(e.target.value)}
                  placeholder="e.g. Unreachable phone numbers, logistics for remote visitation..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Strategic Recommendations for Department
                </label>
                <textarea
                  rows={2}
                  value={wrepRecommendations}
                  onChange={(e) => setWrepRecommendations(e.target.value)}
                  placeholder="e.g. Cell-level quarterly membership phone revalidation..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Activities Planned for Next Month
              </label>
              <textarea
                rows={2}
                value={wrepPlannedNextMonth}
                onChange={(e) => setWrepPlannedNextMonth(e.target.value)}
                placeholder="Next month's welfare visits, member care packages..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveWelfareMonthlyReport(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-900 dark:text-white font-bold text-xs cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveWelfareMonthlyReport(true)}
                  className="btn-glow-blue px-4 py-2 rounded-xl font-bold text-white text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to HOD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: RECORD ABSENTEE FOLLOW-UP */}
      {/* ==================================================================== */}
      {isFollowUpModalOpen && activeFollowUpTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-pink-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Record Follow-Up: {activeFollowUpTarget.memberName}
                </h3>
              </div>
              <button
                onClick={() => setIsFollowUpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#07132B] flex items-center gap-3 text-xs">
              <img
                src={activeFollowUpTarget.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={activeFollowUpTarget.memberName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{activeFollowUpTarget.memberName}</p>
                <p className="text-[11px] text-slate-500">
                  {activeFollowUpTarget.memberPhone} • Absent on {formatDate(activeFollowUpTarget.serviceDate)} ({activeFollowUpTarget.serviceType})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveFollowUp} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Method</label>
                  <select
                    value={fuContactMethod}
                    onChange={(e) => setFuContactMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="Physical Visit">Physical Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Did Member Respond?</label>
                  <select
                    value={fuResponded ? 'yes' : 'no'}
                    onChange={(e) => setFuResponded(e.target.value === 'yes')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="yes">Yes — Spoke or Replied</option>
                    <option value="no">No — Ringing / Awaiting Response</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Absence (If voluntarily shared)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Travelled out of state, recovering from mild fever, family event..."
                  value={fuReason}
                  onChange={(e) => setFuReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concerns Raised (If any)</label>
                <input
                  type="text"
                  placeholder="e.g. Requested prayer for exams, health observation..."
                  value={fuConcerns}
                  onChange={(e) => setFuConcerns(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Recommended Next Action</label>
                  <input
                    type="text"
                    required
                    value={fuAction}
                    onChange={(e) => setFuAction(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Updated Follow-Up Status</label>
                  <select
                    value={fuStatus}
                    onChange={(e) => setFuStatus(e.target.value as WelfareFollowUpStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Follow-up Completed">Follow-up Completed</option>
                    <option value="Reason Received">Reason Received</option>
                    <option value="Visitation Recommended">Visitation Recommended</option>
                    <option value="Awaiting Response">Awaiting Response</option>
                    <option value="Contact Attempted">Contact Attempted</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow-blue px-4 py-2 rounded-xl font-bold text-white cursor-pointer shadow-md"
                >
                  Save Follow-Up Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD WELFARE TEAM MEMBER */}
      {/* ==================================================================== */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Add Welfare Team Member</h3>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTeamMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Member from Folder *
                </label>
                <select
                  required
                  value={selectedMemberIdForTeam}
                  onChange={(e) => setSelectedMemberIdForTeam(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Department Member --</option>
                  {members
                    .filter((m) => m.status === 'Active')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.departmentRole})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Welfare Responsibilities
                </label>
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  {[
                    'Sunday Absentee Follow-Up',
                    'Midweek Communion Check-In',
                    'WhatsApp Care Communications',
                    'Physical Home & Hospital Visitation',
                    'Bereavement & Family Care',
                    'First Timers Retention Outreach',
                  ].map((role) => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teamResponsibilities.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTeamResponsibilities((prev) => [...prev, role]);
                          } else {
                            setTeamResponsibilities((prev) => prev.filter((r) => r !== role));
                          }
                        }}
                        className="w-3.5 h-3.5 rounded text-pink-600 cursor-pointer"
                      />
                      <span className="text-slate-700 dark:text-slate-300">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold cursor-pointer"
                >
                  Add to Welfare Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: LOG WELFARE CARE CASE */}
      {/* ==================================================================== */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingCase ? 'Edit Welfare Case' : 'Log New Member Welfare Case'}
              </h3>
              <button
                onClick={() => setIsCaseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCase} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Celebrant / Member *</label>
                <select
                  required
                  value={caseMemberId}
                  onChange={(e) => setCaseMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Case Category *</label>
                  <select
                    value={caseCategory}
                    onChange={(e) => setCaseCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Illness">Illness / Hospitalization</option>
                    <option value="Bereavement">Bereavement Support</option>
                    <option value="Financial Assistance Request">Financial Assistance Request</option>
                    <option value="Family Emergency">Family Emergency</option>
                    <option value="Prolonged Absence">Prolonged Absence</option>
                    <option value="Personal Welfare Concern">Personal Welfare Concern</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Level of Urgency *</label>
                  <select
                    value={caseUrgency}
                    onChange={(e) => setCaseUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description of Welfare Concern *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record essential details respectfully (e.g. family loss, diagnosis recovery, assistance need)..."
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Recommended Action</label>
                  <input
                    type="text"
                    required
                    value={caseAction}
                    onChange={(e) => setCaseAction(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Follow-Up Date</label>
                  <input
                    type="date"
                    required
                    value={caseFollowUpDate}
                    onChange={(e) => setCaseFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold cursor-pointer"
                >
                  Save Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ESCALATE TO HOD */}
      {/* ==================================================================== */}
      {isEscalateModalOpen && targetCaseForEscalation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Escalate Case to HOD</h3>
              </div>
              <button
                onClick={() => setIsEscalateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 space-y-1">
              <p className="font-bold">
                Member: {targetCaseForEscalation.memberName} ({targetCaseForEscalation.category})
              </p>
              <p className="text-[11px]">{targetCaseForEscalation.description}</p>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Formal Escalation Report & Recommendations for HOD *
              </label>
              <textarea
                rows={4}
                required
                value={escalationReportNotes}
                onChange={(e) => setEscalationReportNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEscalateModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEscalate}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Send to HOD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: SCHEDULE VISITATION */}
      {/* ==================================================================== */}
      {isVisitationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Schedule Care Visitation</h3>
              <button
                onClick={() => setIsVisitationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVisitation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Member to Visit *
                </label>
                <select
                  required
                  value={visMemberId}
                  onChange={(e) => {
                    setVisMemberId(e.target.value);
                    const target = members.find((m) => m.id === e.target.value);
                    if (target) setVisAddress(`${target.residentialArea}, Asaba`);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Address / Hospital *
                </label>
                <input
                  type="text"
                  required
                  value={visAddress}
                  onChange={(e) => setVisAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Visit Date *</label>
                  <input
                    type="date"
                    required
                    value={visDate}
                    onChange={(e) => setVisDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Visit Time *</label>
                  <input
                    type="text"
                    required
                    value={visTime}
                    onChange={(e) => setVisTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Physical Visit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Recovery prayers, baby celebration visit, condolence prayer..."
                  value={visReason}
                  onChange={(e) => setVisReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Welfare Delegates (Select 1 or more) *
                </label>
                <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 max-h-32 overflow-y-auto">
                  {welfareTeam.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={visAssignedTeamIds.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisAssignedTeamIds((prev) => [...prev, t.id]);
                          } else {
                            setVisAssignedTeamIds((prev) => prev.filter((id) => id !== t.id));
                          }
                        }}
                        className="w-3.5 h-3.5 rounded text-pink-600 cursor-pointer"
                      />
                      <span>{t.fullName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pinned Reminder Duration (Days visible on dashboard)
                </label>
                <select
                  value={visPinDays}
                  onChange={(e) => setVisPinDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value={1}>Pin for 1 Day</option>
                  <option value={2}>Pin for 2 Days</option>
                  <option value={3}>Pin for 3 Days (Recommended)</option>
                  <option value={7}>Pin for 1 Week</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVisitationModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold cursor-pointer"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: COMPLETE VISITATION RECORD */}
      {/* ==================================================================== */}
      {isCompleteVisModalOpen && targetVisitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Record Visit Outcome</h3>
              <button
                onClick={() => setIsCompleteVisModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteVisitationSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="font-bold text-slate-900 dark:text-white">{targetVisitation.memberName}</p>
                <p className="text-[11px] text-slate-500">
                  Visited on {formatDate(targetVisitation.visitDate)} by {targetVisitation.assignedTeamMemberNames.join(', ')}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Visitation Outcome & Remarks *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe member response, state of health/comfort, fellowship held..."
                  value={visOutcomeNotes}
                  onChange={(e) => setVisOutcomeNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visFollowUpNeeded}
                    onChange={(e) => setVisFollowUpNeeded(e.target.checked)}
                    className="w-4 h-4 rounded text-pink-600 cursor-pointer"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Schedule a Follow-Up Visit?</span>
                </label>

                {visFollowUpNeeded && (
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Next Visit Date</label>
                    <input
                      type="date"
                      required
                      value={visNextVisitDate}
                      onChange={(e) => setVisNextVisitDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCompleteVisModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow-blue px-4 py-2 rounded-xl font-bold text-white cursor-pointer"
                >
                  Mark Visit Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

