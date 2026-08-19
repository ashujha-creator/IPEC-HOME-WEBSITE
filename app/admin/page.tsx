"use client";
import React, { useState } from "react";
import { AdminTabViews } from "./components/admin-tab-views";
import { AdminTabs, TabId } from "./components/admin-tabs";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  // // 1. Retrieve the session on the server
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });

  // // 2. Fallback check (Middleware also protects this route)
  // if (!session) {
  //   redirect("/login");
  // }

  // const { user } = session;

  return (
    <div className="heloo">
      {" "}
      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container p-4 md:p-6">
        <AdminTabViews activeTab={activeTab} />
      </main>
    </div>
  );
}
