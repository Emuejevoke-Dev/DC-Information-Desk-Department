import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CellMeeting } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { exportToCSV } from '../../utils/exportUtils';
import {
  MapPin,
  Plus,
  Search,
  Printer,
  Download,
  Phone,
  Clock,
  Compass,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const CellMeetingsModule: React.FC = () => {
  const { currentUser, canManageMembers } = useAuth();
  const { cells, addCell, updateCell, deleteCell } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<CellMeeting | null>(null);
  const [selectedCellForSlip, setSelectedCellForSlip] = useState<CellMeeting | null>(null);
  const [isPrintDirectoryOpen, setIsPrintDirectoryOpen] = useState(false);

  const neighborhoods = [
    'All',
    'Summit Road',
    'Okpanam Road',
    'Nnebisi Road',
    'GRA Phase 1',
    'Cable Point',
    'Infant Jesus Road',
    'DBS Road',
    'Jesus Saves Road',
  ];

  const [formData, setFormData] = useState({
    cellName: '',
    leaderName: '',
    leaderPhone: '',
    neighborhood: 'Summit Road',
    locationAddress: '',
    meetingDay: 'Wednesday',
    meetingTime: '06:00 PM - 07:00 PM',
    format: 'Physical' as 'Physical' | 'Online' | 'Hybrid',
    directions: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const filteredCells = cells.filter((c) => {
    const matchesNeighborhood =
      selectedNeighborhood === 'All' ||
      c.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      c.cellName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.locationAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNeighborhood && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cellName || !formData.leaderName || !formData.locationAddress) {
      alert('Please fill out the Cell Name, Leader Name, and Location Address.');
      return;
    }

    if (editingCell) {
      updateCell(editingCell.id, formData);
      setEditingCell(null);
    } else {
      addCell(formData);
    }

    setIsAddModalOpen(false);
    setFormData({
      cellName: '',
      leaderName: '',
      leaderPhone: '',
      neighborhood: 'Summit Road',
      locationAddress: '',
      meetingDay: 'Wednesday',
      meetingTime: '06:00 PM - 07:00 PM',
      format: 'Physical',
      directions: '',
      status: 'Active',
    });
  };

  const handleEditClick = (c: CellMeeting) => {
    setEditingCell(c);
    setFormData({
      cellName: c.cellName,
      leaderName: c.leaderName,
      leaderPhone: c.leaderPhone,
      neighborhood: c.neighborhood,
      locationAddress: c.locationAddress,
      meetingDay: c.meetingDay,
      meetingTime: c.meetingTime,
      format: c.format,
      directions: c.directions,
      status: c.status,
    });
    setIsAddModalOpen(true);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredCells, 'DominionCity_Asaba_CellMeetings', [
      { key: 'cellName', header: 'Cell Name' },
      { key: 'neighborhood', header: 'Neighborhood Zone' },
      { key: 'locationAddress', header: 'Meeting Address' },
      { key: 'meetingDay', header: 'Meeting Day' },
      { key: 'meetingTime', header: 'Meeting Time' },
      { key: 'format', header: 'Format' },
      { key: 'leaderName', header: 'Leader Name' },
      { key: 'leaderPhone', header: 'Leader Phone' },
      { key: 'directions', header: 'Directions' },
      { key: 'status', header: 'Status' },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <MapPin className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Cell Meetings Directory — Asaba
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Searchable registry of cell fellowships across Asaba neighborhoods for fast church visitor placement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageMembers && (
            <button
              onClick={() => {
                setEditingCell(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Cell Group
            </button>
          )}
          <button
            onClick={() => setIsPrintDirectoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Directory
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

      {/* Filter Chips & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Zone:</span>
          {neighborhoods.map((n) => (
            <button
              key={n}
              onClick={() => setSelectedNeighborhood(n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                selectedNeighborhood === n
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cell or leader..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
          />
        </div>
      </div>

      {/* Cells Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCells.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {c.neighborhood}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{c.cellName}</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                  {c.format}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{c.locationAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {c.meetingDay}s at {c.meetingTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">
                    Leader: {c.leaderName} ({c.leaderPhone})
                  </span>
                </div>
                {c.directions && (
                  <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-500 border border-slate-100 mt-1">
                    <strong>Landmark:</strong> {c.directions}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedCellForSlip(c)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Slip
              </button>

              {canManageMembers && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(c)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete cell group "${c.cellName}"?`)) {
                        deleteCell(c.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Cell Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingCell ? 'Edit Cell Record' : 'Register New Cell Fellowship'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cell Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grace & Truth Cell Fellowship"
                  value={formData.cellName}
                  onChange={(e) => setFormData({ ...formData, cellName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Neighborhood Zone in Asaba *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summit Road, Okpanam..."
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Meeting Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        format: e.target.value as 'Physical' | 'Online' | 'Hybrid',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  >
                    <option value="Physical">Physical</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Full Location Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="No. and street address in Asaba..."
                  value={formData.locationAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, locationAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cell Leader Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brother Emmanuel Nwachukwu"
                    value={formData.leaderName}
                    onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Leader Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+234..."
                    value={formData.leaderPhone}
                    onChange={(e) => setFormData({ ...formData, leaderPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Meeting Day</label>
                  <input
                    type="text"
                    value={formData.meetingDay}
                    onChange={(e) => setFormData({ ...formData, meetingDay: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Meeting Time</label>
                  <input
                    type="text"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                    placeholder="e.g. 06:00 PM - 07:00 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Directions & Landmark</label>
                <textarea
                  rows={2}
                  value={formData.directions}
                  onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
                  placeholder="e.g. Opposite Sweet Spirit Hotel, 2nd compound on left..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
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
                  {editingCell ? 'Update Record' : 'Save Cell'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Slip Print Modal */}
      {selectedCellForSlip && (
        <PrintModal
          isOpen={true}
          onClose={() => setSelectedCellForSlip(null)}
          title="DOMINION CITY CELL FELLOWSHIP INVITATION SLIP"
          subtitle="Official Visitor Cell Connection Slip • Asaba"
          documentRef={`CELL-${selectedCellForSlip.id}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl text-center">
              <h2 className="text-lg font-black text-blue-950 uppercase">
                {selectedCellForSlip.cellName}
              </h2>
              <p className="text-xs font-semibold text-blue-800 mt-0.5">
                Neighborhood Zone: {selectedCellForSlip.neighborhood}
              </p>
            </div>

            <table className="w-full text-xs border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold bg-slate-100 w-1/3">Meeting Venue</td>
                  <td className="p-2.5">{selectedCellForSlip.locationAddress}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold bg-slate-100">Meeting Day & Time</td>
                  <td className="p-2.5 font-bold text-blue-900">
                    Every {selectedCellForSlip.meetingDay} at {selectedCellForSlip.meetingTime}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold bg-slate-100">Meeting Format</td>
                  <td className="p-2.5">{selectedCellForSlip.format}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold bg-slate-100">Cell Leader</td>
                  <td className="p-2.5 font-bold">{selectedCellForSlip.leaderName}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold bg-slate-100">Contact Number</td>
                  <td className="p-2.5 font-mono font-bold text-blue-700">
                    {selectedCellForSlip.leaderPhone}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold bg-slate-100">Directions</td>
                  <td className="p-2.5">{selectedCellForSlip.directions}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </PrintModal>
      )}

      {/* Full Directory Print Modal */}
      <PrintModal
        isOpen={isPrintDirectoryOpen}
        onClose={() => setIsPrintDirectoryOpen(false)}
        title="DOMINION CITY ASABA — CELL FELLOWSHIP DIRECTORY"
        subtitle="Complete Listing of Active Neighborhood Cell Meetings"
        documentRef={`CELL-DIR-${new Date().getFullYear()}`}
      >
        <table className="w-full text-[11px] border-collapse border border-slate-300">
          <thead>
            <tr className="bg-blue-900 text-white font-bold">
              <th className="p-2 border border-slate-300 text-left">Zone / Neighborhood</th>
              <th className="p-2 border border-slate-300 text-left">Cell Name</th>
              <th className="p-2 border border-slate-300 text-left">Meeting Address</th>
              <th className="p-2 border border-slate-300 text-left">Day & Time</th>
              <th className="p-2 border border-slate-300 text-left">Leader & Contact</th>
            </tr>
          </thead>
          <tbody>
            {filteredCells.map((c, idx) => (
              <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border border-slate-300 font-bold text-blue-950">
                  {c.neighborhood}
                </td>
                <td className="p-2 border border-slate-300 font-semibold">{c.cellName}</td>
                <td className="p-2 border border-slate-300">{c.locationAddress}</td>
                <td className="p-2 border border-slate-300 font-medium">
                  {c.meetingDay} {c.meetingTime}
                </td>
                <td className="p-2 border border-slate-300 font-bold">
                  {c.leaderName} <br />
                  <span className="font-normal font-mono text-[10px] text-slate-600">
                    {c.leaderPhone}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PrintModal>
    </div>
  );
};
