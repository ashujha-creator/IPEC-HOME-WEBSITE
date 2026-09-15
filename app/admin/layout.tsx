"use client";

import React, { useState } from "react";
import { AdminUserMenu } from "./components/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-2">
      <main className="">{children}</main>
    </div>
  );
}
