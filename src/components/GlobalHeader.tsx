"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Library", href: "/library" },
  { label: "Explore", href: "/explore" },
  { label: "Crawler", href: "/crawler" },
  { label: "Uploader", href: "/uploader" },
  { label: "AI Features", href: "/ai" },
];

export function GlobalHeader() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Consider a link active if the current pathname starts with the link's href
  // e.g. /ai/character-chat matches taking /ai
  const isLinkActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-8 md:px-12 lg:px-20 max-w-[1200px] mx-auto">
        {/* Logo */}
        <Link href="/library" className="flex items-center gap-2 group">
          <span className="material-symbols-outlined text-primary text-2xl group-hover:opacity-80 transition-opacity">
            auto_stories
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            NovelVerse
          </span>
        </Link>

        {/* Center: Search & Nav Links */}
        <div className="flex items-center gap-8">
          {/* Search */}
          <div className="hidden md:flex relative items-center">
            <span className="material-symbols-outlined absolute left-4 text-slate-400 text-xl pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search novels..."
              className="h-10 min-w-40 max-w-64 rounded-full border border-slate-200/50 bg-slate-100/80 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors duration-150 ${
                    active
                      ? "font-semibold text-slate-900"
                      : "font-medium text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Avatar */}
        <div className="relative">
          <button
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 transition-shadow hover:shadow-sm focus:outline-none"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
            aria-label="User menu"
            aria-haspopup="true"
          >
            <span className="text-sm font-bold text-slate-500">U</span>
          </button>

          {/* Dropdown */}
          <div
            className={`absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg transition-all duration-200 z-50 ${
              isDropdownOpen
                ? "visible opacity-100 translate-y-0"
                : "invisible opacity-0 -translate-y-2"
            }`}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <div className="flex flex-col">
              <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900">
                <span className="material-symbols-outlined text-lg opacity-70">
                  settings
                </span>
                Settings
              </button>
              <div className="my-1 h-px bg-slate-100" />
              <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900">
                <span className="material-symbols-outlined text-lg opacity-70">
                  logout
                </span>
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
