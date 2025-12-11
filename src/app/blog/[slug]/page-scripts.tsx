'use client';

import { useEffect } from "react";
import { Copy } from "lucide-react";

/* Small client-side helpers for copy/share -- we will use progressive enhancement */
export default function PageScripts() {
  useEffect(() => {
    // add click handler for copy icons (progressive enhancement)
    document.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const target = (e.currentTarget as HTMLElement).dataset.copy;
        if (!target) return;
        try {
          await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${target}`);
          (e.currentTarget as HTMLElement).textContent = "Copied";
          setTimeout(() => {
            const copyButton = document.createElement('div');
            copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 inline-block"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>';
            (e.currentTarget as HTMLElement).innerHTML = '';
            (e.currentTarget as HTMLElement).appendChild(copyButton.firstChild!);
          }, 1200);
        } catch {
          // ignore
        }
      });
    });
  }, []);
  return null;
}
