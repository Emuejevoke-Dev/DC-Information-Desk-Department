import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  InformationCollection,
  CollectionEntry,
  CollectionField,
  FieldType,
} from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { exportToCSV } from '../../utils/exportUtils';
import { formatDate } from '../../utils/dateUtils';
import {
  ClipboardList,
  Plus,
  Search,
  Printer,
  Download,
  CheckCircle,
  Clock,
  User,
  X,
  Eye,
  Lock,
  Unlock,
  FileSpreadsheet,
} from 'lucide-react';

export const InformationCollectionModule: React.FC = () => {
  const { currentUser, canManageForms } = useAuth();
  const {
    collections,
    collectionEntries,
    addCollection,
    updateCollection,
    addCollectionEntry,
  } = useData();

  const [activeCollection, setActiveCollection] = useState<InformationCollection>(collections[0]);
  const [isNewFormModalOpen, setIsNewFormModalOpen] = useState(false);
  const [isSubmitEntryModalOpen, setIsSubmitEntryModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [searchEntryQuery, setSearchEntryQuery] = useState('');

  // Form Builder state
  const [formBuilderData, setFormBuilderData] = useState<{
    title: string;
    description: string;
    purpose: string;
    requestedBy: string;
    deadline: string;
    fields: CollectionField[];
  }>({
    title: '',
    description: '',
    purpose: '',
    requestedBy: 'Resident Pastor',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fields: [
      { id: 'f_name', label: 'Full Legal Name', type: 'text', required: true },
      { id: 'f_phone', label: 'WhatsApp Phone Number', type: 'phone', required: true },
      { id: 'f_area', label: 'Residential Neighbourhood', type: 'text', required: true },
    ],
  });

  // Entry submission state
  const [entryFormValues, setEntryFormValues] = useState<Record<string, string>>({});

  // Filtered entries for active collection
  const activeEntries = collectionEntries.filter(
    (e) => e.collectionId === activeCollection?.id
  );

  const filteredEntries = activeEntries.filter((entry) => {
    if (!searchEntryQuery) return true;
    const valuesStr = Object.values(entry.data).join(' ').toLowerCase();
    return valuesStr.includes(searchEntryQuery.toLowerCase());
  });

  const handleAddField = () => {
    const fieldId = `field_${Date.now()}`;
    setFormBuilderData({
      ...formBuilderData,
      fields: [
        ...formBuilderData.fields,
        {
          id: fieldId,
          label: 'New Question / Field',
          type: 'text',
          required: false,
        },
      ],
    });
  };

  const handleRemoveField = (fieldId: string) => {
    setFormBuilderData({
      ...formBuilderData,
      fields: formBuilderData.fields.filter((f) => f.id !== fieldId),
    });
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBuilderData.title || formBuilderData.fields.length === 0) {
      alert('Please provide a form title and at least one field.');
      return;
    }

    addCollection({
      title: formBuilderData.title,
      description: formBuilderData.description,
      purpose: formBuilderData.purpose,
      requestedBy: formBuilderData.requestedBy,
      deadline: formBuilderData.deadline,
      fields: formBuilderData.fields,
      status: 'Open',
    });

    setIsNewFormModalOpen(false);
  };

  const handleEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCollection) return;

    // Validate required fields
    for (const f of activeCollection.fields) {
      if (f.required && !entryFormValues[f.id]) {
        alert(`Field "${f.label}" is required.`);
        return;
      }
    }

    addCollectionEntry({
      collectionId: activeCollection.id,
      data: entryFormValues,
      submittedBy: currentUser.name,
    });

    setIsSubmitEntryModalOpen(false);
    setEntryFormValues({});
    alert('Entry registered successfully!');
  };

  const handleExportCSV = () => {
    if (!activeCollection || filteredEntries.length === 0) {
      alert('No submissions available to export.');
      return;
    }

    const columns = [
      ...activeCollection.fields.map((f) => ({
        key: f.id as any,
        header: f.label,
        format: (val: any) => String(val || ''),
      })),
      { key: 'submittedBy' as any, header: 'Submitted By' },
      { key: 'submittedAt' as any, header: 'Submission Date', format: (d: any) => formatDate(d) },
    ];

    const flatData = filteredEntries.map((e) => ({
      ...e.data,
      submittedBy: e.submittedBy,
      submittedAt: e.submittedAt,
    }));

    exportToCSV(flatData, `DominionCity_${activeCollection.title.replace(/\s+/g, '_')}`, columns);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ClipboardList className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Custom Information Collection & Form Builder
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build custom forms on the fly for pastoral lists, programme registrations, workers validation, and census.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageForms && (
            <button
              onClick={() => setIsNewFormModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Build New Custom Form
            </button>
          )}
          {activeCollection && (
            <>
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Form Entries
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Dual Layout: Collections Sidebar + Active Entries Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Form Collections Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Available Collections ({collections.length})
          </h3>
          <div className="space-y-1.5">
            {collections.map((col) => {
              const isSelected = activeCollection?.id === col.id;
              const entriesCount = collectionEntries.filter((e) => e.collectionId === col.id).length;

              return (
                <button
                  key={col.id}
                  onClick={() => setActiveCollection(col)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-purple-50 border-purple-200 text-purple-950 font-bold shadow-2xs'
                      : 'hover:bg-slate-50 border-transparent text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        col.status === 'Open'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {col.status}
                    </span>
                    <span className="text-[10px] text-slate-400">{entriesCount} entries</span>
                  </div>
                  <h4 className="mt-1 font-bold line-clamp-1">{col.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    Req by: {col.requestedBy}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Active Form Data & Entries */}
        <div className="lg:col-span-3 space-y-4">
          {activeCollection ? (
            <>
              {/* Form Info Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        activeCollection.status === 'Open'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {activeCollection.status} Form
                    </span>
                    <span className="text-xs text-slate-400">
                      Requested by: <strong className="text-slate-700">{activeCollection.requestedBy}</strong>
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    {activeCollection.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeCollection.description}
                  </p>
                  {activeCollection.deadline && (
                    <p className="text-[11px] text-purple-700 font-semibold mt-1">
                      Submission Deadline: {formatDate(activeCollection.deadline)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeCollection.status === 'Open' && (
                    <button
                      onClick={() => setIsSubmitEntryModalOpen(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Submission
                    </button>
                  )}
                  {canManageForms && (
                    <button
                      onClick={() => {
                        const newStatus = activeCollection.status === 'Open' ? 'Closed' : 'Open';
                        updateCollection(activeCollection.id, { status: newStatus });
                      }}
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title={activeCollection.status === 'Open' ? 'Close Collection' : 'Reopen Collection'}
                    >
                      {activeCollection.status === 'Open' ? (
                        <Lock className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Unlock className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Entries Search */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchEntryQuery}
                    onChange={(e) => setSearchEntryQuery(e.target.value)}
                    placeholder="Search entries in this collection..."
                    className="w-full pl-9 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                  />
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {filteredEntries.length} registered entry{filteredEntries.length === 1 ? '' : 'ies'}
                </span>
              </div>

              {/* Submissions Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3 w-10">#</th>
                        {activeCollection.fields.map((field) => (
                          <th key={field.id} className="p-3">
                            {field.label}
                          </th>
                        ))}
                        <th className="p-3">Logged By</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredEntries.length === 0 ? (
                        <tr>
                          <td
                            colSpan={activeCollection.fields.length + 3}
                            className="p-8 text-center text-slate-400"
                          >
                            No entries registered yet for this collection.
                          </td>
                        </tr>
                      ) : (
                        filteredEntries.map((entry, idx) => (
                          <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>
                            {activeCollection.fields.map((field) => (
                              <td key={field.id} className="p-3">
                                {entry.data[field.id] || '—'}
                              </td>
                            ))}
                            <td className="p-3 text-[11px] text-slate-500">
                              {entry.submittedBy}
                            </td>
                            <td className="p-3 text-[11px] text-slate-400">
                              {formatDate(entry.submittedAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">
              Select or create an information collection form.
            </p>
          )}
        </div>
      </div>

      {/* Form Builder Modal */}
      {isNewFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Design Custom Information Collection Form
              </h3>
              <button
                onClick={() => setIsNewFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Form Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Workers Census 2026, Transport List..."
                  value={formBuilderData.title}
                  onChange={(e) =>
                    setFormBuilderData({ ...formBuilderData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Requested By (Leader/Pastor) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Resident Pastor, HOD..."
                    value={formBuilderData.requestedBy}
                    onChange={(e) =>
                      setFormBuilderData({ ...formBuilderData, requestedBy: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Submission Deadline
                  </label>
                  <input
                    type="date"
                    value={formBuilderData.deadline}
                    onChange={(e) =>
                      setFormBuilderData({ ...formBuilderData, deadline: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Description & Instructions
                </label>
                <textarea
                  rows={2}
                  value={formBuilderData.description}
                  onChange={(e) =>
                    setFormBuilderData({ ...formBuilderData, description: e.target.value })
                  }
                  placeholder="Explain why this data is collected and who should register..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                />
              </div>

              {/* Dynamic Field Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800">
                    Custom Fields ({formBuilderData.fields.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-800"
                  >
                    + Add New Field
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formBuilderData.fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...formBuilderData.fields];
                          updated[idx].label = e.target.value;
                          setFormBuilderData({ ...formBuilderData, fields: updated });
                        }}
                        placeholder="Field label..."
                        className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      />

                      <select
                        value={field.type}
                        onChange={(e) => {
                          const updated = [...formBuilderData.fields];
                          updated[idx].type = e.target.value as FieldType;
                          setFormBuilderData({ ...formBuilderData, fields: updated });
                        }}
                        className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      >
                        <option value="text">Text</option>
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="date">Date</option>
                        <option value="number">Number</option>
                        <option value="textarea">Long Text</option>
                      </select>

                      <label className="flex items-center gap-1 text-[10px] text-slate-500">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const updated = [...formBuilderData.fields];
                            updated[idx].required = e.target.checked;
                            setFormBuilderData({ ...formBuilderData, fields: updated });
                          }}
                        />
                        Req.
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        className="text-slate-400 hover:text-red-500 px-1 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewFormModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 cursor-pointer shadow-xs"
                >
                  Create & Publish Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Entry Modal */}
      {isSubmitEntryModalOpen && activeCollection && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                New Submission: {activeCollection.title}
              </h3>
              <button
                onClick={() => setIsSubmitEntryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEntrySubmit} className="mt-4 space-y-3.5 text-xs">
              {activeCollection.fields.map((f) => (
                <div key={f.id}>
                  <label className="font-bold text-slate-700 block mb-1">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={2}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={entryFormValues[f.id] || ''}
                      onChange={(e) =>
                        setEntryFormValues({ ...entryFormValues, [f.id]: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                    />
                  ) : f.type === 'select' && f.options ? (
                    <select
                      required={f.required}
                      value={entryFormValues[f.id] || ''}
                      onChange={(e) =>
                        setEntryFormValues({ ...entryFormValues, [f.id]: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                    >
                      <option value="">-- Select option --</option>
                      {f.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'phone' ? 'tel' : f.type}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={entryFormValues[f.id] || ''}
                      onChange={(e) =>
                        setEntryFormValues({ ...entryFormValues, [f.id]: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-purple-600"
                    />
                  )}
                </div>
              ))}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubmitEntryModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 cursor-pointer shadow-xs"
                >
                  Save Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print Form Submissions Modal */}
      {activeCollection && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={`DATA COLLECTION REPORT: ${activeCollection.title}`}
          subtitle={`Requested by: ${activeCollection.requestedBy} • Total Entries: ${filteredEntries.length}`}
          documentRef={`COL-${activeCollection.id}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <p>
                <strong>Purpose:</strong> {activeCollection.purpose || activeCollection.description}
              </p>
              {activeCollection.deadline && (
                <p className="mt-0.5">
                  <strong>Deadline:</strong> {formatDate(activeCollection.deadline)}
                </p>
              )}
            </div>

            <table className="w-full text-[11px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-purple-900 text-white font-bold">
                  <th className="p-2 border border-slate-300 text-center w-10">#</th>
                  {activeCollection.fields.map((f) => (
                    <th key={f.id} className="p-2 border border-slate-300 text-left">
                      {f.label}
                    </th>
                  ))}
                  <th className="p-2 border border-slate-300 text-left">Logged By</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, idx) => (
                  <tr key={entry.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 border border-slate-300 text-center font-bold">
                      {idx + 1}
                    </td>
                    {activeCollection.fields.map((f) => (
                      <td key={f.id} className="p-2 border border-slate-300">
                        {entry.data[f.id] || '—'}
                      </td>
                    ))}
                    <td className="p-2 border border-slate-300 text-[10px] text-slate-500">
                      {entry.submittedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
