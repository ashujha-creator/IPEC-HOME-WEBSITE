import Footer from "@/components/ui/fotter";
import Header from "@/components/ui/header";
import Navbar from "@/components/ui/nav";
import React from "react";

export default function TourLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full min-h-screen">
      <Header />
      <Navbar />
      {children}
      <Footer />
    </section>
  );
}
