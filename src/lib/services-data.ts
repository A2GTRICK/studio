
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
    price: "INR 1,499",
    dataAiHint: "pharmacy student writing report",
    features: [
        "Structured according to university guidelines",
        "Plagiarism-free content",
        "Proper formatting and citation",
        "Includes all necessary sections"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello A2G Smart Notes Team,

I'm interested in your Internship Report service. Please provide a quote.

To help you with the quote, here are my details:
- Course: [e.g., B.Pharm, D.Pharm]
- Year/Semester: [e.g., 4th Year, 1st Year]
- University/College: [Your University Name]
- Internship Field: [e.g., Hospital, Industry, Community]
- Report Deadline: [Date]
- Specific Requirements: [Please describe any specific guidelines or requirements here]

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
    price: "INR 9,999",
    dataAiHint: "pharmaceutical lab research",
    features: [
        "Research topic assistance",
        "Methodology design",
        "Data analysis and interpretation",
        "Full report writing and proofreading"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello A2G Smart Notes Team,

I am writing to request a quote for your Dissertation Support service for my M.Pharm program.

Please find my details below for an accurate estimate:
- Specialization: [e.g., Pharmaceutics, Pharmacology, Medicinal Chemistry]
- Research Area/Topic (if decided): [Your Topic or Area of Interest]
- Current Stage: [e.g., Topic Selection, Methodology, Data Collection, Writing]
- University: [Your University Name]
- Specific Support Needed: [e.g., Full End-to-End Support, Data Analysis Only, Writing & Formatting]
- Project Deadline: [Date]

I look forward to hearing from you.

Thank you.`
  },
  {
    icon: ScrollText,
    title: "Synopsis Writing",
    slug: "synopsis-writing",
    category: "Research Support",
    description: "Concise and compelling synopsis writing for your research proposals that gets approved.",
    target: "PG & PhD Aspirants",
    link: "/services/synopsis-writing",
    price: "INR 2,499",
    dataAiHint: "academic document writing",
    features: [
        "Clear problem statement",
        "Well-defined objectives",
        "Sound methodology outline",
        "Adherence to format"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello A2G Smart Notes Team,

I would like to inquire about your Synopsis Writing service.

Here are the project details:
- Course: [e.g., M.Pharm, PhD]
- Field of Research: [e.g., Medicinal Chemistry, Pharmaceutics]
- Proposed Research Title/Area: [Your Research Idea]
- University/Funding Body: [Name of Institution]
- Formatting Guidelines (if any): [Please specify or attach]

Could you please provide a quote and an estimated timeline for completion?

Thank you.`
  },
  {
    icon: User,
    title: "Resume/SOP Crafting",
    slug: "resume-sop",
    category: "Career Development",
    description: "Build a powerful resume and statement of purpose that helps you stand out to recruiters and universities.",
    target: "Graduates & Job Seekers",
    link: "/services/resume-sop",
    price: "INR 999",
    dataAiHint: "professional resume document",
    features: [
        "ATS-friendly resume design",
        "Highlighting key skills and achievements",
        "Persuasive Statement of Purpose (SOP)",
        "Cover letter writing"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello A2G Smart Notes Team,

I'm interested in your Resume/SOP Crafting service.

- Service Needed: [Resume, SOP, Cover Letter, or a package]
- My Goal: [e.g., Job application for 'Role' at 'Company', Master's application at 'University']
- My Field/Specialization: [e.g., Quality Assurance, Clinical Research, Industrial Pharmacy]
- Additional Info: [Please attach your current resume if you have one, or mention any other relevant details.]

Could you please confirm the next steps and provide a quote?

Thank you.`
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
    dataAiHint: "person typing on laptop",
    features: [
        "Well-researched articles",
        "SEO-optimized content for blogs",
        "Medical and pharmaceutical topics",
        "Proofreading and editing services"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello A2G Smart Notes Team,

I would like a quote for your professional Content Writing service.

Here are the details of my request:
- Type of Content: [e.g., Blog Post, Research Article, Review Article, Website Content]
- Topic: [Your Topic]
- Approximate Word Count: [Number of words]
- Target Audience: [e.g., General public, Healthcare professionals, Students]
- Deadline: [Date]
- Keywords or Specific Instructions: [Please provide any relevant details]

Thank you.`
  },
  {
    icon: Presentation,
    title: "Presentation Design",
    slug: "presentation-design",
    category: "Academic Projects",
    description: "Visually stunning and informative presentations for your seminars, projects, and defenses.",
    target: "All Students",
    link: "/services/presentation-design",
    price: "INR 1,999",
    dataAiHint: "professional slide presentation",
    features: [
        "Professional slide design",
        "Clear data visualization (charts, graphs)",
        "Engaging content structure",
        "Speaker notes preparation"
    ],
    sampleUrl: "/assets/sample-report.pdf",
    emailBody: `Hello A2G Smart Notes Team,

I am interested in your Presentation Design service.

Please provide a quote based on my project details below:
- Presentation Topic: [Your Topic]
- Number of Slides: [Approximate number, e.g., 15-20]
- Event/Purpose: [e.g., Class Seminar, Final Defense, Conference]
- Content Status: [e.g., Yes, I have the full content; No, I need help with content]
- Deadline: [Date]

Thank you!`
  }
];
