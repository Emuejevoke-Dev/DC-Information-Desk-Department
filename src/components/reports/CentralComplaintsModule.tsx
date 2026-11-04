import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateUtils';
import {
  AlertTriangle,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  User,
  Building,
  Shield,
  PlusCircle,
  X,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Printer,
} from 'lucide-react';
import {
  DepartmentComplaint,
  CentralComplaintStatus,
  DepartmentUnitType,
} from '../../types/models';

interface CentralComplaintsModuleProps {
  onReturnToGeneral: () => void;
}

export const CentralComplaintsModule: React.FC<CentralComplaintsModuleProps> = ({
  onReturnToGeneral,
}) => {
  const { currentUser, isHOD, isOperations, canSuperviseAll } = useAuth();
  const {
    departmentComplaints,
    submitDepartmentComplaint,
    updateComplaintStatus,
    addHODComplaintComment,
  } = useData();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');

  // Selected complaint for detailed view / resolution
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null);

  // Resolution Comment state
  const [hodCommentInput, setHodCommentInput] = useState('');
  const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
  const [targetNewStatus, setTargetNewStatus] = useState<CentralComplaintStatus>('Under Review');

  // New Complaint Modal state
  const [isNewComplaintModalOpen, setIsNewComplaintModalOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState<DepartmentUnitType>('Welfare');
  const [newCategory, setNewCategory] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newUrgency, setNewUrgency] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return departmentComplaints.filter((c) => {
      const matchSearch =
        c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept = selectedDepartment === 'all' || c.department === selectedDepartment;
      const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;
      const matchUrgency = selectedUrgency === 'all' || c.urgency === selectedUrgency;

      return matchSearch && matchDept && matchStatus && matchUrgency;
    });
  }, [departmentComplaints, searchQuery, selectedDepartment, selectedStatus, selectedUrgency]);

  const activeComplaint = useMemo(() => {
    return (
      departmentComplaints.find((c) => c.id === activeComplaintId) ||
      filteredComplaints[0] ||
      null
    );
  }, [departmentComplaints, activeComplaintId, filteredComplaints]);

  // KPIs
  const newCount = useMemo(() => departmentComplaints.filter((c) => c.status === 'New').length, [departmentComplaints]);
  const underReviewCount = useMemo(() => departmentComplaints.filter((c) => c.status === 'Under Review' || c.status === 'Assigned' || c.status === 'Awaiting Action').length, [departmentComplaints]);
  const resolvedCount = useMemo(() => departmentComplaints.filter((c) => c.status === 'Resolved').length, [departmentComplaints]);
  const criticalCount = useMemo(() => departmentComplaints.filter((c) => (c.urgency === 'High' || c.urgency === 'Critical') && c.status !== 'Resolved').length, [departmentComplaints]);

  // Handlers
  const handleAddHODComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint || !hodCommentInput.trim()) return;

    addHODComplaintComment(
      activeComplaint.id,
      hodCommentInput.trim(),
      currentUser?.name || 'Brother Chukwudi Okonkwo (HOD)'
    );
    setHodCommentInput('');
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;

    updateComplaintStatus(
      activeComplaint.id,
      targetNewStatus,
      statusUpdateNotes.trim() || `Status updated to ${targetNewStatus} by ${currentUser?.name || 'HOD'}`,
      currentUser?.name || 'Brother Chukwudi Okonkwo (HOD)'
    );
    setStatusUpdateNotes('');
  };

  const handleCreateNewComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    submitDepartmentComplaint({
      submittedBy: currentUser?.name || 'Department Officer',
      submittedByPhone: currentUser?.phone || '',
      submittedByRole: currentUser?.departmentRole || 'Officer',
      department: newDepartment,
      submissionDate: new Date().toISOString().split('T')[0],
      category: newCategory.trim() || 'General Operational Issue',
      subject: newSubject.trim(),
      description: newDescription.trim(),
      urgency: newUrgency,
      status: 'New',
    });

    setIsNewComplaintModalOpen(false);
    setNewSubject('');
    setNewDescription('');
    setNewCategory('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ==================================================================== */}
      {/* HEADER BANNER */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#2E1065] to-[#4C0519] text-white shadow-xl border border-rose-900/40 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <button
            onClick={onReturnToGeneral}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-rose-200 hover:text-white text-xs font-bold mb-3 transition-colors cursor-pointer border border-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Return to General Dashboard</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span>Central Complaints & Leadership Escalations Desk</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400 text-slate-950 glow-amber">
              HOD Oversight
            </span>
          </div>
          <p className="text-xs text-rose-100 mt-1 max-w-2xl leading-relaxed">
            Centralized leadership triage: review complaints, discrepancies, and emergency escalations from Bookstand, Welfare, Secretary, Uniform, and Finance with full audit history.
          </p>
        </div>

        <button
          onClick={() => setIsNewComplaintModalOpen(true)}
          className="btn-compact bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md h-10 px-4 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Log Department Issue</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* KPI METRICS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Total Registered</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-mono">{departmentComplaints.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all units</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">New & Awaiting Triage</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5 font-mono">{newCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Requires leadership review</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400">Critical / High Urgency</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5 font-mono">{criticalCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Urgent intervention</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Resolved Issues</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono">{resolvedCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Action completed</p>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SEARCH & FILTERS BAR */}
      {/* ==================================================================== */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by subject, description, submitter, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">All Departments</option>
              <option value="Welfare">Welfare</option>
              <option value="Bookstand">Bookstand</option>
              <option value="Secretary">Secretary</option>
              <option value="Uniform">Uniform</option>
              <option value="Finance">Finance</option>
              <option value="Front Desk General">Front Desk General</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="Awaiting Action">Awaiting Action</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TWO COLUMN MASTER-DETAIL LAYOUT */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Complaint List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{filteredComplaints.length} Issues Found</span>
            <span className="font-bold text-amber-500">{newCount} New Unreviewed</span>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredComplaints.map((c) => {
              const isSelected = activeComplaint?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveComplaintId(c.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                      : 'bg-white dark:bg-[#0E172B] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {c.department}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          c.urgency === 'Critical' || c.urgency === 'High'
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {c.urgency}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-500 text-white'
                          : c.status === 'New'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2 line-clamp-1">
                    {c.subject}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>By: <strong className="text-slate-600 dark:text-slate-300">{c.submittedBy}</strong></span>
                    <span>{formatDate(c.submissionDate)}</span>
                  </div>
                </div>
              );
            })}

            {filteredComplaints.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800">
                No complaints found matching criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Complaint View & Action Center (7 Cols) */}
        <div className="lg:col-span-7">
          {activeComplaint ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              {/* Complaint Header */}
              <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                      {activeComplaint.department} Desk
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        activeComplaint.urgency === 'Critical' || activeComplaint.urgency === 'High'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {activeComplaint.urgency} Urgency
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${
                      activeComplaint.status === 'Resolved'
                        ? 'bg-emerald-500 text-white'
                        : activeComplaint.status === 'New'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    Status: {activeComplaint.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeComplaint.subject}</h3>
                <p className="text-xs text-slate-500">
                  Submitted by <strong>{activeComplaint.submittedBy}</strong> ({activeComplaint.submittedByRole || 'Department Officer'}) on {formatDate(activeComplaint.submissionDate)}
                </p>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Complaint Details:</span>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {activeComplaint.description}
                </div>
              </div>

              {/* HOD Feedback Box */}
              {activeComplaint.hodComments && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1 text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                    <Shield className="w-4 h-4" />
                    <span>HOD Direct Directive / Review Comment:</span>
                  </div>
                  <p className="leading-relaxed">{activeComplaint.hodComments}</p>
                </div>
              )}

              {/* Resolution Audit History Timeline */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Permanent Resolution Audit Trail:
                </span>
                <div className="space-y-2 border-l-2 border-slate-200 dark:border-slate-800 pl-3">
                  {activeComplaint.resolutionHistory.map((step) => (
                    <div key={step.id} className="space-y-0.5 relative">
                      <div className="w-2 h-2 rounded-full bg-blue-500 absolute -left-[17px] top-1.5" />
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-white">{step.actionBy}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(step.actionDate)}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {step.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{step.notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leadership Action Form: HOD Comment & Status Update */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 space-y-3.5 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Leadership Directive & Status Update</span>
                </h4>

                <form onSubmit={handleAddHODComment} className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Add HOD Instruction or Directive to Submitter:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Approved. Credit memo processed with publisher..."
                      value={hodCommentInput}
                      onChange={(e) => setHodCommentInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="btn-glow-blue px-3.5 py-2 rounded-xl font-bold text-white text-xs cursor-pointer shrink-0"
                    >
                      Post Directive
                    </button>
                  </div>
                </form>

                <form onSubmit={handleUpdateStatus} className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Update Status:
                      </label>
                      <select
                        value={targetNewStatus}
                        onChange={(e) => setTargetNewStatus(e.target.value as CentralComplaintStatus)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="New">New</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Assigned">Assigned to Officer</option>
                        <option value="Awaiting Action">Awaiting Action</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Audit Notes:
                      </label>
                      <input
                        type="text"
                        placeholder="Reason for status change..."
                        value={statusUpdateNotes}
                        onChange={(e) => setStatusUpdateNotes(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    Record Status Change & Update Audit Log
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800">
              Select an issue from the list to view its complete audit history and record leadership directives.
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: LOG NEW COMPLAINT */}
      {/* ==================================================================== */}
      {isNewComplaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Log Departmental Complaint or Issue</h3>
              <button
                onClick={() => setIsNewComplaintModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewComplaint} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Originating Department *</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Welfare">Welfare</option>
                    <option value="Bookstand">Bookstand</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Finance">Finance</option>
                    <option value="Front Desk General">Front Desk General</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Level of Urgency *</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken badges replacement needed for Sunday"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Category</label>
                <input
                  type="text"
                  placeholder="e.g. Inventory Damage, Member Escalation, Equipment Malfunction"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide precise details of the incident or operational issue..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewComplaintModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow-blue px-4 py-2 rounded-xl font-bold text-white cursor-pointer"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

