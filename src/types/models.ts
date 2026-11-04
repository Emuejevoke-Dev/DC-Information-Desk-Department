export type UserRole =
  | 'system_admin'
  | 'department_leader'
  | 'operations_officer'
  | 'secretary'
  | 'finance_officer'
  | 'bookstand_officer'
  | 'welfare_officer'
  | 'general_member'
  | 'leadership_forum'
  | 'public_visitor';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  departmentRole: string;
  permissions?: string[];
  lastLoginAt?: string;
}

export type LostItemStatus = 'Unclaimed' | 'Claimed' | 'Returned';
export type ItemCategory = 'Bibles & Books' | 'Phones & Electronics' | 'Bags & Purses' | 'Jewelry & Watches' | 'Clothing & Shawls' | 'Keys & IDs' | 'Baby Items' | 'Other';

export interface LostItemHistory {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  notes?: string;
}

export interface LostItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  photoUrl: string;
  dateFound: string;
  timeFound: string;
  locationFound: string;
  reportingWing?: 'Desk A — Left Wing' | 'Desk B — Right Wing';
  dateReceived: string;
  recordedBy: string;
  status: LostItemStatus;
  recoveryDate?: string;
  collectedBy?: string;
  collectorPhone?: string;
  officerWitness?: string;
  notes?: string;
  history: LostItemHistory[];
  isPubliclyVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentMember {
  id: string;
  fullName: string;
  photoUrl: string;
  birthDay: number; // 1-31
  birthMonth: number; // 1-12
  birthYear?: number;
  dateOfBirth?: string; // YYYY-MM-DD
  departmentRole: string; // e.g. "Front Desk Coordinator", "Cell Liaison", "Bookstand Officer"
  occupation?: string;
  phone: string;
  email: string;
  residentialArea: string; // Asaba neighborhood
  cell?: string; // Cell fellowship (e.g. "Summit Cell A", "Okpanam Cell 1")
  satelliteChurch?: string; // Satellite church branch (e.g. "DC Headquarters, Asaba", "DC Okpanam")
  status: 'Active' | 'Inactive';
  serviceUnit?: string;
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementCategory = 'General Announcement' | 'Urgent Meeting' | 'Service Notification' | 'Department News' | 'Upcoming Event';
export type AnnouncementStatus = 'Published' | 'Draft' | 'Archived';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  category: AnnouncementCategory;
  coverPhoto?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  organizer?: string;
  author: string;
  status: AnnouncementStatus;
  isUrgent: boolean;
  meetingDetails?: {
    date: string;
    time: string;
    venue: string;
    instructions: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CellMeeting {
  id: string;
  cellName: string;
  leaderName: string;
  leaderPhone: string;
  leaderPhoto?: string;
  neighborhood: string; // Asaba areas like "Okpanam Road", "Summit", "GRA Phase 1", "Cable Point"
  locationAddress: string;
  meetingDay: string; // "Wednesday", "Sunday"
  meetingTime: string; // e.g., "6:00 PM"
  format: 'Physical' | 'Online' | 'Hybrid';
  directions: string;
  landmarks?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface SatelliteChurch {
  id: string;
  name: string;
  residentPastor: string;
  pastorPhone: string;
  pastorPhoto?: string;
  venue: string;
  neighborhood: string;
  sundayServiceTimes: string;
  midweekServiceTimes: string;
  directions: string;
  landmarks?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface HandbookEntry {
  id: string;
  title: string;
  category: 'SOP' | 'Desk Guidelines' | 'Contacts' | 'Church Directory' | 'FAQs';
  content: string;
  fileAttachment?: string;
  status?: 'Published' | 'Draft';
  lastUpdatedBy: string;
  updatedAt: string;
}

export type DressCodeStatus = 'Draft' | 'Published' | 'Archived';

export interface DressCode {
  id: string;
  sundayDate: string; // YYYY-MM-DD
  themeTitle: string; // e.g. "Corporate Royal Blue & White"
  primaryColors: string[];
  description: string;
  mensOutfit?: string;
  womensOutfit?: string;
  accessories?: string;
  footwear?: string;
  status?: DressCodeStatus; // Draft | Published | Archived
  photoUrl?: string;
  mensPhotoUrl?: string;
  womensPhotoUrl?: string;
  specialInstructions?: string;
  rosterLinkedId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RosterDuty {
  memberId: string;
  memberName: string;
  dutyRole: string; // e.g. "Desk Lead", "Visitor Enquiries", "First Timers Welcome", "Bookstand Help"
}

export interface ServiceRoster {
  id: string;
  serviceDate: string; // YYYY-MM-DD
  serviceType: 'Sunday 1st Service' | 'Sunday 2nd Service' | 'Tuesday Word & Communion' | 'Special Meeting';
  teamLeader: string;
  prayerLeader: string;
  assignments: RosterDuty[];
  notes?: string;
  dressCodeId?: string;
  status: 'Scheduled' | 'Completed' | 'Draft';
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentMeeting {
  id: string;
  title: string;
  organizer: string;
  date: string;
  time: string;
  venue: string; // e.g. "Main Auditorium - Left Wing" or "Zoom"
  agenda: string[];
  notes?: string;
  attendeesCount?: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  isRecurring: boolean; // e.g. 1st/3rd Sunday or Thursday 9 PM prayer
  createdAt: string;
}

export interface ServiceReport {
  id: string;
  title?: string;
  serviceDate: string; // YYYY-MM-DD (Sunday)
  serviceType: 'Sunday 1st Service' | 'Sunday 2nd Service' | 'Tuesday Word & Communion' | 'Special Programme';
  reportingWing: 'Desk A — Left Wing' | 'Desk B — Right Wing';
  servingStation?: 'Desk A' | 'Desk B';
  reportingMemberId?: string;
  reportingMemberName?: string;
  reportingMemberPhoto?: string;
  peopleAttendedCount?: number; // Number of people attended to by this officer
  deskAttendanceCount: number; // Backward compatibility with existing views
  inquiriesReceived?: string; // Inquiries received description
  inquiriesHandled: number;
  cellConnectionsCount: number;
  lostItemsLogged: number;
  customMetrics?: Record<string, number>;
  activitiesCarriedOut: string;
  observations: string;
  issuesEncountered: string;
  challenges?: string;
  additionalComments?: string;
  followUpActions: string;
  attachments?: string[];
  submittedBy: string;
  submittedAt?: string;
  status: 'Draft' | 'Submitted';
  createdAt: string;
  updatedAt: string;
}

export interface FinalizedAttendanceReport {
  id: string;
  serviceDate: string;
  serviceType: ServiceType;
  closedAt: string;
  closedBy: string;
  totalEligible: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  lateCount: number;
  attendanceRate: number;
  presentMemberIds: string[];
  absentMemberIds: string[];
  notes?: string;
  isReopened?: boolean;
}

export interface AbsenceFollowUp {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone?: string;
  photoUrl?: string;
  serviceDate: string;
  serviceType: string;
  status: 'Pending' | 'Contacted' | 'Completed';
  contactedBy?: string;
  contactedAt?: string;
  notes?: string;
  reasonProvided?: string;
  messagePreview?: string;
}

export type FieldType = 'text' | 'number' | 'phone' | 'email' | 'date' | 'select' | 'textarea';

export interface CollectionField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For select type
  placeholder?: string;
}

export interface InformationCollection {
  id: string;
  title: string;
  description: string;
  requestedBy: string; // e.g. "Resident Pastor", "HOD Information Desk"
  purpose: string;
  deadline?: string;
  fields: CollectionField[];
  status: 'Open' | 'Closed' | 'Archived';
  entriesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionEntry {
  id: string;
  collectionId: string;
  data: Record<string, string | number>;
  submittedBy: string;
  submittedAt: string;
}

export interface TableDocumentRow {
  id: string;
  sn: number;
  values: Record<string, string>;
}

export interface TableDocument {
  id: string;
  title: string;
  department: string;
  date: string;
  optionalInfo?: string;
  columns: string[]; // e.g. ["Name", "Surname", "Type of Document"]
  rows: TableDocumentRow[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type TransactionType = 'Income' | 'Expense';
export type TransactionCategory =
  | 'Member Monthly Dues'
  | 'Love Offering & Donations'
  | 'Special Project Contributions'
  | 'Desk Stationery & Printing'
  | 'Uniforms & Badges'
  | 'Department Welfare & Hospitality'
  | 'Event Logistics'
  | 'Equipment & Maintenance'
  | 'Other';

export interface FinancialTransaction {
  id: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number; // In Nigerian Naira (NGN)
  description: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'POS' | 'Other';
  receiptNumber?: string;
  recordedBy: string;
  supportingDocUrl?: string;
  createdAt: string;
}

export interface DepartmentBudgetNeed {
  id: string;
  description: string;
  estimatedCost: number; // NGN
  amountRaised: number; // NGN
  priority: 'High' | 'Medium' | 'Low';
  targetDate: string;
  status: 'Planned' | 'In Progress' | 'Fulfilled' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: 'Spiritual Growth' | 'Leadership' | 'Prayer & Fasting' | 'Purpose & Destiny' | 'Finance & Stewardship' | 'Relationships';
  coverPhoto: string;
  costPrice: number; // NGN
  sellingPrice: number; // NGN
  openingStock: number;
  stockReceived: number;
  quantitySold: number;
  returns: number;
  damagedOrMissing: number;
  currentStock: number;
  reorderThreshold: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  bookId: string;
  bookTitle: string;
  type: 'Stock Delivery' | 'Sale' | 'Customer Return' | 'Damaged/Missing' | 'Manual Adjustment';
  quantity: number;
  reason: string;
  recordedBy: string;
  date: string;
  createdAt: string;
}

export interface DebtPaymentRecord {
  id: string;
  date: string;
  amount: number;
  recordedBy: string;
  receiptNumber?: string;
}

export interface BookSale {
  id: string;
  saleDate: string;
  items: Array<{
    bookId: string;
    bookTitle: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  totalAmount: number;
  amountPaid: number;
  outstandingDebt: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
  customerName: string;
  customerPhone?: string;
  serviceType?: string;
  recordedBy: string;
  payments: DebtPaymentRecord[];
  notes?: string;
  createdAt: string;
}

export interface BookstandDutySession {
  id: string;
  officiatingName: string;
  officiatingPhone?: string;
  officiatingMemberId?: string;
  serviceDate: string; // YYYY-MM-DD
  serviceType: string; // 'Sunday 1st Service' | 'Sunday 2nd Service' | 'Tuesday Word & Communion' | 'Special Programme'
  signedInAt: string; // ISO
  signedOutAt?: string;
  openingNotes?: string;
  handoverNotes?: string;
  status: 'Active' | 'Completed';
  initialCountVerified?: boolean;
  totalUnitsSold?: number;
  totalSalesAmount?: number;
  activitiesCount?: number;
  complaintsCount?: number;
}

export type BookstandActivityType =
  | 'Sale'
  | 'Issue'
  | 'Adjustment'
  | 'Stock Count'
  | 'Correction'
  | 'Handover'
  | 'General';

export interface BookstandActivityEntry {
  id: string;
  sessionId: string;
  serviceDate: string;
  serviceType: string;
  officiatingMember: string;
  timestamp: string;
  activityType: BookstandActivityType;
  description: string;
  bookId?: string;
  bookTitle?: string;
  quantity?: number;
  amount?: number;
  customerName?: string;
  notes?: string;
}

export type BookstandComplaintStatus = 'Open' | 'Acknowledged' | 'Under Review' | 'Resolved';

export interface BookstandComplaintComment {
  id: string;
  commentBy: string;
  timestamp: string;
  message: string;
}

export interface BookstandComplaint {
  id: string;
  sessionId: string;
  serviceDate: string;
  serviceType: string;
  submittedBy: string;
  submittedByPhone?: string;
  submittedAt: string;
  category:
  | 'Transaction Error'
  | 'Missing Item'
  | 'Quantity Discrepancy'
  | 'Handover Issue'
  | 'Operational Problem'
  | 'Observation';
  subject: string;
  description: string;
  photoUrl?: string;
  status: BookstandComplaintStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  followUpComments: BookstandComplaintComment[];
}

export interface BookstandExpense {
  id: string;
  date: string; // YYYY-MM-DD
  month: string; // e.g. "2026-11"
  category:
  | 'Restock Transport & Logistics'
  | 'Packing Bags & Envelopes'
  | 'Book Display & Stand Repairs'
  | 'Bank & POS Terminal Charges'
  | 'Desk Petty Cash & Refreshment'
  | 'Miscellaneous Publishing Expense';
  description: string;
  amount: number;
  receiptRef?: string;
  recordedBy: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  category: 'birthday' | 'dress_code' | 'prayer_meeting' | 'urgent_meeting' | 'low_stock' | 'roster' | 'system';
  timestamp: string;
  read: boolean;
  linkUrl?: string;
}

export type ServiceType =
  | 'Sunday 1st Service'
  | 'Sunday 2nd Service'
  | 'Tuesday Word & Communion'
  | 'Thursday Prayer Meeting'
  | 'Special Meeting';

export type AttendanceStatus = 'Present' | 'Late' | 'Excused' | 'Clocked Out';

export interface AttendanceRecord {
  id: string;
  memberId?: string;
  memberName: string;
  memberPhone?: string;
  departmentRole?: string;
  photoUrl?: string;
  serviceDate: string; // YYYY-MM-DD
  clockInTime: string; // e.g. "07:42:15 AM"
  clockOutTime?: string; // e.g. "01:15:00 PM"
  serviceType: ServiceType;
  status: AttendanceStatus;
  servingStation?: 'Desk A' | 'Desk B' | 'Bookstand';
  verifiedLocation: boolean;
  distanceFromChurchMeters?: number;
  latitude?: number;
  longitude?: number;
  deviceInfo?: string;
  notes?: string;
  markedBy: string;
  isManualOverride?: boolean;
  createdAt: string;
}

export interface ChurchLocationConfig {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  lastUpdatedBy?: string;
  updatedAt?: string;
}

export type BirthdayTheme = 'gold' | 'rose' | 'navy' | 'emerald' | 'sunset' | 'purple';

export interface BirthdayCelebration {
  id: string;
  memberId: string;
  celebrantName: string;
  birthdayDate: string; // YYYY-MM-DD or MM-DD
  greeting: string;
  prayers: string[];
  theme: BirthdayTheme;
  photoUrl: string;
  caption: string;
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BirthdayTemplate {
  id: string;
  title: string;
  greeting: string;
  prayers: string[];
  theme: BirthdayTheme;
  caption: string;
}

export type ShareDocumentType =
  | 'Financial Report'
  | 'Financial Audit'
  | 'Service Report'
  | 'Custom Information Form'
  | 'Event Registration'
  | 'Attendance Register'
  | 'Birthday Post'
  | 'Other';

export type ShareStatus =
  | 'Prepared'
  | 'WhatsApp opened'
  | 'Confirmed shared'
  | 'Pending confirmation';

export interface ShareHistoryEntry {
  id: string;
  documentType: ShareDocumentType;
  documentTitle: string;
  recipientName: string;
  recipientPhone: string;
  date: string;
  sharedBy: string;
  status: ShareStatus;
  notes?: string;
}

// ============================================================================
// SECRETARY COORDINATION & EVENTS MANAGEMENT MODELS
// ============================================================================

export type DepartmentEventStatus = 'Draft' | 'Published' | 'Cancelled' | 'Completed';

export interface DepartmentEvent {
  id: string;
  title: string;
  description: string;
  category: 'Department Meeting' | 'Training & Workshop' | 'Outreach & Visitation' | 'Church Service' | 'Special Celebration' | 'Rehearsal';
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:00 AM"
  venue: string;
  flyerUrl?: string;
  instructions?: string;
  targetAudience: 'All Department Members' | 'Desk Officers Only' | 'Leadership Team' | 'Church Public';
  status: DepartmentEventStatus;
  isPinned: boolean;
  scheduledPublishDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ProgrammeType =
  | 'Sunday 1st Service'
  | 'Sunday 2nd Service'
  | 'Tuesday Word & Communion'
  | 'Departmental Meeting'
  | 'Special Programme'
  | 'Training Session'
  | 'Visitation Schedule'
  | 'Other Activity';

export interface ChurchProgramme {
  id: string;
  title: string;
  programmeType: ProgrammeType;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "08:00 AM - 10:30 AM"
  venue: string;
  description: string;
  orderOfService?: Array<{
    time?: string;
    item: string;
    ministerOrLead?: string;
    duration?: string;
  }>;
  attachmentUrl?: string;
  attachmentName?: string;
  isPublished: boolean;
  publishedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ReminderCategory =
  | 'Departmental Meeting'
  | 'Upcoming Service'
  | 'Event'
  | 'Monthly Contribution'
  | 'Report Submission Deadline'
  | 'Birthday Preparation'
  | 'Visitation Activity'
  | 'Important Responsibility';

export interface DepartmentReminder {
  id: string;
  title: string;
  description: string;
  category: ReminderCategory;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  assignedTo: string; // e.g. "All Department Members", "Desk Officers", "Welfare Team", or specific member name
  isPinned: boolean;
  expiryDate: string; // YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  createdBy: string;
  createdAt: string;
}

// ============================================================================
// DEDICATED WELFARE DEPARTMENT MODELS
// ============================================================================

export interface WelfareTeamMember {
  id: string;
  memberId: string; // Links to DepartmentMember
  fullName: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  assignedResponsibilities: string[]; // e.g. ["Sunday Absentees", "Hospital Visitation", "Midweek Follow-Up", "Family Welfare"]
  status: 'Active' | 'Inactive';
  addedAt: string;
  updatedAt: string;
}

export type WelfareFollowUpStatus =
  | 'Not Contacted'
  | 'Contact Attempted'
  | 'Contacted'
  | 'Awaiting Response'
  | 'Reason Received'
  | 'Visitation Recommended'
  | 'Visitation Scheduled'
  | 'Follow-up Completed';

export interface WelfareFollowUpLog {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  photoUrl?: string;
  serviceDate: string; // YYYY-MM-DD
  serviceType: ServiceType;
  cellOrSatellite?: string;
  contactDate: string;
  contactTime: string;
  contactMethod: 'Phone Call' | 'WhatsApp' | 'SMS' | 'Physical Visit';
  responded: boolean;
  reasonForAbsence?: string;
  concernsRaised?: string;
  recommendedAction: string;
  officerName: string;
  status: WelfareFollowUpStatus;
  notes?: string;
  createdAt: string;
}

export type WelfareCaseCategory =
  | 'Illness'
  | 'Bereavement'
  | 'Financial Assistance Request'
  | 'Family Emergency'
  | 'Prolonged Absence'
  | 'Personal Welfare Concern';

export type WelfareCaseUrgency = 'Low' | 'Medium' | 'High' | 'Emergency';

export type WelfareCaseStatus =
  | 'New'
  | 'Under Review'
  | 'Follow-up Required'
  | 'Visitation Recommended'
  | 'Visitation Scheduled'
  | 'Referred to HOD'
  | 'Resolved';

export interface WelfareCase {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone?: string;
  photoUrl?: string;
  category: WelfareCaseCategory;
  description: string;
  urgency: WelfareCaseUrgency;
  recommendedAction: string;
  handlingOfficer: string;
  followUpDate: string;
  status: WelfareCaseStatus;
  isEscalatedToHOD: boolean;
  escalationNotes?: string;
  escalatedAt?: string;
  hodNotes?: string;
  hodReviewedAt?: string;
  supportAssistanceDetails?: {
    assistanceType: string;
    requestedDate: string;
    referralStatus: 'Referred to HOD' | 'Approved by Leadership' | 'Completed' | 'Deferred';
    outcomeNotes?: string;
  };
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type VisitationStatus = 'Scheduled' | 'Completed' | 'Overdue' | 'Cancelled';

export interface VisitationSchedule {
  id: string;
  memberId: string;
  memberName: string;
  memberAddress: string;
  memberPhone?: string;
  photoUrl?: string;
  reason: string;
  assignedTeamMemberIds: string[];
  assignedTeamMemberNames: string[];
  visitDate: string; // YYYY-MM-DD
  visitTime: string; // e.g. "04:30 PM"
  instructions?: string;
  isPinned: boolean;
  pinnedExpiryDays?: number; // 1, 2, 3 or custom
  pinnedExpiryDate?: string; // YYYY-MM-DD
  outcome?: string;
  followUpVisitNeeded: boolean;
  followUpVisitDate?: string;
  status: VisitationStatus;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CENTRAL COMPLAINTS & ESCALATION SYSTEM
// ============================================================================

export type DepartmentUnitType =
  | 'Secretary'
  | 'Welfare'
  | 'Bookstand'
  | 'Uniform'
  | 'Finance'
  | 'Attendance & Service Reporting'
  | 'Front Desk General';

export type CentralComplaintStatus =
  | 'New'
  | 'Under Review'
  | 'Assigned'
  | 'Awaiting Action'
  | 'Awaiting Information'
  | 'Escalated'
  | 'Resolved'
  | 'Closed';

export interface ComplaintResolutionStep {
  id: string;
  actionBy: string;
  actionDate: string;
  status: CentralComplaintStatus;
  notes: string;
}

export interface DepartmentComplaint {
  id: string;
  referenceNumber?: string;
  submittedBy: string;
  submittedByPhone?: string;
  submittedByRole?: string;
  department: DepartmentUnitType;
  submissionDate: string; // YYYY-MM-DD
  category: string;
  subject: string;
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  supportingEvidenceUrl?: string;
  assignedOfficer?: string;
  status: CentralComplaintStatus;
  hodComments?: string;
  hodReviewedAt?: string;
  resolutionHistory: ComplaintResolutionStep[];
  isConfidential?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// COORDINATED MONTHLY REPORTING FOR ALL DEPARTMENTAL UNITS
// ============================================================================

export type MonthlyReportStatus =
  | 'Not Started'
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Reviewed'
  | 'Returned for Correction'
  | 'Resubmitted';

export interface DepartmentMonthlyReport {
  id: string;
  departmentUnit: DepartmentUnitType;
  reportingMonth: string; // YYYY-MM (e.g. "2026-11")
  submittedBy: string;
  submittedByRole: string;
  submissionDate: string; // YYYY-MM-DD
  status: MonthlyReportStatus;
  activitiesCarriedOut: string;
  workCompleted: string;
  importantStatistics: Record<string, string | number>;
  challengesEncountered: string;
  complaintsOrIssues: string;
  recommendations: string;
  outstandingResponsibilities: string;
  activitiesPlannedNextMonth: string;
  hodReviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// HRD OFFICE & DEPARTMENTAL MESSAGING SYSTEM
// ============================================================================

export type HRDMessageCategory =
  | 'General Message'
  | 'Departmental Complaint'
  | 'Operational Issue'
  | 'Request for Assistance'
  | 'Suggestion or Recommendation'
  | 'Welfare Concern'
  | 'Bookstand Issue'
  | 'Uniform Issue'
  | 'Financial/Administrative Concern'
  | 'Urgent Matter'
  | 'Other';

export type HRDMessageStatus =
  | 'New'
  | 'Unread'
  | 'Read'
  | 'Under Review'
  | 'Awaiting Response'
  | 'Follow-up Required'
  | 'Escalated'
  | 'Resolved'
  | 'Closed';

export interface HRDMessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  isFromHRD: boolean;
  message: string;
  timestamp: string;
  attachmentUrl?: string;
}

export interface HRDDepartmentalMessage {
  id: string;
  referenceNumber: string; // e.g. "HRD-MSG-2026-0042"
  senderId: string;
  senderName: string;
  senderDepartment: DepartmentUnitType;
  senderRole: string;
  senderPhone?: string;
  senderEmail?: string;
  subject: string;
  category: HRDMessageCategory;
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  attachmentUrl?: string;
  submissionDate: string; // ISO string
  status: HRDMessageStatus;
  privateNotes?: string;
  assignedOfficer?: string;
  responses: HRDMessageResponse[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// LEADERSHIP MEETINGS & MONTHLY ASSEMBLIES (HRD OFFICE)
// ============================================================================

export interface LeadershipActionPoint {
  id: string;
  action: string;
  assignedTo: string;
  assignedRole?: string;
  deadline: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  completedAt?: string;
}

export interface LeadershipMeetingAttendance {
  memberId: string;
  memberName: string;
  role: string;
  present: boolean;
}

export interface LeadershipMeeting {
  id: string;
  title: string;
  meetingType: 'Leadership Meeting' | 'Monthly Departmental Assembly' | 'Prayer & Intercession' | 'Emergency Council';
  date: string;
  time: string;
  venue: string;
  organizer: string;
  announcements?: string[];
  agendas: string[];
  attendeesCount?: number;
  attendanceList?: LeadershipMeetingAttendance[];
  summary?: string;
  decisions?: string[];
  actionPoints?: LeadershipActionPoint[];
  followUpDeadline?: string;
  status: 'Scheduled' | 'Completed' | 'Adjourned' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}




