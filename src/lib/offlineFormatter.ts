
// src/lib/offlineFormatter.ts

function capitalize(s: string) {
  if (!s) return "";
  // Capitalize the first letter of each word
  return s.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatNoteOffline(raw: string): string {
  if (!raw) return "";

  // Pass 1: Clean and Normalize
  let text = raw
    .replace(/\r\n/g, "\n") // Normalize newlines
    .replace(/^[#*-\s]+|[#*-\s]+$/g, "") // Trim markdown-like chars from start/end of entire string
    .trim();

  // Pass 2: Structure (Headings and Lists)
  text = text
    .split("\n")
    .map((line) => {
      let cleanLine = line.trim();

      // Remove any existing/erroneous markdown-like chars from the line itself
      cleanLine = cleanLine.replace(/^[#*-\s]+|[#*-\s]+$/g, "").trim();

      if (cleanLine.length === 0) {
        return ""; // Keep blank lines for separation
      }

      // Heading detection:
      // - Line is short (under 80 chars)
      // - Line is all-caps OR Title Case
      // - Doesn't end with a period (unlikely to be a sentence)
      // - Isn't a numbered list item
      const isHeadingLike =
        cleanLine.length < 80 &&
        (cleanLine.toUpperCase() === cleanLine || /^[A-Z][a-z]/.test(cleanLine)) &&
        !cleanLine.endsWith('.') &&
        !/^\d+\.\s/.test(cleanLine);
      
      if (isHeadingLike) {
        return `\n## ${cleanLine}\n`;
      }
      
      // List detection
      if (/^\d+\.\s/.test(line.trim())) {
        return `- ${line.trim().substring(line.trim().indexOf('.') + 1).trim()}`;
      }
      if (/^[-*]\s/.test(line.trim())) {
        return `- ${line.trim().substring(1).trim()}`;
      }

      return cleanLine;
    })
    .join("\n");
    
  // Pass 3: Sanitize spacing after structural changes
  text = text.replace(/\n{3,}/g, "\n\n").trim();


  // Pass 4: Apply Keyword Bolding
  const keywords = [
    "pharmacology", "drug", "dosage", "mechanism", "mnemonic", "schedule",
    "toxicity", "pharmacokinetics", "pharmacodynamics", "plasma",
    "absorption", "distribution", "elimination", "GMP", "clinical",
  ];

  keywords.forEach((kw) => {
    // Regex to find the keyword not already surrounded by asterisks
    const regex = new RegExp(`\\b(?<!\\*\\*)(${kw})(?!\\*\\*)\\b`, "gi");
    text = text.replace(regex, (match) => `**${capitalize(match)}**`);
  });

  return text;
}
