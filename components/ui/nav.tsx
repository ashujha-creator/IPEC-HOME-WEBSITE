"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { defaultItems, type NavItem } from "@/lib/navigation/nav-items";
/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface NavbarProps {
  items?: NavItem[];
  /** Href/label of the currently active page, used to highlight it */
  activeHref?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Desktop Nav Item (Recursive Hover Dropdown)                        */
/* ------------------------------------------------------------------ */
function DesktopNavItem({
  item,
  isActive,
  depth = 0,
}: {
  item: NavItem;
  isActive: boolean;
  depth?: number;
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

  const isTopLevel = depth === 0;

  return (
    <li
      className="relative"
      onMouseEnter={hasChildren ? openMenu : undefined}
      onMouseLeave={hasChildren ? scheduleClose : undefined}
    >
      <a
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        aria-haspopup={hasChildren ? "true" : undefined}
        aria-expanded={hasChildren ? open : undefined}
        className={`
          flex items-center justify-between whitespace-nowrap transition-colors duration-150
          focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2
          focus-visible:outline-orange-400
          ${
            isTopLevel
              ? "px-3.5 py-3 text-sm font-medium text-white/90 hover:bg-white/[0.08] hover:text-white"
              : "px-4 py-2 text-sm text-white/85 hover:bg-white/[0.08] hover:text-white"
          }
          ${isActive ? "bg-white/[0.08] text-white" : ""}
        `}
      >
        <span>{item.label}</span>
        {hasChildren &&
          (isTopLevel ? (
            <ChevronDown
              className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-80"
              aria-hidden="true"
            />
          ) : (
            <ChevronRight
              className="ml-2 h-3.5 w-3.5 shrink-0 opacity-80"
              aria-hidden="true"
            />
          ))}
      </a>

      {hasChildren && open && (
        <ul
          className={`
            absolute z-30 min-w-[240px] rounded-md bg-[#0B1550] py-1.5 shadow-xl ring-1 ring-white/10
            ${isTopLevel ? "left-0 top-full rounded-t-none" : "left-full top-0 ml-0.5"}
          `}
        >
          {item.children!.map((child) => (
            <DesktopNavItem
              key={child.label}
              item={child}
              isActive={isActive}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile Nav Item (Recursive Accordion)                              */
/* ------------------------------------------------------------------ */
function MobileNavItem({
  item,
  isActive,
  depth = 0,
}: {
  item: NavItem;
  isActive: boolean;
  depth?: number;
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
            block rounded-md px-3 py-2.5 text-sm font-medium text-white/90
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
          flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left
          text-sm font-medium text-white/90 transition-colors
          hover:bg-white/[0.08] hover:text-white
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-orange-400
        "
      >
        <span>{item.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul className="ml-2.5 border-l border-white/15 pl-2 space-y-0.5 mt-0.5">
          {item.children!.map((child) => (
            <MobileNavItem
              key={child.label}
              item={child}
              isActive={isActive}
              depth={depth + 1}
            />
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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Desktop menu */}
        <ul className="hidden flex-1 items-center justify-center space-x-1 lg:flex">
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
          <span className="text-sm font-semibold text-white">Menu</span>
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
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav-panel"
        className={`
          overflow-hidden bg-[#0B1550] transition-all duration-300 ease-in-out lg:hidden
          ${mobileOpen ? "max-h-[85vh] overflow-y-auto border-t border-white/10" : "max-h-0"}
        `}
      >
        <ul className="space-y-1 px-4 py-3">
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
