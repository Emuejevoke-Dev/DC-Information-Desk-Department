import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  DepartmentUnitType,
  HRDMessageCategory,
  HRDDepartmentalMessage,
} from '../../types/models';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { formatDate } from '../../utils/dateUtils';
import {
  ShieldAlert,
  X,
  Send,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
  History,
  FileText,
  User,
  Building2,
  CornerDownRight,
  Sparkles,
  Paperclip,
  Check,
} from 'lucide-react';

interface ReportToHRDModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDepartment?: DepartmentUnitType;
  defaultCategory?: HRDMessageCategory;
  defaultSubject?: string;
}

const MESSAGE_CATEGORIES: HRDMessageCategory[] = [
  'General Message',
  'Departmental Complaint',
  'Operational Issue',
  'Request for Assistance',
  'Suggestion or Recommendation',
  'Welfare Concern',
  'Bookstand Issue',
  'Uniform Issue',
  'Financial/Administrative Concern',
  'Urgent Matter',
  'Other',
];

const DEPARTMENT_UNITS: DepartmentUnitType[] = [
  'Secretary',
  'Welfare',
  'Bookstand',
  'Uniform',
  'Finance',
  'Attendance & Service Reporting',
  'Front Desk General',
];

export const ReportToHRDModal: React.FC<ReportToHRDModalProps> = ({
  isOpen,
  onClose,
  defaultDepartment = 'Front Desk General',
  defaultCategory = 'General Message',
  defaultSubject = '',
}) => {
  const { currentUser } = useAuth();
  const { hrdMessages, submitHRDMessage, addHRDMessageResponse } = useData();

  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

  // Form State
  const [senderName, setSenderName] = useState(currentUser?.name || '');
  const [senderDepartment, setSenderDepartment] = useState<DepartmentUnitType>(defaultDepartment);
  const [senderRole, setSenderRole] = useState(currentUser?.departmentRole || 'Department Member');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');
  const [subject, setSubject] = useState(defaultSubject);
  const [category, setCategory] = useState<HRDMessageCategory>(defaultCategory);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // Submission feedback
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Thread Reply State in History View
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // User's own messages history
  const userMessages = useMemo(() => {
    if (!currentUser) return [];
    return hrdMessages.filter(
      (m) =>
        m.senderId === currentUser.id ||
        m.senderName.toLowerCase() === currentUser.name.toLowerCase() ||
        (currentUser.email && m.senderEmail?.toLowerCase() === currentUser.email.toLowerCase())
    );
  }, [hrdMessages, currentUser]);

  const selectedMessage = useMemo(() => {
    return hrdMessages.find((m) => m.id === selectedMessageId) || null;
  }, [hrdMessages, selectedMessageId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Please fill out the Subject and Message Description.');
      return;
    }

    const created = submitHRDMessage({
      senderId: currentUser?.id || `usr-${Date.now()}`,
      senderName: senderName.trim() || currentUser?.name || 'Department Member',
      senderDepartment,
      senderRole: senderRole.trim() || 'Department Member',
      senderPhone: senderPhone.trim() || undefined,
      senderEmail: currentUser?.email || undefined,
      subject: subject.trim(),
      category,
      description: description.trim(),
      urgency,
      attachmentUrl: attachmentUrl || undefined,
    });

    setSubmittedRef(created.referenceNumber);
    // Reset form
    setSubject('');
    setDescription('');
    setAttachmentUrl('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessageId || !replyText.trim()) return;

    addHRDMessageResponse(
      selectedMessageId,
      {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.departmentRole,
        isFromHRD: false,
        message: replyText.trim(),
      },
      'Awaiting Response'
    );

    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#170E28] via-[#2D164D] to-[#451C75] text-white flex items-center justify-between border-b border-purple-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Direct Line
                </span>
                <span className="text-[11px] text-purple-200">Dominion City Asaba</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                REPORT TO HOD
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              setSubmittedRef(null);
              onClose();
            }}
            className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={() => {
              setActiveTab('compose');
              setSubmittedRef(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'compose'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Message to HOD</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'history'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>My Submission History</span>
            {userMessages.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                {userMessages.length}
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'compose' && !submittedRef && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong>Private Executive Communication:</strong> Your message will be delivered directly to the Head of Department's (HOD) private leadership office. You will be assigned a unique reference code to track responses.
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    1. Sender's Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    2. Submitting Department / Unit *
                  </label>
                  <select
                    value={senderDepartment}
                    onChange={(e) => setSenderDepartment(e.target.value as DepartmentUnitType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    {DEPARTMENT_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    3. Role / Position
                  </label>
                  <input
                    type="text"
                    value={senderRole}
                    onChange={(e) => setSenderRole(e.target.value)}
                    placeholder="e.g. Welfare Coordinator, Assistant Officer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Subject & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    4. Subject / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Concise summary of your message or observation..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    5. Message Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HRDMessageCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    {MESSAGE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    6. Urgency Level *
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {(['Low', 'Medium', 'High', 'Urgent'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setUrgency(lvl)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${urgency === lvl
                          ? lvl === 'Urgent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : lvl === 'High'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  7. Message / Report Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the matter in detail: what happened, members involved, background context, or recommendations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Supporting Attachment / Photo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  8. Supporting Attachment / Photo (Optional)
                </label>
                <ImageUploadInput
                  value={attachmentUrl}
                  onChange={(url) => setAttachmentUrl(url)}
                  label="Upload evidence photograph, waybill, or document preview"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Submission Timestamp: <strong className="text-slate-600 dark:text-slate-300">{new Date().toLocaleString('en-GB')}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Submit Report to HRD</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Submission Success Confirmation */}
          {submittedRef && (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Message Delivered to HRD Office
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Your report has been securely registered in the HRD's private inbox with reference code:
                </p>
                <div className="mt-3 inline-block px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-sm font-mono font-black text-purple-700 dark:text-purple-300">
                  {submittedRef}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-2.5">
                <button
                  onClick={() => {
                    setSubmittedRef(null);
                    setActiveTab('history');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
                >
                  View My Submission History
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* User History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {!selectedMessage ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Your Submitted Messages ({userMessages.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Private to your account
                    </span>
                  </div>

                  {userMessages.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        You have not submitted any messages to the HOD yet.
                      </p>
                      <button
                        onClick={() => setActiveTab('compose')}
                        className="mt-3 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
                      >
                        Submit a new report now →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {userMessages.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => setSelectedMessageId(msg.id)}
                          className="p-4 rounded-2xl bg-white dark:bg-[#07132B] border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all cursor-pointer shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-black text-purple-600 dark:text-purple-400">
                              {msg.referenceNumber}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${msg.status === 'Resolved'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : msg.status === 'Under Review'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}
                              >
                                {msg.status}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${msg.urgency === 'Urgent'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                              >
                                {msg.urgency}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {msg.subject}
                          </h4>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {msg.description}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span>Category: <strong>{msg.category}</strong></span>
                            <span>{new Date(msg.submissionDate).toLocaleDateString('en-GB')}</span>
                          </div>

                          {msg.responses.length > 0 && (
                            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 text-[11px] font-semibold flex items-center gap-1.5">
                              <CornerDownRight className="w-3.5 h-3.5 text-purple-600" />
                              <span>{msg.responses.length} HOD response(s) on this thread</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Thread Detail & Reply View */
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedMessageId(null)}
                    className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to My Submissions List
                  </button>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#07132B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-mono text-xs font-black text-purple-600 dark:text-purple-400 block">
                          {selectedMessage.referenceNumber}
                        </span>
                        <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                          {selectedMessage.subject}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {selectedMessage.status}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {new Date(selectedMessage.submissionDate).toLocaleString('en-GB')}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl">
                      {selectedMessage.description}
                    </div>

                    {selectedMessage.attachmentUrl && (
                      <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 max-w-xs">
                        <img
                          src={selectedMessage.attachmentUrl}
                          alt="Supporting Evidence"
                          className="rounded-lg max-h-40 object-cover w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Conversation Thread */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Conversation History ({selectedMessage.responses.length})
                    </h4>

                    {selectedMessage.responses.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500 italic text-center">
                        Your message has been received by the HOD Office. Responses or requests for clarification will appear here.
                      </div>
                    ) : (
                      selectedMessage.responses.map((resp) => (
                        <div
                          key={resp.id}
                          className={`p-3.5 rounded-2xl text-xs space-y-1 ${resp.isFromHRD
                            ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 ml-4'
                            : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mr-4'
                            }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className={resp.isFromHRD ? 'text-purple-900 dark:text-purple-300' : 'text-slate-800 dark:text-slate-200'}>
                              {resp.isFromHRD ? '👑 ' : ''}{resp.senderName} ({resp.senderRole})
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(resp.timestamp).toLocaleString('en-GB')}
                            </span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                            {resp.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendReply} className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Reply or Provide Additional Information
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Type your reply to the HOD..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

