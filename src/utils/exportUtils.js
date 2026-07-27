import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Utility to export an array of JSON objects to CSV
 * @param {Array} data - Array of objects to be exported
 * @param {Array} columns - Array holding objects with { header: 'Displayed Header', dataKey: 'object_property' }
 * @param {String} filename - Resulting filename
 */
export const exportToCSV = (data, columns, filename) => {
  if (!data || !data.length) return;
  
  // Create CSV String
  const headers = columns.map(col => `"${col.header}"`).join(',');
  const rows = data.map(item => {
    return columns.map(col => {
      let cell = item[col.dataKey] ?? '';
      // Escape inner quotes
      cell = String(cell).replace(/"/g, '""');
      return `"${cell}"`;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Trigger download map
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Utility to export an array of JSON objects to a formatted PDF
 * @param {Array} data - Array of objects to be exported
 * @param {Array} columns - Array holding objects with { header: 'Displayed Header', dataKey: 'object_property' }
 * @param {String} filename - Resulting filename
 * @param {String} title - Heading displayed inside the PDF
 */
export const exportToPDF = (data, columns, filename, title = "Data Export") => {
  if (!data || !data.length) return;
  
  // Initialize PDF in landscape orientation for better table viewing
  const doc = new jsPDF('landscape');
  
  // Inject title
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text(title, 14, 22);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  // Prepare Table Config
  const tableColumnIds = columns.map(c => c.dataKey);
  const tableHeaders = [columns.map(c => c.header)];
  
  const tableRows = data.map(item => {
    return tableColumnIds.map(key => item[key] ?? 'N/A');
  });
  
  autoTable(doc, {
    head: tableHeaders,
    body: tableRows,
    startY: 35,
    theme: 'grid',
    styles: {
      fontSize: 9,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });
  
  doc.save(`${filename}.pdf`);
};
