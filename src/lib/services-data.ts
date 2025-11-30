
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
    emailBody: `Hello phamA2G Team,\n\nI am interested in the Internship Report Writing service.\n\nMy Course: [e.g., B.Pharm]\nMy Year/Semester: [e.g., 4th Year]\nMy College: [Your College Name]\n\nPlease provide me with a quote and further details.\n\nThank you,\n[Your Name]`,
    sampleRequestEmailBody: `Hello phamA2G Team,\n\nI would like to see a sample of your "Internship Report Writing" work.\n\nMy Course: [e.g., B.Pharm]\nMy Email: [Your Email]\n\nPlease send a sample to my email address.\n\nThank you,\n[Your Name]`
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
    emailBody: `Hello phamA2G Team,\n\nI need assistance with my dissertation/thesis.\n\nMy Research Topic: [Your Topic]\nMy Course: [e.g., M.Pharm in Pharmaceutics]\nSpecific help needed: [e.g., Literature Review, Full Writing, Data Analysis]\n\nPlease provide me with a custom quote.\n\nThank you,\n[Your Name]`,
    sampleRequestEmailBody: `Hello phamA2G Team,\n\nI would like to see a sample of your "Dissertation & Thesis" work.\n\nMy Course: [e.g., M.Pharm]\nMy Email: [Your Email]\n\nPlease send a sample to my email address.\n\nThank you,\n[Your Name]`
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
    emailBody: `Hello phamA2G Team,\n\nI would like to request a Project File.\n\nSubject: [e.g., Pharmaceutics-I]\nTopic: [e.g., Tablets]\nMy Course: [e.g., D.Pharm 1st Year]\n\nPlease let me know the price and how to proceed.\n\nThank you,\n[Your Name]`,
    sampleRequestEmailBody: `Hello phamA2G Team,\n\nI would like to see a sample of your "Project File Preparation" work.\n\nMy Subject: [e.g., Pharmaceutics-I]\nMy Email: [Your Email]\n\nPlease send a sample to my email address.\n\nThank you,\n[Your Name]`
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
    emailBody: `Hello phamA2G Team,\n\nI need help with my Lab Manual/Record.\n\nSubject: [e.g., Pharmaceutical Chemistry-II]\nMy Course & Year: [e.g., B.Pharm 2nd Year]\nNumber of Experiments: [e.g., 15]\n\nPlease provide a quote.\n\nThank you,\n[Your Name]`,
    sampleRequestEmailBody: `Hello phamA2G Team,\n\nI would like to see a sample of your "Lab Manual & Record Work".\n\nMy Subject: [e.g., Pharmaceutical Chemistry-II]\nMy Email: [Your Email]\n\nPlease send a sample to my email address.\n\nThank you,\n[Your Name]`
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
    emailBody: `Hello phamA2G Team,\n\nI need a PowerPoint presentation for my seminar.\n\nTopic: [Your Seminar Topic]\nNumber of Slides: [e.g., 15-20]\nDate of Presentation: [Date]\n\nPlease send me a quote and some sample designs.\n\nThank you,\n[Your Name]`,
    sampleRequestEmailBody: `Hello phamA2G Team,\n\nI would like to see a sample of your "Seminar & Presentation (PPT)" work.\n\nMy Seminar Topic: [Your Seminar Topic]\nMy Email: [Your Email]\n\nPlease send a sample to my email address.\n\nThank you,\n[Your Name]`
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
    emailBody: `Hello phamA2G Team,\n\nI require assistance with an assignment.\n\nSubject: [e.g., Human Anatomy and Physiology]\nTopic: [e.g., The Endocrine System]\nWord Count/Length: [e.g., 10 pages]\nDeadline: [Date]\n\nPlease provide a quote.\n\nThank you,\n[Your Name]`,
    sampleRequestEmailBody: `Hello phamA2G Team,\n\nI would like to see a sample of your "Assignment Writing" work.\n\nMy Subject: [e.g., Human Anatomy and Physiology]\nMy Email: [Your Email]\n\nPlease send a sample to my email address.\n\nThank you,\n[Your Name]`
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
