
/**
 * @fileoverview This file centralizes the configuration for marketing assets and links.
 * To add, remove, or update the files shared with users, simply edit the 'marketingLinks' array below.
 *
 * Instructions:
 * 1. Upload your file to a service like Google Drive.
 * 2. Make sure the file's sharing setting is set to "Anyone with the link can view".
 * 3. Add a new object to the array with a title and the public URL of your file.
 *
 * The FIRST item in this list is always used as the default lead magnet for new newsletter subscribers.
 */

interface MarketingLink {
  title: string;
  url: string;
}

export const marketingLinks: MarketingLink[] = [
  {
    title: "Top 20 Most Asked Pharmacology Questions",
    url: "https://drive.google.com/file/d/1N-YTeLQXYGv8yShWsZDh6y_ETkg9WJRi/view?usp=drivesdk",
  },
  {
    title: "GPAT 2024 Syllabus Overview",
    url: "https://www.example.com/gpat-syllabus.pdf", // Example link
  },
   {
    title: "Key Concepts in Pharmaceutics",
    url: "https://www.example.com/pharmaceutics-concepts.pdf", // Example link
  }
];
