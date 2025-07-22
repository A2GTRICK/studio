
import { FileText, BookCopy, ScrollText, User, PenTool, Presentation } from 'lucide-react';

const professionalEmailGreeting = "Hello A2G Smart Notes Team,%0D%0A%0D%0AI hope you are doing well.%0D%0A%0D%0AI am interested in availing your academic writing services. Please find my project details below:%0D%0A%0D%0A";
const professionalEmailClosing = "%0D%0A%0D%0AKindly let me know the estimated cost and turnaround time for this project.%0D%0A%0D%0AThank you very much.%0D%0A%0D%0ABest regards,%0D%0A[Your Full Name]%0D%0A[Your Contact Number - Optional]";

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
    emailBody: `${professionalEmailGreeting}` +
               `%E2%80%A2%20Service%20Required:%20Internship%20Report%0D%0A` +
               `%E2%80%A2%20Course:%20[Your%20Course,%20e.g.,%20B.Pharm]%0D%0A` +
               `%E2%80%A2%20University:%20[Your%20University%20Name]%0D%0A` +
               `%E2%80%A2%20Deadline:%20[DD-MM-YYYY]%0D%0A` +
               `%E2%80%A2%20Specific%20Requirements:%20[Format,%20Word%20Count,%20Any%20Guidelines]` +
               `${professionalEmailClosing}`
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
    emailBody: `${professionalEmailGreeting}` +
               `%E2%80%A2%20Service%20Required:%20Dissertation%20Support%0D%0A` +
               `%E2%80%A2%20Specialization:%20[e.g.,%20Pharmaceutics,%20Pharmacology]%0D%0A` +
               `%E2%80%A2%20Research%20Topic:%20[Your%20Topic%20or%20Area%20of%20Interest]%0D%0A` +
               `%E2%80%A2%20University:%20[Your%20University%20Name]%0D%0A` +
               `%E2%80%A2%20Deadline:%20[DD-MM-YYYY]` +
               `${professionalEmailClosing}`
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
    emailBody: `${professionalEmailGreeting}` +
               `%E2%80%A2%20Service%20Required:%20Synopsis%20Writing%0D%0A` +
               `%E2%80%A2%20Course:%20[e.g.,%20M.Pharm,%20PhD]%0D%0A` +
               `%E2%80%A2%20Field%20of%20Research:%20[Your%20Field]%0D%0A` +
               `%E2%80%A2%20Proposed%20Title:%20[Your%20Proposed%20Research%20Title]` +
               `${professionalEmailClosing}`
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
    emailBody: `${professionalEmailGreeting}` +
               `%E2%80%A2%20Service%20Required:%20[Resume,%20SOP,%20or%20Both]%0D%0A` +
               `%E2%80%A2%20My%20Goal:%20[e.g.,%20Job%20application%20for%20'Pharmacist']%0D%0A` +
               `%E2%80%A2%20Field/Specialization:%20[e.g.,%20Quality%20Assurance,%20Clinical%20Research]%0D%0A` +
               `%E2%80%A2%20Note:%20[Please%20attach%20your%20current%20resume%20if%20you%20have%20one.]` +
               `${professionalEmailClosing}`
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
    emailBody: `${professionalEmailGreeting}` +
               `%E2%80%A2%20Service%20Required:%20Content%20Writing%0D%0A` +
               `%E2%80%A2%20Type%20of%20Content:%20[e.g.,%20Blog%20Post,%20Research%20Article]%0D%0A` +
               `%E2%80%A2%20Topic:%20[Your%20Topic]%0D%0A` +
               `%E2%80%A2%20Word%20Count:%20[Approximate%20number]` +
               `${professionalEmailClosing}`
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
    emailBody: `${professionalEmailGreeting}` +
               `%E2%80%A2%20Service%20Required:%20Presentation%20Design%0D%0A` +
               `%E2%80%A2%20Topic:%20[Your%20Presentation%20Topic]%0D%0A` +
               `%E2%80%A2%20Number%20of%20Slides:%20[e.g.,%2015-20]%0D%0A` +
               `%E2%80%A2%20Event/Purpose:%20[e.g.,%20Class%20Seminar,%20Final%20Defense]` +
               `${professionalEmailClosing}`
  }
];
