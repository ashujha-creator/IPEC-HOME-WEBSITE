"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface NavChildItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  /** Optional dropdown items — rendered only when provided */
  children?: NavChildItem[];
}

export interface NavbarProps {
  items?: NavItem[];
  /** Href/label of the currently active page, used to highlight it */
  activeHref?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default content (matches the design screenshot)                    */
/* ------------------------------------------------------------------ */

const defaultItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Academics", href: "/academics" },
  { label: "Admission", href: "/admission" },
  { label: "For Students", href: "/for-students" },
  { label: "Research & Development", href: "/research-development" },
  {
    label: "Innovation & Entrepreneurship",
    href: "/innovation-entrepreneurship",
  },
  { label: "Institute Facilities", href: "/institute-facilities" },
  { label: "Contact Us", href: "/contact-us" },
];

/* ------------------------------------------------------------------ */
/*  Desktop dropdown item                                              */
/* ------------------------------------------------------------------ */

function DesktopNavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children?.length;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <li
      className="relative flex-1 px-1.5"
      onMouseEnter={hasChildren ? openMenu : undefined}
      onMouseLeave={hasChildren ? scheduleClose : undefined}
    >
      <a
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        aria-haspopup={hasChildren ? "true" : undefined}
        aria-expanded={hasChildren ? open : undefined}
        className={`
          flex whitespace-nowrap px-3.5 py-3 text-[25px] font-medium
          text-white/90 transition-colors duration-150 xl:text-[13.5px]
          hover:bg-white/[0.08] hover:text-white
          focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2
          focus-visible:outline-orange-400
          ${isActive ? "bg-white/[0.08] text-white" : ""}
        `}
      >
        {item.label}
        {hasChildren && (
          <ChevronDown
            className="h-3.5 w-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
        )}
      </a>

      {hasChildren && open && (
        <ul
          className="
            absolute left-0 top-full z-30 min-w-[240px] rounded-b-md bg-[#0B1550]
            py-2 shadow-lg ring-1 ring-white/10
          "
        >
          {item.children!.map((child) => (
            <li key={child.label}>
              <a
                href={child.href}
                className="
                  block px-4 py-2.5 text-[25px] text-white/85 transition-colors
                  hover:bg-white/[0.08] hover:text-white
                  focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2
                  focus-visible:outline-orange-400
                "
              >
                {child.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile accordion item                                              */
/* ------------------------------------------------------------------ */

function MobileNavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children?.length;

  if (!hasChildren) {
    return (
      <li>
        <a
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          className={`
            block rounded-md px-3 py-3 text-[14px] font-medium text-white/90
            transition-colors hover:bg-white/[0.08] hover:text-white
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-orange-400
            ${isActive ? "bg-white/[0.08] text-white" : ""}
          `}
        >
          {item.label}
        </a>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="
          flex w-full items-center justify-between rounded-md px-3 py-3 text-left
          text-[14px] font-medium text-white/90 transition-colors
          hover:bg-white/[0.08] hover:text-white
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-orange-400
        "
      >
        {item.label}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul className="ml-2 border-l border-white/15 pl-3">
          {item.children!.map((child) => (
            <li key={child.label}>
              <a
                href={child.href}
                className="
                  block rounded-md px-3 py-2.5 text-[13.5px] text-white/80
                  transition-colors hover:bg-white/[0.08] hover:text-white
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-orange-400
                "
              >
                {child.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                              */
/* ------------------------------------------------------------------ */

export default function Navbar({
  items = defaultItems,
  activeHref = "/",
  className = "",
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile menu on Escape and lock body scroll while it's open.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav
      aria-label="Primary"
      className={`relative z-40 bg-[#0B1550] ${className}`}
    >
      <div className="mx-auto flex max-w-350 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Desktop menu */}
        <ul className="hidden flex-1 items-center justify-center lg:flex">
          {items.map((item) => (
            <DesktopNavItem
              key={item.label}
              item={item}
              isActive={item.href === activeHref}
            />
          ))}
        </ul>

        {/* Mobile toggle */}
        <div className="flex w-full items-center justify-between py-2.5 lg:hidden">
          <span className="text-[13px] font-semibold text-white">Menu</span>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="
              flex h-9 w-9 items-center justify-center rounded-md text-white
              transition-colors hover:bg-white/[0.08]
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-orange-400
            "
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav-panel"
        className={`
          overflow-hidden bg-[#0B1550] transition-[max-height] duration-300 ease-in-out lg:hidden
          ${mobileOpen ? "max-h-[80vh] overflow-y-auto" : "max-h-0"}
        `}
      >
        <ul className="space-y-0.5 border-t border-white/10 px-3 py-3">
          {items.map((item) => (
            <MobileNavItem
              key={item.label}
              item={item}
              isActive={item.href === activeHref}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}
