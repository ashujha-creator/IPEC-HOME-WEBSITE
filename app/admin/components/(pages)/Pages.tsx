"use client";

import Link from "next/link";
import {
  FileText,
  PlusCircle,
  FileEdit,
  CheckCircle2,
  Trash2,
  LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface MenuItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  count?: number;
  badgeColor?: string;
}

const menuItems: MenuItem[] = [
  {
    title: "All Pages",
    description: "Manage and view all your created site pages.",
    href: "/pages",
    icon: FileText,
    count: 24,
  },
  {
    title: "Create Page",
    description: "Draft and publish a brand new page from scratch.",
    href: "/admin/pages/create",
    icon: PlusCircle,
  },
  {
    title: "ALL Links",
    description: "All links currently work in progress.",
    href: "/admin/pages/links",
    icon: FileEdit,
    count: 5,
  },
  {
    title: "Trash",
    description: "Deleted pages available for recovery or removal.",
    href: "/admin/pages/trash",
    icon: Trash2,
    count: 2,
  },
];

export default function Pages() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Pages Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a category to view, create, or manage your content.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group outline-none"
            >
              <Card className="relative aspect-square flex flex-col justify-between p-6 rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/40 hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {/* Top Row: Icon & Count Badge */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-muted text-muted-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  {item.count !== undefined && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                      {item.count}
                    </span>
                  )}
                </div>

                {/* Bottom Row: Title & Description */}
                <div className="space-y-1.5">
                  <h2 className="text-lg font-semibold tracking-tight transition-colors duration-200 group-hover:text-primary">
                    {item.title}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Subtle Subtle Glow Effect on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
