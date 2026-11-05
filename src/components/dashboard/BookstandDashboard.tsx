import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatNaira } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { BookCoverUploadInput } from '../bookstand/BookCoverUploadInput';
import { Book3DCover } from '../bookstand/Book3DCover';
import {
  ShoppingBag,
  BookOpen,
  AlertTriangle,
  ArrowLeft,
  PlusCircle,
  Search,
  Download,
  Users,
  CheckCircle,
  TrendingUp,
  Package,
  Layers,
  Phone,
  Camera,
  Sparkles,
  Check,
  Lock,
  ShieldAlert,
  KeyRound,
  Eye,
  DollarSign,
  Receipt,
  Wallet,
  Calendar,
  Clock,
  UserCheck,
  PackageCheck,
  Trash2,
  Plus,
  X,
  Scale,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  Send,
  HelpCircle,
  FileText,
  Printer,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { Book, BookstandExpense, BookstandDutySession, BookstandActivityEntry, BookstandComplaint, BookstandComplaintStatus, DepartmentMonthlyReport } from '../../types/models';

interface BookstandDashboardProps {
  onReturnToGeneral: () => void;
  onNavigateToFullModule?: () => void;
  onOpenRoleModal?: () => void;
  onNavigateToMemberStand?: () => void;
  onOpenReportToHRD?: () => void;
}

export const BookstandDashboard: React.FC<BookstandDashboardProps> = ({
  onReturnToGeneral,
  onNavigateToFullModule,
  onOpenRoleModal,
  onNavigateToMemberStand,
  onOpenReportToHRD,
}) => {
  const { currentUser, canManageBookstand } = useAuth();
  const {
    books,
    sales,
    stockMovements,
    bookstandDutySessions,
    bookstandExpenses,
    bookstandActivities,
    bookstandComplaints,
    addBookstandComplaint,
    updateBookstandComplaintStatus,
    addBookstandComplaintComment,
    addBook,
    recordDebtPayment,
    addStockMovement,
    addBookstandExpense,
    deleteBookstandExpense,
    monthlyReports,
    saveMonthlyReport,
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<
    'financials' | 'expenses' | 'roster' | 'complaints' | 'inventory' | 'debtors' | 'movements' | 'monthly-report'
  >('financials');

  // Roster tab search and filters
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterMemberFilter, setRosterMemberFilter] = useState('all');
  const [rosterServiceTypeFilter, setRosterServiceTypeFilter] = useState('all');

  // Complaints tab search and filters
  const [complaintDashboardStatusFilter, setComplaintDashboardStatusFilter] = useState('all');
  const [complaintDashboardCategoryFilter, setComplaintDashboardCategoryFilter] = useState('all');
  const [complaintDashboardSearch, setComplaintDashboardSearch] = useState('');
  const [complaintDashboardMemberFilter, setComplaintDashboardMemberFilter] = useState('all');

  // Officer action dialogs
  const [resolvingComplaintId, setResolvingComplaintId] = useState<string | null>(null);
  const [resolutionNotesInput, setResolutionNotesInput] = useState('');
  const [commentingComplaintId, setCommentingComplaintId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [selectedExpenseMonth, setSelectedExpenseMonth] = useState<string>('all');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Restock Transport & Logistics' as BookstandExpense['category'],
    description: '',
    amount: '',
    receiptRef: '',
  });

  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isPayDebtModalOpen, setIsPayDebtModalOpen] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  // Add Book Form State
  const [newBook, setNewBook] = useState<{
    title: string;
    author: string;
    category: Book['category'];
    coverPhoto: string;
    costPrice: string;
    sellingPrice: string;
    openingStock: string;
    reorderThreshold: string;
  }>({
    title: '',
    author: 'Dr. David Ogbueli',
    category: 'Spiritual Growth',
    coverPhoto: '',
    costPrice: '1500',
    sellingPrice: '2500',
    openingStock: '20',
    reorderThreshold: '5',
  });

  // Calculations
  const totalStockUnits = useMemo(
    () => books.reduce((sum, b) => sum + b.currentStock, 0),
    [books]
  );
  const totalBooksCount = books.length;
  const lowStockBooks = useMemo(
    () => books.filter((b) => b.currentStock <= b.reorderThreshold),
    [books]
  );
  const totalSalesRevenue = useMemo(
    () => sales.reduce((sum, s) => sum + s.totalAmount, 0),
    [sales]
  );
  const totalCashCollected = useMemo(
    () => sales.reduce((sum, s) => sum + s.amountPaid, 0),
    [sales]
  );
  const totalDebts = useMemo(
    () => sales.reduce((sum, s) => sum + s.outstandingDebt, 0),
    [sales]
  );
  const totalUnitsSold = useMemo(
    () => sales.reduce((sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0), 0),
    [sales]
  );

  const debtorsList = useMemo(
    () => sales.filter((s) => s.outstandingDebt > 0),
    [sales]
  );

  // Financial Statement & COGS
  const totalCostOfGoodsSold = useMemo(() => {
    return sales.reduce((acc, sale) => {
      const saleCost = sale.items.reduce((iAcc, item) => {
        const book = books.find((b) => b.id === item.bookId);
        const costPerUnit = book?.costPrice ?? item.unitPrice * 0.7;
        return iAcc + costPerUnit * item.quantity;
      }, 0);
      return acc + saleCost;
    }, 0);
  }, [sales, books]);

  const grossProfit = totalSalesRevenue - totalCostOfGoodsSold;
  const grossProfitMargin = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;

  const totalAssetCostValue = useMemo(() => {
    return books.reduce((sum, b) => sum + (b.costPrice || b.sellingPrice * 0.7) * b.currentStock, 0);
  }, [books]);
  const totalAssetRetailValue = useMemo(() => {
    return books.reduce((sum, b) => sum + b.sellingPrice * b.currentStock, 0);
  }, [books]);
  const unrealizedProfit = totalAssetRetailValue - totalAssetCostValue;

  const allTimeExpenses = useMemo(() => {
    return bookstandExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [bookstandExpenses]);

  const filteredExpenses = useMemo(() => {
    if (selectedExpenseMonth === 'all') return bookstandExpenses;
    return bookstandExpenses.filter((e) => e.month === selectedExpenseMonth);
  }, [bookstandExpenses, selectedExpenseMonth]);

  const filteredExpensesTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const netCashSurplus = totalCashCollected - allTimeExpenses;

  const expenseMonths = useMemo(() => {
    const setMonths = new Set(bookstandExpenses.map((e) => e.month));
    return Array.from(setMonths).sort().reverse();
  }, [bookstandExpenses]);

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'all' || book.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [books, searchTerm, categoryFilter]);

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.sellingPrice) {
      alert('Please fill in title and selling price');
      return;
    }

    const opening = parseInt(newBook.openingStock) || 0;
    const reorder = parseInt(newBook.reorderThreshold) || 5;

    addBook({
      title: newBook.title.trim(),
      author: newBook.author.trim(),
      category: newBook.category,
      coverPhoto:
        newBook.coverPhoto ||
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80',
      costPrice: parseFloat(newBook.costPrice) || 0,
      sellingPrice: parseFloat(newBook.sellingPrice) || 0,
      openingStock: opening,
      stockReceived: 0,
      reorderThreshold: reorder,
    });

    setIsAddBookModalOpen(false);
    setNewBook({
      title: '',
      author: 'Dr. David Ogbueli',
      category: 'Spiritual Growth',
      coverPhoto: '',
      costPrice: '1500',
      sellingPrice: '2500',
      openingStock: '20',
      reorderThreshold: '5',
    });
  };

  const handleDebtPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForPayment || !paymentAmount || parseFloat(paymentAmount) <= 0) return;

    recordDebtPayment(
      selectedSaleForPayment.id,
      parseFloat(paymentAmount),
      currentUser.name,
      receiptNumber.trim() || undefined
    );

    setIsPayDebtModalOpen(false);
    setSelectedSaleForPayment(null);
    setPaymentAmount('');
    setReceiptNumber('');
  };

  const handleExportInventory = () => {
    exportToCSV(
      books.map((b) => ({
        Title: b.title,
        Author: b.author,
        Category: b.category,
        CurrentStock: b.currentStock,
        SellingPrice: b.sellingPrice,
        CostPrice: b.costPrice,
        TotalUnitsSold: b.quantitySold,
        Status: b.status,
      })),
      `DC_Asaba_Bookstand_Catalogue_${new Date().toISOString().split('T')[0]}`
    );
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseForm.amount);
    if (!expenseForm.description.trim() || isNaN(amt) || amt <= 0) {
      alert('Please provide a valid expense description and amount');
      return;
    }

    const monthStr = expenseForm.date.substring(0, 7);
    addBookstandExpense({
      date: expenseForm.date,
      month: monthStr,
      category: expenseForm.category,
      description: expenseForm.description.trim(),
      amount: amt,
      receiptRef: expenseForm.receiptRef.trim() || undefined,
      recordedBy: currentUser.name,
    });

    setIsAddExpenseModalOpen(false);
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      category: 'Restock Transport & Logistics',
      description: '',
      amount: '',
      receiptRef: '',
    });
  };

  const handleExportFinancials = () => {
    exportToCSV(
      [
        { LineItem: 'Total Gross Sales Revenue', Amount: totalSalesRevenue },
        { LineItem: 'Wholesale Cost of Goods Sold (COGS)', Amount: totalCostOfGoodsSold },
        { LineItem: 'Gross Literature Profit', Amount: grossProfit },
        { LineItem: 'Total Operating Expenses', Amount: allTimeExpenses },
        { LineItem: 'Net Literature Remittance / Cash Surplus', Amount: netCashSurplus },
        { LineItem: 'Cash & POS Amount Collected', Amount: totalCashCollected },
        { LineItem: 'Outstanding Member Debts', Amount: totalDebts },
        { LineItem: 'Current Inventory Asset Cost Value', Amount: totalAssetCostValue },
        { LineItem: 'Current Inventory Asset Retail Value', Amount: totalAssetRetailValue },
        { LineItem: 'Unrealized Profit Potential', Amount: unrealizedProfit },
      ],
      `DC_Asaba_Bookstand_Financial_Report_${new Date().toISOString().split('T')[0]}`
    );
  };

  const handleExportExpenses = () => {
    exportToCSV(
      filteredExpenses.map((e) => ({
        Date: e.date,
        Month: e.month,
        Category: e.category,
        Description: e.description,
        Amount: e.amount,
        ReceiptRef: e.receiptRef || 'N/A',
        RecordedBy: e.recordedBy,
      })),
      `DC_Asaba_Bookstand_Expenses_${selectedExpenseMonth}_${new Date().toISOString().split('T')[0]}`
    );
  };

  // Monthly Unit Report State
  const [selectedReportMonth, setSelectedReportMonth] = useState('2026-10');
  const [reportActivities, setReportActivities] = useState('');
  const [reportWorkCompleted, setReportWorkCompleted] = useState('');
  const [reportChallenges, setReportChallenges] = useState('');
  const [reportComplaints, setReportComplaints] = useState('');
  const [reportRecommendations, setReportRecommendations] = useState('');
  const [reportOutstanding, setReportOutstanding] = useState('');
  const [reportNextMonth, setReportNextMonth] = useState('');
  const [reportSavedBanner, setReportSavedBanner] = useState<string | null>(null);

  const currentBookstandReport = useMemo(() => {
    return monthlyReports.find(
      (r) => r.departmentUnit === 'Bookstand' && r.reportingMonth === selectedReportMonth
    );
  }, [monthlyReports, selectedReportMonth]);

  React.useEffect(() => {
    if (currentBookstandReport) {
      setReportActivities(currentBookstandReport.activitiesCarriedOut || '');
      setReportWorkCompleted(currentBookstandReport.workCompleted || '');
      setReportChallenges(currentBookstandReport.challengesEncountered || '');
      setReportComplaints(currentBookstandReport.complaintsOrIssues || '');
      setReportRecommendations(currentBookstandReport.recommendations || '');
      setReportOutstanding(currentBookstandReport.outstandingResponsibilities || '');
      setReportNextMonth(currentBookstandReport.activitiesPlannedNextMonth || '');
    } else {
      setReportActivities(
        'Maintained active literature ministry at all Sunday and Tuesday services. Administered stock movements, credit sales, cash collections, and duty handovers.'
      );
      setReportWorkCompleted(
        'Conducted physical count reconciliation. Documented duty officer shift entries, collected outstanding debts, and settled DPH logistics invoices.'
      );
      setReportChallenges(
        'Intermittent POS terminal connectivity during peak service dismissals; delivery delays on fast-moving spiritual titles.'
      );
      setReportComplaints(
        'Need for a sturdier lockable storage chest for overnight bookstand safe-keeping at the church foyer.'
      );
      setReportRecommendations(
        'Procure an additional standalone network card reader and maintain a 20-copy buffer on core Dr. David Ogbueli releases.'
      );
      setReportOutstanding(
        'Follow-up on remaining member credit balances and finalization of monthly DPH consignment settlement.'
      );
      setReportNextMonth(
        'Curate a dedicated Believers Foundation School book pack and conduct a quarterly physical inventory audit.'
      );
    }
  }, [currentBookstandReport, selectedReportMonth]);

  const handleSaveMonthlyReport = (submit: boolean = false) => {
    const reportPayload: Omit<DepartmentMonthlyReport, 'id' | 'createdAt' | 'updatedAt'> = {
      departmentUnit: 'Bookstand',
      reportingMonth: selectedReportMonth,
      submittedBy: currentUser?.name || 'Bookstand Officer',
      submittedByRole: 'Bookstand Lead Officer',
      submissionDate: new Date().toISOString().split('T')[0],
      status: submit ? 'Submitted' : 'Draft',
      activitiesCarriedOut: reportActivities,
      workCompleted: reportWorkCompleted,
      importantStatistics: {
        'Gross Literature Sales': formatNaira(totalSalesRevenue),
        'Cost of Goods Sold': formatNaira(totalCostOfGoodsSold),
        'Gross Operating Margin': `${grossProfitMargin.toFixed(1)}%`,
        'Operating Expenses': formatNaira(allTimeExpenses),
        'Net Cash Remittance': formatNaira(netCashSurplus),
        'Standing Stock Units': `${totalStockUnits} Copies`,
        'Active Catalogue Titles': books.length,
        'Recoverable Debts': formatNaira(totalDebts),
        'Duty Sessions Logged': bookstandDutySessions.length,
        'Recorded Incidents': bookstandComplaints.length,
      },
      challengesEncountered: reportChallenges,
      complaintsOrIssues: reportComplaints,
      recommendations: reportRecommendations,
      outstandingResponsibilities: reportOutstanding,
      activitiesPlannedNextMonth: reportNextMonth,
    };

    saveMonthlyReport({
      ...(currentBookstandReport?.id ? { id: currentBookstandReport.id } : {}),
      ...reportPayload,
    });

    setReportSavedBanner(
      submit
        ? `✓ Bookstand Monthly Report for ${selectedReportMonth} submitted successfully to the HOD!`
        : `✓ Bookstand Monthly Report for ${selectedReportMonth} saved as Draft!`
    );
    setTimeout(() => setReportSavedBanner(null), 4000);
  };

  // Security Lockout Screen if user lacks officer credentials
  if (!canManageBookstand) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-900 to-indigo-900 border-2 border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg shadow-purple-950/30">
          <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Restricted Operational Workspace
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Bookstand Officer Desk — Passcode Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            This executive workspace manages confidential financial records: cash collected, wholesale cost prices, debtor balances, and stock inventory reconciliation.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold">
            <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Authorized Officer Access Protocols:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
            <li>Access is restricted to Bookstand Officers, Operations Officer, and HOD.</li>
            <li>Default Passcode: <code className="font-mono font-bold bg-amber-200 dark:bg-amber-900 px-1 py-0.5 rounded text-amber-950 dark:text-amber-200">BOOK-2026</code> (or <code className="font-mono font-bold bg-amber-200 dark:bg-amber-900 px-1 py-0.5 rounded text-amber-950 dark:text-amber-200">DEMO-2026</code> in demo mode).</li>
            <li>Church members can freely browse titles, prices, and availability at the public Book Stand.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onOpenRoleModal && (
            <button
              onClick={onOpenRoleModal}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer hover:shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-slate-950" />
              Enter Officer Passcode (Unlock Desk)
            </button>
          )}

          {onNavigateToMemberStand && (
            <button
              onClick={onNavigateToMemberStand}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              Browse Member Book Stand
            </button>
          )}

          <button
            onClick={onReturnToGeneral}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            ← Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Officer Header with Clear Return Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#210936] via-[#3C1361] to-[#591C8F] text-white shadow-lg border border-purple-900/40">
        <div>
          <button
            onClick={onReturnToGeneral}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 text-xs font-bold mb-2.5 transition-colors cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span><span className="hidden sm:inline">Return to </span>General Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Bookstand Officer Dedicated Workspace
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30">
              Inventory &amp; Debts
            </span>
          </div>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Live book catalogue, stock movements, member credit sales, debt recovery, and sales summaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToMemberStand && (
            <button
              onClick={onNavigateToMemberStand}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-500/30 hover:bg-purple-500/40 text-purple-200 hover:text-white font-semibold text-xs border border-purple-400/40 transition-all cursor-pointer"
              title="Preview public Book Stand as church members see it"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Member Stand View</span>
            </button>
          )}
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer hover:scale-102 glow-amber"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>Upload New Book</span>
            <span className="hidden xs:inline-block px-1.5 py-0.5 text-[9px] bg-slate-950/20 text-slate-950 rounded uppercase font-bold">
              Auto-Studio
            </span>
          </button>
          <button
            onClick={handleExportInventory}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-300" />
            Export Catalogue
          </button>
          {onOpenReportToHRD && (
            <button
              onClick={onOpenReportToHRD}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md border border-amber-300 transition-all cursor-pointer"
              title="Report incident, stock discrepancy, or complaint to HOD"
            >
              <Send className="w-3.5 h-3.5 text-slate-950" />
              <span>REPORT TO HOD</span>
            </button>
          )}
        </div>
      </div>

      {/* Executive Financial & Stock KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Sales Revenue */}
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Gross Revenue
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatNaira(totalSalesRevenue)}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            Cash: {formatNaira(totalCashCollected)}
          </p>
        </div>

        {/* Gross Literature Profit */}
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Gross Profit
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {formatNaira(grossProfit)}
          </p>
          <p className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold mt-0.5">
            {grossProfitMargin.toFixed(1)}% profit margin
          </p>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Monthly Expenses
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatNaira(allTimeExpenses)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {bookstandExpenses.length} expense records
          </p>
        </div>

        {/* Net Remittance / Cash Surplus */}
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Net Remittance
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatNaira(netCashSurplus)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Cash minus expenses
          </p>
        </div>

        {/* Outstanding Debts */}
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Member Debts
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatNaira(totalDebts)}
          </p>
          <p className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold mt-0.5">
            {debtorsList.length} open balance{debtorsList.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Total Stock Units */}
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Total Stand Stock
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            {totalStockUnits} <span className="text-xs font-semibold text-slate-400">Copies</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Across {totalBooksCount} active titles
          </p>
        </div>
      </div>

      {/* Low-Stock Quick Alert Cards (If Any) */}
      {lowStockBooks.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-200/60 text-rose-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-950">
                Action Required: {lowStockBooks.length} book titles need stock replenishment!
              </h4>
              <p className="text-[11px] text-rose-800 mt-0.5">
                Titles: {lowStockBooks.map((b) => `${b.title} (${b.currentStock} left)`).join(', ')}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-200 text-rose-900 shrink-0">
            Reorder Immediately
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'financials', label: '1. Financial Statement & P&L', icon: DollarSign },
          { id: 'expenses', label: `2. Monthly Expenses (${bookstandExpenses.length})`, icon: Receipt },
          { id: 'roster', label: `3. Duty Officers & Shift Activities (${bookstandDutySessions.length})`, icon: UserCheck },
          { id: 'complaints', label: `4. Complaints & Issues (${bookstandComplaints.length})`, icon: MessageSquare },
          { id: 'inventory', label: `5. Master Catalogue (${books.length})`, icon: BookOpen },
          { id: 'debtors', label: `6. Debtors & Recovery (${debtorsList.length})`, icon: Users },
          { id: 'movements', label: `7. Stock Movements (${stockMovements.length})`, icon: Package },
          { id: 'monthly-report', label: '8. Monthly Unit Report', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3.5 text-xs font-bold transition-all cursor-pointer relative whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'text-purple-700 dark:text-purple-400 border-b-2 border-purple-700 dark:border-purple-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FINANCIALS & P&L */}
      {activeTab === 'financials' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                Executive Financial Statement &amp; Operating Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comprehensive departmental profit &amp; loss analysis, cost of goods sold, and net church remittance.
              </p>
            </div>
            <button
              onClick={handleExportFinancials}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Financial Report (CSV)</span>
            </button>
          </div>

          {/* Statement Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Bookstand Income &amp; Expenditure Statement
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Total Gross Sales Revenue</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{formatNaira(totalSalesRevenue)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-semibold text-rose-600 dark:text-rose-400">
                  <span>Less: Cost of Goods Sold (Wholesale COGS from DPH)</span>
                  <span className="text-sm font-black">- {formatNaira(totalCostOfGoodsSold)}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 font-bold text-purple-900 dark:text-purple-200">
                  <div>
                    <span className="text-xs uppercase tracking-wide">Gross Literature Margin</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-normal">
                      Profit margin: {grossProfitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-base font-black">{formatNaira(grossProfit)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-semibold text-amber-600 dark:text-amber-400">
                  <span>Less: Total Operating Expenses (Logistics &amp; POS)</span>
                  <span className="text-sm font-black">- {formatNaira(allTimeExpenses)}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 font-black text-emerald-900 dark:text-emerald-200">
                  <div>
                    <span className="text-xs uppercase tracking-wider block">Net Departmental Cash Remittance</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      Actual cash collected minus departmental operating expenses
                    </span>
                  </div>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatNaira(netCashSurplus)}</span>
                </div>
              </div>
            </div>

            {/* Asset Valuation & Settlement Rates */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-purple-600" />
                  Stand Stock Asset Valuation
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Asset Cost Value (Wholesale)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatNaira(totalAssetCostValue)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Asset Retail Selling Value</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatNaira(totalAssetRetailValue)}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 font-black text-emerald-600 dark:text-emerald-400">
                    <span>Unrealized Profit Potential</span>
                    <span>{formatNaira(unrealizedProfit)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  Collection Liquidity
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Physical Cash &amp; Bank Settled</span>
                    <span className="font-bold text-emerald-600">{formatNaira(totalCashCollected)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Unsettled Member Debts</span>
                    <span className="font-bold text-amber-600">{formatNaira(totalDebts)}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 font-bold text-slate-700 dark:text-slate-300">
                    <span>Collection Realization Rate</span>
                    <span className="text-purple-600 dark:text-purple-400">
                      {totalSalesRevenue > 0 ? ((totalCashCollected / totalSalesRevenue) * 100).toFixed(1) : '100'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                Bookstand Monthly Expenses &amp; Operating Logistics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Transport waybills from Dominion Publishing House, packaging carrier bags, and POS terminal fees.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedExpenseMonth}
                onChange={(e) => setSelectedExpenseMonth(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Months (₦{allTimeExpenses.toLocaleString()})</option>
                {expenseMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md cursor-pointer hover:scale-102"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>+ Log Monthly Expense</span>
              </button>

              <button
                onClick={handleExportExpenses}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Monthly Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Filtered Expenses
              </span>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {formatNaira(filteredExpensesTotal)}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{filteredExpenses.length} transaction entries</span>
            </div>

            <div className="bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Restock Transport (Waybills)
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {formatNaira(
                  filteredExpenses
                    .filter((e) => e.category === 'Restock Transport & Logistics')
                    .reduce((s, e) => s + e.amount, 0)
                )}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Publishing logistics</span>
            </div>

            <div className="bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Packaging Carrier Bags
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {formatNaira(
                  filteredExpenses
                    .filter((e) => e.category === 'Packing Bags & Envelopes')
                    .reduce((s, e) => s + e.amount, 0)
                )}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Branded book carriers</span>
            </div>

            <div className="bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                POS &amp; Bank Charges
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {formatNaira(
                  filteredExpenses
                    .filter((e) => e.category === 'Bank & POS Terminal Charges')
                    .reduce((s, e) => s + e.amount, 0)
                )}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Terminal fees &amp; paper</span>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Month</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Expense Description</th>
                    <th className="p-3 text-right">Amount (NGN)</th>
                    <th className="p-3">Receipt / Ref</th>
                    <th className="p-3">Recorded By</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                        No monthly expenses recorded for this selection.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-medium">{formatDate(exp.date)}</td>
                        <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400">{exp.month}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-sm">{exp.description}</td>
                        <td className="p-3 text-right font-black text-rose-600 dark:text-rose-400">{formatNaira(exp.amount)}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">{exp.receiptRef || '—'}</td>
                        <td className="p-3 text-slate-500">{exp.recordedBy}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => deleteBookstandExpense(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DUTY ROSTER & SHIFT ACTIVITIES */}
      {activeTab === 'roster' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Book Stand Duty Officers &amp; Officiating Shift Activity Audit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time record of members who sign in for Sunday/Tuesday book stand duty and the exact activities carried out.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Total Logged Shifts: {bookstandDutySessions.length}
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member, duty notes, phone..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={rosterMemberFilter}
                onChange={(e) => setRosterMemberFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Officiating Members</option>
                {Array.from(new Set(bookstandDutySessions.map((s) => s.officiatingName))).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={rosterServiceTypeFilter}
                onChange={(e) => setRosterServiceTypeFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Service Sessions</option>
                <option value="Sunday 1st Service">Sunday 1st Service</option>
                <option value="Sunday 2nd Service">Sunday 2nd Service</option>
                <option value="Tuesday Word & Communion">Tuesday Word &amp; Communion</option>
                <option value="Sunday Service">Sunday Service</option>
              </select>
            </div>
          </div>

          {/* Duty Sessions Feed */}
          {(() => {
            const filteredSessions = bookstandDutySessions.filter((s) => {
              const matchesMember =
                rosterMemberFilter === 'all' || s.officiatingName.toLowerCase() === rosterMemberFilter.toLowerCase();
              const matchesType =
                rosterServiceTypeFilter === 'all' || s.serviceType === rosterServiceTypeFilter;
              const matchesSearch =
                !rosterSearch ||
                s.officiatingName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                (s.openingNotes && s.openingNotes.toLowerCase().includes(rosterSearch.toLowerCase())) ||
                (s.handoverNotes && s.handoverNotes.toLowerCase().includes(rosterSearch.toLowerCase())) ||
                (s.officiatingPhone && s.officiatingPhone.includes(rosterSearch));

              return matchesMember && matchesType && matchesSearch;
            });

            if (filteredSessions.length === 0) {
              return (
                <div className="p-8 text-center bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  No duty shifts found matching the filter criteria.
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filteredSessions.map((session) => {
                  const sessionSales = sales.filter(
                    (s) =>
                      s.saleDate === session.serviceDate ||
                      s.recordedBy?.toLowerCase() === session.officiatingName.toLowerCase()
                  );
                  const unitsSold = sessionSales.reduce(
                    (sum, s) => sum + s.items.reduce((iSum, item) => iSum + item.quantity, 0),
                    0
                  );
                  const revenue = sessionSales.reduce((sum, s) => sum + s.totalAmount, 0);
                  const debtsLogged = sessionSales.filter((s) => s.outstandingDebt > 0);
                  const debtTotal = debtsLogged.reduce((sum, s) => sum + s.outstandingDebt, 0);
                  const isCurrentActive = session.status === 'Active';

                  const sessionActivities = bookstandActivities.filter(
                    (a) =>
                      a.sessionId === session.id ||
                      (a.serviceDate === session.serviceDate &&
                        a.officiatingMember.toLowerCase() === session.officiatingName.toLowerCase())
                  );

                  const sessionComplaints = bookstandComplaints.filter(
                    (c) =>
                      c.sessionId === session.id ||
                      (c.serviceDate === session.serviceDate &&
                        c.submittedBy.toLowerCase() === session.officiatingName.toLowerCase())
                  );

                  return (
                    <div
                      key={session.id}
                      className={`p-5 rounded-2xl bg-white dark:bg-[#0E172B] border transition-all shadow-xs space-y-4 ${
                        isCurrentActive
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                              isCurrentActive
                                ? 'bg-emerald-500 text-white'
                                : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                            }`}
                          >
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {session.officiatingName}
                              </h4>
                              {isCurrentActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                  Active Shift Now
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  Shift Completed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Phone: {session.officiatingPhone || 'Not provided'} • Service:{' '}
                              <strong className="text-purple-600 dark:text-purple-400">{session.serviceType}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {formatDate(session.serviceDate)}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Signed in: {new Date(session.signedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {session.signedOutAt && (
                              <> • Signed out: {new Date(session.signedOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50">
                          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                            Books Sold
                          </span>
                          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                            {unitsSold} <span className="text-xs font-semibold text-slate-400">Copies</span>
                          </p>
                          <span className="text-[11px] text-purple-700 dark:text-purple-400 font-bold block mt-0.5">
                            {formatNaira(revenue)} revenue
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
                            Debts Logged
                          </span>
                          <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                            {debtsLogged.length} <span className="text-xs font-semibold text-slate-400">Buyers</span>
                          </p>
                          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold block mt-0.5">
                            {formatNaira(debtTotal)} debt
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Activities Logged
                          </span>
                          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                            {sessionActivities.length} <span className="text-xs font-semibold text-slate-400">Events</span>
                          </p>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">Audit timeline</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Opening / Handover Notes
                          </span>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 line-clamp-2 italic">
                            "{session.handoverNotes || session.openingNotes || 'Duty commenced normally'}"
                          </p>
                        </div>
                      </div>

                      {/* Chronological Activity Log for this Member */}
                      {sessionActivities.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                          <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            Shift Activity Audit Trail ({sessionActivities.length}):
                          </div>
                          <div className="space-y-1.5">
                            {sessionActivities.map((act) => (
                              <div
                                key={act.id}
                                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                                    {act.activityType}
                                  </span>
                                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                                    {act.description}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Session Complaints Logged */}
                      {sessionComplaints.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                          <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                            Issues Logged During This Shift ({sessionComplaints.length}):
                          </div>
                          <div className="space-y-1.5">
                            {sessionComplaints.map((c) => (
                              <div
                                key={c.id}
                                className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-xs flex items-center justify-between"
                              >
                                <div>
                                  <strong>[{c.category}]</strong> {c.subject}
                                </div>
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                                  {c.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 4: COMPLAINTS, ISSUES & RESOLUTION CENTER */}
      {activeTab === 'complaints' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 sm:p-5 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                Bookstand Complaints, Incident Reports &amp; Resolution Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitor and resolve discrepancies, missing items, transaction errors, and stand observations reported by officiating members.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                Open: {bookstandComplaints.filter((c) => c.status === 'Open').length}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Resolved: {bookstandComplaints.filter((c) => c.status === 'Resolved').length}
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject, submitter, description..."
                value={complaintDashboardSearch}
                onChange={(e) => setComplaintDashboardSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={complaintDashboardStatusFilter}
                onChange={(e) => setComplaintDashboardStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open Issues</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="Under Review">Under Review</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={complaintDashboardCategoryFilter}
                onChange={(e) => setComplaintDashboardCategoryFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Transaction Error">Transaction Error</option>
                <option value="Missing Item">Missing Item</option>
                <option value="Quantity Discrepancy">Quantity Discrepancy</option>
                <option value="Handover Issue">Handover Issue</option>
                <option value="Operational Problem">Operational Problem</option>
                <option value="Observation">Observation</option>
              </select>
            </div>
          </div>

          {/* Complaints Feed */}
          {(() => {
            const filtered = bookstandComplaints.filter((c) => {
              const matchesStatus =
                complaintDashboardStatusFilter === 'all' || c.status === complaintDashboardStatusFilter;
              const matchesCategory =
                complaintDashboardCategoryFilter === 'all' || c.category === complaintDashboardCategoryFilter;
              const matchesSearch =
                !complaintDashboardSearch ||
                c.subject.toLowerCase().includes(complaintDashboardSearch.toLowerCase()) ||
                c.description.toLowerCase().includes(complaintDashboardSearch.toLowerCase()) ||
                c.submittedBy.toLowerCase().includes(complaintDashboardSearch.toLowerCase());

              return matchesStatus && matchesCategory && matchesSearch;
            });

            if (filtered.length === 0) {
              return (
                <div className="p-10 text-center bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  No complaints or issues found matching the selected filters.
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filtered.map((c) => {
                  const statusColors: Record<string, string> = {
                    Open: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
                    Acknowledged: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
                    'Under Review': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
                    Resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
                  };

                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                            {c.category}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              statusColors[c.status] || statusColors.Open
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>

                        <span className="text-xs text-slate-400 font-medium">
                          {c.serviceType} • {formatDate(c.serviceDate)}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {c.subject}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">
                          {c.description}
                        </p>
                      </div>

                      {/* Photo evidence if any */}
                      {c.photoUrl && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                            Attached Photo Evidence:
                          </span>
                          <img
                            src={c.photoUrl}
                            alt="Complaint proof"
                            className="max-h-48 rounded-lg object-contain border border-slate-200 dark:border-slate-700 cursor-pointer"
                            onClick={() => window.open(c.photoUrl, '_blank')}
                          />
                        </div>
                      )}

                      {/* Submitter & Lifecycle audit record */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                        <div className="flex flex-wrap items-center justify-between text-slate-500">
                          <span>
                            Reported by: <strong className="text-slate-800 dark:text-slate-200">{c.submittedBy}</strong> ({c.submittedByPhone || 'On duty'})
                          </span>
                          <span>Session Ref: <code className="font-mono">{c.sessionId}</code></span>
                        </div>
                        {c.acknowledgedBy && (
                          <div className="text-amber-800 dark:text-amber-300 font-medium">
                            Acknowledged by {c.acknowledgedBy} at {c.acknowledgedAt ? new Date(c.acknowledgedAt).toLocaleString() : ''}
                          </div>
                        )}
                        {c.resolutionNotes && (
                          <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                            Resolved by {c.resolvedBy || 'Officer'}: "{c.resolutionNotes}" ({c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : ''})
                          </div>
                        )}
                      </div>

                      {/* Follow-up Comments Thread */}
                      {c.followUpComments && c.followUpComments.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Officer Follow-Up Notes ({c.followUpComments.length}):
                          </span>
                          <div className="space-y-1.5">
                            {c.followUpComments.map((comment) => (
                              <div
                                key={comment.id}
                                className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs"
                              >
                                <div className="flex items-center justify-between text-[10px] text-purple-700 dark:text-purple-300 mb-0.5">
                                  <strong>{comment.commentBy}</strong>
                                  <span>{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300">{comment.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Officer Actions */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2">
                        {c.status === 'Open' && (
                          <button
                            onClick={() => updateBookstandComplaintStatus(c.id, 'Acknowledged')}
                            className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs cursor-pointer transition-colors"
                          >
                            Acknowledge Issue
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setCommentingComplaintId(c.id);
                            setCommentInput('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs cursor-pointer transition-colors"
                        >
                          Add Follow-up Note
                        </button>

                        {c.status !== 'Resolved' && (
                          <button
                            onClick={() => {
                              setResolvingComplaintId(c.id);
                              setResolutionNotesInput('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                          >
                            Mark as Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 1: INVENTORY CATALOGUE */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search book title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="Spiritual Growth">Spiritual Growth</option>
                <option value="Leadership">Leadership</option>
                <option value="Prayer & Fasting">Prayer & Fasting</option>
                <option value="Purpose & Destiny">Purpose & Destiny</option>
                <option value="Finance & Stewardship">Finance & Stewardship</option>
                <option value="Relationships">Relationships</option>
              </select>

              <button
                onClick={() => setIsAddBookModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Upload Book</span>
              </button>
            </div>
          </div>

          {/* Book Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Dedicated Upload Book Card (Always 1st on shelf) */}
            <div
              onClick={() => setIsAddBookModalOpen(true)}
              className="bg-purple-50/50 hover:bg-purple-50 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-500 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] shadow-xs group min-h-[320px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full mb-1.5">
                New Publication
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Upload New Book
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                Snap physical book cover. Auto-crops to 3:4, fixes lighting & creates 3D store mockup.
              </p>
              <button
                type="button"
                className="mt-4 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Snap & Upload</span>
              </button>
            </div>
            {filteredBooks.map((book) => {
              const isLow = book.currentStock <= book.reorderThreshold;
              return (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <Book3DCover
                      coverPhoto={book.coverPhoto}
                      title={book.title}
                      author={book.author}
                      category={book.category}
                      badge={
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs ${
                            isLow
                              ? 'bg-rose-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {book.currentStock} in stock
                        </span>
                      }
                    />

                    <div>
                      <span className="text-[10px] font-semibold text-purple-600 block uppercase">
                        {book.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{book.author}</p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Selling Price</span>
                      <span className="text-sm font-black text-slate-900">
                        {formatNaira(book.sellingPrice)}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-medium">
                      Sold: {book.quantitySold}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: OUTSTANDING DEBTORS */}
      {activeTab === 'debtors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Department Bookstand Debtors Register
            </h3>
            <p className="text-xs text-slate-500">
              Credit sales tracking with customer phone numbers and payment recording
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Sale Date</th>
                  <th className="py-3 px-4">Customer Name & Phone</th>
                  <th className="py-3 px-4">Books Purchased</th>
                  <th className="py-3 px-4 text-right">Total (NGN)</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Outstanding Debt</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {debtorsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No outstanding customer debts! All bookstand sales fully reconciled.
                    </td>
                  </tr>
                ) : (
                  debtorsList.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {formatDate(sale.saleDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{sale.customerName}</p>
                        {sale.customerPhone && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {sale.customerPhone}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {sale.items.map((i, idx) => (
                          <span key={idx} className="block text-[11px] text-slate-700">
                            {i.quantity}x {i.bookTitle}
                          </span>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                        {formatNaira(sale.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                        {formatNaira(sale.amountPaid)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-amber-700 text-sm">
                        {formatNaira(sale.outstandingDebt)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {canManageBookstand && (
                          <button
                            onClick={() => {
                              setSelectedSaleForPayment(sale);
                              setPaymentAmount(sale.outstandingDebt.toString());
                              setIsPayDebtModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK MOVEMENTS */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Audit Log: Book Stock Movements
            </h3>
            <p className="text-xs text-slate-500">
              Deliveries, sales reductions, customer returns, and physical audit adjustments
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stockMovements.length === 0 ? (
              <p className="py-8 text-center text-slate-400">No stock movements logged yet.</p>
            ) : (
              stockMovements.map((sm) => (
                <div key={sm.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{sm.bookTitle}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-slate-100 text-slate-700">
                        {sm.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{sm.reason}</p>
                    <p className="text-[10px] text-slate-400">
                      Logged by {sm.recordedBy} on {formatDate(sm.date)}
                    </p>
                  </div>

                  <span
                    className={`font-black text-sm ${
                      sm.quantity > 0 ? 'text-emerald-600' : 'text-slate-700'
                    }`}
                  >
                    {sm.quantity > 0 ? `+${sm.quantity}` : sm.quantity} units
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 8: MONTHLY UNIT OPERATING REPORT */}
      {activeTab === 'monthly-report' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Bookstand Monthly Operating Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official 9-part monthly literature ministry report submitted directly to the Head of Department (HOD).
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

          {currentBookstandReport && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Submission Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                    currentBookstandReport.status === 'Submitted'
                      ? 'bg-blue-500 text-white'
                      : currentBookstandReport.status === 'Reviewed'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {currentBookstandReport.status}
                </span>
                {currentBookstandReport.reviewedBy && (
                  <span className="text-slate-400">
                    • Reviewed by <strong className="text-white">{currentBookstandReport.reviewedBy}</strong>
                  </span>
                )}
              </div>
              {currentBookstandReport.hodReviewNotes && (
                <div className="text-amber-200 italic text-[11px] bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  HOD Remark: "{currentBookstandReport.hodReviewNotes}"
                </div>
              )}
            </div>
          )}

          {/* Automatic Bookstand Metrics Banner */}
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 block">
              3. Important Unit Statistics (Auto-Calculated for {selectedReportMonth})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
              <div className="bg-white dark:bg-[#0E172B] p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] text-slate-400 block">Gross Sales</span>
                <strong className="text-slate-900 dark:text-white font-black">{formatNaira(totalSalesRevenue)}</strong>
              </div>
              <div className="bg-white dark:bg-[#0E172B] p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] text-slate-400 block">Wholesale COGS</span>
                <strong className="text-slate-900 dark:text-white font-black">{formatNaira(totalCostOfGoodsSold)}</strong>
              </div>
              <div className="bg-white dark:bg-[#0E172B] p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] text-slate-400 block">Net Church Remittance</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-black">{formatNaira(netCashSurplus)}</strong>
              </div>
              <div className="bg-white dark:bg-[#0E172B] p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] text-slate-400 block">Standing Stock Units</span>
                <strong className="text-slate-900 dark:text-white font-black">{totalStockUnits} Copies</strong>
              </div>
            </div>
          </div>

          {/* 9-Part Report Narrative Form */}
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
                  placeholder="Literature desk duty shifts, inventory audits, restock orders..."
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
                  placeholder="Sales reconciliation, member debt recovery, shift logs..."
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
                  placeholder="Point of sale network disruptions, logistics delays..."
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
                  placeholder="Damaged copies, price verification questions, storage needs..."
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
                  placeholder="Reordering buffers, display stand lighting, promotional book fair..."
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
                  placeholder="Credit recoveries, pending publisher statements..."
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
                  placeholder="Special book sales, leadership conference titles display..."
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Reporting Officer: <strong>{currentUser?.name || 'Bookstand Officer'}</strong> • Date: {new Date().toISOString().split('T')[0]}
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
                  className="btn-compact bg-purple-600 hover:bg-purple-500 text-white font-bold h-9 px-4 text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Report to HOD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW BOOK MODAL WITH DIRECT PHOTO UPLOAD & RESPONSIVE TOUCH WORKFLOW */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] rounded-t-3xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 max-h-[96vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Native Mobile Pull Indicator */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shadow-xs">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Add New Book to Catalogue
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Auto-studio camera photo • 3D book mockup
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors text-base font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddBook} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-4 py-4 sm:px-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                {/* 1. Direct Cover Photo Upload (Studio Camera Snap / Gallery) */}
                <div className="p-3 sm:p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                  <BookCoverUploadInput
                    value={newBook.coverPhoto}
                    onChange={(dataUrl) => setNewBook({ ...newBook, coverPhoto: dataUrl })}
                    bookTitle={newBook.title || 'New Book'}
                    bookAuthor={newBook.author || 'Dr. David Ogbueli'}
                    bookCategory={newBook.category}
                  />
                </div>

                {/* 2. Book Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Power of Personal Vision"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className="w-full px-3.5 py-3 sm:py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>

                {/* 3. Author & Quick Author Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                      Author *
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Tap quick chip to auto-fill</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="w-full px-3.5 py-3 sm:py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['Dr. David Ogbueli', 'Pastor Chingtok Ishaku', 'Dominion Publishing', 'Guest Minister'].map(
                      (authorName) => (
                        <button
                          key={authorName}
                          type="button"
                          onClick={() => setNewBook({ ...newBook, author: authorName })}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            newBook.author === authorName
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                          }`}
                        >
                          {authorName}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* 4. Category */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newBook.category}
                    onChange={(e) =>
                      setNewBook({ ...newBook, category: e.target.value as any })
                    }
                    className="w-full px-3.5 py-3 sm:py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="Spiritual Growth">Spiritual Growth</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Prayer & Fasting">Prayer & Fasting</option>
                    <option value="Purpose & Destiny">Purpose & Destiny</option>
                    <option value="Finance & Stewardship">Finance & Stewardship</option>
                    <option value="Relationships">Relationships</option>
                  </select>
                </div>

                {/* 5. Pricing with Quick Presets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Selling Price (NGN) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newBook.sellingPrice}
                      onChange={(e) => setNewBook({ ...newBook, sellingPrice: e.target.value })}
                      className="w-full px-3.5 py-3 sm:py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                    />
                    {/* Quick Price Chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['1500', '2000', '2500', '3000', '4000', '5000'].map((price) => (
                        <button
                          key={price}
                          type="button"
                          onClick={() => setNewBook({ ...newBook, sellingPrice: price })}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            newBook.sellingPrice === price
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                          }`}
                        >
                          ₦{Number(price).toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cost Price (NGN)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newBook.costPrice}
                      onChange={(e) => setNewBook({ ...newBook, costPrice: e.target.value })}
                      className="w-full px-3.5 py-3 sm:py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Publisher purchase cost</span>
                  </div>
                </div>

                {/* 6. Stock Quantities with Quick Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Opening Stock Units *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newBook.openingStock}
                      onChange={(e) => setNewBook({ ...newBook, openingStock: e.target.value })}
                      className="w-full px-3.5 py-3 sm:py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                    />
                    {/* Quick Stock Chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['10', '20', '30', '50', '100'].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setNewBook({ ...newBook, openingStock: qty })}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            newBook.openingStock === qty
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                          }`}
                        >
                          {qty} pcs
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Low Stock Reorder Alert *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newBook.reorderThreshold}
                      onChange={(e) =>
                        setNewBook({ ...newBook, reorderThreshold: e.target.value })
                      }
                      className="w-full px-3.5 py-3 sm:py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Alert triggers when stock drops below this</span>
                  </div>
                </div>
              </div>

              {/* Sticky Touch-Friendly Footer Action Bar */}
              <div className="sticky bottom-0 bg-white/95 dark:bg-[#0E172B]/95 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 z-20 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Book to Catalogue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD DEBT PAYMENT MODAL */}
      {isPayDebtModalOpen && selectedSaleForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Record Debt Recovery Payment
              </h3>
              <button
                onClick={() => setIsPayDebtModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDebtPayment} className="space-y-4 mt-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Customer: {selectedSaleForPayment.customerName}
                </p>
                <p className="text-[11px] text-amber-700 font-semibold">
                  Outstanding: {formatNaira(selectedSaleForPayment.outstandingDebt)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount (NGN) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedSaleForPayment.outstandingDebt}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Receipt / Bank Reference No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. POS-TX-998"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayDebtModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer"
                >
                  Confirm Debt Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG MONTHLY EXPENSE MODAL */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 max-h-[96vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Native Mobile Pull Indicator */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shadow-xs">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Log Bookstand Operating Expense
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Waybills from DPH, carrier bags, POS charges & stand repairs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors text-base font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddExpense} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Expense Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Expense Category *
                    </label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          category: e.target.value as BookstandExpense['category'],
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    >
                      <option value="Restock Transport & Logistics">Restock Transport & Logistics</option>
                      <option value="Packing Bags & Envelopes">Packing Bags & Envelopes</option>
                      <option value="Bank & POS Terminal Charges">Bank & POS Terminal Charges</option>
                      <option value="Book Display & Stand Repairs">Book Display & Stand Repairs</option>
                      <option value="Desk Petty Cash & Refreshment">Desk Petty Cash & Refreshment</option>
                      <option value="Miscellaneous Publishing Expense">Miscellaneous Publishing Expense</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Waybill delivery fee from DPH Lagos for 80 copies"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Amount (NGN) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 7500"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                    />
                    {/* Quick amount chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['2000', '3500', '5000', '7500', '10000'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setExpenseForm({ ...expenseForm, amount: amt })}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-400 cursor-pointer"
                        >
                          ₦{Number(amt).toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Receipt / Waybill Ref No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WB-LAG-9801"
                      value={expenseForm.receiptRef}
                      onChange={(e) => setExpenseForm({ ...expenseForm, receiptRef: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Optional payment voucher/reference</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-[11px] text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-purple-600" />
                  <span>
                    Logged expenses are automatically recorded under your officer profile (
                    <strong>{currentUser.name}</strong>) and subtracted from gross remittance.
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white/95 dark:bg-[#0E172B]/95 backdrop-blur-md px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md cursor-pointer transition-transform hover:scale-102 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Expense to Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Issue Modal */}
      {resolvingComplaintId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Mark Complaint as Resolved
                </h3>
              </div>
              <button
                onClick={() => {
                  setResolvingComplaintId(null);
                  setResolutionNotesInput('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resolution Notes / Action Taken *
              </label>
              <textarea
                rows={3}
                required
                value={resolutionNotesInput}
                onChange={(e) => setResolutionNotesInput(e.target.value)}
                placeholder="Explain what steps or corrective actions were taken to resolve this discrepancy or incident..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResolvingComplaintId(null);
                  setResolutionNotesInput('');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!resolutionNotesInput.trim()}
                onClick={() => {
                  if (!resolvingComplaintId || !resolutionNotesInput.trim()) return;
                  updateBookstandComplaintStatus(
                    resolvingComplaintId,
                    'Resolved',
                    resolutionNotesInput.trim(),
                    currentUser.name
                  );
                  setResolvingComplaintId(null);
                  setResolutionNotesInput('');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Follow-Up Note Modal */}
      {commentingComplaintId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Add Officer Follow-Up Note
                </h3>
              </div>
              <button
                onClick={() => {
                  setCommentingComplaintId(null);
                  setCommentInput('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Follow-up Note / Officer Instruction *
              </label>
              <textarea
                rows={3}
                required
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Enter feedback, investigation findings, or operational guidance for the officiating team..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCommentingComplaintId(null);
                  setCommentInput('');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!commentInput.trim()}
                onClick={() => {
                  if (!commentingComplaintId || !commentInput.trim()) return;
                  addBookstandComplaintComment(
                    commentingComplaintId,
                    commentInput.trim(),
                    currentUser.name
                  );
                  setCommentingComplaintId(null);
                  setCommentInput('');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                Post Follow-Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
