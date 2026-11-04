import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateUtils';
import {
  FileCheck,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Send,
  Eye,
  Edit3,
  Filter,
  BarChart3,
  Building,
  User,
  Shield,
  AlertCircle,
  Sparkles,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import {
  DepartmentMonthlyReport,
  DepartmentUnitType,
  MonthlyReportStatus,
} from '../../types/models';

interface DepartmentMonthlyReportsHubProps {
  onReturnToGeneral: () => void;
  onNavigate: (tab: string) => void;
}

const ALL_DEPARTMENT_UNITS: DepartmentUnitType[] = [
  'Secretary',
  'Welfare',
  'Bookstand',
  'Uniform',
  'Finance',
  'Attendance & Service Reporting',
];

export const DepartmentMonthlyReportsHub: React.FC<DepartmentMonthlyReportsHubProps> = ({
  onReturnToGeneral,
  onNavigate,
}) => {
  const { currentUser, isHOD, isOperations } = useAuth();
  const { monthlyReports, saveMonthlyReport, reviewMonthlyReport } = useData();

  // Selected Month
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [activeUnitTab, setActiveUnitTab] = useState<DepartmentUnitType>('Secretary');

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [targetReportForReview, setTargetReportForReview] = useState<DepartmentMonthlyReport | null>(null);
  const [hodReviewStatus, setHodReviewStatus] = useState<MonthlyReportStatus>('Reviewed');
  const [hodReviewRemarks, setHodReviewRemarks] = useState('');

  // Active Report for selected unit & month
  const activeReport = useMemo(() => {
    return monthlyReports.find(
      (r) => r.departmentUnit === activeUnitTab && r.reportingMonth === selectedMonth
    );
  }, [monthlyReports, activeUnitTab, selectedMonth]);

  // Submission Status Summary for all 6 units in the selected month
  const unitStatusMap = useMemo(() => {
    const map: Record<DepartmentUnitType, DepartmentMonthlyReport | null> = {
      Secretary: null,
      Welfare: null,
      Bookstand: null,
      Uniform: null,
      Finance: null,
      'Attendance & Service Reporting': null,
      'Front Desk General': null,
    };

    ALL_DEPARTMENT_UNITS.forEach((unit) => {
      const rep = monthlyReports.find(
        (r) => r.departmentUnit === unit && r.reportingMonth === selectedMonth
      );
      map[unit] = rep || null;
    });

    return map;
  }, [monthlyReports, selectedMonth]);

  // Overall Submission Progress for selected month
  const submittedCount = useMemo(() => {
    return ALL_DEPARTMENT_UNITS.filter((u) => {
      const rep = unitStatusMap[u];
      return rep && (rep.status === 'Submitted' || rep.status === 'Reviewed');
    }).length;
  }, [unitStatusMap]);

  // Open Review Dialog
  const handleOpenReview = (rep: DepartmentMonthlyReport) => {
    setTargetReportForReview(rep);
    setHodReviewStatus(rep.status === 'Submitted' ? 'Reviewed' : rep.status);
    setHodReviewRemarks(rep.hodReviewNotes || '');
    setIsReviewModalOpen(true);
  };

  // Submit Review Feedback
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReportForReview) return;

    reviewMonthlyReport(
      targetReportForReview.id,
      hodReviewStatus,
      hodReviewRemarks.trim() || `Reviewed and approved by ${currentUser?.name || 'HOD'}`,
      currentUser?.name || 'Brother Chukwudi Okonkwo (HOD)'
    );

    setIsReviewModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ==================================================================== */}
      {/* HEADER BANNER */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0C1E40] via-[#102A5C] to-[#1E3A8A] text-white shadow-xl border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <button
            onClick={onReturnToGeneral}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white text-xs font-bold mb-3 transition-colors cursor-pointer border border-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Return to General Dashboard</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-amber-300" />
              <span>Central Monthly Departmental Reports Assembly</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400 text-slate-950 glow-amber">
              All Units Hub
            </span>
          </div>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
            Consolidated departmental performance review: Secretary, Welfare, Bookstand, Uniform, Finance, and Attendance units. Formatted for leadership monthly assemblies and audits.
          </p>
        </div>

        {/* Month Selector & Print */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#07132B] text-slate-900 dark:text-white font-bold text-xs border border-white/25 cursor-pointer shadow-sm"
          >
            <option value="2026-11">November 2026</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
          </select>
          <button
            onClick={() => window.print()}
            className="btn-compact bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold h-10 px-4 text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print All Reports</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* UNIT STATUS TILES (ALL 6 UNITS) */}
      {/* ==================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Submission Status for {selectedMonth} across 6 operational units:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {submittedCount} of {ALL_DEPARTMENT_UNITS.length} Units Ready
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ALL_DEPARTMENT_UNITS.map((unit) => {
            const rep = unitStatusMap[unit];
            const isSelected = activeUnitTab === unit;
            return (
              <div
                key={unit}
                onClick={() => setActiveUnitTab(unit)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-[#0E172B] border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div>
                  <h4 className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {unit}
                  </h4>
                  <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {rep?.submittedBy || 'Pending Submission'}
                  </p>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      isSelected
                        ? 'bg-white text-blue-600'
                        : rep?.status === 'Reviewed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : rep?.status === 'Submitted'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : rep?.status === 'Draft'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {rep?.status || 'Not Started'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ACTIVE UNIT REPORT DOCUMENT DISPLAY */}
      {/* ==================================================================== */}
      {activeReport ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          {/* Document Header */}
          <div className="pb-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                  {activeReport.departmentUnit} Unit
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    activeReport.status === 'Reviewed'
                      ? 'bg-emerald-500 text-white'
                      : activeReport.status === 'Submitted'
                      ? 'bg-blue-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {activeReport.status}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                Monthly Operating & Activity Report — {activeReport.reportingMonth}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted by <strong>{activeReport.submittedBy}</strong> ({activeReport.submittedByRole}) on {formatDate(activeReport.submissionDate)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {(isHOD || isOperations) && (
                <button
                  onClick={() => handleOpenReview(activeReport)}
                  className="btn-compact bg-blue-600 hover:bg-blue-500 text-white font-bold h-9 px-3.5 text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Review & Feedback</span>
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="btn-compact bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold h-9 px-3 text-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* HOD Review Feedback Banner (If Reviewed) */}
          {activeReport.hodReviewNotes && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1 text-emerald-950 dark:text-emerald-200">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Leadership Evaluation & Executive Feedback:</span>
              </div>
              <p className="leading-relaxed">"{activeReport.hodReviewNotes}"</p>
              {activeReport.reviewedBy && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block pt-1">
                  Evaluated by {activeReport.reviewedBy} on {formatDate(activeReport.reviewedAt || '')}
                </span>
              )}
            </div>
          )}

          {/* Key Unit Statistics */}
          {activeReport.importantStatistics && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Key Unit Operational Metrics:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(activeReport.importantStatistics).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">{key}</span>
                    <strong className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                      {typeof val === 'number' && val > 1000 ? val.toLocaleString() : val}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9 Standard Report Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50/70 dark:bg-[#07132B]/70 border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                1. Activities Carried Out
              </strong>
              <p>{activeReport.activitiesCarriedOut}</p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50/70 dark:bg-[#07132B]/70 border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                2. Work Completed & Milestones
              </strong>
              <p>{activeReport.workCompleted}</p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50/70 dark:bg-[#07132B]/70 border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                3. Challenges Encountered
              </strong>
              <p>{activeReport.challengesEncountered}</p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50/70 dark:bg-[#07132B]/70 border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                4. Complaints & Issues
              </strong>
              <p>{activeReport.complaintsOrIssues}</p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50/70 dark:bg-[#07132B]/70 border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                5. Strategic Recommendations
              </strong>
              <p>{activeReport.recommendations}</p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50/70 dark:bg-[#07132B]/70 border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                6. Outstanding Responsibilities
              </strong>
              <p>{activeReport.outstandingResponsibilities}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300">
            <strong className="text-blue-900 dark:text-blue-300 text-xs block font-bold mb-1">
              7. Activities Planned for Following Month
            </strong>
            <p>{activeReport.activitiesPlannedNextMonth}</p>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            No report submitted yet by {activeUnitTab} for {selectedMonth}.
          </p>
          <p>
            The assigned unit officer can draft and submit their monthly report from their respective officer desk.
          </p>
          <button
            onClick={() => {
              if (activeUnitTab === 'Secretary') onNavigate('secretary-workspace');
              else if (activeUnitTab === 'Welfare') onNavigate('welfare-workspace');
              else if (activeUnitTab === 'Bookstand') onNavigate('bookstand-workspace');
              else if (activeUnitTab === 'Uniform') onNavigate('uniform-workspace');
              else if (activeUnitTab === 'Finance') onNavigate('finance-workspace');
              else onNavigate('reports');
            }}
            className="btn-compact bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 px-4 cursor-pointer"
          >
            Go to {activeUnitTab} Workspace →
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: HOD REVIEW & FEEDBACK */}
      {/* ==================================================================== */}
      {isReviewModalOpen && targetReportForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Review {targetReportForReview.departmentUnit} Report
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Review Decision</label>
                <select
                  value={hodReviewStatus}
                  onChange={(e) => setHodReviewStatus(e.target.value as MonthlyReportStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Reviewed">Reviewed & Approved</option>
                  <option value="Returned for Correction">Returned for Correction</option>
                  <option value="Draft">Revert to Draft</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Executive Review Remarks / Directives *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record praise, required corrections, or approvals..."
                  value={hodReviewRemarks}
                  onChange={(e) => setHodReviewRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow-blue px-4 py-2 rounded-xl font-bold text-white cursor-pointer"
                >
                  Save Review Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

