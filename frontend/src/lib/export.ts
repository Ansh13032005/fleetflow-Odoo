/**
 * Shared export utilities: CSV download and PDF (via print dialog).
 */

export function exportCSV(
  rows: Record<string, string | number>[],
  filename: string,
  headers?: string[]
): void {
  const hdrs = headers ?? (rows.length > 0 ? Object.keys(rows[0]) : []);
  if (hdrs.length === 0) return;
  const csv = [
    hdrs.join(','),
    ...rows.map((r) => hdrs.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Open a print-friendly window with a table; user can choose "Save as PDF" in the print dialog.
 */
export function exportPDF(
  title: string,
  headers: string[],
  rows: Record<string, string | number>[],
  filenameBase: string
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to export as PDF.');
    return;
  }
  const ths = headers.map((h) => `<th style="text-align:left;padding:8px;border:1px solid #ddd;">${escapeHtml(h)}</th>`).join('');
  const trs =
    rows.length === 0
      ? '<tr><td colspan="' + headers.length + '" style="padding:12px;color:#666;">No data</td></tr>'
      : rows
          .map(
            (r) =>
              '<tr>' +
              headers.map((h) => `<td style="padding:8px;border:1px solid #ddd;">${escapeHtml(String(r[h] ?? ''))}</td>`).join('') +
              '</tr>'
          )
          .join('');
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 1.25rem; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; }
    th { background: #f5f5f5; font-weight: 600; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p style="color:#666;font-size:12px;">Generated on ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table>
  <script>
    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
  </script>
</body>
</html>`;
  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
