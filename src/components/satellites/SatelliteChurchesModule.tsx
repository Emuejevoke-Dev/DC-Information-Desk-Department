import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SatelliteChurch } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Building2,
  Plus,
  Search,
  Printer,
  Download,
  Phone,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

export const SatelliteChurchesModule: React.FC = () => {
  const { currentUser, canManageMembers } = useAuth();
  const { satellites, addSatellite, updateSatellite, deleteSatellite } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSat, setEditingSat] = useState<SatelliteChurch | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    residentPastor: '',
    pastorPhone: '',
    pastorPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    venue: '',
    neighborhood: 'Okpanam Town',
    sundayServiceTimes: 'Sunday Service: 08:30 AM',
    midweekServiceTimes: 'Wednesday Communion: 05:30 PM',
    directions: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const filteredSatellites = satellites.filter((s) => {
    return (
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.residentPastor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.venue.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.residentPastor || !formData.venue) {
      alert('Please fill out Satellite Church Name, Resident Pastor, and Venue.');
      return;
    }

    if (editingSat) {
      updateSatellite(editingSat.id, formData);
      setEditingSat(null);
    } else {
      addSatellite(formData);
    }

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      residentPastor: '',
      pastorPhone: '',
      pastorPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      venue: '',
      neighborhood: 'Okpanam Town',
      sundayServiceTimes: 'Sunday Service: 08:30 AM',
      midweekServiceTimes: 'Wednesday Communion: 05:30 PM',
      directions: '',
      status: 'Active',
    });
  };

  const handleEditClick = (s: SatelliteChurch) => {
    setEditingSat(s);
    setFormData({
      name: s.name,
      residentPastor: s.residentPastor,
      pastorPhone: s.pastorPhone,
      pastorPhoto: s.pastorPhoto || '',
      venue: s.venue,
      neighborhood: s.neighborhood,
      sundayServiceTimes: s.sundayServiceTimes,
      midweekServiceTimes: s.midweekServiceTimes,
      directions: s.directions,
      status: s.status,
    });
    setIsAddModalOpen(true);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredSatellites, 'DominionCity_Asaba_SatelliteChurches', [
      { key: 'name', header: 'Satellite Church Name' },
      { key: 'neighborhood', header: 'Neighborhood Zone' },
      { key: 'venue', header: 'Meeting Venue' },
      { key: 'residentPastor', header: 'Resident Pastor' },
      { key: 'pastorPhone', header: 'Pastor Phone' },
      { key: 'sundayServiceTimes', header: 'Sunday Service Times' },
      { key: 'midweekServiceTimes', header: 'Midweek Service Times' },
      { key: 'directions', header: 'Directions' },
      { key: 'status', header: 'Status' },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Building2 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Satellite Church Directory — Asaba & Environs
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Directory of Dominion City branches and assemblies under the Asaba regional jurisdiction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageMembers && (
            <button
              onClick={() => {
                setEditingSat(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Satellite Branch
            </button>
          )}
          <button
            onClick={() => setIsPrintModalOpen(true)}
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

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search satellite name, pastor, venue, or neighborhood..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
          />
        </div>
      </div>

      {/* Satellites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSatellites.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {s.neighborhood}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{s.name}</h3>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    s.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-blue-900 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Resident Pastor: {s.residentPastor} ({s.pastorPhone})
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{s.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{s.sundayServiceTimes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{s.midweekServiceTimes}</span>
                </div>
                {s.directions && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 mt-2">
                    <strong>Directions:</strong> {s.directions}
                  </div>
                )}
              </div>
            </div>

            {canManageMembers && (
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEditClick(s)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                  title="Edit Satellite"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove satellite branch "${s.name}"?`)) {
                      deleteSatellite(s.id);
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
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingSat ? 'Edit Satellite Branch' : 'Register Satellite Church'}
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
                <label className="font-bold text-slate-700 block mb-1">
                  Satellite Church Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dominion City Okpanam Satellite"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Neighborhood / Town *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Okpanam, Ibusa, Ogwashi..."
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Resident Pastor *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pastor Victor Kalu"
                    value={formData.residentPastor}
                    onChange={(e) =>
                      setFormData({ ...formData, residentPastor: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pastor Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+234..."
                    value={formData.pastorPhone}
                    onChange={(e) => setFormData({ ...formData, pastorPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Meeting Venue *</label>
                <input
                  type="text"
                  required
                  placeholder="Plot / Street / Hall details..."
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Sunday Service Times
                  </label>
                  <input
                    type="text"
                    value={formData.sundayServiceTimes}
                    onChange={(e) =>
                      setFormData({ ...formData, sundayServiceTimes: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Midweek Service Times
                  </label>
                  <input
                    type="text"
                    value={formData.midweekServiceTimes}
                    onChange={(e) =>
                      setFormData({ ...formData, midweekServiceTimes: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Directions & Landmarks
                </label>
                <textarea
                  rows={2}
                  value={formData.directions}
                  onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
                  placeholder="e.g. Opposite St. Augustine College, on main road..."
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
                  {editingSat ? 'Update Record' : 'Save Satellite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Satellite Directory Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="DOMINION CITY SATELLITE CHURCH DIRECTORY — ASABA"
        subtitle="Official Satellite Locations, Service Times, and Resident Pastors"
        documentRef="SAT-DIR-2026"
      >
        <table className="w-full text-[11px] border-collapse border border-slate-300">
          <thead>
            <tr className="bg-blue-900 text-white font-bold">
              <th className="p-2 border border-slate-300 text-left">Satellite Church</th>
              <th className="p-2 border border-slate-300 text-left">Venue Address</th>
              <th className="p-2 border border-slate-300 text-left">Service Times</th>
              <th className="p-2 border border-slate-300 text-left">Resident Pastor</th>
            </tr>
          </thead>
          <tbody>
            {filteredSatellites.map((s, idx) => (
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
      </PrintModal>
    </div>
  );
};
