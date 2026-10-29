import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Announcement, AnnouncementCategory, AnnouncementStatus } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { formatDate } from '../../utils/dateUtils';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  Megaphone,
  Plus,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  User,
  Printer,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Eye,
  Check,
  ImageIcon,
} from 'lucide-react';

export const NewsEventsModule: React.FC = () => {
  const { currentUser, canManageEvents, canManageMembers, isHOD, isSecretary } = useAuth();
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useData();

  const isAuthorized = canManageEvents || canManageMembers || isHOD || isSecretary;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [timingFilter, setTimingFilter] = useState<'All' | 'Upcoming' | 'Past'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [selectedAnnouncementForPrint, setSelectedAnnouncementForPrint] = useState<Announcement | null>(null);
  const [previewFlyerUrl, setPreviewFlyerUrl] = useState<string | null>(null);
  const [isLivePreviewMode, setIsLivePreviewMode] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Upcoming Event' as AnnouncementCategory,
    coverPhoto: '',
    organizer: currentUser.name,
    eventDate: todayStr,
    eventTime: '06:00 PM',
    venue: 'Information Desk Office / Central Sanctuary',
    author: currentUser.name,
    status: 'Published' as AnnouncementStatus,
    isUrgent: false,
    meetingInstructions: '',
  });

  const categories: AnnouncementCategory[] = [
    'General Announcement',
    'Urgent Meeting',
    'Service Notification',
    'Department News',
    'Upcoming Event',
  ];

  // Filtering by category and timing
  const filteredAnnouncements = announcements.filter((a) => {
    // Only published announcements visible to ordinary members; authorized officers see drafts too
    if (!isAuthorized && a.status === 'Draft') return false;

    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;

    let matchesTiming = true;
    if (timingFilter === 'Upcoming') {
      matchesTiming = !a.eventDate || a.eventDate >= todayStr;
    } else if (timingFilter === 'Past') {
      matchesTiming = !!a.eventDate && a.eventDate < todayStr;
    }

    return matchesCategory && matchesTiming;
  });

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      description: '',
      category: 'Upcoming Event',
      coverPhoto: '',
      organizer: currentUser.name,
      eventDate: todayStr,
      eventTime: '06:00 PM',
      venue: 'Information Desk Office / Central Sanctuary',
      author: currentUser.name,
      status: 'Published',
      isUrgent: false,
      meetingInstructions: '',
    });
    setIsLivePreviewMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingAnnouncement(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      coverPhoto: item.coverPhoto || '',
      organizer: item.organizer || item.author,
      eventDate: item.eventDate || todayStr,
      eventTime: item.eventTime || '06:00 PM',
      venue: item.venue || 'Information Desk Office / Central Sanctuary',
      author: item.author,
      status: item.status,
      isUrgent: item.isUrgent || false,
      meetingInstructions: item.meetingDetails?.instructions || '',
    });
    setIsLivePreviewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      deleteAnnouncement(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill out Announcement Title and Description.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      coverPhoto: formData.coverPhoto || undefined,
      organizer: formData.organizer,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime,
      venue: formData.venue,
      author: currentUser.name,
      status: formData.status,
      isUrgent: formData.isUrgent || formData.category === 'Urgent Meeting',
      meetingDetails:
        formData.isUrgent || formData.category === 'Urgent Meeting'
          ? {
              date: formData.eventDate,
              time: formData.eventTime,
              venue: formData.venue,
              instructions: formData.meetingInstructions || 'Mandatory attendance for all members.',
            }
          : undefined,
    };

    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, payload);
    } else {
      addAnnouncement(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Horizontal News Ticker / Rotating Headline Strip */}
      <div className="overflow-hidden bg-[#0A192F] text-white py-2.5 px-4 rounded-xl shadow-xs border border-blue-900/60 flex items-center gap-3">
        <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-[10px] tracking-wider uppercase shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          LATEST NOTICES
        </span>
        <div className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-blue-100 flex items-center gap-6 scrollbar-none">
          {announcements
            .filter((a) => a.status === 'Published')
            .map((item) => (
              <span key={item.id} className="inline-flex items-center gap-2">
                {item.isUrgent ? (
                  <span className="text-red-400 font-bold">🚨 {item.title}</span>
                ) : (
                  <span>• {item.title}</span>
                )}
              </span>
            ))}
        </div>
      </div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0E172B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Megaphone className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Department News, Events & Announcements
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official internal updates, urgent notices, and upcoming church programmes with flyer management.
          </p>
        </div>

        {isAuthorized && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Event / Notice
          </button>
        )}
      </div>

      {/* Filter Bar: Category & Timing (Upcoming vs Past) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0E172B] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 mr-1">Category:</span>
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Timing Filters: Upcoming vs Past */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg shrink-0">
          {(['All', 'Upcoming', 'Past'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimingFilter(t)}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                timingFilter === t
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t} Events
            </button>
          ))}
        </div>
      </div>

      {/* List of Announcements & Events */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
            No events or announcements match the selected filter.
          </div>
        ) : (
          filteredAnnouncements.map((item) => {
            const isEvent = item.category === 'Upcoming Event' || !!item.eventDate;
            const isPastEvent = item.eventDate && item.eventDate < todayStr;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  item.isUrgent
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 shadow-xs ring-1 ring-red-300 dark:ring-red-900/60'
                    : 'bg-white dark:bg-[#0E172B] border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  {/* Left Column: Flyer Poster (if present) */}
                  {item.coverPhoto && (
                    <div
                      onClick={() => setPreviewFlyerUrl(item.coverPhoto || null)}
                      className="w-full md:w-44 h-48 sm:h-52 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer group relative"
                    >
                      <img
                        src={item.coverPhoto}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        <Eye className="w-4 h-4 mr-1" /> View Flyer
                      </div>
                    </div>
                  )}

                  {/* Middle Column: Event Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.isUrgent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          URGENT NOTICE
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {item.category}
                      </span>
                      {isEvent && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPastEvent
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isPastEvent ? 'Past Event' : 'Upcoming Event'}
                        </span>
                      )}
                      {isAuthorized && item.status && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        Posted by {item.author} on {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>

                    {/* Event or Meeting Specific Details */}
                    {(item.eventDate || item.venue) && (
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                        {item.eventDate && (
                          <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(item.eventDate)} ({item.eventTime || 'TBA'})
                          </span>
                        )}
                        {item.venue && (
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            {item.venue}
                          </span>
                        )}
                        {item.organizer && (
                          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <User className="w-3.5 h-3.5" />
                            Organizer: {item.organizer}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-1 shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={() => setSelectedAnnouncementForPrint(item)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Print Circular"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {isAuthorized && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                          title="Edit Event / Notice"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingAnnouncement ? 'Edit Event / Notice' : 'Create Event / Notice'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Title / Event Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Easter Special Retreat, Workers Briefing..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as AnnouncementCategory })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as AnnouncementStatus })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Published">Published (Live to Members)</option>
                    <option value="Draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Event Time
                  </label>
                  <input
                    type="text"
                    value={formData.eventTime}
                    onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                    placeholder="e.g. 05:30 PM"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Venue / Meeting Room
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Sanctuary / Online"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Organizer
                  </label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Flyer Upload */}
              <ImageUploadInput
                label="Event Flyer Poster (Upload or Camera)"
                value={formData.coverPhoto}
                onChange={(dataUrl) => setFormData({ ...formData, coverPhoto: dataUrl })}
                aspectRatioHint="Flyer (4:5 or 16:9)"
                placeholderText="Upload event flyer from mobile camera or choose poster from gallery"
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Full Event / Notice Details *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLivePreviewMode(!isLivePreviewMode)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isLivePreviewMode ? 'Edit Text' : 'Preview'}
                  </button>
                </div>

                {isLivePreviewMode ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg max-h-36 overflow-y-auto whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed text-[11px]">
                    {formData.description || '(No description entered yet)'}
                  </div>
                ) : (
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full description, agenda, and expectations..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgent-check"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="urgent-check" className="font-bold text-red-700 dark:text-red-400">
                  Mark as High Priority / Urgent Notice
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  {editingAnnouncement ? 'Update Event' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Flyer Preview Lightbox Modal */}
      {previewFlyerUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewFlyerUrl(null)}
        >
          <div
            className="max-w-md w-full rounded-2xl overflow-hidden shadow-2xl bg-white animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">Event Flyer Preview</span>
              <button
                onClick={() => setPreviewFlyerUrl(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <img src={previewFlyerUrl} alt="Flyer full view" className="w-full max-h-[75vh] object-contain" />
          </div>
        </div>
      )}

      {/* Official Circular Print Modal */}
      {selectedAnnouncementForPrint && (
        <PrintModal
          isOpen={true}
          onClose={() => setSelectedAnnouncementForPrint(null)}
          title="DOMINION CITY ASABA — OFFICIAL INTERNAL CIRCULAR"
          subtitle="Department of Information Desk"
          documentRef={`CIRC-${selectedAnnouncementForPrint.id}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                {selectedAnnouncementForPrint.category}
              </span>
              <h2 className="text-base font-black text-slate-900 mt-2">
                {selectedAnnouncementForPrint.title}
              </h2>
              <div className="text-xs text-slate-500 mt-1">
                Organizer: <strong>{selectedAnnouncementForPrint.organizer || selectedAnnouncementForPrint.author}</strong> | Date: <strong>{formatDate(selectedAnnouncementForPrint.createdAt)}</strong>
              </div>
            </div>

            <div className="text-xs leading-relaxed text-slate-800 whitespace-pre-line p-2">
              {selectedAnnouncementForPrint.description}
            </div>

            {selectedAnnouncementForPrint.venue && (
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg text-xs space-y-1">
                <p>
                  <strong>Date & Time:</strong> {selectedAnnouncementForPrint.eventDate} ({selectedAnnouncementForPrint.eventTime})
                </p>
                <p>
                  <strong>Venue:</strong> {selectedAnnouncementForPrint.venue}
                </p>
              </div>
            )}
          </div>
        </PrintModal>
      )}
    </div>
  );
};
