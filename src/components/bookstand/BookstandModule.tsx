import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Book, BookSale, StockMovement } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { exportToCSV } from '../../utils/exportUtils';
import { formatNaira } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  ShoppingBag,
  Plus,
  Search,
  Printer,
  Download,
  BookOpen,
  AlertTriangle,
  History,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  ShieldAlert,
  LayoutDashboard,
  PackageSearch,
  FileText,
  CheckCircle,
  Clock,
} from 'lucide-react';

export type BookstandTab =
  | 'overview'
  | 'inventory'
  | 'sales'
  | 'damaged'
  | 'missing'
  | 'debts'
  | 'reports';

export const BookstandModule: React.FC = () => {
  const { canViewBookstand, canManageBookstand, currentUser } = useAuth();
  const {
    books,
    sales,
    stockMovements,
    addBook,
    updateBook,
    recordBookSale,
    recordDebtPayment,
    addStockMovement,
  } = useData();

  const [activeTab, setActiveTab] = useState<BookstandTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isAddDamagedModalOpen, setIsAddDamagedModalOpen] = useState(false);
  const [isAddMissingModalOpen, setIsAddMissingModalOpen] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<BookSale | null>(null);
  const [selectedSaleHistory, setSelectedSaleHistory] = useState<BookSale | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Damaged and Missing Form states
  const [damagedForm, setDamagedForm] = useState({
    bookId: '',
    quantity: 1,
    reason: 'Cover torn and binding detached during transport',
  });

  const [missingForm, setMissingForm] = useState({
    bookId: '',
    quantity: 1,
    reason: 'Physical count discrepancy identified during Sunday service audit',
  });

  // New Book state
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: 'Dr. David Ogbueli',
    category: 'Spiritual Growth' as Book['category'],
    coverPhoto: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80',
    costPrice: 2000,
    sellingPrice: 3000,
    openingStock: 25,
    stockReceived: 0,
    reorderThreshold: 10,
  });

  // New Sale state
  const [saleFormData, setSaleFormData] = useState<{
    bookId: string;
    quantity: number;
    amountPaid: number;
    customerName: string;
    customerPhone: string;
    notes: string;
  }>({
    bookId: books[0]?.id || '',
    quantity: 1,
    amountPaid: 0,
    customerName: '',
    customerPhone: '',
    notes: '',
  });

  // Stock Movement state
  const [stockFormData, setStockFormData] = useState<{
    bookId: string;
    type: StockMovement['type'];
    quantity: number;
    reason: string;
  }>({
    bookId: books[0]?.id || '',
    type: 'Stock Delivery',
    quantity: 10,
    reason: 'Received restock from Dominion Publishing House.',
  });

  // Partial Payment state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  if (!canViewBookstand) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-12 text-center shadow-xs">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">
          Restricted Module: Bookstand Management
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Bookstand inventory, retail sales, and outstanding debtor registers are restricted to authorized Bookstand Officers and Department Leaders.
        </p>
      </div>
    );
  }

  // Summary Metrics
  const totalUnitsSold = sales.reduce(
    (acc, s) => acc + s.items.reduce((iAcc, item) => iAcc + item.quantity, 0),
    0
  );
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalCashCollected = sales.reduce((acc, s) => acc + s.amountPaid, 0);
  const totalOutstandingDebts = sales.reduce((acc, s) => acc + s.outstandingDebt, 0);
  const lowStockBooks = books.filter((b) => b.currentStock <= b.reorderThreshold);
  const unpaidSales = sales.filter((s) => s.outstandingDebt > 0);

  const damagedMovements = stockMovements.filter(
    (m) =>
      m.type === 'Damaged/Missing' ||
      m.reason.toLowerCase().includes('damaged') ||
      m.reason.toLowerCase().includes('broken') ||
      m.reason.toLowerCase().includes('defect') ||
      m.reason.toLowerCase().includes('torn')
  );

  const missingMovements = stockMovements.filter(
    (m) =>
      m.reason.toLowerCase().includes('missing') ||
      m.reason.toLowerCase().includes('discrepancy') ||
      m.reason.toLowerCase().includes('unaccounted')
  );

  const totalDamagedUnits = damagedMovements.reduce((sum, m) => sum + m.quantity, 0);
  const totalMissingUnits = missingMovements.reduce((sum, m) => sum + m.quantity, 0);
  const totalStockUnits = books.reduce((sum, b) => sum + b.currentStock, 0);
  const totalAssetCostValue = books.reduce((sum, b) => sum + (b.costPrice || b.sellingPrice * 0.7) * b.currentStock, 0);
  const totalAssetRetailValue = books.reduce((sum, b) => sum + b.sellingPrice * b.currentStock, 0);

  const filteredBooks = books.filter((b) => {
    return (
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFormData.title || !bookFormData.sellingPrice) {
      alert('Please fill out Book Title and Selling Price.');
      return;
    }

    addBook(bookFormData);
    setIsAddBookModalOpen(false);
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBook = books.find((b) => b.id === saleFormData.bookId);
    if (!selectedBook) return;

    if (saleFormData.quantity > selectedBook.currentStock) {
      alert(
        `Cannot sell ${saleFormData.quantity} copies. Only ${selectedBook.currentStock} copies are currently in stock.`
      );
      return;
    }

    const totalAmount = selectedBook.sellingPrice * saleFormData.quantity;
    const outstandingDebt = Math.max(0, totalAmount - saleFormData.amountPaid);
    const paymentStatus: BookSale['paymentStatus'] =
      outstandingDebt === 0 ? 'Paid' : saleFormData.amountPaid > 0 ? 'Partially Paid' : 'Unpaid';

    recordBookSale({
      saleDate: new Date().toISOString().split('T')[0],
      items: [
        {
          bookId: selectedBook.id,
          bookTitle: selectedBook.title,
          quantity: saleFormData.quantity,
          unitPrice: selectedBook.sellingPrice,
          subtotal: totalAmount,
        },
      ],
      totalAmount,
      amountPaid: saleFormData.amountPaid,
      outstandingDebt,
      paymentStatus,
      customerName: saleFormData.customerName || 'Walk-in Church Member',
      customerPhone: saleFormData.customerPhone,
      recordedBy: currentUser.name,
      notes: saleFormData.notes,
    });

    setIsNewSaleModalOpen(false);
    setSaleFormData({
      bookId: books[0]?.id || '',
      quantity: 1,
      amountPaid: 0,
      customerName: '',
      customerPhone: '',
      notes: '',
    });
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBook = books.find((b) => b.id === stockFormData.bookId);
    if (!selectedBook) return;

    addStockMovement({
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      type: stockFormData.type,
      quantity: stockFormData.quantity,
      reason: stockFormData.reason,
      recordedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
    });

    setIsAddStockModalOpen(false);
  };

  const handleDebtPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForPayment || paymentAmount <= 0) return;

    recordDebtPayment(selectedSaleForPayment.id, paymentAmount, currentUser.name);
    setSelectedSaleForPayment(null);
    setPaymentAmount(0);
    alert('Debt payment registered successfully!');
  };

  const handleLogDamaged = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBookId = damagedForm.bookId || books[0]?.id;
    const selectedBook = books.find((b) => b.id === targetBookId);
    if (!selectedBook || damagedForm.quantity <= 0) {
      alert('Please select a valid book title and quantity.');
      return;
    }

    addStockMovement({
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      type: 'Damaged/Missing',
      quantity: damagedForm.quantity,
      reason: `[Damaged/Broken] ${damagedForm.reason}`,
      recordedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
    });

    setIsAddDamagedModalOpen(false);
    setDamagedForm({
      bookId: books[0]?.id || '',
      quantity: 1,
      reason: 'Cover torn and binding detached during transport',
    });
    alert('Damaged book logged successfully for stock reconciliation.');
  };

  const handleLogMissing = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBookId = missingForm.bookId || books[0]?.id;
    const selectedBook = books.find((b) => b.id === targetBookId);
    if (!selectedBook || missingForm.quantity <= 0) {
      alert('Please select a valid book title and quantity.');
      return;
    }

    addStockMovement({
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      type: 'Damaged/Missing',
      quantity: missingForm.quantity,
      reason: `[Audit Discrepancy - Missing] ${missingForm.reason}`,
      recordedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
    });

    setIsAddMissingModalOpen(false);
    setMissingForm({
      bookId: books[0]?.id || '',
      quantity: 1,
      reason: 'Physical count discrepancy identified during Sunday service audit',
    });
    alert('Missing book audit discrepancy logged successfully.');
  };

  const handleExportCSV = () => {
    if (activeTab === 'inventory') {
      exportToCSV(books, 'DominionCity_Bookstand_Inventory', [
        { key: 'title', header: 'Book Title' },
        { key: 'author', header: 'Author' },
        { key: 'category', header: 'Category' },
        { key: 'sellingPrice', header: 'Selling Price (NGN)' },
        { key: 'currentStock', header: 'Current Stock' },
        { key: 'quantitySold', header: 'Quantity Sold' },
        { key: 'status', header: 'Stock Status' },
      ]);
    } else {
      exportToCSV(sales, 'DominionCity_Bookstand_Sales', [
        { key: 'saleDate', header: 'Date' },
        { key: 'customerName', header: 'Customer' },
        { key: 'customerPhone', header: 'Phone' },
        { key: 'totalAmount', header: 'Total (NGN)' },
        { key: 'amountPaid', header: 'Paid (NGN)' },
        { key: 'outstandingDebt', header: 'Debt (NGN)' },
        { key: 'paymentStatus', header: 'Payment Status' },
        { key: 'recordedBy', header: 'Officer' },
      ]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Bookstand Inventory, Sales & Debt Register
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking Dr. David Ogbueli books, stock deliveries, POS sales, and customer debt balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageBookstand && (
            <>
              <button
                onClick={() => setIsNewSaleModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Record Book Sale
              </button>
              <button
                onClick={() => setIsAddStockModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Log Stock Restock
              </button>
              <button
                onClick={() => setIsAddBookModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                New Book Title
              </button>
            </>
          )}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Revenue
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {formatNaira(totalSalesRevenue)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {totalUnitsSold} units sold
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Amount Collected
          </span>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {formatNaira(totalCashCollected)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Bank & POS settled</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Outstanding Debts
          </span>
          <p className="text-xl font-black text-amber-600 mt-1">
            {formatNaira(totalOutstandingDebts)}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
            {unpaidSales.length} open balance{unpaidSales.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Low Stock Alerts
          </span>
          <p className="text-xl font-black text-rose-600 mt-1">
            {lowStockBooks.length} Titles
          </p>
          <span className="text-[11px] text-rose-600 font-medium mt-1 block">
            Threshold alert active
          </span>
        </div>
      </div>

      {/* 7 Core Sub Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        {[
          { id: 'overview', label: '1. Overview', icon: LayoutDashboard },
          { id: 'inventory', label: `2. Book Inventory (${books.length})`, icon: BookOpen },
          { id: 'sales', label: `3. Sales & Transactions (${sales.length})`, icon: CreditCard },
          { id: 'damaged', label: `4. Damaged / Broken (${damagedMovements.length})`, icon: AlertTriangle },
          { id: 'missing', label: `5. Missing Books (${missingMovements.length})`, icon: PackageSearch },
          { id: 'debts', label: `6. Debtors & Payments (${unpaidSales.length})`, icon: DollarSign },
          { id: 'reports', label: '7. Reports & Valuation', icon: Printer },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BookstandTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Quick Action Hub for Officers */}
          <div className="bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-purple-950 dark:text-purple-200">
                Bookstand Fast Action Center
              </h3>
              <p className="text-xs text-purple-700/80 dark:text-purple-300">
                Authorized officers can log retail sales, audit discrepancies, and deliveries directly.
              </p>
            </div>
            {canManageBookstand && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsNewSaleModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Record Sale
                </button>
                <button
                  onClick={() => setIsAddStockModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  Log Restock
                </button>
                <button
                  onClick={() => setIsAddDamagedModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 shadow-xs cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Log Damaged
                </button>
                <button
                  onClick={() => setIsAddMissingModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer"
                >
                  <PackageSearch className="w-4 h-4" />
                  Log Missing
                </button>
              </div>
            )}
          </div>

          {/* Low Stock Warning */}
          {lowStockBooks.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 p-4 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 dark:text-rose-200">
                    Reorder Notice: {lowStockBooks.length} Titles Below Minimum Threshold
                  </h4>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                    {lowStockBooks.map((b) => `${b.title} (${b.currentStock} left)`).join(' • ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shrink-0"
              >
                Inspect Inventory →
              </button>
            </div>
          )}

          {/* Dual Ledger Overview: Recent Sales & Recent Stock Movements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Sales */}
            <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  Recent Retail Sales ({sales.slice(0, 5).length})
                </h4>
                <button
                  onClick={() => setActiveTab('sales')}
                  className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
              <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{sale.customerName}</p>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(sale.saleDate)} • {sale.items.map((i) => `${i.quantity}x ${i.bookTitle}`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 dark:text-white block">
                        {formatNaira(sale.totalAmount)}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          sale.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Movements */}
            <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Recent Inventory Movements
                </h4>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                >
                  Reports →
                </button>
              </div>
              <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                {stockMovements.slice(0, 5).map((sm) => (
                  <div key={sm.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{sm.bookTitle}</p>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(sm.date)} • {sm.reason}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sm.type} ({sm.quantity})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Book Inventory */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredBooks.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <img
                  src={b.coverPhoto}
                  alt={b.title}
                  className="w-full h-44 object-cover bg-slate-100"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {b.category}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        b.status === 'In Stock'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">{b.title}</h3>
                  <p className="text-[11px] text-slate-500">{b.author}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Selling Price</span>
                      <span className="text-sm font-black text-purple-700">
                        {formatNaira(b.sellingPrice)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Current Stock</span>
                      <span
                        className={`text-sm font-black ${
                          b.currentStock <= b.reorderThreshold
                            ? 'text-rose-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {b.currentStock} copies
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {canManageBookstand && (
                <div className="p-4 pt-0">
                  <button
                    onClick={() => {
                      setSaleFormData({ ...saleFormData, bookId: b.id });
                      setIsNewSaleModalOpen(true);
                    }}
                    disabled={b.currentStock <= 0}
                    className="w-full py-1.5 text-xs font-bold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Sell Copy
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sales History Tab */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Books Sold</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Debt</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Officer</th>
                  <th className="p-3 text-right">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-medium text-slate-900">{formatDate(sale.saleDate)}</td>
                    <td className="p-3">
                      <span className="font-bold">{sale.customerName}</span> <br />
                      <span className="text-[10px] text-slate-400 font-mono">
                        {sale.customerPhone}
                      </span>
                    </td>
                    <td className="p-3">
                      {sale.items.map((i, idx) => (
                        <div key={idx} className="line-clamp-1">
                          {i.quantity}x {i.bookTitle}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-right font-black">{formatNaira(sale.totalAmount)}</td>
                    <td className="p-3 text-right text-emerald-600 font-bold">
                      {formatNaira(sale.amountPaid)}
                    </td>
                    <td className="p-3 text-right text-amber-600 font-bold">
                      {sale.outstandingDebt > 0 ? formatNaira(sale.outstandingDebt) : '₦0'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">{sale.recordedBy}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedSaleHistory(sale)}
                        className="p-1 text-slate-500 hover:text-purple-600 rounded"
                        title="View Payments History"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Debtors Register Tab */}
      {activeTab === 'debts' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-amber-50/50 border-b border-amber-100 text-xs text-amber-900">
            <strong>Debtors Register:</strong> Church members and leaders with outstanding balances on books collected. You can record partial or full debt payments below.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Items Collected</th>
                  <th className="p-3 text-right">Total (₦)</th>
                  <th className="p-3 text-right">Paid (₦)</th>
                  <th className="p-3 text-right">Outstanding (₦)</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {unpaidSales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                      🎉 No outstanding book debts on record!
                    </td>
                  </tr>
                ) : (
                  unpaidSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-amber-50/40">
                      <td className="p-3 font-medium">{formatDate(sale.saleDate)}</td>
                      <td className="p-3 font-bold text-slate-900">{sale.customerName}</td>
                      <td className="p-3 font-mono text-[11px]">{sale.customerPhone || 'N/A'}</td>
                      <td className="p-3">
                        {sale.items.map((i) => `${i.quantity}x ${i.bookTitle}`).join(', ')}
                      </td>
                      <td className="p-3 text-right">{formatNaira(sale.totalAmount)}</td>
                      <td className="p-3 text-right text-emerald-600 font-bold">
                        {formatNaira(sale.amountPaid)}
                      </td>
                      <td className="p-3 text-right text-amber-600 font-black">
                        {formatNaira(sale.outstandingDebt)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedSaleForPayment(sale);
                            setPaymentAmount(sale.outstandingDebt);
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                        >
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Damaged or Broken Books */}
      {activeTab === 'damaged' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-600 text-white shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                  Departmental Policy: Damaged & Broken Literature
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 max-w-2xl leading-relaxed">
                  Damaged books (water damage, broken spine, torn covers, misprints) are recorded strictly for inventory reconciliation and publisher returns. <strong>Damaged books are operational write-offs and are NEVER assigned as financial debts to any church member or officer.</strong>
                </p>
              </div>
            </div>
            {canManageBookstand && (
              <button
                onClick={() => setIsAddDamagedModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Log Damaged Copy
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Damaged Copies Register ({damagedMovements.length} records • {totalDamagedUnits} total copies)
              </span>
              <span className="text-[11px] text-slate-400">Status: Reconciled Operational Loss</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Date Recorded</th>
                    <th className="p-3">Book Title</th>
                    <th className="p-3 text-right">Qty Damaged</th>
                    <th className="p-3">Nature of Damage / Defect</th>
                    <th className="p-3">Logged By</th>
                    <th className="p-3 text-center">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {damagedMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        ✨ No damaged or broken books recorded in this period.
                      </td>
                    </tr>
                  ) : (
                    damagedMovements.map((dm) => (
                      <tr key={dm.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-medium">{formatDate(dm.date)}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{dm.bookTitle}</td>
                        <td className="p-3 text-right font-black text-amber-600">{dm.quantity}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{dm.reason}</td>
                        <td className="p-3 text-slate-500 text-[11px]">{dm.recordedBy}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                            Inventory Write-Off (Non-Debt)
                          </span>
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

      {/* Tab 5: Missing Books */}
      {activeTab === 'missing' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
                <PackageSearch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-950 dark:text-rose-200 uppercase tracking-wide">
                  Audit Assurance: Missing Literature & Count Discrepancies
                </h4>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 max-w-2xl leading-relaxed">
                  Entries here represent physical count discrepancies identified during departmental stock audits. <strong>A missing item is an open administrative investigation and is NEVER automatically assigned as a personal financial debt.</strong>
                </p>
              </div>
            </div>
            {canManageBookstand && (
              <button
                onClick={() => setIsAddMissingModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Log Audit Discrepancy
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Audit Discrepancies Register ({missingMovements.length} records • {totalMissingUnits} unaccounted units)
              </span>
              <span className="text-[11px] text-slate-400">Status: Administrative Investigation</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Audit Date</th>
                    <th className="p-3">Book Title</th>
                    <th className="p-3 text-right">Qty Missing</th>
                    <th className="p-3">Audit Circumstance / Notes</th>
                    <th className="p-3">Auditing Officer</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {missingMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        🎉 All physical counts are 100% reconciled! No missing literature on record.
                      </td>
                    </tr>
                  ) : (
                    missingMovements.map((mm) => (
                      <tr key={mm.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-medium">{formatDate(mm.date)}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{mm.bookTitle}</td>
                        <td className="p-3 text-right font-black text-rose-600">{mm.quantity}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{mm.reason}</td>
                        <td className="p-3 text-slate-500 text-[11px]">{mm.recordedBy}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                            Under Pastoral / Audit Review
                          </span>
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

      {/* Tab 7: Reports & Valuation */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E172B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Official Book Stand Financial & Valuation Report
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dominion City Asaba • Publications Asset Assessment & Audit Statement
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print Official Audit Statement
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Current Stock Units
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {totalStockUnits} copies
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Across {books.length} publications
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Stock Valuation (At Retail)
                </span>
                <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {formatNaira(totalAssetRetailValue)}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Cost Value: {formatNaira(totalAssetCostValue)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Cash Realized
                </span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatNaira(totalCashCollected)}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  {totalUnitsSold} total copies sold
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Outstanding Receivables
                </span>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {formatNaira(totalOutstandingDebts)}
                </p>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 block">
                  {unpaidSales.length} open debtor balances
                </span>
              </div>
            </div>
          </div>

          {/* Full Stock Audit Log */}
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Complete Inventory Movement Ledger ({stockMovements.length} total entries)
              </h4>
              <span className="text-[11px] text-slate-400">All Restocks, Damages & Adjustments</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Book Title</th>
                    <th className="p-3">Movement Type</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3">Reason / Details</th>
                    <th className="p-3">Recorded Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {stockMovements.map((sm) => (
                    <tr key={sm.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-medium">{formatDate(sm.date)}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{sm.bookTitle}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                          {sm.type}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-purple-700 dark:text-purple-400">
                        {sm.quantity}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{sm.reason}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{sm.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Book Modal */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add New Book to Catalogue</h3>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engaging the Holy Spirit"
                  value={bookFormData.title}
                  onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Author</label>
                  <input
                    type="text"
                    value={bookFormData.author}
                    onChange={(e) =>
                      setBookFormData({ ...bookFormData, author: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={bookFormData.category}
                    onChange={(e) =>
                      setBookFormData({
                        ...bookFormData,
                        category: e.target.value as Book['category'],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                  >
                    <option value="Spiritual Growth">Spiritual Growth</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Prayer & Fasting">Prayer & Fasting</option>
                    <option value="Purpose & Destiny">Purpose & Destiny</option>
                    <option value="Finance & Stewardship">Finance & Stewardship</option>
                    <option value="Relationships">Relationships</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Selling Price (₦) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={bookFormData.sellingPrice}
                    onChange={(e) =>
                      setBookFormData({
                        ...bookFormData,
                        sellingPrice: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cost Price (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={bookFormData.costPrice}
                    onChange={(e) =>
                      setBookFormData({
                        ...bookFormData,
                        costPrice: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opening Stock *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bookFormData.openingStock}
                    onChange={(e) =>
                      setBookFormData({
                        ...bookFormData,
                        openingStock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Low Stock Reorder Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bookFormData.reorderThreshold}
                    onChange={(e) =>
                      setBookFormData({
                        ...bookFormData,
                        reorderThreshold: parseInt(e.target.value) || 10,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                  />
                </div>
              </div>

              <ImageUploadInput
                label="Book Cover Photo (Camera or Gallery)"
                value={bookFormData.coverPhoto}
                onChange={(dataUrl) =>
                  setBookFormData({ ...bookFormData, coverPhoto: dataUrl })
                }
                aspectRatioHint="Portrait (3:4)"
                placeholderText="Take photo of book cover or choose from gallery"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 cursor-pointer shadow-xs"
                >
                  Add Title to Catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      {isNewSaleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Record Bookstand Retail Sale</h3>
              <button
                onClick={() => setIsNewSaleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Book Title *</label>
                <select
                  value={saleFormData.bookId}
                  onChange={(e) => setSaleFormData({ ...saleFormData, bookId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600 font-semibold"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.currentStock <= 0}>
                      {b.title} — {formatNaira(b.sellingPrice)} ({b.currentStock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity Sold *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={saleFormData.quantity}
                    onChange={(e) =>
                      setSaleFormData({
                        ...saleFormData,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Amount Paid Now (₦) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={saleFormData.amountPaid}
                    onChange={(e) =>
                      setSaleFormData({
                        ...saleFormData,
                        amountPaid: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bro. Anthony Kalu"
                    value={saleFormData.customerName}
                    onChange={(e) =>
                      setSaleFormData({ ...saleFormData, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Customer Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+234..."
                    value={saleFormData.customerPhone}
                    onChange={(e) =>
                      setSaleFormData({ ...saleFormData, customerPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transaction Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via POS / promised balance next Sunday"
                  value={saleFormData.notes}
                  onChange={(e) => setSaleFormData({ ...saleFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewSaleModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 cursor-pointer shadow-xs"
                >
                  Confirm & Complete Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Debt Payment Modal */}
      {selectedSaleForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Record Debt Payment</h3>
              <button
                onClick={() => setSelectedSaleForPayment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
              <p className="font-bold text-amber-950">
                Customer: {selectedSaleForPayment.customerName}
              </p>
              <p className="text-amber-800 mt-0.5">
                Outstanding Balance:{' '}
                <strong className="text-sm font-black">
                  {formatNaira(selectedSaleForPayment.outstandingDebt)}
                </strong>
              </p>
            </div>

            <form onSubmit={handleDebtPaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Payment Installment Amount (₦) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedSaleForPayment.outstandingDebt}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedSaleForPayment(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History View Modal */}
      {selectedSaleHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Payment Installment History</h3>
              <button
                onClick={() => setSelectedSaleHistory(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 bg-slate-50 rounded-xl text-xs">
              <p className="font-bold text-slate-900">{selectedSaleHistory.customerName}</p>
              <p className="text-slate-500">
                Total: {formatNaira(selectedSaleHistory.totalAmount)} | Remaining:{' '}
                {formatNaira(selectedSaleHistory.outstandingDebt)}
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedSaleHistory.payments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No payments recorded.</p>
              ) : (
                selectedSaleHistory.payments.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-100 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-emerald-700">{formatNaira(p.amount)}</span>
                      <p className="text-[10px] text-slate-400">
                        {p.date} • Ref: {p.receiptNumber}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500">{p.recordedBy}</span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedSaleHistory(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Damaged Literature Modal */}
      {isAddDamagedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Log Damaged / Broken Copy</h3>
              </div>
              <button
                onClick={() => setIsAddDamagedModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs">
              <p className="font-bold text-amber-950 dark:text-amber-200">
                Departmental Policy Reminder
              </p>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                Damaged literature is an operational stock reconciliation. It is permanently written off from active inventory and <strong>NEVER</strong> registered as a member debt.
              </p>
            </div>

            <form onSubmit={handleLogDamaged} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Book Title *
                </label>
                <select
                  value={damagedForm.bookId || books[0]?.id || ''}
                  onChange={(e) => setDamagedForm({ ...damagedForm, bookId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-amber-600 font-semibold text-slate-900 dark:text-white"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} (Stock: {b.currentStock} copies)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Quantity Damaged *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={damagedForm.quantity}
                  onChange={(e) =>
                    setDamagedForm({
                      ...damagedForm,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-amber-600 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nature of Damage / Defect Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Spine unglued and missing chapters 3-4 from printer shipment..."
                  value={damagedForm.reason}
                  onChange={(e) => setDamagedForm({ ...damagedForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-amber-600 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDamagedModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 cursor-pointer shadow-xs"
                >
                  Log Operational Loss
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Missing Literature Modal */}
      {isAddMissingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                  <PackageSearch className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Log Physical Count Discrepancy</h3>
              </div>
              <button
                onClick={() => setIsAddMissingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs">
              <p className="font-bold text-rose-950 dark:text-rose-200">
                Audit Separation Assurance
              </p>
              <p className="text-rose-800 dark:text-rose-300 mt-0.5">
                Discrepancies initiate an audit investigation under pastoral oversight. This record is completely decoupled from the Debtors Register.
              </p>
            </div>

            <form onSubmit={handleLogMissing} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Book Title *
                </label>
                <select
                  value={missingForm.bookId || books[0]?.id || ''}
                  onChange={(e) => setMissingForm({ ...missingForm, bookId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-rose-600 font-semibold text-slate-900 dark:text-white"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} (Stock: {b.currentStock} copies)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Quantity Unaccounted For *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={missingForm.quantity}
                  onChange={(e) =>
                    setMissingForm({
                      ...missingForm,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-rose-600 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Audit Circumstance / Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Audit conducted following Midweek service showed 3 fewer copies than system balance..."
                  value={missingForm.reason}
                  onChange={(e) => setMissingForm({ ...missingForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-rose-600 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMissingModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 cursor-pointer shadow-xs"
                >
                  Record Audit Discrepancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="DOMINION CITY ASABA — BOOKSTAND INVENTORY & DEBT REPORT"
        subtitle={`Department Publications Audit • Current Stock & Sales`}
        documentRef={`BOOK-${new Date().getFullYear()}`}
        isConfidential={true}
        preparedBy="Brother Kelechi Obi (Bookstand Officer)"
      >
        <div className="space-y-4">
          <table className="w-full text-[11px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-purple-900 text-white font-bold">
                <th className="p-2 border border-slate-300 text-left">Book Title</th>
                <th className="p-2 border border-slate-300 text-left">Author</th>
                <th className="p-2 border border-slate-300 text-right">Price (₦)</th>
                <th className="p-2 border border-slate-300 text-right">Sold</th>
                <th className="p-2 border border-slate-300 text-right">Current Stock</th>
                <th className="p-2 border border-slate-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b, idx) => (
                <tr key={b.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2 border border-slate-300 font-bold">{b.title}</td>
                  <td className="p-2 border border-slate-300">{b.author}</td>
                  <td className="p-2 border border-slate-300 text-right font-bold">
                    {formatNaira(b.sellingPrice)}
                  </td>
                  <td className="p-2 border border-slate-300 text-right">{b.quantitySold}</td>
                  <td className="p-2 border border-slate-300 text-right font-bold">
                    {b.currentStock}
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-bold">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrintModal>
    </div>
  );
};
