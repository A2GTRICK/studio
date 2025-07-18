
import { FileText, BookCopy, ScrollText, User, PenTool, Presentation } from 'lucide-react';

export const services = [
  {
    icon: FileText,
    title: "Internship Reports",
    slug: "internship-reports",
    category: "Report Writing",
    description: "Professionally crafted internship reports that meet academic standards and impress your evaluators.",
    target: "B.Pharm & D.Pharm Students",
    link: "/services/internship-reports",
    price: "₹1,499",
    imageUrl: "https://placehold.co/600x800.png",
    dataAiHint: "student report",
    features: [
        "Structured according to university guidelines",
        "Plagiarism-free content",
        "Proper formatting and citation",
        "Includes all necessary sections"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello,

I'm interested in your Internship Report service. Please provide a quote based on the following details:

- Course: [e.g., B.Pharm]
- Year/Semester: [e.g., 4th Year]
- University/College: [Your University Name]
- Internship Field: [e.g., Hospital, Industry]
- Report Deadline: [Date]
- Any specific requirements or guidelines: [Please describe]

Thank you!`
  },
  {
    icon: BookCopy,
    title: "Dissertation Support",
    slug: "dissertation-support",
    category: "Research Support",
    description: "End-to-end support for your M.Pharm dissertation, from topic selection to final submission.",
    target: "M.Pharm Students",
    link: "/services/dissertation-support",
    price: "₹9,999",
    imageUrl: "https://placehold.co/600x800.png",
    dataAiHint: "research science",
    features: [
        "Research topic assistance",
        "Methodology design",
        "Data analysis and interpretation",
        "Full report writing and proofreading"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello,

I'm interested in your Dissertation Support service for my M.Pharm. Please provide a quote.

- Specialization: [e.g., Pharmaceutics, Pharmacology]
- Research Area/Topic (if decided): [Your Topic]
- Current Stage: [e.g., Topic Selection, Data Collection, Writing]
- University: [Your University Name]
- Specific support needed: [e.g., Full support, Data analysis, Writing only]

Thank you!`
  },
  {
    icon: ScrollText,
    title: "Synopsis Writing",
    slug: "synopsis-writing",
    category: "Research Support",
    description: "Concise and compelling synopsis writing for your research proposals that gets approved.",
    target: "PG & PhD Aspirants",
    link: "/services/synopsis-writing",
    price: "₹2,499",
    imageUrl: "https://placehold.co/600x800.png",
    dataAiHint: "document writing",
    features: [
        "Clear problem statement",
        "Well-defined objectives",
        "Sound methodology outline",
        "Adherence to format"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello,

I'm interested in your Synopsis Writing service. Please provide a quote.

- Course: [e.g., M.Pharm, PhD]
- Field of Research: [e.g., Medicinal Chemistry]
- Proposed Title/Area: [Your Research Idea]
- University/Funding Body: [Name]
- Any specific formatting guidelines?: [Yes/No, please specify]

Thank you!`
  },
  {
    icon: User,
    title: "Resume/SOP Crafting",
    slug: "resume-sop",
    category: "Career Development",
    description: "Build a powerful resume and statement of purpose that helps you stand out to recruiters and universities.",
    target: "Graduates & Job Seekers",
    link: "/services/resume-sop",
    price: "₹999",
    imageUrl: "https://placehold.co/600x800.png",
    dataAiHint: "professional resume",
    features: [
        "ATS-friendly resume design",
        "Highlighting key skills and achievements",
        "Persuasive Statement of Purpose (SOP)",
        "Cover letter writing"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello,

I'm interested in your Resume/SOP Crafting service.

- Service Needed: [Resume, SOP, or both]
- Target: [e.g., Job application for 'Role' at 'Company', Master's application at 'University']
- Field: [e.g., Quality Assurance, Clinical Research]
- Please attach my current resume (if any).

Thank you!`
  },
  {
    icon: PenTool,
    title: "Content Writing",
    slug: "content-writing",
    category: "Report Writing",
    description: "High-quality academic and scientific content writing for articles, blogs, and other publications.",
    target: "All Health Science Students",
    link: "/services/content-writing",
    price: "Contact Us",
    imageUrl: "https://placehold.co/600x800.png",
    dataAiHint: "typing keyboard",
    features: [
        "Well-researched articles",
        "SEO-optimized content for blogs",
        "Medical and pharmaceutical topics",
        "Proofreading and editing services"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello,

I'm interested in your Content Writing service. Please provide a quote.

- Type of Content: [e.g., Blog Post, Research Article, Review Article]
- Topic: [Your Topic]
- Approximate Word Count: [Number of words]
- Target Audience: [e.g., General public, Healthcare professionals]
- Deadline: [Date]

Thank you!`
  },
  {
    icon: Presentation,
    title: "Presentation Design",
    slug: "presentation-design",
    category: "Academic Projects",
    description: "Visually stunning and informative presentations for your seminars, projects, and defenses.",
    target: "All Students",
    link: "/services/presentation-design",
    price: "₹1,999",
    imageUrl: "https://placehold.co/600x800.png",
    dataAiHint: "business presentation",
    features: [
        "Professional slide design",
        "Clear data visualization (charts, graphs)",
        "Engaging content structure",
        "Speaker notes preparation"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello,

I'm interested in your Presentation Design service. Please provide a quote.

- Presentation Topic: [Your Topic]
- Number of Slides (approx): [Number]
- Event: [e.g., Class Seminar, Final Defense, Conference]
- Do you have the content ready?: [Yes/No]
- Deadline: [Date]

Thank you!`
  }
];
