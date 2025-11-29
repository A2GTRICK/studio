// -------------------------------------------------------------
// PREMIUM OFFLINE NOTE FORMATTER
// Automatically converts raw text → academic, clean, structured
// -------------------------------------------------------------

export function formatOfflineNotes(input: string): string {
  if (!input.trim()) return "";

  let text = input;

  // Normalize spacing
  text = text.replace(/\r/g, "");
  text = text.replace(/\n{3,}/g, "\n\n");

  // Remove symbols like ##, ** **, emojis, unnecessary decorations
  text = text.replace(/[*#_~`]+/g, "");
  text = text.replace(/[•●■▪🔹👉➡️⭐🌟💊📌🔥]+/g, "");

  // Auto heading identification
  text = text.replace(
    /^([A-Z][A-Za-z0-9 ,:()/-]{5,})$/gm,
    (match) => `## ${match.trim()}`
  );

  // Auto subheading identification
  text = text.replace(
    /^(\d+\. ?[A-Za-z].{3,})$/gm,
    (match) => `### ${match.trim()}`
  );

  // Ensure paragraphs spaced properly
  text = text.replace(/\n([A-Za-z])/g, "\n\n$1");

  // Clean repeated spaces
  text = text.replace(/ {2,}/g, " ");

  // Capitalize first letter properly
  text = text
    .split("\n")
    .map((line) => {
      if (line.startsWith("##") || line.startsWith("###")) return line.trim();
      return line.charAt(0).toUpperCase() + line.slice(1);
    })
    .join("\n");

  return text.trim();
}
