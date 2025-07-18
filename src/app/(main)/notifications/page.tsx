
'use client';

import { useState, useMemo } from "react";
import { Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Notification = {
  id: number;
  title: string;
  date: string;
  content: string;
  category: "University Update" | "Exam Alert" | "Content Update" | "General";
  target: {
    course?: "B.Pharm" | "D.Pharm";
    year?: "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
  };
};

// Updated, more official-sounding notifications
const notifications: Notification[] = [
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
    target: {}
  },
  {
    id: 3,
    title: "Content Update: New Premium Notes for Medicinal Chemistry",
    date: "2024-07-20",
    content: "Our academic team has just published a new set of comprehensive premium notes for Medicinal Chemistry III (B.Pharm 3rd Year), covering SAR of antibiotics and anticancer agents.",
    category: "Content Update",
    target: { course: "B.Pharm", year: "3rd Year" }
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
    target: {}
  }
];


export default function NotificationsPage() {
  const [courseFilter, setCourseFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  const getCategoryBadgeVariant = (category: Notification['category']) => {
    switch(category) {
        case "Exam Alert": return "destructive";
        case "University Update": return "default";
        case "Content Update": return "secondary";
        default: return "outline";
    }
  }

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
        const courseMatch = courseFilter === 'All' || !n.target.course || n.target.course === courseFilter;
        const yearMatch = yearFilter === 'All' || !n.target.year || n.target.year === yearFilter;
        const categoryMatch = categoryFilter === 'All' || n.category === categoryFilter;
        return courseMatch && yearMatch && categoryMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [courseFilter, yearFilter, categoryFilter]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
       <div className="text-center">
        <h1 className="text-3xl font-headline font-bold">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with the latest university and exam announcements.</p>
      </div>

      <Card>
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger><SelectValue placeholder="Filter by Course" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Courses</SelectItem>
                        <SelectItem value="B.Pharm">B.Pharm</SelectItem>
                        <SelectItem value="D.Pharm">D.Pharm</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger><SelectValue placeholder="Filter by Year" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Years</SelectItem>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        <SelectItem value="University Update">University Updates</SelectItem>
                        <SelectItem value="Exam Alert">Exam Alerts</SelectItem>
                        <SelectItem value="Content Update">Content Updates</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card key={notification.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                      <div>
                          <CardTitle className="font-headline text-lg">{notification.title}</CardTitle>
                          <CardDescription>{new Date(notification.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                      </div>
                      <Badge variant={getCategoryBadgeVariant(notification.category)}>{notification.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{notification.content}</p>
                </CardContent>
              </Card>
            ))
        ) : (
             <Card className="mt-8">
                <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                    <Bell className="h-20 w-20 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold">No Notifications Found</h3>
                    <p className="text-muted-foreground mt-2">No relevant announcements match your current filter settings.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
