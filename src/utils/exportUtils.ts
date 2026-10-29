/**
 * CSV and Tabular Export utilities for Dominion City Asaba Information Desk
 */

export interface ExportColumn<T> {
  key: keyof T;
  header: string;
  format?: (val: any) => string;
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: ExportColumn<T>[]
) {
  if (!data || data.length === 0) {
    alert('No records available to export.');
    return;
  }

  // Derive columns if not explicitly provided
  const cols: ExportColumn<T>[] =
    columns ||
    (Object.keys(data[0]) as (keyof T)[]).map((key) => ({
      key,
      header: String(key),
    }));

  // Header row
  const headers = cols.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');

  // Data rows
  const rows = data.map((item) => {
    return cols
      .map((col) => {
        let value: any = item[col.key];
        if (col.format) {
          value = col.format(value);
        } else if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = [headers, ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
