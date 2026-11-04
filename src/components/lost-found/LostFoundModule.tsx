import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LostItem, ItemCategory } from '../../types/models';
import { RecordFoundItemModal } from './RecordFoundItemModal';
import { PrintModal } from '../common/PrintModal';
import { exportToCSV } from '../../utils/exportUtils';
import { formatDate } from '../../utils/dateUtils';
import {
  PackageSearch,
  Plus,
  Search,
  CheckCircle,
  Printer,
  Download,
  History,
  LayoutGrid,
  Table as TableIcon,
  X,
  Edit2,
  Trash2,
  UserCheck,
} from 'lucide-react';

export const LostFoundModule: React.FC = () => {
  const { currentUser, canManageMembers, isHOD, isOperations, isSecretary } = useAuth();
  const { lostItems, claimLostItem, returnLostItem, deleteLostItem } = useData();

  const isAuthorized = canManageMembers || isHOD || isOperations || isSecretary;

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LostItem | null>(null);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<LostItem | null>(null);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState<LostItem | null>(null);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<LostItem | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Claim form state
  const [claimData, setClaimData] = useState({
    claimant: '',
    phone: '',
    witness: currentUser.name,
    notes: '',
  });

  // Return form state
  const [returnData, setReturnData] = useState({
    dateReturned: new Date().toISOString().split('T')[0],
    notes: 'Physical custody released and handed over to verified owner.',
  });

  const categories: ItemCategory[] = [
    'Bibles & Books',
    'Phones & Electronics',
    'Bags & Purses',
    'Jewelry & Watches',
    'Clothing & Shawls',
    'Keys & IDs',
    'Baby Items',
    'Other',
  ];

  // Filtering
  const filteredItems = lostItems.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.locationFound.toLowerCase().includes(q) ||
      item.recordedBy.toLowerCase().includes(q) ||
      (item.collectedBy && item.collectedBy.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setIsRecordModalOpen(true);
  };

  const handleOpenEditModal = (item: LostItem) => {
    setEditingItem(item);
    setIsRecordModalOpen(true);
  };

  const handleDeleteItem = (item: LostItem) => {
    if (confirm(`Are you sure you want to delete the record for "${item.name}"?\n\nThis will remove the item from active lost and found records.`)) {
      deleteLostItem(item.id);
    }
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForClaim || !claimData.claimant || !claimData.phone) {
      alert('Please provide the claimant full legal name and phone number.');
      return;
    }
    claimLostItem(
      selectedItemForClaim.id,
      claimData.claimant,
      claimData.phone,
      claimData.witness,
      claimData.notes
    );
    setSelectedItemForClaim(null);
    setClaimData({ claimant: '', phone: '', witness: currentUser.name, notes: '' });
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForReturn) return;
    returnLostItem(
      selectedItemForReturn.id,
      returnData.dateReturned,
      returnData.notes
    );
    setSelectedItemForReturn(null);
    setReturnData({
      dateReturned: new Date().toISOString().split('T')[0],
      notes: 'Physical custody released and handed over to verified owner.',
    });
  };

  const handleExportCSV = () => {
    exportToCSV(filteredItems, 'DominionCity_Asaba_LostAndFound_Register', [
      { key: 'name', header: 'Item Name' },
      { key: 'category', header: 'Category' },
      { key: 'status', header: 'Status' },
      { key: 'locationFound', header: 'Location Found' },
      { key: 'dateFound', header: 'Date Found' },
      { key: 'recordedBy', header: 'Logged / Recovered By' },
      { key: 'collectedBy', header: 'Claimant' },
      { key: 'recoveryDate', header: 'Date Returned' },
      { key: 'notes', header: 'Custodial Notes' },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Action & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0E172B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 shadow-2xs">
              <PackageSearch className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Lost & Found Custodial Register
              </h2>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 ml-2">
                Custody & Return Log
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking forgotten and retrieved property with full audit trails and custodial protection ({lostItems.length} items logged).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Found Item
          </button>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Register
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search item, location, finder, claimant..."
            className="lost-found-input w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="lost-found-input px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium cursor-pointer"
          >
            <option value="All">All Statuses ({lostItems.length})</option>
            <option value="Unclaimed">Found / Unclaimed</option>
            <option value="Claimed">Claimed</option>
            <option value="Returned">Returned to Owner</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="lost-found-input px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const isUnclaimed = item.status === 'Unclaimed';
            const isClaimed = item.status === 'Claimed';
            const isReturned = item.status === 'Returned';

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative">
                    <img
                      src={item.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-full h-44 object-cover bg-slate-100 dark:bg-slate-800"
                    />
                    <span
                      className={`absolute top-2.5 right-2.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-xs ${
                        isUnclaimed
                          ? 'bg-amber-500 text-white'
                          : isClaimed
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isUnclaimed ? 'Found (Unclaimed)' : isClaimed ? 'Claimed' : 'Returned'}
                    </span>
                    <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-slate-900/80 text-white font-medium backdrop-blur-xs">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white break-words">{item.name}</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words whitespace-pre-line">
                      {item.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <p>
                        <strong>Location Found:</strong> {item.locationFound}
                      </p>
                      <p>
                        <strong>Date Found:</strong> {formatDate(item.dateFound)} {item.timeFound ? `(${item.timeFound})` : ''}
                      </p>
                      <p>
                        <strong>Logged / Found By:</strong> {item.recordedBy}
                      </p>
                      {item.collectedBy && (
                        <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-[10px] text-blue-900 dark:text-blue-300">
                          <strong>Claimant:</strong> {item.collectedBy}
                        </div>
                      )}
                      {item.recoveryDate && (
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-[10px] text-emerald-900 dark:text-emerald-300">
                          <strong>Returned to Owner:</strong> {item.recoveryDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setSelectedItemForHistory(item)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      Audit ({item.history?.length || 0})
                    </button>

                    {isAuthorized && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                          title="Edit Item Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                          title="Delete Item Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions according to status */}
                  <div className="pt-1 flex items-center gap-1.5">
                    {isUnclaimed && (
                      <button
                        onClick={() => setSelectedItemForClaim(item)}
                        className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verify & Claim
                      </button>
                    )}

                    {isClaimed && (
                      <button
                        onClick={() => setSelectedItemForReturn(item)}
                        className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Release & Return to Owner
                      </button>
                    )}

                    {isReturned && (
                      <div className="w-full text-center py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900">
                        ✓ Restored to Owner
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location Found</th>
                  <th className="p-3">Date Found</th>
                  <th className="p-3">Logged By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Claimant / Return</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80'}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3">{item.locationFound}</td>
                    <td className="p-3">
                      {item.dateFound} <br />
                      <span className="text-[10px] text-slate-400">{item.timeFound}</span>
                    </td>
                    <td className="p-3">{item.recordedBy}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Unclaimed'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : item.status === 'Claimed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {item.status === 'Unclaimed' ? 'Found' : item.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.collectedBy ? (
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.collectedBy}</p>
                          {item.recoveryDate && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{item.recoveryDate}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedItemForHistory(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded cursor-pointer"
                          title="View Audit History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        {isAuthorized && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded cursor-pointer"
                              title="Edit Record"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {item.status === 'Unclaimed' && (
                          <button
                            onClick={() => setSelectedItemForClaim(item)}
                            className="px-2 py-1 text-[11px] font-bold bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                          >
                            Claim
                          </button>
                        )}
                        {item.status === 'Claimed' && (
                          <button
                            onClick={() => setSelectedItemForReturn(item)}
                            className="px-2 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                          >
                            Return
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record / Edit Found Item Modal (Isolated State Component) */}
      <RecordFoundItemModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
      />

      {/* Claim Recovery Modal */}
      {selectedItemForClaim && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Verify & Claim Found Item</h3>
              <button
                onClick={() => setSelectedItemForClaim(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-bold">Item: {selectedItemForClaim.name}</p>
              <p className="text-[11px] mt-0.5">Found at: {selectedItemForClaim.locationFound}</p>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Claimant Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Stella Obiora"
                  value={claimData.claimant}
                  onChange={(e) => setClaimData({ ...claimData, claimant: e.target.value })}
                  className="lost-found-input w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Claimant Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+234..."
                  value={claimData.phone}
                  onChange={(e) => setClaimData({ ...claimData, phone: e.target.value })}
                  className="lost-found-input w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Desk Verification Officer / Witness
                </label>
                <input
                  type="text"
                  value={claimData.witness}
                  onChange={(e) => setClaimData({ ...claimData, witness: e.target.value })}
                  className="lost-found-input w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Verification Notes / Identification Proof
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe how ownership was proven (e.g. phone PIN unlocked, ID presented, photo match)..."
                  value={claimData.notes}
                  onChange={(e) => setClaimData({ ...claimData, notes: e.target.value })}
                  className="lost-found-input w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedItemForClaim(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return to Owner Modal */}
      {selectedItemForReturn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Release & Return Item to Owner</h3>
              <button
                onClick={() => setSelectedItemForReturn(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200">
              <p className="font-bold">Item: {selectedItemForReturn.name}</p>
              <p className="text-[11px] mt-0.5">Verified Claimant: {selectedItemForReturn.collectedBy || 'Registered Claimant'}</p>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Date Physically Returned *
                </label>
                <input
                  type="date"
                  required
                  value={returnData.dateReturned}
                  onChange={(e) => setReturnData({ ...returnData, dateReturned: e.target.value })}
                  className="lost-found-input w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Handover Notes & Custody Release Confirmation
                </label>
                <textarea
                  rows={2}
                  value={returnData.notes}
                  onChange={(e) => setReturnData({ ...returnData, notes: e.target.value })}
                  className="lost-found-input w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedItemForReturn(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Physical Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {selectedItemForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Item Custodial Audit Trail</h3>
              <button
                onClick={() => setSelectedItemForHistory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">{selectedItemForHistory.name}</h4>
              <p className="text-[11px] text-slate-500">ID: {selectedItemForHistory.id}</p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
              {selectedItemForHistory.history?.map((h) => (
                <div
                  key={h.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 dark:text-blue-400">{h.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(h.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">By: {h.performedBy}</p>
                  {h.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                      "{h.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-4 text-right">
              <button
                onClick={() => setSelectedItemForHistory(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Lost & Found Register */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="DOMINION CITY ASABA — LOST & FOUND PROPERTY CUSTODIAL REGISTER"
        subtitle="Departmental Custody, Claim Verification & Property Restitution Log"
        documentRef={`LF-REG-${new Date().getFullYear()}`}
        isConfidential={true}
      >
        <table className="w-full text-[11px] border-collapse border border-slate-300">
          <thead>
            <tr className="bg-amber-800 text-white font-bold">
              <th className="p-2 border border-slate-300 text-left">S/N</th>
              <th className="p-2 border border-slate-300 text-left">Item Name</th>
              <th className="p-2 border border-slate-300 text-left">Category</th>
              <th className="p-2 border border-slate-300 text-left">Location Found</th>
              <th className="p-2 border border-slate-300 text-left">Date Found</th>
              <th className="p-2 border border-slate-300 text-left">Logged By</th>
              <th className="p-2 border border-slate-300 text-left">Status</th>
              <th className="p-2 border border-slate-300 text-left">Claimant / Restitution</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                <td className="p-2 border border-slate-300 font-bold">{item.name}</td>
                <td className="p-2 border border-slate-300">{item.category}</td>
                <td className="p-2 border border-slate-300">{item.locationFound}</td>
                <td className="p-2 border border-slate-300">{item.dateFound}</td>
                <td className="p-2 border border-slate-300">{item.recordedBy}</td>
                <td className="p-2 border border-slate-300 font-bold">{item.status}</td>
                <td className="p-2 border border-slate-300">
                  {item.collectedBy ? `${item.collectedBy} (${item.recoveryDate || 'Claimed'})` : 'In Custody'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PrintModal>
    </div>
  );
};
