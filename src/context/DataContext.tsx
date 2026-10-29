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
  SatelliteChurch,
  ServiceReport,
  ServiceRoster,
  StockMovement,
  Announcement,
  AttendanceRecord,
  FinalizedAttendanceReport,
  AbsenceFollowUp,
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
  handbook: HandbookEntry[];
  attendance: AttendanceRecord[];
  finalizedAttendance: FinalizedAttendanceReport[];
  absenceFollowUps: AbsenceFollowUp[];

  // Mutators
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
  deleteAttendanceRecord: (id: string) => void;
  updateAttendanceRecord: (id: string, record: Partial<AttendanceRecord>) => void;
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
  recordBookSale: (sale: Omit<BookSale, 'id' | 'createdAt' | 'payments'>, initialPayment?: number) => void;
  recordDebtPayment: (saleId: string, amount: number, recordedBy: string, receiptNumber?: string) => void;
  addStockMovement: (sm: Omit<StockMovement, 'id' | 'createdAt'>) => void;

  addHandbookEntry: (hb: Omit<HandbookEntry, 'id' | 'updatedAt'>) => void;
  updateHandbookEntry: (id: string, hb: Partial<HandbookEntry>) => void;
  deleteHandbookEntry: (id: string) => void;

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
      setHandbook(INITIAL_HANDBOOK);
      setAttendance(INITIAL_ATTENDANCE);
      setFinalizedAttendance(INITIAL_FINALIZED_ATTENDANCE);
      setAbsenceFollowUps(INITIAL_ABSENCE_FOLLOW_UPS);
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
      if (d.handbook) setHandbook(d.handbook);
      if (d.attendance) setAttendance(d.attendance);

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
        recordBookSale,
        recordDebtPayment,
        addStockMovement,

        addHandbookEntry,
        updateHandbookEntry,
        deleteHandbookEntry,

        addAttendanceRecord,
        deleteAttendanceRecord,
        updateAttendanceRecord,
        finalizeAttendance,
        reopenAttendance,
        addAbsenceFollowUp,
        updateAbsenceFollowUp,

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
