
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  KeyRound,
  Palette,
  User,
  ShieldCheck,
  Database,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your application, preferences, and account settings.
        </p>
      </div>

      <div className="max-w-3xl space-y-10">

        {/* Appearance */}
        <SettingsCard
          icon={<Palette />}
          title="Appearance"
          description="Customize how the interface appears."
        >
          <SettingRow
            label="Dark Mode"
            description="Enable or disable dark mode."
            control={<Switch id="dark-mode" />}
          />

          <SettingRow
            label="Reduced Motion"
            description="Limit animations for better accessibility."
            control={<Switch id="reduced-motion" />}
          />
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard
          icon={<Bell />}
          title="Notifications"
          description="Manage how we alert you about updates."
        >
          <SettingRow
            label="Email Notifications"
            description="Receive alerts and updates via email."
            control={<Switch id="email-notifications" defaultChecked />}
          />

          <SettingRow
            label="Browser Push Notifications"
            description="Get instant alerts directly in your browser."
            control={<Switch id="push-notifications" />}
          />
        </SettingsCard>

        {/* Security */}
        <SettingsCard
          icon={<KeyRound />}
          title="Security"
          description="Manage your login and account protection."
        >
          <SettingRow
            label="Change Password"
            description="Update your account password."
            control={<Button variant="outline">Change Password</Button>}
          />

          <SettingRow
            label="Two-Factor Authentication (2FA)"
            description="Add an extra layer of security."
            control={<Switch id="2fa" />}
          />
        </SettingsCard>

        {/* Account Settings */}
        <SettingsCard
          icon={<User />}
          title="Account"
          description="Profile, identity and account-level settings."
        >
          <SettingRow
            label="Edit Profile"
            description="Change your name, photo, or basic details."
            control={<Button variant="outline">Edit Profile</Button>}
          />

          <SettingRow
            label="Connected Accounts"
            description="Manage social login connections."
            control={<Button variant="outline">Manage</Button>}
          />
        </SettingsCard>

        {/* Privacy */}
        <SettingsCard
          icon={<ShieldCheck />}
          title="Privacy"
          description="Control visibility and privacy preferences."
        >
          <SettingRow
            label="Public Profile Visibility"
            description="Show or hide your public profile."
            control={<Switch id="profile-visibility" />}
          />

          <SettingRow
            label="Usage Analytics"
            description="Allow us to collect anonymized analytics."
            control={<Switch id="usage-analytics" />}
          />
        </SettingsCard>

        {/* Data Controls */}
        <SettingsCard
          icon={<Database />}
          title="Data & Storage"
          description="Manage downloads, backups, and stored data."
        >
          <SettingRow
            label="Export Account Data"
            description="Download your data in a portable format."
            control={<Button variant="outline">Export</Button>}
          />

          <SettingRow
            label="Clear Local Storage"
            description="Remove cached MCQ history and stored preferences."
            control={
              <Button variant="destructive" onClick={() => localStorage.clear()}>
                Clear
              </Button>
            }
          />
        </SettingsCard>
      </div>
    </div>
  );
}

/* ------------------------------ */
/* Reusable Setting Components     */
/* ------------------------------ */

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm border">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-xl">
          {icon} {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border p-4 rounded-lg">
      <div className="max-w-md">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {control}
    </div>
  );
}
