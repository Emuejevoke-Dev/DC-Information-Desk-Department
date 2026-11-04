/**
 * Global Document & Report Sharing Utilities
 * Dominion City Asaba — Information Desk Department
 * 
 * Implements WhatsApp link preparation, telephone validation (E.164),
 * jsPDF document generation, and Web Share API with file attachments.
 */

import { jsPDF } from 'jspdf';

export interface PhoneValidationResult {
  isValid: boolean;
  cleanE164: string;
  displayFormatted: string;
  errorMessage?: string;
}

/**
 * Validates and formats international and Nigerian phone numbers for WhatsApp
 * Supports formats: 08012345678, +234 801 234 5678, 2348012345678, international with +
 */
export function validateAndFormatWhatsAppNumber(rawPhone: string): PhoneValidationResult {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      isValid: false,
      cleanE164: '',
      displayFormatted: '',
      errorMessage: 'Please enter a WhatsApp phone number with country code.',
    };
  }

  // Remove whitespace, dashes, parentheses
  let digitsOnly = rawPhone.trim().replace(/[^0-9+]/g, '');

  // Strip leading plus for processing
  if (digitsOnly.startsWith('+')) {
    digitsOnly = digitsOnly.slice(1);
  }

  // Standard Nigerian 11-digit format starting with '0' (e.g. 08031234567)
  if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    digitsOnly = '234' + digitsOnly.slice(1);
  } else if (digitsOnly.length === 10 && (digitsOnly.startsWith('7') || digitsOnly.startsWith('8') || digitsOnly.startsWith('9'))) {
    // 10 digits without leading 0 for Nigeria
    digitsOnly = '234' + digitsOnly;
  }

  // Validate length (WhatsApp E.164 international numbers are typically 10 to 15 digits)
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return {
      isValid: false,
      cleanE164: '',
      displayFormatted: rawPhone,
      errorMessage: 'Invalid phone number length. Include international country code (e.g. 2348031234567).',
    };
  }

  return {
    isValid: true,
    cleanE164: digitsOnly,
    displayFormatted: `+${digitsOnly}`,
  };
}

/**
 * Builds WhatsApp direct chat URL
 */
export function buildWhatsAppUrl(cleanPhone: string, message: string): string {
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export interface PDFGenerationOptions {
  title: string;
  subtitle?: string;
  documentRef?: string;
  preparedBy?: string;
  recipientName?: string;
  isConfidential?: boolean;
  contentLines?: string[];
  tableHeaders?: string[];
  tableRows?: string[][];
  summaryNotes?: string;
}

/**
 * Generates an official Dominion City Asaba A4 PDF document using jsPDF
 */
export async function generateDocumentPDF(
  options: PDFGenerationOptions
): Promise<{ blob: Blob; filename: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let currentY = margin;

  // Header Bar (Navy Accent)
  doc.setFillColor(11, 29, 66); // #0B1D42
  doc.rect(0, 0, pageWidth, 6, 'F');

  currentY += 8;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 29, 66);
  doc.text('DOMINION CITY ASABA', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Information Desk Department — Official Record', margin, currentY + 4);

  // Document Reference & Date (Right-aligned)
  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${todayStr}`, pageWidth - margin, currentY, { align: 'right' });
  if (options.documentRef) {
    doc.text(`Ref: ${options.documentRef}`, pageWidth - margin, currentY + 4, { align: 'right' });
  }

  currentY += 12;

  // Decorative Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 8;

  // Confidentiality Badge if applicable
  if (options.isConfidential) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(252, 165, 165);
    doc.roundedRect(margin, currentY - 3, 50, 6, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(185, 28, 28);
    doc.text('CONFIDENTIAL / OFFICIAL', margin + 3, currentY + 1.2);
    currentY += 8;
  }

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(options.title, pageWidth - margin * 2);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 5.5 + 2;

  if (options.subtitle) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const subLines = doc.splitTextToSize(options.subtitle, pageWidth - margin * 2);
    doc.text(subLines, margin, currentY);
    currentY += subLines.length * 4.5 + 3;
  }

  // Metadata Strip
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 10, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Prepared By: ${options.preparedBy || 'Information Desk Minister'}`, margin + 3, currentY + 6.5);
  if (options.recipientName) {
    doc.text(`Recipient: ${options.recipientName}`, pageWidth - margin - 3, currentY + 6.5, { align: 'right' });
  }

  currentY += 16;

  // Content Lines
  if (options.contentLines && options.contentLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    for (const line of options.contentLines) {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = margin + 10;
      }

      if (line.startsWith('# ')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        currentY += 2;
        doc.text(line.replace('# ', ''), margin, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
      } else if (line.startsWith('## ')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        currentY += 1.5;
        doc.text(line.replace('## ', ''), margin, currentY);
        currentY += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
      } else {
        const wrapped = doc.splitTextToSize(line, pageWidth - margin * 2);
        doc.text(wrapped, margin, currentY);
        currentY += wrapped.length * 4.5 + 1.5;
      }
    }
  }

  // Simple Table Layout if provided
  if (options.tableHeaders && options.tableRows && options.tableRows.length > 0) {
    currentY += 4;
    const colCount = options.tableHeaders.length;
    const colWidth = (pageWidth - margin * 2) / colCount;

    // Header Row
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, pageWidth - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    options.tableHeaders.forEach((header, i) => {
      doc.text(header, margin + i * colWidth + 2, currentY + 4.8);
    });

    currentY += 7;

    // Table Data Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    options.tableRows.forEach((row, rowIdx) => {
      if (currentY > pageHeight - 25) {
        doc.addPage();
        currentY = margin + 10;
      }

      if (rowIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, currentY, pageWidth - margin * 2, 6, 'F');
      }

      row.forEach((cell, i) => {
        const cellText = doc.splitTextToSize(String(cell || ''), colWidth - 4);
        doc.text(cellText[0] || '', margin + i * colWidth + 2, currentY + 4.2);
      });

      currentY += 6;
    });
  }

  // Summary / Footer Notes
  if (options.summaryNotes) {
    currentY += 6;
    if (currentY > pageHeight - 35) {
      doc.addPage();
      currentY = margin + 10;
    }
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 14, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(options.summaryNotes, pageWidth - margin * 2 - 6);
    doc.text(summaryLines, margin + 3, currentY + 5.5);
    currentY += 18;
  }

  // Bottom Sign-off & Page Number
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(
      'Dominion City Asaba — Cathedral, Km 2 Benin-Asaba Express, Summit Junction',
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const cleanFilename = `${(options.title || 'Report')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 30)}_${Date.now()}.pdf`;

  const blob = doc.output('blob');
  return { blob, filename: cleanFilename };
}

/**
 * Downloads a Blob directly to the user's device
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
