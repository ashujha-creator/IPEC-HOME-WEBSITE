"use client";

import React, { useState } from "react";
import { Home, Info, FileText, GraduationCap, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export type TabId = "home" | "about" | "content" | "faculty" | "resources";

export interface TabItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

// Tab Definitions
export const ADMIN_TABS: TabItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "about", label: "About", icon: Info },
  { id: "content", label: "Content", icon: FileText },
  { id: "faculty", label: "Faculty", icon: GraduationCap },
  { id: "resources", label: "Resources", icon: Folder },
];

interface AdminTabsProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="w-full border-b bg-background/95 backdrop-blur">
      <div className="container px-4 md:px-6">
        <div className="flex h-12 items-center space-x-1 overflow-x-auto no-scrollbar scroll-smooth">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  isActive
                    ? "bg-secondary text-secondary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
