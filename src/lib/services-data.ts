
import { FileText, BookCopy, ScrollText, User, PenTool, Presentation } from 'lucide-react';

const professionalEmailHeader = "Hello A2G Smart Notes Team,%0D%0A%0D%0AI would like to inquire about your professional academic service.%0D%0A%0D%0A--- My Project Details ---%0D%0A";
const professionalEmailFooter = "%0D%0A------------------------%0D%0A%0D%0AThank you,%0D%0A[Your Name]";

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
    emailBody: `${professionalEmailHeader}` +
               `Service: Internship Report%0D%0A` +
               `Course: [e.g., B.Pharm, D.Pharm]%0D%0A` +
               `University/College: [Your University Name]%0D%0A` +
               `Internship Field: [e.g., Hospital, Industry]%0D%0A` +
               `Deadline: [Date]%0D%0A` +
               `Specific Requirements: [Any specific guidelines? Please describe here.]%0D%0A` +
               `${professionalEmailFooter}`
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
    emailBody: `${professionalEmailHeader}` +
               `Service: Dissertation Support%0D%0A` +
               `Specialization: [e.g., Pharmaceutics, Pharmacology]%0D%0A` +
               `Research Topic/Area: [Your Topic or Area of Interest]%0D%0A` +
               `University: [Your University Name]%0D%0A` +
               `Deadline: [Date]%0D%0A` +
               `${professionalEmailFooter}`
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
    emailBody: `${professionalEmailHeader}` +
               `Service: Synopsis Writing%0D%0A` +
               `Course: [e.g., M.Pharm, PhD]%0D%0A` +
               `Field of Research: [Your Field]%0D%0A` +
               `Proposed Research Title: [Your Research Idea]%0D%0A` +
               `Formatting Guidelines: [Any specific guidelines? Please specify]%0D%0A` +
               `${professionalEmailFooter}`
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
    emailBody: `${professionalEmailHeader}` +
               `Service: [Resume, SOP, or Both]%0D%0A` +
               `My Goal: [e.g., Job application for 'Role' at 'Company']%0D%0A` +
               `Field/Specialization: [e.g., Quality Assurance, Clinical Research]%0D%0A` +
               `Note: [Please attach your current resume if you have one.]%0D%0A` +
               `${professionalEmailFooter}`
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
    emailBody: `${professionalEmailHeader}` +
               `Service: Content Writing%0D%0A` +
               `Type of Content: [e.g., Blog Post, Research Article]%0D%0A` +
               `Topic: [Your Topic]%0D%0A` +
               `Word Count: [Approximate number]%0D%0A` +
               `Target Audience: [e.g., General public, Healthcare professionals]%0D%0A` +
               `${professionalEmailFooter}`
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
    emailBody: `${professionalEmailHeader}` +
               `Service: Presentation Design%0D%0A` +
               `Topic: [Your Topic]%0D%0A` +
               `Number of Slides: [e.g., 15-20]%0D%0A` +
               `Event/Purpose: [e.g., Class Seminar, Final Defense]%0D%0A` +
               `Content: [Will you provide the content, or do you need help writing it?]%0D%0A` +
               `${professionalEmailFooter}`
  }
];
