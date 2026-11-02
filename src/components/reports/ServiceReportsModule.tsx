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
  Layers,
  Building,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export const ServiceReportsModule: React.FC = () => {
  const { currentUser, canManageReports, isHOD, isOperations, isSecretary } = useAuth();
  const {
    reports,
    addReport,
    updateReport,
    deleteReport,
    reportCategories,
    addReportCategory,
    deleteReportCategory,
  } = useData();

  const isAuthorized = canManageReports || isHOD || isOperations || isSecretary;

  // View modes: 'Desk A' | 'Desk B' | 'Combined'
  const [activeViewTab, setActiveViewTab] = useState<'All' | 'Desk A' | 'Desk B' | 'Combined'>('Combined');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Draft'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ServiceReport | null>(null);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<ServiceReport | null>(null);
  const [viewingReport, setViewingReport] = useState<ServiceReport | null>(null);
  const [isCombinedPrintOpen, setIsCombinedPrintOpen] = useState(false);

  // Custom Category Creation State
  const [newCatName, setNewCatName] = useState('');
  const [showCatManager, setShowCatManager] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<{
    title: string;
    serviceDate: string;
    serviceType: ServiceReport['serviceType'];
    reportingWing: 'Desk A — Left Wing' | 'Desk B — Right Wing';
    deskAttendanceCount: number;
    inquiriesHandled: number;
    cellConnectionsCount: number;
    lostItemsLogged: number;
    customMetrics: Record<string, number>;
    activitiesCarriedOut: string;
    observations: string;
    issuesEncountered: string;
    followUpActions: string;
    status: 'Draft' | 'Submitted';
  }>({
    title: '',
    serviceDate: new Date().toISOString().split('T')[0],
    serviceType: 'Sunday 1st Service',
    reportingWing: 'Desk A — Left Wing',
    deskAttendanceCount: 150,
    inquiriesHandled: 80,
    cellConnectionsCount: 15,
    lostItemsLogged: 1,
    customMetrics: {},
    activitiesCarriedOut: '',
    observations: '',
    issuesEncountered: '',
    followUpActions: '',
    status: 'Submitted',
  });

  const coreCategories = ['Desk Traffic', 'Inquiries', 'Cell Connection', 'Lost Items'];

  // Filtered reports for individual views
  const filteredReports = reports.filter((r) => {
    if (!isAuthorized && r.status === 'Draft') return false;

    let matchesWing = true;
    if (activeViewTab === 'Desk A') {
      matchesWing = r.reportingWing === 'Desk A — Left Wing';
    } else if (activeViewTab === 'Desk B') {
      matchesWing = r.reportingWing === 'Desk B — Right Wing';
    }

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesServiceType = serviceTypeFilter === 'All' || r.serviceType === serviceTypeFilter;

    const matchesSearch =
      !searchQuery ||
      r.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serviceDate.includes(searchQuery) ||
      (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.reportingWing && r.reportingWing.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesWing && matchesStatus && matchesServiceType && matchesSearch;
  });

  // Calculate Combined Totals for Desk A, Desk B, and Combined
  const deskAReports = reports.filter(
    (r) =>
      r.status === 'Submitted' &&
      r.reportingWing === 'Desk A — Left Wing' &&
      (serviceTypeFilter === 'All' || r.serviceType === serviceTypeFilter)
  );

  const deskBReports = reports.filter(
    (r) =>
      r.status === 'Submitted' &&
      r.reportingWing === 'Desk B — Right Wing' &&
      (serviceTypeFilter === 'All' || r.serviceType === serviceTypeFilter)
  );

  const sumMetric = (reportList: ServiceReport[], key: keyof ServiceReport) =>
    reportList.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

  const sumCustomMetric = (reportList: ServiceReport[], catName: string) =>
    reportList.reduce((acc, r) => acc + (Number(r.customMetrics?.[catName]) || 0), 0);

  const deskAInquiries = sumMetric(deskAReports, 'inquiriesHandled');
  const deskBInquiries = sumMetric(deskBReports, 'inquiriesHandled');

  const deskACell = sumMetric(deskAReports, 'cellConnectionsCount');
  const deskBCell = sumMetric(deskBReports, 'cellConnectionsCount');

  const deskATraffic = sumMetric(deskAReports, 'deskAttendanceCount');
  const deskBTraffic = sumMetric(deskBReports, 'deskAttendanceCount');

  const deskALost = sumMetric(deskAReports, 'lostItemsLogged');
  const deskBLost = sumMetric(deskBReports, 'lostItemsLogged');

  const handleOpenAdd = () => {
    setEditingReport(null);
    setFormData({
      title: `Service Report — ${new Date().toLocaleDateString('en-GB')}`,
      serviceDate: new Date().toISOString().split('T')[0],
      serviceType: 'Sunday 1st Service',
      reportingWing: activeViewTab === 'Desk B' ? 'Desk B — Right Wing' : 'Desk A — Left Wing',
      deskAttendanceCount: 150,
      inquiriesHandled: 80,
      cellConnectionsCount: 15,
      lostItemsLogged: 1,
      customMetrics: {},
      activitiesCarriedOut: '',
      observations: '',
      issuesEncountered: '',
      followUpActions: '',
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
      deskAttendanceCount: report.deskAttendanceCount || 0,
      inquiriesHandled: report.inquiriesHandled || 0,
      cellConnectionsCount: report.cellConnectionsCount || 0,
      lostItemsLogged: report.lostItemsLogged || 0,
      customMetrics: report.customMetrics || {},
      activitiesCarriedOut: report.activitiesCarriedOut || '',
      observations: report.observations || '',
      issuesEncountered: report.challenges || report.issuesEncountered || '',
      followUpActions: report.followUpActions || '',
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

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (reportCategories.includes(trimmed)) {
      alert('A category with this name already exists.');
      return;
    }
    addReportCategory(trimmed);
    setNewCatName('');
  };

  const handleDeleteCategory = (catName: string) => {
    if (coreCategories.includes(catName)) {
      alert('Core reporting categories cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      deleteReportCategory(catName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activitiesCarriedOut.trim()) {
      alert('Please describe activities carried out during the service.');
      return;
    }

    const payload = {
      title: formData.title.trim() || undefined,
      serviceDate: formData.serviceDate,
      serviceType: formData.serviceType,
      reportingWing: formData.reportingWing,
      deskAttendanceCount: Number(formData.deskAttendanceCount) || 0,
      inquiriesHandled: Number(formData.inquiriesHandled) || 0,
      cellConnectionsCount: Number(formData.cellConnectionsCount) || 0,
      lostItemsLogged: Number(formData.lostItemsLogged) || 0,
      customMetrics: formData.customMetrics,
      activitiesCarriedOut: formData.activitiesCarriedOut.trim(),
      observations: formData.observations.trim(),
      issuesEncountered: formData.issuesEncountered.trim(),
      challenges: formData.issuesEncountered.trim(),
      followUpActions: formData.followUpActions.trim(),
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
            Official front desk service reports for <strong>Desk A (Left Wing)</strong>, <strong>Desk B (Right Wing)</strong>, and <strong>Combined Departmental Totals</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Categories Button */}
          <button
            onClick={() => setShowCatManager(!showCatManager)}
            className="btn-compact bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            title="Manage service report metrics and custom categories"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Categories ({reportCategories.length})</span>
          </button>

          {isAuthorized && (
            <button
              onClick={handleOpenAdd}
              className="btn-compact btn-glow-blue"
              title="Submit new front desk report"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Report</span>
            </button>
          )}

          {activeViewTab === 'Combined' ? (
            <button
              onClick={() => setIsCombinedPrintOpen(true)}
              className="btn-compact bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              title="Print combined report summary"
            >
              <Printer className="w-4 h-4" />
              <span>Print Combined</span>
            </button>
          ) : (
            <button
              onClick={handleExportCSV}
              className="btn-compact bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Management Drawer / Bar (Collapsible) */}
      {showCatManager && (
        <div className="bg-slate-50 dark:bg-[#07132B] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Service Report Categories & Metrics
            </h4>
            <span className="text-[11px] text-slate-400">
              4 core categories are protected; custom categories can be added or removed.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {reportCategories.map((cat) => {
              const isCore = coreCategories.includes(cat);
              return (
                <span
                  key={cat}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    isCore
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-2xs'
                  }`}
                >
                  <span>{cat}</span>
                  {isCore ? (
                    <span className="text-[9px] uppercase px-1 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 font-bold">
                      Core
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer"
                      title={`Delete category ${cat}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>

          {/* Add custom category form */}
          <form onSubmit={handleAddCategory} className="flex items-center gap-2 max-w-md pt-1">
            <input
              type="text"
              placeholder="e.g. Testimonies Logged, Special Pastoral Inquiries..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="btn-compact bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
            >
              <Plus className="w-3 h-3" />
              <span>Add Category</span>
            </button>
          </form>
        </div>
      )}

      {/* TOP-LEVEL THREE REPORTING VIEWS TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0E172B] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveViewTab('Combined')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'Combined'
                ? 'bg-blue-600 text-white shadow-xs glow-blue'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Combined Total Report (A + B)</span>
          </button>
          <button
            onClick={() => setActiveViewTab('Desk A')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'Desk A'
                ? 'bg-blue-600 text-white shadow-xs glow-blue'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Desk A (Left Wing)</span>
          </button>
          <button
            onClick={() => setActiveViewTab('Desk B')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'Desk B'
                ? 'bg-blue-600 text-white shadow-xs glow-blue'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Desk B (Right Wing)</span>
          </button>
          <button
            onClick={() => setActiveViewTab('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === 'All'
                ? 'bg-blue-600 text-white shadow-xs glow-blue'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>All Logs</span>
          </button>
        </div>

        {/* Service Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Service:</span>
          <select
            value={serviceTypeFilter}
            onChange={(e) => setServiceTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
          >
            <option value="All">All Services</option>
            <option value="Sunday 1st Service">Sunday 1st Service</option>
            <option value="Sunday 2nd Service">Sunday 2nd Service</option>
            <option value="Tuesday Word & Communion">Tuesday Midweek</option>
            <option value="Special Programme">Special Programme</option>
          </select>
        </div>
      </div>

      {/* COMBINED TOTAL REPORT VIEW (Tab 1) */}
      {activeViewTab === 'Combined' && (
        <div className="space-y-6">
          {/* Top 4 Combined Metric Cards with Creative Borders & Amber Accents */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 card-gradient-border shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                Total Desk Traffic
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {deskATraffic + deskBTraffic}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  A: {deskATraffic} | B: {deskBTraffic}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 card-gradient-border shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                Inquiries Handled
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {deskAInquiries + deskBInquiries}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  A: {deskAInquiries} | B: {deskBInquiries}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 card-gradient-border shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                Cell Connections
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {deskACell + deskBCell}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  A: {deskACell} | B: {deskBCell}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 card-gradient-border shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                Lost Items Logged
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-amber-500 font-mono">
                  {deskALost + deskBLost}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  A: {deskALost} | B: {deskBLost}
                </span>
              </div>
            </div>
          </div>

          {/* COMBINED COMPARISON TABLE */}
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#0B1D42] to-[#122A5E] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  Combined Wing Breakdown: Desk A vs Desk B
                </h3>
                <p className="text-[11px] text-blue-200">
                  {serviceTypeFilter === 'All' ? 'All Submitted Reports' : serviceTypeFilter}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider glow-amber">
                Official Departmental Record
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">
                      Reporting Metric / Category
                    </th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-center bg-blue-50/50 dark:bg-blue-950/20">
                      Desk A (Left Wing)
                    </th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-center bg-teal-50/50 dark:bg-teal-950/20">
                      Desk B (Right Wing)
                    </th>
                    <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[11px] text-right bg-amber-50/60 dark:bg-amber-950/20 text-amber-950 dark:text-amber-300">
                      Combined Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      Desk Inquiries Handled
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {deskAInquiries}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {deskBInquiries}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400 bg-amber-50/30 dark:bg-amber-950/10">
                      {deskAInquiries + deskBInquiries}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      Cell Connections & First-Timer Referrals
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {deskACell}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {deskBCell}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-amber-50/30 dark:bg-amber-950/10">
                      {deskACell + deskBCell}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      Total Desk Traffic / Attendees Assisted
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {deskATraffic}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {deskBTraffic}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 dark:text-blue-300 bg-amber-50/30 dark:bg-amber-950/10">
                      {deskATraffic + deskBTraffic}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      Lost & Found Property Logged
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {deskALost}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {deskBLost}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/10">
                      {deskALost + deskBLost}
                    </td>
                  </tr>

                  {/* Dynamic Custom Categories Rows */}
                  {reportCategories
                    .filter((c) => !coreCategories.includes(c))
                    .map((customCat) => {
                      const aVal = sumCustomMetric(deskAReports, customCat);
                      const bVal = sumCustomMetric(deskBReports, customCat);
                      return (
                        <tr key={customCat}>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {customCat} (Custom Category)
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {aVal}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {bVal}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-purple-600 dark:text-purple-400 bg-amber-50/30 dark:bg-amber-950/10">
                            {aVal + bVal}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL REPORTS LIST (When Desk A, Desk B, or All is selected) */}
      {activeViewTab !== 'Combined' && (
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white dark:bg-[#0E172B] p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Service Reports Found for {activeViewTab}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                No reports submitted matching the selected filters.
              </p>
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
                      <span className="px-2.5 py-0.5 rounded font-black text-[10px] uppercase bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {report.reportingWing || 'Desk A — Left Wing'}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          report.status === 'Submitted'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
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
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
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

                {/* Metrics Highlight */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                  <div className="p-3 bg-slate-50 dark:bg-[#131F38] rounded-xl text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                      Desk Inquiries
                    </span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono">
                      {report.inquiriesHandled}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-[#131F38] rounded-xl text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                      Cell Connections
                    </span>
                    <span className="text-lg font-black text-emerald-600 font-mono">
                      {report.cellConnectionsCount}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-[#131F38] rounded-xl text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                      Total Desk Traffic
                    </span>
                    <span className="text-lg font-black text-blue-600 font-mono">
                      {report.deskAttendanceCount}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-[#131F38] rounded-xl text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                      Lost Items Logged
                    </span>
                    <span className="text-lg font-black text-amber-600 font-mono">
                      {report.lostItemsLogged}
                    </span>
                  </div>
                </div>

                {/* Operations text */}
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
      )}

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
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sunday 1st Service Front Desk Operations"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white font-medium"
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
                    <option value="Special Programme">Special Programme</option>
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

              {/* Core 4 Metrics */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Core Metrics (The 4 Official Information Desk Categories)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-slate-50 dark:bg-[#131F38] rounded-xl border border-slate-200 dark:border-slate-700">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Desk Inquiries
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.inquiriesHandled === 0 ? '' : formData.inquiriesHandled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          inquiriesHandled: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-[#131F38] rounded-xl border border-slate-200 dark:border-slate-700">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Cell Connections
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.cellConnectionsCount === 0 ? '' : formData.cellConnectionsCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cellConnectionsCount: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-[#131F38] rounded-xl border border-slate-200 dark:border-slate-700">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Desk Traffic
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.deskAttendanceCount === 0 ? '' : formData.deskAttendanceCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deskAttendanceCount: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-[#131F38] rounded-xl border border-slate-200 dark:border-slate-700">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Lost Items
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.lostItemsLogged === 0 ? '' : formData.lostItemsLogged}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lostItemsLogged: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Metric Fields (if any defined in reportCategories) */}
              {reportCategories.filter((c) => !coreCategories.includes(c)).length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom Metrics
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {reportCategories
                      .filter((c) => !coreCategories.includes(c))
                      .map((customCat) => (
                        <div
                          key={customCat}
                          className="p-2.5 bg-slate-50 dark:bg-[#131F38] rounded-xl border border-slate-200 dark:border-slate-700"
                        >
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {customCat}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={formData.customMetrics[customCat] || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customMetrics: {
                                  ...formData.customMetrics,
                                  [customCat]: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                                },
                              })
                            }
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

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
                  Observations / Pastoral Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Any notable visitor observations or congregation feedback..."
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {editingReport ? 'Update Report' : 'Submit Official Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW REPORT FULL MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {viewingReport.reportingWing}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {viewingReport.title || `Service Report: ${viewingReport.serviceDate}`}
                </h3>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-[#131F38] rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">SERVICE DATE</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatDate(viewingReport.serviceDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">SERVICE TYPE</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewingReport.serviceType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">SUBMITTED BY</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewingReport.submittedBy}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">STATUS</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {viewingReport.status}
                  </span>
                </div>
              </div>

              {/* Statistics Breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold block">Inquiries</span>
                  <span className="text-lg font-black text-blue-900 dark:text-blue-200 font-mono">
                    {viewingReport.inquiriesHandled}
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">Cell Conn.</span>
                  <span className="text-lg font-black text-emerald-900 dark:text-emerald-200 font-mono">
                    {viewingReport.cellConnectionsCount}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold block">Traffic</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {viewingReport.deskAttendanceCount}
                  </span>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block">Lost Items</span>
                  <span className="text-lg font-black text-amber-900 dark:text-amber-200 font-mono">
                    {viewingReport.lostItemsLogged}
                  </span>
                </div>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">Activities Carried Out:</strong>
                <p className="whitespace-pre-line text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#131F38] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {viewingReport.activitiesCarriedOut}
                </p>
              </div>

              {viewingReport.observations && (
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-1">Observations:</strong>
                  <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#131F38] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {viewingReport.observations}
                  </p>
                </div>
              )}

              {(viewingReport.challenges || viewingReport.issuesEncountered) && (
                <div>
                  <strong className="text-rose-700 dark:text-rose-400 block mb-1">Challenges Encountered:</strong>
                  <p className="text-slate-600 dark:text-slate-300 bg-rose-50/40 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-200/50 dark:border-rose-900/50">
                    {viewingReport.challenges || viewingReport.issuesEncountered}
                  </p>
                </div>
              )}

              {viewingReport.followUpActions && (
                <div>
                  <strong className="text-blue-700 dark:text-blue-400 block mb-1">Follow-up Actions:</strong>
                  <p className="text-slate-600 dark:text-slate-300 bg-blue-50/40 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-200/50 dark:border-blue-900/50">
                    {viewingReport.followUpActions}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedReportForPrint(viewingReport);
                  setViewingReport(null);
                }}
                className="btn-compact btn-glow-blue"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
              <button
                onClick={() => setViewingReport(null)}
                className="btn-compact text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL PRINT PREVIEW MODAL */}
      {selectedReportForPrint && (
        <PrintModal
          isOpen={true}
          onClose={() => setSelectedReportForPrint(null)}
          title={`SERVICE REPORT: ${selectedReportForPrint.title || selectedReportForPrint.serviceDate}`}
          subtitle={`${selectedReportForPrint.reportingWing} • ${selectedReportForPrint.serviceType}`}
          documentRef={`REP-${selectedReportForPrint.id}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 text-xs">
              <div>
                <strong>Date & Service:</strong> {formatDate(selectedReportForPrint.serviceDate)} ({selectedReportForPrint.serviceType})
              </div>
              <div>
                <strong>Reporting Desk:</strong> {selectedReportForPrint.reportingWing}
              </div>
              <div>
                <strong>Submitted By:</strong> {selectedReportForPrint.submittedBy}
              </div>
              <div>
                <strong>Status:</strong> {selectedReportForPrint.status}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 border rounded">
                <span className="block font-bold">Inquiries</span>
                <span className="text-base font-bold font-mono">{selectedReportForPrint.inquiriesHandled}</span>
              </div>
              <div className="p-2 border rounded">
                <span className="block font-bold">Cell Connections</span>
                <span className="text-base font-bold font-mono">{selectedReportForPrint.cellConnectionsCount}</span>
              </div>
              <div className="p-2 border rounded">
                <span className="block font-bold">Desk Traffic</span>
                <span className="text-base font-bold font-mono">{selectedReportForPrint.deskAttendanceCount}</span>
              </div>
              <div className="p-2 border rounded">
                <span className="block font-bold">Lost Items</span>
                <span className="text-base font-bold font-mono">{selectedReportForPrint.lostItemsLogged}</span>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <div>
                <strong>Activities Carried Out:</strong>
                <p className="mt-1 whitespace-pre-line text-slate-700">{selectedReportForPrint.activitiesCarriedOut}</p>
              </div>
              {selectedReportForPrint.observations && (
                <div>
                  <strong>Observations:</strong>
                  <p className="mt-1 text-slate-700">{selectedReportForPrint.observations}</p>
                </div>
              )}
              {(selectedReportForPrint.challenges || selectedReportForPrint.issuesEncountered) && (
                <div>
                  <strong>Challenges:</strong>
                  <p className="mt-1 text-slate-700">{selectedReportForPrint.challenges || selectedReportForPrint.issuesEncountered}</p>
                </div>
              )}
              {selectedReportForPrint.followUpActions && (
                <div>
                  <strong>Follow-up Actions:</strong>
                  <p className="mt-1 text-slate-700">{selectedReportForPrint.followUpActions}</p>
                </div>
              )}
            </div>
          </div>
        </PrintModal>
      )}

      {/* COMBINED REPORT PRINT MODAL */}
      {isCombinedPrintOpen && (
        <PrintModal
          isOpen={true}
          onClose={() => setIsCombinedPrintOpen(false)}
          title="COMBINED FRONT DESK SERVICE REPORT (DESK A + DESK B)"
          subtitle={`Dominion City Asaba • ${serviceTypeFilter === 'All' ? 'Consolidated Departmental Report' : serviceTypeFilter}`}
          documentRef="COMBINED-REP-OFFICIAL"
        >
          <div className="space-y-4">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="p-2 font-bold">Category</th>
                  <th className="p-2 font-bold text-center">Desk A (Left Wing)</th>
                  <th className="p-2 font-bold text-center">Desk B (Right Wing)</th>
                  <th className="p-2 font-bold text-right">Combined Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-semibold">Desk Inquiries Handled</td>
                  <td className="p-2 text-center font-mono">{deskAInquiries}</td>
                  <td className="p-2 text-center font-mono">{deskBInquiries}</td>
                  <td className="p-2 text-right font-bold font-mono">{deskAInquiries + deskBInquiries}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Cell Connections & Referrals</td>
                  <td className="p-2 text-center font-mono">{deskACell}</td>
                  <td className="p-2 text-center font-mono">{deskBCell}</td>
                  <td className="p-2 text-right font-bold font-mono">{deskACell + deskBCell}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Total Desk Traffic</td>
                  <td className="p-2 text-center font-mono">{deskATraffic}</td>
                  <td className="p-2 text-center font-mono">{deskBTraffic}</td>
                  <td className="p-2 text-right font-bold font-mono">{deskATraffic + deskBTraffic}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Lost Items Logged</td>
                  <td className="p-2 text-center font-mono">{deskALost}</td>
                  <td className="p-2 text-center font-mono">{deskBLost}</td>
                  <td className="p-2 text-right font-bold font-mono">{deskALost + deskBLost}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
