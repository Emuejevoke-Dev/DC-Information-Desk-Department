import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DepartmentMember } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { exportToCSV } from '../../utils/exportUtils';
import { MONTH_NAMES } from '../../utils/dateUtils';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  Users,
  Plus,
  Search,
  Printer,
  Download,
  LayoutGrid,
  Table as TableIcon,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Cake,
  X,
  Edit2,
  Trash2,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

export const MemberDirectoryModule: React.FC = () => {
  const { currentUser, canManageMembers, canViewConfidentialData } = useAuth();
  const { members, addMember, updateMember, deleteMember } = useData();

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DepartmentMember | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    birthDay: 15,
    birthMonth: 1,
    birthYear: 1995,
    departmentRole: 'Front Desk Hospitality',
    occupation: '',
    phone: '',
    email: '',
    residentialArea: 'Summit Road, Asaba',
    status: 'Active' as 'Active' | 'Inactive',
    joinedDate: new Date().toISOString().split('T')[0],
  });

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (m.fullName && m.fullName.toLowerCase().includes(q)) ||
      (m.departmentRole && m.departmentRole.toLowerCase().includes(q)) ||
      (m.residentialArea && m.residentialArea.toLowerCase().includes(q)) ||
      (m.phone && m.phone.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.occupation && m.occupation.toLowerCase().includes(q));
    const matchesStatus = selectedStatus === 'All' || m.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please fill out Member Full Name and Phone Number.');
      return;
    }

    if (editingMember) {
      updateMember(editingMember.id, formData);
      setEditingMember(null);
    } else {
      addMember(formData);
    }

    setIsAddModalOpen(false);
    setFormData({
      fullName: '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      birthDay: 15,
      birthMonth: 1,
      birthYear: 1995,
      departmentRole: 'Front Desk Hospitality',
      occupation: '',
      phone: '',
      email: '',
      residentialArea: 'Summit Road, Asaba',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleEditClick = (member: DepartmentMember) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      photoUrl: member.photoUrl,
      birthDay: member.birthDay,
      birthMonth: member.birthMonth,
      birthYear: member.birthYear || 1995,
      departmentRole: member.departmentRole,
      occupation: member.occupation || '',
      phone: member.phone,
      email: member.email,
      residentialArea: member.residentialArea,
      status: member.status,
      joinedDate: member.joinedDate,
    });
    setIsAddModalOpen(true);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredMembers, 'DominionCity_Asaba_InfoDesk_Members', [
      { key: 'fullName', header: 'Full Name' },
      { key: 'departmentRole', header: 'Department Role' },
      { key: 'phone', header: 'Phone Number' },
      { key: 'email', header: 'Email' },
      { key: 'residentialArea', header: 'Residential Area' },
      { key: 'birthDay', header: 'Birth Day' },
      { key: 'birthMonth', header: 'Birth Month', format: (m) => MONTH_NAMES[m - 1] },
      { key: 'status', header: 'Status' },
      { key: 'joinedDate', header: 'Joined Date' },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Department Member Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered officers and workers of the Information Desk Department ({members.length} total)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageMembers && (
            <button
              onClick={() => {
                setEditingMember(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Member
            </button>
          )}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print List
          </button>
          {canViewConfidentialData && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          )}
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-100">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Table"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member name, role, area, phone, email..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredMembers.length}</strong> of <strong className="text-slate-900 dark:text-white">{members.length}</strong> members
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('All');
                }}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer ml-1.5"
              >
                Reset
              </button>
            )}
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600 font-medium cursor-pointer"
          >
            <option value="All">All Membership Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive / On Leave</option>
          </select>
        </div>
      </div>

      {/* Empty Search Result State */}
      {filteredMembers.length === 0 && (
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center shadow-xs transition-colors">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-xs">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No matching members found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {searchQuery
              ? `We couldn't find any department members matching "${searchQuery}". Please check the spelling or try searching by unit or area.`
              : 'No members match the selected filter.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('All');
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              Clear Search Filters
            </button>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <img
                    src={m.photoUrl}
                    alt={m.fullName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100 dark:ring-blue-900 shadow-xs"
                  />
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      m.status === 'Active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{m.fullName}</h3>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
                    {m.departmentRole}
                  </p>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Cake className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span>
                      Birthday: {m.birthDay} {MONTH_NAMES[m.birthMonth - 1]}
                    </span>
                  </div>

                  {canViewConfidentialData ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-mono text-[11px]">{m.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate text-[11px]">{m.email}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">
                      Contact details restricted
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{m.residentialArea}</span>
                  </div>

                  {m.occupation && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{m.occupation}</span>
                    </div>
                  )}
                </div>
              </div>

              {canManageMembers && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleEditClick(m)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deactivate or remove ${m.fullName}?`)) {
                        deleteMember(m.id);
                      }
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Remove record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Member</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Birthday</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Status</th>
                  {canManageMembers && <th className="p-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.photoUrl}
                          alt={m.fullName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-blue-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{m.fullName}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{m.occupation || 'Member'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-blue-800 dark:text-blue-400">{m.departmentRole}</td>
                    <td className="p-3">
                      {m.birthDay} {MONTH_NAMES[m.birthMonth - 1]}
                    </td>
                    <td className="p-3">
                      {canViewConfidentialData ? (
                        <>
                          <span className="font-mono">{m.phone}</span> <br />
                          <span className="text-[10px] text-slate-400">{m.email}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Restricted</span>
                      )}
                    </td>
                    <td className="p-3">{m.residentialArea}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    {canManageMembers && (
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleEditClick(m)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingMember ? 'Edit Member Record' : 'Register Department Member'}
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
                <label className="font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brother Chukwudi Okonkwo"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Department Role / Duty *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Front Desk Lead, Secretary..."
                    value={formData.departmentRole}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentRole: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Occupation / Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. Engineer, Accountant..."
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              {/* Birthday fields */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Birth Day *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={formData.birthDay}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDay: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Birth Month *</label>
                  <select
                    value={formData.birthMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, birthMonth: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Birth Year</label>
                  <input
                    type="number"
                    min="1940"
                    max="2020"
                    value={formData.birthYear}
                    onChange={(e) =>
                      setFormData({ ...formData, birthYear: parseInt(e.target.value) || 1995 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Residential Area in Asaba *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summit Road, Okpanam, GRA..."
                    value={formData.residentialArea}
                    onChange={(e) =>
                      setFormData({ ...formData, residentialArea: e.target.value })
                    }
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

              <ImageUploadInput
                label="Member Profile Photo"
                value={formData.photoUrl}
                onChange={(dataUrl) => setFormData({ ...formData, photoUrl: dataUrl })}
                aspectRatioHint="Square (1:1)"
                placeholderText="Take photo of member with mobile camera or choose from gallery"
              />

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
                  {editingMember ? 'Update Record' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print Member List Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="DOMINION CITY ASABA — INFORMATION DESK MEMBER ROSTER"
        subtitle="Departmental Workforce & Responsibility Roster"
        documentRef={`MEM-DIR-${new Date().getFullYear()}`}
        isConfidential={true}
      >
        <table className="w-full text-[11px] border-collapse border border-slate-300">
          <thead>
            <tr className="bg-blue-900 text-white font-bold">
              <th className="p-2 border border-slate-300 text-left">S/N</th>
              <th className="p-2 border border-slate-300 text-left">Full Name</th>
              <th className="p-2 border border-slate-300 text-left">Department Role</th>
              <th className="p-2 border border-slate-300 text-left">Birthday</th>
              <th className="p-2 border border-slate-300 text-left">Residential Area</th>
              <th className="p-2 border border-slate-300 text-left">Phone Number</th>
              <th className="p-2 border border-slate-300 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((m, idx) => (
              <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                <td className="p-2 border border-slate-300 font-bold">{m.fullName}</td>
                <td className="p-2 border border-slate-300">{m.departmentRole}</td>
                <td className="p-2 border border-slate-300">
                  {m.birthDay} {MONTH_NAMES[m.birthMonth - 1]}
                </td>
                <td className="p-2 border border-slate-300">{m.residentialArea}</td>
                <td className="p-2 border border-slate-300 font-mono">
                  {canViewConfidentialData ? m.phone : '***-***-****'}
                </td>
                <td className="p-2 border border-slate-300 font-bold">{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PrintModal>
    </div>
  );
};
