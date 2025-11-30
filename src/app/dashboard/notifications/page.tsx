
import { ArrowRight, Bell, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAllNotifications, type UnifiedNotification } from "@/services/notifications";

// Helper to assign a badge color based on the notification category
const getCategoryBadgeVariant = (category: UnifiedNotification['category']) => {
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

// This is now a Server Component, similar to the Notes Library page
export default async function NotificationsPage() {
  const allNotifications = await fetchAllNotifications();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
       <div className="text-center">
        <h1 className="text-3xl font-headline font-bold">Live Notifications</h1>
        <p className="text-muted-foreground">The latest university updates, exam alerts, and job openings.</p>
      </div>

      {/* Filters can be re-added here later using Client Components and URL query params */}

      <div className="space-y-4">
        {allNotifications.length === 0 ? (
           <Card className="mt-8">
              <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                  <Bell className="h-20 w-20 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-semibold">No Notifications Found</h3>
                  <p className="text-muted-foreground mt-2">There are no new announcements at the moment.</p>
              </CardContent>
          </Card>
        ) : (
           allNotifications.map((notification) => (
              <Card key={notification.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                      <div>
                          <CardTitle className="font-headline text-lg">{notification.title}</CardTitle>
                          <CardDescription>{notification.date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
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
        )}
      </div>
    </div>
  );
}
