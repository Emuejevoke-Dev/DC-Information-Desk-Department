import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatNaira } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { ImageUploadInput } from '../common/ImageUploadInput';
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
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { Book } from '../../types/models';

interface BookstandDashboardProps {
  onReturnToGeneral: () => void;
  onNavigateToFullModule?: () => void;
}

export const BookstandDashboard: React.FC<BookstandDashboardProps> = ({
  onReturnToGeneral,
}) => {
  const { currentUser, canManageBookstand } = useAuth();
  const {
    books,
    sales,
    stockMovements,
    addBook,
    recordDebtPayment,
    addStockMovement,
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'inventory' | 'debtors' | 'movements'>('inventory');
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

  const debtorsList = useMemo(
    () => sales.filter((s) => s.outstandingDebt > 0),
    [sales]
  );

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Officer Header with Clear Return Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#210936] via-[#3C1361] to-[#591C8F] text-white shadow-lg border border-purple-900/40">
        <div>
          <button
            onClick={onReturnToGeneral}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 text-xs font-bold mb-2.5 transition-colors cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to General Department Dashboard
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Bookstand Officer Dedicated Workspace
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30">
              Inventory & Debts
            </span>
          </div>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Live book catalogue, stock movements, member credit sales, debt recovery, and sales summaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canManageBookstand && (
            <button
              onClick={() => setIsAddBookModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer hover:scale-102"
            >
              <PlusCircle className="w-4 h-4 text-purple-950" />
              Add New Book
            </button>
          )}
          <button
            onClick={handleExportInventory}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-300" />
            Export Catalogue
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Units */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Books In Stock
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalStockUnits} Units
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {totalBooksCount} active published titles
          </p>
        </div>

        {/* Total Sales Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recorded Sales
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {formatNaira(totalSalesRevenue)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Cash collected: {formatNaira(totalCashCollected)}
          </p>
        </div>

        {/* Outstanding Debts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Customer Debts
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
            {formatNaira(totalDebts)}
          </p>
          <p className="text-[11px] text-amber-800 font-semibold mt-1">
            {debtorsList.length} outstanding debtor records
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Low Stock Warnings
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">
            {lowStockBooks.length} Titles
          </p>
          <p className="text-[11px] text-rose-700 font-medium mt-1">
            Reorder threshold reached
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

      {/* Tabs: Inventory Catalogue vs Debtor Ledger vs Stock Movements */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'inventory', label: `Book Catalogue (${books.length})` },
          { id: 'debtors', label: `Outstanding Debtors (${debtorsList.length})` },
          { id: 'movements', label: `Recent Stock Movements (${stockMovements.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === tab.id
                ? 'text-purple-700 border-b-2 border-purple-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: INVENTORY CATALOGUE */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
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
          </div>

          {/* Book Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBooks.map((book) => {
              const isLow = book.currentStock <= book.reorderThreshold;
              return (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={book.coverPhoto}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-2 right-2 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs ${
                          isLow
                            ? 'bg-rose-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {book.currentStock} in stock
                      </span>
                    </div>

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

      {/* ADD NEW BOOK MODAL WITH DIRECT PHOTO UPLOAD */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Add New Book to Bookstand Catalogue
              </h3>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBook} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Power of Personal Vision"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newBook.category}
                    onChange={(e) =>
                      setNewBook({ ...newBook, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
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

              {/* Direct Cover Image Upload from Camera or Gallery */}
              <ImageUploadInput
                label="Book Cover Image"
                value={newBook.coverPhoto}
                onChange={(dataUrl) => setNewBook({ ...newBook, coverPhoto: dataUrl })}
                aspectRatioHint="Portrait (3:4 ratio)"
                placeholderText="Take photo of book cover with mobile camera or choose from gallery"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price (NGN) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBook.sellingPrice}
                    onChange={(e) => setNewBook({ ...newBook, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cost Price (NGN)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newBook.costPrice}
                    onChange={(e) => setNewBook({ ...newBook, costPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Opening Stock Units *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBook.openingStock}
                    onChange={(e) => setNewBook({ ...newBook, openingStock: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md cursor-pointer"
                >
                  Save Book to Catalogue
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
    </div>
  );
};
