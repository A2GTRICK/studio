import { Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const notifications = [
  {
    title: "B.Pharm 2nd Sem Exam Dates Announced",
    date: "2024-07-20",
    content: "The university has officially announced the examination schedule for the 2nd semester of B.Pharm. Exams will commence from August 15th, 2024. Download the full schedule from the university website.",
    category: "University Update"
  },
  {
    title: "GPAT 2025 Application Window is Open",
    date: "2024-07-18",
    content: "The application window for the Graduate Pharmacy Aptitude Test (GPAT) 2025 is now open. The last date to apply is August 30th, 2024.",
    category: "Exam Alert"
  },
  {
    title: "New Notes Added: Physical Pharmaceutics",
    date: "2024-07-15",
    content: "We've just added a new set of premium notes for Physical Pharmaceutics (B.Pharm 2nd Year). Unlock them with your premium subscription today!",
    category: "Content Update"
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
       <div className="text-center">
        <h1 className="text-3xl font-headline font-bold">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with the latest university and exam announcements.</p>
      </div>

      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                  <div>
                      <CardTitle className="font-headline text-lg">{notification.title}</CardTitle>
                      <CardDescription>{new Date(notification.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                  </div>
                  <Badge variant={notification.category === "Exam Alert" ? "destructive" : "secondary"}>{notification.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p>{notification.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
