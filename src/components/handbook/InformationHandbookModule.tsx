import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { HandbookEntry } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { formatDate } from '../../utils/dateUtils';
import {
  BookOpen,
  Plus,
  Search,
  Printer,
  FileText,
  Phone,
  Shield,
  HelpCircle,
  X,
  Edit2,
  Trash2,
  Eye,
  Check,
  Paperclip,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const InformationHandbookModule: React.FC = () => {
  const { currentUser, canManageHandbook, isHOD, isSecretary } = useAuth();
  const { handbook, addHandbookEntry, updateHandbookEntry, deleteHandbookEntry } = useData();

  const isAuthorized = canManageHandbook || isHOD || isSecretary;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEntryId, setActiveEntryId] = useState<string>(handbook[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HandbookEntry | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    category: 'SOP' | 'Desk Guidelines' | 'Contacts' | 'Church Directory' | 'FAQs';
    content: string;
    fileAttachment: string;
    status: 'Published' | 'Draft';
  }>({
    title: '',
    category: 'SOP',
    content: '',
    fileAttachment: '',
    status: 'Published',
  });

  const categories = ['All', 'SOP', 'Desk Guidelines', 'Contacts', 'Church Directory', 'FAQs'];

  // Filter: General members only see published handbook documents
  const visibleEntries = handbook.filter((entry) => {
    if (isAuthorized) return true;
    return entry.status === 'Published' || !entry.status;
  });

  const filteredEntries = visibleEntries.filter((entry) => {
    const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeEntry = visibleEntries.find((e) => e.id === activeEntryId) || filteredEntries[0] || visibleEntries[0];

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormData({
      title: '',
      category: 'SOP',
      content: '',
      fileAttachment: '',
      status: 'Published',
    });
    setIsPreviewMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: HandbookEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      category: entry.category,
      content: entry.content,
      fileAttachment: entry.fileAttachment || '',
      status: entry.status || 'Published',
    });
    setIsPreviewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the handbook entry "${title}"? This action cannot be undone.`)) {
      deleteHandbookEntry(id);
      if (activeEntryId === id) {
        const remaining = visibleEntries.filter((e) => e.id !== id);
        if (remaining.length > 0) {
          setActiveEntryId(remaining[0].id);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill out the section title and content.');
      return;
    }

    if (editingEntry) {
      updateHandbookEntry(editingEntry.id, {
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
        fileAttachment: formData.fileAttachment.trim() || undefined,
        status: formData.status,
        lastUpdatedBy: currentUser.name,
      });
      setActiveEntryId(editingEntry.id);
    } else {
      addHandbookEntry({
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
        fileAttachment: formData.fileAttachment.trim() || undefined,
        status: formData.status,
        lastUpdatedBy: currentUser.name,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0E172B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Information Desk Handbook & Operational Procedures
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard operating protocols, emergency pastoral contacts, and front-desk customer service guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAuthorized && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Handbook Section
            </button>
          )}

          {activeEntry && (
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Active SOP
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Pane Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Table of Contents & Category Filters */}
        <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4 h-fit">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search handbook topics..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredEntries.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No handbook sections match your query.
              </p>
            ) : (
              filteredEntries.map((entry) => {
                const isSelected = activeEntry?.id === entry.id;
                return (
                  <button
                    key={entry.id}
                    onClick={() => setActiveEntryId(entry.id)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200 font-bold shadow-2xs'
                        : 'hover:bg-slate-50 dark:hover:bg-[#131F38] border-transparent text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                        {entry.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isAuthorized && entry.status && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              entry.status === 'Published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {entry.status}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {formatDate(entry.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 line-clamp-1">{entry.title}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Active Handbook Document Reader */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          {activeEntry ? (
            <div>
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {activeEntry.category}
                    </span>
                    {activeEntry.status && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          activeEntry.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {activeEntry.status}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                    {activeEntry.title}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Last revised by {activeEntry.lastUpdatedBy} on {formatDate(activeEntry.updatedAt)}
                  </p>
                </div>

                {/* Management Controls for Authorized Officers */}
                {isAuthorized && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(activeEntry)}
                      className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Document"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(activeEntry.id, activeEntry.title)}
                      className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {activeEntry.fileAttachment && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-semibold truncate">
                    <Paperclip className="w-4 h-4 shrink-0 text-blue-600" />
                    <span className="truncate">Attached Document Reference: {activeEntry.fileAttachment}</span>
                  </div>
                  <a
                    href={activeEntry.fileAttachment}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-700 dark:text-blue-400 font-bold hover:underline shrink-0 ml-2"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-4">
                {activeEntry.content}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">
              Select an entry from the list to view.
            </p>
          )}

          {activeEntry && (
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Dominion City Asaba • Official Standard Operating Procedures</span>
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print this Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingEntry ? 'Edit Handbook Section' : 'Add Handbook Section'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Section Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Protocol & Pastoral Reception"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="SOP">SOP</option>
                    <option value="Desk Guidelines">Desk Guidelines</option>
                    <option value="Contacts">Contacts</option>
                    <option value="Church Directory">Church Directory</option>
                    <option value="FAQs">FAQs</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'Published' | 'Draft',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Published">Published (Live to Members)</option>
                    <option value="Draft">Draft (Private to Officers)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Optional Attachment / Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://... (PDF, Document link, or image URL)"
                  value={formData.fileAttachment}
                  onChange={(e) => setFormData({ ...formData, fileAttachment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Document Content *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isPreviewMode ? 'Edit Content' : 'Preview'}
                  </button>
                </div>

                {isPreviewMode ? (
                  <div className="p-3 bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed text-[11px]">
                    {formData.content || '(No content entered yet)'}
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter detailed instructions, contact numbers, or protocols..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-[11px]"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  {editingEntry ? 'Update Section' : 'Save Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print SOP Modal */}
      {activeEntry && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={`OPERATIONAL HANDBOOK: ${activeEntry.title}`}
          subtitle={`Category: ${activeEntry.category} • Certified Reference Document`}
          documentRef={`SOP-${activeEntry.id}`}
        >
          <div className="space-y-4">
            <div className="text-xs leading-relaxed text-slate-800 whitespace-pre-line p-2">
              {activeEntry.content}
            </div>
            <div className="text-[10px] text-slate-400 pt-4 border-t border-slate-200">
              Last revision authored by {activeEntry.lastUpdatedBy}.
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
