"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Types & Interfaces
export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

// Mock Data
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New User Registered",
    description: "John Doe created a new account.",
    time: "5m ago",
    read: false,
  },
  {
    id: "2",
    title: "System Update",
    description: "Database maintenance scheduled for 02:00 UTC.",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    title: "Security Alert",
    description: "Multiple failed login attempts detected.",
    time: "3h ago",
    read: true,
  },
];

// Sub-component: Logo Section
function AdminLogo() {
  return (
    <Link
      href="/admin"
      className="flex items-center gap-2 font-bold text-xl tracking-tight"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <img src="/android-chrome-512x512.png" alt="logo" />
      </div>
      <span className="hidden sm:inline-block">AdminPanel</span>
    </Link>
  );
}

// Sub-component: Search Bar
function AdminSearch() {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search dashboard, users, logs..."
        className="w-full pl-8 bg-background md:w-70 lg:w-87.5"
      />
    </div>
  );
}

// Sub-component: Notification Section
function NotificationDropdown() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="relative"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
          >
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        {/* Wrap DropdownMenuLabel inside DropdownMenuGroup */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between py-2">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-auto p-1 text-muted-foreground hover:text-foreground"
                onClick={markAllAsRead}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" /> Mark all read
              </Button>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <div className="max-h-75 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 text-sm flex flex-col gap-1 hover:bg-accent/50 transition-colors ${
                  !item.read ? "bg-accent/20 font-medium" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-foreground">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Sub-component: Admin Menu
function AdminUserMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleSignOut = async () => {
    setLoading(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="relative h-9 w-9 rounded-full" />
        }
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatar-admin.png" alt="Admin" />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            AD
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        {/* Wrap DropdownMenuLabel inside DropdownMenuGroup */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Admin User</p>
              <p className="text-xs leading-none text-muted-foreground">
                admin@example.com
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <Link href="/admin/settings" className="flex w-full items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Link href="/admin/help" className="flex w-full items-center">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Sub-component: Mobile Sheet Drawer
function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle Menu"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader className="text-left border-b pb-4">
          <SheetTitle>
            <AdminLogo />
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 py-4">
          {/* Mobile Search Bar */}
          <div className="px-1">
            <AdminSearch />
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2">
            <Link
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link
              href="/admin/help"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <HelpCircle className="h-4 w-4" />
              Help & Support
            </Link>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
// Main Navbar Component
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Left Section: Mobile Navigation & Logo */}
        <div className="flex items-center gap-3">
          <MobileNav />
          <AdminLogo />
        </div>

        {/* Center Section: Search Bar (Hidden on tiny mobile screens, visible from SM up) */}
        <div className="hidden sm:flex flex-1 justify-center max-w-md mx-4">
          <AdminSearch />
        </div>

        {/* Right Section: Actions (Notifications & Admin Menu) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationDropdown />
          <AdminUserMenu />
        </div>
      </div>

      {/* Mobile-Only Search Bar Row (renders below the main bar on extra small screens) */}
      <div className="block sm:hidden border-t px-4 py-2 bg-background">
        <AdminSearch />
      </div>
    </header>
  );
}
