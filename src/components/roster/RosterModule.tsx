import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ServiceRoster, RosterDuty } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { getNextSunday, formatDate } from '../../utils/dateUtils';
import {
  CalendarCheck,
  Plus,
  Printer,
  Copy,
  Edit2,
  Trash2,
  X,
  Users,
  CheckCircle2,
  Shirt,
  ArrowRight,
} from 'lucide-react';

interface RosterModuleProps {
  onNavigateToDressCode?: () => void;
}

export const RosterModule: React.FC<RosterModuleProps> = ({ onNavigateToDressCode }) => {
  const { currentUser, canManageRosters } = useAuth();
  const { rosters, members, dressCodes, addRoster, updateRoster, deleteRoster } = useData();

  const today = new Date();
  const nextSunday = getNextSunday(today);
  const nextSundayStr = nextSunday.toISOString().split('T')[0];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoster, setEditingRoster] = useState<ServiceRoster | null>(null);
  const [selectedRosterForPrint, setSelectedRosterForPrint] = useState<ServiceRoster | null>(null);

  const [formData, setFormData] = useState<{
    serviceDate: string;
    serviceType: 'Sunday 1st Service' | 'Sunday 2nd Service' | 'Tuesday Word & Communion' | 'Special Meeting';
    teamLeader: string;
    prayerLeader: string;
    assignments: RosterDuty[];
    notes: string;
  }>({
    serviceDate: nextSundayStr,
    serviceType: 'Sunday 1st Service',
    teamLeader: members[0]?.fullName || 'Brother Chukwudi Okonkwo',
    prayerLeader: members[1]?.fullName || 'Sister Ngozi Adeleke',
    assignments: [
      { memberId: members[0]?.id || '1', memberName: members[0]?.fullName || '', dutyRole: 'Desk Lead & VIP Inquiries' },
      { memberId: members[2]?.id || '3', memberName: members[2]?.fullName || '', dutyRole: 'Cell Placements & Registrations' },
    ],
    notes: 'Please arrive by 06:45 AM for pre-service prayer and briefing.',
  });

  const handleAddAssignment = () => {
    if (members.length > 0) {
      setFormData({
        ...formData,
        assignments: [
          ...formData.assignments,
          {
            memberId: members[0].id,
            memberName: members[0].fullName,
            dutyRole: 'Visitor Hospitality & Enquiries',
          },
        ],
      });
    }
  };

  const handleRemoveAssignment = (index: number) => {
    setFormData({
      ...formData,
      assignments: formData.assignments.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceDate) {
      alert('Please select a service date.');
      return;
    }

    if (editingRoster) {
      updateRoster(editingRoster.id, {
        ...formData,
        status: 'Scheduled',
      });
      setEditingRoster(null);
    } else {
      addRoster({
        ...formData,
        status: 'Scheduled',
      });
    }

    setIsAddModalOpen(false);
  };

  const handleEditClick = (r: ServiceRoster) => {
    setEditingRoster(r);
    setFormData({
      serviceDate: r.serviceDate,
      serviceType: r.serviceType,
      teamLeader: r.teamLeader,
      prayerLeader: r.prayerLeader,
      assignments: r.assignments,
      notes: r.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleDuplicate = (r: ServiceRoster) => {
    addRoster({
      serviceDate: nextSundayStr,
      serviceType: r.serviceType,
      teamLeader: r.teamLeader,
      prayerLeader: r.prayerLeader,
      assignments: r.assignments,
      notes: r.notes || '',
      status: 'Scheduled',
    });
    alert('Roster template duplicated successfully for upcoming service.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Department Roster & Duty Timetable
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sunday & Midweek duty allocations, team leadership, and front-desk coverage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageRosters && (
            <button
              onClick={() => {
                setEditingRoster(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Service Roster
            </button>
          )}
        </div>
      </div>

      {/* Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rosters.map((roster) => {
          const isApproaching = roster.serviceDate === nextSundayStr;
          const matchingDressCode = dressCodes.find((d) => d.sundayDate === roster.serviceDate);

          return (
            <div
              key={roster.id}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                isApproaching
                  ? 'bg-gradient-to-b from-emerald-50/70 to-white border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    {isApproaching && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white mb-1.5 shadow-2xs">
                        THIS UPCOMING SUNDAY
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-900">
                      {roster.serviceType}
                    </h3>
                    <p className="text-xs font-bold text-blue-900 mt-0.5">
                      📅 {formatDate(roster.serviceDate)}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                    {roster.status}
                  </span>
                </div>

                {/* Linked Dress code banner if present */}
                {matchingDressCode && (
                  <div className="my-3 p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-blue-950 font-bold truncate">
                        Theme: {matchingDressCode.themeTitle}
                      </span>
                    </div>
                    {onNavigateToDressCode && (
                      <button
                        onClick={onNavigateToDressCode}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer shrink-0"
                      >
                        View Attire →
                      </button>
                    )}
                  </div>
                )}

                {/* Leaders */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Team Leader
                    </span>
                    <span className="font-bold text-slate-800">{roster.teamLeader}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Prayer Leader
                    </span>
                    <span className="font-bold text-slate-800">{roster.prayerLeader}</span>
                  </div>
                </div>

                {/* Assigned Personnel */}
                <div className="mt-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Assigned Duty Personnel ({roster.assignments.length})
                  </h4>
                  <div className="space-y-1.5">
                    {roster.assignments.map((asg, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-slate-100 shadow-2xs"
                      >
                        <span className="font-bold text-slate-800">{asg.memberName}</span>
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {asg.dutyRole}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {roster.notes && (
                  <p className="mt-3 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong>Briefing:</strong> {roster.notes}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedRosterForPrint(roster)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Duty Sheet
                </button>

                {canManageRosters && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(roster)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                      title="Duplicate as template"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditClick(roster)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                      title="Edit roster"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this service roster?')) {
                          deleteRoster(roster.id);
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
          );
        })}
      </div>

      {/* Add / Edit Roster Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoster ? 'Edit Service Roster' : 'Create Service Roster'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Service Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Service Type *</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  >
                    <option value="Sunday 1st Service">Sunday 1st Service</option>
                    <option value="Sunday 2nd Service">Sunday 2nd Service</option>
                    <option value="Tuesday Word & Communion">Tuesday Word & Communion</option>
                    <option value="Special Meeting">Special Meeting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Team Leader *</label>
                  <select
                    value={formData.teamLeader}
                    onChange={(e) => setFormData({ ...formData, teamLeader: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.fullName}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prayer Leader *</label>
                  <select
                    value={formData.prayerLeader}
                    onChange={(e) => setFormData({ ...formData, prayerLeader: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.fullName}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignments Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Duty Personnel Assignments</label>
                  <button
                    type="button"
                    onClick={handleAddAssignment}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    + Add Assignee
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.assignments.map((asg, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                      <select
                        value={asg.memberName}
                        onChange={(e) => {
                          const updated = [...formData.assignments];
                          updated[idx].memberName = e.target.value;
                          setFormData({ ...formData, assignments: updated });
                        }}
                        className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.fullName}>
                            {m.fullName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={asg.dutyRole}
                        onChange={(e) => {
                          const updated = [...formData.assignments];
                          updated[idx].dutyRole = e.target.value;
                          setFormData({ ...formData, assignments: updated });
                        }}
                        placeholder="Duty role..."
                        className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(idx)}
                        className="text-slate-400 hover:text-red-500 px-1 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Notes & Arrival Briefing
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  {editingRoster ? 'Update Roster' : 'Save Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print Duty Sheet Modal */}
      {selectedRosterForPrint && (
        <PrintModal
          isOpen={true}
          onClose={() => setSelectedRosterForPrint(null)}
          title={`DOMINION CITY ASABA — SERVICE DUTY ROSTER`}
          subtitle={`${selectedRosterForPrint.serviceType} • Date: ${formatDate(selectedRosterForPrint.serviceDate)}`}
          documentRef={`RST-${selectedRosterForPrint.id}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Designated Team Leader:
                </span>
                <span className="font-black text-slate-900 text-sm">
                  {selectedRosterForPrint.teamLeader}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Pre-Service Prayer Leader:
                </span>
                <span className="font-black text-slate-900 text-sm">
                  {selectedRosterForPrint.prayerLeader}
                </span>
              </div>
            </div>

            <table className="w-full text-[11px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-emerald-800 text-white font-bold">
                  <th className="p-2 border border-slate-300 text-center w-12">S/N</th>
                  <th className="p-2 border border-slate-300 text-left">Assigned Officer / Member</th>
                  <th className="p-2 border border-slate-300 text-left">Specific Responsibility</th>
                  <th className="p-2 border border-slate-300 text-center w-28">Signature</th>
                </tr>
              </thead>
              <tbody>
                {selectedRosterForPrint.assignments.map((asg, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2.5 border border-slate-300 text-center font-bold">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 border border-slate-300 font-bold text-slate-900">
                      {asg.memberName}
                    </td>
                    <td className="p-2.5 border border-slate-300 font-medium text-slate-700">
                      {asg.dutyRole}
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center">
                      <div className="h-6 border-b border-dashed border-slate-400 mx-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedRosterForPrint.notes && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                <strong>Special Instructions:</strong> {selectedRosterForPrint.notes}
              </div>
            )}
          </div>
        </PrintModal>
      )}
    </div>
  );
};
