import React, { useRef, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
} from 'lucide-react';

export const DataManagementModal: React.FC = () => {
  const {
    exportAllDataAsJSON,
    importDataFromJSON,
    resetToInitialData,
    members,
    lostItems,
    cells,
    transactions,
    books,
  } = useData();
  const { isHOD } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataFromJSON(content);
      }
    };
    reader.readAsText(file);
  };

  const copySqlNotice = () => {
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Database className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Data Persistence, Cloud Synchronization & System Safeguards
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Complete offline-first persistence with JSON backup, snapshot restore, and Supabase PostgreSQL integration.
        </p>
      </div>

      {/* Storage Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Storage Engine
          </span>
          <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Browser LocalStorage
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Zero latency offline</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Records Tracked
          </span>
          <p className="text-sm font-bold text-blue-700 mt-1">
            {members.length + lostItems.length + cells.length + transactions.length + books.length} Live Items
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Across all 14 modules</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Automatic Sync
          </span>
          <p className="text-sm font-bold text-emerald-700 mt-1">Active on Edit</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Survives page reloads</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Supabase Cloud Schema
          </span>
          <p className="text-sm font-bold text-purple-700 mt-1">Ready for Deploy</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">PostgreSQL RLS ready</span>
        </div>
      </div>

      {/* Backup and Restore Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export JSON Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                1-Click Full System Backup (JSON)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Export an encrypted, complete snapshot of all member profiles, birthdays, lost & found logs, financial books, and cell directories into a single portable backup file.
            </p>
          </div>

          <button
            onClick={exportAllDataAsJSON}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Complete JSON Backup
          </button>
        </div>

        {/* Restore JSON Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Restore System from Backup</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Upload an existing Dominion City Information Desk backup file to immediately restore all departmental records on any device or new computer.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload & Restore JSON Backup
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Integration Instructions & Reset */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold">Supabase PostgreSQL Cloud Integration Guide</h3>
        </div>
        <p className="text-xs text-blue-100/90 leading-relaxed max-w-2xl">
          The system includes a production-grade SQL migration file named{' '}
          <code className="bg-white/10 px-2 py-0.5 rounded font-mono text-amber-300">
            supabase-schema.sql
          </code>{' '}
          located directly in the root directory. To link to your live Supabase cloud database:
        </p>

        <ol className="list-decimal list-inside text-xs text-blue-200 space-y-1.5 pl-1">
          <li>Create a project on <strong>supabase.com</strong>.</li>
          <li>Open the Supabase <strong>SQL Editor</strong> and paste the contents of <code className="text-white">supabase-schema.sql</code>.</li>
          <li>Run the script to automatically build all tables, indexes, and Row-Level Security policies.</li>
          <li>Copy your <code className="text-white">SUPABASE_URL</code> and <code className="text-white">SUPABASE_ANON_KEY</code> into your <code className="text-white">.env</code> file.</li>
        </ol>

        {isHOD && (
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Reset environment to default Dominion City Asaba seed dataset?
            </span>
            <button
              onClick={resetToInitialData}
              className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Reset to Factory Seed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
