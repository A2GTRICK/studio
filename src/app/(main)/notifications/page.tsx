
'use client';

import { useState, useMemo } from "react";
import { Bell, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notifications, type Notification } from "@/lib/notifications-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";


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
                {notification.link && (
                    <CardFooter>
                        <Button asChild variant="secondary" size="sm">
                            <Link href={notification.link}>
                                View Update <ArrowRight className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                    </CardFooter>
                )}
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
