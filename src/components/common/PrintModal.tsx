import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { Logo } from './Logo';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  documentRef?: string;
  isConfidential?: boolean;
  preparedBy?: string;
  approvedBy?: string;
  children: React.ReactNode;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle = 'Dominion City Asaba — Information Desk Department',
  documentRef,
  isConfidential = false,
  preparedBy = 'Information Desk Officer',
  approvedBy = 'Head of Department / Resident Pastor',
  children,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:rounded-none">
        {/* Action Header - Hidden during actual print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700">
              <Printer className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">Official Print & Document Preview</h3>
              <p className="text-xs text-slate-500">Formatted for standard A4 paper size</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Container */}
        <div className="overflow-y-auto p-8 print:p-0 printable-document">
          <div className="max-w-[760px] mx-auto bg-white p-6 border border-slate-200 rounded-lg print:border-none print:p-0 print:max-w-none shadow-sm print:shadow-none min-h-[900px] flex flex-col justify-between">
            {/* Header Lockup */}
            <div>
              <div className="flex items-start justify-between border-b-2 border-blue-900 pb-4 mb-6">
                <Logo size="md" variant="dark" />
                <div className="text-right">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-blue-900 block">
                    DOMINION CITY ASABA
                  </span>
                  <span className="text-xs font-semibold text-slate-600 block">
                    Information Desk Department
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Cathedral, Km 2 Benin-Asaba Express, Summit Junction
                  </span>
                  {documentRef && (
                    <span className="text-[11px] font-mono font-medium text-slate-700 mt-1 block">
                      Ref: {documentRef}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Confidentiality */}
              <div className="text-center mb-6">
                {isConfidential && (
                  <span className="inline-block px-3 py-0.5 mb-2 text-[10px] font-bold tracking-wider uppercase text-red-700 bg-red-50 border border-red-200 rounded">
                    RESTRICTED / DEPARTMENTAL CONFIDENTIAL
                  </span>
                )}
                <h1 className="text-xl font-black uppercase tracking-wide text-slate-900">
                  {title}
                </h1>
                <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                <div className="text-[11px] text-slate-500 mt-1">
                  Generated on: <span className="font-medium text-slate-700">{currentDate}</span>
                </div>
              </div>

              {/* Document Body Content */}
              <div className="text-sm text-slate-800 space-y-4 print-content">{children}</div>
            </div>

            {/* Document Footer Signatures */}
            <div className="mt-12 pt-6 border-t border-slate-300">
              <div className="grid grid-cols-2 gap-8 text-xs">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
                  <span className="font-bold text-slate-800 block">{preparedBy}</span>
                  <span className="text-slate-500 text-[11px]">Prepared by / Desk Officer</span>
                  <span className="text-slate-400 text-[10px] block">Date: {currentDate}</span>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
                  <span className="font-bold text-slate-800 block">{approvedBy}</span>
                  <span className="text-slate-500 text-[11px]">Approved by / Endorsement</span>
                  <span className="text-slate-400 text-[10px] block">Dominion City Church, Asaba</span>
                </div>
              </div>
              <div className="text-center mt-6 text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                Dominion City Church, Asaba — Information Desk Management Portal • Official Certified Document
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
