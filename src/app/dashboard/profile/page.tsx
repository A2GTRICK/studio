
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Save } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Profile
        </h1>
        <p className="text-muted-foreground">
          View and manage your account details.
        </p>
      </div>

      <Card className="max-w-2xl shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Account Information</CardTitle>
          <CardDescription>
            Update your personal information and email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="person portrait" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
                <h2 className="font-headline text-2xl">Alex</h2>
                <p className="text-muted-foreground">alex@example.com</p>
                <Button variant="outline" size="sm">Change Picture</Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="name" defaultValue="Alex" className="pl-10" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" defaultValue="alex@example.com" className="pl-10" />
                </div>
            </div>
          </div>
           <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
