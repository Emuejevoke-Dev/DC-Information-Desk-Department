import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Book,
  BookSale,
  CellMeeting,
  CollectionEntry,
  DepartmentBudgetNeed,
  DepartmentMeeting,
  DepartmentMember,
  DressCode,
  FinancialTransaction,
  HandbookEntry,
  InformationCollection,
  LostItem,
  LostItemStatus,
  SatelliteChurch,
  ServiceReport,
  ServiceRoster,
  StockMovement,
  Announcement,
  AttendanceRecord,
  FinalizedAttendanceReport,
  AbsenceFollowUp,
  TableDocument,
  TableDocumentRow,
  BookstandDutySession,
  BookstandExpense,
  BookstandActivityEntry,
  BookstandComplaint,
  BookstandComplaintStatus,
  ChurchLocationConfig,
  BirthdayCelebration,
  BirthdayTemplate,
  ShareHistoryEntry,
  ShareStatus,
  DepartmentEvent,
  ChurchProgramme,
  DepartmentReminder,
  WelfareTeamMember,
  WelfareFollowUpLog,
  WelfareCase,
  VisitationSchedule,
  DepartmentComplaint,
  DepartmentMonthlyReport,
  CentralComplaintStatus,
  MonthlyReportStatus,
  HRDDepartmentalMessage,
  HRDMessageResponse,
  HRDMessageStatus,
  LeadershipMeeting,
} from '../types/models';
import {
  INITIAL_BOOKS,
  INITIAL_BUDGET_NEEDS,
  INITIAL_CELLS,
  INITIAL_COLLECTIONS,
  INITIAL_COLLECTION_ENTRIES,
  INITIAL_DRESS_CODES,
  INITIAL_HANDBOOK,
  INITIAL_LOST_ITEMS,
  INITIAL_MEETINGS,
  INITIAL_MEMBERS,
  INITIAL_REPORTS,
  INITIAL_ROSTERS,
  INITIAL_SALES,
  INITIAL_SATELLITE_CHURCHES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_FINALIZED_ATTENDANCE,
  INITIAL_ABSENCE_FOLLOW_UPS,
  INITIAL_BOOKSTAND_DUTY_SESSIONS,
  INITIAL_BOOKSTAND_EXPENSES,
  INITIAL_BOOKSTAND_ACTIVITIES,
  INITIAL_BOOKSTAND_COMPLAINTS,
  DEFAULT_CHURCH_LOCATION,
  INITIAL_BIRTHDAY_TEMPLATES,
  INITIAL_BIRTHDAY_CELEBRATIONS,
  INITIAL_SHARE_HISTORY,
  INITIAL_DEPARTMENT_EVENTS,
  INITIAL_CHURCH_PROGRAMMES,
  INITIAL_DEPARTMENT_REMINDERS,
  INITIAL_WELFARE_TEAM,
  INITIAL_WELFARE_FOLLOW_UPS,
  INITIAL_WELFARE_CASES,
  INITIAL_VISITATIONS,
  INITIAL_DEPARTMENT_COMPLAINTS,
  INITIAL_MONTHLY_REPORTS,
  INITIAL_HRD_MESSAGES,
  INITIAL_LEADERSHIP_MEETINGS,
} from '../data/initialData';

interface DataContextType {
  // Collections
  members: DepartmentMember[];
  lostItems: LostItem[];
  announcements: Announcement[];
  cells: CellMeeting[];
  satellites: SatelliteChurch[];
  dressCodes: DressCode[];
  rosters: ServiceRoster[];
  meetings: DepartmentMeeting[];
  reports: ServiceReport[];
  collections: InformationCollection[];
  collectionEntries: CollectionEntry[];
  transactions: FinancialTransaction[];
  budgetNeeds: DepartmentBudgetNeed[];
  books: Book[];
  stockMovements: StockMovement[];
  sales: BookSale[];
  bookstandDutySessions: BookstandDutySession[];
  bookstandExpenses: BookstandExpense[];
  handbook: HandbookEntry[];
  attendance: AttendanceRecord[];
  finalizedAttendance: FinalizedAttendanceReport[];
  absenceFollowUps: AbsenceFollowUp[];
  churchLocationConfig: ChurchLocationConfig;
  birthdayCelebrations: BirthdayCelebration[];
  birthdayTemplates: BirthdayTemplate[];
  shareHistory: ShareHistoryEntry[];

  // Mutators
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
  deleteAttendanceRecord: (id: string) => void;
  updateAttendanceRecord: (id: string, record: Partial<AttendanceRecord>) => void;
  clockOutAttendanceRecord: (id: string, clockOutTime?: string) => void;
  updateChurchLocationConfig: (config: Partial<ChurchLocationConfig>) => void;
  finalizeAttendance: (report: Omit<FinalizedAttendanceReport, 'id' | 'closedAt'>) => void;
  reopenAttendance: (id: string, reopenedBy: string) => void;
  addAbsenceFollowUp: (fu: Omit<AbsenceFollowUp, 'id'>) => void;
  updateAbsenceFollowUp: (id: string, fu: Partial<AbsenceFollowUp>) => void;

  addMember: (m: Omit<DepartmentMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMember: (id: string, m: Partial<DepartmentMember>) => void;
  deleteMember: (id: string) => void;

  addLostItem: (item: Omit<LostItem, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  updateLostItem: (id: string, item: Partial<LostItem>) => void;
  claimLostItem: (id: string, claimant: string, phone: string, witness: string, notes?: string) => void;
  returnLostItem: (id: string, dateReturned: string, notes?: string) => void;
  deleteLostItem: (id: string) => void;

  addAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAnnouncement: (id: string, ann: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  addCell: (c: Omit<CellMeeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCell: (id: string, c: Partial<CellMeeting>) => void;
  deleteCell: (id: string) => void;

  addSatellite: (s: Omit<SatelliteChurch, 'id' | 'createdAt'>) => void;
  updateSatellite: (id: string, s: Partial<SatelliteChurch>) => void;
  deleteSatellite: (id: string) => void;

  addDressCode: (dc: Omit<DressCode, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDressCode: (id: string, dc: Partial<DressCode>) => void;
  deleteDressCode: (id: string) => void;
  publishDressCode: (id: string) => void;
  archiveDressCode: (id: string) => void;

  addRoster: (r: Omit<ServiceRoster, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoster: (id: string, r: Partial<ServiceRoster>) => void;
  deleteRoster: (id: string) => void;

  addMeeting: (m: Omit<DepartmentMeeting, 'id' | 'createdAt'>) => void;
  updateMeeting: (id: string, m: Partial<DepartmentMeeting>) => void;
  deleteMeeting: (id: string) => void;

  addReport: (r: Omit<ServiceReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReport: (id: string, r: Partial<ServiceReport>) => void;
  deleteReport: (id: string) => void;

  addCollection: (col: Omit<InformationCollection, 'id' | 'createdAt' | 'updatedAt' | 'entriesCount'>) => void;
  updateCollection: (id: string, col: Partial<InformationCollection>) => void;
  addCollectionEntry: (entry: Omit<CollectionEntry, 'id' | 'submittedAt'>) => void;

  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;

  addBudgetNeed: (b: Omit<DepartmentBudgetNeed, 'id' | 'createdAt'>) => void;
  updateBudgetNeed: (id: string, b: Partial<DepartmentBudgetNeed>) => void;

  addBook: (b: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'currentStock' | 'quantitySold' | 'returns' | 'damagedOrMissing' | 'status'>) => void;
  updateBook: (id: string, b: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  recordBookSale: (sale: Omit<BookSale, 'id' | 'createdAt' | 'payments'>, initialPayment?: number) => void;
  recordDebtPayment: (saleId: string, amount: number, recordedBy: string, receiptNumber?: string) => void;
  addStockMovement: (sm: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  startBookstandDutySession: (session: Omit<BookstandDutySession, 'id' | 'signedInAt' | 'status'>) => BookstandDutySession;
  endBookstandDutySession: (sessionId: string, handoverNotes?: string) => void;
  addBookstandExpense: (exp: Omit<BookstandExpense, 'id' | 'createdAt'>) => void;
  deleteBookstandExpense: (id: string) => void;
  bookstandActivities: BookstandActivityEntry[];
  addBookstandActivity: (activity: Omit<BookstandActivityEntry, 'id' | 'timestamp'>) => void;
  bookstandComplaints: BookstandComplaint[];
  addBookstandComplaint: (complaint: Omit<BookstandComplaint, 'id' | 'submittedAt' | 'status' | 'followUpComments'>) => void;
  updateBookstandComplaintStatus: (id: string, status: BookstandComplaintStatus, resolutionNotes?: string, resolvedBy?: string) => void;
  addBookstandComplaintComment: (complaintId: string, message: string, commentBy: string) => void;

  // Custom Report Categories
  reportCategories: string[];
  addReportCategory: (name: string) => void;
  deleteReportCategory: (name: string) => void;

  // Table-based Documentation Tool
  tableDocuments: TableDocument[];
  addTableDocument: (doc: Omit<TableDocument, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTableDocument: (id: string, doc: Partial<TableDocument>) => void;
  deleteTableDocument: (id: string) => void;

  addHandbookEntry: (hb: Omit<HandbookEntry, 'id' | 'updatedAt'>) => void;
  updateHandbookEntry: (id: string, hb: Partial<HandbookEntry>) => void;
  deleteHandbookEntry: (id: string) => void;

  // Birthday Customisation & Celebrations
  saveBirthdayCelebration: (celebration: Omit<BirthdayCelebration, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBirthdayCelebration: (id: string, celebration: Partial<BirthdayCelebration>) => void;
  deleteBirthdayCelebration: (id: string) => void;
  saveBirthdayTemplate: (template: Omit<BirthdayTemplate, 'id'>) => void;
  deleteBirthdayTemplate: (id: string) => void;

  // Global Sharing Functionality & History
  addShareHistoryEntry: (entry: Omit<ShareHistoryEntry, 'id' | 'date'>) => ShareHistoryEntry;
  updateShareHistoryStatus: (id: string, status: ShareStatus, notes?: string) => void;
  deleteShareHistoryEntry: (id: string) => void;

  // Secretary Coordination & Events Management
  departmentEvents: DepartmentEvent[];
  addDepartmentEvent: (event: Omit<DepartmentEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDepartmentEvent: (id: string, updates: Partial<DepartmentEvent>) => void;
  deleteDepartmentEvent: (id: string) => void;

  churchProgrammes: ChurchProgramme[];
  addChurchProgramme: (programme: Omit<ChurchProgramme, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChurchProgramme: (id: string, updates: Partial<ChurchProgramme>) => void;
  deleteChurchProgramme: (id: string) => void;

  departmentReminders: DepartmentReminder[];
  addDepartmentReminder: (reminder: Omit<DepartmentReminder, 'id' | 'createdAt'>) => void;
  updateDepartmentReminder: (id: string, updates: Partial<DepartmentReminder>) => void;
  toggleReminderCompletion: (id: string, completedBy: string) => void;
  deleteDepartmentReminder: (id: string) => void;

  // Welfare Department
  welfareTeam: WelfareTeamMember[];
  addWelfareTeamMember: (member: Omit<WelfareTeamMember, 'id' | 'addedAt' | 'updatedAt'>) => void;
  updateWelfareTeamMember: (id: string, updates: Partial<WelfareTeamMember>) => void;
  removeWelfareTeamMember: (id: string) => void;

  welfareFollowUps: WelfareFollowUpLog[];
  recordWelfareFollowUp: (followUp: Omit<WelfareFollowUpLog, 'id' | 'createdAt'>) => void;
  updateWelfareFollowUp: (id: string, updates: Partial<WelfareFollowUpLog>) => void;

  welfareCases: WelfareCase[];
  addWelfareCase: (wcase: Omit<WelfareCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWelfareCase: (id: string, updates: Partial<WelfareCase>) => void;
  escalateWelfareCaseToHOD: (id: string, escalationNotes: string, requestedBy: string) => void;
  respondToWelfareEscalation: (id: string, hodNotes: string, status: any, resolutionNotes?: string) => void;

  visitations: VisitationSchedule[];
  addVisitationSchedule: (visitation: Omit<VisitationSchedule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateVisitationSchedule: (id: string, updates: Partial<VisitationSchedule>) => void;
  completeVisitation: (id: string, outcome: string, completedBy: string, followUpDate?: string) => void;

  // Central Complaints & Escalation System
  departmentComplaints: DepartmentComplaint[];
  submitDepartmentComplaint: (complaint: Omit<DepartmentComplaint, 'id' | 'createdAt' | 'updatedAt' | 'resolutionHistory'>) => void;
  updateComplaintStatus: (id: string, status: CentralComplaintStatus, notes: string, performedBy: string) => void;
  addHODComplaintComment: (id: string, comment: string, performedBy: string) => void;

  // Coordinated Monthly Departmental Reports
  monthlyReports: DepartmentMonthlyReport[];
  saveMonthlyReport: (report: Omit<DepartmentMonthlyReport, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  submitMonthlyReport: (id: string, submittedBy: string) => void;
  reviewMonthlyReport: (id: string, status: MonthlyReportStatus, reviewNotes: string, reviewedBy: string) => void;

  // HRD Office & Departmental Messages
  hrdMessages: HRDDepartmentalMessage[];
  submitHRDMessage: (message: Omit<HRDDepartmentalMessage, 'id' | 'referenceNumber' | 'submissionDate' | 'status' | 'responses' | 'createdAt' | 'updatedAt'>) => HRDDepartmentalMessage;
  updateHRDMessageStatus: (id: string, status: HRDMessageStatus, privateNotes?: string) => void;
  addHRDMessageResponse: (messageId: string, response: Omit<HRDMessageResponse, 'id' | 'timestamp'>, newStatus?: HRDMessageStatus) => void;
  assignHRDMessage: (id: string, assignedOfficer: string) => void;

  // Leadership Meetings & Monthly Assemblies (HRD Office)
  leadershipMeetings: LeadershipMeeting[];
  addLeadershipMeeting: (meeting: Omit<LeadershipMeeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLeadershipMeeting: (id: string, updates: Partial<LeadershipMeeting>) => void;
  deleteLeadershipMeeting: (id: string) => void;
  updateActionPointStatus: (meetingId: string, actionPointId: string, status: 'Pending' | 'In Progress' | 'Completed') => void;

  // System
  resetToInitialData: () => void;
  exportAllDataAsJSON: () => void;
  importDataFromJSON: (jsonData: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_PREFIX = 'dc_asaba_';

function useStoredState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      if (item) {
        const parsed = JSON.parse(item);
        // Ensure flagship church programme flyers appear even if previous announcements were cached
        if (key === 'announcements' && Array.isArray(parsed)) {
          const hasCoverPhoto = parsed.some((a: any) => !!a.coverPhoto);
          if (!hasCoverPhoto && Array.isArray(defaultValue)) {
            const featuredItems = (defaultValue as any[]).filter((d: any) => !!d.coverPhoto);
            return [...featuredItems, ...parsed] as unknown as T;
          }
        }
        return parsed;
      }
      return defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }, [key, state]);

  return [state, setState];
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useStoredState<DepartmentMember[]>('members', INITIAL_MEMBERS);
  const [lostItems, setLostItems] = useStoredState<LostItem[]>('lostItems', INITIAL_LOST_ITEMS);
  const [announcements, setAnnouncements] = useStoredState<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS);
  const [cells, setCells] = useStoredState<CellMeeting[]>('cells', INITIAL_CELLS);
  const [satellites, setSatellites] = useStoredState<SatelliteChurch[]>('satellites', INITIAL_SATELLITE_CHURCHES);
  const [dressCodes, setDressCodes] = useStoredState<DressCode[]>('dressCodes', INITIAL_DRESS_CODES);
  const [rosters, setRosters] = useStoredState<ServiceRoster[]>('rosters', INITIAL_ROSTERS);
  const [meetings, setMeetings] = useStoredState<DepartmentMeeting[]>('meetings', INITIAL_MEETINGS);
  const [reports, setReports] = useStoredState<ServiceReport[]>('reports', INITIAL_REPORTS);
  const [collections, setCollections] = useStoredState<InformationCollection[]>('collections', INITIAL_COLLECTIONS);
  const [collectionEntries, setCollectionEntries] = useStoredState<CollectionEntry[]>('collectionEntries', INITIAL_COLLECTION_ENTRIES);
  const [transactions, setTransactions] = useStoredState<FinancialTransaction[]>('transactions', INITIAL_TRANSACTIONS);
  const [budgetNeeds, setBudgetNeeds] = useStoredState<DepartmentBudgetNeed[]>('budgetNeeds', INITIAL_BUDGET_NEEDS);
  const [books, setBooks] = useStoredState<Book[]>('books', INITIAL_BOOKS);
  const [stockMovements, setStockMovements] = useStoredState<StockMovement[]>('stockMovements', INITIAL_STOCK_MOVEMENTS);
  const [sales, setSales] = useStoredState<BookSale[]>('sales', INITIAL_SALES);
  const [bookstandDutySessions, setBookstandDutySessions] = useStoredState<BookstandDutySession[]>(
    'bookstandDutySessions',
    INITIAL_BOOKSTAND_DUTY_SESSIONS
  );
  const [bookstandExpenses, setBookstandExpenses] = useStoredState<BookstandExpense[]>(
    'bookstandExpenses',
    INITIAL_BOOKSTAND_EXPENSES
  );
  const [bookstandActivities, setBookstandActivities] = useStoredState<BookstandActivityEntry[]>(
    'bookstandActivities',
    INITIAL_BOOKSTAND_ACTIVITIES
  );
  const [bookstandComplaints, setBookstandComplaints] = useStoredState<BookstandComplaint[]>(
    'bookstandComplaints',
    INITIAL_BOOKSTAND_COMPLAINTS
  );
  const [handbook, setHandbook] = useStoredState<HandbookEntry[]>('handbook', INITIAL_HANDBOOK);
  const [attendance, setAttendance] = useStoredState<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
  const [finalizedAttendance, setFinalizedAttendance] = useStoredState<FinalizedAttendanceReport[]>(
    'finalized_attendance',
    INITIAL_FINALIZED_ATTENDANCE
  );
  const [absenceFollowUps, setAbsenceFollowUps] = useStoredState<AbsenceFollowUp[]>(
    'absence_follow_ups',
    INITIAL_ABSENCE_FOLLOW_UPS
  );
  const [churchLocationConfig, setChurchLocationConfig] = useStoredState<ChurchLocationConfig>(
    'church_location_config',
    DEFAULT_CHURCH_LOCATION
  );
  const [birthdayCelebrations, setBirthdayCelebrations] = useStoredState<BirthdayCelebration[]>(
    'birthday_celebrations_v1',
    INITIAL_BIRTHDAY_CELEBRATIONS
  );
  const [birthdayTemplates, setBirthdayTemplates] = useStoredState<BirthdayTemplate[]>(
    'birthday_templates_v1',
    INITIAL_BIRTHDAY_TEMPLATES
  );
  const [shareHistory, setShareHistory] = useStoredState<ShareHistoryEntry[]>(
    'share_history_v1',
    INITIAL_SHARE_HISTORY
  );

  // Secretary Coordination & Events Management
  const [departmentEvents, setDepartmentEvents] = useStoredState<DepartmentEvent[]>(
    'department_events_v1',
    INITIAL_DEPARTMENT_EVENTS
  );
  const [churchProgrammes, setChurchProgrammes] = useStoredState<ChurchProgramme[]>(
    'church_programmes_v1',
    INITIAL_CHURCH_PROGRAMMES
  );
  const [departmentReminders, setDepartmentReminders] = useStoredState<DepartmentReminder[]>(
    'department_reminders_v1',
    INITIAL_DEPARTMENT_REMINDERS
  );

  // Dedicated Welfare Department
  const [welfareTeam, setWelfareTeam] = useStoredState<WelfareTeamMember[]>(
    'welfare_team_v1',
    INITIAL_WELFARE_TEAM
  );
  const [welfareFollowUps, setWelfareFollowUps] = useStoredState<WelfareFollowUpLog[]>(
    'welfare_followups_v1',
    INITIAL_WELFARE_FOLLOW_UPS
  );
  const [welfareCases, setWelfareCases] = useStoredState<WelfareCase[]>(
    'welfare_cases_v1',
    INITIAL_WELFARE_CASES
  );
  const [visitations, setVisitations] = useStoredState<VisitationSchedule[]>(
    'visitations_v1',
    INITIAL_VISITATIONS
  );

  // Central Complaints & Escalations
  const [departmentComplaints, setDepartmentComplaints] = useStoredState<DepartmentComplaint[]>(
    'department_complaints_v1',
    INITIAL_DEPARTMENT_COMPLAINTS
  );

  // Coordinated Monthly Departmental Reports
  const [monthlyReports, setMonthlyReports] = useStoredState<DepartmentMonthlyReport[]>(
    'monthly_reports_v1',
    INITIAL_MONTHLY_REPORTS
  );

  // HRD Office & Departmental Messages
  const [hrdMessages, setHrdMessages] = useStoredState<HRDDepartmentalMessage[]>(
    'hrd_messages_v1',
    INITIAL_HRD_MESSAGES
  );

  // Leadership Meetings & Monthly Assemblies (HRD Office)
  const [leadershipMeetings, setLeadershipMeetings] = useStoredState<LeadershipMeeting[]>(
    'leadership_meetings_v1',
    INITIAL_LEADERSHIP_MEETINGS
  );

  // Custom service report categories (retaining the 4 core categories and allowing custom ones)
  const [reportCategories, setReportCategories] = useStoredState<string[]>('report_categories', [
    'Cell Connection',
    'Desk Traffic',
    'Inquiries',
    'Lost Items',
  ]);

  const addReportCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setReportCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  };

  const deleteReportCategory = (name: string) => {
    setReportCategories((prev) => prev.filter((c) => c !== name));
  };

  // Table-based documents for custom information & registers
  const [tableDocuments, setTableDocuments] = useStoredState<TableDocument[]>('table_documents', [
    {
      id: 'doc-1',
      title: 'Sunday Service First-Timers & Enquirers Register',
      department: 'Information Desk Department',
      date: new Date().toISOString().split('T')[0],
      optionalInfo: 'Dominion City Asaba — Cathedral Main Sanctuary',
      columns: ['Name', 'Surname', 'Phone Number', 'Type of Document / Request'],
      rows: [
        { id: 'r-1', sn: 1, values: { Name: 'Chidinma', Surname: 'Okafor', 'Phone Number': '08034567890', 'Type of Document / Request': 'Cell Fellowship Connection' } },
        { id: 'r-2', sn: 2, values: { Name: 'Samuel', Surname: 'Alabi', 'Phone Number': '08123456789', 'Type of Document / Request': 'Foundation Class Registration' } },
        { id: 'r-3', sn: 3, values: { Name: 'Joy', Surname: 'Emeka', 'Phone Number': '07098765432', 'Type of Document / Request': 'Pastoral Counselling Appointment' } },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Brother Chukwudi Okonkwo',
    },
  ]);

  const addTableDocument = (doc: Omit<TableDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    const newDoc: TableDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setTableDocuments((prev) => [newDoc, ...prev]);
  };

  const updateTableDocument = (id: string, doc: Partial<TableDocument>) => {
    setTableDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...doc, updatedAt: new Date().toISOString() } : d))
    );
  };

  const deleteTableDocument = (id: string) => {
    setTableDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Attendance
  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    setAttendance((prev) => [newRecord, ...prev]);
  };

  const deleteAttendanceRecord = (id: string) => {
    setAttendance((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAttendanceRecord = (id: string, record: Partial<AttendanceRecord>) => {
    setAttendance((prev) => prev.map((a) => (a.id === id ? { ...a, ...record } : a)));
  };

  const clockOutAttendanceRecord = (id: string, clockOutTime?: string) => {
    const timeStr =
      clockOutTime ||
      new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    setAttendance((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'Clocked Out',
              clockOutTime: timeStr,
            }
          : a
      )
    );
  };

  const updateChurchLocationConfig = (config: Partial<ChurchLocationConfig>) => {
    setChurchLocationConfig((prev) => ({
      ...prev,
      ...config,
      updatedAt: new Date().toISOString(),
    }));
  };

  const finalizeAttendance = (report: Omit<FinalizedAttendanceReport, 'id' | 'closedAt'>) => {
    const newReport: FinalizedAttendanceReport = {
      ...report,
      id: `fin-att-${Date.now()}`,
      closedAt: new Date().toISOString(),
    };
    setFinalizedAttendance((prev) => [
      newReport,
      ...prev.filter(
        (r) => !(r.serviceDate === report.serviceDate && r.serviceType === report.serviceType)
      ),
    ]);
  };

  const reopenAttendance = (id: string, reopenedBy: string) => {
    setFinalizedAttendance((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isReopened: true,
              notes: `${r.notes || ''} | Reopened by ${reopenedBy} on ${new Date().toLocaleDateString('en-GB')}`,
            }
          : r
      )
    );
  };

  const addAbsenceFollowUp = (fu: Omit<AbsenceFollowUp, 'id'>) => {
    const newFU: AbsenceFollowUp = {
      ...fu,
      id: `fu-${Date.now()}`,
    };
    setAbsenceFollowUps((prev) => [newFU, ...prev]);
  };

  const updateAbsenceFollowUp = (id: string, fu: Partial<AbsenceFollowUp>) => {
    setAbsenceFollowUps((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...fu } : item))
    );
  };

  // Members
  const addMember = (m: Omit<DepartmentMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMember: DepartmentMember = {
      ...m,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMembers((prev) => [newMember, ...prev]);
  };

  const updateMember = (id: string, m: Partial<DepartmentMember>) => {
    setMembers((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...m, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((item) => item.id !== id));
  };

  // Lost & Found
  const addLostItem = (item: Omit<LostItem, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => {
    const timestamp = new Date().toISOString();
    const newItem: LostItem = {
      ...item,
      id: `lost-${Date.now()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp,
          action: 'Item Logged into Information Desk',
          performedBy: item.recordedBy,
          notes: 'Item logged and stored securely.',
        },
      ],
    };
    setLostItems((prev) => [newItem, ...prev]);
  };

  const updateLostItem = (id: string, patch: Partial<LostItem>) => {
    const timestamp = new Date().toISOString();
    setLostItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedHistory = [...item.history];
          if (patch.status && patch.status !== item.status) {
            updatedHistory.push({
              id: `hist-${Date.now()}`,
              timestamp,
              action: `Status changed from ${item.status} to ${patch.status}`,
              performedBy: patch.recordedBy || 'Authorized Officer',
            });
          }
          return {
            ...item,
            ...patch,
            updatedAt: timestamp,
            history: updatedHistory,
          };
        }
        return item;
      })
    );
  };

  const claimLostItem = (
    id: string,
    claimant: string,
    phone: string,
    witness: string,
    notes?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    setLostItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newHistory = [
            ...item.history,
            {
              id: `hist-${Date.now()}`,
              timestamp,
              action: `Item Verified & Claimed by ${claimant}`,
              performedBy: witness,
              notes: notes || 'Verified with identification and released.',
            },
          ];

          return {
            ...item,
            status: 'Claimed',
            recoveryDate: today,
            collectedBy: claimant,
            collectorPhone: phone,
            officerWitness: witness,
            notes: notes ? `${item.notes || ''} | ${notes}` : item.notes,
            history: newHistory,
            updatedAt: timestamp,
          };
        }
        return item;
      })
    );
  };

  const returnLostItem = (id: string, dateReturned: string, notes?: string) => {
    const timestamp = new Date().toISOString();
    setLostItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'Returned' as LostItemStatus,
            recoveryDate: dateReturned || item.recoveryDate,
            notes: notes ? `${item.notes || ''} | Returned: ${notes}` : item.notes,
            history: [
              ...item.history,
              {
                id: `hist-${Date.now()}`,
                timestamp,
                action: 'Item Released and Returned to Verified Owner',
                performedBy: 'Information Desk Officer',
                notes: notes || 'Physical possession returned to owner.',
              },
            ],
            updatedAt: timestamp,
          };
        }
        return item;
      })
    );
  };

  const deleteLostItem = (id: string) => {
    setLostItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const updateAnnouncement = (id: string, ann: Partial<Announcement>) => {
    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...ann, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
  };

  // Cells
  const addCell = (c: Omit<CellMeeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    const newCell: CellMeeting = {
      ...c,
      id: `cell-${Date.now()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setCells((prev) => [newCell, ...prev]);
  };

  const updateCell = (id: string, c: Partial<CellMeeting>) => {
    setCells((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...c, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const deleteCell = (id: string) => {
    setCells((prev) => prev.filter((item) => item.id !== id));
  };

  // Satellites
  const addSatellite = (s: Omit<SatelliteChurch, 'id' | 'createdAt'>) => {
    const newSat: SatelliteChurch = {
      ...s,
      id: `sat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSatellites((prev) => [newSat, ...prev]);
  };

  const updateSatellite = (id: string, s: Partial<SatelliteChurch>) => {
    setSatellites((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...s } : item))
    );
  };

  const deleteSatellite = (id: string) => {
    setSatellites((prev) => prev.filter((item) => item.id !== id));
  };

  // Dress Codes
  const addDressCode = (dc: Omit<DressCode, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    const newDC: DressCode = {
      ...dc,
      id: `dc-${Date.now()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setDressCodes((prev) => [newDC, ...prev]);
  };

  const updateDressCode = (id: string, dc: Partial<DressCode>) => {
    setDressCodes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...dc, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const deleteDressCode = (id: string) => {
    setDressCodes((prev) => prev.filter((item) => item.id !== id));
  };

  const publishDressCode = (id: string) => {
    setDressCodes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Published', updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const archiveDressCode = (id: string) => {
    setDressCodes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Archived', updatedAt: new Date().toISOString() } : item
      )
    );
  };

  // Rosters
  const addRoster = (r: Omit<ServiceRoster, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    const newRoster: ServiceRoster = {
      ...r,
      id: `rst-${Date.now()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setRosters((prev) => [newRoster, ...prev]);
  };

  const updateRoster = (id: string, r: Partial<ServiceRoster>) => {
    setRosters((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...r, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const deleteRoster = (id: string) => {
    setRosters((prev) => prev.filter((item) => item.id !== id));
  };

  // Meetings
  const addMeeting = (m: Omit<DepartmentMeeting, 'id' | 'createdAt'>) => {
    const newMeet: DepartmentMeeting = {
      ...m,
      id: `meet-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMeetings((prev) => [newMeet, ...prev]);
  };

  const updateMeeting = (id: string, m: Partial<DepartmentMeeting>) => {
    setMeetings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...m } : item))
    );
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((item) => item.id !== id));
  };

  // Reports
  const addReport = (r: Omit<ServiceReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    const newReport: ServiceReport = {
      ...r,
      id: `rep-${Date.now()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const updateReport = (id: string, r: Partial<ServiceReport>) => {
    setReports((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...r, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((item) => item.id !== id));
  };

  // Collections (Custom Dynamic Forms)
  const addCollection = (
    col: Omit<InformationCollection, 'id' | 'createdAt' | 'updatedAt' | 'entriesCount'>
  ) => {
    const timestamp = new Date().toISOString();
    const newCol: InformationCollection = {
      ...col,
      id: `col-${Date.now()}`,
      entriesCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setCollections((prev) => [newCol, ...prev]);
  };

  const updateCollection = (id: string, col: Partial<InformationCollection>) => {
    setCollections((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...col, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const addCollectionEntry = (entry: Omit<CollectionEntry, 'id' | 'submittedAt'>) => {
    const newEntry: CollectionEntry = {
      ...entry,
      id: `ent-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    setCollectionEntries((prev) => [newEntry, ...prev]);

    // Increment count
    setCollections((prev) =>
      prev.map((col) =>
        col.id === entry.collectionId ? { ...col, entriesCount: col.entriesCount + 1 } : col
      )
    );
  };

  // Finances
  const addTransaction = (tx: Omit<FinancialTransaction, 'id' | 'createdAt'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const addBudgetNeed = (b: Omit<DepartmentBudgetNeed, 'id' | 'createdAt'>) => {
    const newB: DepartmentBudgetNeed = {
      ...b,
      id: `bgt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBudgetNeeds((prev) => [newB, ...prev]);
  };

  const updateBudgetNeed = (id: string, b: Partial<DepartmentBudgetNeed>) => {
    setBudgetNeeds((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...b } : item))
    );
  };

  // Books & Inventory
  const addBook = (
    b: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'currentStock' | 'quantitySold' | 'returns' | 'damagedOrMissing' | 'status'>
  ) => {
    const timestamp = new Date().toISOString();
    const current = (b.openingStock || 0) + (b.stockReceived || 0);
    const newBook: Book = {
      ...b,
      id: `bk-${Date.now()}`,
      currentStock: current,
      quantitySold: 0,
      returns: 0,
      damagedOrMissing: 0,
      status: current <= b.reorderThreshold ? (current <= 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setBooks((prev) => [newBook, ...prev]);
  };

  const updateBook = (id: string, b: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...b, updatedAt: new Date().toISOString() };
          // Recalculate current stock accurately
          const calcStock =
            updated.openingStock +
            updated.stockReceived +
            updated.returns -
            updated.quantitySold -
            updated.damagedOrMissing;
          updated.currentStock = Math.max(0, calcStock);
          updated.status =
            updated.currentStock <= 0
              ? 'Out of Stock'
              : updated.currentStock <= updated.reorderThreshold
              ? 'Low Stock'
              : 'In Stock';
          return updated;
        }
        return item;
      })
    );
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const addStockMovement = (sm: Omit<StockMovement, 'id' | 'createdAt'>) => {
    const newSM: StockMovement = {
      ...sm,
      id: `sm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStockMovements((prev) => [newSM, ...prev]);

    // Update book stock accordingly
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === sm.bookId) {
          let stockReceived = book.stockReceived;
          let damagedOrMissing = book.damagedOrMissing;
          let returns = book.returns;

          if (sm.type === 'Stock Delivery') {
            stockReceived += sm.quantity;
          } else if (sm.type === 'Damaged/Missing') {
            damagedOrMissing += sm.quantity;
          } else if (sm.type === 'Customer Return') {
            returns += sm.quantity;
          }

          const currentStock = Math.max(
            0,
            book.openingStock + stockReceived + returns - book.quantitySold - damagedOrMissing
          );

          return {
            ...book,
            stockReceived,
            damagedOrMissing,
            returns,
            currentStock,
            status:
              currentStock <= 0
                ? 'Out of Stock'
                : currentStock <= book.reorderThreshold
                ? 'Low Stock'
                : 'In Stock',
            updatedAt: new Date().toISOString(),
          };
        }
        return book;
      })
    );
  };

  const recordBookSale = (
    sale: Omit<BookSale, 'id' | 'createdAt' | 'payments'>,
    initialPayment: number = sale.amountPaid
  ) => {
    const saleId = `sale-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const initialPayments = initialPayment > 0
      ? [
          {
            id: `p-${Date.now()}`,
            date: sale.saleDate,
            amount: initialPayment,
            recordedBy: sale.recordedBy,
            receiptNumber: `RCP-${Math.floor(100 + Math.random() * 900)}`,
          },
        ]
      : [];

    const newSale: BookSale = {
      ...sale,
      id: saleId,
      payments: initialPayments,
      createdAt: timestamp,
    };

    setSales((prev) => [newSale, ...prev]);

    // Automatically record activity entry for active duty session
    const activeSession = bookstandDutySessions.find(
      (s) => s.status === 'Active' || s.serviceDate === sale.saleDate
    );
    const soldItemsDesc = sale.items.map((i) => `${i.quantity}x ${i.bookTitle}`).join(', ');
    const newActivity: BookstandActivityEntry = {
      id: `act-${Date.now()}`,
      sessionId: activeSession?.id || `sess-${sale.saleDate}`,
      serviceDate: sale.saleDate,
      serviceType: sale.serviceType || activeSession?.serviceType || 'Bookstand Service',
      officiatingMember: sale.recordedBy,
      timestamp,
      activityType: 'Sale',
      description: `Sold ${soldItemsDesc} to ${sale.customerName || 'Customer'} (₦${sale.totalAmount.toLocaleString()} - ${sale.paymentStatus})`,
      bookId: sale.items[0]?.bookId,
      bookTitle: sale.items[0]?.bookTitle,
      quantity: sale.items.reduce((sum, i) => sum + i.quantity, 0),
      amount: sale.totalAmount,
      customerName: sale.customerName,
      notes: sale.notes,
    };
    setBookstandActivities((prev) => [newActivity, ...prev]);

    // Update book quantities
    setBooks((prev) =>
      prev.map((book) => {
        const itemSold = sale.items.find((item) => item.bookId === book.id);
        if (itemSold) {
          const quantitySold = book.quantitySold + itemSold.quantity;
          const currentStock = Math.max(
            0,
            book.openingStock + book.stockReceived + book.returns - quantitySold - book.damagedOrMissing
          );
          return {
            ...book,
            quantitySold,
            currentStock,
            status:
              currentStock <= 0
                ? 'Out of Stock'
                : currentStock <= book.reorderThreshold
                ? 'Low Stock'
                : 'In Stock',
            updatedAt: timestamp,
          };
        }
        return book;
      })
    );
  };

  const recordDebtPayment = (
    saleId: string,
    amount: number,
    recordedBy: string,
    receiptNumber?: string
  ) => {
    setSales((prev) =>
      prev.map((sale) => {
        if (sale.id === saleId) {
          const newPaid = sale.amountPaid + amount;
          const newOutstanding = Math.max(0, sale.totalAmount - newPaid);
          const paymentStatus =
            newOutstanding === 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Unpaid';

          const newPaymentRecord = {
            id: `p-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            amount,
            recordedBy,
            receiptNumber: receiptNumber || `RCP-${Math.floor(100 + Math.random() * 900)}`,
          };

          return {
            ...sale,
            amountPaid: newPaid,
            outstandingDebt: newOutstanding,
            paymentStatus,
            payments: [...sale.payments, newPaymentRecord],
          };
        }
        return sale;
      })
    );
  };

  const startBookstandDutySession = (
    session: Omit<BookstandDutySession, 'id' | 'signedInAt' | 'status'>
  ): BookstandDutySession => {
    const newSession: BookstandDutySession = {
      ...session,
      id: `duty-${Date.now()}`,
      signedInAt: new Date().toISOString(),
      status: 'Active',
      initialCountVerified: true,
    };
    setBookstandDutySessions((prev) => [newSession, ...prev]);
    return newSession;
  };

  const endBookstandDutySession = (sessionId: string, handoverNotes?: string) => {
    const timestamp = new Date().toISOString();
    setBookstandDutySessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'Completed',
              signedOutAt: timestamp,
              handoverNotes: handoverNotes || s.handoverNotes,
            }
          : s
      )
    );

    const session = bookstandDutySessions.find((s) => s.id === sessionId);
    if (session) {
      const handoverActivity: BookstandActivityEntry = {
        id: `act-${Date.now()}`,
        sessionId: session.id,
        serviceDate: session.serviceDate,
        serviceType: session.serviceType,
        officiatingMember: session.officiatingName,
        timestamp,
        activityType: 'Handover',
        description: `Duty shift signed out. Handover notes: ${handoverNotes || 'Normal shift completion.'}`,
        notes: handoverNotes,
      };
      setBookstandActivities((prev) => [handoverActivity, ...prev]);
    }
  };

  const addBookstandActivity = (activity: Omit<BookstandActivityEntry, 'id' | 'timestamp'>) => {
    const newAct: BookstandActivityEntry = {
      ...activity,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setBookstandActivities((prev) => [newAct, ...prev]);
  };

  const addBookstandComplaint = (
    complaint: Omit<BookstandComplaint, 'id' | 'submittedAt' | 'status' | 'followUpComments'>
  ) => {
    const newComp: BookstandComplaint = {
      ...complaint,
      id: `comp-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'Open',
      followUpComments: [],
    };
    setBookstandComplaints((prev) => [newComp, ...prev]);

    // Also record as an activity on the duty session
    const compActivity: BookstandActivityEntry = {
      id: `act-${Date.now()}-comp`,
      sessionId: complaint.sessionId,
      serviceDate: complaint.serviceDate,
      serviceType: complaint.serviceType,
      officiatingMember: complaint.submittedBy,
      timestamp: new Date().toISOString(),
      activityType: 'Issue',
      description: `Reported [${complaint.category}]: ${complaint.subject}`,
      notes: complaint.description,
    };
    setBookstandActivities((prev) => [compActivity, ...prev]);
  };

  const updateBookstandComplaintStatus = (
    id: string,
    status: BookstandComplaintStatus,
    resolutionNotes?: string,
    resolvedBy?: string
  ) => {
    const timestamp = new Date().toISOString();
    setBookstandComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status,
            resolutionNotes: resolutionNotes || c.resolutionNotes,
            resolvedAt: status === 'Resolved' ? timestamp : c.resolvedAt,
            resolvedBy: status === 'Resolved' ? (resolvedBy || 'Bookstand Officer') : c.resolvedBy,
            acknowledgedBy: status === 'Acknowledged' || status === 'Under Review' ? (resolvedBy || 'Bookstand Officer') : c.acknowledgedBy,
            acknowledgedAt: status === 'Acknowledged' || status === 'Under Review' ? timestamp : c.acknowledgedAt,
          };
        }
        return c;
      })
    );
  };

  const addBookstandComplaintComment = (
    complaintId: string,
    message: string,
    commentBy: string
  ) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      commentBy,
      timestamp: new Date().toISOString(),
      message,
    };
    setBookstandComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            followUpComments: [...c.followUpComments, newComment],
          };
        }
        return c;
      })
    );
  };

  const addBookstandExpense = (exp: Omit<BookstandExpense, 'id' | 'createdAt'>) => {
    const newExp: BookstandExpense = {
      ...exp,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBookstandExpenses((prev) => [newExp, ...prev]);
  };

  const deleteBookstandExpense = (id: string) => {
    setBookstandExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Handbook
  const addHandbookEntry = (hb: Omit<HandbookEntry, 'id' | 'updatedAt'>) => {
    const newHB: HandbookEntry = {
      ...hb,
      id: `hb-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setHandbook((prev) => [newHB, ...prev]);
  };

  const updateHandbookEntry = (id: string, hb: Partial<HandbookEntry>) => {
    setHandbook((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...hb, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const deleteHandbookEntry = (id: string) => {
    setHandbook((prev) => prev.filter((item) => item.id !== id));
  };

  // -------------------------------------------------------------
  // BIRTHDAY CUSTOMISATION & CELEBRATION
  // -------------------------------------------------------------
  const saveBirthdayCelebration = (
    celebration: Omit<BirthdayCelebration, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const existingIdx = birthdayCelebrations.findIndex((c) => c.memberId === celebration.memberId);
    const now = new Date().toISOString();
    if (existingIdx >= 0) {
      const updated = [...birthdayCelebrations];
      updated[existingIdx] = {
        ...updated[existingIdx],
        ...celebration,
        updatedAt: now,
      };
      setBirthdayCelebrations(updated);
    } else {
      const newCel: BirthdayCelebration = {
        ...celebration,
        id: `cel-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setBirthdayCelebrations([newCel, ...birthdayCelebrations]);
    }
  };

  const updateBirthdayCelebration = (id: string, celebration: Partial<BirthdayCelebration>) => {
    setBirthdayCelebrations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...celebration, updatedAt: new Date().toISOString() } : c))
    );
  };

  const deleteBirthdayCelebration = (id: string) => {
    setBirthdayCelebrations((prev) => prev.filter((c) => c.id !== id));
  };

  const saveBirthdayTemplate = (template: Omit<BirthdayTemplate, 'id'>) => {
    const newTmpl: BirthdayTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
    };
    setBirthdayTemplates((prev) => [newTmpl, ...prev]);
  };

  const deleteBirthdayTemplate = (id: string) => {
    setBirthdayTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  // -------------------------------------------------------------
  // GLOBAL SHARING FUNCTIONALITY & HISTORY
  // -------------------------------------------------------------
  const addShareHistoryEntry = (
    entry: Omit<ShareHistoryEntry, 'id' | 'date'>
  ): ShareHistoryEntry => {
    const newEntry: ShareHistoryEntry = {
      ...entry,
      id: `sh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
    };
    setShareHistory((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const updateShareHistoryStatus = (id: string, status: ShareStatus, notes?: string) => {
    setShareHistory((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, ...(notes ? { notes } : {}) } : s))
    );
  };

  const deleteShareHistoryEntry = (id: string) => {
    setShareHistory((prev) => prev.filter((s) => s.id !== id));
  };

  // ============================================================================
  // SECRETARY COORDINATION & EVENTS MANAGEMENT
  // ============================================================================

  const addDepartmentEvent = (event: Omit<DepartmentEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: DepartmentEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDepartmentEvents((prev) => [newEvent, ...prev]);
  };

  const updateDepartmentEvent = (id: string, updates: Partial<DepartmentEvent>) => {
    setDepartmentEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  };

  const deleteDepartmentEvent = (id: string) => {
    setDepartmentEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const addChurchProgramme = (programme: Omit<ChurchProgramme, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProg: ChurchProgramme = {
      ...programme,
      id: `prog-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setChurchProgrammes((prev) => [newProg, ...prev]);
  };

  const updateChurchProgramme = (id: string, updates: Partial<ChurchProgramme>) => {
    setChurchProgrammes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteChurchProgramme = (id: string) => {
    setChurchProgrammes((prev) => prev.filter((p) => p.id !== id));
  };

  const addDepartmentReminder = (reminder: Omit<DepartmentReminder, 'id' | 'createdAt'>) => {
    const newRem: DepartmentReminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDepartmentReminders((prev) => [newRem, ...prev]);
  };

  const updateDepartmentReminder = (id: string, updates: Partial<DepartmentReminder>) => {
    setDepartmentReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const toggleReminderCompletion = (id: string, completedBy: string) => {
    setDepartmentReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const willComplete = !r.isCompleted;
        return {
          ...r,
          isCompleted: willComplete,
          completedAt: willComplete ? new Date().toISOString() : undefined,
          completedBy: willComplete ? completedBy : undefined,
        };
      })
    );
  };

  const deleteDepartmentReminder = (id: string) => {
    setDepartmentReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // ============================================================================
  // DEDICATED WELFARE DEPARTMENT MUTATORS
  // ============================================================================

  const addWelfareTeamMember = (member: Omit<WelfareTeamMember, 'id' | 'addedAt' | 'updatedAt'>) => {
    const newMember: WelfareTeamMember = {
      ...member,
      id: `wteam-${Date.now()}`,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWelfareTeam((prev) => [...prev, newMember]);
  };

  const updateWelfareTeamMember = (id: string, updates: Partial<WelfareTeamMember>) => {
    setWelfareTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
  };

  const removeWelfareTeamMember = (id: string) => {
    setWelfareTeam((prev) => prev.filter((m) => m.id !== id));
  };

  const recordWelfareFollowUp = (followUp: Omit<WelfareFollowUpLog, 'id' | 'createdAt'>) => {
    const newFollowUp: WelfareFollowUpLog = {
      ...followUp,
      id: `wfup-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWelfareFollowUps((prev) => [newFollowUp, ...prev]);
  };

  const updateWelfareFollowUp = (id: string, updates: Partial<WelfareFollowUpLog>) => {
    setWelfareFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const addWelfareCase = (wcase: Omit<WelfareCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCase: WelfareCase = {
      ...wcase,
      id: `wcase-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWelfareCases((prev) => [newCase, ...prev]);
  };

  const updateWelfareCase = (id: string, updates: Partial<WelfareCase>) => {
    setWelfareCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  const escalateWelfareCaseToHOD = (id: string, escalationNotes: string, requestedBy: string) => {
    const targetCase = welfareCases.find((c) => c.id === id);
    setWelfareCases((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          isEscalatedToHOD: true,
          escalationNotes,
          escalatedAt: new Date().toISOString(),
          status: 'Referred to HOD',
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Also mirror into Central Complaints & Escalations so HOD sees it in centralized issues board
    if (targetCase) {
      submitDepartmentComplaint({
        submittedBy: requestedBy,
        submittedByRole: 'Welfare Coordinator',
        department: 'Welfare',
        submissionDate: new Date().toISOString().split('T')[0],
        category: `Welfare Escalation: ${targetCase.category}`,
        subject: `[Welfare Escalation] ${targetCase.memberName} — ${targetCase.category}`,
        description: `${escalationNotes}\n\nCase Background: ${targetCase.description}`,
        urgency: targetCase.urgency === 'Emergency' ? 'Critical' : targetCase.urgency,
        status: 'New',
      });
    }
  };

  const respondToWelfareEscalation = (
    id: string,
    hodNotes: string,
    status: any,
    resolutionNotes?: string
  ) => {
    setWelfareCases((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          hodNotes,
          hodReviewedAt: new Date().toISOString(),
          status,
          ...(resolutionNotes ? { resolutionNotes, resolvedAt: new Date().toISOString() } : {}),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addVisitationSchedule = (visitation: Omit<VisitationSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVis: VisitationSchedule = {
      ...visitation,
      id: `vis-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVisitations((prev) => [newVis, ...prev]);
  };

  const updateVisitationSchedule = (id: string, updates: Partial<VisitationSchedule>) => {
    setVisitations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v))
    );
  };

  const completeVisitation = (
    id: string,
    outcome: string,
    completedBy: string,
    followUpDate?: string
  ) => {
    setVisitations((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        return {
          ...v,
          outcome,
          status: 'Completed',
          completedAt: new Date().toISOString(),
          completedBy,
          followUpVisitNeeded: Boolean(followUpDate),
          followUpVisitDate: followUpDate,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // ============================================================================
  // CENTRAL COMPLAINTS & ESCALATION SYSTEM
  // ============================================================================

  const submitDepartmentComplaint = (
    complaint: Omit<DepartmentComplaint, 'id' | 'createdAt' | 'updatedAt' | 'resolutionHistory'>
  ) => {
    const newComplaint: DepartmentComplaint = {
      ...complaint,
      id: `comp-${Date.now()}`,
      resolutionHistory: [
        {
          id: `step-${Date.now()}`,
          actionBy: complaint.submittedBy,
          actionDate: new Date().toISOString(),
          status: complaint.status || 'New',
          notes: 'Complaint logged to Departmental Issues & Escalation Register.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDepartmentComplaints((prev) => [newComplaint, ...prev]);
  };

  const updateComplaintStatus = (
    id: string,
    status: CentralComplaintStatus,
    notes: string,
    performedBy: string
  ) => {
    setDepartmentComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newStep = {
          id: `step-${Date.now()}`,
          actionBy: performedBy,
          actionDate: new Date().toISOString(),
          status,
          notes,
        };
        return {
          ...c,
          status,
          resolutionHistory: [...c.resolutionHistory, newStep],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addHODComplaintComment = (id: string, comment: string, performedBy: string) => {
    setDepartmentComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          hodComments: comment,
          hodReviewedAt: new Date().toISOString(),
          assignedOfficer: c.assignedOfficer || performedBy,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // ============================================================================
  // COORDINATED MONTHLY REPORTING FOR ALL UNITS
  // ============================================================================

  const saveMonthlyReport = (
    report: Omit<DepartmentMonthlyReport, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    if (report.id) {
      setMonthlyReports((prev) =>
        prev.map((r) =>
          r.id === report.id
            ? { ...r, ...report, updatedAt: new Date().toISOString() }
            : r
        )
      );
    } else {
      const newReport: DepartmentMonthlyReport = {
        ...report,
        id: `mrep-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMonthlyReports((prev) => [newReport, ...prev]);
    }
  };

  const submitMonthlyReport = (id: string, submittedBy: string) => {
    setMonthlyReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Submitted',
              submittedBy,
              submissionDate: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const reviewMonthlyReport = (
    id: string,
    status: MonthlyReportStatus,
    reviewNotes: string,
    reviewedBy: string
  ) => {
    setMonthlyReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              hodReviewNotes: reviewNotes,
              reviewedAt: new Date().toISOString(),
              reviewedBy,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  // HRD Office & Departmental Messaging Mutators
  const submitHRDMessage = (
    msg: Omit<HRDDepartmentalMessage, 'id' | 'referenceNumber' | 'submissionDate' | 'status' | 'responses' | 'createdAt' | 'updatedAt'>
  ): HRDDepartmentalMessage => {
    const count = hrdMessages.length + 1;
    const refNum = `HRD-MSG-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const newMsg: HRDDepartmentalMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      referenceNumber: refNum,
      submissionDate: now,
      status: 'New',
      responses: [],
      createdAt: now,
      updatedAt: now,
    };

    setHrdMessages((prev) => [newMsg, ...prev]);

    // If message is categorized as a Departmental Complaint or Operational Issue, mirror into complaints automatically
    if (msg.category === 'Departmental Complaint' || msg.category === 'Operational Issue') {
      submitDepartmentComplaint({
        submittedBy: msg.senderName,
        submittedByPhone: msg.senderPhone,
        submittedByRole: msg.senderRole,
        department: msg.senderDepartment,
        submissionDate: now.split('T')[0],
        category: msg.category,
        subject: msg.subject,
        description: msg.description,
        urgency: msg.urgency === 'Urgent' ? 'Critical' : msg.urgency,
        supportingEvidenceUrl: msg.attachmentUrl,
        status: 'New',
        isConfidential: true,
      });
    }

    return newMsg;
  };

  const updateHRDMessageStatus = (id: string, status: HRDMessageStatus, privateNotes?: string) => {
    setHrdMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status,
              ...(privateNotes !== undefined ? { privateNotes } : {}),
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );
  };

  const addHRDMessageResponse = (
    messageId: string,
    response: Omit<HRDMessageResponse, 'id' | 'timestamp'>,
    newStatus?: HRDMessageStatus
  ) => {
    const now = new Date().toISOString();
    const newResp: HRDMessageResponse = {
      ...response,
      id: `resp-${Date.now()}`,
      timestamp: now,
    };

    setHrdMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              status: newStatus || (response.isFromHRD ? 'Under Review' : 'Awaiting Response'),
              responses: [...m.responses, newResp],
              updatedAt: now,
            }
          : m
      )
    );
  };

  const assignHRDMessage = (id: string, assignedOfficer: string) => {
    setHrdMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              assignedOfficer,
              status: 'Under Review',
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );
  };

  // Leadership Meetings & Monthly Assemblies Mutators
  const addLeadershipMeeting = (meeting: Omit<LeadershipMeeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newMtg: LeadershipMeeting = {
      ...meeting,
      id: `lmtg-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setLeadershipMeetings((prev) => [newMtg, ...prev]);
  };

  const updateLeadershipMeeting = (id: string, updates: Partial<LeadershipMeeting>) => {
    setLeadershipMeetings((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );
  };

  const deleteLeadershipMeeting = (id: string) => {
    setLeadershipMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const updateActionPointStatus = (
    meetingId: string,
    actionPointId: string,
    status: 'Pending' | 'In Progress' | 'Completed'
  ) => {
    const now = new Date().toISOString();
    setLeadershipMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId || !m.actionPoints) return m;
        return {
          ...m,
          actionPoints: m.actionPoints.map((ap) =>
            ap.id === actionPointId
              ? {
                  ...ap,
                  status,
                  ...(status === 'Completed' ? { completedAt: now.split('T')[0] } : {}),
                }
              : ap
          ),
          updatedAt: now,
        };
      })
    );
  };

  // Reset to initial seed data
  const resetToInitialData = () => {
    if (confirm('Are you sure you want to reset all portal data to the Dominion City Asaba initial data?')) {
      setMembers(INITIAL_MEMBERS);
      setLostItems(INITIAL_LOST_ITEMS);
      setAnnouncements(INITIAL_ANNOUNCEMENTS);
      setCells(INITIAL_CELLS);
      setSatellites(INITIAL_SATELLITE_CHURCHES);
      setDressCodes(INITIAL_DRESS_CODES);
      setRosters(INITIAL_ROSTERS);
      setMeetings(INITIAL_MEETINGS);
      setReports(INITIAL_REPORTS);
      setCollections(INITIAL_COLLECTIONS);
      setCollectionEntries(INITIAL_COLLECTION_ENTRIES);
      setTransactions(INITIAL_TRANSACTIONS);
      setBudgetNeeds(INITIAL_BUDGET_NEEDS);
      setBooks(INITIAL_BOOKS);
      setStockMovements(INITIAL_STOCK_MOVEMENTS);
      setSales(INITIAL_SALES);
      setBookstandDutySessions(INITIAL_BOOKSTAND_DUTY_SESSIONS);
      setBookstandExpenses(INITIAL_BOOKSTAND_EXPENSES);
      setHandbook(INITIAL_HANDBOOK);
      setAttendance(INITIAL_ATTENDANCE);
      setFinalizedAttendance(INITIAL_FINALIZED_ATTENDANCE);
      setAbsenceFollowUps(INITIAL_ABSENCE_FOLLOW_UPS);
      setChurchLocationConfig(DEFAULT_CHURCH_LOCATION);
      setBirthdayCelebrations(INITIAL_BIRTHDAY_CELEBRATIONS);
      setBirthdayTemplates(INITIAL_BIRTHDAY_TEMPLATES);
      setShareHistory(INITIAL_SHARE_HISTORY);
      setDepartmentEvents(INITIAL_DEPARTMENT_EVENTS);
      setChurchProgrammes(INITIAL_CHURCH_PROGRAMMES);
      setDepartmentReminders(INITIAL_DEPARTMENT_REMINDERS);
      setWelfareTeam(INITIAL_WELFARE_TEAM);
      setWelfareFollowUps(INITIAL_WELFARE_FOLLOW_UPS);
      setWelfareCases(INITIAL_WELFARE_CASES);
      setVisitations(INITIAL_VISITATIONS);
      setDepartmentComplaints(INITIAL_DEPARTMENT_COMPLAINTS);
      setMonthlyReports(INITIAL_MONTHLY_REPORTS);
      setHrdMessages(INITIAL_HRD_MESSAGES);
      setLeadershipMeetings(INITIAL_LEADERSHIP_MEETINGS);
      alert('System data reset successfully to initial Dominion City Asaba dataset.');
    }
  };

  // Export all data as JSON backup
  const exportAllDataAsJSON = () => {
    const backupData = {
      system: 'Dominion City Asaba Information Desk Management System',
      backupDate: new Date().toISOString(),
      version: '1.0.0',
      data: {
        members,
        lostItems,
        announcements,
        cells,
        satellites,
        dressCodes,
        rosters,
        meetings,
        reports,
        collections,
        collectionEntries,
        transactions,
        budgetNeeds,
        books,
        stockMovements,
        sales,
        handbook,
        attendance,
        departmentEvents,
        churchProgrammes,
        departmentReminders,
        welfareTeam,
        welfareFollowUps,
        welfareCases,
        visitations,
        departmentComplaints,
        monthlyReports,
        hrdMessages,
        leadershipMeetings,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DominionCity_Asaba_InfoDesk_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import data from JSON backup
  const importDataFromJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.data) {
        alert('Invalid backup file structure: missing data payload.');
        return false;
      }
      const d = parsed.data;
      if (d.members) setMembers(d.members);
      if (d.lostItems) setLostItems(d.lostItems);
      if (d.announcements) setAnnouncements(d.announcements);
      if (d.cells) setCells(d.cells);
      if (d.satellites) setSatellites(d.satellites);
      if (d.dressCodes) setDressCodes(d.dressCodes);
      if (d.rosters) setRosters(d.rosters);
      if (d.meetings) setMeetings(d.meetings);
      if (d.reports) setReports(d.reports);
      if (d.collections) setCollections(d.collections);
      if (d.collectionEntries) setCollectionEntries(d.collectionEntries);
      if (d.transactions) setTransactions(d.transactions);
      if (d.budgetNeeds) setBudgetNeeds(d.budgetNeeds);
      if (d.books) setBooks(d.books);
      if (d.stockMovements) setStockMovements(d.stockMovements);
      if (d.sales) setSales(d.sales);
      if (d.bookstandDutySessions) setBookstandDutySessions(d.bookstandDutySessions);
      if (d.bookstandExpenses) setBookstandExpenses(d.bookstandExpenses);
      if (d.handbook) setHandbook(d.handbook);
      if (d.attendance) setAttendance(d.attendance);
      if (d.departmentEvents) setDepartmentEvents(d.departmentEvents);
      if (d.churchProgrammes) setChurchProgrammes(d.churchProgrammes);
      if (d.departmentReminders) setDepartmentReminders(d.departmentReminders);
      if (d.welfareTeam) setWelfareTeam(d.welfareTeam);
      if (d.welfareFollowUps) setWelfareFollowUps(d.welfareFollowUps);
      if (d.welfareCases) setWelfareCases(d.welfareCases);
      if (d.visitations) setVisitations(d.visitations);
      if (d.departmentComplaints) setDepartmentComplaints(d.departmentComplaints);
      if (d.monthlyReports) setMonthlyReports(d.monthlyReports);
      if (d.hrdMessages) setHrdMessages(d.hrdMessages);
      if (d.leadershipMeetings) setLeadershipMeetings(d.leadershipMeetings);

      alert('Backup restored successfully!');
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      alert('Error parsing JSON backup file. Please verify file integrity.');
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        members,
        lostItems,
        announcements,
        cells,
        satellites,
        dressCodes,
        rosters,
        meetings,
        reports,
        collections,
        collectionEntries,
        transactions,
        budgetNeeds,
        books,
        stockMovements,
        sales,
        bookstandDutySessions,
        bookstandExpenses,
        bookstandActivities,
        bookstandComplaints,
        handbook,
        attendance,
        finalizedAttendance,
        absenceFollowUps,

        addMember,
        updateMember,
        deleteMember,

        addLostItem,
        updateLostItem,
        claimLostItem,
        returnLostItem,
        deleteLostItem,

        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,

        addCell,
        updateCell,
        deleteCell,

        addSatellite,
        updateSatellite,
        deleteSatellite,

        addDressCode,
        updateDressCode,
        deleteDressCode,
        publishDressCode,
        archiveDressCode,

        addRoster,
        updateRoster,
        deleteRoster,

        addMeeting,
        updateMeeting,
        deleteMeeting,

        addReport,
        updateReport,
        deleteReport,

        addCollection,
        updateCollection,
        addCollectionEntry,

        addTransaction,
        deleteTransaction,

        addBudgetNeed,
        updateBudgetNeed,

        addBook,
        updateBook,
        deleteBook,
        recordBookSale,
        recordDebtPayment,
        addStockMovement,
        startBookstandDutySession,
        endBookstandDutySession,
        addBookstandExpense,
        deleteBookstandExpense,
        addBookstandActivity,
        addBookstandComplaint,
        updateBookstandComplaintStatus,
        addBookstandComplaintComment,

        reportCategories,
        addReportCategory,
        deleteReportCategory,

        tableDocuments,
        addTableDocument,
        updateTableDocument,
        deleteTableDocument,

        addHandbookEntry,
        updateHandbookEntry,
        deleteHandbookEntry,

        addAttendanceRecord,
        deleteAttendanceRecord,
        updateAttendanceRecord,
        clockOutAttendanceRecord,
        finalizeAttendance,
        reopenAttendance,
        addAbsenceFollowUp,
        updateAbsenceFollowUp,
        churchLocationConfig,
        updateChurchLocationConfig,

        // Birthday Customisation
        birthdayCelebrations,
        birthdayTemplates,
        saveBirthdayCelebration,
        updateBirthdayCelebration,
        deleteBirthdayCelebration,
        saveBirthdayTemplate,
        deleteBirthdayTemplate,

        // Global Sharing
        shareHistory,
        addShareHistoryEntry,
        updateShareHistoryStatus,
        deleteShareHistoryEntry,

        // Secretary Coordination & Events Management
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

        // Dedicated Welfare Department
        welfareTeam,
        addWelfareTeamMember,
        updateWelfareTeamMember,
        removeWelfareTeamMember,
        welfareFollowUps,
        recordWelfareFollowUp,
        updateWelfareFollowUp,
        welfareCases,
        addWelfareCase,
        updateWelfareCase,
        escalateWelfareCaseToHOD,
        respondToWelfareEscalation,
        visitations,
        addVisitationSchedule,
        updateVisitationSchedule,
        completeVisitation,

        // Central Complaints & Escalations
        departmentComplaints,
        submitDepartmentComplaint,
        updateComplaintStatus,
        addHODComplaintComment,

        // Coordinated Unit Monthly Reports
        monthlyReports,
        saveMonthlyReport,
        submitMonthlyReport,
        reviewMonthlyReport,

        // HRD Office & Departmental Messages
        hrdMessages,
        submitHRDMessage,
        updateHRDMessageStatus,
        addHRDMessageResponse,
        assignHRDMessage,

        // Leadership Meetings & Monthly Assemblies (HRD Office)
        leadershipMeetings,
        addLeadershipMeeting,
        updateLeadershipMeeting,
        deleteLeadershipMeeting,
        updateActionPointStatus,

        resetToInitialData,
        exportAllDataAsJSON,
        importDataFromJSON,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
