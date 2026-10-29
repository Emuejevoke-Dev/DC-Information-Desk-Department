import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatNaira } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  PlusCircle,
  ArrowLeft,
  Calendar,
  Filter,
  Download,
  Search,
  CheckCircle2,
  Clock,
  ShoppingBag,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { FinancialTransaction, TransactionCategory } from '../../types/models';

interface FinanceDashboardProps {
  onReturnToGeneral: () => void;
  onNavigateToFullModule?: () => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  onReturnToGeneral,
  onNavigateToFullModule,
}) => {
  const { currentUser, canManageFinances } = useAuth();
  const { transactions, budgetNeeds, sales, addTransaction } = useData();

  const [dateFilter, setDateFilter] = useState<'1m' | '2m' | '6m' | '12m' | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

  // New Transaction Form State
  const [newTx, setNewTx] = useState<{
    date: string;
    type: 'Income' | 'Expense';
    category: TransactionCategory;
    amount: string;
    description: string;
    paymentMethod: 'Bank Transfer' | 'Cash' | 'POS' | 'Other';
    receiptNumber: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    type: 'Income',
    category: 'Member Monthly Dues',
    amount: '',
    description: '',
    paymentMethod: 'Bank Transfer',
    receiptNumber: '',
  });

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      if (dateFilter === '1m') {
        const d = new Date();
        d.setMonth(now.getMonth() - 1);
        if (txDate < d) return false;
      } else if (dateFilter === '2m') {
        const d = new Date();
        d.setMonth(now.getMonth() - 2);
        if (txDate < d) return false;
      } else if (dateFilter === '6m') {
        const d = new Date();
        d.setMonth(now.getMonth() - 6);
        if (txDate < d) return false;
      } else if (dateFilter === '12m') {
        const d = new Date();
        d.setFullYear(now.getFullYear() - 1);
        if (txDate < d) return false;
      }

      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          tx.description.toLowerCase().includes(term) ||
          tx.category.toLowerCase().includes(term) ||
          (tx.receiptNumber && tx.receiptNumber.toLowerCase().includes(term))
        );
      }

      return true;
    });
  }, [transactions, dateFilter, categoryFilter, searchTerm]);

  // Aggregate Calculations
  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpense = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const netBalance = totalIncome - totalExpense;

  // Bookstand Financial Cross-Summary
  const totalBookSalesRevenue = useMemo(
    () => sales.reduce((sum, s) => sum + s.totalAmount, 0),
    [sales]
  );
  const totalBookDebts = useMemo(
    () => sales.reduce((sum, s) => sum + s.outstandingDebt, 0),
    [sales]
  );
  const totalBookstandCashReceived = useMemo(
    () => sales.reduce((sum, s) => sum + s.amountPaid, 0),
    [sales]
  );

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || parseFloat(newTx.amount) <= 0 || !newTx.description) {
      alert('Please enter valid amount and description.');
      return;
    }

    addTransaction({
      date: newTx.date,
      type: newTx.type,
      category: newTx.category,
      amount: parseFloat(newTx.amount),
      description: newTx.description,
      paymentMethod: newTx.paymentMethod,
      receiptNumber: newTx.receiptNumber.trim() || undefined,
      recordedBy: currentUser.name,
    });

    setIsNewTxModalOpen(false);
    setNewTx({
      date: new Date().toISOString().split('T')[0],
      type: 'Income',
      category: 'Member Monthly Dues',
      amount: '',
      description: '',
      paymentMethod: 'Bank Transfer',
      receiptNumber: '',
    });
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredTransactions.map((t) => ({
        Date: t.date,
        Type: t.type,
        Category: t.category,
        Amount: t.amount,
        Description: t.description,
        PaymentMethod: t.paymentMethod,
        ReceiptNumber: t.receiptNumber || 'N/A',
        RecordedBy: t.recordedBy,
      })),
      `DC_Asaba_Financial_Report_${dateFilter}_${new Date().toISOString().split('T')[0]}`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Officer Header with Clear Return Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#061838] via-[#0E2E69] to-[#124294] text-white shadow-lg border border-blue-900/40">
        <div>
          <button
            onClick={onReturnToGeneral}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 text-xs font-bold mb-2.5 transition-colors cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to General Department Dashboard
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Financial Officer Dedicated Workspace
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
              Restricted Confidential
            </span>
          </div>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            Departmental income, expenditures, budgets, Bookstand financial audit, and audited ledger for Dominion City Asaba.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canManageFinances && (
            <button
              onClick={() => setIsNewTxModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Record Transaction
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-300" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Period:
          </span>
          {[
            { id: '1m', label: 'Past 1 Month' },
            { id: '2m', label: 'Past 2 Months' },
            { id: '6m', label: 'Past 6 Months' },
            { id: '12m', label: 'Past 12 Months' },
            { id: 'all', label: 'All History' },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setDateFilter(period.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dateFilter === period.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredTransactions.length}</span> recorded entries
        </div>
      </div>

      {/* Primary KPI Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Current Balance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Department Current Balance
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {formatNaira(netBalance)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Reconciled bank and physical cash custody
          </p>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Inflows (Income)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {formatNaira(totalIncome)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Dues, donations, & offerings in period
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Outflows (Expenses)
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">
            {formatNaira(totalExpense)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Stationery, welfare, uniforms & operations
          </p>
        </div>

        {/* Bookstand Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bookstand Cash Received
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-700 mt-2">
            {formatNaira(totalBookstandCashReceived)}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            Debts pending: {formatNaira(totalBookDebts)}
          </p>
        </div>
      </div>

      {/* Planned Financial Needs & Budget Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Departmental Budget Needs & Project Targets
            </h3>
            <p className="text-xs text-slate-500">
              Planned investments, outreach logistics, and fundraising progress
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
            {budgetNeeds.filter((b) => b.status === 'In Progress' || b.status === 'Planned').length} Active Needs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetNeeds.map((need) => {
            const pct = Math.min(100, Math.round((need.amountRaised / need.estimatedCost) * 100));
            const remaining = Math.max(0, need.estimatedCost - need.amountRaised);

            return (
              <div
                key={need.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {need.description}
                  </h4>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-black uppercase shrink-0 ${
                      need.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {need.priority}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Target Cost:</span>
                    <span className="font-bold text-slate-800">
                      {formatNaira(need.estimatedCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Raised:</span>
                    <span className="font-bold text-emerald-600">
                      {formatNaira(need.amountRaised)} ({pct}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Remaining:</span>
                    <span className="font-semibold text-amber-700">
                      {formatNaira(remaining)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Target Date: {formatDate(need.targetDate)}</span>
                  <span className="capitalize font-semibold text-slate-600">{need.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Transaction Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Financial Transaction Register
            </h3>
            <p className="text-xs text-slate-500">
              Audited income entries, approved expenses, and supporting voucher records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search description or receipt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Member Monthly Dues">Member Monthly Dues</option>
              <option value="Love Offering & Donations">Love Offering & Donations</option>
              <option value="Desk Stationery & Printing">Desk Stationery & Printing</option>
              <option value="Uniforms & Badges">Uniforms & Badges</option>
              <option value="Department Welfare & Hospitality">Welfare & Hospitality</option>
              <option value="Event Logistics">Event Logistics</option>
            </select>
          </div>
        </div>

        {/* Responsive Table / Mobile Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category & Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount (NGN)</th>
                <th className="py-3 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tx.type === 'Income'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.type === 'Income' ? '+' : '-'} {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{tx.category}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">
                        {tx.description}
                      </p>
                      {tx.receiptNumber && (
                        <span className="text-[10px] text-blue-600 font-mono">
                          Ref: {tx.receiptNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-black text-sm ${
                          tx.type === 'Income' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {tx.type === 'Income' ? '+' : '-'} {formatNaira(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {tx.recordedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Transaction Modal */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Record New Financial Transaction
              </h3>
              <button
                onClick={() => setIsNewTxModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newTx.date}
                    onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transaction Type *
                  </label>
                  <select
                    value={newTx.type}
                    onChange={(e) =>
                      setNewTx({ ...newTx, type: e.target.value as 'Income' | 'Expense' })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Income">Income (+)</option>
                    <option value="Expense">Expense (-)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newTx.category}
                    onChange={(e) =>
                      setNewTx({ ...newTx, category: e.target.value as TransactionCategory })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Member Monthly Dues">Member Monthly Dues</option>
                    <option value="Love Offering & Donations">Love Offering & Donations</option>
                    <option value="Special Project Contributions">Special Project Contributions</option>
                    <option value="Desk Stationery & Printing">Desk Stationery & Printing</option>
                    <option value="Uniforms & Badges">Uniforms & Badges</option>
                    <option value="Department Welfare & Hospitality">Welfare & Hospitality</option>
                    <option value="Event Logistics">Event Logistics</option>
                    <option value="Equipment & Maintenance">Equipment & Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount in Naira (NGN) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="e.g. 15000"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Purpose *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Purchase of 500 visitor cell orientation slips"
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={newTx.paymentMethod}
                    onChange={(e) =>
                      setNewTx({
                        ...newTx,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="POS">POS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receipt / Reference No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REC-2026-088"
                    value={newTx.receiptNumber}
                    onChange={(e) => setNewTx({ ...newTx, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
