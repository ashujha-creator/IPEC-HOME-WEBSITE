"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  GraduationCap,
  User,
  ArrowUpRight,
  Rocket,
  ChevronRight,
} from "lucide-react";

// Sample Data Structure
const TABS = ["Center of Excellence", "Innovation Projects", "Giant Projects"];

const PROJECTS = [
  {
    title: "Artificial Intelligence for Education",
    institute: "IPEC",
    coordinator: "Dr. Anita Sahoo",
    image:
      "https://plus.unsplash.com/premium_photo-1663050824901-62f0162eb005?q=80&w=1170&auto=format&fit=crop",
    tag: "Center of Excellence",
  },
  {
    title: "Technology Solutions for Soil and Water Remediation",
    institute: "IPEC",
    coordinator: "Prof. Pammi Gauba",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop",
    tag: "Center of Excellence",
  },
];

const STARTUPS = [
  {
    id: 1,
    name: "Gratify Ventures Private Limited",
    founders: "Sidhant Singh, Shivansh Mahajan, Krish Monga",
    description:
      "An AI-powered Smart Bin for waste segregation that rewards users with eco-points and vouchers featuring QR scanning and digital displays.",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Tangle Connect Private Limited",
    founders: "Dev Singh, Aryan Singla",
    description:
      "A mobile-first app transforming residential living by fostering community engagement with features like buddy matching and neighborhood events.",
    logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Tangle Connect Private Limited",
    founders: "Dev Singh, Aryan Singla",
    description:
      "A mobile-first app transforming residential living by fostering community engagement with features like buddy matching and neighborhood events.",
    logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Tangle Connect Private Limited",
    founders: "Dev Singh, Aryan Singla",
    description:
      "A mobile-first app transforming residential living by fostering community engagement with features like buddy matching and neighborhood events.",
    logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop",
  },
];

export default function InnovationHub() {
  const [activeTab, setActiveTab] = useState("Center of Excellence");

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 font-sans antialiased">
      {/* Container Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Main Content Area (8 Cols) */}
        <div className="lg:col-span-8 p-6 md:p-10 flex flex-col justify-between space-y-8">
          <div>
            {/* Header Section */}
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
                Ecosystem
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Innovation Hub
            </h1>
            <p className="mt-3 text-slate-600 leading-relaxed text-sm md:text-base max-w-2xl">
              Be creative, collaborative, and engage in entrepreneurial roles
              with the IPEC Innovation Hub. It is a space for aspiring
              innovators to find resources and support to turn their ideas into
              reality.
            </p>

            {/* Interactive Tabs */}
            <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 outline-none ${
                      isActive
                        ? "text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Display Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            {PROJECTS.map((project, idx) => (
              <div
                key={idx}
                className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors line-clamp-2">
                    {project.title}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        <strong className="text-slate-800">Institute:</strong>{" "}
                        {project.institute}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        <strong className="text-slate-800">Coordinator:</strong>{" "}
                        {project.coordinator}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Startups Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 text-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Sidebar Title */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold tracking-tight">Startups</h2>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono">
                Featured
              </span>
            </div>

            {/* Startups List */}
            <div className="mt-6 space-y-4 max-h-[520px] overflow-y-auto pr-1.5 custom-scrollbar">
              {STARTUPS.map((startup, idx) => (
                <article
                  key={startup.id || idx}
                  className="group relative p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-start space-x-3.5">
                    {/* Logo Container */}
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-700/60 bg-slate-900 shadow-inner">
                      <Image
                        src={startup.logo}
                        alt={`${startup.name} logo`}
                        fill
                        sizes="44px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Details Container */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-slate-100 group-hover:text-amber-400 transition-colors truncate">
                          {startup.name}
                        </h3>
                        <ArrowUpRight className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                      </div>

                      <p className="text-xs font-medium text-amber-400/90 truncate">
                        {startup.founders}
                      </p>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 pt-0.5">
                        {startup.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar Footer Callout */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Have a startup idea?</span>
            <button className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              Apply Here <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
