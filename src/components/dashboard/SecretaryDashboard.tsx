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
    collections,
    collectionEntries,
    rosters,
    dressCodes,
    meetings,
    lostItems,
    announcements,
  } = useData();

  const openForms = collections.filter((c) => c.status === 'Open');
  const recentReports = reports.slice(0, 3);
  const pendingLostItems = lostItems.filter((i) => i.status === 'Unclaimed');
  const upcomingMeetings = meetings.filter((m) => m.status === 'Scheduled');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Officer Header with Clear Return Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#032326] via-[#084C52] to-[#0E6C75] text-white shadow-lg border border-teal-900/40">
        <div>
          <button
            onClick={onReturnToGeneral}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-teal-200 text-xs font-bold mb-2.5 transition-colors cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to General Department Dashboard
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Secretary & Administrative Office Workspace
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-400/30 text-teal-200 border border-teal-300/30">
              Department Administration
            </span>
          </div>
          <p className="text-xs text-teal-100 mt-1 max-w-xl">
            Central coordination of service reports, member census, cell directories, information forms, and departmental rosters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-teal-950" />
            New Service Report
          </button>
          <button
            onClick={() => onNavigate('collections')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5 text-teal-200" />
            Create Collection Form
          </button>
        </div>
      </div>

      {/* Administrative Operations KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Members Directory */}
        <div
          onClick={() => onNavigate('members')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Enrolled Members
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {members.length} Members
          </p>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">
            Active department personnel
          </p>
        </div>

        {/* Service Reports Logged */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Service Reports Filed
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-2">
            {reports.length} Reports
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Desk A & Desk B service logs
          </p>
        </div>

        {/* Open Collection Forms */}
        <div
          onClick={() => onNavigate('collections')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Information Forms
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-700 mt-2">
            {openForms.length} Open
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {collectionEntries.length} total respondent submissions
          </p>
        </div>

        {/* Unclaimed Lost Items */}
        <div
          onClick={() => onNavigate('lost-found')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lost & Found Custody
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <PackageSearch className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
            {pendingLostItems.length} In Custody
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Items safeguarded at information desk
          </p>
        </div>
      </div>

      {/* Dual Administrative Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Service Reports Submitted */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Service Reports</h3>
              <p className="text-xs text-slate-500">Left & Right Wing Front Desk operational submissions</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              All Reports →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {recentReports.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{rep.serviceType}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-teal-100 text-teal-800">
                    {rep.reportingWing}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Date: {formatDate(rep.serviceDate)}</span>
                  <span>Desk Attendance: <strong>{rep.deskAttendanceCount}</strong></span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                  Submitted by {rep.submittedBy}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Information Collection Forms */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Custom Information Collection</h3>
              <p className="text-xs text-slate-500">Forms requested by pastors & department heads</p>
            </div>
            <button
              onClick={() => onNavigate('collections')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              Form Builder →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {collections.map((col) => (
              <div
                key={col.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{col.title}</h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                      col.status === 'Open'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {col.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  Requested by: {col.requestedBy}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{col.fields.length} dynamic fields</span>
                  <span className="font-bold text-teal-700">
                    {col.entriesCount} Submissions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Administrative Quick Actions Grid */}
      <div className="bg-slate-100/70 rounded-2xl p-5 border border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
          Administrative Direct Portals
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { id: 'members', label: 'Member Directory', icon: Users, color: 'text-blue-600' },
            { id: 'cells', label: 'Cell Directory', icon: MapPin, color: 'text-emerald-600' },
            { id: 'dress-code', label: 'Dress Codes', icon: CalendarCheck, color: 'text-purple-600' },
            { id: 'roster', label: 'Service Rosters', icon: Clock, color: 'text-amber-600' },
            { id: 'announcements', label: 'Urgent Notices', icon: Megaphone, color: 'text-rose-600' },
            { id: 'handbook', label: 'SOP Handbook', icon: BookOpen, color: 'text-teal-600' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="p-3 bg-white hover:bg-blue-50/50 rounded-xl border border-slate-200 text-center transition-all cursor-pointer shadow-2xs group flex flex-col items-center justify-center gap-1.5"
              >
                <Icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                <span className="text-[11px] font-bold text-slate-800">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
