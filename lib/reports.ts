import ExcelJS from 'exceljs';

/**
 * Report Export Helpers (CSV, PDF text, XLSX data formatters)
 */

export function generateCSV(headers: string[], rows: (string | number)[][]): string {
  const headerRow = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
  const dataRows = rows
    .map((row) =>
      row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');
  return `${headerRow}\n${dataRows}`;
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = generateCSV(headers, rows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadPDF(title: string, headers: string[], rows: (string | number)[][]) {
  const textContent = `${title.toUpperCase()}\n${'='.repeat(title.length)}\nGenerated: ${new Date().toLocaleString()}\n\n` +
    headers.join(' | ') + '\n' +
    '-'.repeat(80) + '\n' +
    rows.map((r) => r.join(' | ')).join('\n');

  const blob = new Blob([textContent], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_report.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadXLSX(filename: string, headers: string[], rows: (string | number)[][]) {
  const tsvContent = headers.join('\t') + '\n' + rows.map((r) => r.join('\t')).join('\n');
  const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface ExcelSheetData {
  sheetName: string;
  headers: string[];
  rows: (string | number)[][];
}

export async function downloadMultiSheetExcel(filename: string, sheets: ExcelSheetData[]) {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach((sheet) => {
    const cleanSheetName = (sheet.sheetName || 'Sheet')
      .replace(/[\\/?*:[\]]/g, '')
      .trim()
      .substring(0, 31);

    const worksheet = workbook.addWorksheet(cleanSheetName || 'Event Registrations');

    worksheet.addRow(sheet.headers);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0078D4' },
    };

    sheet.rows.forEach((r) => worksheet.addRow(r));

    worksheet.columns.forEach((column) => {
      let maxLen = 12;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const cellLen = cell.value ? String(cell.value).length : 0;
        if (cellLen > maxLen) maxLen = Math.min(cellLen, 50);
      });
      column.width = maxLen + 2;
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
