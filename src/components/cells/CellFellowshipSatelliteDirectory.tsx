import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CellMeeting, SatelliteChurch } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  Search,
  MapPin,
  Building2,
  Phone,
  Clock,
  Compass,
  Printer,
  PlusCircle,
  Edit2,
  Trash2,
  Navigation,
  CheckCircle,
  ExternalLink,
  Milestone,
} from 'lucide-react';

export const CellFellowshipSatelliteDirectory: React.FC = () => {
  const { currentUser, canManageMembers } = useAuth();
  const {
    cells,
    satellites,
    addCell,
    updateCell,
    deleteCell,
    addSatellite,
    updateSatellite,
    deleteSatellite,
  } = useData();

  const [activeDirectoryTab, setActiveDirectoryTab] = useState<'cells' | 'satellites'>('cells');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');

  // Print modal states
  const [selectedCellForPrint, setSelectedCellForPrint] = useState<CellMeeting | null>(null);
  const [isFullDirectoryPrintOpen, setIsFullDirectoryPrintOpen] = useState(false);
  const [isSatellitePrintOpen, setIsSatellitePrintOpen] = useState(false);

  // Cell Modal State
  const [isCellModalOpen, setIsCellModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<CellMeeting | null>(null);
  const [cellForm, setCellForm] = useState<{
    cellName: string;
    leaderName: string;
    leaderPhone: string;
    leaderPhoto: string;
    neighborhood: string;
    locationAddress: string;
    meetingDay: string;
    meetingTime: string;
    format: 'Physical' | 'Online' | 'Hybrid';
    landmarks: string;
    directions: string;
  }>({
    cellName: '',
    leaderName: '',
    leaderPhone: '',
    leaderPhoto: '',
    neighborhood: 'Summit Road',
    locationAddress: '',
    meetingDay: 'Wednesday',
    meetingTime: '06:00 PM - 07:00 PM',
    format: 'Physical',
    landmarks: '',
    directions: '',
  });

  // Satellite Modal State
  const [isSatelliteModalOpen, setIsSatelliteModalOpen] = useState(false);
  const [editingSatellite, setEditingSatellite] = useState<SatelliteChurch | null>(null);
  const [satelliteForm, setSatelliteForm] = useState<{
    name: string;
    residentPastor: string;
    pastorPhone: string;
    pastorPhoto: string;
    venue: string;
    neighborhood: string;
    sundayServiceTimes: string;
    midweekServiceTimes: string;
    landmarks: string;
    directions: string;
  }>({
    name: '',
    residentPastor: '',
    pastorPhone: '',
    pastorPhoto: '',
    venue: '',
    neighborhood: 'Asaba',
    sundayServiceTimes: '1st Service: 07:30 AM | 2nd Service: 09:30 AM',
    midweekServiceTimes: 'Tuesday: 05:30 PM | Thursday Prayer: 09:00 PM',
    landmarks: '',
    directions: '',
  });

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

  // Filtered cells with landmark search
  const filteredCells = useMemo(() => {
    return cells.filter((c) => {
      const matchesArea =
        selectedNeighborhood === 'All' ||
        c.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase());

      if (!searchQuery.trim()) return matchesArea;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        c.cellName.toLowerCase().includes(q) ||
        c.leaderName.toLowerCase().includes(q) ||
        c.neighborhood.toLowerCase().includes(q) ||
        c.locationAddress.toLowerCase().includes(q) ||
        (c.landmarks && c.landmarks.toLowerCase().includes(q)) ||
        c.directions.toLowerCase().includes(q);

      return matchesArea && matchesSearch;
    });
  }, [cells, selectedNeighborhood, searchQuery]);

  // Filtered satellites with landmark search
  const filteredSatellites = useMemo(() => {
    return satellites.filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        s.name.toLowerCase().includes(q) ||
        s.residentPastor.toLowerCase().includes(q) ||
        s.neighborhood.toLowerCase().includes(q) ||
        s.venue.toLowerCase().includes(q) ||
        (s.landmarks && s.landmarks.toLowerCase().includes(q)) ||
        s.directions.toLowerCase().includes(q)
      );
    });
  }, [satellites, searchQuery]);

  // Cell Form submit
  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellForm.cellName || !cellForm.leaderName || !cellForm.locationAddress) {
      alert('Please fill in cell name, leader name, and address');
      return;
    }

    if (editingCell) {
      updateCell(editingCell.id, {
        ...cellForm,
      });
    } else {
      addCell({
        ...cellForm,
        status: 'Active',
      });
    }

    setIsCellModalOpen(false);
    setEditingCell(null);
  };

  // Satellite Form submit
  const handleSaveSatellite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!satelliteForm.name || !satelliteForm.residentPastor || !satelliteForm.venue) {
      alert('Please fill in satellite church name, resident pastor, and venue');
      return;
    }

    if (editingSatellite) {
      updateSatellite(editingSatellite.id, {
        ...satelliteForm,
      });
    } else {
      addSatellite({
        ...satelliteForm,
        status: 'Active',
      });
    }

    setIsSatelliteModalOpen(false);
    setEditingSatellite(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Directory Master Banner */}
      <div className="bg-gradient-to-r from-[#091D42] via-[#0E2E69] to-[#124294] text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 mb-2 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-blue-950" />
              OFFICIAL DC ASABA LOCATOR
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">
              CELL FELLOWSHIP & SATELLITE CHURCH DIRECTORY
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
              Approved geographic database of weekly home cell meetings and satellite branches across Asaba and surrounding Delta State communities with landmarks and directions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeDirectoryTab === 'cells' ? (
              <>
                {canManageMembers && (
                  <button
                    onClick={() => {
                      setEditingCell(null);
                      setCellForm({
                        cellName: '',
                        leaderName: '',
                        leaderPhone: '',
                        leaderPhoto: '',
                        neighborhood: 'Summit Road',
                        locationAddress: '',
                        meetingDay: 'Wednesday',
                        meetingTime: '06:00 PM - 07:00 PM',
                        format: 'Physical',
                        landmarks: '',
                        directions: '',
                      });
                      setIsCellModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Cell Fellowship
                  </button>
                )}
                <button
                  onClick={() => setIsFullDirectoryPrintOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-300" />
                  Print Cell Directory
                </button>
              </>
            ) : (
              <>
                {canManageMembers && (
                  <button
                    onClick={() => {
                      setEditingSatellite(null);
                      setSatelliteForm({
                        name: '',
                        residentPastor: '',
                        pastorPhone: '',
                        pastorPhoto: '',
                        venue: '',
                        neighborhood: 'Asaba',
                        sundayServiceTimes: '1st Service: 07:30 AM | 2nd Service: 09:30 AM',
                        midweekServiceTimes: 'Tuesday: 05:30 PM | Thursday Prayer: 09:00 PM',
                        landmarks: '',
                        directions: '',
                      });
                      setIsSatelliteModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Satellite Church
                  </button>
                )}
                <button
                  onClick={() => setIsSatellitePrintOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-300" />
                  Print Satellite List
                </button>
              </>
            )}
          </div>
        </div>

        {/* Directory Sub-Tabs: Cell Fellowships vs Satellite Churches */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-blue-800/70">
          <button
            onClick={() => setActiveDirectoryTab('cells')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeDirectoryTab === 'cells'
                ? 'bg-white text-blue-950 shadow-md scale-102'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            Cell Fellowship Directory ({cells.length})
          </button>

          <button
            onClick={() => setActiveDirectoryTab('satellites')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeDirectoryTab === 'satellites'
                ? 'bg-white text-blue-950 shadow-md scale-102'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            Satellite Church Directory ({satellites.length})
          </button>
        </div>
      </div>

      {/* Prominent Search and Landmark Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeDirectoryTab === 'cells'
                ? 'Search cells by name, leader, neighborhood, or landmark (e.g. Summit Junction, Ogbeogonogo)...'
                : 'Search satellite churches by name, pastor, venue, or landmark...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
          />
        </div>

        {activeDirectoryTab === 'cells' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Neighborhood:</span>
            {neighborhoods.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedNeighborhood(area)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedNeighborhood === area
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 12.1 CELL FELLOWSHIP DIRECTORY */}
      {activeDirectoryTab === 'cells' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCells.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Cell Fellowships Found</h4>
              <p className="text-xs text-slate-500 mt-1">
                No active cells match your query "{searchQuery}". Try searching by a landmark or area name.
              </p>
            </div>
          ) : (
            filteredCells.map((cell) => (
              <div
                key={cell.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {cell.neighborhood}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                        {cell.cellName}
                      </h3>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-black uppercase shrink-0 ${
                        cell.format === 'Physical'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cell.format === 'Hybrid'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {cell.format}
                    </span>
                  </div>

                  {/* Leader details */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    {cell.leaderPhoto ? (
                      <img
                        src={cell.leaderPhoto}
                        alt={cell.leaderName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {cell.leaderName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{cell.leaderName}</p>
                      <a
                        href={`tel:${cell.leaderPhone}`}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        {cell.leaderPhone}
                      </a>
                    </div>
                  </div>

                  {/* Landmark */}
                  {cell.landmarks && (
                    <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs flex items-start gap-2">
                      <Milestone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 text-[11px] block">Landmarks:</span>
                        <span className="text-amber-800 text-[11px]">{cell.landmarks}</span>
                      </div>
                    </div>
                  )}

                  {/* Address & Meeting Time */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed">{cell.locationAddress}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px]">
                        Every <strong>{cell.meetingDay}</strong> • {cell.meetingTime}
                      </span>
                    </div>

                    {cell.directions && (
                      <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-slate-500 italic leading-relaxed">
                        🧭 {cell.directions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCellForPrint(cell)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Visitor Slip
                  </button>

                  {canManageMembers && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCell(cell);
                          setCellForm({
                            cellName: cell.cellName,
                            leaderName: cell.leaderName,
                            leaderPhone: cell.leaderPhone,
                            leaderPhoto: cell.leaderPhoto || '',
                            neighborhood: cell.neighborhood,
                            locationAddress: cell.locationAddress,
                            meetingDay: cell.meetingDay,
                            meetingTime: cell.meetingTime,
                            format: cell.format,
                            landmarks: cell.landmarks || '',
                            directions: cell.directions,
                          });
                          setIsCellModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Edit Cell"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Archive or delete ${cell.cellName}?`)) {
                            deleteCell(cell.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Archive Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 12.2 SATELLITE CHURCH DIRECTORY */}
      {activeDirectoryTab === 'satellites' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSatellites.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Satellite Churches Found</h4>
              <p className="text-xs text-slate-500 mt-1">
                No active satellite churches match "{searchQuery}".
              </p>
            </div>
          ) : (
            filteredSatellites.map((church) => (
              <div
                key={church.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {church.neighborhood}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                        {church.name}
                      </h3>
                    </div>
                  </div>

                  {/* Resident Pastor details */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    {church.pastorPhoto ? (
                      <img
                        src={church.pastorPhoto}
                        alt={church.residentPastor}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {church.residentPastor.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{church.residentPastor}</p>
                      <a
                        href={`tel:${church.pastorPhone}`}
                        className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        {church.pastorPhone}
                      </a>
                    </div>
                  </div>

                  {/* Landmarks */}
                  {church.landmarks && (
                    <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs flex items-start gap-2">
                      <Milestone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 text-[11px] block">Landmarks:</span>
                        <span className="text-amber-800 text-[11px]">{church.landmarks}</span>
                      </div>
                    </div>
                  )}

                  {/* Service times & venue */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed">{church.venue}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1 text-[11px]">
                      <p className="font-semibold text-blue-900">
                        📅 <strong>Sunday:</strong> {church.sundayServiceTimes}
                      </p>
                      <p className="font-semibold text-blue-900">
                        📖 <strong>Midweek:</strong> {church.midweekServiceTimes}
                      </p>
                    </div>

                    {church.directions && (
                      <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-slate-500 italic leading-relaxed">
                        🧭 {church.directions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${church.name} ${church.venue} Asaba`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open in Maps
                  </a>

                  {canManageMembers && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingSatellite(church);
                          setSatelliteForm({
                            name: church.name,
                            residentPastor: church.residentPastor,
                            pastorPhone: church.pastorPhone,
                            pastorPhoto: church.pastorPhoto || '',
                            venue: church.venue,
                            neighborhood: church.neighborhood,
                            sundayServiceTimes: church.sundayServiceTimes,
                            midweekServiceTimes: church.midweekServiceTimes,
                            landmarks: church.landmarks || '',
                            directions: church.directions,
                          });
                          setIsSatelliteModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Edit Satellite Church"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Archive ${church.name}?`)) {
                            deleteSatellite(church.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Archive Satellite Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PRINT MODALS */}
      {selectedCellForPrint && (
        <PrintModal
          isOpen={true}
          onClose={() => setSelectedCellForPrint(null)}
          title={`Cell Visitor Slip — ${selectedCellForPrint.cellName}`}
          subtitle="Official Dominion City Asaba Cell Locator Orientation"
        >
          <div className="space-y-4 p-4 border border-slate-300 rounded-xl">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{selectedCellForPrint.cellName}</h3>
              <p className="text-xs text-slate-500 font-semibold">{selectedCellForPrint.neighborhood}</p>
            </div>

            <div className="space-y-2 text-xs">
              <p><strong>Cell Leader:</strong> {selectedCellForPrint.leaderName}</p>
              <p><strong>Leader Phone:</strong> {selectedCellForPrint.leaderPhone}</p>
              <p><strong>Meeting Day & Time:</strong> Every {selectedCellForPrint.meetingDay} at {selectedCellForPrint.meetingTime}</p>
              <p><strong>Meeting Format:</strong> {selectedCellForPrint.format}</p>
              <p><strong>Physical Address:</strong> {selectedCellForPrint.locationAddress}</p>
              {selectedCellForPrint.landmarks && (
                <p><strong>Key Landmarks:</strong> {selectedCellForPrint.landmarks}</p>
              )}
              {selectedCellForPrint.directions && (
                <p><strong>Directions:</strong> {selectedCellForPrint.directions}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
              Handed out at Information Desk • Dominion City Asaba Central Cathedral
            </div>
          </div>
        </PrintModal>
      )}

      {isFullDirectoryPrintOpen && (
        <PrintModal
          isOpen={true}
          onClose={() => setIsFullDirectoryPrintOpen(false)}
          title="Dominion City Asaba — Full Cell Fellowship Directory"
          subtitle={`Total of ${cells.length} Active Cell Fellowships across Asaba and environs`}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-[10px] uppercase font-bold text-slate-600 bg-slate-50">
                <th className="py-2 px-2">Cell Name</th>
                <th className="py-2 px-2">Neighborhood</th>
                <th className="py-2 px-2">Leader & Contact</th>
                <th className="py-2 px-2">Meeting Time</th>
                <th className="py-2 px-2">Landmarks & Venue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cells.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 px-2 font-bold">{c.cellName}</td>
                  <td className="py-2 px-2">{c.neighborhood}</td>
                  <td className="py-2 px-2">
                    <p className="font-semibold">{c.leaderName}</p>
                    <p className="text-[10px] text-slate-500">{c.leaderPhone}</p>
                  </td>
                  <td className="py-2 px-2">Every {c.meetingDay} {c.meetingTime}</td>
                  <td className="py-2 px-2">
                    <p>{c.locationAddress}</p>
                    {c.landmarks && <p className="text-[10px] text-slate-500 italic">Near: {c.landmarks}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PrintModal>
      )}

      {/* ADD/EDIT CELL MODAL */}
      {isCellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCell ? 'Edit Cell Fellowship' : 'Add New Cell Fellowship'}
              </h3>
              <button
                onClick={() => setIsCellModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCell} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cell Fellowship Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grace & Truth Cell Fellowship"
                  value={cellForm.cellName}
                  onChange={(e) => setCellForm({ ...cellForm, cellName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Leader's Name *</label>
                  <input
                    type="text"
                    required
                    value={cellForm.leaderName}
                    onChange={(e) => setCellForm({ ...cellForm, leaderName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Leader's Phone *</label>
                  <input
                    type="tel"
                    required
                    value={cellForm.leaderPhone}
                    onChange={(e) => setCellForm({ ...cellForm, leaderPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Direct Camera / Gallery Leader Photo Upload */}
              <ImageUploadInput
                label="Leader's Photo (Optional)"
                value={cellForm.leaderPhoto}
                onChange={(dataUrl) => setCellForm({ ...cellForm, leaderPhoto: dataUrl })}
                aspectRatioHint="Square (1:1)"
                placeholderText="Take photo of leader with camera or choose from gallery"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Neighborhood *</label>
                  <input
                    type="text"
                    required
                    value={cellForm.neighborhood}
                    onChange={(e) => setCellForm({ ...cellForm, neighborhood: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Format *</label>
                  <select
                    value={cellForm.format}
                    onChange={(e) => setCellForm({ ...cellForm, format: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Physical">Physical</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">One or Two Key Landmarks *</label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Sweet Spirit Hotel, Near Summit Junction"
                  value={cellForm.landmarks}
                  onChange={(e) => setCellForm({ ...cellForm, landmarks: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Location Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 14, Summit Road, Asaba"
                  value={cellForm.locationAddress}
                  onChange={(e) => setCellForm({ ...cellForm, locationAddress: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transportation & Direction Guide</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take a keke to Summit Junction; building is opposite the hotel"
                  value={cellForm.directions}
                  onChange={(e) => setCellForm({ ...cellForm, directions: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCellModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
                >
                  Save Cell Fellowship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT SATELLITE MODAL */}
      {isSatelliteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingSatellite ? 'Edit Satellite Church' : 'Add New Satellite Church'}
              </h3>
              <button
                onClick={() => setIsSatelliteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSatellite} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Satellite Church Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dominion City Okpanam Central"
                  value={satelliteForm.name}
                  onChange={(e) => setSatelliteForm({ ...satelliteForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resident Pastor *</label>
                  <input
                    type="text"
                    required
                    value={satelliteForm.residentPastor}
                    onChange={(e) => setSatelliteForm({ ...satelliteForm, residentPastor: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pastor's Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={satelliteForm.pastorPhone}
                    onChange={(e) => setSatelliteForm({ ...satelliteForm, pastorPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Direct Camera / Gallery Pastor Photo Upload */}
              <ImageUploadInput
                label="Pastor's Photo (Optional)"
                value={satelliteForm.pastorPhoto}
                onChange={(dataUrl) => setSatelliteForm({ ...satelliteForm, pastorPhoto: dataUrl })}
                aspectRatioHint="Square (1:1)"
                placeholderText="Take photo of pastor with camera or choose from gallery"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Landmarks *</label>
                <input
                  type="text"
                  placeholder="e.g. Summit Junction Flyover Approach, Benin-Asaba Expressway"
                  value={satelliteForm.landmarks}
                  onChange={(e) => setSatelliteForm({ ...satelliteForm, landmarks: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Church Venue & Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Km 2 Benin-Asaba Expressway, Asaba"
                  value={satelliteForm.venue}
                  onChange={(e) => setSatelliteForm({ ...satelliteForm, venue: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sunday Service Times</label>
                  <input
                    type="text"
                    value={satelliteForm.sundayServiceTimes}
                    onChange={(e) => setSatelliteForm({ ...satelliteForm, sundayServiceTimes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Midweek Service Times</label>
                  <input
                    type="text"
                    value={satelliteForm.midweekServiceTimes}
                    onChange={(e) => setSatelliteForm({ ...satelliteForm, midweekServiceTimes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSatelliteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer"
                >
                  Save Satellite Church
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
