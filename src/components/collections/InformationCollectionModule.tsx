import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TableDocument, TableDocumentRow } from '../../types/models';
import { Logo } from '../common/Logo';
import { exportToCSV } from '../../utils/exportUtils';
import { ShareModal } from '../common/ShareModal';
import {
  ClipboardList,
  Plus,
  Trash2,
  Printer,
  Download,
  Share2,
  Save,
  FileSpreadsheet,
  RotateCcw,
  PlusCircle,
  FileText,
  CheckCircle2,
  Columns3,
  X,
} from 'lucide-react';

export const InformationCollectionModule: React.FC = () => {
  const { currentUser, canManageForms, isHOD, isOperations, isSecretary } = useAuth();
  const {
    tableDocuments,
    addTableDocument,
    updateTableDocument,
    deleteTableDocument,
  } = useData();

  const isAuthorized = canManageForms || isHOD || isOperations || isSecretary;

  // Active document being edited
  const [selectedDocId, setSelectedDocId] = useState<string>(
    tableDocuments[0]?.id || 'default-doc'
  );

  const [docTitle, setDocTitle] = useState('INFORMATION DESK GENERAL ATTENDANCE & ENQUIRY REGISTER');
  const [docDepartment, setDocDepartment] = useState('Information Desk Department');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [docOptionalInfo, setDocOptionalInfo] = useState('Dominion City Asaba — Front Desk Official Record');
  const [columns, setColumns] = useState<string[]>([
    'Full Name',
    'Phone / WhatsApp',
    'Purpose / Enquiry',
    'Attending Officer',
    'Remarks / Action Taken',
  ]);
  const [rows, setRows] = useState<TableDocumentRow[]>([
    {
      id: 'row-1',
      sn: 1,
      values: {
        'Full Name': 'Brother Emmanuel Eze',
        'Phone / WhatsApp': '08031234567',
        'Purpose / Enquiry': 'Enquiry about Sunday Discipleship class venue',
        'Attending Officer': 'Sister Blessing Adams',
        'Remarks / Action Taken': 'Directed to Teen Church Hall A',
      },
    },
    {
      id: 'row-2',
      sn: 2,
      values: {
        'Full Name': 'Sister Joy Chinedu',
        'Phone / WhatsApp': '08098765432',
        'Purpose / Enquiry': 'Lost and Found: left black Bible in second service',
        'Attending Officer': 'Brother Chukwudi Okonkwo',
        'Remarks / Action Taken': 'Logged in Lost Property Register (Bag A3)',
      },
    },
    {
      id: 'row-3',
      sn: 3,
      values: {
        'Full Name': 'Mr. Anthony Okon',
        'Phone / WhatsApp': '07033445566',
        'Purpose / Enquiry': 'First-timer seeking Satellite Church in Okpanam Road',
        'Attending Officer': 'Sister Amaka Obi',
        'Remarks / Action Taken': 'Given Asaba Satellite Directory flyer',
      },
    },
  ]);

  const [newColumnName, setNewColumnName] = useState('');
  const [showColManager, setShowColManager] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Sync when selecting a saved document
  useEffect(() => {
    const existing = tableDocuments.find((d) => d.id === selectedDocId);
    if (existing) {
      setDocTitle(existing.title);
      setDocDepartment(existing.department || 'Information Desk Department');
      setDocDate(existing.date || new Date().toISOString().split('T')[0]);
      setDocOptionalInfo(existing.optionalInfo || '');
      setColumns(existing.columns || ['Full Name', 'Phone', 'Purpose']);
      setRows(existing.rows || []);
    }
  }, [selectedDocId, tableDocuments]);

  // Handle cell text change
  const handleCellChange = (rowId: string, colName: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          return {
            ...r,
            values: {
              ...r.values,
              [colName]: value,
            },
          };
        }
        return r;
      })
    );
  };

  // Add Row
  const handleAddRow = () => {
    const newSn = rows.length + 1;
    const newRow: TableDocumentRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sn: newSn,
      values: {},
    };
    columns.forEach((col) => {
      newRow.values[col] = '';
    });
    setRows([...rows, newRow]);
  };

  // Delete Row
  const handleDeleteRow = (rowId: string) => {
    const updated = rows
      .filter((r) => r.id !== rowId)
      .map((r, idx) => ({
        ...r,
        sn: idx + 1,
      }));
    setRows(updated);
  };

  // Clear All Rows
  const handleClearAllRows = () => {
    if (confirm('Are you sure you want to clear all rows in this register?')) {
      setRows([]);
    }
  };

  // Add Column
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newColumnName.trim();
    if (!trimmed) return;
    if (columns.includes(trimmed)) {
      alert('A column with this name already exists.');
      return;
    }
    setColumns([...columns, trimmed]);
    setNewColumnName('');
  };

  // Delete Column
  const handleDeleteColumn = (colName: string) => {
    if (columns.length <= 1) {
      alert('The table must have at least one data column.');
      return;
    }
    if (confirm(`Remove column "${colName}" from table?`)) {
      setColumns(columns.filter((c) => c !== colName));
    }
  };

  // Save / Update Document
  const handleSaveDocument = () => {
    const existing = tableDocuments.find((d) => d.id === selectedDocId);
    if (existing) {
      updateTableDocument(existing.id, {
        title: docTitle.trim() || 'Untitled Document Register',
        department: docDepartment.trim(),
        date: docDate,
        optionalInfo: docOptionalInfo.trim(),
        columns,
        rows,
      });
      setSaveFeedback('Register updated successfully!');
    } else {
      addTableDocument({
        title: docTitle.trim() || 'Untitled Document Register',
        department: docDepartment.trim(),
        date: docDate,
        optionalInfo: docOptionalInfo.trim(),
        columns,
        rows,
        createdBy: currentUser.name,
      });
      setSaveFeedback('New register saved successfully!');
    }

    setTimeout(() => {
      setSaveFeedback(null);
    }, 3000);
  };

  // New Blank Register
  const handleCreateNewRegister = () => {
    const newId = `doc-${Date.now()}`;
    setSelectedDocId(newId);
    setDocTitle('NEW INFORMATION DESK REGISTER');
    setDocDate(new Date().toISOString().split('T')[0]);
    setDocOptionalInfo('Dominion City Asaba — Front Desk Official Record');
    setColumns(['Name', 'Surname', 'Phone Number', 'Type of Document / Purpose']);
    setRows([
      {
        id: `row-${Date.now()}-1`,
        sn: 1,
        values: {
          'Name': '',
          'Surname': '',
          'Phone Number': '',
          'Type of Document / Purpose': '',
        },
      },
    ]);
  };

  // Delete Current Document
  const handleDeleteCurrentDocument = () => {
    const existing = tableDocuments.find((d) => d.id === selectedDocId);
    if (!existing) {
      handleCreateNewRegister();
      return;
    }
    if (confirm(`Are you sure you want to delete "${existing.title}"?`)) {
      deleteTableDocument(existing.id);
      setSelectedDocId(tableDocuments[0]?.id || 'default-doc');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (rows.length === 0) {
      alert('No data rows available to export.');
      return;
    }

    const flatData = rows.map((r) => {
      const obj: Record<string, any> = { 'S/N': r.sn };
      columns.forEach((col) => {
        obj[col] = r.values[col] || '';
      });
      return obj;
    });

    const exportCols = [
      { key: 'S/N' as any, header: 'S/N' },
      ...columns.map((c) => ({ key: c as any, header: c })),
    ];

    const safeTitle = docTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    exportToCSV(flatData, `DominionCity_${safeTitle}`, exportCols);
  };

  // Print Register
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Action Bar (Screen Only) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0E172B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ClipboardList className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Front Desk Register & Table Documentation Tool
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official table register generator with auto-numbered rows, editable columns, and PDF print formatting.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Saved Document Selector */}
          {tableDocuments.length > 0 && (
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              title="Select saved document"
            >
              {tableDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title.length > 30 ? doc.title.slice(0, 30) + '...' : doc.title}
                </option>
              ))}
            </select>
          )}

          {/* New Register Button */}
          <button
            onClick={handleCreateNewRegister}
            className="btn-compact bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            title="Start a new blank table register"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Register</span>
          </button>

          {/* Column Manager Toggle */}
          <button
            onClick={() => setShowColManager(!showColManager)}
            className="btn-compact bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            title="Configure table columns"
          >
            <Columns3 className="w-3.5 h-3.5 text-blue-500" />
            <span>Columns ({columns.length})</span>
          </button>

          {/* Save Button */}
          {isAuthorized && (
            <button
              onClick={handleSaveDocument}
              className="btn-compact bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              title="Save changes to this register"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Register</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="btn-compact bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            title="Export rows as spreadsheet CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Share via WhatsApp & PDF */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="btn-compact bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs cursor-pointer"
            title="Share completed register via WhatsApp & PDF"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="btn-compact btn-glow-blue"
            title="Print official document or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Save Feedback Banner */}
      {saveFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* Column Management Bar (Collapsible, Screen Only) */}
      {showColManager && (
        <div className="bg-slate-50 dark:bg-[#07132B] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 print:hidden animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Manage Table Columns
            </h4>
            <span className="text-[11px] text-slate-400">
              S/N column is auto-numbered automatically
            </span>
          </div>

          {/* Existing columns pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-bold text-xs border border-blue-300 dark:border-blue-800">
              S/N (Locked)
            </span>
            {columns.map((col) => (
              <span
                key={col}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                <span>{col}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteColumn(col)}
                  className="text-slate-400 hover:text-red-500 cursor-pointer"
                  title={`Delete column ${col}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add new column input */}
          <form onSubmit={handleAddColumn} className="flex items-center gap-2 max-w-md pt-1">
            <input
              type="text"
              placeholder="e.g. Nationality, Seat Number, Signature..."
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!newColumnName.trim()}
              className="btn-compact bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
            >
              <Plus className="w-3 h-3" />
              <span>Add Column</span>
            </button>
          </form>
        </div>
      )}

      {/* Official Table Register Canvas (Printable A4 Sheet Look) */}
      <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm print:p-0 print:border-none print:shadow-none">
        {/* CENTERED DOMINION CITY ASABA HEADER */}
        <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-center mb-2">
            <Logo size="lg" variant="dark" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0B1D42] dark:text-white uppercase">
            Dominion City Asaba
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mt-0.5">
            Information Desk Department
          </p>

          {/* Editable Document Title */}
          <div className="w-full max-w-2xl mt-4">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="ENTER DOCUMENT / REGISTER TITLE..."
              className="w-full text-center text-sm sm:text-base font-extrabold uppercase text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 rounded-lg px-3 py-1.5 transition-all"
              title="Click to edit document title"
            />
          </div>

          {/* Document Meta (Date & Subtitle) */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Date:</span>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 px-1 py-0.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Reference:</span>
              <input
                type="text"
                value={docOptionalInfo}
                onChange={(e) => setDocOptionalInfo(e.target.value)}
                placeholder="Optional notes / sub-header..."
                className="bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 px-1 py-0.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden w-64 text-center"
              />
            </div>
          </div>
        </div>

        {/* DYNAMIC AUTO-NUMBERED TABLE CONTAINER */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B1D42] text-white">
                <th className="py-3 px-3 w-14 text-center font-extrabold border-r border-blue-900/70">
                  S/N
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="py-3 px-3.5 font-bold tracking-wide uppercase text-[11px] border-r border-blue-900/70 last:border-r-0 min-w-[160px]"
                  >
                    {col}
                  </th>
                ))}
                <th className="py-3 px-2 w-12 text-center font-bold print:hidden">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#07132B]">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="py-8 text-center text-slate-400 italic text-xs"
                  >
                    No rows added yet. Click "+ Add Row" below to begin entering records.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      idx % 2 === 1 ? 'bg-slate-50/40 dark:bg-slate-900/30' : ''
                    }`}
                  >
                    {/* Auto-Numbered S/N Column */}
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                      {row.sn}
                    </td>

                    {/* Dynamic Data Columns */}
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="py-1 px-1.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0"
                      >
                        <input
                          type="text"
                          value={row.values[col] || ''}
                          onChange={(e) => handleCellChange(row.id, col, e.target.value)}
                          placeholder={`Enter ${col.toLowerCase()}...`}
                          className="w-full px-2 py-1.5 bg-transparent hover:bg-slate-100/70 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-[#0A192F] focus:ring-1 focus:ring-blue-500 rounded text-slate-900 dark:text-white placeholder-slate-400 text-xs transition-colors border-0"
                        />
                      </td>
                    ))}

                    {/* Delete Row Action (Screen Only) */}
                    <td className="py-1 px-2 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
                        title="Delete this row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM REGISTER CONTROLS (Screen Only) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddRow}
              className="btn-compact btn-glow-blue"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Add Row</span>
            </button>
            <button
              onClick={handleClearAllRows}
              disabled={rows.length === 0}
              className="btn-compact bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-400 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Rows</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Total Entries:{' '}
              <strong className="text-slate-900 dark:text-white font-mono">{rows.length}</strong>
            </span>
            <span>•</span>
            <span>
              Columns: <strong className="text-slate-900 dark:text-white">{columns.length}</strong>
            </span>
            {isAuthorized && (
              <>
                <span>•</span>
                <button
                  onClick={handleDeleteCurrentDocument}
                  className="text-red-500 hover:underline cursor-pointer font-medium"
                >
                  Delete Register
                </button>
              </>
            )}
          </div>
        </div>

        {/* PRINT FOOTER SIGN-OFF SECTION (Visible during Print Preview) */}
        <div className="hidden print:grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-slate-300 text-xs text-slate-700">
          <div>
            <p className="font-bold text-slate-900">Recorded By:</p>
            <div className="h-10 border-b border-slate-400 mt-4"></div>
            <p className="mt-1 font-semibold">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500">Information Desk Officer</p>
          </div>
          <div>
            <p className="font-bold text-slate-900">Supervisory Verification:</p>
            <div className="h-10 border-b border-slate-400 mt-4"></div>
            <p className="mt-1 font-semibold">Head of Department / Operations Officer</p>
            <p className="text-[10px] text-slate-500">Dominion City Asaba</p>
          </div>
        </div>
      </div>

      {/* GLOBAL SHARE VIA WHATSAPP & PDF */}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          documentTitle={docTitle}
          documentType="Custom Information Form"
          subtitle={`${docDepartment} • Date: ${docDate}`}
          documentRef={`REG-${docDate.replace(/-/g, '')}`}
          isConfidential={false}
          contentLines={[
            `Department: ${docDepartment}`,
            `Date: ${docDate}`,
            `Reference / Purpose: ${docOptionalInfo || 'General Front Desk Record'}`,
            `Total Recorded Entries: ${rows.length}`,
          ]}
          tableHeaders={['S/N', ...columns]}
          tableRows={rows.map((r) => [String(r.sn), ...columns.map((col) => r.values[col] || '—')])}
          summaryNotes={`Generated by ${currentUser.name} (${currentUser.role}) on ${new Date().toLocaleDateString('en-GB')}. Official Dominion City Asaba Register Document.`}
        />
      )}
    </div>
  );
};
