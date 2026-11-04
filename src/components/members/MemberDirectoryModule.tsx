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
  CheckCircle2,
  Building2,
  Home,
  MessageCircle,
  ExternalLink,
  Shield,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export const MemberDirectoryModule: React.FC = () => {
  const { canManageMembers, canViewConfidentialData, isHOD, isOperations, isSecretary } = useAuth();
  const { members, addMember, updateMember, deleteMember, cells, satellites } = useData();

  // Universal authorized officers
  const isAuthorized = canManageMembers || isHOD || isOperations || isSecretary;

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedSatellite, setSelectedSatellite] = useState<string>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DepartmentMember | null>(null);
  const [viewingMember, setViewingMember] = useState<DepartmentMember | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const initialFormState = {
    fullName: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    birthDay: 15,
    birthMonth: 1,
    birthYear: 1995,
    departmentRole: 'Front Desk Hospitality',
    occupation: '',
    phone: '',
    email: '',
    cell: 'Grace & Truth Cell, Summit Road',
    satelliteChurch: 'Dominion City Asaba (Main Base)',
    residentialArea: 'Summit Road, Asaba',
    status: 'Active' as 'Active' | 'Inactive',
    joinedDate: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(initialFormState);

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (m.fullName && m.fullName.toLowerCase().includes(q)) ||
      (m.departmentRole && m.departmentRole.toLowerCase().includes(q)) ||
      (m.residentialArea && m.residentialArea.toLowerCase().includes(q)) ||
      (m.cell && m.cell.toLowerCase().includes(q)) ||
      (m.satelliteChurch && m.satelliteChurch.toLowerCase().includes(q)) ||
      (m.phone && m.phone.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.occupation && m.occupation.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'All' || m.status === selectedStatus;
    const matchesSatellite =
      selectedSatellite === 'All' ||
      (m.satelliteChurch && m.satelliteChurch.toLowerCase().includes(selectedSatellite.toLowerCase()));

    return matchesSearch && matchesStatus && matchesSatellite;
  });

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData(initialFormState);
    setErrorMessage(null);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (member: DepartmentMember) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      photoUrl: member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      birthDay: member.birthDay || 15,
      birthMonth: member.birthMonth || 1,
      birthYear: member.birthYear || 1995,
      departmentRole: member.departmentRole || 'Front Desk Hospitality',
      occupation: member.occupation || '',
      phone: member.phone || '',
      email: member.email || '',
      cell: member.cell || 'Grace & Truth Cell, Summit Road',
      satelliteChurch: member.satelliteChurch || 'Dominion City Asaba (Main Base)',
      residentialArea: member.residentialArea || 'Summit Road, Asaba',
      status: member.status || 'Active',
      joinedDate: member.joinedDate || new Date().toISOString().split('T')[0],
    });
    setErrorMessage(null);
    setIsAddModalOpen(true);
  };

  const handleDeleteMember = (member: DepartmentMember) => {
    if (confirm(`Are you sure you want to remove "${member.fullName}" from the Members Folder?\n\nThis will safely update the member list while preserving all historical attendance and service records.`)) {
      deleteMember(member.id);
      if (viewingMember?.id === member.id) {
        setViewingMember(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = formData.fullName.trim();
    if (!trimmedName || !formData.phone.trim()) {
      setErrorMessage('Please provide both Member Full Legal Name and Phone Number.');
      return;
    }

    // Duplicate Prevention Check
    const cleanPhone = formData.phone.replace(/\D/g, '');
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanName = trimmedName.toLowerCase();

    const existingDuplicate = members.find((m) => {
      if (editingMember && m.id === editingMember.id) return false;
      const matchName = m.fullName.trim().toLowerCase() === cleanName;
      const matchPhone = cleanPhone.length > 5 && m.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-8));
      const matchEmail = cleanEmail.length > 0 && m.email && m.email.trim().toLowerCase() === cleanEmail;
      return matchName || matchPhone || matchEmail;
    });

    if (existingDuplicate) {
      setErrorMessage(
        `Duplicate Member Detected:\nA member with matching name, phone, or email is already registered:\n• Name: ${existingDuplicate.fullName}\n• Phone: ${existingDuplicate.phone}\n• Role: ${existingDuplicate.departmentRole}\nPlease verify the details to prevent accidental duplicate registrations.`
      );
      return;
    }

    const finalDay = Number(formData.birthDay) || 1;
    const finalMonth = Number(formData.birthMonth) || 1;
    const finalYear = Number(formData.birthYear) || 1995;
    const payload = {
      ...formData,
      fullName: trimmedName,
      birthDay: finalDay,
      birthMonth: finalMonth,
      birthYear: finalYear,
      dateOfBirth: `${finalYear}-${String(finalMonth).padStart(2, '0')}-${String(finalDay).padStart(2, '0')}`,
    };

    if (editingMember) {
      updateMember(editingMember.id, payload);
      setEditingMember(null);
    } else {
      addMember(payload);
    }

    setIsAddModalOpen(false);
    setFormData(initialFormState);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredMembers, 'DominionCity_Asaba_InfoDesk_MembersFolder', [
      { key: 'fullName', header: 'Full Legal Name' },
      { key: 'departmentRole', header: 'Department Role / Assignment' },
      { key: 'cell', header: 'Cell Fellowship' },
      { key: 'satelliteChurch', header: 'Satellite Church / Base' },
      { key: 'phone', header: 'Phone Number' },
      { key: 'email', header: 'Email Address' },
      { key: 'residentialArea', header: 'Residential Area' },
      { key: 'birthDay', header: 'Birth Day' },
      { key: 'birthMonth', header: 'Birth Month', format: (m) => MONTH_NAMES[m - 1] },
      { key: 'occupation', header: 'Occupation' },
      { key: 'status', header: 'Membership Status' },
      { key: 'joinedDate', header: 'Joined Date' },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0E172B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 shadow-2xs">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Members Folder
              </h2>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 ml-2">
                Active Department Personnel
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered officers, workers and members of the Information Desk Department ({members.length} total)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAuthorized && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm cursor-pointer hover:shadow"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add New Member
            </button>
          )}

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print List
          </button>

          {canViewConfidentialData && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          )}

          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Table Detail View"
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
            placeholder="Search member name, cell, satellite church, role..."
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

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredMembers.length}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{members.length}</strong>
            {(searchQuery || selectedStatus !== 'All' || selectedSatellite !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('All');
                  setSelectedSatellite('All');
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
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive / On Leave</option>
          </select>

          <select
            value={selectedSatellite}
            onChange={(e) => setSelectedSatellite(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600 font-medium cursor-pointer max-w-[160px]"
          >
            <option value="All">All Satellite Bases</option>
            {satellites.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
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
              ? `We couldn't find any department members matching "${searchQuery}". Please check the spelling or search by cell or satellite church.`
              : 'No members match the selected status or satellite filter.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('All');
                setSelectedSatellite('All');
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
              className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img
                      src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={m.fullName}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100 dark:ring-blue-900 shadow-xs cursor-pointer group-hover:ring-blue-400 transition-all"
                      onClick={() => setViewingMember(m)}
                    />
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${m.status === 'Active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="mt-3">
                  <h3
                    onClick={() => setViewingMember(m)}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  >
                    {m.fullName}
                  </h3>
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

                  {m.cell && (
                    <div className="flex items-start gap-2">
                      <Home className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight line-clamp-1">{m.cell}</span>
                    </div>
                  )}

                  {m.satelliteChurch && (
                    <div className="flex items-start gap-2">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight line-clamp-1">{m.satelliteChurch}</span>
                    </div>
                  )}

                  {canViewConfidentialData ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-mono text-[11px]">{m.phone}</span>
                      </div>
                      {m.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="break-all text-[11px]">{m.email}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">
                      Contact details protected
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="break-words leading-tight">{m.residentialArea}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setViewingMember(m)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Profile
                </button>

                {isAuthorized && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(m)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMember(m)}
                      className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                      title="Remove Member from Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
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
                  <th className="p-3">Role / Duty</th>
                  <th className="p-3">Cell & Satellite Base</th>
                  <th className="p-3">Birthday</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={m.fullName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-blue-200 cursor-pointer"
                          onClick={() => setViewingMember(m)}
                        />
                        <div>
                          <p
                            onClick={() => setViewingMember(m)}
                            className="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {m.fullName}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{m.occupation || 'Member'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-blue-800 dark:text-blue-400">{m.departmentRole}</td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="block text-[11px] font-medium text-slate-800 dark:text-slate-200">
                          {m.cell || 'Grace & Truth Cell'}
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                          {m.satelliteChurch || 'Dominion City Asaba'}
                        </span>
                      </div>
                    </td>
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
                        <span className="text-slate-400 italic">Protected</span>
                      )}
                    </td>
                    <td className="p-3">{m.residentialArea}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingMember(m)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded cursor-pointer"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAuthorized && (
                          <>
                            <button
                              onClick={() => handleEditClick(m)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded cursor-pointer"
                              title="Edit Member"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(m)}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
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

      {/* Member Profile View Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Member Profile Folder
                </h3>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-5">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <img
                  src={viewingMember.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={viewingMember.fullName}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500 shadow-md"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {viewingMember.fullName}
                    </h4>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        viewingMember.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {viewingMember.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {viewingMember.departmentRole}
                  </p>
                  {viewingMember.occupation && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {viewingMember.occupation}
                    </p>
                  )}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Birthday & Celebration
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                    <Cake className="w-4 h-4 text-pink-500" />
                    <span>
                      {viewingMember.birthDay} {MONTH_NAMES[viewingMember.birthMonth - 1]}
                      {viewingMember.birthYear ? ` (${viewingMember.birthYear})` : ''}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Cell Fellowship
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                    <Home className="w-4 h-4 text-teal-500" />
                    <span className="line-clamp-1">{viewingMember.cell || 'Grace & Truth Cell, Summit Road'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Satellite Church Base
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    <span className="line-clamp-1">{viewingMember.satelliteChurch || 'Dominion City Asaba (Main Base)'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Residential Location
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="line-clamp-1">{viewingMember.residentialArea}</span>
                  </div>
                </div>
              </div>

              {/* Direct Communications */}
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                  Contact & Fast Action Channels
                </span>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={`tel:${viewingMember.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white hover:border-blue-500 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    {viewingMember.phone}
                  </a>

                  <a
                    href={`https://wa.me/${viewingMember.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Dear ${viewingMember.fullName}, greetings in Jesus' name from Dominion City Asaba Information Desk Department.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>

                  {viewingMember.email && (
                    <a
                      href={`mailto:${viewingMember.email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white hover:border-blue-500 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      Email
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons for Authorized Officers */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">
                  Joined: {viewingMember.joinedDate || '2024'}
                </div>

                <div className="flex items-center gap-2">
                  {isAuthorized && (
                    <>
                      <button
                        onClick={() => {
                          const m = viewingMember;
                          setViewingMember(null);
                          handleEditClick(m);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Profile
                      </button>

                      <button
                        onClick={() => handleDeleteMember(viewingMember)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setViewingMember(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingMember ? 'Edit Member Record' : 'Register New Department Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="whitespace-pre-line leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brother Chukwudi Okonkwo"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Department Duty / Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Front Desk Lead, Secretary, Hospitality..."
                    value={formData.departmentRole}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentRole: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Occupation / Career
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Civil Engineer, Accountant, Educator..."
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600"
                  />
                </div>
              </div>

              {/* Cell Fellowship and Satellite Church Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Cell Fellowship
                  </label>
                  <input
                    type="text"
                    list="cell-options"
                    placeholder="Select or enter cell fellowship..."
                    value={formData.cell}
                    onChange={(e) => setFormData({ ...formData, cell: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600"
                  />
                  <datalist id="cell-options">
                    {cells.map((c) => (
                      <option key={c.id} value={`${c.cellName} (${c.neighborhood || c.locationAddress})`} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Satellite Church Base
                  </label>
                  <input
                    type="text"
                    list="satellite-options"
                    placeholder="Select or enter satellite church..."
                    value={formData.satelliteChurch}
                    onChange={(e) => setFormData({ ...formData, satelliteChurch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600"
                  />
                  <datalist id="satellite-options">
                    <option value="Dominion City Asaba (Main Base)" />
                    {satellites.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Date of Birth Picker & Synchronized Fields */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Date of Birth * (Calendar Picker or Manual)
                  </label>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    Syncs with Birthday Banner
                  </span>
                </div>
                <input
                  type="date"
                  value={`${formData.birthYear || 1995}-${String(formData.birthMonth || 1).padStart(2, '0')}-${String(formData.birthDay || 1).padStart(2, '0')}`}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split('-').map(Number);
                      setFormData({
                        ...formData,
                        birthYear: y || 1995,
                        birthMonth: m || 1,
                        birthDay: d || 1,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="font-semibold text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                      Day
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      required
                      value={formData.birthDay === 0 ? '' : formData.birthDay}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birthDay: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                      Month
                    </label>
                    <select
                      value={formData.birthMonth}
                      onChange={(e) =>
                        setFormData({ ...formData, birthMonth: parseInt(e.target.value, 10) || 1 })
                      }
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                    >
                      {MONTH_NAMES.map((name, idx) => (
                        <option key={name} value={idx + 1}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                      Year
                    </label>
                    <input
                      type="number"
                      min="1940"
                      max="2030"
                      value={formData.birthYear === 0 ? '' : formData.birthYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birthYear: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Residential Area in Asaba *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summit Road, Okpanam, GRA, Nnebisi..."
                    value={formData.residentialArea}
                    onChange={(e) =>
                      setFormData({ ...formData, residentialArea: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-blue-600 cursor-pointer"
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
                placeholderText="Upload photo from mobile camera or desktop files"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {editingMember ? 'Update Member Record' : 'Save Member to Folder'}
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
        title="DOMINION CITY ASABA — INFORMATION DESK MEMBERS FOLDER"
        subtitle="Departmental Workforce & Responsibility Register"
        documentRef={`MEM-DIR-${new Date().getFullYear()}`}
        isConfidential={true}
      >
        <table className="w-full text-[11px] border-collapse border border-slate-300">
          <thead>
            <tr className="bg-blue-900 text-white font-bold">
              <th className="p-2 border border-slate-300 text-left">S/N</th>
              <th className="p-2 border border-slate-300 text-left">Full Name</th>
              <th className="p-2 border border-slate-300 text-left">Department Role</th>
              <th className="p-2 border border-slate-300 text-left">Cell Fellowship</th>
              <th className="p-2 border border-slate-300 text-left">Satellite Base</th>
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
                <td className="p-2 border border-slate-300">{m.cell || 'Grace & Truth'}</td>
                <td className="p-2 border border-slate-300">{m.satelliteChurch || 'DC Asaba'}</td>
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
