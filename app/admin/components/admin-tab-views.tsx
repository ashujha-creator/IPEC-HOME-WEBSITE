"use client";

import React from "react";
import { TabId } from "./admin-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UpdateHome from "./home-page";

interface TabViewsProps {
  activeTab: TabId;
}

export function AdminTabViews({ activeTab }: TabViewsProps) {
  switch (activeTab) {
    case "home":
      return <UpdateHome />;

    case "about":
      return (
        <Card>
          <CardHeader>
            <CardTitle>About Organization</CardTitle>
            <CardDescription>
              System metadata and version information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Version 2.4.0 • Built with Next.js & Tailwind CSS.
            </p>
          </CardContent>
        </Card>
      );

    case "content":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>
              Manage articles, blog posts, and site announcements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              12 draft articles awaiting moderation.
            </p>
          </CardContent>
        </Card>
      );

    case "faculty":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Faculty Directory</CardTitle>
            <CardDescription>
              Manage instructors, professors, and administrative staff.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              48 active faculty members listed in the directory.
            </p>
          </CardContent>
        </Card>
      );

    case "resources":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Resource Center</CardTitle>
            <CardDescription>
              Upload files, view documentation, and access shared drives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Storage usage: 42 GB of 100 GB used.
            </p>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}
