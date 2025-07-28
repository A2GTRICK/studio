
/**
 * @fileoverview This file centralizes the configuration for marketing assets and links.
 * To add, remove, or update the files shared with users, simply edit the 'marketingLinks' array below.
 *
 * Instructions:
 * 1. Upload your file to a service like Google Drive or any direct download link provider.
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
    url: "https://docs.google.com/document/d/1gQ5Zf9vX-J7z8a2uB_qA8r4nN_wE9pT0/export?format=pdf",
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
