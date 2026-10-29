import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ServiceReport } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { exportToCSV } from '../../utils/exportUtils';
import { formatDate } from '../../utils/dateUtils';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Filter,
  Check,
  Edit2,
  Trash2,
  UserCheck,
  Paperclip,
  Building,
} from 'lucide-react';

export const ServiceReportsModule: React.FC = () => {
  const { currentUser, canManageReports, isHOD, isSecretary } = useAuth();
  const { reports, addReport, updateReport, deleteReport } = useData();

  const isAuthorized = canManageReports || isHOD || isSecretary;

  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState<'All' | 'Desk A — Left Wing' | 'Desk B — Right Wing'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Draft'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ServiceReport | null>(null);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<ServiceReport | null>(null);
  const [viewingReport, setViewingReport] = useState<ServiceReport | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    serviceDate: string;
    serviceType: ServiceReport['serviceType'];
    reportingWing: 'Desk A — Left Wing' | 'Desk B — Right Wing';
    category: string;
    deskAttendanceCount: number;
    inquiriesHandled: number;
    cellConnectionsCount: number;
    lostItemsLogged: number;
    activitiesCarriedOut: string;
    observations: string;
    issuesEncountered: string;
    followUpActions: string;
    attachments: string;
    status: 'Draft' | 'Submitted';
  }>({
    title: '',
    serviceDate: new Date().toISOString().split('T')[0],
    serviceType: 'Sunday 1st Service',
    reportingWing: 'Desk A — Left Wing',
    category: 'Service Overview',
    deskAttendanceCount: 150,
    inquiriesHandled: 80,
    cellConnectionsCount: 15,
    lostItemsLogged: 1,
    activitiesCarriedOut: '',
    observations: '',
    issuesEncountered: '',
    followUpActions: '',
    attachments: '',
    status: 'Submitted',
  });

  const filteredReports = reports.filter((r) => {
    // Only submitted reports visible to general members, officers see drafts
    if (!isAuthorized && r.status === 'Draft') return false;

    const matchesWing = wingFilter === 'All' || r.reportingWing === wingFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      r.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serviceDate.includes(searchQuery) ||
      (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.reportingWing && r.reportingWing.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesWing && matchesStatus && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingReport(null);
    setFormData({
      title: `Service Report — ${new Date().toLocaleDateString('en-GB')}`,
      serviceDate: new Date().toISOString().split('T')[0],
      serviceType: 'Sunday 1st Service',
      reportingWing: 'Desk A — Left Wing',
      category: 'Service Overview',
      deskAttendanceCount: 150,
      inquiriesHandled: 80,
      cellConnectionsCount: 15,
      lostItemsLogged: 1,
      activitiesCarriedOut: '',
      observations: '',
      issuesEncountered: '',
      followUpActions: '',
      attachments: '',
      status: 'Submitted',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (report: ServiceReport) => {
    setEditingReport(report);
    setFormData({
      title: report.title || `Service Report — ${report.serviceDate}`,
      serviceDate: report.serviceDate,
      serviceType: report.serviceType,
      reportingWing: report.reportingWing || 'Desk A — Left Wing',
      category: 'Service Overview',
      deskAttendanceCount: report.deskAttendanceCount || 0,
      inquiriesHandled: report.inquiriesHandled || 0,
      cellConnectionsCount: report.cellConnectionsCount || 0,
      lostItemsLogged: report.lostItemsLogged || 0,
      activitiesCarriedOut: report.activitiesCarriedOut || '',
      observations: report.observations || '',
      issuesEncountered: report.challenges || report.issuesEncountered || '',
      followUpActions: report.followUpActions || '',
      attachments: report.attachments ? report.attachments.join(', ') : '',
      status: report.status || 'Submitted',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, date: string) => {
    if (confirm(`Are you sure you want to delete the service report for ${date}?`)) {
      deleteReport(id);
      if (viewingReport?.id === id) {
        setViewingReport(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activitiesCarriedOut.trim()) {
      alert('Please describe activities carried out during the service.');
      return;
    }

    const parsedAttachments = formData.attachments
      ? formData.attachments.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const payload = {
      title: formData.title.trim() || undefined,
      serviceDate: formData.serviceDate,
      serviceType: formData.serviceType,
      reportingWing: formData.reportingWing,
      deskAttendanceCount: Number(formData.deskAttendanceCount),
      inquiriesHandled: Number(formData.inquiriesHandled),
      cellConnectionsCount: Number(formData.cellConnectionsCount),
      lostItemsLogged: Number(formData.lostItemsLogged),
      activitiesCarriedOut: formData.activitiesCarriedOut.trim(),
      observations: formData.observations.trim(),
      issuesEncountered: formData.issuesEncountered.trim(),
      challenges: formData.issuesEncountered.trim(),
      followUpActions: formData.followUpActions.trim(),
      attachments: parsedAttachments,
      status: formData.status,
      submittedBy: editingReport
        ? editingReport.submittedBy
        : `${currentUser.name} (${currentUser.departmentRole})`,
    };

    if (editingReport) {
      updateReport(editingReport.id, payload);
    } else {
      addReport(payload);
    }

    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredReports.map((r) => ({
        Date: r.serviceDate,
        Title: r.title || 'N/A',
        Service: r.serviceType,
        Wing: r.reportingWing,
        Attendance: r.deskAttendanceCount,
        Inquiries: r.inquiriesHandled,
        CellConnections: r.cellConnectionsCount,
        LostItems: r.lostItemsLogged,
        Activities: r.activitiesCarriedOut,
        Observations: r.observations,
        Challenges: r.challenges || r.issuesEncountered || '',
        FollowUp: r.followUpActions || '',
        SubmittedBy: r.submittedBy,
        Status: r.status,
      })),
      `DominionCity_Asaba_ServiceReports_${new Date().toISOString().split('T')[0]}`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0E172B] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Service Reports & Front Desk Documentation
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official operational reports with wing distinction: <strong>Desk A (Left Wing)</strong> and <strong>Desk B (Right Wing)</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAuthorized && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Submit Report
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Wing Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['All', 'Desk A — Left Wing', 'Desk B — Right Wing'] as const).map((wing) => (
              <button
                key={wing}
                onClick={() => setWingFilter(wing)}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  wingFilter === wing
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {wing === 'All' ? 'All Wings' : wing.replace('Desk ', '')}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['All', 'Submitted', 'Draft'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports by wing, date, author..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-[#0E172B] p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Service Reports Found</h4>
            <p className="text-xs text-slate-500 mt-1">No reports match the selected filters or search query.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {report.serviceType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded font-black text-[10px] uppercase bg-teal-100 text-teal-800 border border-teal-200">
                      {report.reportingWing || 'Desk A — Left Wing'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        report.status === 'Submitted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    {report.title || `Service Report: ${formatDate(report.serviceDate)}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Filed by {report.submittedBy} • Date: {formatDate(report.serviceDate)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setViewingReport(report)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer"
                    title="View Full Report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedReportForPrint(report)}
                    className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Print Official Report Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {isAuthorized && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(report)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Report"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(report.id, report.serviceDate)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Statistics highlight metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="p-3 bg-slate-50 dark:bg-[#131F38] rounded-xl text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                    Desk Inquiries
                  </span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                    {report.inquiriesHandled}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#131F38] rounded-xl text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                    Cell Connections
                  </span>
                  <span className="text-lg font-black text-emerald-600">
                    {report.cellConnectionsCount}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#131F38] rounded-xl text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                    Total Desk Traffic
                  </span>
                  <span className="text-lg font-black text-blue-600">
                    {report.deskAttendanceCount}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#131F38] rounded-xl text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                    Lost Items Logged
                  </span>
                  <span className="text-lg font-black text-amber-600">
                    {report.lostItemsLogged}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/70 dark:bg-[#131F38] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">Activities Carried Out:</strong>
                  <p className="whitespace-pre-line text-slate-600 dark:text-slate-300 leading-relaxed">
                    {report.activitiesCarriedOut}
                  </p>
                </div>
                {(report.challenges || report.issuesEncountered) && (
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                    <strong className="text-rose-700 dark:text-rose-400 block mb-0.5">Challenges Encountered:</strong>
                    <p className="text-slate-600 dark:text-slate-300">{report.challenges || report.issuesEncountered}</p>
                  </div>
                )}
                {report.followUpActions && (
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                    <strong className="text-blue-700 dark:text-blue-400 block mb-0.5">Follow-up Actions:</strong>
                    <p className="text-slate-600 dark:text-slate-300">{report.followUpActions}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* NEW / EDIT REPORT SUBMISSION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingReport ? 'Edit Service Report' : 'File Front Desk Service Report'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              {/* Authenticated Author Tag */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-800 dark:text-blue-300 uppercase font-black tracking-wider block">
                    Reporting Officer
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    {editingReport ? editingReport.submittedBy : currentUser.name}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
                  {currentUser.departmentRole}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunday 1st Service Report — Desk A"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Service Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Service Type *
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceType: e.target.value as ServiceReport['serviceType'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Sunday 1st Service">Sunday 1st Service</option>
                    <option value="Sunday 2nd Service">Sunday 2nd Service</option>
                    <option value="Tuesday Word & Communion">Tuesday Midweek</option>
                    <option value="Thursday Prayer Meeting">Thursday Prayer</option>
                    <option value="Special Meeting">Special Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reporting Wing / Team *
                  </label>
                  <select
                    value={formData.reportingWing}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reportingWing: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Desk A — Left Wing">Desk A — Left Wing</option>
                    <option value="Desk B — Right Wing">Desk B — Right Wing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Submission Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'Draft' | 'Submitted',
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Submitted">Submitted (Official)</option>
                    <option value="Draft">Save as Draft</option>
                  </select>
                </div>
              </div>

              {/* Statistics row */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Inquiries</label>
                  <input
                    type="number"
                    value={formData.inquiriesHandled}
                    onChange={(e) => setFormData({ ...formData, inquiriesHandled: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Cell Conn.</label>
                  <input
                    type="number"
                    value={formData.cellConnectionsCount}
                    onChange={(e) => setFormData({ ...formData, cellConnectionsCount: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Desk Traffic</label>
                  <input
                    type="number"
                    value={formData.deskAttendanceCount}
                    onChange={(e) => setFormData({ ...formData, deskAttendanceCount: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Lost Items</label>
                  <input
                    type="number"
                    value={formData.lostItemsLogged}
                    onChange={(e) => setFormData({ ...formData, lostItemsLogged: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Activities Carried Out *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.activitiesCarriedOut}
                  onChange={(e) => setFormData({ ...formData, activitiesCarriedOut: e.target.value })}
                  placeholder="Detail operations performed during duty..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Challenges Encountered
                </label>
                <textarea
                  rows={2}
                  value={formData.issuesEncountered}
                  onChange={(e) => setFormData({ ...formData, issuesEncountered: e.target.value })}
                  placeholder="Any operational challenges, equipment issues, or bottlenecks..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Actions
                </label>
                <textarea
                  rows={2}
                  value={formData.followUpActions}
                  onChange={(e) => setFormData({ ...formData, followUpActions: e.target.value })}
                  placeholder="Actions needed before or during the next service..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Optional Attachment URLs (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="https://... flyer link, receipt scan URL, document URL"
                  value={formData.attachments}
                  onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  {editingReport ? 'Update Report' : 'Save & Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL REPORT DETAIL VIEWER MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 uppercase">
                  {viewingReport.reportingWing}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {viewingReport.title || `Service Report — ${viewingReport.serviceDate}`}
                </h3>
                <p className="text-slate-400">
                  {viewingReport.serviceType} • {formatDate(viewingReport.serviceDate)} • Filed by {viewingReport.submittedBy}
                </p>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center p-3 bg-slate-50 dark:bg-[#131F38] rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Inquiries</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{viewingReport.inquiriesHandled}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 font-bold block">Cell Conn.</span>
                <span className="text-sm font-black text-emerald-700">{viewingReport.cellConnectionsCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-blue-600 font-bold block">Attendance</span>
                <span className="text-sm font-black text-blue-700">{viewingReport.deskAttendanceCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-600 font-bold block">Lost Items</span>
                <span className="text-sm font-black text-amber-700">{viewingReport.lostItemsLogged}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Activities Carried Out:</h4>
                <p className="mt-1 p-3 rounded-xl bg-slate-50 dark:bg-[#131F38] whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">
                  {viewingReport.activitiesCarriedOut}
                </p>
              </div>

              {(viewingReport.challenges || viewingReport.issuesEncountered) && (
                <div>
                  <h4 className="font-bold text-rose-700">Challenges Encountered:</h4>
                  <p className="mt-1 p-3 rounded-xl bg-rose-50/50 text-rose-950 leading-relaxed">
                    {viewingReport.challenges || viewingReport.issuesEncountered}
                  </p>
                </div>
              )}

              {viewingReport.followUpActions && (
                <div>
                  <h4 className="font-bold text-blue-700">Follow-up Actions:</h4>
                  <p className="mt-1 p-3 rounded-xl bg-blue-50/50 text-blue-950 leading-relaxed">
                    {viewingReport.followUpActions}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setViewingReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT REPORT DOCUMENT MODAL */}
      {selectedReportForPrint && (
        <PrintModal
          isOpen={true}
          onClose={() => setSelectedReportForPrint(null)}
          title="DOMINION CITY ASABA — OFFICIAL SERVICE REPORT"
          subtitle={`Department of Information Desk • ${selectedReportForPrint.reportingWing || 'General Desk'}`}
          documentRef={`REP-${selectedReportForPrint.id}`}
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-300">
              <div>
                <p><strong>Service Type:</strong> {selectedReportForPrint.serviceType}</p>
                <p><strong>Service Date:</strong> {formatDate(selectedReportForPrint.serviceDate)}</p>
                <p><strong>Wing:</strong> {selectedReportForPrint.reportingWing}</p>
              </div>
              <div>
                <p><strong>Filed By:</strong> {selectedReportForPrint.submittedBy}</p>
                <p><strong>Submission Status:</strong> {selectedReportForPrint.status}</p>
              </div>
            </div>

            <table className="w-full text-center border-collapse border border-slate-300">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-300 p-2">Desk Inquiries</th>
                  <th className="border border-slate-300 p-2">Cell Connections</th>
                  <th className="border border-slate-300 p-2">Total Desk Traffic</th>
                  <th className="border border-slate-300 p-2">Lost Items</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 font-bold">{selectedReportForPrint.inquiriesHandled}</td>
                  <td className="border border-slate-300 p-2 font-bold">{selectedReportForPrint.cellConnectionsCount}</td>
                  <td className="border border-slate-300 p-2 font-bold">{selectedReportForPrint.deskAttendanceCount}</td>
                  <td className="border border-slate-300 p-2 font-bold">{selectedReportForPrint.lostItemsLogged}</td>
                </tr>
              </tbody>
            </table>

            <div>
              <h4 className="font-bold uppercase text-[11px] mb-1">Activities Carried Out:</h4>
              <p className="whitespace-pre-line p-2 border border-slate-200 rounded">
                {selectedReportForPrint.activitiesCarriedOut}
              </p>
            </div>

            {(selectedReportForPrint.challenges || selectedReportForPrint.issuesEncountered) && (
              <div>
                <h4 className="font-bold uppercase text-[11px] text-red-700 mb-1">Challenges:</h4>
                <p className="p-2 border border-slate-200 rounded">
                  {selectedReportForPrint.challenges || selectedReportForPrint.issuesEncountered}
                </p>
              </div>
            )}
          </div>
        </PrintModal>
      )}
    </div>
  );
};
