import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import {
  Search,
  X,
  Users,
  MapPin,
  Building2,
  PackageSearch,
  BookOpen,
  Megaphone,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const { members, cells, satellites, lostItems, books, announcements } = useData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Toggle or open
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredMembers = q
    ? members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.residentialArea.toLowerCase().includes(q) ||
          m.departmentRole.toLowerCase().includes(q)
      )
    : [];

  const filteredCells = q
    ? cells.filter(
        (c) =>
          c.cellName.toLowerCase().includes(q) ||
          c.neighborhood.toLowerCase().includes(q) ||
          c.leaderName.toLowerCase().includes(q)
      )
    : [];

  const filteredSatellites = q
    ? satellites.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.neighborhood.toLowerCase().includes(q) ||
          s.residentPastor.toLowerCase().includes(q)
      )
    : [];

  const filteredLostItems = q
    ? lostItems.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.locationFound.toLowerCase().includes(q)
      )
    : [];

  const filteredBooks = q
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      )
    : [];

  const filteredAnnouncements = q
    ? announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      )
    : [];

  const hasResults =
    filteredMembers.length > 0 ||
    filteredCells.length > 0 ||
    filteredSatellites.length > 0 ||
    filteredLostItems.length > 0 ||
    filteredBooks.length > 0 ||
    filteredAnnouncements.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-12 sm:pt-20 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Asaba cells, members, lost property, books, announcements..."
            className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Close search"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="py-3 space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-1">
                  Quick-Action Hub
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a departmental service or start typing to search across all records:
                </p>
              </div>

              {/* 4 Primary Quick-Action Hub Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onNavigate('bookstand');
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/60 dark:hover:bg-purple-950/40 text-left transition-all cursor-pointer flex items-start gap-3 group"
                >
                  <div className="p-2.5 rounded-lg bg-purple-600 text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Book Stand</span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Catalogue, pricing, sales & author literature
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onNavigate('lost-found');
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 text-left transition-all cursor-pointer flex items-start gap-3 group"
                >
                  <div className="p-2.5 rounded-lg bg-amber-600 text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <PackageSearch className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Lost & Found</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Safeguarded items, recovered property & claims
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onNavigate('directory');
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-950/40 text-left transition-all cursor-pointer flex items-start gap-3 group"
                >
                  <div className="p-2.5 rounded-lg bg-blue-600 text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Cell Meetings</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Asaba neighborhood fellowship locations
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onNavigate('directory');
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 text-left transition-all cursor-pointer flex items-start gap-3 group"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Satellite Churches</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Branch locations & Sunday service times
                    </p>
                  </div>
                </button>
              </div>

              {/* Popular Search Keywords */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Suggested Keywords:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {['Summit Road', 'Okpanam', 'David Ogbueli', 'Bible', 'Prayer', 'GRA', 'Pastor'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-2.5 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-semibold">No records match "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">
                Try checking the spelling or searching by a broader keyword.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cells */}
              {filteredCells.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Cell Fellowships ({filteredCells.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredCells.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigate('cells');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg hover:bg-blue-50/80 transition-colors cursor-pointer border border-transparent hover:border-blue-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{c.cellName}</p>
                          <p className="text-[11px] text-slate-500">
                            {c.neighborhood} • Leader: {c.leaderName} ({c.meetingDay} {c.meetingTime})
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members */}
              {filteredMembers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Department Members ({filteredMembers.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredMembers.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onNavigate('members');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg hover:bg-blue-50/80 transition-colors cursor-pointer border border-transparent hover:border-blue-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          {m.photoUrl ? (
                            <img
                              src={m.photoUrl}
                              alt={m.fullName}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                              {m.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900">{m.fullName}</p>
                            <p className="text-[11px] text-slate-500">
                              {m.departmentRole} • {m.residentialArea}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lost & Found */}
              {filteredLostItems.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <PackageSearch className="w-3.5 h-3.5 text-amber-600" />
                    Lost & Found Items ({filteredLostItems.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredLostItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onNavigate('lost-found');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg hover:bg-amber-50/80 transition-colors cursor-pointer border border-transparent hover:border-amber-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900">{item.name}</p>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                item.status === 'Unclaimed'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Found at {item.locationFound} on {item.dateFound}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Books */}
              {filteredBooks.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                    Bookstand Catalogue ({filteredBooks.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredBooks.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          onNavigate('bookstand');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg hover:bg-purple-50/80 transition-colors cursor-pointer border border-transparent hover:border-purple-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{b.title}</p>
                          <p className="text-[11px] text-slate-500">
                            Author: {b.author} • Stock: {b.currentStock} copies (₦{b.sellingPrice.toLocaleString()})
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accessible Footer with Back / Close */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Press ESC or tap Close to dismiss
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer text-center"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
