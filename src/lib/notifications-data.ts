
export type Notification = {
  id: number;
  title: string;
  date: string;
  content: string;
  category: "University Update" | "Exam Alert" | "Content Update" | "General";
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
    title: "Official Schedule for B.Pharm 2nd Semester Theory Exams",
    date: "2024-07-22",
    content: "The examination authority has released the final schedule for the upcoming B.Pharm 2nd Semester theory examinations. The exams are set to commence on August 20, 2024. Students are advised to download the official timetable from the university's portal. Refer to Circular No. EXM/2024/112.",
    category: "University Update",
    target: { course: "B.Pharm", year: "1st Year" } 
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
    title: "Content Update: New Premium Notes for Medicinal Chemistry",
    date: "2024-07-20",
    content: "Our academic team has just published a new set of comprehensive premium notes for Medicinal Chemistry III (B.Pharm 3rd Year), covering SAR of antibiotics and anticancer agents.",
    category: "Content Update",
    target: { course: "B.Pharm", year: "3rd Year" },
    link: "/notes"
  },
  {
    id: 4,
    title: "D.Pharm 1st Year: Sessional Examination Timetable",
    date: "2024-07-19",
    content: "This is to inform all D.Pharm 1st year students that the sessional examinations will be conducted from August 5th to August 10th. Please contact your respective department heads for the detailed internal schedule.",
    category: "University Update",
    target: { course: "D.Pharm", year: "1st Year" }
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
    content: "The State Health Department has issued a notification for the recruitment of 250 Pharmacists. The official application portal will be open from July 25th to August 25th, 2024. Eligibility criteria and syllabus are available on the department's official website.",
    category: "Exam Alert",
    target: {}
  },
  {
    id: 7,
    title: "Platform Update: Enhanced User Dashboard",
    date: "2024-07-15",
    content: "We have rolled out a new and improved user dashboard. Track your progress, get AI-powered suggestions, and view your performance analytics all in one place. We welcome your feedback on this new feature.",
    category: "General",
    target: {},
    link: "/dashboard"
  }
];
