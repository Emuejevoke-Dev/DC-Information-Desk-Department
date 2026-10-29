export type UserRole =
  | 'system_admin'
  | 'department_leader'
  | 'secretary'
  | 'finance_officer'
  | 'bookstand_officer'
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
  departmentRole: string; // e.g. "Front Desk Coordinator", "Cell Liaison", "Bookstand Officer"
  occupation?: string;
  phone: string;
  email: string;
  residentialArea: string; // Asaba neighborhood
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
  serviceDate: string;
  serviceType: 'Sunday 1st Service' | 'Sunday 2nd Service' | 'Tuesday Word & Communion' | 'Special Programme';
  reportingWing: 'Desk A — Left Wing' | 'Desk B — Right Wing';
  deskAttendanceCount: number;
  inquiriesHandled: number;
  cellConnectionsCount: number;
  lostItemsLogged: number;
  activitiesCarriedOut: string;
  observations: string;
  issuesEncountered: string;
  challenges?: string;
  followUpActions: string;
  attachments?: string[];
  submittedBy: string;
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
  recordedBy: string;
  payments: DebtPaymentRecord[];
  notes?: string;
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

export type AttendanceStatus = 'Present' | 'Late' | 'Excused';

export interface AttendanceRecord {
  id: string;
  memberId?: string;
  memberName: string;
  memberPhone?: string;
  departmentRole?: string;
  photoUrl?: string;
  serviceDate: string; // YYYY-MM-DD
  clockInTime: string; // e.g. "07:42:15 AM"
  serviceType: ServiceType;
  status: AttendanceStatus;
  verifiedLocation: boolean;
  distanceFromChurchMeters?: number;
  latitude?: number;
  longitude?: number;
  deviceInfo?: string;
  notes?: string;
  markedBy: string;
  createdAt: string;
}

