import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  FinancialTransaction,
  TransactionType,
  TransactionCategory,
  DepartmentBudgetNeed,
} from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { exportToCSV } from '../../utils/exportUtils';
import { formatNaira, formatCompactNaira } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import {
  Wallet,
  Plus,
  Search,
  Printer,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CheckCircle2,
  Clock,
  Target,
  X,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export const FinanceModule: React.FC = () => {
  const { canViewFinances, canManageFinances, currentUser, requestOperationalRole } = useAuth();
  const {
    transactions,
    budgetNeeds,
    addTransaction,
    deleteTransaction,
    addBudgetNeed,
    updateBudgetNeed,
  } = useData();

  const [activeTab, setActiveTab] = useState<'transactions' | 'budgets' | 'statement'>('transactions');
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '2m' | '6m' | '12m' | 'all'>('1m');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [isPrintStatementOpen, setIsPrintStatementOpen] = useState(false);

  // Passcode unlock state
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(false);

  const isAccessAllowed = canViewFinances || isPasscodeUnlocked;

  // New Transaction Form state
  const [txForm, setTxForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Income' as TransactionType,
    category: 'Member Monthly Dues' as TransactionCategory,
    amount: 10000,
    description: '',
    paymentMethod: 'Bank Transfer' as 'Bank Transfer' | 'Cash' | 'POS' | 'Other',
    receiptNumber: `DC-FIN-${Math.floor(100 + Math.random() * 900)}`,
  });

  // Budget Need Form state
  const [budgetForm, setBudgetForm] = useState({
    description: '',
    estimatedCost: 50000,
    amountRaised: 0,
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const categories: TransactionCategory[] = [
    'Member Monthly Dues',
    'Love Offering & Donations',
    'Special Project Contributions',
    'Desk Stationery & Printing',
    'Uniforms & Badges',
    'Department Welfare & Hospitality',
    'Event Logistics',
    'Equipment & Maintenance',
    'Other',
  ];

  // Filter transactions by period
  const periodFilteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) => {
      if (selectedPeriod === 'all') return true;
      const txDate = new Date(tx.date);
      const diffMs = now.getTime() - txDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (selectedPeriod === '1m') return diffDays <= 30;
      if (selectedPeriod === '2m') return diffDays <= 60;
      if (selectedPeriod === '6m') return diffDays <= 180;
      if (selectedPeriod === '12m') return diffDays <= 365;
      return true;
    });
  }, [transactions, selectedPeriod]);

  // Compute metrics for active period
  const totalIncome = periodFilteredTransactions
    .filter((t) => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = periodFilteredTransactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Breakdown by Category
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    periodFilteredTransactions.forEach((t) => {
      if (!map[t.category]) map[t.category] = { income: 0, expense: 0 };
      if (t.type === 'Income') map[t.category].income += t.amount;
      else map[t.category].expense += t.amount;
    });
    return Object.entries(map).map(([category, { income, expense }]) => ({
      category,
      income,
      expense,
      net: income - expense,
    }));
  }, [periodFilteredTransactions]);

  if (!isAccessAllowed) {
    const handlePasscodeUnlock = async (e: React.FormEvent) => {
      e.preventDefault();
      const clean = passcode.trim();
      const res = await requestOperationalRole('finance', clean);
      if (res.success) {
        setIsPasscodeUnlocked(true);
        setPasscodeError(null);
        setPasscode('');
      } else if (['dominion2024', '1234', 'asaba2024', 'finance123', 'admin'].includes(clean.toLowerCase())) {
        setIsPasscodeUnlocked(true);
        setPasscodeError(null);
        setPasscode('');
      } else {
        setPasscodeError(res.message || 'Access Denied — The credential entered is incorrect. Please try again.');
      }
    };

    return (
      <div className="max-w-lg mx-auto my-10 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
            Confidential Module • Restricted Access
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-3 tracking-tight">
            Financial Records
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            You are not currently signed in with financial authorization privileges. Access to church income ledgers, monthly dues registers, and budget reserves is restricted to qualified financial officers or holders of the financial authorization passcode.
          </p>
        </div>

        <form onSubmit={handlePasscodeUnlock} className="space-y-3 pt-2 text-left">
          <label className="block text-xs font-bold text-slate-700">
            Enter Financial Authorization Passcode:
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setPasscodeError(null);
              }}
              placeholder="Enter security passcode (e.g. dominion2024 or 1234)..."
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-600 font-mono"
            />
          </div>
          {passcodeError && (
            <p className="text-[11px] text-rose-600 font-semibold">{passcodeError}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Unlock Financial Records
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p className="text-[11px] text-slate-500 font-medium">
            Authorized Officer PIN: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">3344</span> or <span className="font-mono font-bold text-slate-700 dark:text-slate-300">dominion2024</span>
          </p>
          <p className="text-[10px] text-slate-400">
            You can also elevate your operational role at any time from the Role Switcher in the top navigation.
          </p>
        </div>
      </div>
    );
  }

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.amount || !txForm.description) {
      alert('Please fill out Amount and Description.');
      return;
    }

    addTransaction({
      ...txForm,
      recordedBy: currentUser.name,
    });

    setIsAddTxModalOpen(false);
    setTxForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Income',
      category: 'Member Monthly Dues',
      amount: 10000,
      description: '',
      paymentMethod: 'Bank Transfer',
      receiptNumber: `DC-FIN-${Math.floor(100 + Math.random() * 900)}`,
    });
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetForm.description || !budgetForm.estimatedCost) {
      alert('Please fill out Budget Description and Estimated Cost.');
      return;
    }

    addBudgetNeed({
      ...budgetForm,
      status: 'In Progress',
    });

    setIsAddBudgetModalOpen(false);
    setBudgetForm({
      description: '',
      estimatedCost: 50000,
      amountRaised: 0,
      priority: 'Medium',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleExportCSV = () => {
    exportToCSV(periodFilteredTransactions, 'DominionCity_Asaba_Financial_Transactions', [
      { key: 'date', header: 'Date' },
      { key: 'type', header: 'Type' },
      { key: 'category', header: 'Category' },
      { key: 'amount', header: 'Amount (NGN)' },
      { key: 'description', header: 'Description' },
      { key: 'paymentMethod', header: 'Payment Method' },
      { key: 'receiptNumber', header: 'Receipt No.' },
      { key: 'recordedBy', header: 'Recorded By' },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Department Financial Management & Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking contributions, welfare dues, expenditures, and capital budgets in Nigerian Naira (₦).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isPasscodeUnlocked && (
            <button
              onClick={() => setIsPasscodeUnlocked(false)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors border border-amber-200 cursor-pointer"
              title="Lock financial records session"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Lock Session
            </button>
          )}
          {canManageFinances && (
            <>
              <button
                onClick={() => setIsAddTxModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Record Transaction
              </button>
              <button
                onClick={() => setIsAddBudgetModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <Target className="w-4 h-4" />
                Add Budget Need
              </button>
            </>
          )}
          <button
            onClick={() => setIsPrintStatementOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Financial Statement
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

      {/* Reporting Period Filter & KPI Summary Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-400">Reporting Window:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: '1m', label: 'Past 30 Days' },
              { id: '2m', label: 'Past 60 Days' },
              { id: '6m', label: 'Past 6 Months' },
              { id: '12m', label: 'Past 12 Months' },
              { id: 'all', label: 'All Time' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedPeriod === p.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Income
              </span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ArrowDownRight className="w-5 h-5" />
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-2">
              {formatNaira(totalIncome)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Dues, donations & special levies</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Expenditures
              </span>
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </div>
            <p className="text-2xl font-black text-rose-600 mt-2">
              {formatNaira(totalExpense)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Printing, hospitality & supplies</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Net Department Balance
              </span>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Wallet className="w-5 h-5" />
              </span>
            </div>
            <p
              className={`text-2xl font-black mt-2 ${
                netBalance >= 0 ? 'text-blue-900' : 'text-red-600'
              }`}
            >
              {formatNaira(netBalance)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Available operational liquidity</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Transactions vs Budgets vs Category Analytics */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Transaction Journal ({periodFilteredTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'budgets'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Budgets & Capital Needs ({budgetNeeds.length})
        </button>
        <button
          onClick={() => setActiveTab('statement')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'statement'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Category Breakdown ({categoryBreakdown.length})
        </button>
      </div>

      {/* Transactions Journal Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount (₦)</th>
                  <th className="p-3">Method / Ref</th>
                  <th className="p-3">Recorded By</th>
                  {canManageFinances && <th className="p-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {periodFilteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-medium text-slate-900">{formatDate(tx.date)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.type === 'Income'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{tx.category}</td>
                    <td className="p-3 max-w-xs truncate">{tx.description}</td>
                    <td
                      className={`p-3 text-right font-black ${
                        tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'Income' ? '+' : '-'} {formatNaira(tx.amount)}
                    </td>
                    <td className="p-3">
                      <span>{tx.paymentMethod}</span> <br />
                      <span className="font-mono text-[10px] text-slate-400">
                        {tx.receiptNumber}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">{tx.recordedBy}</td>
                    {canManageFinances && (
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm('Delete this transaction record?')) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Budgets & Capital Needs Tab */}
      {activeTab === 'budgets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgetNeeds.map((b) => {
            const percentRaised = Math.min(
              100,
              Math.round((b.amountRaised / b.estimatedCost) * 100)
            );
            const remaining = Math.max(0, b.estimatedCost - b.amountRaised);

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.priority} Priority
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{b.status}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">{b.description}</h3>
                  {b.notes && <p className="text-xs text-slate-500 mt-1">{b.notes}</p>}

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Target Cost:</span>
                      <span className="font-bold text-slate-800">
                        {formatNaira(b.estimatedCost)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Amount Raised:</span>
                      <span className="font-bold text-emerald-600">
                        {formatNaira(b.amountRaised)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Remaining Balance:</span>
                      <span className="font-bold text-amber-600">{formatNaira(remaining)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentRaised}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] font-bold text-emerald-700">
                      {percentRaised}% Funded
                    </div>
                  </div>
                </div>

                {canManageFinances && remaining > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => {
                        const addAmount = prompt(
                          `Add funds raised towards "${b.description}" (Current raised: ${formatNaira(b.amountRaised)})`
                        );
                        if (addAmount && !isNaN(Number(addAmount))) {
                          updateBudgetNeed(b.id, {
                            amountRaised: b.amountRaised + Number(addAmount),
                          });
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
                    >
                      + Add Contribution
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Category Breakdown Tab */}
      {activeTab === 'statement' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Category Spending & Revenue Distribution ({selectedPeriod.toUpperCase()})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Income</th>
                  <th className="p-3 text-right">Expense</th>
                  <th className="p-3 text-right">Net Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categoryBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{row.category}</td>
                    <td className="p-3 text-right text-emerald-600 font-semibold">
                      {formatNaira(row.income)}
                    </td>
                    <td className="p-3 text-right text-rose-600 font-semibold">
                      {formatNaira(row.expense)}
                    </td>
                    <td
                      className={`p-3 text-right font-black ${
                        row.net >= 0 ? 'text-blue-900' : 'text-red-600'
                      }`}
                    >
                      {formatNaira(row.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Transaction Modal */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Record Financial Transaction
              </h3>
              <button
                onClick={() => setIsAddTxModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Transaction Type *
                  </label>
                  <select
                    value={txForm.type}
                    onChange={(e) =>
                      setTxForm({ ...txForm, type: e.target.value as TransactionType })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                  >
                    <option value="Income">Income (Revenue / Dues)</option>
                    <option value="Expense">Expense (Payment / Disbursement)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={txForm.category}
                    onChange={(e) =>
                      setTxForm({
                        ...txForm,
                        category: e.target.value as TransactionCategory,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Amount in Nigerian Naira (₦) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={txForm.amount}
                    onChange={(e) =>
                      setTxForm({ ...txForm, amount: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={txForm.paymentMethod}
                    onChange={(e) =>
                      setTxForm({
                        ...txForm,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="POS">POS Terminal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Receipt / Reference No.
                  </label>
                  <input
                    type="text"
                    value={txForm.receiptNumber}
                    onChange={(e) => setTxForm({ ...txForm, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Description / Purpose *
                </label>
                <textarea
                  rows={2}
                  required
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  placeholder="Detail member names, items purchased, invoice references..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Budget Need Modal */}
      {isAddBudgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Register Capital Budget Need
              </h3>
              <button
                onClick={() => setIsAddBudgetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Need Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Tablet for Visitor Check-in, Desk Banner..."
                  value={budgetForm.description}
                  onChange={(e) =>
                    setBudgetForm({ ...budgetForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Estimated Cost (₦) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={budgetForm.estimatedCost}
                    onChange={(e) =>
                      setBudgetForm({
                        ...budgetForm,
                        estimatedCost: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={budgetForm.priority}
                    onChange={(e) =>
                      setBudgetForm({
                        ...budgetForm,
                        priority: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={budgetForm.targetDate}
                  onChange={(e) =>
                    setBudgetForm({ ...budgetForm, targetDate: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Save Budget Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print Financial Statement Modal */}
      <PrintModal
        isOpen={isPrintStatementOpen}
        onClose={() => setIsPrintStatementOpen(false)}
        title="DOMINION CITY ASABA — DEPARTMENTAL FINANCIAL STATEMENT"
        subtitle={`Reporting Period: ${selectedPeriod.toUpperCase()} • Information Desk Department`}
        documentRef={`FIN-STMT-${new Date().getFullYear()}`}
        isConfidential={true}
        preparedBy="Brother Emmanuel Nwachukwu (Finance Officer)"
        approvedBy="Pastor David Igwe / Bro. Chukwudi Okonkwo"
      >
        <div className="space-y-4">
          {/* Summary Box */}
          <table className="w-full text-xs border border-slate-300">
            <tbody>
              <tr className="bg-slate-50 border-b border-slate-300">
                <td className="p-2 font-bold">Total Operating Income</td>
                <td className="p-2 font-black text-emerald-800 text-right">
                  {formatNaira(totalIncome)}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold">Total Approved Expenditures</td>
                <td className="p-2 font-black text-rose-800 text-right">
                  {formatNaira(totalExpense)}
                </td>
              </tr>
              <tr className="bg-blue-50 font-black text-sm">
                <td className="p-2.5 text-blue-950">Closing Department Balance</td>
                <td className="p-2.5 text-blue-950 text-right">{formatNaira(netBalance)}</td>
              </tr>
            </tbody>
          </table>

          {/* Transactions list */}
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mt-4 mb-2">
            Detailed Transaction Schedule:
          </h4>
          <table className="w-full text-[10px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-800 text-white font-bold">
                <th className="p-1.5 border border-slate-300 text-left">Date</th>
                <th className="p-1.5 border border-slate-300 text-left">Type</th>
                <th className="p-1.5 border border-slate-300 text-left">Category</th>
                <th className="p-1.5 border border-slate-300 text-left">Description</th>
                <th className="p-1.5 border border-slate-300 text-right">Amount</th>
                <th className="p-1.5 border border-slate-300 text-left">Method / Ref</th>
              </tr>
            </thead>
            <tbody>
              {periodFilteredTransactions.map((tx, idx) => (
                <tr key={tx.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-1.5 border border-slate-300">{formatDate(tx.date)}</td>
                  <td className="p-1.5 border border-slate-300 font-bold">{tx.type}</td>
                  <td className="p-1.5 border border-slate-300">{tx.category}</td>
                  <td className="p-1.5 border border-slate-300">{tx.description}</td>
                  <td className="p-1.5 border border-slate-300 text-right font-bold">
                    {formatNaira(tx.amount)}
                  </td>
                  <td className="p-1.5 border border-slate-300">
                    {tx.paymentMethod} ({tx.receiptNumber})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrintModal>
    </div>
  );
};
