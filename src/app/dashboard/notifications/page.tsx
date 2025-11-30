
import { fetchAllNotifications } from "@/services/notifications";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";
import { getCategoryBadgeVariant } from "@/components/notification-popover";

export default async function NotificationsPage() {
  const notifications = await fetchAllNotifications();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-6">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold">Live Notifications</h1>
        <p className="text-muted-foreground">
          Latest university updates, exam alerts, and job openings.
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card className="mt-8">
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <Bell className="h-20 w-20 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold">No Notifications Found</h3>
                <p className="text-muted-foreground mt-2">There are no new announcements at the moment.</p>
            </CardContent>
        </Card>
      ) : (
        notifications.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                  </CardDescription>
                </div>

                <Badge variant={getCategoryBadgeVariant(item.category as any)}>{item.category}</Badge>
              </div>
            </CardHeader>

            <CardContent>
              <p>{item.summary}</p>
            </CardContent>

            {item.link && (
              <CardFooter>
                <Link href={item.link} target="_blank">
                  <span className="flex items-center gap-2 text-sm text-blue-600">
                    View Source <ArrowRight size={16} />
                  </span>
                </Link>
              </CardFooter>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
