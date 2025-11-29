// src/lib/offlineFormatter.ts
export function formatNoteOffline(raw: string): string {
  if (!raw) return "";

  let text = raw.trim();

  // Normalize newlines
  text = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  // Auto heading detection: single-line headings or short lines
  text = text
    .split("\n")
    .map((line) => {
      const clean = line.trim();
      if (
        clean.length > 0 &&
        clean.length <= 45 &&
        /^[A-Za-z0-9 ,\-()']+$/.test(clean) &&
        clean.split(" ").length <= 8 &&
        // avoid converting numbered list items
        !/^\d+\./.test(clean) &&
        // avoid converting lines that already look like markdown headings
        !/^#{1,6}\s+/.test(clean) &&
        // treat short lines as headings
        (clean === clean.toLowerCase() || clean === clean.toUpperCase())
      ) {
        return `\n## ${capitalize(clean)}\n`;
      }
      return line;
    })
    .join("\n");

  // Convert numbered list "1." and hyphen lists into markdown bullets
  text = text.replace(/\n\s*\d+\.\s*/g, "\n- ");
  text = text.replace(/\n\s*[-*]\s*/g, "\n- ");

  // Collapse repeated blank lines to two
  text = text.replace(/\n{3,}/g, "\n\n");

  // Common pharmacy keyword highlighting (bold)
  const keywords = [
    "pharmacology",
    "drug",
    "dosage",
    "mechanism",
    "mnemonic",
    "schedule",
    "toxicity",
    "pharmacokinetics",
    "pharmacodynamics",
    "plasma",
    "absorption",
    "distribution",
    "elimination",
    "GMP",
    "clinical",
  ];

  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    text = text.replace(regex, (match) => `**${capitalize(match.toLowerCase())}**`);
  });

  return text.trim();
}

function capitalize(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
