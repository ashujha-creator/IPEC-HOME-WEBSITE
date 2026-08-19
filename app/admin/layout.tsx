"use client";

import React, { useState } from "react";
import AdminNavbar from "./components/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container p-4 md:p-6">

        {children}
      </main>
    </div>
  );
}
