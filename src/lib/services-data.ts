
import { FileText, BookCopy, ScrollText, User, PenTool, Presentation } from 'lucide-react';

const createEmailBody = (serviceDetails: string) => {
  const template = `Hello A2G Smart Notes Team,

I hope you are doing well.

I am writing to inquire about your academic writing services. Please find my project details below:

${serviceDetails}

Kindly let me know the estimated cost and turnaround time for this project.

Thank you for your consideration.

Best regards,

[Your Full Name]
[Your Contact Number - Optional]
`;
  return encodeURIComponent(template);
};

const servicesList = [
  {
    icon: FileText,
    title: "Internship Reports",
    slug: "internship-reports",
    category: "Report Writing",
    description: "Professionally crafted internship reports that meet academic standards and impress your evaluators.",
    target: "B.Pharm & D.Pharm Students",
    price: "INR 1,499",
    dataAiHint: "pharmacy student writing report",
    features: [
        "Structured according to university guidelines",
        "Plagiarism-free content",
        "Proper formatting and citation",
        "Includes all necessary sections"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: createEmailBody(
`• Service Required: Internship Report
• Course: [e.g., B.Pharm, D.Pharm]
• University: [Your University Name]
• Internship Field: [e.g., Hospital, Industry]
• Deadline: [DD-MM-YYYY]
• Specific Requirements: [Any specific guidelines]`
    )
  },
  {
    icon: BookCopy,
    title: "Dissertation Support",
    slug: "dissertation-support",
    category: "Research Support",
    description: "End-to-end support for your M.Pharm dissertation, from topic selection to final submission.",
    target: "M.Pharm Students",
    price: "INR 9,999",
    dataAiHint: "pharmaceutical lab research",
    features: [
        "Research topic assistance",
        "Methodology design",
        "Data analysis and interpretation",
        "Full report writing and proofreading"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: createEmailBody(
`• Service Required: Dissertation Support
• Specialization: [e.g., Pharmaceutics, Pharmacology]
• Research Topic: [Your Topic or Area of Interest]
• University: [Your University Name]
• Deadline: [DD-MM-YYYY]`
    )
  },
  {
    icon: ScrollText,
    title: "Synopsis Writing",
    slug: "synopsis-writing",
    category: "Research Support",
    description: "Concise and compelling synopsis writing for your research proposals that gets approved.",
    target: "PG & PhD Aspirants",
    price: "INR 2,499",
    dataAiHint: "academic document writing",
    features: [
        "Clear problem statement",
        "Well-defined objectives",
        "Sound methodology outline",
        "Adherence to format"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: createEmailBody(
`• Service Required: Synopsis Writing
• Course: [e.g., M.Pharm, PhD]
• Field of Research: [Your Field]
• Proposed Title: [Your Proposed Research Title]`
    )
  },
  {
    icon: User,
    title: "Resume/SOP Crafting",
    slug: "resume-sop",
    category: "Career Development",
    description: "Build a powerful resume and statement of purpose that helps you stand out to recruiters and universities.",
    target: "Graduates & Job Seekers",
    price: "INR 999",
    dataAiHint: "professional resume document",
    features: [
        "ATS-friendly resume design",
        "Highlighting key skills and achievements",
        "Persuasive Statement of Purpose (SOP)",
        "Cover letter writing"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: createEmailBody(
`• Service Required: [Resume, SOP, or Both]
• My Goal: [e.g., Job application for 'Pharmacist']
• Field/Specialization: [e.g., Quality Assurance]
• Note: [Please attach your current resume if available]`
    )
  },
  {
    icon: PenTool,
    title: "Content Writing",
    slug: "content-writing",
    category: "Report Writing",
    description: "High-quality academic and scientific content writing for articles, blogs, and other publications.",
    target: "All Health Science Students",
    price: "Contact Us",
    dataAiHint: "person typing on laptop",
    features: [
        "Well-researched articles",
        "SEO-optimized content for blogs",
        "Medical and pharmaceutical topics",
        "Proofreading and editing services"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: createEmailBody(
`• Service Required: Content Writing
• Type of Content: [e.g., Blog Post, Research Article]
• Topic: [Your Topic]
• Word Count: [Approximate word count]`
    )
  },
  {
    icon: Presentation,
    title: "Presentation Design",
    slug: "presentation-design",
    category: "Academic Projects",
    description: "Visually stunning and informative presentations for your seminars, projects, and defenses.",
    target: "All Students",
    price: "INR 1,999",
    dataAiHint: "professional slide presentation",
    features: [
        "Professional slide design",
        "Clear data visualization (charts, graphs)",
        "Engaging content structure",
        "Speaker notes preparation"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: createEmailBody(
`• Service Required: Presentation Design
• Topic: [Your Presentation Topic]
• Number of Slides: [e.g., 15-20]
• Event/Purpose: [e.g., Class Seminar, Final Defense]`
    )
  }
];

export const services = servicesList.map(service => ({
  ...service,
  link: `/services/${service.slug}`,
}));
