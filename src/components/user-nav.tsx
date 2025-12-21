"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useFirebase } from "@/firebase/provider";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  CreditCard,
  Settings,
  LogOut,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export function UserNav() {
  const router = useRouter();
  const { auth } = useFirebase();
  const session = useAuthSession();
  const user = session?.user;

  if (!user) return null;

  async function handleLogout() {
    if (!auth) return;
    await signOut(auth);
    router.push("/");
  }

  const initials =
    user.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">
              A2GTRICK Academy
            </p>
            <p className="text-xs text-muted-foreground">
              {user.email}
            </p>

            {/* ✅ EMAIL VERIFICATION STATUS */}
            {user.emailVerified ? (
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Email not verified
                <Link
                  href="/dashboard/settings"
                  className="underline ml-1"
                >
                  Verify
                </Link>
              </div>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
