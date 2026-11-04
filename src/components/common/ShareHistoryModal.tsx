import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ShareHistoryEntry, ShareStatus } from '../../types/models';
import {
  History,
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  User,
  FileText,
  Filter,
  Trash2,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

interface ShareHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareHistoryModal: React.FC<ShareHistoryModalProps> = ({ isOpen, onClose }) => {
  const { isHOD, isOperations, isSecretary, isFinance } = useAuth();
  const { shareHistory, updateShareHistoryStatus, deleteShareHistoryEntry } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ShareStatus>('all');

  if (!isOpen) return null;

  const canManageShareHistory = isHOD || isOperations || isSecretary;

  const filteredHistory = shareHistory.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.recipientPhone.includes(searchQuery) ||
      entry.sharedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ShareStatus) => {
    switch (status) {
      case 'Confirmed shared':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
          </span>
        );
      case 'WhatsApp opened':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Clock className="w-3 h-3 text-blue-600" /> WhatsApp Opened
          </span>
        );
      case 'Pending confirmation':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Pending Confirmation
          </span>
        );
      case 'Prepared':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Prepared
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0B1528] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081020]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Department Document Sharing History & Tracking
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official audit trail of reports, forms, and registers dispatched via WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, recipient, phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs text-slate-400 mr-1 shrink-0">Status:</span>
            {(['all', 'Confirmed shared', 'WhatsApp opened', 'Pending confirmation', 'Prepared'] as const).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Records' : st}
                </button>
              )
            )}
          </div>
        </div>

        {/* Table / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No document sharing records found.</p>
              <p className="text-xs mt-1">Dispatched reports and forms will be tracked here automatically.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E172B] shadow-xs hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {item.documentTitle}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.documentType}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      Recipient: <strong>{item.recipientName}</strong>
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      {item.recipientPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.date).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>Dispatched By: {item.sharedBy}</span>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-slate-400 italic">Note: {item.notes}</p>
                  )}
                </div>

                {/* Status Update Dropdown for Authorized Admins */}
                {canManageShareHistory && (
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                    <select
                      value={item.status}
                      onChange={(e) => updateShareHistoryStatus(item.id, e.target.value as ShareStatus)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Prepared">Prepared</option>
                      <option value="WhatsApp opened">WhatsApp opened</option>
                      <option value="Confirmed shared">Confirmed shared</option>
                      <option value="Pending confirmation">Pending confirmation</option>
                    </select>

                    <button
                      onClick={() => {
                        if (confirm('Delete this share tracking record? Original document will NOT be affected.')) {
                          deleteShareHistoryEntry(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete record from tracking history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081020] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Total Shared Records: <strong>{shareHistory.length}</strong>
          </span>
          <span className="italic">
            Original records are permanently preserved and never archived or deleted upon sharing.
          </span>
        </div>
      </div>
    </div>
  );
};

