
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

  // Create an iframe to isolate the print content.
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const printWindow = iframe.contentWindow;

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write('<html><head><title>Print Notes</title>');

    // 1. Copy all stylesheets from the main document to the print window.
    Array.from(document.styleSheets).forEach(sheet => {
      if (sheet.href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = sheet.href;
        printWindow.document.head.appendChild(link);
      } else if (sheet.cssRules) {
        const style = document.createElement('style');
        style.textContent = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        printWindow.document.head.appendChild(style);
      }
    });

    // 2. Add specific print styles to hide UI elements.
    const printStyles = document.createElement('style');
    printStyles.textContent = `
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-hide { display: none !important; }
        }
    `;
    printWindow.document.head.appendChild(printStyles);

    printWindow.document.write('</head><body>');
    
    // 3. Write the actual content into the new window's body.
    printWindow.document.write(content.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // 4. Wait for content to load, then trigger the print dialog.
    const handleLoad = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (e) {
        console.error("Failed to print.", e);
      } finally {
        document.body.removeChild(iframe);
      }
    };
    
    if (printWindow.document.readyState === 'complete') {
        handleLoad();
    } else {
        iframe.onload = handleLoad;
    }

  } else {
    console.error("Print Error: Could not open a new window. Please check pop-up settings.");
    document.body.removeChild(iframe);
  }
}
