// src/lib/offlineFormatter.ts
export function formatNoteOffline(raw: string): string {
  if (!raw) return "";

  let text = raw.trim();

  // Normalize newlines and remove excessive blank lines
  text = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  // Auto heading detection: more specific for titles
  text = text
    .split("\n")
    .map((line) => {
      const clean = line.trim();
      // Regex to detect potential headings:
      // - Not already a markdown heading
      // - Not a list item
      // - Contains letters
      // - Mostly uppercase, or title case.
      const isHeadingLike =
        !/^#{1,6}\s/.test(clean) &&
        !/^[*-]\s/.test(clean) &&
        !/^\d+\.\s/.test(clean) &&
        /[a-zA-Z]/.test(clean) &&
        clean.length < 80 &&
        (clean.toUpperCase() === clean || /^[A-Z][a-z]/.test(clean));

      if (isHeadingLike) {
        // Check if it's a short line that is not part of a sentence.
        if (clean.length < 50 && !clean.endsWith('.')) {
          return `\n## ${capitalize(clean)}\n`;
        }
      }
      return line;
    })
    .join("\n");

  // Convert numbered list "1." and hyphen/asterisk lists into markdown bullets
  text = text.replace(/^(\s*)\d+\.\s+/gm, "$1- ");
  text = text.replace(/^(\s*)[*]\s+/gm, "$1- ");

  // Collapse repeated blank lines again after transformations
  text = text.replace(/\n{3,}/g, "\n\n");

  // Common pharmacy keyword highlighting (bold) - only if not already bold
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
    // This regex looks for the keyword that is NOT preceded or followed by *
    const regex = new RegExp(`\\b(?<!\\*\\*)(${kw})(?!\\*\\*)\\b`, "gi");
    text = text.replace(regex, (match) => `**${capitalize(match.toLowerCase())}**`);
  });

  return text.trim();
}

function capitalize(s: string) {
  if (!s) return "";
  // Capitalize the first letter of each word
  return s.replace(/\b\w/g, (char) => char.toUpperCase());
}
