
import type { RefObject } from 'react';

/**
 * Handles printing the content of a given React ref object.
 * This function opens a new window, copies stylesheets, injects the content,
 * and triggers the browser's print dialog.
 *
 * @param contentRef - A React RefObject pointing to the HTMLElement to be printed.
 */
export function handlePrint(contentRef: RefObject<HTMLElement>) {
  const content = contentRef.current;
  if (!content) {
    console.error("Print Error: The content reference is not available.");
    return;
  }

  const printWindow = window.open('', '', 'height=800,width=800');

  if (printWindow) {
    printWindow.document.write('<html><head><title>Print Notes</title>');

    // 1. Copy all stylesheets from the main document to the print window.
    const styles = Array.from(document.styleSheets)
      .map(s => (s.href ? `<link rel="stylesheet" href="${s.href}">` : ''))
      .join('');
    printWindow.document.write(styles);

    // 2. Add specific print styles to hide UI elements.
    printWindow.document.write(`
      <style>
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-hide {
            display: none !important;
          }
        }
      </style>
    `);

    printWindow.document.write('</head><body>');
    
    // 3. Write the actual content into the new window's body.
    printWindow.document.write(content.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // 4. Wait for content to load, then trigger the print dialog.
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } else {
    console.error("Print Error: Could not open a new window. Please check pop-up settings.");
  }
}
