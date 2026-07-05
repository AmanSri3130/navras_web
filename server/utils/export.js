const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Navras brand colors
const MAROON = '4A121A';
const GOLD = 'C5A880';
const CREAM = 'FCF9F2';

/**
 * Styled Excel workbook helper
 */
const createStyledWorkbook = (sheetName, columns, rows) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Navras Admin';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName, {
    pageSetup: { fitToPage: true, orientation: 'landscape' }
  });

  // Header row
  sheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }));

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MAROON } };
    cell.font = { bold: true, color: { argb: 'FFFCF9F2' }, size: 11, name: 'Calibri' };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      bottom: { style: 'medium', color: { argb: GOLD } }
    };
  });

  // Add data rows
  rows.forEach((row, i) => {
    const dataRow = sheet.addRow(row);
    dataRow.height = 22;
    const fill = i % 2 === 0 
      ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
      : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8F0' } };
    dataRow.eachCell(cell => {
      cell.fill = fill;
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5D9C8' } } };
    });
  });

  // Freeze header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  return workbook;
};

/**
 * Generate PDF with styled table
 */
const generatePDF = (res, title, columns, rows) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
  doc.pipe(res);

  // Header band
  doc.rect(0, 0, doc.page.width, 70).fill('#4A121A');
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#FCF9F2')
    .text('navras', 40, 15);
  doc.fontSize(8).font('Helvetica').fillColor('#C5A880')
    .text('CULTURAL MEHFILS — ADMIN EXPORT', 40, 40);
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#FCF9F2')
    .text(title.toUpperCase(), 200, 25, { align: 'center' });
  doc.fontSize(8).fillColor('#C5A880')
    .text(`Generated: ${new Date().toLocaleString('en-IN')}`, 40, 55);

  doc.moveDown(3);

  // Column widths
  const pageWidth = doc.page.width - 80;
  const colWidth = pageWidth / columns.length;
  let y = 90;

  // Table header
  doc.rect(40, y, pageWidth, 22).fill('#4A121A');
  columns.forEach((col, i) => {
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#FCF9F2')
      .text(col.header, 40 + i * colWidth + 4, y + 6, { width: colWidth - 8, ellipsis: true });
  });
  y += 22;

  // Table rows
  rows.forEach((row, rowIdx) => {
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 40;
    }
    const bg = rowIdx % 2 === 0 ? '#FFFFFF' : '#FFF8F0';
    doc.rect(40, y, pageWidth, 20).fill(bg);
    columns.forEach((col, i) => {
      const val = String(row[col.key] ?? '');
      doc.fontSize(7).font('Helvetica').fillColor('#2C2C2C')
        .text(val, 40 + i * colWidth + 4, y + 5, { width: colWidth - 8, ellipsis: true });
    });
    // bottom border
    doc.moveTo(40, y + 20).lineTo(40 + pageWidth, y + 20).strokeColor('#E5D9C8').lineWidth(0.5).stroke();
    y += 20;
  });

  // Footer
  doc.rect(0, doc.page.height - 30, doc.page.width, 30).fill('#4A121A');
  doc.fontSize(7).fillColor('#C5A880')
    .text('© Navras Cultural Platform — Confidential Admin Report', 40, doc.page.height - 18);

  doc.end();
};

module.exports = { createStyledWorkbook, generatePDF };
