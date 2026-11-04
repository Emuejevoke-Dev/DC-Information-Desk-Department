import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ShareDocumentType, ShareStatus } from '../../types/models';
import {
  validateAndFormatWhatsAppNumber,
  buildWhatsAppUrl,
  generateDocumentPDF,
  downloadBlob,
  PDFGenerationOptions,
} from '../../utils/shareUtils';
import {
  Share2,
  FileText,
  Phone,
  User,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  X,
  Clock,
  Send,
  ShieldCheck,
  ShieldAlert,
  History,
  FileCheck,
} from 'lucide-react';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentType: ShareDocumentType;
  subtitle?: string;
  documentRef?: string;
  isConfidential?: boolean;
  contentLines?: string[];
  tableHeaders?: string[];
  tableRows?: string[][];
  summaryNotes?: string;
  defaultRecipientName?: string;
  defaultRecipientPhone?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentType,
  subtitle,
  documentRef,
  isConfidential = false,
  contentLines,
  tableHeaders,
  tableRows,
  summaryNotes,
  defaultRecipientName = '',
  defaultRecipientPhone = '',
}) => {
  const { currentUser, canViewFinances, canViewConfidentialData } = useAuth();
  const { addShareHistoryEntry, updateShareHistoryStatus } = useData();

  const [recipientName, setRecipientName] = useState(defaultRecipientName);
  const [recipientPhone, setRecipientPhone] = useState(defaultRecipientPhone);
  const [customMessage, setCustomMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharedNative, setIsSharedNative] = useState(false);
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ShareStatus>('Prepared');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<{ blob: Blob; filename: string } | null>(null);

  // Security Check
  const isFinanceRestricted =
    (documentType === 'Financial Report' || documentType === 'Financial Audit') && !canViewFinances;
  const isConfidentialRestricted = isConfidential && !canViewConfidentialData;
  const isAccessDenied = isFinanceRestricted || isConfidentialRestricted;

  // Initial message computation
  useEffect(() => {
    if (!isOpen) return;

    const recipientSalutation = recipientName.trim() ? ` ${recipientName.trim()}` : '';
    const initialText = `Hello${recipientSalutation},\n\nPlease find attached the requested Dominion City Asaba Information Desk official document (${documentTitle}) for your review.\n\nBlessings,\n${currentUser.name}\nDominion City Asaba Information Desk`;
    setCustomMessage(initialText);
    setErrorMsg(null);
    setSuccessMsg(null);
    setActiveShareId(null);
    setCurrentStatus('Prepared');
    setIsSharedNative(false);
    setGeneratedPdfBlob(null);
  }, [isOpen, documentTitle, recipientName, currentUser.name]);

  if (!isOpen) return null;

  if (isAccessDenied) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#0B1528] rounded-2xl p-6 text-center shadow-2xl border border-red-200 dark:border-red-900/50">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Access Restricted — Confidential Document
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            You do not possess the required departmental role clearance to export or share{' '}
            <strong className="text-slate-800 dark:text-slate-200">{documentTitle}</strong>.
            Financial and confidential reports may only be shared by authorized officers.
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const phoneValidation = validateAndFormatWhatsAppNumber(recipientPhone);

  const handleGeneratePDFOnly = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const pdfOptions: PDFGenerationOptions = {
        title: documentTitle,
        subtitle: subtitle || 'Dominion City Asaba — Information Desk Department',
        documentRef: documentRef || `DOC-${Date.now().toString().slice(-6)}`,
        preparedBy: currentUser.name,
        recipientName: recipientName.trim() || undefined,
        isConfidential,
        contentLines,
        tableHeaders,
        tableRows,
        summaryNotes,
      };

      const result = await generateDocumentPDF(pdfOptions);
      setGeneratedPdfBlob(result);
      downloadBlob(result.blob, result.filename);
      setSuccessMsg(`PDF document "${result.filename}" downloaded successfully to your device!`);
    } catch (err: any) {
      console.error('PDF error', err);
      setErrorMsg('Failed to generate PDF document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInitiateWhatsAppShare = async () => {
    if (!phoneValidation.isValid) {
      setErrorMsg(phoneValidation.errorMessage || 'Please enter a valid WhatsApp number.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Generate the actual formatted PDF document
      const pdfOptions: PDFGenerationOptions = {
        title: documentTitle,
        subtitle: subtitle || 'Dominion City Asaba — Information Desk Department',
        documentRef: documentRef || `DOC-${Date.now().toString().slice(-6)}`,
        preparedBy: currentUser.name,
        recipientName: recipientName.trim() || undefined,
        isConfidential,
        contentLines,
        tableHeaders,
        tableRows,
        summaryNotes,
      };

      const { blob, filename } = await generateDocumentPDF(pdfOptions);
      setGeneratedPdfBlob({ blob, filename });

      // 2. Record initial share entry in history with 'Prepared' / 'WhatsApp opened'
      const newEntry = addShareHistoryEntry({
        documentType,
        documentTitle,
        recipientName: recipientName.trim() || 'WhatsApp Contact',
        recipientPhone: phoneValidation.displayFormatted,
        sharedBy: currentUser.name,
        status: 'WhatsApp opened',
        notes: `Prepared official PDF document: ${filename}`,
      });
      setActiveShareId(newEntry.id);
      setCurrentStatus('WhatsApp opened');

      // 3. Try Web Share API with File (Mobile Chrome, Safari, Android)
      const pdfFile = new File([blob], filename, { type: 'application/pdf' });
      const canShareFile =
        navigator.canShare &&
        navigator.canShare({
          files: [pdfFile],
        });

      if (canShareFile) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: documentTitle,
            text: customMessage,
          });
          setIsSharedNative(true);
          updateShareHistoryStatus(newEntry.id, 'Confirmed shared', 'Shared directly via device Web Share sheet');
          setCurrentStatus('Confirmed shared');
          setSuccessMsg('Document shared directly via device share sheet!');
          setIsGenerating(false);
          return;
        } catch (shareErr: any) {
          // If user cancelled, fall through to WhatsApp direct link + download
          console.log('Native share dismissed or not finished, falling back to WhatsApp link');
        }
      }

      // 4. Reliable Web Fallback:
      // Download the PDF file directly to device & open WhatsApp with the recipient
      downloadBlob(blob, filename);

      const waUrl = buildWhatsAppUrl(phoneValidation.cleanE164, customMessage);
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      setSuccessMsg(
        `PDF document "${filename}" downloaded! WhatsApp chat opened with ${phoneValidation.displayFormatted}. Please attach the downloaded PDF in the WhatsApp chat.`
      );
    } catch (err: any) {
      console.error('Sharing error:', err);
      setErrorMsg('Could not prepare document for sharing. Please verify phone number and retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateStatus = (status: ShareStatus) => {
    setCurrentStatus(status);
    if (activeShareId) {
      updateShareHistoryStatus(activeShareId, status);
      setSuccessMsg(`Share status updated to "${status}".`);
    } else {
      // Record a new history entry
      const entry = addShareHistoryEntry({
        documentType,
        documentTitle,
        recipientName: recipientName.trim() || 'WhatsApp Contact',
        recipientPhone: phoneValidation.isValid ? phoneValidation.displayFormatted : recipientPhone,
        sharedBy: currentUser.name,
        status,
        notes: 'Manual status update recorded by user',
      });
      setActiveShareId(entry.id);
      setSuccessMsg(`Recorded in sharing history with status "${status}".`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B1528] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081020]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 shrink-0">
              <Share2 className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                Share Official Document — WhatsApp & PDF
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {documentTitle} {documentRef ? `• Ref: ${documentRef}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          {/* Document Summary Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <FileCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {documentTitle}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {documentType}
                </span>
                {isConfidential && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Confidential
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Generates a formatted Dominion City Asaba A4 PDF document with letterhead, table details, and timestamp.
              </p>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Recipient WhatsApp Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="e.g. 08031234567 or +234 803 123 4567"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                  recipientPhone && !phoneValidation.isValid
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'
                }`}
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                {phoneValidation.isValid ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> WhatsApp format: {phoneValidation.displayFormatted}
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Include country code (+234 for Nigeria)
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Recipient Name / Office
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Pastor In-Charge, Finance Committee"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Recorded in official document sharing tracking history
              </span>
            </div>
          </div>

          {/* Editable WhatsApp Message */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
              WhatsApp Message Preview
            </label>
            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sans"
            />
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-start gap-2 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Share Status Tracking Update Strip */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-500" />
                Sharing History Status
              </span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                Current: {currentStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Opening WhatsApp prepares the document. Once delivered, you can confirm receipt:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {(['Prepared', 'WhatsApp opened', 'Confirmed shared', 'Pending confirmation'] as ShareStatus[]).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(st)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      currentStatus === st
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    {st === 'Confirmed shared' ? '✓ ' : ''}
                    {st}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081020]">
          <button
            type="button"
            onClick={handleGeneratePDFOnly}
            disabled={isGenerating}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Only</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleInitiateWhatsAppShare}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial btn-standard btn-glow-emerald gap-2 font-black shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>{isGenerating ? 'Preparing PDF...' : 'Share Document on WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

