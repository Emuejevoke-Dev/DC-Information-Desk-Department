import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LostItem, LostItemStatus, ItemCategory } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { exportToCSV } from '../../utils/exportUtils';
import { formatDate } from '../../utils/dateUtils';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  PackageSearch,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Eye,
  History,
  LayoutGrid,
  Table as TableIcon,
  X,
  ShieldAlert,
} from 'lucide-react';

export const LostFoundModule: React.FC = () => {
  const { currentUser, canManageMembers } = useAuth();
  const { lostItems, addLostItem, updateLostItem, claimLostItem } = useData();

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<LostItem | null>(null);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState<LostItem | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // New item form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: ItemCategory;
    photoUrl: string;
    dateFound: string;
    timeFound: string;
    locationFound: string;
    reportingWing: 'Desk A — Left Wing' | 'Desk B — Right Wing';
    dateReceived: string;
    recordedBy: string;
    notes: string;
    isPubliclyVisible: boolean;
  }>({
    name: '',
    description: '',
    category: 'Bibles & Books',
    photoUrl: '',
    dateFound: new Date().toISOString().split('T')[0],
    timeFound: '11:00 AM',
    locationFound: '',
    reportingWing: 'Desk A — Left Wing',
    dateReceived: new Date().toISOString().split('T')[0],
    recordedBy: currentUser.name,
    notes: '',
    isPubliclyVisible: true,
  });

  // Claim form state
  const [claimData, setClaimData] = useState({
    claimant: '',
    phone: '',
    witness: currentUser.name,
    notes: '',
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
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationFound.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.locationFound) {
      alert('Please fill out the item name and location where it was found.');
      return;
    }
    addLostItem({
      ...formData,
      status: 'Unclaimed',
      recordedBy: currentUser.name,
    });
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      description: '',
      category: 'Bibles & Books',
      photoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
      dateFound: new Date().toISOString().split('T')[0],
      timeFound: '11:00 AM',
      locationFound: '',
      reportingWing: 'Desk A — Left Wing',
      dateReceived: new Date().toISOString().split('T')[0],
      recordedBy: currentUser.name,
      notes: '',
      isPubliclyVisible: true,
    });
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForClaim || !claimData.claimant || !claimData.phone) {
      alert('Please provide the claimant name and phone number.');
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

  const handleExportCSV = () => {
    exportToCSV(filteredItems, 'DominionCity_Asaba_LostAndFound', [
      { key: 'name', header: 'Item Name' },
      { key: 'category', header: 'Category' },
      { key: 'status', header: 'Status' },
      { key: 'locationFound', header: 'Location Found' },
      { key: 'dateFound', header: 'Date Found' },
      { key: 'recordedBy', header: 'Recorded By' },
      { key: 'collectedBy', header: 'Claimant (Private)' },
      { key: 'recoveryDate', header: 'Recovery Date' },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Action & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <PackageSearch className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Lost & Found Management Register
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking forgotten and retrieved property with full audit trails and custodial protection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Found Item
          </button>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Register
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-100">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, description, location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Unclaimed">Unclaimed Only</option>
            <option value="Claimed">Claimed / Returned</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600 font-medium"
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
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative">
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-full h-44 object-cover bg-slate-100"
                  />
                  <span
                    className={`absolute top-2.5 right-2.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-xs ${
                      item.status === 'Unclaimed'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-slate-900/80 text-white font-medium backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                    <p>
                      <strong>Found at:</strong> {item.locationFound}
                    </p>
                    <p>
                      <strong>Date:</strong> {formatDate(item.dateFound)} ({item.timeFound})
                    </p>
                    <p>
                      <strong>Logged by:</strong> {item.recordedBy}
                    </p>
                    {item.collectedBy && (
                      <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-800">
                        <strong>Claimed by:</strong> {item.collectedBy} on {item.recoveryDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
                <button
                  onClick={() => setSelectedItemForHistory(item)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  Audit ({item.history.length})
                </button>

                {item.status === 'Unclaimed' && (
                  <button
                    onClick={() => setSelectedItemForClaim(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Verify & Claim
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location Found</th>
                  <th className="p-3">Date / Time</th>
                  <th className="p-3">Logged By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
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
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedItemForHistory(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        {item.status === 'Unclaimed' && (
                          <button
                            onClick={() => setSelectedItemForClaim(item)}
                            className="px-2 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            Claim
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

      {/* Add New Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Log New Found Item</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leather Bible, Smartphone, Keyring..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ItemCategory })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date Found *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateFound}
                    onChange={(e) => setFormData({ ...formData, dateFound: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time Found</label>
                  <input
                    type="text"
                    value={formData.timeFound}
                    onChange={(e) => setFormData({ ...formData, timeFound: e.target.value })}
                    placeholder="e.g. 11:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Desk Wing Location</label>
                  <select
                    value={formData.reportingWing}
                    onChange={(e) =>
                      setFormData({ ...formData, reportingWing: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600 font-semibold text-blue-900"
                  >
                    <option value="Desk A — Left Wing">Desk A — Left Wing</option>
                    <option value="Desk B — Right Wing">Desk B — Right Wing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location Found in Church *</label>
                <input
                  type="text"
                  required
                  value={formData.locationFound}
                  onChange={(e) => setFormData({ ...formData, locationFound: e.target.value })}
                  placeholder="e.g. Row 14 Gallery, Main Auditorium..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <ImageUploadInput
                label="Item Photograph (Camera or Gallery)"
                value={formData.photoUrl}
                onChange={(dataUrl) => setFormData({ ...formData, photoUrl: dataUrl })}
                aspectRatioHint="Square (1:1)"
                placeholderText="Take photo of found item with mobile camera or choose from gallery"
              />

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Color, brand, distinguishing marks..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={formData.isPubliclyVisible}
                  onChange={(e) =>
                    setFormData({ ...formData, isPubliclyVisible: e.target.checked })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="pub-check" className="text-slate-600">
                  Allow safe preview on public Information Desk Kiosk
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Save Item Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Recovery Modal */}
      {selectedItemForClaim && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Release & Claim Item</h3>
              <button
                onClick={() => setSelectedItemForClaim(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <p className="font-bold">Item: {selectedItemForClaim.name}</p>
              <p className="text-[11px] mt-0.5">Found: {selectedItemForClaim.locationFound}</p>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Claimant Legal Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Stella Obiora"
                  value={claimData.claimant}
                  onChange={(e) => setClaimData({ ...claimData, claimant: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Claimant Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+234..."
                  value={claimData.phone}
                  onChange={(e) => setClaimData({ ...claimData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Desk Officer Witness *
                </label>
                <input
                  type="text"
                  required
                  value={claimData.witness}
                  onChange={(e) => setClaimData({ ...claimData, witness: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Verification Notes / ID Reference
                </label>
                <textarea
                  rows={2}
                  value={claimData.notes}
                  onChange={(e) => setClaimData({ ...claimData, notes: e.target.value })}
                  placeholder="Verified by biometric fingerprint / ID card..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedItemForClaim(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Confirm Claim & Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Audit Trail History Modal */}
      {selectedItemForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Custodial Audit Trail</h3>
              </div>
              <button
                onClick={() => setSelectedItemForHistory(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">{selectedItemForHistory.name}</p>
              <p className="text-slate-500">ID: {selectedItemForHistory.id}</p>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedItemForHistory.history.map((hist, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span>{new Date(hist.timestamp).toLocaleString()}</span>
                    <span className="font-semibold text-blue-700">{hist.performedBy}</span>
                  </div>
                  <p className="font-bold text-slate-800 mt-1">{hist.action}</p>
                  {hist.notes && <p className="text-slate-600 mt-0.5">{hist.notes}</p>}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedItemForHistory(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Register Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="DOMINION CITY ASABA — LOST & FOUND REGISTER"
        subtitle="Departmental Custody and Recovery Status Report"
        documentRef={`LNF-REG-${new Date().getFullYear()}`}
      >
        <table className="w-full text-[11px] border-collapse border border-slate-300">
          <thead>
            <tr className="bg-blue-900 text-white font-bold">
              <th className="p-2 border border-slate-300 text-left">Ref ID</th>
              <th className="p-2 border border-slate-300 text-left">Item Name</th>
              <th className="p-2 border border-slate-300 text-left">Category</th>
              <th className="p-2 border border-slate-300 text-left">Found Location</th>
              <th className="p-2 border border-slate-300 text-left">Date Logged</th>
              <th className="p-2 border border-slate-300 text-left">Status</th>
              <th className="p-2 border border-slate-300 text-left">Claimant Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border border-slate-300 font-mono text-[10px]">{item.id}</td>
                <td className="p-2 border border-slate-300 font-bold">{item.name}</td>
                <td className="p-2 border border-slate-300">{item.category}</td>
                <td className="p-2 border border-slate-300">{item.locationFound}</td>
                <td className="p-2 border border-slate-300">{item.dateFound}</td>
                <td className="p-2 border border-slate-300 font-bold">
                  {item.status}
                </td>
                <td className="p-2 border border-slate-300 text-[10px]">
                  {item.collectedBy ? (
                    <>
                      {item.collectedBy} ({item.recoveryDate})
                    </>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PrintModal>
    </div>
  );
};
