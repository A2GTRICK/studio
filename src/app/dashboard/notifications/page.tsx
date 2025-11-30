'use client';

import { useState, useMemo, useEffect } from "react";
import { Bell, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { fetchPharmacyNews } from "@/ai/flows/fetch-pharmacy-news";
import { type PharmacyNewsOutput as Notification } from "@/ai/flows/types";

export default function NotificationsPage() {
  const [allNotifications, setAllNotifications] = useState<Notification>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [courseFilter, setCourseFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    async function getNotifications() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedNotifications = await fetchPharmacyNews();
        setAllNotifications(fetchedNotifications);
      } catch (e: any) {
        console.error("Failed to fetch notifications:", e);
        setError("An unexpected error occurred while loading the latest announcements. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    }
    getNotifications();
  }, []);
  
  const getCategoryBadgeVariant = (category: Notification[0]['category']) => {
    switch(category) {
        case "Exam Alert": return "destructive";
        case "University Update": return "default";
        case "Content Update": return "secondary";
        case "Job Notification": return "default";
        case "PCI Circular": return "secondary";
        case "Industry Hiring": return "default";
        default: return "outline";
    }
  }
  
  const categories = useMemo(() => {
    if (!allNotifications) return ["All"];
    const uniqueCategories = new Set(allNotifications.map(n => n.category));
    return ["All", ...Array.from(uniqueCategories)];
  }, [allNotifications]);

  const filteredNotifications = useMemo(() => {
    if (!allNotifications) return [];
    return allNotifications.filter(n => {
        // This is a placeholder for more complex future filtering logic
        const categoryMatch = categoryFilter === 'All' || n.category === categoryFilter;
        return categoryMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [categoryFilter, allNotifications]);

  const renderContent = () => {
    if (isLoading) {
       return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Fetching latest announcements...</p>
            </div>
        );
    }
    if (error) {
        return (
             <Card className="border-destructive bg-destructive/10">
                <CardHeader className="flex-row items-center gap-4">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <div>
                        <CardTitle className="text-destructive">Failed to Load Notifications</CardTitle>
                        <CardDescription className="text-destructive/80">{error}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        );
    }
    if (allNotifications.length === 0 && !isLoading && !error) {
        return (
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="items-center text-center">
                    <Bell className="h-12 w-12 text-primary mb-4" />
                    <CardTitle className="font-headline">AI Service Temporarily Unavailable</CardTitle>
                    <CardDescription>The AI model for fetching news is currently overloaded. Please try again in a few moments.</CardDescription>
                </CardHeader>
            </Card>
        );
    }
     if (filteredNotifications.length > 0) {
        return filteredNotifications.map((notification) => (
              <Card key={notification.id} className="shadow-sm hover:shadow-md transition-shadow">
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
                  <p>{notification.summary}</p>
                </CardContent>
                {notification.source && (
                    <CardFooter>
                        <Button asChild variant="secondary" size="sm">
                            <a href={notification.source} target="_blank" rel="noopener noreferrer">
                                View Source <ArrowRight className="ml-2 h-4 w-4"/>
                            </a>
                        </Button>
                    </CardFooter>
                )}
              </Card>
            ))
     }

     return (
        <Card className="mt-8">
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <Bell className="h-20 w-20 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold">No Notifications Found</h3>
                <p className="text-muted-foreground mt-2">No relevant announcements match your current filter settings.</p>
            </CardContent>
        </Card>
     );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
       <div className="text-center">
        <h1 className="text-3xl font-headline font-bold">Live Notifications</h1>
        <p className="text-muted-foreground">The latest university updates, exam alerts, and job openings.</p>
      </div>

      <Card>
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="text-sm text-muted-foreground p-2 col-span-1 md:col-span-2">Filtering by course and year will be implemented in a future update.</div>
                 <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoading || !allNotifications || allNotifications.length === 0}>
                    <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                    <SelectContent>
                        {categories.map(category => (
                             <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {renderContent()}
      </div>
    </div>
  );
}
