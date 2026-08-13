"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Academics", href: "/academics" },
  { name: "Admissions", href: "/admissions" },
  { name: "Students", href: "/students" },
  { name: "Research", href: "/research" },
  { name: "Innovation", href: "/innovation" },
  { name: "Facilities", href: "/facilities" },
  { name: "Contact", href: "/contact" },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#2c336b] shadow-md items-center flex justify-center">
      <div className="mx-auto max-w-7xl px-2 lg:px-6">
        <div className="flex h-12 items-center justify-between">
          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-7 text-[15px] font-medium text-slate-200">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="relative transition-colors duration-300 hover:text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            isOpen ? "max-h-[500px] pb-4" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-4 py-3 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
