
import { BookCopy, FileText, GraduationCap, Mic, Presentation, TestTube2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Service {
  icon: LucideIcon;
  title: string;
  slug: string;
  category: 'Report Writing' | 'Research Support' | 'Academic Content';
  description: string;
  audience: string;
  price: string;
  features: string[];
  emailBody: string;
  sampleRequestEmailBody: string;
}

const EMAIL_RECIPIENT = 'a2gtrickacademy@gmail.com';

const commonFields = `
Please fill out your details below:
- Your Name: 
- Mobile Number: 
- Email Address: 
- College Name: 
- Course & Year: 
-----------------------------------
`;

export const services: Service[] = [
  {
    icon: BookCopy,
    title: 'Internship Report Writing',
    slug: 'internship-report-writing',
    category: 'Report Writing',
    description: 'Professionally written internship reports for D.Pharm, B.Pharm & M.Pharm students.',
    audience: 'D.Pharm, B.Pharm, M.Pharm',
    price: 'Starting from ₹500',
    features: [
      'Structured according to university/college guidelines.',
      'Includes all necessary sections: introduction, company profile, daily log, conclusion.',
      'Plagiarism-free content with proper formatting.',
      'Timely delivery guaranteed.',
    ],
    emailBody: `Hello phamA2G Team,

I am interested in your "Internship Report Writing" service.${commonFields}
Service-Specific Details:
- Internship Industry (e.g., Hospital, Industrial): 

Thank you,
`,
    sampleRequestEmailBody: `Hello phamA2G Team,

I would like to request a sample of your "Internship Report Writing" work.${commonFields}
Thank you,
`
  },
  {
    icon: GraduationCap,
    title: 'Dissertation & Thesis Help',
    slug: 'dissertation-thesis-help',
    category: 'Research Support',
    description: 'Complete guidance and writing support for your M.Pharm dissertation or B.Pharm major project.',
    audience: 'M.Pharm, B.Pharm (Final Year)',
    price: 'Custom Quote',
    features: [
      'Topic selection and proposal writing.',
      'Literature review and data collection guidance.',
      'Data analysis and interpretation using appropriate tools.',
      'Complete writing, formatting, and proofreading services.',
    ],
    emailBody: `Hello phamA2G Team,

I am inquiring about your "Dissertation & Thesis Help" service.${commonFields}
Service-Specific Details:
- Research Topic/Area: 
- Specific help needed (e.g., Literature Review, Full Writing, Data Analysis): 

Please provide me with a custom quote.

Thank you,
`,
    sampleRequestEmailBody: `Hello phamA2G Team,

I would like to request a sample of your "Dissertation & Thesis" work.${commonFields}
Thank you,
`
  },
  {
    icon: FileText,
    title: 'Project File Preparation',
    slug: 'project-file-preparation',
    category: 'Academic Content',
    description: 'Ready-made and custom project files for various pharmacy subjects, complete with diagrams and charts.',
    audience: 'D.Pharm, B.Pharm',
    price: 'Starting from ₹300',
    features: [
      'Covers major subjects like Pharmaceutics, Pharmacology, Chemistry.',
      'Includes well-labeled diagrams, charts, and tables.',
      'Content is clear, concise, and easy to understand.',
      'Available in both digital (PDF) and physical formats.',
    ],
    emailBody: `Hello phamA2G Team,

I would like to request a Project File.${commonFields}
Service-Specific Details:
- Subject: 
- Topic: 

Please let me know the price and how to proceed.

Thank you,
`,
    sampleRequestEmailBody: `Hello phamA2G Team,

I would like to see a sample of your "Project File Preparation" work.${commonFields}
Service-Specific Details:
- Subject of interest: 

Thank you,
`
  },
  {
    icon: TestTube2,
    title: 'Lab Manual & Record Work',
    slug: 'lab-manual-work',
    category: 'Academic Content',
    description: 'Complete, accurate, and neatly prepared lab manuals and record books for all practical subjects.',
    audience: 'D.Pharm, B.Pharm',
    price: 'Starting from ₹400 per subject',
    features: [
      'Follows the exact experiment list as per your syllabus.',
      'Includes Aim, Principle, Procedure, Observations, Calculations, and Conclusion.',
      'Neat diagrams and properly recorded observation tables.',
      'Saves you valuable time and ensures complete records.',
    ],
    emailBody: `Hello phamA2G Team,

I need help with my Lab Manual/Record.${commonFields}
Service-Specific Details:
- Subject: 
- Number of Experiments: 

Please provide a quote.

Thank you,
`,
    sampleRequestEmailBody: `Hello phamA2G Team,

I would like to request a sample of your "Lab Manual & Record Work".${commonFields}
Service-Specific Details:
- Subject of interest: 

Thank you,
`
  },
  {
    icon: Mic,
    title: 'Seminar & Presentation (PPT)',
    slug: 'seminar-presentation-ppt',
    category: 'Academic Content',
    description: 'Beautiful, professional, and informative PowerPoint presentations for your seminars and academic talks.',
    audience: 'All Pharmacy Students',
    price: 'Starting from ₹250',
    features: [
      'Professionally designed slides with your college branding.',
      'Well-researched and structured content.',
      'Includes relevant images, diagrams, and animations.',
      'Speaker notes can be provided upon request.',
    ],
    emailBody: `Hello phamA2G Team,

I need a PowerPoint presentation for my seminar.${commonFields}
Service-Specific Details:
- Topic: 
- Required Number of Slides: 
- Date of Presentation: 

Please send me a quote.

Thank you,
`,
    sampleRequestEmailBody: `Hello phamA2G Team,

I would like to see a sample of your "Seminar & Presentation (PPT)" work.${commonFields}
Service-Specific Details:
- Topic of interest: 

Thank you,
`
  },
  {
    icon: Presentation,
    title: 'Assignment Writing',
    slug: 'assignment-writing',
    category: 'Academic Content',
    description: 'Topic-wise assignment writing services to help you score better grades without the hassle.',
    audience: 'D.Pharm, B.Pharm',
    price: 'Based on topic & length',
    features: [
      'Custom written assignments for any pharmacy subject.',
      'Plagiarism-free and well-referenced content.',
      'Includes diagrams and flowcharts where necessary.',
      'Guaranteed on-time submission.',
    ],
    emailBody: `Hello phamA2G Team,

I require assistance with an assignment.${commonFields}
Service-Specific Details:
- Subject: 
- Topic: 
- Required Word Count/Length: 
- Deadline: 

Please provide a quote.

Thank you,
`,
    sampleRequestEmailBody: `Hello phamA2G Team,

I would like to request a sample of your "Assignment Writing" work.${commonFields}
Service-Specific Details:
- Subject of interest: 

Thank you,
`
  },
];

export const serviceCategories = Array.from(new Set(services.map(s => s.category)));

export function getServiceBySlug(slug: string) {
  return services.find(s => s.slug === slug);
}

export function createServiceMailto(service: Service) {
  return `mailto:${EMAIL_RECIPIENT}?subject=${encodeURIComponent(
    `Service Inquiry: ${service.title}`
  )}&body=${encodeURIComponent(service.emailBody)}`;
}

export function createSampleRequestMailto(service: Service) {
  return `mailto:${EMAIL_RECIPIENT}?subject=${encodeURIComponent(
    `Sample Request: ${service.title}`
  )}&body=${encodeURIComponent(service.sampleRequestEmailBody)}`;
}
