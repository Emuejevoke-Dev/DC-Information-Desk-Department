import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CellMeeting, SatelliteChurch, LostItem } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import {
  Search,
  MapPin,
  Building2,
  PackageSearch,
  Printer,
  Phone,
  Clock,
  Compass,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const ApprovedInformationPortal: React.FC = () => {
  const { cells, satellites, lostItems, announcements, handbook } = useData();

  const [activeTab, setActiveTab] = useState<'cells' | 'satellites' | 'lost' | 'faqs'>('cells');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Print modal state for a specific selected cell slip or full directory
  const [selectedCellForPrint, setSelectedCellForPrint] = useState<CellMeeting | null>(null);
  const [isFullDirectoryPrintOpen, setIsFullDirectoryPrintOpen] = useState(false);
  const [isSatellitePrintOpen, setIsSatellitePrintOpen] = useState(false);

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

  // Filtered cells
  const filteredCells = cells.filter((c) => {
    if (c.status !== 'Active') return false;
    const matchesNeighborhood =
      selectedNeighborhood === 'All' || c.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      c.cellName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.leaderName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNeighborhood && matchesSearch;
  });

  // Filtered satellites
  const filteredSatellites = satellites.filter((s) => {
    if (s.status !== 'Active') return false;
    return (
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.residentPastor.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Public lost items (only show unclaimed or approved items, NEVER expose claimant information)
  const publicLostItems = lostItems.filter((i) => i.isPubliclyVisible && i.status === 'Unclaimed');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Kiosk Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-[#0A1A3B] text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Information Desk Fast Enquiry & Public Kiosk
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Approved Church Information Portal
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl">
              Rapid lookup and printable information slips for first-time visitors and church members inquiring at the desk.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullDirectoryPrintOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              Print Cell Directory
            </button>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-blue-800/80">
          <button
            onClick={() => setActiveTab('cells')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cells'
                ? 'bg-white text-blue-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📍 Cell Fellowships ({cells.length})
          </button>
          <button
            onClick={() => setActiveTab('satellites')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'satellites'
                ? 'bg-white text-blue-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🏛️ Satellite Churches ({satellites.length})
          </button>
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'lost'
                ? 'bg-white text-blue-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📦 Unclaimed Lost Items ({publicLostItems.length})
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'faqs'
                ? 'bg-white text-blue-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            💡 Desk Guidelines & FAQs
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {activeTab === 'cells' && (
        <div className="space-y-4">
          {/* Neighborhood filter chips & Search */}
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
                placeholder="Search leader or road..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
              />
            </div>
          </div>

          {/* Cells Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCells.map((cell) => (
              <div
                key={cell.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {cell.neighborhood}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-2">
                        {cell.cellName}
                      </h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                      {cell.format}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{cell.locationAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {cell.meetingDay}s, {cell.meetingTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        Leader: {cell.leaderName} ({cell.leaderPhone})
                      </span>
                    </div>
                    {cell.directions && (
                      <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{cell.directions}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCellForPrint(cell)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Visitor Cell Slip
                  </button>
                  <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Satellite Churches Tab */}
      {activeTab === 'satellites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800">
              Dominion City Satellite Churches in Asaba & Environs
            </h3>
            <button
              onClick={() => setIsSatellitePrintOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Satellite Directory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSatellites.map((sat) => (
              <div
                key={sat.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {sat.neighborhood}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{sat.name}</h3>
                  <p className="text-xs font-semibold text-blue-700 mt-1">
                    Resident Pastor: {sat.residentPastor} ({sat.pastorPhone})
                  </p>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{sat.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800">
                        {sat.sundayServiceTimes}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{sat.midweekServiceTimes}</span>
                    </div>
                    {sat.directions && (
                      <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-500 mt-2">
                        <strong>Directions:</strong> {sat.directions}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Lost & Found */}
      {activeTab === 'lost' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed shadow-xs">
            <span className="font-bold text-slate-900 block mb-1">
              Public Lost Property Register:
            </span>
            If you misplaced any item during church service, inspect the list below. To claim an item, approach the Information Desk after service with verifiable identification or proof of ownership.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {publicLostItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-full h-36 object-cover bg-slate-100"
                />
                <div className="p-3.5">
                  <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Found: {item.dateFound}</span>
                    <span>{item.locationFound.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQs & Guidelines */}
      {activeTab === 'faqs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {handbook.map((entry) => (
            <div
              key={entry.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {entry.category}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-2">{entry.title}</h3>
              <div className="text-xs text-slate-600 mt-3 whitespace-pre-line leading-relaxed">
                {entry.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. Print Modal for a Single Visitor Cell Slip */}
      {selectedCellForPrint && (
        <PrintModal
          isOpen={true}
          onClose={() => setSelectedCellForPrint(null)}
          title="DOMINION CITY CELL FELLOWSHIP INVITATION SLIP"
          subtitle="Official Member & Visitor Cell Connection Reference"
          documentRef={`CELL-SLIP-${selectedCellForPrint.id}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl text-center">
              <h2 className="text-lg font-black text-blue-950 uppercase">
                {selectedCellForPrint.cellName}
              </h2>
              <p className="text-xs font-semibold text-blue-800 mt-0.5">
                Zone / Neighborhood: {selectedCellForPrint.neighborhood}
              </p>
            </div>

            <table className="w-full text-xs border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold bg-slate-100 w-1/3">Meeting Venue</td>
                  <td className="p-2.5">{selectedCellForPrint.locationAddress}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold bg-slate-100">Meeting Day & Time</td>
                  <td className="p-2.5 font-bold text-blue-900">
                    Every {selectedCellForPrint.meetingDay} at {selectedCellForPrint.meetingTime}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold bg-slate-100">Meeting Format</td>
                  <td className="p-2.5">{selectedCellForPrint.format}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold bg-slate-100">Cell Leader</td>
                  <td className="p-2.5 font-bold">{selectedCellForPrint.leaderName}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold bg-slate-100">Phone Contact</td>
                  <td className="p-2.5 font-mono font-bold text-blue-700">
                    {selectedCellForPrint.leaderPhone}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold bg-slate-100">Directions / Landmark</td>
                  <td className="p-2.5">{selectedCellForPrint.directions}</td>
                </tr>
              </tbody>
            </table>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 text-center">
              "Every day they continued to meet together in the temple courts. They broke bread in their homes and ate together with glad and sincere hearts." — Acts 2:46
            </div>
          </div>
        </PrintModal>
      )}

      {/* 2. Print Modal for Full Cell Directory */}
      <PrintModal
        isOpen={isFullDirectoryPrintOpen}
        onClose={() => setIsFullDirectoryPrintOpen(false)}
        title="DOMINION CITY ASABA — CELL FELLOWSHIP DIRECTORY"
        subtitle="Complete Listing of Active Neighborhood Cell Meetings in Asaba"
        documentRef={`CELL-DIR-${new Date().getFullYear()}`}
      >
        <div className="space-y-4">
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
              {cells.map((c, idx) => (
                <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2 border border-slate-300 font-bold text-blue-950">
                    {c.neighborhood}
                  </td>
                  <td className="p-2 border border-slate-300 font-semibold">{c.cellName}</td>
                  <td className="p-2 border border-slate-300">{c.locationAddress}</td>
                  <td className="p-2 border border-slate-300 font-medium">
                    {c.meetingDay} {c.meetingTime} ({c.format})
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
        </div>
      </PrintModal>

      {/* 3. Print Modal for Satellite Directory */}
      <PrintModal
        isOpen={isSatellitePrintOpen}
        onClose={() => setIsSatellitePrintOpen(false)}
        title="DOMINION CITY SATELLITE CHURCH DIRECTORY — ASABA & ENVIRONS"
        subtitle="Official Satellite Locations, Service Times, and Resident Pastors"
        documentRef="SAT-DIR-2026"
      >
        <div className="space-y-4">
          <table className="w-full text-[11px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-blue-900 text-white font-bold">
                <th className="p-2 border border-slate-300 text-left">Satellite Church</th>
                <th className="p-2 border border-slate-300 text-left">Location Venue</th>
                <th className="p-2 border border-slate-300 text-left">Service Times</th>
                <th className="p-2 border border-slate-300 text-left">Resident Pastor</th>
              </tr>
            </thead>
            <tbody>
              {satellites.map((s, idx) => (
                <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2 border border-slate-300 font-bold text-blue-950">
                    {s.name} <br />
                    <span className="text-[10px] text-slate-500 font-normal">{s.neighborhood}</span>
                  </td>
                  <td className="p-2 border border-slate-300">{s.venue}</td>
                  <td className="p-2 border border-slate-300 font-medium">
                    Sunday: {s.sundayServiceTimes} <br />
                    Midweek: {s.midweekServiceTimes}
                  </td>
                  <td className="p-2 border border-slate-300 font-bold">
                    {s.residentPastor} <br />
                    <span className="font-normal font-mono text-[10px] text-slate-600">
                      {s.pastorPhone}
                    </span>
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
