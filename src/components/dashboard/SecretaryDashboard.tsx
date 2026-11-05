import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateUtils';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  Shield,
  ArrowLeft,
  Users,
  FileText,
  ClipboardList,
  CalendarCheck,
  Megaphone,
  MapPin,
  PackageSearch,
  BookOpen,
  CheckCircle2,
  Clock,
  PlusCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Printer,
  Calendar,
  Pin,
  Cake,
  Bell,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Lock,
  Send,
  Download,
  AlertTriangle,
  HeartHandshake,
  ShoppingBag,
  Shirt,
  Filter,
  Check,
  X,
  FileCheck,
} from 'lucide-react';
import {
  DepartmentEvent,
  ChurchProgramme,
  DepartmentReminder,
  ProgrammeType,
  ReminderCategory,
  Announcement,
  DepartmentMonthlyReport,
} from '../../types/models';

interface SecretaryDashboardProps {
  onReturnToGeneral: () => void;
  onNavigate: (tab: string) => void;
  onOpenReportToHRD?: () => void;
}

type SecretaryTab =
  | 'overview'
  | 'events'
  | 'announcements'
  | 'programmes'
  | 'birthdays'
  | 'reminders'
  | 'monthly-report';

export const SecretaryDashboard: React.FC<SecretaryDashboardProps> = ({
  onReturnToGeneral,
  onNavigate,
  onOpenReportToHRD,
}) => {
  const { currentUser, canViewFinances, canManageBookstand, canManageUniforms } = useAuth();
  const {
    members,
    reports,
    tableDocuments,
    rosters,
    dressCodes,
    meetings,
    lostItems,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    departmentEvents,
    addDepartmentEvent,
    updateDepartmentEvent,
    deleteDepartmentEvent,
    churchProgrammes,
    addChurchProgramme,
    updateChurchProgramme,
    deleteChurchProgramme,
    departmentReminders,
    addDepartmentReminder,
    updateDepartmentReminder,
    toggleReminderCompletion,
    deleteDepartmentReminder,
    departmentComplaints,
    monthlyReports,
    saveMonthlyReport,
    submitMonthlyReport,
    attendance,
    saveBirthdayCelebration,
  } = useData();

  // Active view tab
  const [activeTab, setActiveTab] = useState<SecretaryTab>('overview');

  // Filter states
  const [eventFilter, setEventFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [announcementFilter, setAnnouncementFilter] = useState<'all' | 'active' | 'urgent'>('all');
  const [programmeFilter, setProgrammeFilter] = useState<string>('all');

  // ==========================================================================
  // MODAL STATES
  // ==========================================================================

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DepartmentEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState<DepartmentEvent['category']>('Training & Workshop');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventInstructions, setEventInstructions] = useState('');
  const [eventFlyerUrl, setEventFlyerUrl] = useState('');
  const [eventAudience, setEventAudience] = useState<DepartmentEvent['targetAudience']>('All Department Members');
  const [eventStatus, setEventStatus] = useState<DepartmentEvent['status']>('Published');
  const [eventIsPinned, setEventIsPinned] = useState(false);
  const [showEventPreview, setShowEventPreview] = useState(false);

  // Announcement modal state
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState<Announcement['category']>('General Announcement');
  const [annDescription, setAnnDescription] = useState('');
  const [annIsUrgent, setAnnIsUrgent] = useState(false);
  const [annStatus, setAnnStatus] = useState<Announcement['status']>('Published');
  const [annVenue, setAnnVenue] = useState('');
  const [annEventDate, setAnnEventDate] = useState('');
  const [annCoverPhoto, setAnnCoverPhoto] = useState('');

  // Church Programme modal state
  const [isProgrammeModalOpen, setIsProgrammeModalOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState<ChurchProgramme | null>(null);
  const [progTitle, setProgTitle] = useState('');
  const [progType, setProgType] = useState<ProgrammeType>('Sunday 1st Service');
  const [progDate, setProgDate] = useState('');
  const [progTime, setProgTime] = useState('');
  const [progVenue, setProgVenue] = useState('Main Sanctuary, Dominion City Asaba');
  const [progDescription, setProgDescription] = useState('');
  const [progAttachmentName, setProgAttachmentName] = useState('');
  const [progIsPublished, setProgIsPublished] = useState(true);

  // Reminder modal state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<DepartmentReminder | null>(null);
  const [remTitle, setRemTitle] = useState('');
  const [remCategory, setRemCategory] = useState<ReminderCategory>('Departmental Meeting');
  const [remDescription, setRemDescription] = useState('');
  const [remDueDate, setRemDueDate] = useState('');
  const [remDueTime, setRemDueTime] = useState('06:00 PM');
  const [remAssignedTo, setRemAssignedTo] = useState('All Department Members');
  const [remExpiryDate, setRemExpiryDate] = useState('');
  const [remIsPinned, setRemIsPinned] = useState(true);

  // Birthday Greeting modal state
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [birthdayCelebrant, setBirthdayCelebrant] = useState<{ id: string; name: string; photoUrl: string; date: string } | null>(null);
  const [birthdayGreeting, setBirthdayGreeting] = useState('');
  const [birthdayPrayers, setBirthdayPrayers] = useState<string>('');

  // Monthly Report state
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [reportActivities, setReportActivities] = useState('');
  const [reportWorkCompleted, setReportWorkCompleted] = useState('');
  const [reportChallenges, setReportChallenges] = useState('');
  const [reportComplaints, setReportComplaints] = useState('');
  const [reportRecommendations, setReportRecommendations] = useState('');
  const [reportOutstanding, setReportOutstanding] = useState('');
  const [reportNextMonth, setReportNextMonth] = useState('');
  const [reportSavedBanner, setReportSavedBanner] = useState<string | null>(null);

  // ==========================================================================
  // COMPUTED KPI METRICS & DATA
  // ==========================================================================

  const pendingLostItems = useMemo(() => lostItems.filter((i) => i.status === 'Unclaimed'), [lostItems]);
  const upcomingMeetings = useMemo(() => meetings.filter((m) => m.status === 'Scheduled'), [meetings]);
  const activeAnnouncements = useMemo(() => announcements.filter((a) => a.status === 'Published'), [announcements]);
  const activeEvents = useMemo(() => departmentEvents.filter((e) => e.status === 'Published'), [departmentEvents]);
  const activeProgrammes = useMemo(() => churchProgrammes.filter((p) => p.isPublished), [churchProgrammes]);
  const pinnedReminders = useMemo(() => departmentReminders.filter((r) => r.isPinned && !r.isCompleted), [departmentReminders]);
  const pendingComplaints = useMemo(() => departmentComplaints.filter((c) => c.status !== 'Resolved'), [departmentComplaints]);

  // Compute upcoming birthdays
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();

    return members
      .filter((m) => m.status === 'Active')
      .map((m) => {
        let diff = (m.birthMonth - currentMonth) * 30 + (m.birthDay - currentDay);
        if (diff < 0) diff += 365;
        return {
          ...m,
          daysUntil: diff,
          formattedBirthday: `${m.birthDay} ${[
            '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ][m.birthMonth]}`,
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }, [members]);

  // Existing Secretary Monthly Report for selected month
  const currentSecretaryReport = useMemo(() => {
    return monthlyReports.find(
      (r) => r.departmentUnit === 'Secretary' && r.reportingMonth === selectedMonth
    );
  }, [monthlyReports, selectedMonth]);

  // Sync Monthly Report form with stored record when month changes
  const handleSelectReportMonth = (month: string) => {
    setSelectedMonth(month);
    const existing = monthlyReports.find(
      (r) => r.departmentUnit === 'Secretary' && r.reportingMonth === month
    );
    if (existing) {
      setReportActivities(existing.activitiesCarriedOut);
      setReportWorkCompleted(existing.workCompleted);
      setReportChallenges(existing.challengesEncountered);
      setReportComplaints(existing.complaintsOrIssues);
      setReportRecommendations(existing.recommendations);
      setReportOutstanding(existing.outstandingResponsibilities);
      setReportNextMonth(existing.activitiesPlannedNextMonth);
    } else {
      setReportActivities(`Weekly attendance verification, service documentation across Desk A & Desk B, publication of duty rosters and Sunday dress code schedules for ${month}.`);
      setReportWorkCompleted(`Managed ${reports.length} service reports, registered new members, broadcasted announcements, and maintained official church records.`);
      setReportChallenges('Intermittent delays in shift handover logs during peak church service hours.');
      setReportComplaints('Laser printer toner cartridge replacement required for Secretariat table registers.');
      setReportRecommendations('Formalize electronic handover protocol between Desk A and Desk B leads.');
      setReportOutstanding('Complete physical member ID distribution for new disciples.');
      setReportNextMonth('Deploy digital reception tools and organize Q4 department documentation archive.');
    }
  };

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventCategory('Training & Workshop');
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventTime('09:00 AM - 12:00 PM');
    setEventVenue('Youth Chapel Hall, DC Asaba HQ');
    setEventDescription('');
    setEventInstructions('');
    setEventFlyerUrl('');
    setEventAudience('All Department Members');
    setEventStatus('Published');
    setEventIsPinned(false);
    setShowEventPreview(false);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt: DepartmentEvent) => {
    setEditingEvent(evt);
    setEventTitle(evt.title);
    setEventCategory(evt.category);
    setEventDate(evt.date);
    setEventTime(evt.time);
    setEventVenue(evt.venue);
    setEventDescription(evt.description);
    setEventInstructions(evt.instructions || '');
    setEventFlyerUrl(evt.flyerUrl || '');
    setEventAudience(evt.targetAudience);
    setEventStatus(evt.status);
    setEventIsPinned(evt.isPinned);
    setShowEventPreview(false);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    if (editingEvent) {
      updateDepartmentEvent(editingEvent.id, {
        title: eventTitle.trim(),
        category: eventCategory,
        date: eventDate,
        time: eventTime,
        venue: eventVenue.trim(),
        description: eventDescription.trim(),
        instructions: eventInstructions.trim(),
        flyerUrl: eventFlyerUrl.trim(),
        targetAudience: eventAudience,
        status: eventStatus,
        isPinned: eventIsPinned,
      });
    } else {
      addDepartmentEvent({
        title: eventTitle.trim(),
        category: eventCategory,
        date: eventDate,
        time: eventTime,
        venue: eventVenue.trim(),
        description: eventDescription.trim(),
        instructions: eventInstructions.trim(),
        flyerUrl: eventFlyerUrl.trim(),
        targetAudience: eventAudience,
        status: eventStatus,
        isPinned: eventIsPinned,
        createdBy: currentUser?.name || 'Department Secretary',
      });
    }
    setIsEventModalOpen(false);
  };

  // Programme handlers
  const handleOpenAddProgramme = () => {
    setEditingProgramme(null);
    setProgTitle('');
    setProgType('Sunday 1st Service');
    setProgDate(new Date().toISOString().split('T')[0]);
    setProgTime('08:00 AM - 10:30 AM');
    setProgVenue('Main Sanctuary, Dominion City Asaba');
    setProgDescription('');
    setProgAttachmentName('');
    setProgIsPublished(true);
    setIsProgrammeModalOpen(true);
  };

  const handleOpenEditProgramme = (p: ChurchProgramme) => {
    setEditingProgramme(p);
    setProgTitle(p.title);
    setProgType(p.programmeType);
    setProgDate(p.date);
    setProgTime(p.time);
    setProgVenue(p.venue);
    setProgDescription(p.description);
    setProgAttachmentName(p.attachmentName || '');
    setProgIsPublished(p.isPublished);
    setIsProgrammeModalOpen(true);
  };

  const handleSaveProgramme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progTitle.trim()) return;

    if (editingProgramme) {
      updateChurchProgramme(editingProgramme.id, {
        title: progTitle.trim(),
        programmeType: progType,
        date: progDate,
        time: progTime,
        venue: progVenue.trim(),
        description: progDescription.trim(),
        attachmentName: progAttachmentName.trim(),
        isPublished: progIsPublished,
      });
    } else {
      addChurchProgramme({
        title: progTitle.trim(),
        programmeType: progType,
        date: progDate,
        time: progTime,
        venue: progVenue.trim(),
        description: progDescription.trim(),
        attachmentName: progAttachmentName.trim(),
        isPublished: progIsPublished,
        publishedBy: currentUser?.name || 'Department Secretary',
      });
    }
    setIsProgrammeModalOpen(false);
  };

  // Reminder handlers
  const handleOpenAddReminder = () => {
    setEditingReminder(null);
    setRemTitle('');
    setRemCategory('Departmental Meeting');
    setRemDescription('');
    setRemDueDate(new Date().toISOString().split('T')[0]);
    setRemDueTime('06:00 PM');
    setRemAssignedTo('All Department Members');
    const exp = new Date();
    exp.setDate(exp.getDate() + 7);
    setRemExpiryDate(exp.toISOString().split('T')[0]);
    setRemIsPinned(true);
    setIsReminderModalOpen(true);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;

    if (editingReminder) {
      updateDepartmentReminder(editingReminder.id, {
        title: remTitle.trim(),
        category: remCategory,
        description: remDescription.trim(),
        dueDate: remDueDate,
        dueTime: remDueTime,
        assignedTo: remAssignedTo,
        expiryDate: remExpiryDate,
        isPinned: remIsPinned,
      });
    } else {
      addDepartmentReminder({
        title: remTitle.trim(),
        category: remCategory,
        description: remDescription.trim(),
        dueDate: remDueDate,
        dueTime: remDueTime,
        assignedTo: remAssignedTo,
        isPinned: remIsPinned,
        expiryDate: remExpiryDate,
        isCompleted: false,
        createdBy: currentUser?.name || 'Department Secretary',
      });
    }
    setIsReminderModalOpen(false);
  };

  // Announcement Handlers
  const handleOpenAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnTitle('');
    setAnnCategory('General Announcement');
    setAnnDescription('');
    setAnnIsUrgent(false);
    setAnnStatus('Published');
    setAnnVenue('');
    setAnnEventDate(new Date().toISOString().split('T')[0]);
    setAnnCoverPhoto('');
    setIsAnnouncementModalOpen(true);
  };

  const handleOpenEditAnnouncement = (a: Announcement) => {
    setEditingAnnouncement(a);
    setAnnTitle(a.title);
    setAnnCategory(a.category);
    setAnnDescription(a.description);
    setAnnIsUrgent(a.isUrgent);
    setAnnStatus(a.status);
    setAnnVenue(a.venue || '');
    setAnnEventDate(a.eventDate || '');
    setAnnCoverPhoto(a.coverPhoto || '');
    setIsAnnouncementModalOpen(true);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) return;

    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, {
        title: annTitle.trim(),
        category: annCategory,
        description: annDescription.trim(),
        isUrgent: annIsUrgent,
        status: annStatus,
        venue: annVenue.trim(),
        eventDate: annEventDate,
        coverPhoto: annCoverPhoto.trim(),
      });
    } else {
      addAnnouncement({
        title: annTitle.trim(),
        category: annCategory,
        description: annDescription.trim(),
        isUrgent: annIsUrgent,
        status: annStatus,
        author: currentUser?.name || 'Department Secretary',
        venue: annVenue.trim(),
        eventDate: annEventDate,
        coverPhoto: annCoverPhoto.trim(),
      });
    }
    setIsAnnouncementModalOpen(false);
  };

  // Birthday Greeting prepare & publish
  const handlePrepareBirthdayGreeting = (m: (typeof upcomingBirthdays)[0]) => {
    setBirthdayCelebrant({
      id: m.id,
      name: m.fullName,
      photoUrl: m.photoUrl,
      date: m.formattedBirthday,
    });
    setBirthdayGreeting(
      `Happy Glorious Birthday, ${m.fullName}! The Information Desk Department rejoices with you on this special celebration. May God's wisdom, favor, and strength continue to radiate in your life!`
    );
    setBirthdayPrayers(
      `May the Lord perfect all that concerns you this year.\nMay His grace distinguish you in all your endeavors.\nMay divine joy and health surround your household.`
    );
    setIsBirthdayModalOpen(true);
  };

  const handlePublishBirthdayGreeting = () => {
    if (!birthdayCelebrant) return;
    const prayerArray = birthdayPrayers
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    saveBirthdayCelebration({
      memberId: birthdayCelebrant.id,
      celebrantName: birthdayCelebrant.name,
      birthdayDate: birthdayCelebrant.date,
      greeting: birthdayGreeting,
      prayers: prayerArray,
      theme: 'gold',
      photoUrl: birthdayCelebrant.photoUrl,
      caption: `Official departmental greeting for ${birthdayCelebrant.name}!`,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      publishedBy: currentUser?.name || 'Department Secretary',
    });

    // Also publish as a department announcement
    addAnnouncement({
      title: `Birthday Celebration: ${birthdayCelebrant.name}! 🎂`,
      description: birthdayGreeting,
      category: 'Department News',
      author: currentUser?.name || 'Department Secretary',
      status: 'Published',
      isUrgent: false,
      coverPhoto: birthdayCelebrant.photoUrl,
    });

    setIsBirthdayModalOpen(false);
    alert(`Birthday greeting published successfully for ${birthdayCelebrant.name}!`);
  };

  // Save / Submit Monthly Report
  const handleSaveMonthlyReport = (submit: boolean = false) => {
    const reportPayload: Omit<DepartmentMonthlyReport, 'id' | 'createdAt' | 'updatedAt'> = {
      departmentUnit: 'Secretary',
      reportingMonth: selectedMonth,
      submittedBy: currentUser?.name || 'Sister Blessing Ifeanyi',
      submittedByRole: 'Department Secretary',
      submissionDate: new Date().toISOString().split('T')[0],
      status: submit ? 'Submitted' : 'Draft',
      activitiesCarriedOut: reportActivities,
      workCompleted: reportWorkCompleted,
      importantStatistics: {
        'Service Reports Handled': reports.length,
        'Active Duty Rosters': rosters.length,
        'Active Enrolled Members': members.length,
        'Events Scheduled': departmentEvents.length,
        'Announcements Published': announcements.length,
        'Table Registers Built': tableDocuments.length,
        'Reminders Issued': departmentReminders.length,
      },
      challengesEncountered: reportChallenges,
      complaintsOrIssues: reportComplaints,
      recommendations: reportRecommendations,
      outstandingResponsibilities: reportOutstanding,
      activitiesPlannedNextMonth: reportNextMonth,
    };

    saveMonthlyReport({
      ...(currentSecretaryReport?.id ? { id: currentSecretaryReport.id } : {}),
      ...reportPayload,
    });

    setReportSavedBanner(
      submit
        ? `✓ Secretary Monthly Report for ${selectedMonth} submitted successfully to the HOD!`
        : `✓ Secretary Monthly Report for ${selectedMonth} saved as Draft!`
    );
    setTimeout(() => setReportSavedBanner(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ==================================================================== */}
      {/* HEADER BANNER */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#071738] via-[#0B2559] to-[#123A85] text-white shadow-lg border border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <button
            onClick={onReturnToGeneral}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white text-xs font-bold mb-3 transition-colors cursor-pointer border border-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Return to General Dashboard</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Secretary & Departmental Coordination Workspace
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-400 text-slate-950 glow-teal">
              Central Coordination
            </span>
          </div>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
            Central departmental coordination hub: official events, announcements, Sunday & Tuesday church programmes, reminder schedules, member birthdays, and monthly unit reporting.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenAddEvent}
            className="btn-compact bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md glow-amber h-10 px-4 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Create Event</span>
          </button>
          <button
            onClick={handleOpenAddProgramme}
            className="btn-compact bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-md h-10 px-4 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-950" />
            <span>Add Programme</span>
          </button>
          <button
            onClick={handleOpenAddReminder}
            className="btn-compact bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/25 h-10 px-4 cursor-pointer"
          >
            <Pin className="w-4 h-4 text-amber-300" />
            <span>Schedule Reminder</span>
          </button>
          {onOpenReportToHRD && (
            <button
              onClick={onOpenReportToHRD}
              className="btn-compact bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-md border border-amber-300 h-10 px-4 cursor-pointer"
              title="Send urgent incident, observation, or message to the Head of Department"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>REPORT TO HOD</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ACCESS RESTRICTIONS NOTICE BANNER */}
      {/* ==================================================================== */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 dark:bg-slate-950/60 border border-slate-700/60 text-xs flex items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            <strong className="text-white">Secretary Role Boundaries:</strong> Authorized for departmental documentation, schedules, events, and reports. Detailed financial books, private Bookstand inventory, and Uniform private locker controls remain protected under their designated officers.
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 px-2 py-0.5 rounded-md bg-teal-950/60 border border-teal-800 shrink-0">
          Enforced
        </span>
      </div>

      {/* ==================================================================== */}
      {/* NAVIGATION TABS */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Executive Overview', icon: Layers, badge: null },
          { id: 'events', label: 'Events Management', icon: Calendar, badge: activeEvents.length },
          { id: 'announcements', label: 'News & Announcements', icon: Megaphone, badge: activeAnnouncements.length },
          { id: 'programmes', label: 'Church Programmes', icon: FileText, badge: activeProgrammes.length },
          { id: 'birthdays', label: 'Birthday Coordination', icon: Cake, badge: upcomingBirthdays.length },
          { id: 'reminders', label: 'Reminders & Tasks', icon: Pin, badge: pinnedReminders.length },
          { id: 'monthly-report', label: 'Monthly Unit Report', icon: FileCheck, badge: 'New' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SecretaryTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white text-blue-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('events')}
              className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Department Events</span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-mono">{departmentEvents.length}</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">{activeEvents.length} published active</p>
            </div>

            <div
              onClick={() => setActiveTab('programmes')}
              className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Service Programmes</span>
                <FileText className="w-4 h-4 text-teal-500" />
              </div>
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1.5 font-mono">{churchProgrammes.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Sunday & Midweek orders</p>
            </div>

            <div
              onClick={() => setActiveTab('reminders')}
              className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Pinned Reminders</span>
                <Pin className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5 font-mono">{pinnedReminders.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Pending active alerts</p>
            </div>

            <div
              onClick={() => setActiveTab('birthdays')}
              className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-pink-500 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Upcoming Birthdays</span>
                <Cake className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-2xl font-black text-pink-600 dark:text-pink-400 mt-1.5 font-mono">{upcomingBirthdays.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Celebrating this month</p>
            </div>
          </div>

          {/* Active Pinned Reminders Banner */}
          {pinnedReminders.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                  <Pin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Pinned Department Reminders & Deadlines</span>
                </div>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                  {pinnedReminders.length} Active Reminders
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {pinnedReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#0E172B] border border-amber-200 dark:border-amber-900/50 flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                          {rem.category}
                        </span>
                        <span className="text-[10px] text-slate-400">Due: {formatDate(rem.dueDate)}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{rem.title}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{rem.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleReminderCompletion(rem.id, currentUser?.name || 'Secretary')}
                      className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 shrink-0 cursor-pointer transition-colors"
                      title="Mark as completed"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two-Column Activity & Coordination Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Upcoming Events & Programmes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Events Box */}
              <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>Upcoming Departmental Events</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('events')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Manage all ({departmentEvents.length}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {activeEvents.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
                    >
                      <div className="flex items-start gap-3">
                        {evt.flyerUrl ? (
                          <img
                            src={evt.flyerUrl}
                            alt={evt.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                            <Calendar className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                              {evt.category}
                            </span>
                            <span className="text-[11px] text-slate-500">{formatDate(evt.date)} • {evt.time}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">{evt.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{evt.venue}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenEditEvent(evt)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-blue-500 shrink-0 cursor-pointer"
                      >
                        Edit Details
                      </button>
                    </div>
                  ))}
                  {activeEvents.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No active events published. Click "Create Event" to schedule an event.
                    </div>
                  )}
                </div>
              </div>

              {/* Sunday & Midweek Programmes Spotlight */}
              <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <FileText className="w-4 h-4 text-teal-500" />
                    <span>Church Programmes & Service Schedules</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('programmes')}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    View all programmes →
                  </button>
                </div>

                <div className="space-y-3">
                  {churchProgrammes.slice(0, 3).map((prog) => (
                    <div
                      key={prog.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300">
                            {prog.programmeType}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">{formatDate(prog.date)} ({prog.time})</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">{prog.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{prog.description}</p>
                      </div>
                      <button
                        onClick={() => handleOpenEditProgramme(prog)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-teal-500 shrink-0 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Birthday Spotlight & Grouped Direct Portals */}
            <div className="space-y-6">
              {/* Birthday Coordination Spotlight */}
              <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Cake className="w-4 h-4 text-pink-500" />
                    <span>Approaching Birthdays</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('birthdays')}
                    className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline cursor-pointer"
                  >
                    View calendar →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {upcomingBirthdays.map((bday) => (
                    <div
                      key={bday.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={bday.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={bday.fullName}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-pink-400/50"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate">{bday.fullName}</h5>
                          <p className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold">{bday.formattedBirthday}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePrepareBirthdayGreeting(bday)}
                        className="px-2 py-1 rounded-md bg-pink-500 hover:bg-pink-400 text-white text-[10px] font-bold shrink-0 cursor-pointer"
                      >
                        Prepare Post
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grouped Administrative Direct Portals */}
              <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Direct Coordination Portals
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => onNavigate('reports')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#07132B] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Service Reports (Desk A & B)
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{reports.length}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('roster')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#07132B] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      Service Duty Rosters
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{rosters.length}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('members')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#07132B] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-500" />
                      Members Folder
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{members.length}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('attendance')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#07132B] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-500" />
                      Live Service Attendance
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold">GPS Geofence</span>
                  </button>

                  <button
                    onClick={() => onNavigate('dress-code')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#07132B] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-rose-500" />
                      Sunday Dress Code Guidelines
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Published</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: EVENTS MANAGEMENT */}
      {/* ==================================================================== */}
      {activeTab === 'events' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Departmental Events Management</h3>
              <p className="text-xs text-slate-500">Create, preview, schedule, and publish official departmental programs and retreats.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="all">All Events ({departmentEvents.length})</option>
                <option value="published">Published Active</option>
                <option value="draft">Drafts Only</option>
              </select>
              <button
                onClick={handleOpenAddEvent}
                className="btn-compact bg-blue-600 hover:bg-blue-500 text-white font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Event</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentEvents
              .filter((e) => {
                if (eventFilter === 'published') return e.status === 'Published';
                if (eventFilter === 'draft') return e.status === 'Draft';
                return true;
              })
              .map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-blue-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    {evt.flyerUrl ? (
                      <div className="h-40 w-full relative overflow-hidden bg-slate-900">
                        <img src={evt.flyerUrl} alt={evt.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              evt.status === 'Published'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {evt.status}
                          </span>
                          {evt.isPinned && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 w-full bg-gradient-to-r from-blue-900 to-indigo-900 p-4 flex items-start justify-between text-white">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white/20">
                          {evt.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            evt.status === 'Published' ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </div>
                    )}

                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(evt.date)} • {evt.time}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{evt.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                      <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-[#07132B] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        updateDepartmentEvent(evt.id, {
                          status: evt.status === 'Published' ? 'Draft' : 'Published',
                        })
                      }
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 cursor-pointer"
                    >
                      {evt.status === 'Published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditEvent(evt)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete event "${evt.title}"?`)) deleteDepartmentEvent(evt.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: NEWS & ANNOUNCEMENTS */}
      {/* ==================================================================== */}
      {activeTab === 'announcements' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">News & Announcements Management</h3>
              <p className="text-xs text-slate-500">Publish departmental notices, pin urgent alerts, and broadcast ministry news.</p>
            </div>
            <button
              onClick={handleOpenAddAnnouncement}
              className="btn-compact bg-teal-600 hover:bg-teal-500 text-white font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Publish Notice</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                      {ann.category}
                    </span>
                    {ann.isUrgent && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-500 text-white animate-pulse">
                        Urgent Notice
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      Author: {ann.author} • {formatDate(ann.createdAt)}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ann.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                    {ann.description}
                  </p>
                  {ann.venue && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" /> Venue: {ann.venue}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEditAnnouncement(ann)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                    title="Edit announcement"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete announcement "${ann.title}"?`)) deleteAnnouncement(ann.id);
                    }}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 cursor-pointer"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: CHURCH PROGRAMMES & ACTIVITIES */}
      {/* ==================================================================== */}
      {activeTab === 'programmes' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Church Programmes & Activity Orders</h3>
              <p className="text-xs text-slate-500">Manage order of service, communion schedules, and departmental meeting orders.</p>
            </div>
            <button
              onClick={handleOpenAddProgramme}
              className="btn-compact bg-teal-600 hover:bg-teal-500 text-white font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New Programme</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {churchProgrammes.map((prog) => (
              <div
                key={prog.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300">
                      {prog.programmeType}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">{prog.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditProgramme(prog)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete programme "${prog.title}"?`)) deleteChurchProgramme(prog.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#07132B] p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Date & Time</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{formatDate(prog.date)} • {prog.time}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Venue</span>
                    <strong className="text-slate-900 dark:text-white truncate block">{prog.venue}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{prog.description}</p>

                {prog.orderOfService && prog.orderOfService.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Order of Service:</span>
                    <div className="space-y-1 max-h-36 overflow-y-auto text-xs pr-1">
                      {prog.orderOfService.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[11px]"
                        >
                          <span className="font-mono text-teal-600 dark:text-teal-400">{item.time}</span>
                          <span className="font-semibold">{item.item}</span>
                          <span className="text-slate-400 text-[10px]">{item.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: BIRTHDAY COORDINATION */}
      {/* ==================================================================== */}
      {activeTab === 'birthdays' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Member Birthday Coordination</h3>
              <p className="text-xs text-slate-500">Track approaching celebrants, prepare personalized write-ups, and coordinate announcements.</p>
            </div>
            <button
              onClick={() => onNavigate('birthdays')}
              className="btn-compact bg-pink-600 hover:bg-pink-500 text-white font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Cake className="w-3.5 h-3.5" />
              <span>Full Birthday Calendar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBirthdays.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-center flex flex-col items-center"
              >
                <div className="relative">
                  <img
                    src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={m.fullName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-pink-400 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-pink-500 text-white shadow-sm">
                    <Cake className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.fullName}</h4>
                  <p className="text-xs text-slate-500">{m.departmentRole}</p>
                  <p className="text-xs font-bold text-pink-600 dark:text-pink-400 mt-1">
                    Birthday: {m.formattedBirthday} ({m.daysUntil === 0 ? 'Today!' : `in ${m.daysUntil} days`})
                  </p>
                </div>

                <div className="w-full pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePrepareBirthdayGreeting(m)}
                    className="w-full py-2 px-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Prepare & Publish Greeting</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: REMINDERS & TASK MANAGEMENT */}
      {/* ==================================================================== */}
      {activeTab === 'reminders' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Department Reminders & Task Schedules</h3>
              <p className="text-xs text-slate-500">Pin important responsibilities, set expiration deadlines, and assign duties to groups.</p>
            </div>
            <button
              onClick={handleOpenAddReminder}
              className="btn-compact bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold h-9 px-3 text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Reminder</span>
            </button>
          </div>

          <div className="space-y-3">
            {departmentReminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  rem.isCompleted
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-[#0E172B] border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleReminderCompletion(rem.id, currentUser?.name || 'Secretary')}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                      rem.isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 hover:border-amber-500'
                    }`}
                  >
                    {rem.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        {rem.category}
                      </span>
                      {rem.isPinned && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500 text-slate-950">
                          Pinned
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        Assigned to: <strong className="text-slate-300">{rem.assignedTo}</strong>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Due: {formatDate(rem.dueDate)} {rem.dueTime}
                      </span>
                    </div>
                    <h4
                      className={`font-bold text-sm text-slate-900 dark:text-white ${
                        rem.isCompleted ? 'line-through' : ''
                      }`}
                    >
                      {rem.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                      {rem.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setEditingReminder(rem);
                      setRemTitle(rem.title);
                      setRemCategory(rem.category);
                      setRemDescription(rem.description);
                      setRemDueDate(rem.dueDate);
                      setRemDueTime(rem.dueTime || '06:00 PM');
                      setRemAssignedTo(rem.assignedTo);
                      setRemExpiryDate(rem.expiryDate);
                      setRemIsPinned(rem.isPinned);
                      setIsReminderModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete reminder "${rem.title}"?`)) deleteDepartmentReminder(rem.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: MONTHLY REPORT FOR SECRETARIAT */}
      {/* ==================================================================== */}
      {activeTab === 'monthly-report' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Secretary Monthly Operating Report</h3>
              <p className="text-xs text-slate-500">Draft, verify, preview, and submit the monthly department coordination report to the HOD.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">Reporting Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => handleSelectReportMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="2026-11">November 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-09">September 2026</option>
              </select>
            </div>
          </div>

          {reportSavedBanner && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              {reportSavedBanner}
            </div>
          )}

          {currentSecretaryReport && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Current Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                    currentSecretaryReport.status === 'Submitted'
                      ? 'bg-blue-500 text-white'
                      : currentSecretaryReport.status === 'Reviewed'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {currentSecretaryReport.status}
                </span>
                {currentSecretaryReport.reviewedBy && (
                  <span className="text-slate-400">
                    • Reviewed by <strong className="text-white">{currentSecretaryReport.reviewedBy}</strong>
                  </span>
                )}
              </div>
              {currentSecretaryReport.hodReviewNotes && (
                <div className="text-slate-300 italic text-[11px]">
                  HOD Remark: "{currentSecretaryReport.hodReviewNotes}"
                </div>
              )}
            </div>
          )}

          {/* Report Form */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Major Activities Carried Out
                </label>
                <textarea
                  rows={3}
                  value={reportActivities}
                  onChange={(e) => setReportActivities(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Outline meetings, rosters published, service coordination..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. Work Completed & Milestones
                </label>
                <textarea
                  rows={3}
                  value={reportWorkCompleted}
                  onChange={(e) => setReportWorkCompleted(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Service reports filed, handbook SOPs updated..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  3. Operational Challenges Encountered
                </label>
                <textarea
                  rows={3}
                  value={reportChallenges}
                  onChange={(e) => setReportChallenges(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Challenges during services, equipment bottlenecks..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  4. Complaints, Observations & Issues
                </label>
                <textarea
                  rows={3}
                  value={reportComplaints}
                  onChange={(e) => setReportComplaints(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Concerns raised by members or duty officers..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  5. Strategic Recommendations
                </label>
                <textarea
                  rows={3}
                  value={reportRecommendations}
                  onChange={(e) => setReportRecommendations(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Suggestions for departmental improvement..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  6. Outstanding Responsibilities & Follow-Up
                </label>
                <textarea
                  rows={3}
                  value={reportOutstanding}
                  onChange={(e) => setReportOutstanding(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Pending registers, unreturned lost items..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                7. Activities Planned for the Following Month
              </label>
              <textarea
                rows={2}
                value={reportNextMonth}
                onChange={(e) => setReportNextMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                placeholder="Next month's schedule, special retreat plans..."
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
                  onClick={() => handleSaveMonthlyReport(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-900 dark:text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMonthlyReport(true)}
                  className="btn-glow-blue px-4 py-2 rounded-xl font-bold text-xs text-white cursor-pointer flex items-center gap-1.5"
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
      {/* MODAL: CREATE / EDIT EVENT */}
      {/* ==================================================================== */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingEvent ? 'Edit Department Event' : 'Create New Department Event'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Information Desk Refresher Retreat"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Training & Workshop">Training & Workshop</option>
                    <option value="Department Meeting">Department Meeting</option>
                    <option value="Outreach & Visitation">Outreach & Visitation</option>
                    <option value="Church Service">Church Service</option>
                    <option value="Special Celebration">Special Celebration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Audience</label>
                  <select
                    value={eventAudience}
                    onChange={(e) => setEventAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="All Department Members">All Department Members</option>
                    <option value="Desk Officers Only">Desk Officers Only</option>
                    <option value="Leadership Team">Leadership Team</option>
                    <option value="Church Public">Church Public</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time *</label>
                  <input
                    type="text"
                    placeholder="09:00 AM - 01:00 PM"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Venue *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Youth Chapel Hall, DC Asaba HQ"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Briefly describe the purpose of this event..."
                />
              </div>

              {/* Event Flyer Upload */}
              <ImageUploadInput
                label="Event Flyer Photograph (Optional)"
                value={eventFlyerUrl}
                onChange={setEventFlyerUrl}
              />

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Special Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Arrive 15 mins early in corporate blue attire"
                  value={eventInstructions}
                  onChange={(e) => setEventInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="event-pin"
                    checked={eventIsPinned}
                    onChange={(e) => setEventIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="event-pin" className="text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
                    Pin Event to Department Home
                  </label>
                </div>
                <select
                  value={eventStatus}
                  onChange={(e) => setEventStatus(e.target.value as any)}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  <option value="Published">Publish Now</option>
                  <option value="Draft">Save as Draft</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow-blue px-4 py-2 rounded-xl font-bold text-white cursor-pointer"
                >
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CREATE / EDIT PROGRAMME */}
      {/* ==================================================================== */}
      {isProgrammeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingProgramme ? 'Edit Church Programme' : 'Add Church Programme'}
              </h3>
              <button
                onClick={() => setIsProgrammeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProgramme} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Programme Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunday Double Impact Celebration"
                  value={progTitle}
                  onChange={(e) => setProgTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Service Type</label>
                  <select
                    value={progType}
                    onChange={(e) => setProgType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Sunday 1st Service">Sunday 1st Service</option>
                    <option value="Sunday 2nd Service">Sunday 2nd Service</option>
                    <option value="Tuesday Word & Communion">Tuesday Word & Communion</option>
                    <option value="Departmental Meeting">Departmental Meeting</option>
                    <option value="Special Programme">Special Programme</option>
                    <option value="Training Session">Training Session</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={progDate}
                    onChange={(e) => setProgDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="07:30 AM - 10:15 AM"
                    value={progTime}
                    onChange={(e) => setProgTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Venue</label>
                  <input
                    type="text"
                    value={progVenue}
                    onChange={(e) => setProgVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={progDescription}
                  onChange={(e) => setProgDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Outline purpose and minister details..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Attachment Name / Link</label>
                <input
                  type="text"
                  placeholder="e.g. Sunday_Order_of_Service_Nov8.pdf"
                  value={progAttachmentName}
                  onChange={(e) => setProgAttachmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProgrammeModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow-blue px-4 py-2 rounded-xl font-bold text-white cursor-pointer"
                >
                  Save Programme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CREATE / EDIT REMINDER */}
      {/* ==================================================================== */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingReminder ? 'Edit Department Reminder' : 'Create Reminder / Deadline'}
              </h3>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReminder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Submit Unit Monthly Operating Reports"
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={remCategory}
                    onChange={(e) => setRemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Departmental Meeting">Departmental Meeting</option>
                    <option value="Upcoming Service">Upcoming Service</option>
                    <option value="Event">Event</option>
                    <option value="Report Submission Deadline">Report Submission Deadline</option>
                    <option value="Birthday Preparation">Birthday Preparation</option>
                    <option value="Visitation Activity">Visitation Activity</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Group</label>
                  <input
                    type="text"
                    value={remAssignedTo}
                    onChange={(e) => setRemAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={remDueDate}
                    onChange={(e) => setRemDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={remExpiryDate}
                    onChange={(e) => setRemExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={remDescription}
                  onChange={(e) => setRemDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Details of the reminder..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rem-pin"
                  checked={remIsPinned}
                  onChange={(e) => setRemIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="rem-pin" className="text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
                  Pin Reminder to Top of Secretary & Home Dashboard
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow-blue px-4 py-2 rounded-xl font-bold text-white cursor-pointer"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: PREPARE BIRTHDAY GREETING */}
      {/* ==================================================================== */}
      {isBirthdayModalOpen && birthdayCelebrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4 text-pink-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Prepare Birthday Greeting for {birthdayCelebrant.name}
                </h3>
              </div>
              <button
                onClick={() => setIsBirthdayModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-950/30 rounded-xl border border-pink-200 dark:border-pink-900/40">
              <img
                src={birthdayCelebrant.photoUrl}
                alt={birthdayCelebrant.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-pink-500"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{birthdayCelebrant.name}</h4>
                <p className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">Celebration Date: {birthdayCelebrant.date}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Personalized Birthday Greeting
                </label>
                <textarea
                  rows={3}
                  value={birthdayGreeting}
                  onChange={(e) => setBirthdayGreeting(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Prophetic Prayers (One per line)
                </label>
                <textarea
                  rows={3}
                  value={birthdayPrayers}
                  onChange={(e) => setBirthdayPrayers(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBirthdayModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishBirthdayGreeting}
                className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Announcement & Post</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CREATE / EDIT ANNOUNCEMENT */}
      {/* ==================================================================== */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingAnnouncement ? 'Edit Department Announcement' : 'Publish New Department Notice'}
              </h3>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urgent Duty Shift Swap Protocol"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="General Announcement">General Announcement</option>
                    <option value="Urgent Meeting">Urgent Meeting</option>
                    <option value="Service Notification">Service Notification</option>
                    <option value="Department News">Department News</option>
                    <option value="Upcoming Event">Upcoming Event</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={annEventDate}
                    onChange={(e) => setAnnEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  value={annDescription}
                  onChange={(e) => setAnnDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Write full announcement details..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Venue (If meeting/event)</label>
                <input
                  type="text"
                  placeholder="e.g. Left Wing Desk or Zoom Link"
                  value={annVenue}
                  onChange={(e) => setAnnVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <ImageUploadInput
                label="Cover Image / Banner (Optional)"
                value={annCoverPhoto}
                onChange={setAnnCoverPhoto}
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ann-urgent"
                  checked={annIsUrgent}
                  onChange={(e) => setAnnIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 cursor-pointer"
                />
                <label htmlFor="ann-urgent" className="text-slate-700 dark:text-slate-300 font-bold cursor-pointer text-rose-600 dark:text-rose-400">
                  Mark as Urgent Alert (High Priority Banner)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow-blue px-4 py-2 rounded-xl font-bold text-white cursor-pointer"
                >
                  {editingAnnouncement ? 'Save Changes' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
