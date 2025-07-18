
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

const notifications: Notification[] = [
  {
    id: 1,
    title: "B.Pharm 2nd Sem Exam Dates Announced",
    date: "2024-07-20",
    content: "The university has officially announced the examination schedule for the 2nd semester of B.Pharm. Exams will commence from August 15th, 2024. Download the full schedule from the university website.",
    category: "University Update",
    target: { course: "B.Pharm", year: "1st Year" } 
  },
  {
    id: 2,
    title: "GPAT 2025 Application Window is Open",
    date: "2024-07-18",
    content: "The application window for the Graduate Pharmacy Aptitude Test (GPAT) 2025 is now open. The last date to apply is August 30th, 2024.",
    category: "Exam Alert",
    target: {}
  },
  {
    id: 3,
    title: "New Notes Added: Physical Pharmaceutics",
    date: "2024-07-15",
    content: "We've just added a new set of premium notes for Physical Pharmaceutics (B.Pharm 2nd Year). Unlock them with your premium subscription today!",
    category: "Content Update",
    target: { course: "B.Pharm", year: "2nd Year" }
  },
  {
    id: 4,
    title: "D.Pharm 1st Year Sessional Exams",
    date: "2024-07-14",
    content: "Sessional exams for D.Pharm 1st year students are scheduled to begin next week. Please consult your department for the detailed timetable.",
    category: "University Update",
    target: { course: "D.Pharm", year: "1st Year" }
  },
  {
    id: 5,
    title: "Maintenance Alert: AI Tools",
    date: "2024-07-12",
    content: "Our AI generation tools will be temporarily unavailable this Sunday from 2 AM to 4 AM for scheduled maintenance to improve performance.",
    category: "General",
    target: {}
  },
  {
    id: 6,
    title: "Pharmacist Exam (State Govt) New Vacancies",
    date: "2024-07-10",
    content: "The state government has announced 250 new vacancies for the role of Pharmacist. The application portal opens on July 25th.",
    category: "Exam Alert",
    target: {}
  },
  {
    id: 7,
    title: "Welcome to A2G Smart Notes!",
    date: "2024-07-01",
    content: "Welcome to the platform! Explore our notes library, try our AI tools, and don't hesitate to reach out for academic services.",
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
                    <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
