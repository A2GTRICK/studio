
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, KeyRound, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your application and account settings.
        </p>
      </div>

      <div className="max-w-2xl space-y-8">
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Palette /> Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Enable or disable dark mode for the application.</p>
                    </div>
                    <Switch id="dark-mode" />
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Bell /> Notifications</CardTitle>
                <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates and alerts via email.</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked/>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get notified directly in your browser.</p>
                    </div>
                    <Switch id="push-notifications" />
                </div>
            </CardContent>
        </Card>
        
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><KeyRound /> Security</CardTitle>
                <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-muted-foreground">Set a new password for your account.</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
