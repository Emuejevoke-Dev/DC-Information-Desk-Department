import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DepartmentMeeting } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { formatDate, getNextThursdayPrayer } from '../../utils/dateUtils';
import {
  Clock,
  Plus,
  Printer,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const MeetingsModule: React.FC = () => {
  const { currentUser, canManageMembers } = useAuth();
  const { meetings, addMeeting, updateMeeting, deleteMeeting } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<DepartmentMeeting | null>(null);
  const [selectedMeetingForPrint, setSelectedMeetingForPrint] = useState<DepartmentMeeting | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    organizer: currentUser.name,
    date: new Date().toISOString().split('T')[0],
    time: '12:30 PM',
    venue: 'Seminar Room, Main Cathedral',
    agendaText: 'Opening prayer\nReview of service reports\nAOB & Closing prayer',
    notes: '',
    status: 'Scheduled' as 'Scheduled' | 'Completed' | 'Cancelled',
    isRecurring: false,
  });

  const nextThursday = getNextThursdayPrayer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      alert('Please fill out the Meeting Title and Date.');
      return;
    }

    const agenda = formData.agendaText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingMeeting) {
      updateMeeting(editingMeeting.id, {
        title: formData.title,
        organizer: formData.organizer,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        agenda,
        notes: formData.notes,
        status: formData.status,
        isRecurring: formData.isRecurring,
      });
      setEditingMeeting(null);
    } else {
      addMeeting({
        title: formData.title,
        organizer: formData.organizer,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        agenda,
        notes: formData.notes,
        status: formData.status,
        isRecurring: formData.isRecurring,
      });
    }

    setIsAddModalOpen(false);
    setFormData({
      title: '',
      organizer: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      time: '12:30 PM',
      venue: 'Seminar Room, Main Cathedral',
      agendaText: '',
      notes: '',
      status: 'Scheduled',
      isRecurring: false,
    });
  };

  const handleEditClick = (m: DepartmentMeeting) => {
    setEditingMeeting(m);
    setFormData({
      title: m.title,
      organizer: m.organizer,
      date: m.date,
      time: m.time,
      venue: m.venue,
      agendaText: m.agenda.join('\n'),
      notes: m.notes || '',
      status: m.status,
      isRecurring: m.isRecurring,
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Recurring Schedule Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thursday Prayer Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/20 text-white tracking-wider">
                WEEKLY INTERCESSION
              </span>
              <h3 className="text-lg font-black mt-1">Thursday Department Prayer Watch</h3>
              <p className="text-xs text-amber-100 mt-1">
                Every Thursday at <strong>9:00 PM</strong> online via dedicated audio prayer line.
              </p>
            </div>
            <div className="text-2xl p-2 bg-white/10 rounded-xl">🙏</div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold">
            <span>Next session: {formatDate(nextThursday)} at 9:00 PM</span>
            <span className="bg-white text-amber-900 px-2 py-0.5 rounded font-black text-[10px]">
              Active Routine
            </span>
          </div>
        </div>

        {/* 1st & 3rd Sunday Dept Meetings Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/20 text-white tracking-wider">
                REGULAR SESSIONS
              </span>
              <h3 className="text-lg font-black mt-1">Department General Meetings</h3>
              <p className="text-xs text-blue-100 mt-1">
                Holds on the <strong>1st & 3rd Sundays</strong> of every month immediately after 2nd service.
              </p>
            </div>
            <div className="text-2xl p-2 bg-white/10 rounded-xl">🏛️</div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold">
            <span>Cathedral Seminar Wing</span>
            <span className="bg-white text-blue-900 px-2 py-0.5 rounded font-black text-[10px]">
              Bi-Monthly
            </span>
          </div>
        </div>
      </div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Department Meetings & Schedules
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking bi-monthly meetings, prayer watches, and ad-hoc strategy sessions.
          </p>
        </div>

        {canManageMembers && (
          <button
            onClick={() => {
              setEditingMeeting(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        )}
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.map((m) => (
          <div
            key={m.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {m.status}
                  </span>
                  {m.isRecurring && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Recurring Schedule
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">Organizer: {m.organizer}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{m.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                  <span className="flex items-center gap-1 text-blue-700">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(m.date)} at {m.time}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {m.venue}
                  </span>
                </div>

                {/* Agenda list */}
                {m.agenda && m.agenda.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Meeting Agenda:
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                      {m.agenda.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedMeetingForPrint(m)}
                  className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Print Agenda"
                >
                  <Printer className="w-4 h-4" />
                </button>
                {canManageMembers && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(m)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove meeting "${m.title}"?`)) {
                          deleteMeeting(m.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingMeeting ? 'Edit Meeting Schedule' : 'Schedule Department Meeting'}
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
                <label className="font-bold text-slate-700 block mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. November General Review Meeting"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 12:30 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Organizer</label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Venue</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Agenda Items (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.agendaText}
                  onChange={(e) => setFormData({ ...formData, agendaText: e.target.value })}
                  placeholder="Opening Prayer&#10;Department Reports&#10;AOB"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rec-check"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="rec-check" className="text-slate-600">
                  Recurring Schedule (e.g. 1st/3rd Sunday or Thursday Prayer)
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
                  {editingMeeting ? 'Update Schedule' : 'Save Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print Agenda Modal */}
      {selectedMeetingForPrint && (
        <PrintModal
          isOpen={true}
          onClose={() => setSelectedMeetingForPrint(null)}
          title={`MEETING NOTICE: ${selectedMeetingForPrint.title}`}
          subtitle={`Department of Information Desk • Date: ${formatDate(selectedMeetingForPrint.date)}`}
          documentRef={`MEET-${selectedMeetingForPrint.id}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 text-xs">
              <div>
                <strong>Date & Time:</strong> {formatDate(selectedMeetingForPrint.date)} ({selectedMeetingForPrint.time})
              </div>
              <div>
                <strong>Venue:</strong> {selectedMeetingForPrint.venue}
              </div>
              <div>
                <strong>Organizer:</strong> {selectedMeetingForPrint.organizer}
              </div>
              <div>
                <strong>Status:</strong> {selectedMeetingForPrint.status}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
                Order of Business / Meeting Agenda
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                {selectedMeetingForPrint.agenda.map((item, idx) => (
                  <li key={idx} className="p-1.5 bg-slate-50 rounded">
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
