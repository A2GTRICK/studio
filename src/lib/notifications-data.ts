
export type Notification = {
  id: number;
  title: string;
  date: string;
  content: string;
  category: "University Update" | "Exam Alert" | "Content Update" | "General" | "Job Alert";
  target: {
    course?: "B.Pharm" | "D.Pharm";
    year?: "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
  };
  link?: string;
};

// Updated, more official-sounding notifications
export const notifications: Notification[] = [
  {
    id: 1,
    title: "Official Schedule for B.Pharm Final Year Theory Exams",
    date: "2024-07-22",
    content: "The examination authority has released the final schedule for the upcoming B.Pharm 4th Year (8th Semester) theory examinations, commencing August 28, 2024. Refer to Circular No. EXM/2024/115.",
    category: "University Update",
    target: { course: "B.Pharm", year: "4th Year" } 
  },
  {
    id: 2,
    title: "GPAT 2025: Application Portal Now Live",
    date: "2024-07-21",
    content: "The National Testing Agency (NTA) has started accepting applications for the Graduate Pharmacy Aptitude Test (GPAT) 2025. The deadline for online submission is August 31, 2024. No extensions will be granted.",
    category: "Exam Alert",
    target: {},
    link: "/mcq-practice"
  },
  {
    id: 3,
    title: "New Premium Notes: Pharmacology IV",
    date: "2024-07-20",
    content: "Our academic team has just published a new set of comprehensive premium notes for Pharmacology IV (B.Pharm 4th Year), focusing on chemotherapy and bioinformatics.",
    category: "Content Update",
    target: { course: "B.Pharm", year: "4th Year" },
    link: "/notes"
  },
  {
    id: 4,
    title: "Job Alert: Pharmacist at Apollo Hospitals (5 Vacancies)",
    date: "2024-07-19",
    content: "Apollo Hospitals has posted openings for the position of Pharmacist. Candidates with a B.Pharm or D.Pharm are eligible to apply. See the link for more details.",
    category: "Job Alert",
    target: {},
    link: "https://www.apollopharmacy.in/careers"
  },
  {
    id: 5,
    title: "Scheduled Maintenance for AI Services",
    date: "2024-07-18",
    content: "Please be advised that our AI-powered tools (Notes & Exam Question Generators) will undergo scheduled maintenance on Sunday, July 28th, from 2:00 AM to 4:00 AM IST to enhance performance and accuracy.",
    category: "General",
    target: {}
  },
  {
    id: 6,
    title: "Alert: State Govt. Pharmacist Recruitment (250 Posts)",
    date: "2024-07-17",
    content: "The State Health Department has issued a notification for the recruitment of 250 Pharmacists. The official application portal will be open from July 25th to August 25th, 2024.",
    category: "Exam Alert",
    target: {}
  },
  {
    id: 7,
    title: "Platform Update: My Progress Tracking Now Live!",
    date: "2024-07-15",
    content: "We have rolled out a new and improved user dashboard. Track your progress, get AI-powered suggestions, and view your performance analytics all in one place.",
    category: "Content Update",
    target: {},
    link: "/my-progress"
  }
];
