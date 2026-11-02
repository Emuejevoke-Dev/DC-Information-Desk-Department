import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateUtils';
import {
  Shield,
  ArrowLeft,
  Users,
  FileText,
  ClipboardList,
  CalendarCheck,
  Megaphone,
  MapPin,
  PackageSearch,
  BookOpen,
  CheckCircle2,
  Clock,
  PlusCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Printer,
} from 'lucide-react';

interface SecretaryDashboardProps {
  onReturnToGeneral: () => void;
  onNavigate: (tab: string) => void;
}

export const SecretaryDashboard: React.FC<SecretaryDashboardProps> = ({
  onReturnToGeneral,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const {
    members,
    reports,
    tableDocuments,
    rosters,
    dressCodes,
    meetings,
    lostItems,
    announcements,
  } = useData();

  const recentReports = reports.slice(0, 3);
  const pendingLostItems = lostItems.filter((i) => i.status === 'Unclaimed');
  const upcomingMeetings = meetings.filter((m) => m.status === 'Scheduled');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Officer Header with Standardized Height Buttons and Dominion City Blue Theme */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#071738] via-[#0B2559] to-[#123A85] text-white shadow-lg border border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <button
            onClick={onReturnToGeneral}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white text-xs font-bold mb-3 transition-colors cursor-pointer border border-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to General Department Dashboard</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Secretary & Administrative Office Workspace
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400 text-slate-950 glow-amber">
              Official Administration
            </span>
          </div>
          <p className="text-xs text-blue-100 mt-1 max-w-xl leading-relaxed">
            Centralized administrative portal: documentation registers, service reports, member census, duty rosters, and meeting schedules.
          </p>
        </div>

        {/* Standardized Action Buttons Group */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('reports')}
            className="btn-compact bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md glow-amber h-10 px-4"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>New Service Report</span>
          </button>
          <button
            onClick={() => onNavigate('collections')}
            className="btn-compact bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/25 glow-blue-hover h-10 px-4"
          >
            <ClipboardList className="w-4 h-4 text-amber-300" />
            <span>Table Register Tool</span>
          </button>
        </div>
      </div>

      {/* Grouped Administrative Direct Portals (Organized into Clear Logical Clusters) */}
      <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Grouped Administrative Portals</span>
          </h3>
          <span className="text-[11px] text-slate-400">Quick direct access by function</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cluster 1: Documentation & Service Reports */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
              1. Documentation & Reports
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onNavigate('reports')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-bold text-slate-800 dark:text-white transition-all shadow-2xs cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  Service Reports (Desk A & B)
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">{reports.length}</span>
              </button>
              <button
                onClick={() => onNavigate('collections')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-bold text-slate-800 dark:text-white transition-all shadow-2xs cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  Table Register Tool
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">{tableDocuments.length}</span>
              </button>
              <button
                onClick={() => onNavigate('roster')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-bold text-slate-800 dark:text-white transition-all shadow-2xs cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  Duty Rosters & Shifts
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">{rosters.length}</span>
              </button>
            </div>
          </div>

          {/* Cluster 2: Members & Personnel */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
              2. Personnel & Members
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onNavigate('members')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold text-slate-800 dark:text-white transition-all shadow-2xs cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  Member Directory
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">{members.length}</span>
              </button>
              <button
                onClick={() => onNavigate('attendance')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold text-slate-800 dark:text-white transition-all shadow-2xs cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                  Attendance Register
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Live</span>
              </button>
              <button
                onClick={() => onNavigate('dress-code')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold text-slate-800 dark:text-white transition-all shadow-2xs cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                  Sunday Dress Codes
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">{dressCodes.length}</span>
              </button>
            </div>
          </div>

          {/* Cluster 3: Church Operations & Public Front Desk */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
              3. Front Desk & Church Portals
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onNavigate('cells')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-xs font-bold text-slate-800 dark:text-white transition-all shadow-2xs cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  Cell & Satellite Directory
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Asaba</span>
              </button>
              <button
                onClick={() => onNavigate('lost-found')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-xs font-bold text-slate-800 dark:text-white transition-all shadow-2xs cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <PackageSearch className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  Lost & Found Custody
                </span>
                <span className="text-[10px] text-amber-600 font-mono font-bold">{pendingLostItems.length}</span>
              </button>
              <button
                onClick={() => onNavigate('meetings')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-xs font-bold text-slate-800 dark:text-white transition-all shadow-2xs cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                  Department Meetings
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">{upcomingMeetings.length}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Administrative Operations KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Members Directory */}
        <div
          onClick={() => onNavigate('members')}
          className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-blue-500 cursor-pointer transition-all card-gradient-border"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Enrolled Members
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {members.length} Members
          </p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
            Active department personnel
          </p>
        </div>

        {/* Service Reports Logged */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-blue-500 cursor-pointer transition-all card-gradient-border"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Service Reports Filed
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-2 font-mono">
            {reports.length} Reports
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Desk A & Desk B service logs
          </p>
        </div>

        {/* Table Register Documents */}
        <div
          onClick={() => onNavigate('collections')}
          className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-purple-500 cursor-pointer transition-all card-gradient-border"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Table Registers
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400 mt-2 font-mono">
            {tableDocuments.length} Saved
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Official registers & forms
          </p>
        </div>

        {/* Unclaimed Lost Items */}
        <div
          onClick={() => onNavigate('lost-found')}
          className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-amber-500 cursor-pointer transition-all card-gradient-border"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Lost & Found Custody
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <PackageSearch className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono">
            {pendingLostItems.length} In Custody
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Safeguarded at information desk
          </p>
        </div>
      </div>

      {/* Dual Highlights: Recent Reports & Saved Registers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Service Reports Submitted */}
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Service Reports</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Left & Right Wing Front Desk operational submissions</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              All Reports →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {recentReports.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#07132B] hover:bg-white dark:hover:bg-slate-800/40 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{rep.serviceType}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    {rep.reportingWing}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Date: {formatDate(rep.serviceDate)}</span>
                  <span>Desk Attendance: <strong className="text-slate-800 dark:text-white font-mono">{rep.deskAttendanceCount}</strong></span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 italic">
                  Submitted by {rep.submittedBy}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Table Register Documents */}
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Table Registers</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official registers and printable documentation sheets</p>
            </div>
            <button
              onClick={() => onNavigate('collections')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Open Tool →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {tableDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#07132B] hover:bg-white dark:hover:bg-slate-800/40 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                    {doc.columns.length} Cols
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {doc.optionalInfo || 'Dominion City Asaba Front Desk Record'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Date: {doc.date}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {doc.rows.length} Rows Recorded
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
